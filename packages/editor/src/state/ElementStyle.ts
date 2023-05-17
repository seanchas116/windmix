import { ElementNode } from "@windmix/model";
import { TailwindStyle } from "../models/style/TailwindStyle";
import { artboards } from "./Artboard";

export class ElementStyle extends TailwindStyle {
  private constructor(node: ElementNode) {
    super();
    this.node = node;
  }
  readonly node: ElementNode;

  get className(): string {
    return this.node.className ?? "";
  }

  set className(value: string) {
    this.node.className = value;

    artboards.all.forEach((locator) => {
      locator.setClassName(this.node, value);
    });
  }

  static get(node: ElementNode): ElementStyle {
    let style = styles.get(node);
    if (!style) {
      style = new ElementStyle(node);
      styles.set(node, style);
    }
    return style;
  }
}

const styles = new WeakMap<ElementNode, ElementStyle>();
