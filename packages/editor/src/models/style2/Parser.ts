import * as CSS from "csstype";

export type TailwindValue =
  | { type: "arbitrary"; value: string }
  | { type: "keyword"; keyword: string; value: string };

export interface ITailwindParser {
  // className -> value
  parse(className: string): TailwindValue | undefined;
  // value -> className
  stringify(tailwindValue: TailwindValue): string | undefined;
}

// Parses keyword-like tailwind values, e.g. `static` / `relative` / `absolute` / `fixed` / `sticky` for `position`
export class KeywordTailwindParser implements ITailwindParser {
  constructor(
    cssName: keyof CSS.Properties,
    tailwindToCSS: Record<string, string>
  ) {
    this.cssName = cssName;
    this.keywordTailwindToCSS = new Map(Object.entries(tailwindToCSS));
    this.keywordCSSToTailwind = new Map(
      Array.from(this.keywordTailwindToCSS.entries()).map(([key, value]) => [
        value,
        key,
      ])
    );
  }
  readonly cssName: keyof CSS.Properties;
  readonly keywords: [string, string][] = [];

  readonly keywordTailwindToCSS: Map<string, string>;
  readonly keywordCSSToTailwind: Map<string, string>;

  stringify(value: TailwindValue): string | undefined {
    if (value.type !== "keyword") {
      return;
    }
    return this.keywordCSSToTailwind.get(value.type);
  }

  parse(tailwindValue: string): TailwindValue | undefined {
    const value = this.keywordTailwindToCSS.get(tailwindValue);
    if (!value) {
      return;
    }

    return {
      type: "keyword",
      keyword: tailwindValue,
      value,
    };
  }
}
