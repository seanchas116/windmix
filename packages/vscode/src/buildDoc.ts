import * as babel from "@babel/types";
import { parse } from "@babel/parser";
import {
  nodeTypes,
  CollaborativeNodeMap,
  Node,
  ElementNode,
  TextNode,
  ExpressionNode,
  WrappingExpressionNode,
  ComponentNode,
  Attribute,
  SpreadAttribute,
} from "@windmix/model";
import * as Y from "yjs";

function codeForNode(code: string, node: babel.Node): string {
  return code.slice(node.start ?? 0, node.end ?? 0);
}

function loadElement(
  nodeMap: CollaborativeNodeMap<typeof nodeTypes>,
  code: string,
  element: babel.JSXElement | babel.JSXFragment,
  indexPath: string[]
): ElementNode {
  const elementNode = nodeMap.create(
    "element",
    "element:" + indexPath.join(":")
  );

  if (element.type === "JSXElement") {
    const tagName = codeForNode(code, element.openingElement.name);
    const attributes: (Attribute | SpreadAttribute)[] =
      element.openingElement.attributes.map((attr) => {
        if (attr.type === "JSXAttribute") {
          return {
            type: "attribute",
            name: codeForNode(code, attr.name),
            value: attr.value ? codeForNode(code, attr.value) : undefined,
          };
        } else {
          return {
            type: "spreadAttribute",
            value: codeForNode(code, attr),
          };
        }
      });

    elementNode.data.set({
      tagName,
      attributes,
    });
  }

  // TODO: attributes

  const childNodes: Node[] = [];
  for (const [i, child] of element.children.entries()) {
    childNodes.push(loadNode(nodeMap, code, child, [...indexPath, String(i)]));
  }
  elementNode.append(childNodes);

  return elementNode;
}

function loadNode(
  nodeMap: CollaborativeNodeMap<typeof nodeTypes>,
  code: string,
  node: babel.JSXElement["children"][number],
  indexPath: string[]
): TextNode | ElementNode | ExpressionNode | WrappingExpressionNode {
  if (node.type === "JSXText") {
    const textNode = nodeMap.create("text", ["text", ...indexPath].join(":"));
    textNode.data.set({ text: node.value });
    return textNode;
  }
  if (node.type === "JSXElement" || node.type === "JSXFragment") {
    return loadElement(nodeMap, code, node, indexPath);
  }

  let childElement: babel.JSXElement | babel.JSXFragment | undefined;
  babel.traverse(node, (innerNode) => {
    if (
      !childElement &&
      (innerNode.type === "JSXElement" || innerNode.type === "JSXFragment")
    ) {
      childElement = innerNode;
    }
  });

  if (childElement) {
    const headerStart = node.start ?? 0;
    const headerEnd = childElement.end ?? 0;
    const header = code.slice(headerStart, headerEnd);
    const footerStart = childElement.end ?? 0;
    const footerEnd = node.end ?? 0;
    const footer = code.slice(footerStart, footerEnd);

    const id = ["wrapper", ...indexPath].join(":");
    const wrapperNode = nodeMap.create("wrappingExpression", id);
    wrapperNode.data.set({
      header,
      footer,
    });

    const childNode = loadElement(nodeMap, code, childElement, [
      ...indexPath,
      String(1),
    ]);
    wrapperNode.append([childNode]);

    return wrapperNode;
  } else {
    const id = ["expression", ...indexPath].join(":");

    const expressionNode = nodeMap.create("expression", id);
    expressionNode.data.set({
      code: code.slice(node.start ?? 0, node.end ?? 0),
    });
    return expressionNode;
  }
}

export function buildDoc(code: string) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
  console.log(ast.program);

  const ydoc = new Y.Doc();
  const nodeMap = new CollaborativeNodeMap(ydoc.getMap("nodes"), nodeTypes);

  const foundComponents = ast.program.body.flatMap((expr) => {
    const found = findComponentFromStatement(expr);
    return found ? [found] : [];
  });

  const file = nodeMap.create("file", "file");

  const fileHeaderStart = 0;
  const fileHeaderEnd = foundComponents[0]?.statement.start ?? code.length;
  const fileHeader = code.slice(fileHeaderStart, fileHeaderEnd);
  file.data.set({
    header: fileHeader,
  });

  const componentNodes: ComponentNode[] = [];

  for (let i = 0; i < foundComponents.length; ++i) {
    const foundComponent = foundComponents[i];
    const nextComponent: FoundComponent | undefined = foundComponents[i + 1];

    const headerStart = foundComponent.statement.start ?? 0;
    const headerEnd = foundComponent.element.start ?? 0;
    const footerStart = foundComponent.element.end ?? 0;
    const footerEnd = nextComponent?.statement.start ?? code.length;

    const name = foundComponent.name ?? "default";
    const componentNode = nodeMap.create("component", "component:" + name);
    const elementNode = loadElement(nodeMap, code, foundComponent.element, [
      name,
    ]);
    componentNode.append([elementNode]);

    componentNode.data.set({
      name,
      header: code.slice(headerStart, headerEnd),
      footer: code.slice(footerStart, footerEnd),
    });

    componentNodes.push(componentNode);
  }

  file.append(componentNodes);

  console.log(ydoc.getMap("nodes").toJSON());

  return file;
}

interface FoundComponent {
  name?: string;
  statement: babel.ExportDefaultDeclaration | babel.ExportNamedDeclaration;
  element: babel.JSXElement;
}

// TODO: support component declarations with arrow functions
function findComponentFromStatement(
  statement: babel.Statement
): FoundComponent | undefined {
  if (
    statement.type !== "ExportDefaultDeclaration" &&
    statement.type !== "ExportNamedDeclaration"
  ) {
    return;
  }

  const declaration = statement.declaration;
  if (declaration?.type !== "FunctionDeclaration") {
    return;
  }

  const name = declaration.id?.name;
  for (const bodyStatement of declaration.body.body) {
    if (bodyStatement.type === "ReturnStatement") {
      const returnStatement = bodyStatement;
      const returnValue = returnStatement.argument;
      if (returnValue?.type === "JSXElement") {
        return {
          statement,
          name,
          element: returnValue,
        };
      }
    }
  }
}
