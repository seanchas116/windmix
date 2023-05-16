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
                  if (data.type === 'windmix:elementsFromPoint') {
                    const elems = document.elementsFromPoint(data.x, data.y);
                    const ids = [];
                    for (const elem of elems) {
                      const id = elem.getAttribute('data-windmixid');
                      if (id) {
                        ids.push(id);
                      }
                    }

                    window.parent.postMessage({
                      type: 'windmix:elementsFromPointResult',
                      callID: data.callID,
                      result: ids,
                    }, '*');
                  } else if (data.type === 'windmix:getComputedStyles') {
                    const result = [];

                    for (const id of data.ids) {
                      const elems = document.querySelectorAll('[data-windmixid="' + id + '"]');
                      const resultsForElem = [];
                      for (const elem of elems) {
                        const rect = elem.getBoundingClientRect();
                        const style = getComputedStyle(elem);
                        resultsForElem.push({
                          rect: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height,
                          },
                          style: {
                            display: style.display,
                            flexDirection: style.flexDirection,
                            marginTop: style.marginTop,
                            marginRight: style.marginRight,
                            marginBottom: style.marginBottom,
                            marginLeft: style.marginLeft,
                            borderTopWidth: style.borderTopWidth,
                            borderRightWidth: style.borderRightWidth,
                            borderBottomWidth: style.borderBottomWidth,
                            borderLeftWidth: style.borderLeftWidth,
                            paddingTop: style.paddingTop,
                            paddingRight: style.paddingRight,
                            paddingBottom: style.paddingBottom,
                            paddingLeft: style.paddingLeft,
                          }
                        });
                      }
                      result.push(resultsForElem);
                    }

                    window.parent.postMessage({
                      type: 'windmix:getComputedStylesResult',
                      callID: data.callID,
                      result: result
                    }, '*');
                  } else if (data.type === "windmix:setClassName") {
                    const elems = document.querySelectorAll('[data-windmixid="' + data.id + '"]');
                    for (const elem of elems) {
                      elem.className = data.className;
                    }
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
                window.parent.postMessage({
                  type: 'windmix:resize',
                  height: document.body.clientHeight,
                }, '*');

                const observer = new MutationObserver(() => {
                  console.log("DOM change");
                  window.parent.postMessage({
                    type: 'windmix:reloadComputed',
                  }, '*');
                });
                observer.observe(document.body,  { attributes: true, childList: true, subtree: true });
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
