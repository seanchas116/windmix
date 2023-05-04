// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "node:path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "windmix-vscode" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "windmix-vscode.openEditor",
    () => {
      new EditorWebview({
        textEditor: vscode.window.activeTextEditor,
      });
    }
  );
  context.subscriptions.push(disposable);

  vscode.window.registerWebviewPanelSerializer(
    "windmixEditor",
    new EditorPanelSerializer()
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

class EditorPanelSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    console.log(`Got state: ${state}`);

    new EditorWebview({
      webviewPanel,
      textEditor: vscode.window.activeTextEditor,
    });
  }
}

class EditorWebview {
  constructor({
    webviewPanel,
    textEditor,
  }: {
    webviewPanel?: vscode.WebviewPanel;
    textEditor?: vscode.TextEditor;
  } = {}) {
    this._textEditor = textEditor;

    const panel =
      webviewPanel ??
      vscode.window.createWebviewPanel(
        "windmixEditor",
        "Windmix",
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );
    this._panel = panel;
    panel.title = this.titleForEditor(textEditor);
    panel.webview.html = this.getWebviewContent();

    const disposables: vscode.Disposable[] = [];

    disposables.push(
      panel.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case "ready":
            panel.webview.postMessage({
              command: "tabSelected",
              path: this._textEditor?.document.uri.path,
            });
            break;
        }
      })
    );
    disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        console.log("onDidChangeActiveTextEditor", editor);

        if (editor) {
          this.textEditor = editor;
        }
      })
    );

    panel.onDidDispose(() => {
      for (const disposable of disposables) {
        disposable.dispose();
      }
    });
  }

  private _panel: vscode.WebviewPanel;
  private _textEditor: vscode.TextEditor | undefined;

  get textEditor(): vscode.TextEditor | undefined {
    return this._textEditor;
  }

  set textEditor(textEditor: vscode.TextEditor | undefined) {
    this._textEditor = textEditor;
    this._panel.title = this.titleForEditor(textEditor);
    this._panel.webview.postMessage({
      command: "tabSelected",
      path: textEditor?.document.uri.path,
    });
  }

  titleForEditor(editor: vscode.TextEditor | undefined) {
    if (!editor) {
      return "Windmix";
    }

    return "Windmix " + path.basename(editor.document.uri.path);
  }

  private getWebviewContent() {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
      <div id="path">No editor selected</div>
      <script>
          const vscode = acquireVsCodeApi();
          window.addEventListener('message', event => {
              const message = event.data; // The JSON data our extension sent
              switch (message.command) {
                  case 'tabSelected':
                      document.getElementById('path').innerText = message.path;
                      break;
              }
          });
          vscode.postMessage({
            command: "ready",
          });
      </script>
  </body>
  </html>`;
  }
}
