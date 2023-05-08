import * as path from "node:path";
import { createServer, ViteDevServer } from "vite";
import * as vscode from "vscode";
import react from "@vitejs/plugin-react";

const virtualModulePrefix = "/virtual:windmix/";
const resolvedVirtualModulePrefix = "\0" + virtualModulePrefix;

export class DevServer {
  async start() {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
      throw new Error("No workspace found");
    }

    const server = await createServer({
      configFile: false,
      plugins: [
        react(),
        {
          name: "windmix-renderer", // required, will show up in warnings and errors
          resolveId: (id) => {
            console.log(id);
            if (id.startsWith(virtualModulePrefix)) {
              return "\0" + id;
            }
          },
          load: (id) => {
            console.log("load", id);

            if (
              this.preview &&
              path.resolve(
                workspace.uri.fsPath,
                this.preview.filePath.slice(1)
              ) === id
            ) {
              return this.preview.content;
            }

            if (id.startsWith(resolvedVirtualModulePrefix)) {
              const targetPath = id.slice(resolvedVirtualModulePrefix.length);

              return `
                import * as module from "/${targetPath}";
                import React from 'react';
                import { createRoot } from 'react-dom/client';

                const root = document.getElementById('root');
                createRoot(root).render(
                  React.createElement(module.default, module.getWindmixProps?.())
                );

                import.meta.hot.accept(() => {
                  window.parent.__windmixOnUpdate(window);
                });
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

    this.server = server;
  }

  server: ViteDevServer | undefined;

  async dispose() {
    this.server?.close();
  }

  setPreview(filePath: string, content: string) {
    this.preview = {
      filePath,
      content,
    };

    if (!this.server) {
      return;
    }
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
      return;
    }

    const module = this.server.moduleGraph.getModuleById(
      path.join(workspace.uri.fsPath, filePath.slice(1))
    );
    if (module) {
      this.server.reloadModule(module);
    }
  }

  private preview:
    | {
        filePath: string;
        content: string;
      }
    | undefined = undefined;
}
