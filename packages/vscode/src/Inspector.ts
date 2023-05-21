import { RPC } from "@seanchas116/paintkit/src/util/typedRPC";
import { debouncedUpdate } from "@seanchas116/paintkit/src/util/yjs/debouncedUpdate";
import * as vscode from "vscode";
import {
  IRootToEditorRPCHandler,
  IEditorToRootRPCHandler,
} from "../../editor/src/types/RPC";
import { extensionState } from "./ExtensionState";
import * as Y from "yjs";

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
    new InspectorSession({ webviewView });
  }
}

export class InspectorSession {
  constructor({ webviewView }: { webviewView: vscode.WebviewView }) {
    this._webviewView = webviewView;
    webviewView.webview.html = this.getWebviewContent();

    const disposables: vscode.Disposable[] = [];

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
          webviewView.webview.postMessage(message);
        },
        subscribe: (handler) => {
          const disposable = webviewView.webview.onDidReceiveMessage(handler);
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
          // TODO: undo/redo
        },
        redo: async () => {
          // TODO: undo/redo
        },
        reloadWebviews: async () => {
          await vscode.commands.executeCommand("workbench.action.reloadWindow");
        },
      }
    );
    disposables.push({ dispose: () => rpc.dispose() });

    webviewView.onDidDispose(() => {
      for (const disposable of disposables) {
        disposable.dispose();
      }
    });
  }

  private _webviewView: vscode.WebviewView;

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
        <script type="module" src="http://localhost:5173/src/inspector.tsx"></script>
      </body>
    </html>
    `;
  }
}
