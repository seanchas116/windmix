import resolveConfig from "tailwindcss/resolveConfig";
import defaultConfig from "tailwindcss/defaultConfig";
import { twMerge } from "tailwind-merge";
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

  get width(): TailwindValue | undefined {
    return this.getValue("w", widths)?.value;
  }

  set width(width: TailwindValue | undefined) {
    this.setValue("w", widths, undefined, width);
  }

  get height(): TailwindValue | undefined {
    return this.getValue("h", heights)?.value;
  }

  set height(height: TailwindValue | undefined) {
    this.setValue("h", heights, undefined, height);
  }

  get color(): TailwindValue | undefined {
    return this.getValue("text", colors, /^#/)?.value;
  }

  set color(color: TailwindValue | undefined) {
    this.setValue("text", colors, /^#/, color);
  }

  get fontSize(): TailwindValue | undefined {
    return this.getValue(
      "text",
      fontSizes,
      /^[0-9.]+(rem|px|em|ex|ch|vw|vh|vmin|vmax|%)$/
    )?.value;
  }

  set fontSize(fontSize: TailwindValue | undefined) {
    this.setValue(
      "text",
      fontSizes,
      /^[0-9.]+(rem|px|em|ex|ch|vw|vh|vmin|vmax|%)$/,
      fontSize
    );
  }

  get fontWeight(): TailwindValue | undefined {
    return this.getValue("font", fontWeights, /^[0-9]+$/)?.value;
  }

  set fontWeight(fontWeight: TailwindValue | undefined) {
    this.setValue("font", fontWeights, /^[0-9]+$/, fontWeight);
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

  private getValue(
    prefix: string, // "w", "h", 'text' etc
    tokens: Map<string, string>, // { "1/2": "50%" } etc
    arbitraryValuePattern?: RegExp // /^#/ for text colors etc
  ): { className: string; value: TailwindValue } | undefined {
    const classNames = this.classNames
      .filter((className) => className.startsWith(`${prefix}-`))
      .reverse();

    for (const className of classNames) {
      const keyword = className?.slice(prefix.length + 1);
      if (keyword.startsWith("[") && keyword.endsWith("]")) {
        const value = keyword.slice(1, -1);
        if (arbitraryValuePattern && !arbitraryValuePattern.test(value)) {
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

  private setValue(
    prefix: string, // "w", "h", 'text' etc
    tokens: Map<string, string>, // { "1/2": "50%" } etc
    arbitraryValuePattern: RegExp | undefined, // /^#/ for text colors etc,
    value: TailwindValue | undefined
  ) {
    const existing = this.getValue(
      prefix,
      tokens,
      arbitraryValuePattern
    )?.className;

    if (value) {
      const className = prefix + "-" + stringifyTailwindValue(value);
      const classNames = this.classNames;
      const index = existing ? classNames.indexOf(existing) : -1;
      if (index !== -1) {
        classNames[index] = className;
      } else {
        classNames.push(className);
      }
      this.className = classNames.join(" ");
    } else {
      this.className = this.classNames
        .filter((className) => className !== existing)
        .join(" ");
    }
  }
}
