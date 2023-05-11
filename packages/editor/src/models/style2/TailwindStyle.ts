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

  get width(): string | undefined {
    // Get tailwind w-* class
    return this.className
      .split(" ")
      .find((className) => className.startsWith("w-"));
  }

  get height(): string | undefined {
    // Get tailwind w-* class
    return this.className
      .split(" ")
      .find((className) => className.startsWith("h-"));
  }

  get text(): string | undefined {
    // Get tailwind text-* class
    return this.className
      .split(" ")
      .find((className) => className.startsWith("text-"));
  }
}
