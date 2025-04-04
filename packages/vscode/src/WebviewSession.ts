import * as vscode from "vscode";
import { RPC } from "@seanchas116/paintkit/src/util/typedRPC";
import * as Y from "yjs";
import {
  IEditorToRootRPCHandler,
  IRootToEditorRPCHandler,
} from "../../editor/src/types/RPC";
import { debouncedUpdate } from "@seanchas116/paintkit/src/util/yjs/debouncedUpdate";
import { ExtensionState } from "./ExtensionState";
import { editorWebviewPanels } from "./EditorSession";
import { findTabColumnForURI, findTabColumnForWebview } from "./common";

export class WebviewSession {
  constructor(
    extensionState: ExtensionState,
    panel: vscode.WebviewPanel | vscode.WebviewView,
    scriptName: string
  ) {
    this.extensionState = extensionState;
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
            const pos = new vscode.Position(location.line - 1, location.column);

            vscode.window.showTextDocument(textEditor.document, {
              viewColumn: textEditor.viewColumn,
              selection: new vscode.Selection(pos, pos),
            });
          }
        },
        revealLocation: async (location: { line: number; column: number }) => {
          const textEditor = extensionState.textEditor;
          if (textEditor) {
            const pos = new vscode.Position(location.line - 1, location.column);
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
    const textEditor = this.extensionState.textEditor;
    if (!textEditor) {
      return;
    }

    const editorColumn = findTabColumnForURI(textEditor.document.uri);
    const webviewColumn = findTabColumnForWebview(/windmixEditor$/);

    if (editorColumn) {
      const opts = {
        preserveFocus: false,
        preview: false,
        viewColumn: editorColumn,
      };
      await vscode.window.showTextDocument(textEditor!.document, opts);
      await vscode.commands.executeCommand(command);
      if (webviewColumn) {
        const editorPanel = [...editorWebviewPanels][0];
        if (editorPanel) {
          editorPanel.reveal(webviewColumn, false);
        }
      }
    }
  }

  readonly extensionState: ExtensionState;
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
