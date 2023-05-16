import {
  CollaborativeNode,
  CollaborativeNodeMap,
} from "@seanchas116/paintkit/src/util/collaborativeNode/CollaborativeNode";
import { computed, makeObservable } from "mobx";
import { Document } from "./document";

export { CollaborativeNode, CollaborativeNodeMap };

interface StringifyOptions {
  id?: boolean;
}

interface Location {
  line: number;
  column: number;
}

export abstract class BaseNode<
  NodeTypes extends Record<
    string,
    {
      new (
        nodeMap: CollaborativeNodeMap<NodeTypes>,
        id: string
      ): CollaborativeNode<NodeTypes, any>;
    }
  >,
  ExtraNodeData
> extends CollaborativeNode<
  NodeTypes,
  ExtraNodeData & {
    location: Location;
  }
> {
  constructor(nodes: CollaborativeNodeMap<NodeTypes>, id: string) {
    super(nodes, id);
    makeObservable(this);
  }

  get document() {
    return (this.nodeMap as CollaborativeNodeMap<any> as NodeMap).document;
  }

  get location(): Location {
    return this.data.get("location") ?? { line: 1, column: 0 };
  }

  @computed private get _selected(): boolean {
    return this.document.selectionData.has(this.indexPath.join(","));
  }

  private set _selected(value: boolean) {
    if (this._selected === value) {
      return;
    }
    if (value) {
      this.document.selectionData.set(this.indexPath.join(","), true);
    } else {
      this.document.selectionData.delete(this.indexPath.join(","));
    }
  }

  @computed get selected(): boolean {
    return this._selected;
  }

  select(): void {
    this._selected = true;
    for (const child of this.children as this[]) {
      child.deselect();
    }
  }

  deselect(): void {
    this._selected = false;
    for (const child of this.children as this[]) {
      child.deselect();
    }
  }

  get locked(): boolean {
    // TODO
    return false;
  }

  get ancestorLocked(): boolean {
    // TODO
    return false;
  }
}

export class FileNode extends BaseNode<
  typeof nodeTypes,
  {
    filePath: string; // path in project (e.g. `/src/components/MyComponent.tsx`)
    header: string; // header code (e.g. `import React from "react";`)
  }
> {
  get type(): "file" {
    return "file";
  }

  get filePath(): string {
    return this.data.get("filePath") ?? "";
  }
  get header(): string {
    return this.data.get("header") ?? "";
  }

  stringify(options: StringifyOptions = {}): string {
    return (
      this.header +
      this.children.map((child) => child.stringify(options)).join("")
    );
  }
}

export class ComponentNode extends BaseNode<
  typeof nodeTypes,
  {
    header: string; // header code of component (e.g. `function MyComponent() { return `)
    footer: string; // footer code of component (e.g. `; }`)
  }
> {
  get type(): "component" {
    return "component";
  }

  get header(): string {
    return this.data.get("header") ?? "";
  }
  get footer(): string {
    return this.data.get("footer") ?? "";
  }

  stringify(options: StringifyOptions = {}): string {
    return (
      this.header +
      this.children.map((child) => child.stringify(options)).join("") +
      this.footer
    );
  }
}

export interface Attribute {
  name: string;
  value?: string; // stringified value of StringLiteral or JSXExpressionContainer (`"foo"` or `{foo}`)
  trailingSpace: string; // trailing code (spaces, newlines, etc.)
}
export interface SpreadAttribute {
  spread: string; // stringified value of JSXSpreadAttribute (`{...foo}`)
  trailingSpace: string;
}

// JSXElement
export class ElementNode extends BaseNode<
  typeof nodeTypes,
  {
    tagName: string;
    spaceAfterTagName: string;
    attributes: (Attribute | SpreadAttribute)[];
    selfClosing: boolean;
  }
