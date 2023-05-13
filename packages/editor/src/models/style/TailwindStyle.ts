import resolveConfig from "tailwindcss/resolveConfig";
import defaultConfig from "tailwindcss/defaultConfig";
import { MIXED, sameOrMixed } from "@seanchas116/paintkit/src/util/Mixed";
const tailwindConfig = resolveConfig(defaultConfig); // TODO: support custom config

interface NestedColors {
  [key: string]: string | NestedColors;
}

function flattenColorNames(colors: NestedColors): [string, string][] {
  const result: [string, string][] = [];
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === "string") {
      result.push([key, value]);
    } else {
      result.push(
        ...flattenColorNames(value).map((c): [string, string] => [
          `${key}-${c[0]}`,
          c[1],
        ])
      );
    }
  }
  return result;
}

export const margins = new Map(
  Object.entries(tailwindConfig.theme?.margin ?? {})
);
export const paddings = new Map(
  Object.entries(tailwindConfig.theme?.padding ?? {})
);

export const widths = new Map(
  Object.entries(tailwindConfig.theme?.width ?? {})
);
export const heights = new Map(
  Object.entries(tailwindConfig.theme?.width ?? {})
);
export const colors = new Map(
  flattenColorNames(tailwindConfig.theme?.colors ?? {})
);
export const fontSizes = new Map(
  Object.entries(tailwindConfig.theme?.fontSize ?? {}).map(([key, value]) => [
    key,
    value[0],
  ])
);
export const fontWeights = new Map(
  Object.entries(tailwindConfig.theme?.fontWeight ?? {})
);

export type TailwindValue =
  | { type: "arbitrary"; value: string }
  | { type: "keyword"; keyword: string };
export type ResolvedTailwindValue =
  | { type: "arbitrary"; value: string }
  | { type: "keyword"; keyword: string; value: string };

function stringifyTailwindValue(value: TailwindValue): string {
  switch (value.type) {
    case "arbitrary":
      return `[${value.value}]`;
    case "keyword":
      return value.keyword;
  }
}

export abstract class TailwindStyle {
  abstract className: string;

  get classNames(): string[] {
    return this.className.trim().split(/\s+/);
  }

  set classNames(classNames: string[]) {
    this.className = classNames.join(" ");
  }

  readonly marginParser = new ValueParser("m", margins, /.+/);
  readonly marginXParser = new ValueParser("mx", margins, /.+/);
  readonly marginYParser = new ValueParser("my", margins, /.+/);
  readonly marginTopParser = new ValueParser("mt", margins, /.+/);
  readonly marginRightParser = new ValueParser("mr", margins, /.+/);
  readonly marginBottomParser = new ValueParser("mb", margins, /.+/);
  readonly marginLeftParser = new ValueParser("ml", margins, /.+/);

  readonly paddingParser = new ValueParser("p", paddings, /.+/);
  readonly paddingXParser = new ValueParser("px", paddings, /.+/);
  readonly paddingYParser = new ValueParser("py", paddings, /.+/);
  readonly paddingTopParser = new ValueParser("pt", paddings, /.+/);
  readonly paddingRightParser = new ValueParser("pr", paddings, /.+/);
  readonly paddingBottomParser = new ValueParser("pb", paddings, /.+/);
  readonly paddingLeftParser = new ValueParser("pl", paddings, /.+/);

