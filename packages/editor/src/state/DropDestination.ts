import { ElementNode } from "@windmix/model";
import { Segment } from "paintvec";

export interface DropDestination {
  parent: ElementNode;
  ref?: ElementNode;
  insertionLine?: Segment;
}
