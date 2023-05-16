import React from "react";
import ReactDOM from "react-dom/client";
import App from "./views/App.tsx";
import "./index.css";
import "./state/AppState.ts";
import { appState } from "./state/AppState.ts";
import hotkeys from "hotkeys-js";
import { scrollState } from "./state/ScrollState.ts";
import { action } from "mobx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

hotkeys(
  "ctrl+z,command+z",
  action((e) => {
    e.stopPropagation();
    appState.connection.rpc.remote.undo();
  })
);

hotkeys(
  "ctrl+shift+z,command+shift+z",
  action((e) => {
    e.stopPropagation();
    appState.connection.rpc.remote.redo();
  })
);

// zoom in
hotkeys(
  "ctrl+=,command+=",
  action((e) => {
    e.stopPropagation();
    scrollState.zoomIn();
  })
);

// zoom out
hotkeys(
  "ctrl+-,command+-",
  action((e) => {
    e.stopPropagation();
    scrollState.zoomOut();
  })
);

// insert mode
hotkeys(
  "esc",
  action((e) => {
    e.stopPropagation();
    appState.tool = undefined;
  })
);
hotkeys(
  "t",
  action((e) => {
    e.stopPropagation();
    appState.tool = {
      type: "insert",
      insertMode: "text",
    };
  })
);
hotkeys(
  "f,r,b",
  action((e) => {
    e.stopPropagation();
    appState.tool = {
      type: "insert",
      insertMode: "box",
    };
  })
);

hotkeys(
  "backspace,delete",
  action((e) => {
    e.stopPropagation();
    for (const selected of appState.document.selectedNodes) {
      selected.remove();
    }
  })
);

hotkeys(
  "space",
  {
    keydown: true,
    keyup: true,
  },
  action((e) => {
    if (e.type === "keydown") {
      appState.panMode = true;
    } else if (e.type === "keyup") {
      appState.panMode = false;
    }
  })
);

window.addEventListener("beforeunload", () => {
  // VSCode webviews should be reloaded explicitly when the iframe reloads
  // (otherwise the black screen will be shown)
  appState.connection.rpc.remote.reloadWebviews();
});
