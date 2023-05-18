import { ElementNode } from "@windmix/model";
import { Rect } from "paintvec";

export interface ComputedStyle {
  position: string;
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

export interface ComputationData {
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: ComputedStyle;
}

export class Computation {
  constructor(node: ElementNode, data?: ComputationData) {
    this.node = node;
    this.rect = data?.rect ? Rect.from(data.rect) : new Rect();
    this.style = data?.style ?? {
      position: "static",
      display: "block",
      flexDirection: "row",
      marginTop: "0px",
      marginRight: "0px",
      marginBottom: "0px",
      marginLeft: "0px",
      borderTopWidth: "0px",
      borderRightWidth: "0px",
      borderBottomWidth: "0px",
      borderLeftWidth: "0px",
      paddingTop: "0px",
      paddingRight: "0px",
      paddingBottom: "0px",
      paddingLeft: "0px",
    };
    this.bt = parseFloat(this.style.borderTopWidth);
    this.br = parseFloat(this.style.borderRightWidth);
    this.bb = parseFloat(this.style.borderBottomWidth);
    this.bl = parseFloat(this.style.borderLeftWidth);
    this.pt = parseFloat(this.style.paddingTop);
    this.pr = parseFloat(this.style.paddingRight);
    this.pb = parseFloat(this.style.paddingBottom);
    this.pl = parseFloat(this.style.paddingLeft);
    this.mt = parseFloat(this.style.marginTop);
    this.mr = parseFloat(this.style.marginRight);
    this.mb = parseFloat(this.style.marginBottom);
    this.ml = parseFloat(this.style.marginLeft);
  }

  readonly node: ElementNode;
  readonly rect: Rect;
  readonly style: ComputedStyle;

  readonly bt: number;
  readonly br: number;
  readonly bb: number;
  readonly bl: number;
  readonly pt: number;
  readonly pr: number;
  readonly pb: number;
  readonly pl: number;
  readonly mt: number;
  readonly mr: number;
  readonly mb: number;
  readonly ml: number;

  get contentRect(): Rect {
    const left = this.rect.left + this.bl + this.pl;
    const top = this.rect.top + this.bt + this.pt;
    const width = this.rect.width - this.bl - this.br - this.pl - this.pr;
    const height = this.rect.height - this.bt - this.bb - this.pt - this.pb;

    return Rect.from({
      x: left,
      y: top,
      width,
      height,
    });
  }

  get paddingRect(): Rect {
    const left = this.rect.left + this.bl;
    const top = this.rect.top + this.bt;
    const width = this.rect.width - this.bl - this.br;
    const height = this.rect.height - this.bt - this.bb;

    return Rect.from({
      x: left,
      y: top,
      width,
      height,
    });
  }

  get marginRect(): Rect {
    const left = this.rect.left - this.ml;
    const top = this.rect.top - this.mt;
    const width = this.rect.width + this.ml + this.mr;
    const height = this.rect.height + this.mt + this.mb;

    return Rect.from({
      x: left,
      y: top,
      width,
      height,
    });
  }
}
