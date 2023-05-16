import { Vec2 } from "paintvec";
import { Node } from "@windmix/model";
import { appState } from "../../../state/AppState";
import { assertNonNull } from "@seanchas116/paintkit/src/util/Assert";

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
  constructor(
    event: MouseEvent | DragEvent,
    options: {
      all?: readonly Node[];
      clientPos?: Vec2;
      pos?: Vec2;
      mode?: "click" | "doubleClick";
    } = {}
  ) {
    const clientPos =
      options.clientPos ?? new Vec2(event.clientX, event.clientY);

    this.selectablesIncludingLocked =
      options.all ?? nodePicker.instancesFromPoint(clientPos.x, clientPos.y);
    this.selectables = this.selectablesIncludingLocked.filter(
      (s) => !s.ancestorLocked
    );

    this.clientPos = clientPos;
    this.pos =
      options.pos ?? projectState.scroll.documentPosForClientPos(clientPos);
    this.event = event;
    this.mode = options.mode ?? "click";
  }

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
