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
  // on undo
  if (e.metaKey && !e.shiftKey && e.key === "z") {
    console.log("TODO: undo");

    appState.connection.rpc.remote.undo();
  }
});
