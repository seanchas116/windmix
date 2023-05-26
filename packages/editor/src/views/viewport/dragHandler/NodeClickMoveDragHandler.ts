import { Vec2 } from "paintvec";
import { DragHandler } from "./DragHandler";
import { dragStartThreshold } from "../constants";
import { ViewportEvent } from "./ViewportEvent";
import { appState } from "../../../state/AppState";
import { createNodeMoveDragHandler } from "./NodeMoveDragHandler";

export async function createNodeClickMoveDragHandler(
  event: ViewportEvent
): Promise<DragHandler | undefined> {
  const selectable = event.selectable;
  if (!selectable) {
    return;
  }

  const initClientPos = new Vec2(event.event.clientX, event.event.clientY);
  const initPos = event.pos;
  const additive = event.event.shiftKey;
  let moveHandler: DragHandler | undefined;

  if (event.selectables.every((s) => !s.ancestorSelected)) {
    if (!additive) {
      appState.document.deselectAll();
    }
    selectable.select();
  }

  return {
    async move(event: ViewportEvent) {
      if (!moveHandler) {
        if (event.clientPos.sub(initClientPos).length < dragStartThreshold) {
          return;
        }

        moveHandler = await createNodeMoveDragHandler(
          event.artboard,
          appState.document.selectedElements,
          initPos
        );
      }

      moveHandler?.move(event);
    },

    end(event: ViewportEvent): void {
      moveHandler?.end(event);
      if (!moveHandler) {
        // do click
        if (!additive) {
          appState.document.deselectAll();
        }
        selectable.select();

        appState.document.currentComponent = selectable.component;
      }
    },
  };
}
