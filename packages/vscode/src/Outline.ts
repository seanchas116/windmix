import * as vscode from "vscode";
import { WebviewSession } from "./WebviewSession";

export class OutlineWebviewViewProvider implements vscode.WebviewViewProvider {
  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
    };
    new OutlineSession(webviewView);
  }
}

export class OutlineSession extends WebviewSession {
  constructor(webviewView: vscode.WebviewView) {
    super(webviewView, "outline");
  }
}
