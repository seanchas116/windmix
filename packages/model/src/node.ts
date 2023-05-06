import {
  CollaborativeNode,
  CollaborativeNodeMap,
} from "@seanchas116/paintkit/src/util/collaborativeNode/CollaborativeNode";
import * as Y from "yjs";

export { CollaborativeNode, CollaborativeNodeMap };

interface StringifyOptions {
  id?: boolean;
}

export class FileNode extends CollaborativeNode<
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

export class ComponentNode extends CollaborativeNode<
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
}
export interface SpreadAttribute {
  spread: string; // stringified value of JSXSpreadAttribute (`{...foo}`)
}

// JSXElement
export class ElementNode extends CollaborativeNode<
  typeof nodeTypes,
  { tagName: string; attributes: (Attribute | SpreadAttribute)[] }
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

  stringify(options: StringifyOptions = {}): string {
    const attributes = this.attributes.map((attr) => {
      if ("spread" in attr) {
        return attr.spread;
      } else if (attr.value) {
        return `${attr.name}=${attr.value}`;
      } else {
        return attr.name;
      }
    });
    if (options.id) {
      attributes.push(`data-windmixid="${this.id}"`);
    }

    const children = this.children;
    if (children.length === 0) {
      return `<${this.tagName} ${attributes.join(" ")} />`;
    }

    return `<${this.tagName} ${attributes.join(" ")}>${children
      .map((child) => child.stringify(options))
      .join("")}</${this.tagName}>`;
  }
}

// JSXText
export class TextNode extends CollaborativeNode<
  typeof nodeTypes,
  { text: string }
> {
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
export class WrappingExpressionNode extends CollaborativeNode<
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
export class ExpressionNode extends CollaborativeNode<
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
  constructor(nodes: Y.Map<any>) {
    super(nodes, nodeTypes);
  }
}
