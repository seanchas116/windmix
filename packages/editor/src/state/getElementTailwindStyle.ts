import { ElementNode } from "@windmix/model";
import { TailwindStyle } from "../models/style/TailwindStyle";

export function getElementTailwindStyle(element: ElementNode): TailwindStyle {
  const className = element.className;
  return new TailwindStyle(typeof className === "string" ? className : "");
}
