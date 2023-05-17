import * as vscode from "vscode";
import * as path from "node:path";
import { RPC } from "@seanchas116/paintkit/src/util/typedRPC";
import * as Y from "yjs";
import { Document, FileNode } from "@windmix/model";
import { loadFile } from "@windmix/model/src/loadFile";
import {
  IEditorToRootRPCHandler,
  IRootToEditorRPCHandler,
} from "../../editor/src/types/RPC";
import { ViewState } from "../../editor/src/types/ViewState";
import { debouncedUpdate } from "@seanchas116/paintkit/src/util/yjs/debouncedUpdate";
import { devServer } from "./extension";
//import * as Diff from "diff";

export class EditorPanelSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(
    webviewPanel: vscode.WebviewPanel,
    state?: ViewState
  ) {
    console.log(`Got state: ${state}`);

    const tabPath = state?.tabPath;
    if (tabPath && vscode.workspace.rootPath) {
      const tabFullPath = path.join(
        vscode.workspace.rootPath,
        tabPath.slice(1)
      );

      let editorViewColumn: vscode.ViewColumn | undefined;

      for (const tab of vscode.window.tabGroups.all.flatMap(
        (group) => group.tabs
      )) {
        if (tab.input instanceof vscode.TabInputText) {
          if (tab.input.uri.fsPath === tabFullPath) {
            editorViewColumn = tab.group.viewColumn;
          }
        }
      }

      const textEditor = await vscode.window.showTextDocument(
        vscode.Uri.file(tabFullPath),
        { viewColumn: editorViewColumn }
      );

      new EditorSession({
        webviewPanel,
        textEditor,
      });

      return;
    }

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
      }),
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (
          event.contentChanges.length &&
          this._textEditor?.document === event.document
        ) {
          this.reloadTextDocument();
        }
      })
    );
    this.reloadTextDocument();

    const onDocUpdate = debouncedUpdate((update: Uint8Array) => {
      rpc.remote.update(update);

      const textEditor = this._textEditor;
      if (textEditor) {
        const newText = this._document.nodes.get("file")?.stringify() ?? "";
        textEditor.edit((editBuilder) => {
          const oldText = textEditor.document.getText();
          if (newText === oldText) {
            // TODO: compare by AST?
            return;
          }

          editBuilder.replace(
            new vscode.Range(
              textEditor.document.positionAt(0),
              textEditor.document.positionAt(oldText.length)
            ),
            newText
          );
        });
        this._lastSetText = newText;
        console.log("set lastSetText");
      }
    });
    this._document.ydoc.on("update", onDocUpdate);
    disposables.push({
      dispose: () => this._document.ydoc.off("update", onDocUpdate),
    });

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
          Y.applyUpdate(this._document.ydoc, data);
          rpc.remote.init(Y.encodeStateAsUpdate(this._document.ydoc));
        },
        update: async (data) => {
          Y.applyUpdate(this._document.ydoc, data);
        },
        jumpToLocation: async (location: { line: number; column: number }) => {
          const textEditor = this._textEditor;
          if (textEditor) {
            const pos = new vscode.Position(location.line, location.column);

            vscode.window.showTextDocument(textEditor.document, {
              viewColumn: textEditor.viewColumn,
              selection: new vscode.Selection(pos, pos),
            });
          }
        },
        revealLocation: async (location: { line: number; column: number }) => {
          const textEditor = this._textEditor;
          if (textEditor) {
            const pos = new vscode.Position(location.line, location.column);
            textEditor.revealRange(new vscode.Range(pos, pos));
          }
        },
        undo: async () => {
          await this.undoOrRedo("undo");
        },
        redo: async () => {
          await this.undoOrRedo("redo");
        },
        reloadWebviews: async () => {
          await vscode.commands.executeCommand("workbench.action.reloadWindow");
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

  // https://stackoverflow.com/q/75551534
  private async undoOrRedo(command: "undo" | "redo") {
    const { edTabCol, webTabCol } = this.findTabs();

    if (edTabCol) {
      const opts = {
        preserveFocus: false,
        preview: false,
        viewColumn: edTabCol,
      };
      await vscode.window.showTextDocument(this._textEditor!.document, opts);
      await vscode.commands.executeCommand(command);
      if (webTabCol) {
        this._panel.reveal(webTabCol, false);
      }
    }
  }

  private findTabs() {
    let edTabCol: vscode.ViewColumn | undefined;
    let webTabCol: vscode.ViewColumn | undefined;

    for (const tab of vscode.window.tabGroups.all.flatMap(
      (group) => group.tabs
    )) {
      if (tab.input instanceof vscode.TabInputText) {
        if (tab.input.uri.fsPath === this.textEditor?.document.uri.fsPath) {
          edTabCol = tab.group.viewColumn;
        }
      } else if (tab.input instanceof vscode.TabInputWebview) {
        if (/windmixEditor$/.test(tab.input.viewType)) {
          webTabCol = tab.group.viewColumn;
        }
      }
    }
    return { edTabCol, webTabCol };
  }

  private _panel: vscode.WebviewPanel;
  private _textEditor: vscode.TextEditor | undefined;
  private _lastSetText: string | undefined;
  private _document = new Document();

  get textEditor(): vscode.TextEditor | undefined {
    return this._textEditor;
  }

  set textEditor(textEditor: vscode.TextEditor | undefined) {
    if (this._textEditor === textEditor) {
      return;
    }

    this._textEditor = textEditor;
    this._lastSetText = undefined;
    this._panel.title = this.titleForEditor(textEditor);
    this.reloadTextDocument();
  }

  reloadTextDocument() {
    if (!this._textEditor) {
      return;
    }
    const filePath = this.projectPathForEditor(this._textEditor);
    const code = this._textEditor.document.getText();

    //console.log(Diff.diffLines(code, this._lastSetText ?? ""));
    if (code !== this._lastSetText) {
      console.log("reload");
      loadFile(this._document, filePath, code);
    }

    if (devServer) {
      const file = this._document.fileNode;
      devServer.setPreview(filePath, file?.stringify({ id: true }) ?? "");
    }
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
        <style>
          input:focus {
            outline: none;
          }
          :root {
            --macaron-background: var(--vscode-editor-background);
          }
        </style>
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
