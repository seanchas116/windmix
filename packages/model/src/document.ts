import * as Y from "yjs";
import { NodeMap } from "./node";

export class Document {
  constructor(ydoc: Y.Doc = new Y.Doc()) {
    this.ydoc = ydoc;
    this.nodes = new NodeMap(this.nodesData);
  }

  get nodesData(): Y.Map<any> {
    return this.ydoc.getMap("nodes");
  }

  readonly ydoc: Y.Doc;
  readonly nodes: NodeMap;

  clear(): void {
    this.nodesData.clear();
  }
}
