import React from "react";
import ReactDOM from "react-dom/client";
import App from "./views/App.tsx";
import "./index.css";
import "./state/AppState.ts";
import { appState } from "./state/AppState.ts";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

window.addEventListener("keydown", (e) => {
  // undo/redo
  if (e.metaKey && e.key === "z") {
    if (e.shiftKey) {
      appState.connection.rpc.remote.redo();
    } else {
      appState.connection.rpc.remote.undo();
    }
  }
});
