import { ElementNode } from "@windmix/model";
import { Rect } from "paintvec";
import { Artboard } from "../../../state/Artboard";
import { ElementStyle } from "../../../state/ElementStyle";

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

  const parentComputed = (await artboard.measure(parent))[0];
  if (!parentComputed) {
    return;
  }

  const style = ElementStyle.get(element);

  if (targets.x) {
    const left = bbox.left - parentComputed.paddingRect.left;
    style.props.left.arbitraryValue = `${left}px`;
  }
  if (targets.y) {
    const top = bbox.top - parentComputed.paddingRect.top;
    style.props.top.arbitraryValue = `${top}px`;
  }

  if (targets.width) {
    style.props.width.arbitraryValue = `${bbox.width}px`;
  }
  if (targets.height) {
    style.props.height.arbitraryValue = `${bbox.height}px`;
  }
}
