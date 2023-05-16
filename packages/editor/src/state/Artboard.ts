import { Node } from "@windmix/model";
import { appState } from "./AppState";
import { computed, makeObservable, observable, runInAction } from "mobx";
import { Rect } from "paintvec";
import { compact } from "lodash-es";

interface ComputedStyle {
  display: string;
  flexDirection: string;

  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;

  borderTopWidth: string;
  borderRightWidth: string;
  borderBottomWidth: string;
  borderLeftWidth: string;

  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
}
interface ComputedValue {
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: ComputedStyle;
}

type MessageFromWindow =
  | {
      type: "windmix:elementsFromPointResult";
      callID: number;
      result: string[];
    }
  | {
      type: "windmix:getComputedStylesResult";
      callID: number;
      result: ComputedValue[][];
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

export class Artboard {
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

  async getComputedStyles(ids: string[]): Promise<ComputedValue[][]> {
    const targetWindow = this.window;
    if (!targetWindow) {
      return [];
    }

    const callID = Math.random();
    return new Promise<ComputedValue[][]>((resolve) => {
      const listener = (event: MessageEvent<MessageFromWindow>) => {
        if (event.data.type !== "windmix:getComputedStylesResult") {
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
        type: "windmix:getComputedStyles",
        callID,
        ids,
      };
      targetWindow.postMessage(message, "*");
    });
  }

  async findNodes(offsetX: number, offsetY: number): Promise<Node[]> {
    const ids = await this.findNodeIDs(offsetX, offsetY);
    return compact(ids.map((id) => appState.document.nodes.get(id)));
  }

  async findNode(offsetX: number, offsetY: number): Promise<Node | undefined> {
    return (await this.findNodes(offsetX, offsetY))[0];
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
  constructor(node: Node, artboard: Artboard) {
    this.node = node;
    this.artboard = artboard;
    makeObservable(this);
  }

  readonly node: Node;
  readonly artboard: Artboard;
  @observable.ref computedValues: ComputedValue[] = [];

  @computed get rects(): Rect[] {
    return this.computedValues.map((value) => Rect.from(value.rect));
  }

  async update() {
    const computedValues = (
      await this.artboard.getComputedStyles([this.node.id])
    )[0];
    runInAction(() => {
      this.computedValues = computedValues;
    });
  }
}

export class Artboards {
  readonly desktop = new Artboard();
  readonly mobile = new Artboard();

  get all(): Artboard[] {
    return [this.desktop, this.mobile];
  }

  async updateDimension(node: Node) {
    await Promise.all(this.all.map((locator) => locator.updateDimension(node)));
  }
}

export const artboards = new Artboards();
