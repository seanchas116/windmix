import { createServer, ViteDevServer } from "vite";
import * as vscode from "vscode";
import react from "@vitejs/plugin-react";

export class DevServer {
  static async start() {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
      throw new Error("No workspace found");
    }

    const server = await createServer({
      configFile: false,
      plugins: [
        react({
          exclude: "**",
        }),
      ],
      root: workspace.uri.fsPath,
      server: {
        port: 1337, // TODO: use ephemeral port
      },
    });
    await server.listen();

    server.printUrls();

    return new DevServer(server);
  }

  private constructor(server: ViteDevServer) {
    this._server = server;
  }

  private _server: ViteDevServer;

  async dispose() {
    this._server.close();
  }
}
