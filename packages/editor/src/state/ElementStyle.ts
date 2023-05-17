import { EXPRESSION, ElementNode } from "@windmix/model";
import { TailwindStyle } from "../models/style/TailwindStyle";
import { artboards } from "./Artboard";

export class ElementStyle extends TailwindStyle {
  private constructor(node: ElementNode) {
    super();
    this.node = node;
  }
  readonly node: ElementNode;

  get className(): string {
    const className = this.node.className;
    if (typeof className === "string") {
      return className;
    }
    return "";
  }

  set className(value: string) {
    if (this.node.className === EXPRESSION) {
      throw new Error("Cannot set className on an expression");
    }

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
