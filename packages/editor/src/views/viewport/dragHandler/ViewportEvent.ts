import { Vec2 } from "paintvec";
import { Node } from "@windmix/model";
import { appState } from "../../../state/AppState";
import { assertNonNull } from "@seanchas116/paintkit/src/util/Assert";
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

  while (3 < instance.ancestors.length && !clickables.has(instance)) {
    innerInstance = instance;
    instance = assertNonNull(instance.parent);
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
      all?: readonly Node[]; // nodes at pos (optional)
      clientPos: Vec2; // position in editor
      pos: Vec2; // position in iframe
      mode?: "click" | "doubleClick"; // mode (optional)
    }
  ) {
    return new ViewportEvent(
      artboard,
      options.all ?? (await artboard.findNodes(options.pos.x, options.pos.y)),
      options.clientPos,
      options.pos,
      event,
      options.mode ?? "click"
    );
  }

  constructor(
    artboard: Artboard,
    selectedables: readonly Node[],
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
  readonly selectablesIncludingLocked: readonly Node[];
  readonly selectables: readonly Node[];
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
