import { Node } from "@windmix/model";
import { appState } from "../state/AppState";

export class DOMLocator {
  window: Window | undefined;

  findNode(offsetX: number, offsetY: number): Node | undefined {
    const elem = this.window?.document.elementFromPoint(offsetX, offsetY);
    console.log(elem);

    const id = elem?.getAttribute("data-windmixid");
    if (id) {
      console.log("clicked", id);

      return appState.nodeMap.get(id);
    }
  }
}

export const domLocator = new DOMLocator();
