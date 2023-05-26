import * as Y from "yjs";
import { computed, makeObservable } from "mobx";
import { ComponentNode, ElementNode, FileNode, Node, NodeMap } from "./node";
import { ObservableYMap } from "@seanchas116/paintkit/src/util/yjs/ObservableYMap";
import { ObservableYArray } from "@seanchas116/paintkit/src/util/yjs/ObservableYArray";

export interface LogEntry {
  type: "log" | "info" | "warn" | "error";
  messages: string[];
}

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

  get buildProblems(): ObservableYArray<LogEntry> {
    return ObservableYArray.from(this.ydoc.getArray("buildProblems"));
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

  get previewComponentName(): string {
    return this.miscData.get("previewComponent") ?? "default";
  }

  set previewComponentName(value: string | undefined) {
    this.miscData.set("previewComponent", value);
  }

  private get currentComponentName(): string {
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
    if (this.currentComponentName === value?.name) {
      return;
    }
    this.currentComponentName = value?.name;
  }

  private get hoverID(): string | undefined {
    return this.miscData.get("hover");
  }
  private set hoverID(value: string | undefined) {
    this.miscData.set("hover", value);
  }

  get hoverNode(): Node | undefined {
    return this.nodes.get(this.hoverID);
  }

  set hoverNode(value: Node | undefined) {
    this.hoverID = value?.id;
  }

  // node ID -> className
  get classNamePreviews(): Record<string, string> {
    return this.miscData.get("classNamePreview") ?? {};
  }

  set classNamePreviews(value: Record<string, string>) {
    this.miscData.set("classNamePreview", value);
  }

  readonly ydoc: Y.Doc;
  readonly nodes: NodeMap;

  clear(): void {
    this.ydoc.transact(() => {
      this.nodesData.clear();
      this.selectionData.clear();
      this.miscData.clear();
      this.buildProblems.delete(0, this.buildProblems.length);
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
