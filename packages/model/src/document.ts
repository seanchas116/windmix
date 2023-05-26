import * as Y from "yjs";
import { computed, makeObservable } from "mobx";
import {
  ComponentNode,
  ElementNode,
  FileNode,
  Node,
  NodeMap,
  RootNode,
  fileNodeID,
  rootNodeID,
} from "./node";
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

  get rootNode(): RootNode | undefined {
    return this.nodes.get("root") as RootNode | undefined;
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

  get currentFileData(): ObservableYMap<string | undefined> {
    return ObservableYMap.from(this.ydoc.getMap("currentFile"));
  }

  get currentFileID(): string | undefined {
    return this.currentFileData.get("value");
  }

  set currentFileID(value: string | undefined) {
    if (this.currentFileData.get("value") === value) {
      return;
    }
    this.currentFileData.set("value", value);
  }

  get files(): FileNode[] {
    return (this.rootNode?.children ?? []) as FileNode[];
  }

  getFileNode(filePath: string): FileNode {
    return this.nodes.getOrCreate("file", fileNodeID(filePath));
  }

  @computed get currentFile(): FileNode | undefined {
    const node = this.nodes.get(this.currentFileID);
    if (node && node.type === "file") {
      return node;
    }
  }

  get components(): ComponentNode[] {
    return (
      this.currentFile?.children.filter(
        (node): node is ComponentNode => node.type === "component"
      ) ?? []
    );
  }

  get previewComponentID(): string | undefined {
    return this.miscData.get("previewComponent") ?? this.components[0]?.id;
  }

  set previewComponentID(value: string | undefined) {
    if (this.miscData.get("previewComponent") === value) {
      return;
    }
    this.miscData.set("previewComponent", value);
  }

  get previewComponent(): ComponentNode | undefined {
    const component = this.nodes.get(this.previewComponentID);
    if (component && component.type === "component") {
      return component;
    }
  }

  private get currentComponentID(): string | undefined {
    return this.miscData.get("currentComponent") ?? this.components[0]?.id;
  }

  private set currentComponentID(value: string | undefined) {
    if (this.miscData.get("currentComponent") === value) {
      return;
    }
    this.miscData.set("currentComponent", value);
  }

  get currentComponent(): ComponentNode | undefined {
    const component = this.nodes.get(this.currentComponentID);
    if (component && component.type === "component") {
      return component;
    }
  }

  set currentComponent(value: ComponentNode | undefined) {
    if (this.currentComponentID === value?.id) {
      return;
    }
    this.currentComponentID = value?.id;
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

  // warning: call this only once across all clients
  init(): void {
    this.nodes.create("root", rootNodeID);
  }

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
