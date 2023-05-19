import { makeObservable, action, computed, observable, reaction } from "mobx";
import { StyleInspectorState } from "./old/OldStyleInspectorState";
import { IEditorToRootRPCHandler, IRootToEditorRPCHandler } from "../types/RPC";
import { RPC, Target } from "@seanchas116/paintkit/src/util/typedRPC";
import { debouncedUpdate } from "@seanchas116/paintkit/src/util/yjs/debouncedUpdate";
import * as Y from "yjs";
import { Node, Document, FileNode } from "@windmix/model";
import { ViewState } from "../types/ViewState";
import { Tool } from "./Tool";
import hotkeys from "hotkeys-js";
import { NodeStyleInspectorTarget } from "./old/NodeStyleInspectorTarget";
import { scrollState } from "./ScrollState";

const vscode = acquireVsCodeApi();

function vscodeParentTarget(): Target {
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

    reaction(
      () => this.tabPath,
      (tabPath) => {
        const state: ViewState = {
          tabPath,
        };
        vscode.setState(state);
      }
    );

    reaction(
      () => this.document.selectedNodes,
      (selecteNodes) => {
        if (selecteNodes.length) {
          this.revealLocation(selecteNodes[0].location);
        }
      }
    );
  }

  readonly document = new Document();
  readonly connection: VSCodeConnection = new VSCodeConnection(this);

  @computed get tabPath(): string | undefined {
    return this.fileNode?.data.get("filePath");
  }

  @computed get fileNode(): FileNode | undefined {
    return this.document.nodes.get("file") as FileNode | undefined;
  }

  revealLocation(location: { line: number; column: number }): void {
    this.connection.rpc.remote.revealLocation(location);
  }
  jumpToLocation(location: { line: number; column: number }): void {
    this.connection.rpc.remote.jumpToLocation(location);
  }

  @observable hover: Node | undefined = undefined;
  @observable tool: Tool | undefined = undefined;
  @observable panMode = false;
  @observable resizeBoxVisible = false;

  // old things

  @computed get styleInspectorTargets(): NodeStyleInspectorTarget[] {
    const targets: NodeStyleInspectorTarget[] = [];
    for (const node of this.document.selectedNodes.values()) {
      if (node.type === "element") {
        targets.push(new NodeStyleInspectorTarget(node));
      }
    }
    return targets;
  }

  readonly styleInspectorState = new StyleInspectorState({
    getTargets: () => this.styleInspectorTargets,
    notifyChange: () => {
      this.styleInspectorTargets.forEach((target) => target.saveChanges());
    },
    notifyChangeEnd: () => {
      // no op
    },
  });
}

export const appState = new AppState();

hotkeys(
  "ctrl+z,command+z",
  action((e) => {
    e.stopPropagation();
    appState.connection.rpc.remote.undo();
  })
);

hotkeys(
  "ctrl+shift+z,command+shift+z",
  action((e) => {
    e.stopPropagation();
    appState.connection.rpc.remote.redo();
  })
);

// zoom in
hotkeys(
  "ctrl+=,command+=",
  action((e) => {
    e.stopPropagation();
    scrollState.zoomIn();
  })
);

// zoom out
hotkeys(
  "ctrl+-,command+-",
  action((e) => {
    e.stopPropagation();
    scrollState.zoomOut();
  })
);

// insert mode
hotkeys(
  "esc",
  action((e) => {
    e.stopPropagation();
    appState.tool = undefined;
  })
);
hotkeys(
  "t",
  action((e) => {
    e.stopPropagation();
    appState.tool = {
      type: "insert",
      insertMode: "text",
    };
  })
);
hotkeys(
  "f,r,b",
  action((e) => {
    e.stopPropagation();
    appState.tool = {
      type: "insert",
      insertMode: "box",
    };
  })
);

hotkeys(
  "backspace,delete",
  action((e) => {
    e.stopPropagation();
    for (const selected of appState.document.selectedNodes) {
      selected.remove();
    }
  })
);

hotkeys(
  "space",
  {
    keydown: true,
    keyup: true,
  },
  action((e) => {
    if (e.type === "keydown") {
      appState.panMode = true;
    } else if (e.type === "keyup") {
      appState.panMode = false;
    }
  })
);

window.addEventListener("beforeunload", () => {
  // VSCode webviews should be reloaded explicitly when the iframe reloads
  // (otherwise the black screen will be shown)
  appState.connection.rpc.remote.reloadWebviews();
});
