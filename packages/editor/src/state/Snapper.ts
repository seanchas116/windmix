import { observable, makeObservable, action } from "mobx";
import { Rect, Vec2 } from "paintvec";
import { debounce } from "lodash-es";
import {
  PointSnapping,
  SameMarginSnapping,
  snapPointToRects,
  snapRectToRects,
} from "@seanchas116/paintkit/src/util/Snapping";
import { scrollState } from "./ScrollState";
import { ElementNode } from "@windmix/model";
import { Artboard } from "./Artboard";

export class Snapper {
  constructor(artboard: Artboard) {
    this.artboard = artboard;
    makeObservable(this);
  }

  readonly artboard: Artboard;

  private get threshold(): number {
    return scrollState.snapThreshold;
  }

  @observable private _snappings: (PointSnapping | SameMarginSnapping)[] = [];

  private snapPoint(
    targetRects: Rect[],
    point: Vec2,
    axes?: { x?: boolean; y?: boolean }
  ): Vec2 {
    const [point2, snappings] = snapPointToRects(
      targetRects,
      point,
      this.threshold,
      axes
    );
    this._snappings = snappings;
    return point2;
  }

  private snapRect(targetRects: Rect[], rect: Rect): Rect {
    const [rect2, snappings] = snapRectToRects(
      targetRects,
      rect,
      this.threshold
    );
    this._snappings = snappings;
    return rect2;
  }

  private exactSnapRect(targetRects: Rect[], rect: Rect): void {
    const [, snappingsX] = snapRectToRects(targetRects, rect, this.threshold, {
      x: true,
    });
    const [, snappingsY] = snapRectToRects(targetRects, rect, this.threshold, {
      y: true,
    });
    this._snappings = [...snappingsX, ...snappingsY].filter(
      (s) => s.offset === 0
    );
  }

  async snapInsertPoint(parent: ElementNode, point: Vec2): Promise<Vec2> {
    return this.snapPoint(await this.targetRects(parent, []), point);
  }

  private async targetRects(
    parent: ElementNode,
    excludes: ElementNode[]
  ): Promise<Rect[]> {
    const siblings = new Set<ElementNode>();
    for (const child of parent.children) {
      if (child.type === "element") {
        siblings.add(child);
      }
    }
    for (const selectable of excludes) {
      siblings.delete(selectable);
    }

    const siblingMeasures = (
      await Promise.all([...siblings].map((c) => this.artboard.measure(c)))
    ).flat();
    const parentMeasures = await this.artboard.measure(parent);

    return [
      ...siblingMeasures.map((m) => m.rect),
      ...parentMeasures.map((m) => m.paddingRect),
    ];
  }

  async snapResizePoint(
    selectables: ElementNode[],
    point: Vec2,
    axes: { x?: boolean; y?: boolean } = { x: true, y: true }
  ): Promise<Vec2> {
    if (selectables.length === 0) {
      return point;
    }
    const parent = selectables[0]?.parent;
    if (parent?.type !== "element") {
      return point;
    }

    return this.snapPoint(
      await this.targetRects(parent, selectables),
      point,
      axes
    );
  }

  async snapMoveRect(
    parent: ElementNode,
    selectables: ElementNode[],
    rect: Rect
  ): Promise<Rect> {
    return this.snapRect(await this.targetRects(parent, selectables), rect);
  }

  async exactSnapMoveRect(
    parent: ElementNode,
    selectables: ElementNode[],
    rect: Rect
  ): Promise<void> {
    this.exactSnapRect(await this.targetRects(parent, selectables), rect);
  }

  get snappings(): readonly (PointSnapping | SameMarginSnapping)[] {
    return this._snappings;
  }

  clear(): void {
    this._snappings = [];
  }

  readonly clearDebounced = debounce(
    action(() => this.clear()),
    1000
  );
}
