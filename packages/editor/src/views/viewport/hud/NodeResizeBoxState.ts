import { computed, makeObservable } from "mobx";
import { Vec2, Rect, Transform } from "paintvec";
import { ElementNode } from "@windmix/model";
import { appState } from "../../../state/AppState";
import { colors } from "@seanchas116/paintkit/src/components/Palette";
import { Artboard } from "../../../state/Artboard";
import { assertNonNull } from "@seanchas116/paintkit/src/util/Assert";
import { resizeWithBoundingBox } from "../dragHandler/resizeWithBoundingBox";

function roundRectXYWH(rect: Rect): Rect {
  return Rect.from({
    x: Math.round(rect.left),
    y: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  });
}

export class NodeResizeBoxState {
  constructor(artboard: Artboard) {
    this.artboard = artboard;
    makeObservable(this);
  }

  private artboard: Artboard;
  private initWholeBoundingBox = new Rect();
  private initBoundingBoxes = new Map<ElementNode, Rect>();
  private widthChanged = false;
  private heightChanged = false;

  get selectedInstances(): ElementNode[] {
    return appState.document.selectedNodes.filter(
      (node): node is ElementNode => node.type === "element"
    );
  }

  @computed get stroke(): string {
    return colors.active;
  }

  @computed get boundingBox(): Rect | undefined {
    return Rect.union(...this.artboard.selectedRects);
  }

  async begin() {
    for (const instance of this.selectedInstances) {
      this.initBoundingBoxes.set(
        instance,
        (await this.artboard.measureFirst(instance))?.rect ?? new Rect()
      );
    }
    this.initWholeBoundingBox = this.boundingBox ?? new Rect();
    this.widthChanged = false;
    this.heightChanged = false;
  }

  change(p0: Vec2, p1: Vec2) {
    const newWholeBBox = assertNonNull(Rect.boundingRect([p0, p1]));
    if (
      Math.round(newWholeBBox.width) !==
      Math.round(this.initWholeBoundingBox.width)
    ) {
      this.widthChanged = true;
    }
    if (
      Math.round(newWholeBBox.height) !==
      Math.round(this.initWholeBoundingBox.height)
    ) {
      this.heightChanged = true;
    }
    const transform = Transform.rectToRect(
      this.initWholeBoundingBox,
      newWholeBBox
    );

    for (const [instance, originalBBox] of this.initBoundingBoxes) {
      const newBBox = roundRectXYWH(originalBBox.transform(transform));

      resizeWithBoundingBox(this.artboard, instance, newBBox, {
        width: this.widthChanged,
        height: this.heightChanged,
        preview: true,
      });
      this.newBBox = newBBox;
    }
  }
  newBBox: Rect | undefined;

  end() {
    if (this.newBBox) {
      for (const [instance] of this.initBoundingBoxes) {
        resizeWithBoundingBox(this.artboard, instance, this.newBBox, {
          width: this.widthChanged,
          height: this.heightChanged,
        });
      }
      this.newBBox = undefined;
    }

    this.initBoundingBoxes.clear();

    if (!this.widthChanged && !this.heightChanged) {
      return;
    }
  }
}
