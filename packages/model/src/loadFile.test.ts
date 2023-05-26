import * as fs from "node:fs";
import * as path from "node:path";
import { describe, it, expect } from "vitest";
import { loadFile } from "./loadFile";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import { Document } from "./document";
import { Project } from "./project";

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
    const project = new Project();
    const doc = project.getDocument("/demo.js");

    let id = 0;
    const generateID = () => {
      id += 1;
      return String(id);
    };

    const file = loadFile(doc, "/demo.js", demoFile, generateID);

    expect(file.filePath).toEqual("/demo.js");
    expect(file.childCount).toEqual(1);
    const nodesJSON = doc.nodesData.toJSON();
    expect(nodesJSON).toMatchSnapshot("nodes");

    expect(file.stringify()).toEqual(demoFile);
    expect(formatJS(file.stringify({ id: true }))).toMatchSnapshot(
      "stringifyWithID"
    );

    loadFile(doc, "/demo.js", demoFile, generateID);
    // ID should be the same
    expect(doc.nodesData.toJSON()).toEqual(nodesJSON);
  });

  it("should load example files", () => {
    const project = new Project();
    const doc = project.getDocument("/demo.js");

    const exampleDir = path.resolve(__dirname, "../../example/src");
    const exampleFiles = fs.readdirSync(exampleDir);

    for (const exampleFile of exampleFiles) {
      const filePath = path.resolve(exampleDir, exampleFile);
      const fileText = fs.readFileSync(filePath, "utf-8");
      const file = loadFile(doc, filePath, fileText);
      expect(file.stringify()).toEqual(fileText);
    }
  });

  const testFileDir = path.resolve(__dirname, "__fixtures__/tests");
  const testFiles = fs.readdirSync(testFileDir);

  for (const file of testFiles) {
    if (file.endsWith(".js")) {
      it(`should load ${file}`, () => {
        const project = new Project();
        const doc = project.getDocument("/demo.js");

        let id = 0;
        const generateID = () => {
          id += 1;
          return String(id);
        };

        const filePath = path.resolve(testFileDir, file);
        const fileText = fs.readFileSync(filePath, "utf-8");
        loadFile(doc, filePath, fileText, generateID);
        expect(doc.nodesData.toJSON()).toMatchSnapshot("nodes");
      });
    }
  }
});
