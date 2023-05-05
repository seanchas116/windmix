import { observable, makeObservable } from "mobx";
import { StyleInspectorState } from "./StyleInspectorState";
import { Style } from "../models/style/Style";

type Message = {
  command: "tabSelected";
  path?: string;
};

class WebSocketConnection {
  constructor(onMessage: (message: Message) => void) {
    // Create WebSocket connection.
    const socket = new WebSocket("ws://localhost:1338");

    // Connection opened
    socket.addEventListener("open", () => {
      socket.send("Hello Server!");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      onMessage(message);
    });
  }
}

class VSCodeConnection {
  constructor(onMessage: (message: Message) => void) {
    const vscode = acquireVsCodeApi();

    window.addEventListener("message", (event) => {
      onMessage(event.data);
    });

    vscode.postMessage({
      command: "ready",
    });
  }
}

export class AppState {
  constructor() {
    const onMessage = (message: Message) => {
      switch (message.command) {
        case "tabSelected":
          this.tabPath = message.path;
          console.log("tabSelected", message.path);
          break;
      }
    };

    if (location.protocol === "vscode-webview:") {
      new VSCodeConnection(onMessage);
    } else {
      new WebSocketConnection(onMessage);
    }

    makeObservable(this);
  }

  @observable tabPath: string | undefined = undefined;

  readonly styleInspectorState = new StyleInspectorState({
    getTargets: () => {
      return [
        {
          tagName: "div",
          style: new Style(),
          computedStyle: new Style(),
        },
      ];
    },
    notifyChange: () => {},
    notifyChangeEnd: () => {},
  });
}

export const appState = new AppState();
