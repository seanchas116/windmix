import * as path from "node:path";
import { createServer, ViteDevServer } from "vite";
import * as vscode from "vscode";
import react from "@vitejs/plugin-react";

const virtualModulePrefix = "/virtual:windmix?";
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
          configureServer: (server) => {
            server.middlewares.use(async (req, res, next) => {
              console.log(req.originalUrl);
              if (req.originalUrl?.startsWith("/windmix?")) {
                const query = new URLSearchParams(
                  req.originalUrl.slice("/windmix?".length)
                );
                const path = query.get("path");
                const component = query.get("component");
                console.log(req.originalUrl, path);

                let template = `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body>
                    <div id="root"></div>
                    <script type="module" src="${virtualModulePrefix}path=${path}&component=${component}"></script>
                </body>
                </html>`;
                template = await server.transformIndexHtml(
                  req.originalUrl,
                  template
                );

                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.write(template);
                res.end();
                return;
              }

              next();
            });
          },
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
              const query = new URLSearchParams(
                id.slice(resolvedVirtualModulePrefix.length)
              );
              const path = query.get("path");
              const component = query.get("component");

              return `
                import * as module from "${path}";
                import React from 'react';
                import { createRoot } from 'react-dom/client';

                const root = document.getElementById('root');
                createRoot(root).render(
                  React.createElement(module[${JSON.stringify(
                    component
                  )}], module.getWindmixProps?.())
                );

                window.addEventListener('message', (event) => {
                  const data = event.data;
                  if (data.type === 'windmix:elementFromPoint') {
                    const elem = document.elementFromPoint(data.x, data.y);
                    const id = elem?.getAttribute('data-windmixid');

                    window.parent.postMessage({
                      type: 'windmix:elementFromPointResult',
                      callID: data.callID,
                      result: id,
                    }, '*');
                  } else if (data.type === 'windmix:getComputedStyle') {
                    const elems = document.querySelectorAll('[data-windmixid="' + data.id + '"]');
                    const results = [...elems].map((elem) => {
                      const rect = elem.getBoundingClientRect();
                      return {
                        rect: {
                          x: rect.x,
                          y: rect.y,
                          width: rect.width,
                          height: rect.height,
                        },
                      };
                    });

                    window.parent.postMessage({
                      type: 'windmix:getComputedStyleResult',
                      callID: data.callID,
                      result: results
                    }, '*');
                  }
                });

                const resizeObserver = new ResizeObserver(() => {
                  console.log("resize", document.body.clientWidth, document.body.clientHeight);
                  window.parent.postMessage({
                    type: 'windmix:resize',
                    height: document.body.clientHeight,
                  }, '*');
                });
                resizeObserver.observe(document.body);

                import.meta.hot.accept(() => {
                  window.parent.postMessage({
                    type: 'windmix:hotReload',
                  }, '*');
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
