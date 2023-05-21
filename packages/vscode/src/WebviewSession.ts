import * as vscode from "vscode";
import { RPC } from "@seanchas116/paintkit/src/util/typedRPC";
import * as Y from "yjs";
import {
  IEditorToRootRPCHandler,
  IRootToEditorRPCHandler,
} from "../../editor/src/types/RPC";
import { debouncedUpdate } from "@seanchas116/paintkit/src/util/yjs/debouncedUpdate";
import { extensionState } from "./ExtensionState";
import { editorWebviewPanels } from "./EditorSession";

export class WebviewSession {
  constructor(
    panel: vscode.WebviewPanel | vscode.WebviewView,
    scriptName: string
  ) {
    this._panel = panel;
    panel.webview.html = this.getWebviewContent(scriptName);

    // broadcast updates
    const onDocUpdate = debouncedUpdate((update: Uint8Array) => {
      rpc.remote.update(update);
    });
    extensionState.document.ydoc.on("update", onDocUpdate);
    this.disposables.push({
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
    this.disposables.push({ dispose: () => rpc.dispose() });

    panel.onDidDispose(() => this.dispose());
  }

  dispose() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
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
        const editorPanel = [...editorWebviewPanels][0];
        if (editorPanel) {
          editorPanel.reveal(webTabCol, false);
        }
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

  readonly disposables: vscode.Disposable[] = [];
  private _panel: vscode.WebviewPanel | vscode.WebviewView;

  private getWebviewContent(scriptName: string) {
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
        <script type="module" src="http://localhost:5173/src/${scriptName}.tsx"></script>
      </body>
    </html>
    `;
  }
}