  readonly widthParser = new ValueParser("w", widths, /.+/);
  readonly heightParser = new ValueParser("h", heights, /.+/);
  readonly colorParser = new ValueParser("text", colors, /^#/);
  readonly fontSizeParser = new ValueParser(
    "text",
    fontSizes,
    /^[0-9.]+(rem|px|em|ex|ch|vw|vh|vmin|vmax|%)$/
  );
  readonly fontWeightParser = new ValueParser("font", fontWeights, /^[0-9]+$/);
  readonly textAlignParser = new ValueParser(
    "text",
    new Map([
      ["left", "left"],
      ["center", "center"],
      ["right", "right"],
    ]),
    false
  );

  get padding(): ResolvedTailwindValue | undefined {
    return this.paddingParser.getValue(this.classNames)?.value;
  }
  set padding(padding: TailwindValue | undefined) {
    this.classNames = this.paddingParser.setValue(this.classNames, padding);
  }
  get paddingX(): ResolvedTailwindValue | undefined {
    return this.paddingXParser.getValue(this.classNames)?.value ?? this.padding;
  }
  set paddingX(paddingX: TailwindValue | undefined) {
    this.classNames = this.paddingXParser.setValue(this.classNames, paddingX);
  }
  get paddingY(): ResolvedTailwindValue | undefined {
    return this.paddingYParser.getValue(this.classNames)?.value ?? this.padding;
  }
  set paddingY(paddingY: TailwindValue | undefined) {
    this.classNames = this.paddingYParser.setValue(this.classNames, paddingY);
  }

  get margin(): ResolvedTailwindValue | undefined {
    return this.marginParser.getValue(this.classNames)?.value;
  }
  set margin(margin: TailwindValue | undefined) {
    this.classNames = this.marginParser.setValue(this.classNames, margin);
  }

  get marginX(): ResolvedTailwindValue | undefined {
    return this.marginXParser.getValue(this.classNames)?.value ?? this.margin;
  }
  set marginX(marginX: TailwindValue | undefined) {
    this.classNames = this.marginXParser.setValue(this.classNames, marginX);
  }

  get marginY(): ResolvedTailwindValue | undefined {
    return this.marginYParser.getValue(this.classNames)?.value ?? this.margin;
  }
  set marginY(marginY: TailwindValue | undefined) {
    this.classNames = this.marginYParser.setValue(this.classNames, marginY);
  }

  get marginTop(): ResolvedTailwindValue | undefined {
    return (
      this.marginTopParser.getValue(this.classNames)?.value ?? this.marginY
    );
  }
  set marginTop(marginTop: TailwindValue | undefined) {
    this.classNames = this.marginTopParser.setValue(this.classNames, marginTop);
  }
  get marginRight(): ResolvedTailwindValue | undefined {
    return (
      this.marginRightParser.getValue(this.classNames)?.value ?? this.marginX
    );
  }
  set marginRight(marginRight: TailwindValue | undefined) {
    this.classNames = this.marginRightParser.setValue(
      this.classNames,
      marginRight
    );
  }
  get marginBottom(): ResolvedTailwindValue | undefined {
    return (
      this.marginBottomParser.getValue(this.classNames)?.value ?? this.marginY
    );
  }
  set marginBottom(marginBottom: TailwindValue | undefined) {
    this.classNames = this.marginBottomParser.setValue(
      this.classNames,
      marginBottom
    );
  }
  get marginLeft(): ResolvedTailwindValue | undefined {
    return (
      this.marginLeftParser.getValue(this.classNames)?.value ?? this.marginX
    );
  }
  set marginLeft(marginLeft: TailwindValue | undefined) {
    this.classNames = this.marginLeftParser.setValue(
      this.classNames,
      marginLeft
    );
  }

  get mixedMarginX(): ResolvedTailwindValue | typeof MIXED | undefined {
    return sameOrMixed([this.marginLeft, this.marginRight]);
  }
  set mixedMarginX(marginX: TailwindValue | typeof MIXED | undefined) {
    if (marginX === MIXED) {
      return;
    }
    this.marginLeft = marginX;
    this.marginRight = marginX;
  }

  get mixedMarginY(): ResolvedTailwindValue | typeof MIXED | undefined {
    return sameOrMixed([this.marginTop, this.marginBottom]);
  }
  set mixedMarginY(marginY: TailwindValue | typeof MIXED | undefined) {
    if (marginY === MIXED) {
      return;
    }
    this.marginTop = marginY;
    this.marginBottom = marginY;
  }

  get mixedMargin(): ResolvedTailwindValue | typeof MIXED | undefined {
    return sameOrMixed([
      this.marginTop,
      this.marginRight,
      this.marginBottom,
      this.marginLeft,
    ]);
  }
  set mixedMargin(margin: TailwindValue | typeof MIXED | undefined) {
    if (margin === MIXED) {
      return;
    }
    this.marginTop = margin;
    this.marginRight = margin;
    this.marginBottom = margin;
    this.marginLeft = margin;
  }

  get width(): ResolvedTailwindValue | undefined {
    return this.widthParser.getValue(this.classNames)?.value;
  }
  set width(width: TailwindValue | undefined) {
    this.classNames = this.widthParser.setValue(this.classNames, width);
  }

  get height(): ResolvedTailwindValue | undefined {
    return this.heightParser.getValue(this.classNames)?.value;
  }
  set height(height: TailwindValue | undefined) {
    this.classNames = this.heightParser.setValue(this.classNames, height);
  }

  get color(): ResolvedTailwindValue | undefined {
    return this.colorParser.getValue(this.classNames)?.value;
  }

  set color(color: TailwindValue | undefined) {
    this.classNames = this.colorParser.setValue(this.classNames, color);
  }

  get fontSize(): ResolvedTailwindValue | undefined {
    return this.fontSizeParser.getValue(this.classNames)?.value;
  }

  set fontSize(fontSize: TailwindValue | undefined) {
    this.classNames = this.fontSizeParser.setValue(this.classNames, fontSize);
  }

  get fontWeight(): ResolvedTailwindValue | undefined {
    return this.fontWeightParser.getValue(this.classNames)?.value;
  }

  set fontWeight(fontWeight: TailwindValue | undefined) {
    this.classNames = this.fontWeightParser.setValue(
      this.classNames,
      fontWeight
    );
  }

  get textAlign(): ResolvedTailwindValue | undefined {
    return this.textAlignParser.getValue(this.classNames)?.value;
  }
  set textAlign(textAlign: TailwindValue | undefined) {
    this.classNames = this.textAlignParser.setValue(this.classNames, textAlign);
  }
}

class ValueParser {
  constructor(
    prefix: string, // "w", "h", 'text' etc
    tokens: Map<string, string>, // { "1/2": "50%" } etc
    arbitraryValuePattern: RegExp | false // /^#/ for text colors etc or false (no arbitrary values)
  ) {
    this.prefix = prefix;
    this.tokens = tokens;
    this.arbitraryValuePattern = arbitraryValuePattern;
  }

