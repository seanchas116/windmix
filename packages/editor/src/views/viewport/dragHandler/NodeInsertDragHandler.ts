import { Rect, Vec2 } from "paintvec";
import { dragStartThreshold } from "../constants";
import { ViewportEvent } from "./ViewportEvent";
import { DragHandler } from "./DragHandler";
import { InsertMode } from "../../../state/Tool";
import { resizeWithBoundingBox } from "./resizeWithBoundingBox";
import { appState } from "../../../state/AppState";

export async function createNodeInsertDragHandler(
  mode: InsertMode,
  event: ViewportEvent
): Promise<DragHandler> {
  const artboard = event.artboard;

  const parent = event.selectable; // TODO: null case
  if (parent?.type !== "element") {
    throw new Error("parent is not element");
  }

  const document = parent.document;
  const initClientPos = new Vec2(event.event.clientX, event.event.clientY);
  const initPos = await artboard.snapper.snapInsertPoint(parent, event.pos);

  const element = document.nodes.create("element");
  element.tagName = "div";

  if (mode === "text") {
    const text = document.nodes.create("text");
    text.text = "Hello World";
    element.append([text]);
  } else {
    element.className = "w-20 h-20 bg-blue-300";
  }

  parent.append([element]);

  await resizeWithBoundingBox(
    artboard,
    element,
    Rect.boundingRect([initPos, initPos]),
    { x: true, y: true }
  );

  appState.document.deselectAll();
  element.select();

  let dragStarted = false;

  return {
    async move(event: ViewportEvent) {
      if (
        !dragStarted &&
        event.clientPos.sub(initClientPos).length < dragStartThreshold
      ) {
        return;
      }
      dragStarted = true;

      const pos = await artboard.snapper.snapResizePoint([element], event.pos);
      const rect = Rect.boundingRect([pos, initPos]);

      await resizeWithBoundingBox(artboard, element, rect, {
        x: true,
        y: true,
        width: true,
        height: true,
      });
    },

    async end() {
      appState.tool = undefined;

      // TODO: auto-include absolute children
    },
  };
}
