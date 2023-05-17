import { ElementNode } from "@windmix/model";
import { Rect } from "paintvec";
import { Artboard } from "../../../state/Artboard";
import { getElementTailwindStyle } from "../../../state/getElementTailwindStyle";

export async function resizeWithBoundingBox(
  artboard: Artboard,
  element: ElementNode,
  bbox: Rect,
  targets: {
    x?: boolean;
    y?: boolean;
    width?: boolean;
    height?: boolean;
  }
) {
  const parent = element.parent;
  if (parent?.type !== "element") {
    return;
  }

  const parentComputed = await artboard.measureFirst(parent);
  if (!parentComputed) {
    return;
  }

  const style = getElementTailwindStyle(element);

  if (targets.x) {
    const left = bbox.left - parentComputed.paddingRect.left;
    style.left.arbitraryValue = `${left}px`;
  }
  if (targets.y) {
    const top = bbox.top - parentComputed.paddingRect.top;
    style.top.arbitraryValue = `${top}px`;
  }

  if (targets.width) {
    style.width.arbitraryValue = `${bbox.width}px`;
  }
  if (targets.height) {
    style.height.arbitraryValue = `${bbox.height}px`;
  }

  element.className = style.className;
}
