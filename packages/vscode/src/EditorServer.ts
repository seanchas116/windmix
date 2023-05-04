import { Server, createServer } from "http";
import ws from "ws";

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

    ws.on("error", (e) => console.error(e));

    ws.on("close", () => {
      this.dispose();
    });

    ws.on("message", (data) => {
      console.log("received: %s", data);
    });

    ws.send("something");
  }

  ws: ws.WebSocket;

  dispose() {}
}
