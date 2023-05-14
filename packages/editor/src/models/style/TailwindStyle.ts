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
export const maxWidths = new Map(
  Object.entries(tailwindConfig.theme?.maxWidth ?? {})
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
export const backgroundColors = new Map(
  flattenColorNames(tailwindConfig.theme?.backgroundColor ?? {})
);
export const ringColors = new Map(
  flattenColorNames(tailwindConfig.theme?.ringColor ?? {})
);
export const ringWidths = new Map(
  Object.entries(tailwindConfig.theme?.ringWidth ?? {})
);
export const radiuses = new Map(
  Object.entries(tailwindConfig.theme?.borderRadius ?? {})
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

  readonly props = {
    position: new Property(
      this,
      new ValueParser(
        "",
        new Map([
          ["static", "static"],
          ["relative", "relative"],
          ["absolute", "absolute"],
        ]),
        false
      )
    ),

    margin: new Property(this, new ValueParser("m-", margins, /.+/)),
    marginX: new Property(
      this,
      new ValueParser("mx-", margins, /.+/),
      (): Property => this.props.margin
    ),
    marginY: new Property(
      this,
      new ValueParser("my-", margins, /.+/),
      (): Property => this.props.margin
    ),

    marginLeft: new Property(
      this,
      new ValueParser("ml-", margins, /.+/),
      (): Property => this.props.marginX
    ),
    marginRight: new Property(
      this,
      new ValueParser("mr-", margins, /.+/),
      (): Property => this.props.marginX
    ),
    marginTop: new Property(
      this,
      new ValueParser("mt-", margins, /.+/),
      (): Property => this.props.marginY
    ),
    marginBottom: new Property(
      this,
      new ValueParser("mb-", margins, /.+/),
      (): Property => this.props.marginY
    ),

    padding: new Property(this, new ValueParser("p-", paddings, /.+/)),
    paddingX: new Property(
      this,
      new ValueParser("px-", paddings, /.+/),
      (): Property => this.props.padding
    ),
    paddingY: new Property(
      this,
      new ValueParser("py-", paddings, /.+/),
      (): Property => this.props.padding
    ),
    paddingLeft: new Property(
      this,
      new ValueParser("pl-", paddings, /.+/),
      (): Property => this.props.paddingX
    ),
    paddingRight: new Property(
      this,
      new ValueParser("pr-", paddings, /.+/),
      (): Property => this.props.paddingX
    ),
    paddingTop: new Property(
      this,
      new ValueParser("pt-", paddings, /.+/),
      (): Property => this.props.paddingY
    ),
    paddingBottom: new Property(
      this,
      new ValueParser("pb-", paddings, /.+/),
      (): Property => this.props.paddingY
    ),

    width: new Property(this, new ValueParser("w-", widths, /.+/)),
    height: new Property(this, new ValueParser("h-", heights, /.+/)),
    maxWidth: new Property(this, new ValueParser("max-w-", maxWidths, /.+/)),
    radius: new Property(this, new ValueParser("rounded-", radiuses, /.+/)),

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

    background: new Property(
      this,
      new ValueParser("bg-", backgroundColors, /.+/)
    ),

    ringColor: new Property(this, new ValueParser("ring-", colors, /^#/)),
    ringWidth: new Property(
      this,
      new ValueParser(
        "ring-",
        ringWidths,
        /^[0-9.]+(rem|px|em|ex|ch|vw|vh|vmin|vmax|%)$/
      )
    ),

    mixedMarginX: new ShorthandProperty((): Property[] => [
      this.props.marginLeft,
      this.props.marginRight,
    ]),
    mixedMarginY: new ShorthandProperty((): Property[] => [
      this.props.marginTop,
      this.props.marginBottom,
    ]),
    mixedMargin: new ShorthandProperty((): Property[] => [
      this.props.marginLeft,
      this.props.marginRight,
      this.props.marginTop,
      this.props.marginBottom,
    ]),
    mixedPaddingX: new ShorthandProperty((): Property[] => [
      this.props.paddingLeft,
      this.props.paddingRight,
    ]),
    mixedPaddingY: new ShorthandProperty((): Property[] => [
      this.props.paddingTop,
      this.props.paddingBottom,
    ]),
    mixedPadding: new ShorthandProperty((): Property[] => [
      this.props.paddingLeft,
      this.props.paddingRight,
      this.props.paddingTop,
      this.props.paddingBottom,
    ]),
  };
}

class Property {
  constructor(
    style: TailwindStyle,
    parser: ValueParser,
    shorthand?: () => Property
  ) {
    this.style = style;
    this.parser = parser;
    this.shorthand = shorthand;
  }

  readonly style: TailwindStyle;
  readonly parser: ValueParser;
  readonly shorthand?: () => Property;

  get value(): ResolvedTailwindValue | undefined {
    return (
      this.parser.getValue(this.style.classNames)?.value ??
      this.shorthand?.()?.value
    );
  }

  set value(value: TailwindValue | undefined) {
    this.style.classNames = this.parser.setValue(this.style.classNames, value);
  }
}

class ShorthandProperty {
  constructor(separateProps: () => Property[]) {
    this.separateProps = separateProps;
  }

  readonly separateProps: () => Property[];

  get value(): ResolvedTailwindValue | typeof MIXED | undefined {
    return sameOrMixed(this.separateProps().map((access) => access.value));
  }

  set value(value: TailwindValue | typeof MIXED | undefined) {
    if (value === MIXED) {
      return;
    }
    // TODO: unset separate values and set shorthand value

    for (const access of this.separateProps()) {
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

    // "rounded" for "rounded-" prefix
    const defaultTokenValue = tokens.get("DEFAULT");
    if (defaultTokenValue) {
      const matched = classNames.find(
        (className) => className === prefix.slice(0, -1) // "rounded"
      );
      if (matched) {
        return {
          className: matched,
          value: {
            type: "keyword",
            keyword: "DEFAULT",
            value: defaultTokenValue,
          },
        };
      }
    }

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
      const className =
        value.type === "keyword" && value.keyword === "DEFAULT"
          ? prefix.slice(0, -1)
          : prefix + stringifyTailwindValue(value);

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
