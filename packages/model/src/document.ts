import * as Y from "yjs";
import { computed, makeObservable } from "mobx";
import { Node, NodeMap } from "./node";
import { ObservableYMap } from "@seanchas116/paintkit/src/util/yjs/ObservableYMap";

export class Document {
  constructor(ydoc: Y.Doc = new Y.Doc()) {
    this.ydoc = ydoc;
    this.nodes = new NodeMap(this);
    makeObservable(this);
  }

  get nodesData(): Y.Map<any> {
    return this.ydoc.getMap("nodes");
  }

  get selectionData(): ObservableYMap<true> {
    return ObservableYMap.get(this.ydoc.getMap("selection"));
  }

  readonly ydoc: Y.Doc;
  readonly nodes: NodeMap;

  clear(): void {
    this.nodesData.clear();
  }

  @computed get selectedNodes(): Node[] {
    const ids = Array.from(this.selectionData.keys());
    return ids.map((id) => this.nodes.get(id)).filter(Boolean) as Node[];
  }
}
