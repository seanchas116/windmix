import { Node } from "@windmix/model";
import { appState } from "../state/AppState";
import { makeObservable, observable, runInAction } from "mobx";
import { Rect } from "paintvec";

type MessageFromWindow =
  | {
      type: "windmix:elementsFromPointResult";
      callID: number;
      result: string[];
    }
  | {
      type: "windmix:getComputedStylesResult";
      callID: number;
      result: {
        rect: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
      }[][];
    }
  | {
      type: "windmix:resize";
      height: number;
    }
  | {
      type: "windmix:reloadComputed";
    };

type MessageToWindow =
  | {
      type: "windmix:elementsFromPoint";
      callID: number;
      x: number;
      y: number;
    }
  | {
      type: "windmix:getComputedStyles";
      callID: number;
      ids: string[];
    }
  | {
      type: "windmix:setClassName";
      id: string;
      className: string;
    };

export class DOMLocator {
  constructor() {
    makeObservable(this);
    window.addEventListener("message", this.onMessage);
  }

  window: Window | undefined;

  @observable windowBodyHeight = 0;

  setWindow(window: Window | undefined) {
    this.window = window;
  }

  readonly onMessage = (event: MessageEvent<MessageFromWindow>) => {
    if (event.source !== this.window) {
      return;
    }
    const data = event.data;

    if (data.type === "windmix:resize") {
      const height = data.height;
      runInAction(() => {
        console.log("resize", height);
        this.windowBodyHeight = height;
      });
    } else if (data.type === "windmix:reloadComputed") {
      const nodes = new Set([
        ...(appState.hover ? [appState.hover] : []),
        ...appState.document.selectedNodes,
      ]);
      Promise.all([...nodes].map((node) => this.updateDimension(node)));
    }
  };

  async findNodeIDs(offsetX: number, offsetY: number): Promise<string[]> {
    const targetWindow = this.window;
    if (!targetWindow) {
      return [];
    }

    const callID = Math.random();
    return new Promise<string[]>((resolve) => {
      const listener = (event: MessageEvent<MessageFromWindow>) => {
        if (event.data.type !== "windmix:elementsFromPointResult") {
          return [];
        }

        if (event.data.callID !== callID) {
          return [];
        }

        window.removeEventListener("message", listener);
        resolve(event.data.result);
      };
      window.addEventListener("message", listener);

      const message: MessageToWindow = {
        type: "windmix:elementsFromPoint",
        callID,
        x: offsetX,
        y: offsetY,
      };
      targetWindow.postMessage(message, "*");
    });
  }

  async getComputedStyles(ids: string[]): Promise<{ rect: Rect }[][]> {
    const targetWindow = this.window;
    if (!targetWindow) {
      return [];
    }

    const callID = Math.random();
    return new Promise<{ rect: Rect }[][]>((resolve) => {
      const listener = (event: MessageEvent<MessageFromWindow>) => {
        if (event.data.type !== "windmix:getComputedStylesResult") {
          return;
        }

        if (event.data.callID !== callID) {
          return;
        }

        window.removeEventListener("message", listener);
        resolve(
          event.data.result.map((results) =>
            results.map((result) => ({
              rect: Rect.from(result.rect),
            }))
          )
        );
      };
      window.addEventListener("message", listener);

      const message: MessageToWindow = {
        type: "windmix:getComputedStyles",
        callID,
        ids,
      };
      targetWindow.postMessage(message, "*");
    });
  }

  async findNode(offsetX: number, offsetY: number): Promise<Node | undefined> {
    const ids = await this.findNodeIDs(offsetX, offsetY);
    if (!ids.length) {
      return;
    }
    return appState.document.nodes.get(ids[0]);
  }

  setClassName(node: Node, className: string) {
    const message: MessageToWindow = {
      type: "windmix:setClassName",
      id: node.id,
      className,
    };
    this.window?.postMessage(message, "*");
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
    const rects = (
      await this.domLocator.getComputedStyles([this.node.id])
    )[0].map((result) => result.rect);
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
