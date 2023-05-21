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

  get components(): ComponentNode[] {
    return (
      this.fileNode?.children.filter(
        (node): node is ComponentNode => node.type === "component"
      ) ?? []
    );
  }

  private get currentComponentName(): string | undefined {
    return this.miscData.get("currentComponent") ?? "default";
  }

  private set currentComponentName(value: string | undefined) {
    this.miscData.set("currentComponent", value);
  }

  get currentComponent(): ComponentNode | undefined {
    const components = this.components;
    if (components.length === 0) {
      return;
    }
    if (components.length === 1) {
      return components[0];
    }

    const name = this.currentComponentName;
    return (
      components.find((component) => component.name === name) ?? components[0]
    );
  }

  set currentComponent(value: ComponentNode | undefined) {
    this.currentComponentName = value?.name;
  }

  readonly ydoc: Y.Doc;
  readonly nodes: NodeMap;

  clear(): void {
    this.ydoc.transact(() => {
      this.nodesData.clear();
      this.selectionData.clear();
      this.miscData.clear();
    });
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
