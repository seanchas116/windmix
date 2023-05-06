import { Node } from "@windmix/model";
import { appState } from "../state/AppState";

export class DOMLocator {
  window: Window | undefined;

  findNode(offsetX: number, offsetY: number): [Node, Element] | undefined {
    const elem = this.window?.document.elementFromPoint(offsetX, offsetY);
    console.log(elem);
    if (!elem) {
      return;
    }

    const id = elem?.getAttribute("data-windmixid");
    if (!id) {
      return;
    }

    console.log("clicked", id);

    const node = appState.nodeMap.get(id);
    if (!node) {
      return;
    }

    return [node, elem];
  }

  findDOM(node: Node): Element | undefined {
    const elem = this.window?.document.querySelector(
      `[data-windmixid="${node.id}"]`
    );
    return elem ?? undefined;
  }
}

export const domLocator = new DOMLocator();
