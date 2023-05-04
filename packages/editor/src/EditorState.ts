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
      console.log("Message from server ", event.data);
    });
  }
}

export const editorState = new EditorState();
