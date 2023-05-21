import * as vscode from "vscode";
import { extensionState } from "./ExtensionState";
import { WebviewSession } from "./WebviewSession";

export class EditorPanelSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel) {
    new EditorSession(webviewPanel);
  }
}

export const editorWebviewPanels = new Set<vscode.WebviewPanel>();

export class EditorSession extends WebviewSession {
  static createWithNewPanel() {
    const panel = vscode.window.createWebviewPanel(
      "windmixEditor",
      "Windmix",
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );
    return new EditorSession(panel);
  }

  constructor(panel: vscode.WebviewPanel) {
    super(panel, "main");

    // set title
    panel.title = extensionState.webviewTitle;
    this.disposables.push(
      extensionState.onWebviewTitleChanged((title) => {
        panel.title = title;
      })
    );

    editorWebviewPanels.add(panel);
    this.disposables.push({
      dispose: () => {
        editorWebviewPanels.delete(panel);
      },
    });
  }
}
