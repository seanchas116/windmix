import { reaction } from "mobx";
import { Style } from "../../models/oldStyle/Style";
import { ElementNode } from "@windmix/model";
import { StyleInspectorTarget } from "../../models/oldStyle/StyleInspectorTarget";

export class NodeStyleInspectorTarget implements StyleInspectorTarget {
  constructor(element: ElementNode) {
    this.element = element;

    reaction(
      () => element.attributes,
      (attributes) => {
        let className = "";

        for (const attribute of attributes) {
          if (
            "name" in attribute &&
            attribute.name === "className" &&
            attribute.value &&
            attribute.value.startsWith('"')
          ) {
            className = attribute.value.slice(1, -1);
          }
        }
        console.log(className);

        this.style.loadTailwind(className);
      },
      {
        fireImmediately: true,
      }
    );
  }

  readonly element: ElementNode;

  get tagName(): string {
    return this.element.tagName;
  }

  computedStyle = new Style();
  style = new Style();

  saveChanges(): void {
    this.element.attributes = [
      ...this.element.attributes.filter(
        (attribute) => !("name" in attribute && attribute.name === "className")
      ),
      {
        name: "className",
        value: `"${this.style.toTailwind()}"`,
        trailingSpace: "",
      },
    ];
  }
}
