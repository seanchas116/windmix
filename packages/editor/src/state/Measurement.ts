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
}
