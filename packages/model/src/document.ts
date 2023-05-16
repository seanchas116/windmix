import * as Y from "yjs";
import { computed, makeObservable } from "mobx";
import { FileNode, Node, NodeMap } from "./node";
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

  readonly ydoc: Y.Doc;
  readonly nodes: NodeMap;

  clear(): void {
    this.nodesData.clear();
  }

  @computed get selectedNodes(): Node[] {
    const idPaths = Array.from(this.selectionData.keys());
    const fileNode = this.fileNode;
    if (!fileNode) return [];

    const nodes: Node[] = [];
    for (const idPath of idPaths) {
      const node = fileNode.getByPath(idPath.split(",").map(Number));
      if (node) nodes.push(node);
    }
    return nodes;
  }

  deselectAll(): void {
    this.selectionData.clear();
  }
}
