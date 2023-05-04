import { observable, makeObservable } from "mobx";

type Message = {
  command: "tabSelected";
  path?: string;
};

class WebSocketConnection {
  constructor(onMessage: (message: Message) => void) {
    // Create WebSocket connection.
    const socket = new WebSocket("ws://localhost:1338");

    // Connection opened
    socket.addEventListener("open", (event) => {
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
    //const vscode = acquireVsCodeApi();

    window.addEventListener("message", (event) => {
      onMessage(event.data);
    });
  }
}

export class EditorState {
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
}

export const editorState = new EditorState();
