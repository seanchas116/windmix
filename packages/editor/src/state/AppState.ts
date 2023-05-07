import { makeObservable, action, computed, observable } from "mobx";
import { StyleInspectorState } from "./StyleInspectorState";
import { Style } from "../models/style/Style";
import { IEditorToRootRPCHandler, IRootToEditorRPCHandler } from "../types/RPC";
import { RPC, Target } from "@seanchas116/paintkit/src/util/typedRPC";
import * as Y from "yjs";
import { Node, Document } from "@windmix/model";
import { Rect } from "paintvec";

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
  }

  rpc: RPC<IEditorToRootRPCHandler, IRootToEditorRPCHandler>;
}

export class AppState {
  constructor() {
    makeObservable(this);
  }

  readonly document = new Document();
  readonly fileNode = this.document.nodes.getOrCreate("file", "file");
  readonly connection: VSCodeConnection = new VSCodeConnection(this);

  @observable hover: Node | undefined = undefined;

  @computed get tabPath(): string | undefined {
    return this.fileNode.data.get("filePath");
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
