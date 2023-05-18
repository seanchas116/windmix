import { ElementNode } from "@windmix/model";
import { Rect } from "paintvec";
import { Artboard, artboards } from "../../../state/Artboard";
import { getElementTailwindStyle } from "../../../state/getElementTailwindStyle";

export async function resizeWithBoundingBox(
  artboard: Artboard,
  element: ElementNode,
  bbox: Rect,
  options: {
    x?: boolean;
    y?: boolean;
    width?: boolean;
    height?: boolean;
    preview?: boolean;
  }
) {
  const parent = element.parent;
  if (parent?.type !== "element") {
    return;
  }

  const parentComputed = await artboard.getMeasure(parent);

  const style = getElementTailwindStyle(element);

  if (options.x) {
    const left = bbox.left - parentComputed.paddingRect.left;
    style.left.arbitraryValue = `${left}px`;
  }
  if (options.y) {
    const top = bbox.top - parentComputed.paddingRect.top;
    style.top.arbitraryValue = `${top}px`;
  }

  if (options.width) {
    style.width.arbitraryValue = `${bbox.width}px`;
  }
  if (options.height) {
    style.height.arbitraryValue = `${bbox.height}px`;
  }

  if (!options.preview) {
    element.className = style.className;
  }
  artboards.setPreviewClassName(element, style.className);
}
