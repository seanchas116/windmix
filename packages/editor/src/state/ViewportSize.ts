import { computed, makeObservable, observable } from "mobx";
import colors from "tailwindcss/colors";

export const breakpoints = [
  {
    minWidth: 640,
    color: colors.red[400],
  },
  {
    minWidth: 1024,
    color: colors.green[400],
  },
];

export class ViewportSize {
  constructor() {
    makeObservable(this);
  }

  @observable manualWidth: number | "auto" = 360;
  @observable availableWidth = 0;

  @computed get width(): number {
    return this.manualWidth === "auto" ? this.availableWidth : this.manualWidth;
  }

  @computed get scale(): number {
    return this.manualWidth === "auto"
      ? 1
      : Math.min(1, this.availableWidth / this.manualWidth);
  }

  @computed get breakpointIndex(): number {
    return breakpoints.findIndex((b) => b.minWidth > this.width);
  }
}
