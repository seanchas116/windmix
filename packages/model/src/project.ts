import * as Y from "yjs";
import { computed, makeObservable } from "mobx";
import { ObservableYMap } from "@seanchas116/paintkit/src/util/yjs/ObservableYMap";
import { Document, DocumentData } from "./document";

export class Project {
  constructor(ydoc: Y.Doc = new Y.Doc()) {
    this.ydoc = ydoc;

    const documentsData = this.ydoc.getMap<any>("documents");
    this.documentsData = ObservableYMap.from(documentsData);
    this.stateData = ObservableYMap.from(this.ydoc.getMap("state"));

    documentsData.observe((event) => {
      for (const [key, change] of event.keys) {
        if (change.action === "delete" || change.action === "update") {
          this.documents.delete(key);
        }
        if (change.action === "add" || change.action === "update") {
          const value = documentsData.get(key);
          this.documents.set(key, new Document(key, new DocumentData(value)));
        }
      }
    });

    makeObservable(this);
  }

  readonly ydoc: Y.Doc;
  readonly documentsData: ObservableYMap<any>;
  readonly stateData: ObservableYMap<any>;

  @computed get currentDocumentPath(): string | undefined {
    return this.stateData.get("currentDocumentPath");
  }

  set currentDocumentPath(value: string | undefined) {
    if (this.stateData.get("currentDocumentPath") === value) {
      return;
    }
    this.stateData.set("currentDocumentPath", value);
  }

  readonly documents: Map<string, Document> = new Map();

  getDocument(path: string): Document {
    if (!this.documentsData.has(path)) {
      this.documentsData.set(path, new DocumentData());
    }
    return this.documents.get(path)!;
  }
}
