import { ElementNode, Node } from "@windmix/model";
import { appState } from "./AppState";
import { makeObservable, observable, reaction, runInAction } from "mobx";
import { Rect } from "paintvec";
import { RendererAdapter } from "./RendererAdapter";
import { compact } from "lodash-es";
import { Measurement } from "./Measurement";

export class Artboard {
  constructor() {
    makeObservable(this);

    // TODO: use createAtom?
    queueMicrotask(() => {
      reaction(
        () => [appState.hover, appState.document.selectedNodes],
        async () => {
          await this.updateRects();
        }
      );
    });
  }

  adapter = new RendererAdapter(this);

  async findNodes(offsetX: number, offsetY: number): Promise<Node[]> {
    const ids = await this.adapter.findNodeIDs(offsetX, offsetY);
    return compact(ids.map((id) => appState.document.nodes.get(id)));
  }

  async findNode(offsetX: number, offsetY: number): Promise<Node | undefined> {
    return (await this.findNodes(offsetX, offsetY))[0];
  }

  setClassName(node: Node, className: string) {
    this.adapter.setClassName(node, className);
  }

  private measurementsCaches = new WeakMap<ElementNode, MeasurementsCache>();

  private getMeasurementsCache(node: ElementNode): MeasurementsCache {
    let computation = this.measurementsCaches.get(node);
    if (!computation) {
      computation = new MeasurementsCache(node, this);
      this.measurementsCaches.set(node, computation);
    }
    return computation;
  }

  measure(node: ElementNode): Promise<Measurement[]> {
    return this.getMeasurementsCache(node).get();
  }

  @observable hoverRects: Rect[] = [];
  @observable selectedRects: Rect[] = [];

  async updateRects() {
    const hoverDims =
      appState.hover?.type === "element"
        ? await this.getMeasurementsCache(appState.hover).get()
        : [];
    const selectedDims = (
      await Promise.all(
        appState.document.selectedNodes
          .filter((node): node is ElementNode => node.type === "element")
          .map((node) => this.getMeasurementsCache(node).get())
      )
    ).flat();
    runInAction(() => {
      this.hoverRects = hoverDims.map((m) => m.rect);
      this.selectedRects = selectedDims.map((m) => m.rect);
    });
  }
}

class MeasurementsCache {
  constructor(node: ElementNode, artboard: Artboard) {
    this.node = node;
    this.artboard = artboard;
  }

  readonly node: ElementNode;
  readonly artboard: Artboard;
  private _cache: Measurement[] = [];
  private _cacheRevision = 0;

  async get(): Promise<Measurement[]> {
    if (this.artboard.adapter.revision > this._cacheRevision) {
      this._cache = (
        await this.artboard.adapter.getComputedStyles([this.node.id])
      )[0].map((data) => new Measurement(this.node, data));
      this._cacheRevision = this.artboard.adapter.revision;
    }
    return this._cache;
  }
}

export class Artboards {
  readonly desktop = new Artboard();
  readonly mobile = new Artboard();

  get all(): Artboard[] {
    return [this.desktop, this.mobile];
  }
}

export const artboards = new Artboards();
