import { Rect, Vec2 } from "paintvec";
import { ViewportEvent } from "./ViewportEvent";
import { DragHandler } from "./DragHandler";
import { ElementNode } from "@windmix/model";
import { DropDestination } from "../../../state/DropDestination";
import { Artboard } from "../../../state/Artboard";
import { scrollState } from "../../../state/ScrollState";
import { assertNonNull } from "@seanchas116/paintkit/src/util/Assert";
import { resizeWithBoundingBox } from "./resizeWithBoundingBox";

export async function createNodeMoveDragHandler(
  artboard: Artboard,
  selectables: ElementNode[],
  initPos: Vec2
): Promise<DragHandler> {
  if (!selectables.length) {
    throw new Error("No elements to move");
  }

  const targets = new Map<
    ElementNode,
    {
      rect: Rect;
      absolute: boolean;
    }
  >();

  for (const s of selectables) {
    // TODO: use Promise.all
    const dims = await artboard.getMeasure(s);

    targets.set(s, {
      rect: dims.rect,
      absolute: dims.style.position === "absolute",
    });
  }
  const rects = [...targets.values()].map(({ rect }) => rect);
  const initWholeBBox = assertNonNull(Rect.union(...rects));

  const getSnappedOffset = async (
    parent: ElementNode,
    event: ViewportEvent
  ) => {
    const offset = event.pos.sub(initPos);
    const snappedRect = await artboard.snapper.snapMoveRect(
      parent,
      [...targets.keys()],
      initWholeBBox.translate(offset)
    );
    const snappedOffset = snappedRect.topLeft.sub(initWholeBBox.topLeft);
    return snappedOffset;
  };

  return {
    async move(event: ViewportEvent) {
      const dst = await findDropDestination(artboard, event, [
        ...targets.keys(),
      ]);

      const offset = await getSnappedOffset(dst.parent, event);

      const dragPreviewRects: Rect[] = [];
      for (const [target, { absolute, rect }] of targets) {
        if (absolute) {
          const newRect = rect.translate(offset);
          await resizeWithBoundingBox(artboard, target, newRect, {
            x: true,
            y: true,
          });
        } else {
          dragPreviewRects.push(rect.translate(offset));
        }
      }

      artboard.dragPreviewRects = dragPreviewRects;
      artboard.dropDestination = dst;
    },

    async end(event: ViewportEvent) {
      artboard.snapper.clear();
      artboard.dragPreviewRects = [];
      artboard.dropDestination = undefined;

      const dst = await findDropDestination(artboard, event, [
        ...targets.keys(),
      ]);

      const selectablesToInsert = [...targets].filter(
        ([target, { absolute }]) => {
          // do not move absolute elements that are already inside the destination
          if (absolute && dst.parent === target.parent) {
            return false;
          }

          return true;
        }
      );

      dst.parent.insertBefore(
        selectablesToInsert.map(([target]) => target),
        dst.ref
      );
    },
  };
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
