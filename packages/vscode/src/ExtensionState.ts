import * as vscode from "vscode";
import * as path from "node:path";
import { Document } from "@windmix/model";
import { loadFile } from "@windmix/model/src/loadFile";
import { devServer } from "./extension";

export const debouncedChange = (onUpdate: () => void): (() => void) => {
  let queued = false;
  const debounced = () => {
    if (queued) {
      return;
    }
    queued = true;
    queueMicrotask(() => {
      queued = false;
      onUpdate();
    });
  };
  return debounced;
};

export class ExtensionState {
  constructor() {
    // TODO: restore current text editor from state

    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        console.log("onDidChangeActiveTextEditor", editor);

        if (editor) {
          this.textEditor = editor;
        }
      }),
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (
          event.contentChanges.length &&
          this._textEditor?.document === event.document
        ) {
          this.loadTextDocument();
        }
      })
    );
    this._textEditor = vscode.window.activeTextEditor;
    this.loadTextDocument();

    // set text content on doc nodes change
    const nodes = this.document.nodesData.y;
    nodes.observeDeep(
      debouncedChange(() => {
        this.saveTextDocument();
      })
    );
  }

  dispose() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  disposables: vscode.Disposable[] = [];
  private _textEditor: vscode.TextEditor | undefined;
  private _lastSetText: string | undefined;
  readonly document = new Document();

  get textEditor(): vscode.TextEditor | undefined {
    return this._textEditor;
  }

  set textEditor(textEditor: vscode.TextEditor | undefined) {
    if (this._textEditor === textEditor) {
      return;
    }

    this._textEditor = textEditor;
    this._lastSetText = undefined;
    //this._panel.title = this.titleForEditor(textEditor);
    this.loadTextDocument();
  }

  private saveTextDocument() {
    const textEditor = this._textEditor;
    if (textEditor) {
      const newText = this.document.nodes.get("file")?.stringify() ?? "";
      const oldText = textEditor.document.getText();
      if (newText === oldText) {
        // TODO: compare by AST?
        return;
      }
      textEditor.edit((editBuilder) => {
        editBuilder.replace(
          new vscode.Range(
            textEditor.document.positionAt(0),
            textEditor.document.positionAt(oldText.length)
          ),
          newText
        );
      });
      this._lastSetText = newText;
      console.log("set lastSetText");
    }
  }

  private loadTextDocument() {
    if (!this._textEditor) {
      return;
    }
    const filePath = this.projectPathForEditor(this._textEditor);
    const code = this._textEditor.document.getText();

    //console.log(Diff.diffLines(code, this._lastSetText ?? ""));
    if (code !== this._lastSetText) {
      console.log("reload");
      loadFile(this.document, filePath, code);
    }

    if (devServer) {
      const file = this.document.fileNode;
      devServer.setPreview(filePath, file?.stringify({ id: true }) ?? "");
    }
  }

  get webviewTitle(): string {
    const editor = this._textEditor;
    if (!editor) {
      return "Windmix";
    }
    return "Windmix " + path.basename(editor.document.uri.path);
  }

  private titleForEditor(editor: vscode.TextEditor | undefined) {
    if (!editor) {
      return "Windmix";
    }

    return "Windmix " + path.basename(editor.document.uri.path);
  }

  private projectPathForEditor(editor: vscode.TextEditor) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.path;
    if (!workspacePath) {
      throw new Error("No workspace path");
    }

    return "/" + path.relative(workspacePath, editor.document.uri.path);
  }
}

export const extensionState = new ExtensionState();
