import { Node } from "@windmix/model";
import { appState } from "../state/AppState";
import { makeObservable, observable } from "mobx";
import { Rect } from "paintvec";

type MessageFromWindow =
  | {
      type: "windmix:elementFromPointResult";
      callID: number;
      id?: string;
    }
  | {
      type: "windmix:getComputedStyleResult";
      callID: number;
      rect?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };

type MessageToWindow =
  | {
      type: "windmix:elementFromPoint";
      callID: number;
      x: number;
      y: number;
    }
  | {
      type: "windmix:getComputedStyle";
      callID: number;
      id: string;
    };

export class DOMLocator {
  constructor() {
    makeObservable(this);
  }

  window: Window | undefined;

  @observable windowBodyHeight: number | undefined = undefined;

  setWindow(window: Window | undefined) {
    this.window = window;

    if (window) {
      const resizeObserver = new ResizeObserver(() => {
        console.log(window.document.body.clientHeight);
        this.windowBodyHeight = window.document.body.clientHeight || undefined;
      });
      resizeObserver.observe(window.document.body);
    }
  }

  async findNodeID(
    offsetX: number,
    offsetY: number
  ): Promise<string | undefined> {
    const window = this.window;
    if (!window) {
      return;
    }

    const callID = Math.random();
    return new Promise<string | undefined>((resolve) => {
      const listener = (event: MessageEvent<MessageFromWindow>) => {
        if (event.data.type !== "windmix:elementFromPointResult") {
          return;
        }

        if (event.data.callID !== callID) {
          return;
        }

        window.removeEventListener("message", listener);
        resolve(event.data.id);
      };
      window.addEventListener("message", listener);
    });
  }

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

  findDOMs(node: Node): Element[] {
    return [
      ...(this.window?.document.querySelectorAll(
        `[data-windmixid="${node.id}"]`
      ) ?? []),
    ];
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
  @observable.ref rects: Rect[] = [];

  update() {
    const doms = this.domLocator.findDOMs(this.node);
    this.rects = doms.map((dom) => Rect.from(dom.getBoundingClientRect()));
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
