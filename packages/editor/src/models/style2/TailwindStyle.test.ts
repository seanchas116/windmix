import { describe, expect, it } from "vitest";
import { TailwindStyle } from "./TailwindStyle";

const className = "w-1/2 h-1/2 text-red-500 text-xl text-center";

class SimpleTailwindStyle extends TailwindStyle {
  constructor(className: string) {
    super();
    this.className = className;
  }

  className: string;
}

describe(TailwindStyle.name, () => {
  describe("width", () => {
    it("gets width", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      expect(style.width).toEqual({
        type: "keyword",
        keyword: "1/2",
        value: "50%",
      });
    });
    it("gets arbitrary width", () => {
      const style = new SimpleTailwindStyle(
        "w-[200px] h-1/2 text-red-500 text-xl text-center"
      );
      expect(style.width).toEqual({
        type: "arbitrary",
        value: "200px",
      });
    });
  });
  describe("height", () => {
    it("gets height", () => {
      const style = new SimpleTailwindStyle(
        "w-2/3 h-1/2 text-red-500 text-xl text-center"
      );
      expect(style.height).toEqual({
        type: "keyword",
        keyword: "1/2",
        value: "50%",
      });
    });
    it("gets arbitrary height", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-[300px] text-red-500 text-xl text-center"
      );
      expect(style.height).toEqual({
        type: "arbitrary",
        value: "300px",
      });
    });
  });
});
