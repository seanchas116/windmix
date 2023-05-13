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

  readonly separateProps = {
    margin: new Property(this, new ValueParser("m-", margins, /.+/)),
    marginX: new Property(this, new ValueParser("mx-", margins, /.+/)),
    marginY: new Property(this, new ValueParser("my-", margins, /.+/)),
    marginTop: new Property(this, new ValueParser("mt-", margins, /.+/)),
    marginRight: new Property(this, new ValueParser("mr-", margins, /.+/)),
    marginBottom: new Property(this, new ValueParser("mb-", margins, /.+/)),
    marginLeft: new Property(this, new ValueParser("ml-", margins, /.+/)),

    padding: new Property(this, new ValueParser("p-", paddings, /.+/)),
    paddingX: new Property(this, new ValueParser("px-", paddings, /.+/)),
    paddingY: new Property(this, new ValueParser("py-", paddings, /.+/)),
    paddingTop: new Property(this, new ValueParser("pt-", paddings, /.+/)),
    paddingRight: new Property(this, new ValueParser("pr-", paddings, /.+/)),
    paddingBottom: new Property(this, new ValueParser("pb-", paddings, /.+/)),
    paddingLeft: new Property(this, new ValueParser("pl-", paddings, /.+/)),

    width: new Property(this, new ValueParser("w-", widths, /.+/)),
    height: new Property(this, new ValueParser("h-", heights, /.+/)),
    color: new Property(this, new ValueParser("text-", colors, /^#/)),
    fontSize: new Property(
      this,
      new ValueParser(
        "text-",
        fontSizes,
        /^[0-9.]+(rem|px|em|ex|ch|vw|vh|vmin|vmax|%)$/
      )
    ),
    fontWeight: new Property(
      this,
      new ValueParser("font-", fontWeights, /^[0-9]+$/)
    ),
    textAlign: new Property(
      this,
      new ValueParser(
        "text-",
        new Map([
          ["left", "left"],
          ["center", "center"],
          ["right", "right"],
        ]),
        false
      )
    ),
  };

  readonly props = {
    ...this.separateProps,
    mixedMarginX: new ShorthandProperty([
      this.separateProps.marginLeft,
      this.separateProps.marginRight,
    ]),
    mixedMarginY: new ShorthandProperty([
      this.separateProps.marginTop,
      this.separateProps.marginBottom,
    ]),
    mixedMargin: new ShorthandProperty([
      this.separateProps.marginLeft,
      this.separateProps.marginRight,
      this.separateProps.marginTop,
      this.separateProps.marginBottom,
    ]),
    mixedPaddingX: new ShorthandProperty([
      this.separateProps.paddingLeft,
      this.separateProps.paddingRight,
    ]),
    mixedPaddingY: new ShorthandProperty([
      this.separateProps.paddingTop,
      this.separateProps.paddingBottom,
    ]),
    mixedPadding: new ShorthandProperty([
      this.separateProps.paddingLeft,
      this.separateProps.paddingRight,
      this.separateProps.paddingTop,
      this.separateProps.paddingBottom,
    ]),
  };
}

class Property {
  constructor(style: TailwindStyle, parser: ValueParser) {
    this.style = style;
    this.parser = parser;
  }

  readonly style: TailwindStyle;
  readonly parser: ValueParser;

  get value(): ResolvedTailwindValue | undefined {
    return this.parser.getValue(this.style.classNames)?.value;
  }

  set value(value: TailwindValue | undefined) {
    this.style.classNames = this.parser.setValue(this.style.classNames, value);
  }
}

class ShorthandProperty {
  constructor(separate: Property[]) {
    this.separate = separate;
  }

  readonly separate: Property[];

  get value(): ResolvedTailwindValue | typeof MIXED | undefined {
    return sameOrMixed(this.separate.map((access) => access.value));
  }

  set value(value: TailwindValue | typeof MIXED | undefined) {
    if (value === MIXED) {
      return;
    }
    // TODO: unset separate values and set shorthand value

    for (const access of this.separate) {
      access.value = value;
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
      .filter((className) => className.startsWith(prefix))
      .reverse();

    for (const className of matchedClassNames) {
      const keyword = className?.slice(prefix.length);
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
      const className = prefix + stringifyTailwindValue(value);
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
