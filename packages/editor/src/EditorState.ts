import { observable, makeObservable } from "mobx";

export class EditorState {
  constructor() {
    // Create WebSocket connection.
    const socket = new WebSocket("ws://localhost:1338");

    // Connection opened
    socket.addEventListener("open", (event) => {
      socket.send("Hello Server!");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      switch (message.command) {
        case "tabSelected":
          this.tabPath = message.path;
          console.log("tabSelected", message.path);
          break;
      }
    });

    makeObservable(this);
  }

  @observable tabPath: string | undefined = undefined;
}

export const editorState = new EditorState();