> {
  get type(): "element" {
    return "element";
  }

  get tagName(): string {
    return this.data.get("tagName") ?? "";
  }
  set tagName(tagName: string) {
    this.data.set({ tagName });
  }

  get attributes(): (Attribute | SpreadAttribute)[] {
    return this.data.get("attributes") ?? [];
  }
  set attributes(attributes: (Attribute | SpreadAttribute)[]) {
    this.data.set({ attributes });
  }

  get className(): string | undefined {
    for (const attribute of this.attributes) {
      if (
        "name" in attribute &&
        attribute.name === "className" &&
        attribute.value &&
        attribute.value.startsWith('"')
      ) {
        return attribute.value.slice(1, -1);
      }
    }
  }

  set className(className: string | undefined) {
    if (className === this.className) {
      return;
    }

    // TODO: preserve order of attributes

    const otherAttrs = this.attributes.filter(
      (attribute) => !("name" in attribute && attribute.name === "className")
    );

    if (className === undefined) {
      this.attributes = otherAttrs;
      return;
    } else {
      this.attributes = [
        ...otherAttrs,
        {
          name: "className",
          value: `"${className}"`,
          trailingSpace: "",
        },
      ];
    }
  }

  get spaceAfterTagName(): string {
    return this.data.get("spaceAfterTagName") ?? " ";
  }
  get selfClosing(): boolean {
    return this.data.get("selfClosing") ?? false;
  }

  stringify(options: StringifyOptions = {}): string {
    const attributes = this.attributes.map((attr) => {
      if ("spread" in attr) {
        return attr.spread + attr.trailingSpace;
      } else if (attr.value) {
        return `${attr.name}=${attr.value}${attr.trailingSpace}`;
      } else {
        return attr.name + attr.trailingSpace;
      }
    });
    if (options.id && this.tagName) {
      attributes.push(` data-windmixid="${this.id}"`);
    }

    const children = this.children;
    if (children.length === 0 && this.selfClosing) {
      return `<${this.tagName}${this.spaceAfterTagName}${attributes.join(
        ""
      )}/>`;
    }

    return `<${this.tagName}${this.spaceAfterTagName}${attributes.join(
      ""
    )}>${children.map((child) => child.stringify(options)).join("")}</${
      this.tagName
    }>`;
  }
}

// JSXText
export class TextNode extends BaseNode<typeof nodeTypes, { text: string }> {
  get type(): "text" {
    return "text";
  }

  get text(): string {
    return this.data.get("text") ?? "";
  }
  set text(text: string) {
    this.data.set({ text });
  }

  stringify(): string {
    // TODO: escape?
    return this.text;
  }
}

// JSXExpressionContainer containing an element (e.g. `{users.map(user => (<div>{user.name}</div>))}`)
export class WrappingExpressionNode extends BaseNode<
  typeof nodeTypes,
  {
    header: string; // header code of expression (e.g. `{users.map(user => (`)
    footer: string; // footer code of expression (e.g. `)}`)
  }
> {
  get type(): "wrappingExpression" {
    return "wrappingExpression";
  }

  get header(): string {
    return this.data.get("header") ?? "";
  }
  get footer(): string {
    return this.data.get("footer") ?? "";
  }

  stringify(options: StringifyOptions = {}): string {
    return (
      this.header +
      this.children.map((child) => child.stringify(options)).join("") +
      this.footer
    );
  }
}

// JSXExpressionContainer without an element (e.g. `{users.map(user => user.name)}`)
export class ExpressionNode extends BaseNode<
  typeof nodeTypes,
  { code: string }
> {
  get type(): "expression" {
    return "expression";
  }

  get code(): string {
    return this.data.get("code") ?? "";
  }

  stringify(): string {
    return this.code;
  }
}

export const nodeTypes = {
  file: FileNode,
  component: ComponentNode,
  element: ElementNode,
  text: TextNode,
  wrappingExpression: WrappingExpressionNode,
  expression: ExpressionNode,
};

export type Node = InstanceType<(typeof nodeTypes)[keyof typeof nodeTypes]>;

export class NodeMap extends CollaborativeNodeMap<typeof nodeTypes> {
  constructor(document: Document) {
    super(document.nodesData, nodeTypes);
    this.document = document;
  }

  readonly document: Document;
}
