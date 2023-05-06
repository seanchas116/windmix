import * as vscode from "vscode";
import * as path from "node:path";
import { RPC } from "@seanchas116/paintkit/src/util/typedRPC";
import * as Y from "yjs";
import { loadFile } from "@windmix/model/src/loadFile";
import {
  IEditorToRootRPCHandler,
  IRootToEditorRPCHandler,
} from "../../editor/src/types/RPC";
import { debouncedUpdate } from "@seanchas116/paintkit/src/util/yjs/debouncedUpdate";

export class EditorPanelSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    console.log(`Got state: ${state}`);

    new EditorSession({
      webviewPanel,
      textEditor: vscode.window.activeTextEditor,
    });
  }
}

export class EditorSession {
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
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        console.log("onDidChangeActiveTextEditor", editor);

        if (editor) {
          this.textEditor = editor;
        }
      })
    );

    let unsubscribeDoc: (() => void) | undefined;

    const rpc = new RPC<IRootToEditorRPCHandler, IEditorToRootRPCHandler>(
      {
        post: (message) => {
          panel.webview.postMessage(message);
        },
        subscribe: (handler) => {
          const disposable = panel.webview.onDidReceiveMessage(handler);
          return () => disposable.dispose();
        },
      },
      {
        ready: async (data) => {
          unsubscribeDoc?.();
          Y.applyUpdate(this._doc, data);

          const onDocUpdate = debouncedUpdate((update: Uint8Array) => {
            rpc.remote.update(update);
          });
          this._doc.on("update", onDocUpdate);
          unsubscribeDoc = () => this._doc.off("update", onDocUpdate);
          rpc.remote.init(Y.encodeStateAsUpdate(this._doc));
        },
        update: async (data) => {
          Y.applyUpdate(this._doc, data);
        },
      }
    );
    disposables.push({ dispose: () => rpc.dispose() });

    panel.onDidDispose(() => {
      for (const disposable of disposables) {
        disposable.dispose();
      }
    });
  }

  private _panel: vscode.WebviewPanel;
  private _textEditor: vscode.TextEditor | undefined;
  private _doc = new Y.Doc();

  get textEditor(): vscode.TextEditor | undefined {
    return this._textEditor;
  }

  set textEditor(textEditor: vscode.TextEditor | undefined) {
    if (this._textEditor === textEditor) {
      return;
    }

    if (textEditor) {
      const filePath = this.projectPathForEditor(textEditor);
      const code = textEditor.document.getText();
      loadFile(this._doc, filePath, code);
    }

    this._textEditor = textEditor;
    this._panel.title = this.titleForEditor(textEditor);
  }

  titleForEditor(editor: vscode.TextEditor | undefined) {
    if (!editor) {
      return "Windmix";
    }

    return "Windmix " + path.basename(editor.document.uri.path);
  }

  projectPathForEditor(editor: vscode.TextEditor) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.path;
    if (!workspacePath) {
      throw new Error("No workspace path");
    }

    return "/" + path.relative(workspacePath, editor.document.uri.path);
  }

  private getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <script type="module">
    import RefreshRuntime from "http://localhost:5173/@react-refresh"
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
    </script>
        <script type="module" src="http://localhost:5173/@vite/client"></script>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Windmix Editor</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="http://localhost:5173/src/main.tsx"></script>
      </body>
    </html>
    `;
  }

  /*
  private getWebviewContent() {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
      <script src="https://cdn.tailwindcss.com"></script>
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

                      const root = document.getElementById('root');
                      root?.remove()
                      const newRoot = document.createElement('div');
                      newRoot.id = 'root';
                      document.body.appendChild(newRoot);

                      import("http://localhost:1337/virtual:windmix" + message.path).then(
                        mod => {
                          const root = document.getElementById('root');
                          root?.remove()
                          const newRoot = document.createElement('div');
                          newRoot.id = 'root';
                          document.body.appendChild(newRoot);
                          mod.render(newRoot)
                        }
                      );
                      break;
              }
          });
          vscode.postMessage({
            command: "ready",
          });
      </script>
  </body>
  </html>`;
  }*/
}
