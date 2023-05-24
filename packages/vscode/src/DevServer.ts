import * as path from "node:path";
import { createServer, Logger, Rollup, ViteDevServer } from "vite";
import * as vscode from "vscode";
import react from "@vitejs/plugin-react";
import { BuildProblem } from "@windmix/model";
// @ts-ignore
import renderModuleScript from "./assets/renderModule.raw.js";

const virtualModulePrefix = "/virtual:windmix?";
const resolvedVirtualModulePrefix = "\0" + virtualModulePrefix;

function createLogger(
  onBuildProblem: vscode.EventEmitter<BuildProblem>
): Logger {
  const loggedErrors = new WeakSet<Error | Rollup.RollupError>();
  const warnedMessages = new Set<string>();

  const logger: Logger = {
    hasWarned: false,
    hasErrorLogged: (err) => loggedErrors.has(err),
    clearScreen: () => {},
    info(msg) {
      console.log(msg);
    },
    warn(msg) {
      console.warn(msg);
      onBuildProblem.fire({
        type: "warning",
        message: msg,
      });
      logger.hasWarned = true;
    },
    warnOnce(msg) {
      if (warnedMessages.has(msg)) {
        return;
      }
      console.warn(msg);
      onBuildProblem.fire({
        type: "warning",
        message: msg,
      });
      logger.hasWarned = true;
      warnedMessages.add(msg);
    },
    error(msg, opts) {
      console.error(msg);
      onBuildProblem.fire({
        type: "error",
        message: msg,
      });
      if (opts?.error) {
        loggedErrors.add(opts.error);
      }
    },
  };

  return logger;
}

export class DevServer {
  private _onBuildProblem = new vscode.EventEmitter<BuildProblem>();
  onBuildProblem = this._onBuildProblem.event;

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

              return (renderModuleScript as string)
                .replace("%%path%%", path!)
                .replace("%%component%%", component!);
            }
          },
        },
      ],
      root: workspace.uri.fsPath,
      resolve: {
        alias: {
          "@/": `${workspace.uri.fsPath}/src/`,
        },
      },
      server: {
        port: 1337, // TODO: use ephemeral port
      },
      customLogger: createLogger(this._onBuildProblem),
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
