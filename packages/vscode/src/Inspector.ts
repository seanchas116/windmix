import * as vscode from "vscode";
import { WebviewSession } from "./WebviewSession";
import { ExtensionState } from "./ExtensionState";

export class InspectorWebviewViewProvider
  implements vscode.WebviewViewProvider
{
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
    new InspectorSession(this.extensionState, webviewView);
  }
}

export class InspectorSession extends WebviewSession {
  constructor(extensionState: ExtensionState, webviewView: vscode.WebviewView) {
    super(extensionState, webviewView, "inspector");
  }
}
