import * as vscode from "vscode";
import * as path from "node:path";
import { Document, fileNodeID } from "@windmix/model";
import { loadFile } from "@windmix/model/src/loadFile";
import { DevServer } from "./DevServer";
import { reaction } from "mobx";

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
  constructor(workspaceFolder: vscode.WorkspaceFolder, devServer: DevServer) {
    this.workspaceFolder = workspaceFolder;
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
      }),
      {
        dispose: reaction(
          () => this.document.currentComponent,
          (currentComponent) => {
            if (currentComponent) {
              const file = currentComponent.parent;
              if (file?.type === "file") {
                const uri = this.uriFromProjectPath(file.filePath);
                console.log("TODO: change active tab to", uri);
              }
            }
          }
        ),
      }
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

  readonly workspaceFolder: vscode.WorkspaceFolder;
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
      const filePath = this.projectPathFromURI(textEditor.document.uri);
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
    const filePath = this.projectPathFromURI(this._textEditor.document.uri);
    const code = this._textEditor.document.getText();

    // TODO: load dependency files

    if (code !== this._lastSetText) {
      loadFile(this.document, filePath, code);
    }
    this.document.currentFileID = fileNodeID(filePath);

    const file = this.document.getFileNode(filePath);

    // TODO: keep preview updated on non-active TextDocument changes (e.g., git checkout)
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

  private projectPathFromURI(uri: vscode.Uri) {
    return "/" + path.relative(this.workspaceFolder.uri.fsPath, uri.path);
  }

  private uriFromProjectPath(projectPath: string) {
    return vscode.Uri.file(
      path.join(this.workspaceFolder.uri.fsPath, projectPath.slice(1))
    );
  }
}
