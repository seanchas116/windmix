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
  FileNode,
} from "./index";
import * as Y from "yjs";
import { Document } from "./document";

function generateID() {
  return Math.random().toString(36).slice(2);
}

class IDReuser {
  constructor(idGenerator = generateID) {
    this.idGenerator = idGenerator;
  }

  add(indexPath: string[], type: Node["type"], id: string) {
    this.ids.set([type, ...indexPath].join(":"), id);
  }

  get(indexPath: string[], type: Node["type"]): string | undefined {
    return this.ids.get([type, ...indexPath].join(":"));
  }

  getOrGenerate(indexPath: string[], type: Node["type"]): string {
    return this.get(indexPath, type) ?? this.idGenerator();
  }

  idGenerator: () => string;
  ids = new Map<string, string>();
}

function codeForNode(code: string, node: babel.Node): string {
  return code.slice(node.start ?? 0, node.end ?? 0);
}

function locationForNode(node: babel.Node):
  | {
      line: number;
      column: number;
    }
  | undefined {
  if (!node.loc) {
    return;
  }

  return {
    line: node.loc.start.line - 1, // zero based
    column: node.loc.start.column,
  };
}

function loadElement(
  doc: Document,
  idReuser: IDReuser,
  code: string,
  element: babel.JSXElement | babel.JSXFragment,
  indexPath: string[]
): ElementNode {
  const id = idReuser.getOrGenerate(indexPath, "element");
  const elementNode = doc.nodes.create("element", id);

  if (element.type === "JSXElement") {
    const tagName = codeForNode(code, element.openingElement.name);

    const attributeASTs = element.openingElement.attributes;

    const spaceAfterTagName =
      attributeASTs.length > 0
        ? code.slice(
            element.openingElement.name.end ?? 0,
            attributeASTs[0].start ?? 0
          )
        : code
            .slice(
              element.openingElement.name.end ?? 0,
              element.openingElement.end ?? 0
            )
            .replace(/\/?>/, "");

    const attributes: (Attribute | SpreadAttribute)[] = attributeASTs.map(
      (attr, i) => {
        const trailingSpace =
          i === attributeASTs.length - 1
            ? code
                .slice(attr.end ?? 0, element.openingElement.end ?? 0)
                .replace(/\/?>/, "")
            : code.slice(attr.end ?? 0, attributeASTs[i + 1].start ?? 0);

        if (attr.type === "JSXAttribute") {
          return {
            name: codeForNode(code, attr.name),
            value: attr.value ? codeForNode(code, attr.value) : undefined,
            trailingSpace,
          };
        } else {
          return {
            spread: codeForNode(code, attr),
            trailingSpace,
          };
        }
      }
    );

    elementNode.data.set({
      tagName,
      spaceAfterTagName,
      attributes,
      selfClosing: element.openingElement.selfClosing,
      location: locationForNode(element),
    });
  } else {
    // fragment
    elementNode.data.set({
      tagName: "",
      spaceAfterTagName: "",
      attributes: [],
      selfClosing: false,
      location: locationForNode(element),
    });
  }

  const childNodes: Node[] = [];
  for (const [i, child] of element.children.entries()) {
    childNodes.push(
      loadNode(doc, idReuser, code, child, [...indexPath, String(i)])
    );
  }
  elementNode.append(childNodes);

  return elementNode;
}

function loadNode(
  doc: Document,
  idReuser: IDReuser,
  code: string,
  node: babel.JSXElement["children"][number],
  indexPath: string[]
): TextNode | ElementNode | ExpressionNode | WrappingExpressionNode {
  if (node.type === "JSXText") {
    const textNode = doc.nodes.create(
      "text",
      idReuser.getOrGenerate(indexPath, "text")
    );
    textNode.data.set({
      text: codeForNode(code, node),
      location: locationForNode(node),
    });
    return textNode;
  }
  if (node.type === "JSXElement" || node.type === "JSXFragment") {
    return loadElement(doc, idReuser, code, node, indexPath);
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
    const headerEnd = childElement.start ?? 0;
    const header = code.slice(headerStart, headerEnd);
    const footerStart = childElement.end ?? 0;
    const footerEnd = node.end ?? 0;
    const footer = code.slice(footerStart, footerEnd);

    const id = idReuser.getOrGenerate(indexPath, "wrappingExpression");
    const wrapperNode = doc.nodes.create("wrappingExpression", id);
    wrapperNode.data.set({
      header,
      footer,
      location: locationForNode(node),
    });

    const childNode = loadElement(doc, idReuser, code, childElement, [
      ...indexPath,
      String(0),
    ]);
    wrapperNode.append([childNode]);

    return wrapperNode;
  } else {
    const id = idReuser.getOrGenerate(indexPath, "expression");
    const expressionNode = doc.nodes.create("expression", id);
    expressionNode.data.set({
      code: code.slice(node.start ?? 0, node.end ?? 0),
      location: locationForNode(node),
    });
    return expressionNode;
  }
}

export function loadFile(
  doc: Document,
  filePath: string,
  code: string,
  idGenerator?: () => string
): FileNode {
  const idReuser = new IDReuser(idGenerator);

  const addToIDReuser = (node: Node, indexPath: string[]) => {
    idReuser.add(indexPath, node.type, node.id);
    for (const [index, child] of node.children.entries()) {
      addToIDReuser(child, [...indexPath, String(index)]);
    }
  };

  for (const node of doc.fileNode?.children ?? []) {
    for (const rootNode of node.children) {
      addToIDReuser(rootNode, [node.name]);
    }
  }

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  doc.clear();

  const foundComponents = ast.program.body.flatMap((expr) => {
    const found = findComponentFromStatement(expr);
    return found ? [found] : [];
  });

  const file = doc.nodes.create("file", "file");

  const fileHeaderStart = 0;
  const fileHeaderEnd = foundComponents[0]?.statement.start ?? code.length;
  const fileHeader = code.slice(fileHeaderStart, fileHeaderEnd);
  file.data.set({
    header: fileHeader,
    filePath,
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
    const componentNode = doc.nodes.create("component", "component:" + name);
    const elementNode = loadElement(
      doc,
      idReuser,
      code,
      foundComponent.element,
      [name]
    );
    componentNode.append([elementNode]);

    componentNode.data.set({
      name,
      header: code.slice(headerStart, headerEnd),
      footer: code.slice(footerStart, footerEnd),
      isDefaultExport: foundComponent.isDefaultExport,
      location: locationForNode(foundComponent.statement),
    });

    componentNodes.push(componentNode);
  }

  file.append(componentNodes);

  return file;
}

interface FoundComponent {
  name?: string;
  isDefaultExport: boolean;
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
          isDefaultExport: statement.type === "ExportDefaultDeclaration",
          element: returnValue,
        };
      }
    }
  }
}
