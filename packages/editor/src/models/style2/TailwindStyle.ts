import resolveConfig from "tailwindcss/resolveConfig";
import defaultConfig from "tailwindcss/defaultConfig";
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

  readonly widthParser = new ValueParser("w", widths, /.+/);
  readonly heightParser = new ValueParser("h", heights, /.+/);
  readonly colorParser = new ValueParser("text", colors, /^#/);
  readonly fontSizeParser = new ValueParser(
    "text",
    fontSizes,
    /^[0-9.]+(rem|px|em|ex|ch|vw|vh|vmin|vmax|%)$/
  );
  readonly fontWeightParser = new ValueParser("font", fontWeights, /^[0-9]+$/);

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

  get textAlign(): string | undefined {
    const classNames = this.classNames;

    for (const className of classNames) {
      switch (className) {
        case "text-center":
          return "center";
        case "text-right":
          return "right";
        case "text-left":
          return "left";
        // TODO: justify/start/end
      }
    }
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
