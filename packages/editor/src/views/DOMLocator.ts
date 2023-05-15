import { Node } from "@windmix/model";
import { appState } from "../state/AppState";
import { makeObservable, observable, runInAction } from "mobx";
import { Rect } from "paintvec";

type MessageFromWindow =
  | {
      type: "windmix:elementFromPointResult";
      callID: number;
      result: string | undefined;
    }
  | {
      type: "windmix:getComputedStyleResult";
      callID: number;
      result: {
        rect: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
      }[];
    }
  | {
      type: "windmix:resize";
      height: number;
    }
  | {
      type: "windmix:hotReload";
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
    window.addEventListener("message", this.onMessage);
  }

  window: Window | undefined;

  @observable windowBodyHeight: number | undefined = undefined;

  setWindow(window: Window | undefined) {
    this.window = window;
  }

  readonly onMessage = (event: MessageEvent<MessageFromWindow>) => {
    if (event.source === this.window && event.data.type === "windmix:resize") {
      const height = event.data.height;
      runInAction(() => {
        this.windowBodyHeight = height;
      });
    }
  };

  async findNodeID(
    offsetX: number,
    offsetY: number
  ): Promise<string | undefined> {
    const targetWindow = this.window;
    if (!targetWindow) {
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
        resolve(event.data.result);
      };
      window.addEventListener("message", listener);

      const message: MessageToWindow = {
        type: "windmix:elementFromPoint",
        callID,
        x: offsetX,
        y: offsetY,
      };
      targetWindow.postMessage(message, "*");
    });
  }

  async getComputedStyles(id: string): Promise<{ rect: Rect }[]> {
    const targetWindow = this.window;
    if (!targetWindow) {
      return [];
    }

    const callID = Math.random();
    return new Promise<{ rect: Rect }[]>((resolve) => {
      const listener = (event: MessageEvent<MessageFromWindow>) => {
        if (event.data.type !== "windmix:getComputedStyleResult") {
          return;
        }

        if (event.data.callID !== callID) {
          return;
        }

        window.removeEventListener("message", listener);
        resolve(
          event.data.result.map((result) => ({
            rect: Rect.from(result.rect),
          }))
        );
      };
      window.addEventListener("message", listener);

      const message: MessageToWindow = {
        type: "windmix:getComputedStyle",
        callID,
        id,
      };
      targetWindow.postMessage(message, "*");
    });
  }

  async findNode(offsetX: number, offsetY: number): Promise<Node | undefined> {
    const id = await this.findNodeID(offsetX, offsetY);
    if (!id) {
      return;
    }
    return appState.document.nodes.get(id);
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

  async update() {
    const rects = (await this.domLocator.getComputedStyles(this.node.id)).map(
      (result) => result.rect
    );
    runInAction(() => {
      this.rects = rects;
    });
  }
}

export class DOMLocators {
  readonly desktop = new DOMLocator();
  readonly mobile = new DOMLocator();

  get all(): DOMLocator[] {
    return [this.desktop, this.mobile];
  }

  async updateDimension(node: Node) {
    await Promise.all(this.all.map((locator) => locator.updateDimension(node)));
  }
}

export const domLocators = new DOMLocators();
