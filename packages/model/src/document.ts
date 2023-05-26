import * as Y from "yjs";
import { computed, makeObservable } from "mobx";
import { ComponentNode, ElementNode, FileNode, Node, NodeMap } from "./node";
import { ObservableYMap } from "@seanchas116/paintkit/src/util/yjs/ObservableYMap";
import { ObservableYArray } from "@seanchas116/paintkit/src/util/yjs/ObservableYArray";
import { assertNonNull } from "@seanchas116/paintkit/src/util/Assert";
import { Project } from "./project";

export interface LogEntry {
  type: "log" | "info" | "warn" | "error";
  messages: string[];
}

export class DocumentData {
  constructor(ymap?: Y.Map<any>) {
    if (ymap) {
      this.nodes = ymap.get("nodes");
      this.selection = ymap.get("selection");
      this.misc = ymap.get("misc");
      this.buildProblems = ymap.get("buildProblems");
    } else {
      this.nodes = new Y.Map();
      this.selection = new Y.Map();
      this.misc = new Y.Map();
      this.buildProblems = new Y.Array();
    }
  }

  nodes: Y.Map<any>;
  selection: Y.Map<true>;
  misc: Y.Map<any>;
  buildProblems: Y.Array<LogEntry>;
}

export class Document {
  constructor(project: Project, filePath: string, data: DocumentData) {
    this.project = project;
    this.filePath = filePath;
    this.data = data;
    this.nodes = new NodeMap(this);
    makeObservable(this);
  }

  readonly project: Project;
  readonly filePath: string;
  readonly data: DocumentData;

  get fileNode(): FileNode | undefined {
    return this.nodes.get("file") as FileNode | undefined;
  }

  get nodesData(): ObservableYMap<any> {
    return ObservableYMap.from(this.data.nodes);
  }

  get selectionData(): ObservableYMap<true> {
    return ObservableYMap.from(this.data.selection);
  }

  get miscData(): ObservableYMap<any> {
    return ObservableYMap.from(this.data.misc);
  }

  get buildProblems(): ObservableYArray<LogEntry> {
    return ObservableYArray.from(this.data.buildProblems);
  }

  get components(): ComponentNode[] {
    return (
      this.fileNode?.children.filter(
        (node): node is ComponentNode => node.type === "component"
      ) ?? []
    );
  }

  get previewComponentName(): string {
    return (
      this.miscData.get("previewComponent") ??
      this.components[0]?.name ??
      "default"
    );
  }

  set previewComponentName(value: string | undefined) {
    if (this.miscData.get("previewComponent") === value) {
      return;
    }
    this.miscData.set("previewComponent", value);
  }

  private get currentComponentName(): string {
    return (
      this.miscData.get("currentComponent") ??
      this.components[0]?.name ??
      "default"
    );
  }

  private set currentComponentName(value: string | undefined) {
    if (this.miscData.get("currentComponent") === value) {
      return;
    }
    this.miscData.set("currentComponent", value);
  }

  get currentComponent(): ComponentNode | undefined {
    const name = this.currentComponentName;
    return this.components.find((component) => component.name === name);
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

  readonly nodes: NodeMap;

  get ydoc(): Y.Doc {
    return assertNonNull(this.data.nodes.doc);
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
