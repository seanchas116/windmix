import { describe, expect, it } from "vitest";
import { KeywordTailwindParser } from "./Parser";

describe(KeywordTailwindParser.name, () => {
  it("parses", () => {
    const parser = new KeywordTailwindParser("display", {
      inline: "inline",
      block: "block",
      "inline-block": "inline-block",
      flex: "flex",
      "inline-flex": "inline-flex",
      hidden: "none",
    });

    expect(parser.parse("inline")).toEqual({
      type: "keyword",
      keyword: "inline",
      value: "inline",
    });

    expect(parser.parse("block")).toEqual({
      type: "keyword",
      keyword: "block",
      value: "block",
    });

    expect(parser.parse("hidden")).toEqual({
      type: "keyword",
      keyword: "hidden",
      value: "none",
    });

    expect(
      parser.stringify({ type: "keyword", keyword: "inline", value: "inline" })
    ).toEqual("inline");
    expect(
      parser.stringify({ type: "keyword", keyword: "block", value: "block" })
    ).toEqual("block");
    expect(
      parser.stringify({ type: "keyword", keyword: "hidden", value: "none" })
    ).toEqual("hidden");
  });
});
