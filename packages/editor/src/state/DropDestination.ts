import { ElementNode } from "@windmix/model";
import { Rect, Segment } from "paintvec";

export interface DropDestination {
  parent: ElementNode;
  parentRect: Rect;
  ref?: ElementNode;
  insertionLine?: Segment;
}
