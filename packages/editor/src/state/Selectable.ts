import { ElementNode } from "@windmix/model";
import { TailwindStyle } from "../models/style/TailwindStyle";
import { Artboard, artboards } from "./Artboard";

export class NodeTailwindStyle extends TailwindStyle {
  constructor(node: ElementNode) {
    super();
    this.node = node;
  }
  node: ElementNode;

  get className(): string {
    return this.node.className ?? "";
  }

  set className(value: string) {
    this.node.className = value;

    artboards.all.forEach((locator) => {
      locator.setClassName(this.node, value);
    });
  }
}

export class Selectable {
  constructor(artboard: Artboard, node: ElementNode) {
    this.artboard = artboard;
    this.node = node;
    this.style = new NodeTailwindStyle(node);
  }

  readonly artboard: Artboard;
  readonly node: ElementNode;
  readonly style: NodeTailwindStyle;
}
