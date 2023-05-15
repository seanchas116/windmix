import React from "react";
import ReactDOM from "react-dom/client";
import App from "./views/App.tsx";
import "./index.css";
import "./state/AppState.ts";
import { appState } from "./state/AppState.ts";
import hotkeys from "hotkeys-js";
import { scrollState } from "./state/ScrollState.ts";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

hotkeys("ctrl+z,command+z", (e) => {
  e.stopPropagation();
  appState.connection.rpc.remote.undo();
});

hotkeys("ctrl+shift+z,command+shift+z", (e) => {
  e.stopPropagation();
  appState.connection.rpc.remote.redo();
});

// zoom in
hotkeys("ctrl+=,command+=", (e) => {
  e.stopPropagation();
  scrollState.zoomIn();
});

// zoom out
hotkeys("ctrl+-,command+-", (e) => {
  e.stopPropagation();
  scrollState.zoomOut();
});

// insert mode
hotkeys("esc", (e) => {
  e.stopPropagation();
  appState.insertMode = undefined;
});
hotkeys("t", (e) => {
  e.stopPropagation();
  appState.insertMode = "text";
});
hotkeys("f,r,b", (e) => {
  e.stopPropagation();
  appState.insertMode = "box";
});

window.addEventListener("beforeunload", () => {
  // VSCode webviews should be reloaded explicitly when the iframe reloads
  // (otherwise the black screen will be shown)
  appState.connection.rpc.remote.reloadWebviews();
});
