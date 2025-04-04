import { ElementNode } from "@windmix/model";
import { Rect } from "paintvec";
import { Artboard } from "../../../state/Artboard";
import { getElementTailwindStyle } from "../../../state/getElementTailwindStyle";
import { appState } from "../../../state/AppState";

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

  const parentComputed = await artboard.getComputation(parent);

  const style = getElementTailwindStyle(element);

  if (options.x) {
    const left = bbox.left - parentComputed.contentRect.left;
    style.left.arbitraryValue = `${left}px`;
  }
  if (options.y) {
    const top = bbox.top - parentComputed.contentRect.top;
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

  appState.document.classNamePreviews = {
    [element.id]: style.className,
  };
}
