import * as vscode from "vscode";
import { WebviewSession } from "./WebviewSession";

export class InspectorWebviewViewProvider
  implements vscode.WebviewViewProvider
{
  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
    };
    new InspectorSession(webviewView);
  }
}

export class InspectorSession extends WebviewSession {
  constructor(webviewView: vscode.WebviewView) {
    super(webviewView, "inspector");
  }
}
