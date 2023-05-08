import { makeObservable, action, computed, observable } from "mobx";
import { StyleInspectorState } from "./StyleInspectorState";
import { Style } from "../models/style/Style";
import { IEditorToRootRPCHandler, IRootToEditorRPCHandler } from "../types/RPC";
import { RPC, Target } from "@seanchas116/paintkit/src/util/typedRPC";
import { debouncedUpdate } from "@seanchas116/paintkit/src/util/yjs/debouncedUpdate";
import * as Y from "yjs";
import { Node, Document, FileNode } from "@windmix/model";

function vscodeParentTarget(): Target {
  const vscode = acquireVsCodeApi();

  return {
    post: (message) => vscode.postMessage(message),
    subscribe: (handler) => {
      const onMessage = (event: MessageEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        handler(event.data);
      };
      window.addEventListener("message", onMessage);
      return () => {
        window.removeEventListener("message", onMessage);
      };
    },
  };
}

class VSCodeConnection {
  constructor(appState: AppState) {
    this.rpc = new RPC<IEditorToRootRPCHandler, IRootToEditorRPCHandler>(
      vscodeParentTarget(),
      {
        update: action(async (data: Uint8Array) => {
          Y.applyUpdate(appState.document.ydoc, data);
        }),
        init: action(async (data: Uint8Array) => {
          Y.applyUpdate(appState.document.ydoc, data);
        }),
      }
    );

    this.rpc.remote.ready(Y.encodeStateAsUpdate(appState.document.ydoc));

    const onDocUpdate = debouncedUpdate((update: Uint8Array) => {
      this.rpc.remote.update(update);
    });
    appState.document.ydoc.on("update", onDocUpdate);
  }

  rpc: RPC<IEditorToRootRPCHandler, IRootToEditorRPCHandler>;
}

export class AppState {
  constructor() {
    makeObservable(this);
  }

  readonly document = new Document();
  readonly connection: VSCodeConnection = new VSCodeConnection(this);

  @observable hover: Node | undefined = undefined;

  @computed get tabPath(): string | undefined {
    return this.fileNode?.data.get("filePath");
  }

  @computed get fileNode(): FileNode | undefined {
    return this.document.nodes.get("file") as FileNode | undefined;
  }

  readonly styleInspectorState = new StyleInspectorState({
    getTargets: () => {
      return [
        {
          tagName: "div",
          style: new Style(),
          computedStyle: new Style(),
        },
      ];
    },
    notifyChange: () => {
      // TODO
    },
    notifyChangeEnd: () => {
      // TODO
    },
  });

  reveal(location: { line: number; column: number }): void {
    this.connection.rpc.remote.reveal(location);
  }
}

export const appState = new AppState();
