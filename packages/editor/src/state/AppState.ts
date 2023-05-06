import { observable, makeObservable, action, computed } from "mobx";
import { StyleInspectorState } from "./StyleInspectorState";
import { Style } from "../models/style/Style";
import { IEditorToRootRPCHandler, IRootToEditorRPCHandler } from "../types/RPC";
import { RPC, Target } from "@seanchas116/paintkit/src/util/typedRPC";
import * as Y from "yjs";
import { NodeMap } from "@windmix/model";
import { compact } from "lodash-es";

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
  constructor() {
    this.rpc = new RPC<IEditorToRootRPCHandler, IRootToEditorRPCHandler>(
      vscodeParentTarget(),
      {
        update: action(async (data: Uint8Array) => {
          Y.applyUpdate(appState.doc, data);
        }),
        init: action(async (data: Uint8Array) => {
          Y.applyUpdate(appState.doc, data);
        }),
      }
    );

    this.rpc.remote.ready();
  }

  private rpc: RPC<IEditorToRootRPCHandler, IRootToEditorRPCHandler>;
}

export class AppState {
  constructor() {
    new VSCodeConnection();
    makeObservable(this);
  }

  readonly doc = new Y.Doc();
  readonly nodeMap = new NodeMap(this.doc.getMap("nodes"));
  readonly fileNode = this.nodeMap.getOrCreate("file", "file");

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
}

export const appState = new AppState();
