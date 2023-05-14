import { describe, expect, it } from "vitest";
import { TailwindStyle } from "./TailwindStyle";

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
      expect(style.props.width.value).toEqual({
        type: "keyword",
        keyword: "1/2",
        value: "50%",
      });
    });
    it("gets arbitrary width", () => {
      const style = new SimpleTailwindStyle(
        "w-[200px] h-1/2 text-red-500 text-xl text-center"
      );
      expect(style.props.width.value).toEqual({
        type: "arbitrary",
        value: "200px",
      });
    });
    it("sets width", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      style.props.width.value = {
        type: "keyword",
        keyword: "4",
      };
      expect(style.className).toEqual(
        "w-4 h-1/2 text-red-500 text-xl text-center"
      );
    });
  });
  describe("height", () => {
    it("gets height", () => {
      const style = new SimpleTailwindStyle(
        "w-2/3 h-1/2 text-red-500 text-xl text-center"
      );
      expect(style.props.height.value).toEqual({
        type: "keyword",
        keyword: "1/2",
        value: "50%",
      });
    });
    it("gets arbitrary height", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-[300px] text-red-500 text-xl text-center"
      );
      expect(style.props.height.value).toEqual({
        type: "arbitrary",
        value: "300px",
      });
    });
    it("sets height", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      style.props.height.value = {
        type: "keyword",
        keyword: "4",
      };
      expect(style.className).toEqual(
        "w-1/2 h-4 text-red-500 text-xl text-center"
      );
    });
    it("removes height", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      style.props.height.value = undefined;
      expect(style.className).toEqual("w-1/2 text-red-500 text-xl text-center");
    });
  });

  describe("color", () => {
    it("gets color", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      expect(style.props.color.value).toEqual({
        type: "keyword",
        keyword: "red-500",
        value: "#ef4444",
      });
    });
    it("gets arbitrary color", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-[#f56565] text-xl text-center"
      );
      expect(style.props.color.value).toEqual({
        type: "arbitrary",
        value: "#f56565",
      });
    });
    it("sets color", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      style.props.color.value = {
        type: "keyword",
        keyword: "green-500",
      };
      expect(style.className).toEqual(
        "w-1/2 h-1/2 text-green-500 text-xl text-center"
      );
    });
    it("removes color", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      style.props.color.value = undefined;
      expect(style.className).toEqual("w-1/2 h-1/2 text-xl text-center");
    });
  });

  describe("fontSize", () => {
    it("gets fontSize", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      expect(style.props.fontSize.value).toEqual({
        type: "keyword",
        keyword: "xl",
        value: "1.25rem",
      });
    });
    it("gets arbitrary fontSize", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-[2rem] text-center"
      );
      expect(style.props.fontSize.value).toEqual({
        type: "arbitrary",
        value: "2rem",
      });
    });
    it("sets fontSize", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      style.props.fontSize.value = {
        type: "keyword",
        keyword: "2xl",
      };
      expect(style.className).toEqual(
        "w-1/2 h-1/2 text-red-500 text-2xl text-center"
      );
    });
    it("removes fontSize", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      style.props.fontSize.value = undefined;
      expect(style.className).toEqual("w-1/2 h-1/2 text-red-500 text-center");
    });
  });

  describe("textAlign", () => {
    it("gets textAlign", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      expect(style.props.textAlign.value).toEqual({
        type: "keyword",
        keyword: "center",
        value: "center",
      });
    });
    it("sets textAlign", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      style.props.textAlign.value = {
        type: "keyword",
        keyword: "left",
      };
      expect(style.className).toEqual(
        "w-1/2 h-1/2 text-red-500 text-xl text-left"
      );
    });
    it("removes textAlign", () => {
      const style = new SimpleTailwindStyle(
        "w-1/2 h-1/2 text-red-500 text-xl text-center"
      );
      style.props.textAlign.value = undefined;
      expect(style.className).toEqual("w-1/2 h-1/2 text-red-500 text-xl");
    });
  });

  describe("radius", () => {
    it("gets radius", () => {
      const style = new SimpleTailwindStyle("w-1/2 rounded-2xl text-center");
      expect(style.props.radius.value).toEqual({
        type: "keyword",
        keyword: "2xl",
        value: "1rem",
      });
    });
    it("gets default radius", () => {
      const style = new SimpleTailwindStyle("w-1/2 rounded text-center");
      expect(style.props.radius.value).toEqual({
        type: "keyword",
        keyword: "DEFAULT",
        value: "0.25rem",
      });
    });
    it("sets radius", () => {
      const style = new SimpleTailwindStyle("w-1/2 rounded-2xl text-center");
      style.props.radius.value = {
        type: "keyword",
        keyword: "lg",
      };
      expect(style.className).toEqual("w-1/2 rounded-lg text-center");
    });
    it("sets default radius", () => {
      const style = new SimpleTailwindStyle("w-1/2 rounded-2xl text-center");
      style.props.radius.value = {
        type: "keyword",
        keyword: "DEFAULT",
      };
      expect(style.className).toEqual("w-1/2 rounded text-center");
    });
  });
});
