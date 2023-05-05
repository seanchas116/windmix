import { createServer, ViteDevServer } from "vite";
import * as vscode from "vscode";
import react from "@vitejs/plugin-react";

export class DevServer {
  static async start() {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
      throw new Error("No workspace found");
    }

    const virtualModulePrefix = "/virtual:windmix/";
    const resolvedVirtualModulePrefix = "\0" + virtualModulePrefix;

    const server = await createServer({
      configFile: false,
      plugins: [
        react(),
        {
          name: "windmix-renderer", // required, will show up in warnings and errors
          resolveId(id) {
            console.log(id);
            if (id.startsWith(virtualModulePrefix)) {
              return "\0" + id;
            }
          },
          load(id) {
            console.log("load", id);
            if (id.startsWith(resolvedVirtualModulePrefix)) {
              const targetPath = id.slice(resolvedVirtualModulePrefix.length);
              console.log("targetPath", targetPath);

              return `
                import Component from "/${targetPath}";
                import React from 'react';
                import { createRoot } from 'react-dom/client';

                const root = document.getElementById('root');
                createRoot(root).render(
                  React.createElement(Component)
                );
              `;
            }
          },
        },
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
