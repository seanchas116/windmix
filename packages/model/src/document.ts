import * as Y from "yjs";
import { computed, makeObservable } from "mobx";
import { ComponentNode, ElementNode, FileNode, Node, NodeMap } from "./node";
import { ObservableYMap } from "@seanchas116/paintkit/src/util/yjs/ObservableYMap";

export class Document {
  constructor(ydoc: Y.Doc = new Y.Doc()) {
    this.ydoc = ydoc;
    this.nodes = new NodeMap(this);

    makeObservable(this);
  }

  get fileNode(): FileNode | undefined {
    return this.nodes.get("file") as FileNode | undefined;
  }

  get nodesData(): ObservableYMap<any> {
    return ObservableYMap.from(this.ydoc.getMap("nodes"));
  }

  get selectionData(): ObservableYMap<true> {
    return ObservableYMap.from(this.ydoc.getMap("selection"));
  }

  get miscData(): ObservableYMap<any> {
    return ObservableYMap.from(this.ydoc.getMap("misc"));
  }

  @computed get filePath(): string | undefined {
    return this.fileNode?.data.get("filePath");
  }

  get currentComponentName(): string | undefined {
    return this.miscData.get("currentComponent") as string | undefined;
  }

  set currentComponentName(value: string | undefined) {
    this.miscData.set("currentComponent", value);
  }

  get currentComponent(): ComponentNode | undefined {
    const name = this.currentComponentName;
    if (!name) {
      return;
    }
    const node = this.nodes.get(`component:${name}`);
    if (node?.type !== "component") {
      return;
    }
    return node;
  }

  readonly ydoc: Y.Doc;
  readonly nodes: NodeMap;

  clear(): void {
    this.nodesData.clear();
  }

  @computed get selectedNodes(): Node[] {
    const ids = Array.from(this.selectionData.keys());
    const nodes: Node[] = [];
    for (const id of ids) {
      const node = this.nodes.get(id);
      if (node) nodes.push(node);
    }
    return nodes;
  }

  @computed get selectedElements(): ElementNode[] {
    return this.selectedNodes.filter(
      (node): node is ElementNode => node.type === "element"
    );
  }

  deselectAll(): void {
    this.selectionData.clear();
  }
}
