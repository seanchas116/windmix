import { ElementNode } from "@windmix/model";
import { Rect } from "paintvec";

export interface ComputedStyle {
  display: string;
  flexDirection: string;

  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;

  borderTopWidth: string;
  borderRightWidth: string;
  borderBottomWidth: string;
  borderLeftWidth: string;

  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
}

export interface MeasurementData {
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: ComputedStyle;
}

export class Measurement {
  constructor(node: ElementNode, data: MeasurementData) {
    this.node = node;
    this.rect = Rect.from(data.rect);
    this.style = data.style;
  }

  node: ElementNode;
  rect: Rect;
  style: ComputedStyle;

  get paddingRect(): Rect {
    const bt = parseFloat(this.style.borderTopWidth);
    const br = parseFloat(this.style.borderRightWidth);
    const bb = parseFloat(this.style.borderBottomWidth);
    const bl = parseFloat(this.style.borderLeftWidth);
    const pt = parseFloat(this.style.paddingTop);
    const pr = parseFloat(this.style.paddingRight);
    const pb = parseFloat(this.style.paddingBottom);
    const pl = parseFloat(this.style.paddingLeft);

    const left = this.rect.left + bl + pl;
    const top = this.rect.top + bt + pt;
    const width = this.rect.width - bl - br - pl - pr;
    const height = this.rect.height - bt - bb - pt - pb;

    return Rect.from({
      x: left,
      y: top,
      width,
      height,
    });
  }
}
