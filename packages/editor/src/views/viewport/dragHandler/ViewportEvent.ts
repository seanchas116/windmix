import { Vec2 } from "paintvec";
import { ElementNode, Node } from "@windmix/model";
import { appState } from "../../../state/AppState";
import { Artboard } from "../../../state/Artboard";

function clickableAncestor(
  instanceAtPos: Node,
  type: "click" | "doubleClick"
): Node {
  const clickables = new Set<Node>();

  for (const selected of appState.document.selectedNodes) {
    for (const descendantSelected of selected.ancestors) {
      const siblings = descendantSelected.parent?.children ?? [];
      for (const sibling of siblings) {
        clickables.add(sibling);
      }
    }
  }

  let instance = instanceAtPos;
  let innerInstance = instanceAtPos;

  while (4 < instance.ancestors.length && !clickables.has(instance)) {
    let parent = instance.parent;
    while (parent && !(parent.type === "element" && parent.tagName !== "")) {
      parent = parent.parent;
    }
    if (!parent) {
      break;
    }

    innerInstance = instance;
    instance = parent;
  }

  if (type === "doubleClick") {
    return innerInstance;
  }

  return instance;
}

export class ViewportEvent {
  static async create(
    artboard: Artboard,
    event: MouseEvent | DragEvent,
    options: {
      all?: readonly ElementNode[]; // nodes at pos (optional)
      clientPos?: Vec2; // position in editor
      pos?: Vec2; // position in iframe
      mode?: "click" | "doubleClick"; // mode (optional)
    } = {}
  ) {
    const clientPos =
      options.clientPos ?? new Vec2(event.clientX, event.clientY);
    const pos = options.pos ?? new Vec2(event.offsetX, event.offsetY);

    return new ViewportEvent(
      artboard,
      options.all ?? (await artboard.findNodes(pos.x, pos.y)),
      clientPos,
      pos,
      event,
      options.mode ?? "click"
    );
  }

  constructor(
    artboard: Artboard,
    selectedables: readonly ElementNode[],
    clientPos: Vec2,
    pos: Vec2,
    event: MouseEvent | DragEvent,
    mode: "click" | "doubleClick"
  ) {
    this.artboard = artboard;
    this.selectablesIncludingLocked = selectedables;
    this.selectables = this.selectablesIncludingLocked.filter(
      (s) => !s.ancestorLocked
    );
    this.clientPos = clientPos;
    this.pos = pos;
    this.event = event;
    this.mode = mode;
  }

  readonly artboard: Artboard;
  readonly selectablesIncludingLocked: readonly ElementNode[];
  readonly selectables: readonly ElementNode[];
  readonly clientPos: Vec2;
  readonly pos: Vec2;
  readonly event: MouseEvent | DragEvent;
  readonly mode: "click" | "doubleClick";

  get clickableSelectable(): Node | undefined {
    const instance = this.selectables[0];
    if (instance) {
      return clickableAncestor(instance, "click");
    }
  }

  get doubleClickableSelectable(): Node | undefined {
    const instance = this.selectables[0];
    if (instance) {
      return clickableAncestor(instance, "doubleClick");
    }
  }

  get selectable(): Node | undefined {
    if (this.mode === "doubleClick") {
      return this.doubleClickableSelectable;
    }

    return this.event.metaKey || this.event.ctrlKey
      ? this.deepestSelectable
      : this.clickableSelectable;
  }

  get deepestSelectable(): Node | undefined {
    return this.selectables[0];
  }
}
