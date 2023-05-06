import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { loadFile } from "./loadFile";
import * as Y from "yjs";

const demoFile = fs.readFileSync(
  path.resolve(__dirname, "__fixtures__/demo.js"),
  "utf-8"
);

describe("File load/stringify", () => {
  it("should load a file", () => {
    const ydoc = new Y.Doc();

    const file = loadFile(ydoc, "/demo.js", demoFile);

    expect(file.filePath).toEqual("/demo.js");
    expect(file.childCount).toEqual(1);
    expect(ydoc.getMap("nodes").toJSON()).toMatchSnapshot("nodes");
  });
});
