import { makeObservable, observable, runInAction } from "mobx";
import { Artboard } from "./Artboard";
import { ComputationData } from "./Computation";
import { appState } from "./AppState";

type MessageFromWindow =
  | {
      type: "windmix:elementsFromPointResult";
      callID: number;
      result: string[];
    }
  | {
      type: "windmix:getComputedStylesResult";
      callID: number;
      result: ComputationData[][];
    }
  | {
      type: "windmix:resize";
      height: number;
    }
  | {
      type: "windmix:reloadComputed";
    }
  | {
      type: "windmix:console";
      message: ConsoleMessage;
    }
  | {
      type: "windmix:beforeUpdate";
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

interface ConsoleMessage {
  level: "log" | "warn" | "error";
  args: string[];
}

export class RendererAdapter {
  constructor(artboard: Artboard) {
    this.artboard = artboard;
    makeObservable(this);
    window.addEventListener("message", this.onMessage);
  }

  readonly artboard: Artboard;

  window: Window | undefined;
  revision = Date.now();
  previewInProgress = false;

  @observable windowBodyHeight = 0;
  readonly consoleMessages = observable.array<{
    args: string[];
    level: "log" | "warn" | "error";
  }>();

  setWindow(window: Window | undefined) {
    this.window = window;
    this.windowBodyHeight = 0;
    this.consoleMessages.clear();
  }

  readonly onMessage = (event: MessageEvent<MessageFromWindow>) => {
    if (event.source !== this.window) {
      return;
    }
    const data = event.data;

    switch (data.type) {
      case "windmix:resize": {
        const height = data.height;
        runInAction(() => {
          console.log("resize", height);
          this.windowBodyHeight = height;
        });
        break;
      }
      case "windmix:reloadComputed": {
        this.previewInProgress = false;
        this.revision = Date.now();
        this.artboard.updateRects();
        break;
      }
      case "windmix:console": {
        this.consoleMessages.push(data.message);
        break;
      }
      case "windmix:beforeUpdate": {
        break;
      }
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

  async getComputedStyles(ids: string[]): Promise<ComputationData[][]> {
    const targetWindow = this.window;
    if (!targetWindow) {
      return [];
    }

    const callID = Math.random();
    return new Promise<ComputationData[][]>((resolve) => {
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

  setPreviewClassName(nodeID: string, className: string) {
    if (this.previewInProgress) {
      return;
    }
    this.previewInProgress = true;

    const message: MessageToWindow = {
      type: "windmix:setClassName",
      id: nodeID,
      className,
    };
    this.window?.postMessage(message, "*");
  }
}
