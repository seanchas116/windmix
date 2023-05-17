import { makeObservable, action, computed, observable, reaction } from "mobx";
import { StyleInspectorState } from "./OldStyleInspectorState";
import { Style } from "../models/oldStyle/Style";
import { IEditorToRootRPCHandler, IRootToEditorRPCHandler } from "../types/RPC";
import { RPC, Target } from "@seanchas116/paintkit/src/util/typedRPC";
import { debouncedUpdate } from "@seanchas116/paintkit/src/util/yjs/debouncedUpdate";
import * as Y from "yjs";
import { Node, Document, FileNode, ElementNode } from "@windmix/model";
import { ViewState } from "../types/ViewState";
import { StyleInspectorTarget } from "../models/oldStyle/StyleInspectorTarget";
import { Tool } from "./Tool";
import { ElementStyle } from "./ElementStyle";

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

  revealLocation(location: { line: number; column: number }): void {
    this.connection.rpc.remote.revealLocation(location);
  }
  jumpToLocation(location: { line: number; column: number }): void {
    this.connection.rpc.remote.jumpToLocation(location);
  }

  @computed get tailwindStyles(): ElementStyle[] {
    const targets: ElementStyle[] = [];
    for (const node of this.document.selectedNodes.values()) {
      if (node.type === "element") {
        targets.push(ElementStyle.get(node));
      }
    }
    return targets;
  }

  @observable hover: Node | undefined = undefined;
  @observable tool: Tool | undefined = undefined;
  @observable panMode = false;
  @observable resizeBoxVisible = false;
}

export const appState = new AppState();

class NodeStyleInspectorTarget implements StyleInspectorTarget {
  constructor(element: ElementNode) {
    this.element = element;

    reaction(
      () => element.attributes,
      (attributes) => {
        let className = "";

        for (const attribute of attributes) {
          if (
            "name" in attribute &&
            attribute.name === "className" &&
            attribute.value &&
            attribute.value.startsWith('"')
          ) {
            className = attribute.value.slice(1, -1);
          }
        }
        console.log(className);

        this.style.loadTailwind(className);
      },
      {
        fireImmediately: true,
      }
    );
  }

  readonly element: ElementNode;

  get tagName(): string {
    return this.element.tagName;
  }

  computedStyle = new Style();
  style = new Style();

  saveChanges(): void {
    this.element.attributes = [
      ...this.element.attributes.filter(
        (attribute) => !("name" in attribute && attribute.name === "className")
      ),
      {
        name: "className",
        value: `"${this.style.toTailwind()}"`,
        trailingSpace: "",
      },
    ];
  }
}
