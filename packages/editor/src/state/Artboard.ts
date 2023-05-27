import { ElementNode, Node } from "@windmix/model";
import { appState } from "./AppState";
import {
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { Rect } from "paintvec";
import { RendererAdapter } from "./RendererAdapter";
import { Computation } from "./Computation";
import { Snapper } from "./Snapper";
import { DropDestination } from "./DropDestination";
import { ViewportSize } from "./ViewportSize";

export class Artboard {
  constructor() {
    makeObservable(this);

    // TODO: use createAtom?
    queueMicrotask(() => {
      reaction(
        () => [appState.document.hoverNode, appState.document.selectedNodes],
        async () => {
          await this.updateRects();
        }
      );
      reaction(
        () => appState.document.classNamePreviews,
        (previews) => {
          // TODO: bulk update
          for (const [id, className] of Object.entries(previews)) {
            this.adapter.setPreviewClassName(id, className);
          }
        }
      );
    });
  }

  adapter = new RendererAdapter(this);

  async findNodes(offsetX: number, offsetY: number): Promise<ElementNode[]> {
    const ids = await this.adapter.findNodeIDs(offsetX, offsetY);

    const result: ElementNode[] = [];
    for (const id of ids) {
      const node = appState.document.nodes.get(id);
      if (node && node.type === "element") {
        result.push(node);
      }
    }

    return result;
  }

  async findNode(offsetX: number, offsetY: number): Promise<Node | undefined> {
    return (await this.findNodes(offsetX, offsetY))[0];
  }

  private computationCaches = new WeakMap<ElementNode, ComputationCache>();

  private getComputationCache(node: ElementNode): ComputationCache {
    let computation = this.computationCaches.get(node);
    if (!computation) {
      computation = new ComputationCache(node, this);
      this.computationCaches.set(node, computation);
    }
    return computation;
  }

  getComputations(node: ElementNode): Promise<Computation[]> {
    return this.getComputationCache(node).get();
  }

  getComputation(node: ElementNode): Promise<Computation> {
    return this.getComputations(node).then(
      (cs) => cs[0] ?? new Computation(node)
    );
  }

  getRect(node: ElementNode): Promise<Rect> {
    return this.getComputation(node).then((c) => c.rect);
  }

  @observable hoverComputations: Computation[] = [];
  @observable selectedComputations: Computation[] = [];
  @observable.ref dragPreviewRects: Rect[] = [];
  @observable dropDestination: DropDestination | undefined = undefined;

  readonly viewportSize = new ViewportSize();

  @computed get height() {
    return this.adapter.windowBodyHeight;
  }

  async updateRects() {
    const hover = appState.document.hoverNode;
    const selection = appState.document.selectedNodes;

    const hoverComputations =
      hover?.type === "element"
        ? await this.getComputationCache(hover).get()
        : [];
    const selectedComputations = (
      await Promise.all(
        selection
          .filter((node): node is ElementNode => node.type === "element")
          .map((node) => this.getComputationCache(node).get())
      )
    ).flat();
    runInAction(() => {
      this.hoverComputations = hoverComputations;
      this.selectedComputations = selectedComputations;
    });
  }

  readonly snapper = new Snapper(this);
}

class ComputationCache {
  constructor(node: ElementNode, artboard: Artboard) {
    this.node = node;
    this.artboard = artboard;
  }

  readonly node: ElementNode;
  readonly artboard: Artboard;
  private _cache: Computation[] = [];
  private _cacheRevision = 0;

  async get(): Promise<Computation[]> {
    if (this.artboard.adapter.revision > this._cacheRevision) {
      this._cache = (
        await this.artboard.adapter.getComputedStyles([this.node.id])
      )[0].map((data) => new Computation(this.node, data));
      this._cacheRevision = this.artboard.adapter.revision;
    }
    return this._cache;
  }
}

export class Artboards {
  readonly desktop = new Artboard();
  //readonly mobile = new Artboard();

  get all(): Artboard[] {
    return [this.desktop];
  }
}

export const artboards = new Artboards();
