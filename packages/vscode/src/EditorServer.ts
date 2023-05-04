import { Server, createServer } from "http";
import ws from "ws";
import * as vscode from "vscode";
import * as path from "path";

export class EditorServer {
  constructor() {
    const indexHTML = `
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
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="http://localhost:5173/src/main.tsx"></script>
      </body>
    </html>
    `;

    const server = createServer((req, res) => {
      if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(indexHTML);
        return;
      }

      res.writeHead(404);
      res.end();
    });
    this.server = server;

    const wss = new ws.Server({ server });

    wss.on("connection", (ws) => {
      new WebsocketSession(ws);
    });

    server.listen(1338);
  }

  readonly server: Server;

  dispose(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

class WebsocketSession {
  constructor(ws: ws.WebSocket) {
    this.ws = ws;
    this.textDocument = vscode.window.activeTextEditor?.document;

    ws.on("error", (e) => console.error(e));

    ws.on("close", () => {
      this.dispose();
    });

    ws.on("message", (data) => {
      console.log("received: %s", data);
    });

    ws.send(
      JSON.stringify({
        command: "tabSelected",
        path:
          this.textDocument && this.projectPathForDocument(this.textDocument),
      })
    );

    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        console.log("onDidChangeActiveTextEditor", editor);

        if (editor) {
          this.textDocument = editor.document;
          ws.send(
            JSON.stringify({
              command: "tabSelected",
              path:
                this.textDocument &&
                this.projectPathForDocument(this.textDocument),
            })
          );
        }
      })
    );
  }

  ws: ws.WebSocket;
  disposables: vscode.Disposable[] = [];
  textDocument: vscode.TextDocument | undefined;

  dispose() {}

  projectPathForDocument(document: vscode.TextDocument) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.path;
    if (!workspacePath) {
      throw new Error("No workspace path");
    }

    return "/" + path.relative(workspacePath, document.uri.path);
  }
}
