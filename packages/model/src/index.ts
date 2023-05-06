import {
  CollaborativeNode,
  CollaborativeNodeMap,
} from "@seanchas116/paintkit/src/util/collaborativeNode/CollaborativeNode";
import * as Y from "yjs";

export { CollaborativeNode, CollaborativeNodeMap };

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
}

// JSXExpressionContainer without an element (e.g. `{users.map(user => user.name)}`)
export class ExpressionNode extends CollaborativeNode<
  typeof nodeTypes,
  { code: string }
> {
  get type(): "expression" {
    return "expression";
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
