import * as vscode from "vscode";
import * as path from "node:path";
import { Document } from "@windmix/model";
import { loadFile } from "@windmix/model/src/loadFile";
import { DevServer } from "./DevServer";

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
  constructor(devServer: DevServer) {
    this.devServer = devServer;
    // TODO: restore current text editor from state

    this.document.init();

    this._disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
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
      }),
      devServer.onBuildProblem((problem) => {
        this.document.buildProblems.push([problem]);
      })
    );

    // set text content on doc nodes change
    const nodes = this.document.nodesData.y;
    nodes.observeDeep(
      debouncedChange(() => {
        this.saveTextDocument();
      })
    );
  }

  async init(context: vscode.ExtensionContext) {
    this._context = context;
    const tabPath = context.workspaceState.get("tabPath");

    let textEditor;
    if (typeof tabPath === "string") {
      let editorViewColumn: vscode.ViewColumn | undefined;

      for (const tab of vscode.window.tabGroups.all.flatMap(
        (group) => group.tabs
      )) {
        if (tab.input instanceof vscode.TabInputText) {
          if (tab.input.uri.fsPath === tabPath) {
            editorViewColumn = tab.group.viewColumn;
          }
        }
      }

      textEditor = await vscode.window.showTextDocument(
        vscode.Uri.file(tabPath),
        { viewColumn: editorViewColumn }
      );
    } else {
      textEditor = vscode.window.activeTextEditor;
    }

    this._textEditor = textEditor;
    this.loadTextDocument();
  }

  dispose() {
    for (const disposable of this._disposables) {
      disposable.dispose();
    }
  }

  readonly devServer: DevServer;
  private _disposables: vscode.Disposable[] = [];
  private _context: vscode.ExtensionContext | undefined;
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

    if (this._context) {
      this._context.workspaceState.update(
        "tabPath",
        textEditor?.document.uri.fsPath
      );
    }
  }

  private saveTextDocument() {
    const textEditor = this._textEditor;
    if (textEditor) {
      const filePath = this.projectPathForEditor(textEditor);
      const fileNode = this.document.getFileNode(filePath);

      const newText = fileNode.stringify();
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
    }
  }

  private loadTextDocument() {
    if (!this._textEditor) {
      return;
    }
    const filePath = this.projectPathForEditor(this._textEditor);
    const code = this._textEditor.document.getText();

    if (code !== this._lastSetText) {
      loadFile(this.document, filePath, code);
    }
    this.document.currentFileID = "file:" + filePath;

    const file = this.document.getFileNode(filePath);
    this.devServer.setPreview(filePath, file?.stringify({ id: true }) ?? "");

    this._webviewTitleChanged.fire(this.webviewTitle);
  }

  private readonly _webviewTitleChanged = new vscode.EventEmitter<string>();
  readonly onWebviewTitleChanged = this._webviewTitleChanged.event;

  get webviewTitle(): string {
    const editor = this._textEditor;
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
