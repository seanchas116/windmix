import { Rect, Vec2 } from "paintvec";
import { dragStartThreshold } from "../constants";
import { ViewportEvent } from "./ViewportEvent";
import { DragHandler } from "./DragHandler";
import { InsertMode } from "../../../state/Tool";
import { resizeWithBoundingBox } from "./resizeWithBoundingBox";
import { appState } from "../../../state/AppState";
import { findDropDestination } from "./NodeMoveDragHandler";

export async function createNodeInsertDragHandler(
  mode: InsertMode,
  event: ViewportEvent
): Promise<DragHandler> {
  const artboard = event.artboard;

  const dest = await findDropDestination(artboard, event, []);
  const parent = dest.parent;

  const document = parent.document;
  const initClientPos = new Vec2(event.event.clientX, event.event.clientY);
  const initPos = await artboard.snapper.snapInsertPoint(
    parent,
    event.pos.round
  );

  const element = document.nodes.create("element");

  if (mode === "text") {
    element.tagName = "p";
    const text = document.nodes.create("text");
    text.text = "Hello World";
    element.append([text]);
  } else {
    element.tagName = "div";
    element.className = "w-20 h-20 bg-blue-300";
  }

  parent.insertBefore([element], dest.ref);

  await resizeWithBoundingBox(
    artboard,
    element,
    Rect.boundingRect([initPos, initPos]),
    { x: true, y: true }
  );

  appState.document.deselectAll();
  element.select();

  let dragStarted = false;

  let lastRect: Rect | undefined;

  return {
    async move(event: ViewportEvent) {
      if (
        !dragStarted &&
        event.clientPos.sub(initClientPos).length < dragStartThreshold
      ) {
        return;
      }
      dragStarted = true;

      const pos = await artboard.snapper.snapResizePoint(
        [element],
        event.pos.round
      );
      const rect = Rect.boundingRect([pos, initPos]);
      lastRect = rect;

      await resizeWithBoundingBox(artboard, element, rect, {
        x: true,
        y: true,
        width: true,
        height: true,
        preview: true,
      });
    },

    async end() {
      if (lastRect) {
        await resizeWithBoundingBox(artboard, element, lastRect, {
          x: true,
          y: true,
          width: true,
          height: true,
        });
      }

      appState.tool = undefined;

      // TODO: auto-include absolute children
    },
  };
}
