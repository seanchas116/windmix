import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./state/AppState.ts";
import { InspectorApp } from "./views/InspectorApp.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <InspectorApp />
  </React.StrictMode>
);
