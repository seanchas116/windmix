import { Rect, Segment, Vec2 } from "paintvec";
import { ViewportEvent } from "./ViewportEvent";
import { DragHandler } from "./DragHandler";
import { ElementNode } from "@windmix/model";
import { DropDestination } from "../../../state/DropDestination";
import { Artboard } from "../../../state/Artboard";
import { scrollState } from "../../../state/ScrollState";

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
      const bbox = await artboard.getFirstRect(dst);
      const parentBBox = await artboard.getFirstRect(dst.parent);

      if (bbox && parentBBox) {
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
    }

    parent = dst;
    break;
  }

  if (!parent) {
    throw new Error("No parent found");
  }

  const layout = parent.style.layout;

  if (layout === "flex") {
    const direction = parent.style.flexDirection;
    const inFlowChildren = parent.inFlowChildren;
    const centers = inFlowChildren.map((c) => c.computedRect.center);
    const index = centers.findIndex((c) => c[direction] > event.pos[direction]);
    if (index < 0) {
      // append
      const lastRect = inFlowChildren[inFlowChildren.length - 1].computedRect;
      return {
        parent,
        insertionLine: lastRect.endLines[direction],
      };
    }

    if (index === 0) {
      // prepend
      const firstRect = inFlowChildren[0].computedRect;
      return {
        parent,
        ref: inFlowChildren[0],
        insertionLine: firstRect.startLines[direction],
      };
    }

    const prev = inFlowChildren[index - 1];
    const next = inFlowChildren[index];
    const prevRect = prev.computedRect;
    const nextRect = next.computedRect;

    return {
      parent,
      ref: next,
      insertionLine: prevRect.endLines[direction].mix(
        nextRect.startLines[direction],
        0.5
      ),
    };
  }

  if (layout === "grid") {
    // TODO: when column count is 1, use the same logic as vertical stack

    const inFlowChildren = parent.inFlowChildren;
    const columnCount = parent.style.gridColumnCount ?? 1;
    const rowCount = Math.ceil(inFlowChildren.length / columnCount);

    let nextChild: Selectable | undefined;
    let insertionLine: Segment | undefined;

    for (let row = 0; row < rowCount; row++) {
      const rowChildren = inFlowChildren.slice(
        row * columnCount,
        (row + 1) * columnCount
      );
      const rowChildrenBottom = Math.max(
        ...rowChildren.map((c) => c.computedRect.bottom)
      );
      if (event.pos.y > rowChildrenBottom) {
        continue;
      }

      for (const child of rowChildren) {
        if (child.computedRect.center.x > event.pos.x) {
          nextChild = child;
          break;
        }
      }
      nextChild = nextChild ?? rowChildren[rowChildren.length - 1].nextSibling;
      if (nextChild) {
        insertionLine = nextChild.computedRect.leftLine;
      }
      break;
    }

    if (!insertionLine) {
      const lastChild = inFlowChildren[inFlowChildren.length - 1];
      insertionLine = lastChild.computedRect.rightLine;
    }

    return {
      parent,
      ref: nextChild,
      insertionLine: insertionLine,
    };
  }

  // no layout
  return { parent };
}
