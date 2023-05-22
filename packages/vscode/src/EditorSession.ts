import * as vscode from "vscode";
import { WebviewSession } from "./WebviewSession";
import { ExtensionState } from "./ExtensionState";

export class EditorPanelSerializer implements vscode.WebviewPanelSerializer {
  constructor(extensionState: ExtensionState) {
    this.extensionState = extensionState;
  }

  extensionState: ExtensionState;

  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel) {
    new EditorSession(this.extensionState, webviewPanel);
  }
}

export const editorWebviewPanels = new Set<vscode.WebviewPanel>();

export class EditorSession extends WebviewSession {
  static createWithNewPanel(extensionState: ExtensionState) {
    const panel = vscode.window.createWebviewPanel(
      "windmixEditor",
      "Windmix",
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );
    return new EditorSession(extensionState, panel);
  }

  constructor(extensionState: ExtensionState, panel: vscode.WebviewPanel) {
    super(extensionState, panel, "main");

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
