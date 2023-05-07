import { Node } from "@windmix/model";
import { makeObservable, observable } from "mobx";
import { Rect } from "paintvec";
import { domLocator } from "./DOMLocator";

export class NodeDimension {
  constructor(node: Node) {
    this.node = node;
    makeObservable(this);
  }

  readonly node: Node;
  @observable rect: Rect | undefined = undefined;

  update() {
    const dom = domLocator.findDOM(this.node);
    if (dom) {
      this.rect = Rect.from(dom.getBoundingClientRect());
    }
  }
}

const nodeDimensions = new WeakMap<Node, NodeDimension>();

export function getNodeDimension(node: Node): NodeDimension {
  let computation = nodeDimensions.get(node);
  if (!computation) {
    computation = new NodeDimension(node);
    nodeDimensions.set(node, computation);
  }
  return computation;
}

export function updateNodeDimension(node: Node) {
  getNodeDimension(node).update();
}
