import { Node } from "@windmix/model";
import { makeObservable, observable, runInAction } from "mobx";
import { Artboard } from "./Artboard";

export interface ComputedStyle {
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

export interface Measurement {
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

export class RendererAdapter {
  constructor(artboard: Artboard) {
    this.artboard = artboard;
    makeObservable(this);
    window.addEventListener("message", this.onMessage);
  }

  readonly artboard: Artboard;

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
      this.artboard.updateRects();
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

  setClassName(node: Node, className: string) {
    const message: MessageToWindow = {
      type: "windmix:setClassName",
      id: node.id,
      className,
    };
    this.window?.postMessage(message, "*");
  }
}
