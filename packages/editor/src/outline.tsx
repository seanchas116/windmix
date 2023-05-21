import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./state/AppState.ts";
import { OutlineApp } from "./views/OutlineApp.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OutlineApp />
  </React.StrictMode>
);
