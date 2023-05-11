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
  | { type: "keyword"; keyword: string; value: string };

export interface ClassNameAccess {
  get(): string;
  set(value: string): void;
}

export class TailwindStyle {
  constructor(classNameAccess: ClassNameAccess) {
    this.classNameAccess = classNameAccess;
  }

  private readonly classNameAccess: ClassNameAccess;

  get className(): string {
    return this.classNameAccess.get();
  }

  set className(value: string) {
    this.classNameAccess.set(value);
  }

  get classNames(): string[] {
    return this.className.trim().split(/\s+/);
  }

  get width(): TailwindValue | undefined {
    return this.getValue("w", widths);
  }

  get height(): TailwindValue | undefined {
    return this.getValue("h", heights);
  }

  get color(): TailwindValue | undefined {
    return this.getValue("text", colors, /^#/);
  }

  get fontSize(): TailwindValue | undefined {
    return this.getValue(
      "text",
      fontSizes,
      /^[0-9.]+(rem|px|em|ex|ch|vw|vh|vmin|vmax|%)$/
    );
  }

  get fontWeight(): TailwindValue | undefined {
    return this.getValue("font", fontWeights, /^[0-9]+$/);
  }

  private getValue(
    prefix: string, // "w", "h", 'text' etc
    tokens: Map<string, string>, // { "1/2": "50%" } etc
    arbitraryValuePattern?: RegExp // /^#/ for text colors etc
  ): TailwindValue | undefined {
    const classNames = this.classNames
      .filter((className) => className.startsWith(`${prefix}-`))
      .reverse();

    for (const className of classNames) {
      const keyword = className?.slice(prefix.length + 1);
      if (keyword.startsWith("[") && keyword.endsWith("]")) {
        if (arbitraryValuePattern && !arbitraryValuePattern.test(keyword)) {
          continue;
        }
        return {
          type: "arbitrary",
          value: keyword.slice(1, -1),
        };
      }
      const value = tokens.get(keyword);

      if (value) {
        return {
          type: "keyword",
          keyword,
          value,
        };
      }
    }
  }
}
