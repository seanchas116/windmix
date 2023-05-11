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
const colors = new Map(flattenColorNames(tailwindConfig.theme?.colors ?? {}));

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

  get width(): string | undefined {
    return this.classNames.find((className) => className.startsWith("w-"));
  }

  get height(): string | undefined {
    return this.classNames.find((className) => className.startsWith("h-"));
  }

  get color(): TailwindValue | undefined {
    const textClasses = this.classNames.filter((className) =>
      className.startsWith("text-")
    );

    for (const textClass of textClasses) {
      const name = textClass.slice("text-".length);

      // token color
      const color = colors.get(name);
      if (color) {
        return {
          type: "keyword",
          keyword: name,
          value: color,
        };
      }

      // arbitrary color
      if (name.startsWith("[#") && name.endsWith("]")) {
        return {
          type: "arbitrary",
          value: name.slice(2, -1),
        };
      }
    }
  }
}
