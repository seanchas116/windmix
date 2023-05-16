import { Node } from "@windmix/model";
import { appState } from "./AppState";
import { makeObservable, observable, reaction, runInAction } from "mobx";
import { compact } from "lodash-es";
import { Rect } from "paintvec";

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
interface Measurement {
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
      result: Measurement[][];
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

    // TODO: use createAtom?
    queueMicrotask(() => {
      reaction(
        () => [appState.hover, appState.document.selectedNodes],
        async () => {
          await this.updateRects();
        }
      );
    });
  }

  window: Window | undefined;

  @observable windowBodyHeight = 0;

  revision = Date.now();

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
      this.revision = Date.now();
      this.updateRects();
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

  async getComputedStyles(ids: string[]): Promise<Measurement[][]> {
    const targetWindow = this.window;
    if (!targetWindow) {
      return [];
    }

    const callID = Math.random();
    return new Promise<Measurement[][]>((resolve) => {
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

  dimensions = new WeakMap<Node, NodeMeasurements>();

  getDimension(node: Node): NodeMeasurements {
    let computation = this.dimensions.get(node);
    if (!computation) {
      computation = new NodeMeasurements(node, this);
      this.dimensions.set(node, computation);
    }
    return computation;
  }

  @observable hoverRects: Rect[] = [];
  @observable selectedRects: Rect[] = [];

  async updateRects() {
    const hoverDims = appState.hover
      ? await this.getDimension(appState.hover).get()
      : [];
    const selectedDims = (
      await Promise.all(
        appState.document.selectedNodes.map((node) =>
          this.getDimension(node).get()
        )
      )
    ).flat();
    runInAction(() => {
      this.hoverRects = hoverDims.map((m) => Rect.from(m.rect));
      this.selectedRects = selectedDims.map((m) => Rect.from(m.rect));
    });
  }
}

export class NodeMeasurements {
  constructor(node: Node, artboard: Artboard) {
    this.node = node;
    this.artboard = artboard;
  }

  readonly node: Node;
  readonly artboard: Artboard;
  private _cache: Measurement[] = [];
  private _cacheRevision = 0;

  async get(): Promise<Measurement[]> {
    if (this.artboard.revision > this._cacheRevision) {
      this._cache = (await this.artboard.getComputedStyles([this.node.id]))[0];
      this._cacheRevision = this.artboard.revision;
    }
    return this._cache;
  }
}

export class Artboards {
  readonly desktop = new Artboard();
  readonly mobile = new Artboard();

  get all(): Artboard[] {
    return [this.desktop, this.mobile];
  }
}

export const artboards = new Artboards();
