import { Node } from "@windmix/model";
import { appState } from "../state/AppState";
import { makeObservable, observable } from "mobx";
import { Rect } from "paintvec";

export class DOMLocator {
  window: Window | undefined;

  findNode(offsetX: number, offsetY: number): [Node, Element] | undefined {
    const elem = this.window?.document.elementFromPoint(offsetX, offsetY);
    if (!elem) {
      return;
    }

    const id = elem?.getAttribute("data-windmixid");
    if (!id) {
      return;
    }

    const node = appState.document.nodes.get(id);
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

  dimensions = new WeakMap<Node, NodeDimension>();

  getDimension(node: Node): NodeDimension {
    let computation = this.dimensions.get(node);
    if (!computation) {
      computation = new NodeDimension(node, this);
      this.dimensions.set(node, computation);
    }
    return computation;
  }

  updateDimension(node: Node) {
    this.getDimension(node).update();
  }
}

export class NodeDimension {
  constructor(node: Node, domLocator: DOMLocator) {
    this.node = node;
    this.domLocator = domLocator;
    makeObservable(this);
  }

  readonly node: Node;
  readonly domLocator: DOMLocator;
  @observable rect: Rect | undefined = undefined;

  update() {
    const dom = this.domLocator.findDOM(this.node);
    if (dom) {
      this.rect = Rect.from(dom.getBoundingClientRect());
    }
  }
}

export class DOMLocators {
  readonly desktop = new DOMLocator();
  readonly mobile = new DOMLocator();

  get all(): DOMLocator[] {
    return [this.desktop, this.mobile];
  }

  updateDimension(node: Node) {
    for (const locator of this.all) {
      locator.updateDimension(node);
    }
  }
}

export const domLocators = new DOMLocators();
