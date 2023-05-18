import { Rect, Segment, Vec2 } from "paintvec";
import { ViewportEvent } from "./ViewportEvent";
import { DragHandler } from "./DragHandler";
import { ElementNode } from "@windmix/model";
import { DropDestination } from "../../../state/DropDestination";
import { Artboard } from "../../../state/Artboard";
import { scrollState } from "../../../state/ScrollState";
import { zip } from "lodash-es";
import { Measurement } from "../../../state/Measurement";

export class NodeMoveDragHandler implements DragHandler {
  constructor(selectables: Selectable[], initPos: Vec2) {
    if (!selectables.length) {
      throw new Error("No elements to move");
    }

    this.initPos = initPos;
    for (const s of selectables) {
      this.targets.set(s, { rect: s.computedRect, absolute: s.isAbsolute });
    }
    const rects = [...this.targets.values()].map(({ rect }) => rect);
    this.initWholeBBox = assertNonNull(Rect.union(...rects));
  }

  move(event: ViewportEvent): void {
    const dst = findDropDestination(event, [...this.targets.keys()]);

    const offset = this.getSnappedOffset(dst.parent, event);

    const dragPreviewRects: Rect[] = [];
    for (const [target, { absolute, rect }] of this.targets) {
      if (absolute) {
        const newRect = rect.translate(offset);
        resizeWithBoundingBox(target, newRect, {
          x: true,
          y: true,
        });
      } else {
        dragPreviewRects.push(rect.translate(offset));
      }
    }

    viewportState.dragPreviewRects = dragPreviewRects;
    viewportState.dropDestination = dst;

    // don't show snappings if all move is relative
    const allRelative = [...this.targets.values()].every(
      ({ absolute }) => !absolute
    );
    if (allRelative && dst.parent.style.layout !== "none") {
      snapper.clear();
    }

    // don't show insertion line if all targets prefer absolute position
    const allPrefersAbsolute = [...this.targets.keys()].every(
      (target) => target.style.preferAbsolute
    );
    if (allPrefersAbsolute) {
      viewportState.dropDestination = {
        ...dst,
      };
    }
  }

  end(event: ViewportEvent): void {
    snapper.clear();
    viewportState.dragPreviewRects = [];
    viewportState.dropDestination = undefined;

    const dst = findDropDestination(event, [...this.targets.keys()]);

    const offset = this.getSnappedOffset(dst.parent, event);

    const selectablesToInsert = [...this.targets].filter(
      ([target, { absolute }]) => {
        // do not move absolute elements that are already inside the destination
        if (absolute && dst.parent === target.parent) {
          return false;
        }
        // don't change parent of component contents (root node and variant nodes)
        if (target.originalNode.parent?.type === "component") {
          return false;
        }

        return true;
      }
    );

    dst.parent.insertBefore(
      selectablesToInsert.map(([target]) => target),
      dst.ref
    );

    if (dst.parent.style.layout === "none") {
      for (const [target, { rect }] of this.targets) {
        const newRect = rect.translate(offset);
        resizeWithBoundingBox(target, newRect, {
          x: true,
          y: true,
        });
      }
    }

    projectState.undoManager.stopCapturing();
  }

  private getSnappedOffset(parent: Selectable, event: ViewportEvent) {
    const offset = event.pos.sub(this.initPos);
    const snappedRect = snapper.snapMoveRect(
      parent,
      [...this.targets.keys()],
      this.initWholeBBox.translate(offset)
    );
    const snappedOffset = snappedRect.topLeft.sub(this.initWholeBBox.topLeft);
    return snappedOffset;
  }

  private readonly initPos: Vec2;
  private readonly initWholeBBox: Rect;
  private readonly targets = new Map<
    Selectable,
    {
      rect: Rect;
      absolute: boolean;
    }
  >();
}

export async function findDropDestination(
  artboard: Artboard,
  event: ViewportEvent,
  subjects: ElementNode[]
): Promise<DropDestination> {
  let parent: ElementNode | undefined;

  for (const dst of event.selectables) {
    // cannot move inside itself
    if (subjects.some((target) => target.includes(dst))) {
      continue;
    }

    // TODO: detect elements that do not accept children (e.g. <input> tags)
    // if (!dst.canInsertChild) {
    //   return false;
    // }

    if (dst.parent?.type === "element") {
      const bbox = await artboard.getRect(dst);
      const parentBBox = await artboard.getRect(dst.parent);

      const parentCloseThresh = scrollState.snapThreshold;
      const threshold = scrollState.snapThreshold * 2;

      // do not drop near the edge when the parent edge is close

      for (const edge of ["left", "top", "right", "bottom"] as const) {
        if (
          Math.abs(bbox[edge] - parentBBox[edge]) < parentCloseThresh &&
          Math.abs(
            bbox[edge] -
              event.pos[edge === "left" || edge === "right" ? "x" : "y"]
          ) < threshold
        ) {
          continue;
        }
      }
    }

    parent = dst;
    break;
  }

  if (!parent) {
    throw new Error("No parent found");
  }

  const childrenWithMeasurements = await Promise.all(
    parent.children
      .filter((c): c is ElementNode => c.type === "element")
      .map((c) => artboard.getMeasure(c).then((m) => [c, m] as const))
  );
  const inFlowChildren = childrenWithMeasurements.filter(
    ([, m]) => m.style.position !== "absolute"
  );

  for (const [child, dims] of inFlowChildren) {
    if (dims.rect.includes(event.pos)) {
      return {
        parent,
        ref: child,
        insertionLine: dims.rect.endLines.x,
      };
    }
  }

  return { parent };
}
