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
import { extensionState } from "./ExtensionState";
//import * as Diff from "diff";

export class EditorPanelSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(
    webviewPanel: vscode.WebviewPanel,
    state?: ViewState
  ) {
    /*
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
    }*/

    new EditorSession({
      webviewPanel,
      //textEditor: vscode.window.activeTextEditor,
    });
  }
}

export const debouncedChange = (onUpdate: () => void): (() => void) => {
  let queued = false;
  const debounced = () => {
    if (queued) {
      return;
    }
    queued = true;
    queueMicrotask(() => {
      queued = false;
      onUpdate();
    });
  };
  return debounced;
};

export class EditorSession {
  constructor({
    webviewPanel,
  }: {
    webviewPanel?: vscode.WebviewPanel;
  } = {}) {
    const panel =
      webviewPanel ??
      vscode.window.createWebviewPanel(
        "windmixEditor",
        "Windmix",
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );
    this._panel = panel;
    panel.webview.html = this.getWebviewContent();

    const disposables: vscode.Disposable[] = [];

    // set title

    panel.title = extensionState.webviewTitle;
    disposables.push(
      extensionState.onWebviewTitleChanged((title) => {
        panel.title = title;
      })
    );

    // broadcast updates
    const onDocUpdate = debouncedUpdate((update: Uint8Array) => {
      rpc.remote.update(update);
    });
    extensionState.document.ydoc.on("update", onDocUpdate);
    disposables.push({
      dispose: () => {
        extensionState.document.ydoc.off("update", onDocUpdate);
      },
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
          Y.applyUpdate(extensionState.document.ydoc, data);
          rpc.remote.init(Y.encodeStateAsUpdate(extensionState.document.ydoc));
        },
        update: async (data) => {
          Y.applyUpdate(extensionState.document.ydoc, data);
        },
        jumpToLocation: async (location: { line: number; column: number }) => {
          const textEditor = extensionState.textEditor;
          if (textEditor) {
            const pos = new vscode.Position(location.line, location.column);

            vscode.window.showTextDocument(textEditor.document, {
              viewColumn: textEditor.viewColumn,
              selection: new vscode.Selection(pos, pos),
            });
          }
        },
        revealLocation: async (location: { line: number; column: number }) => {
          const textEditor = extensionState.textEditor;
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
    const textEditor = extensionState.textEditor;
    if (!textEditor) {
      return;
    }

    const { edTabCol, webTabCol } = this.findTabs();

    if (edTabCol) {
      const opts = {
        preserveFocus: false,
        preview: false,
        viewColumn: edTabCol,
      };
      await vscode.window.showTextDocument(textEditor!.document, opts);
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
        if (
          tab.input.uri.fsPath ===
          extensionState.textEditor?.document.uri.fsPath
        ) {
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
          body {
            user-select: none;
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
