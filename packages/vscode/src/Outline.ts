import * as vscode from "vscode";
import { WebviewSession } from "./WebviewSession";
import { ExtensionState } from "./ExtensionState";

export class OutlineWebviewViewProvider implements vscode.WebviewViewProvider {
  constructor(extensionState: ExtensionState) {
    this.extensionState = extensionState;
  }

  extensionState: ExtensionState;

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
    };
    new OutlineSession(this.extensionState, webviewView);
  }
}

export class OutlineSession extends WebviewSession {
  constructor(extensionState: ExtensionState, webviewView: vscode.WebviewView) {
    super(extensionState, webviewView, "outline");
  }
}
