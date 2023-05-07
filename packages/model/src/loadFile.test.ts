import * as fs from "node:fs";
import * as path from "node:path";
import { describe, it, expect } from "vitest";
import { loadFile } from "./loadFile";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import { Document } from "./document";

export function formatJS(text: string): string {
  return prettier.format(text, {
    parser: "babel",
    plugins: [parserBabel],
  });
}

const demoFile = fs.readFileSync(
  path.resolve(__dirname, "__fixtures__/demo.js"),
  "utf-8"
);

describe("File load/stringify", () => {
  it("should load a file", () => {
    const doc = new Document();

    const file = loadFile(doc, "/demo.js", demoFile);

    expect(file.filePath).toEqual("/demo.js");
    expect(file.childCount).toEqual(1);
    expect(doc.nodesData.toJSON()).toMatchSnapshot("nodes");

    expect(file.stringify()).toEqual(demoFile);
    expect(formatJS(file.stringify({ id: true }))).toMatchSnapshot(
      "stringifyWithID"
    );
  });
});
