import React from "react";
import ReactDOM from "react-dom/client";
import App from "./views/App.tsx";
import "./index.css";
import "./state/AppState.ts";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