  prefix: string;
  tokens: Map<string, string>;
  arbitraryValuePattern: RegExp | false;

  getValue(
    classNames: string[]
  ): { className: string; value: ResolvedTailwindValue } | undefined {
    const { prefix, tokens, arbitraryValuePattern } = this;

    const matchedClassNames = classNames
      .filter((className) => className.startsWith(`${prefix}-`))
      .reverse();

    for (const className of matchedClassNames) {
      const keyword = className?.slice(prefix.length + 1);
      if (
        arbitraryValuePattern &&
        keyword.startsWith("[") &&
        keyword.endsWith("]")
      ) {
        const value = keyword.slice(1, -1);
        if (!arbitraryValuePattern.test(value)) {
          continue;
        }
        return {
          className,
          value: {
            type: "arbitrary",
            value,
          },
        };
      }
      const value = tokens.get(keyword);

      if (value) {
        return {
          className,
          value: {
            type: "keyword",
            keyword,
            value,
          },
        };
      }
    }
  }

  setValue(classNames: string[], value: TailwindValue | undefined): string[] {
    const { prefix } = this;
    const existing = this.getValue(classNames)?.className;

    if (value) {
      const className = prefix + "-" + stringifyTailwindValue(value);
      const index = existing ? classNames.indexOf(existing) : -1;

      const newClassNames = [...classNames];
      if (index !== -1) {
        newClassNames[index] = className;
      } else {
        newClassNames.push(className);
      }
      return newClassNames;
    } else {
      return classNames.filter((className) => className !== existing);
    }
  }
}
