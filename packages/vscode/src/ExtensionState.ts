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

function findTabForURI(uri: vscode.Uri): vscode.ViewColumn | undefined {
  for (const tab of vscode.window.tabGroups.all.flatMap(
    (group) => group.tabs
  )) {
    if (tab.input instanceof vscode.TabInputText) {
      if (tab.input.uri.fsPath === uri.fsPath) {
        return tab.group.viewColumn;
      }
    }
  }
}

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
        if (event.contentChanges.length) {
          this.loadTextDocument(event.document);
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
              const filePath = currentComponent.filePath;
              if (filePath) {
                const uri = this.uriFromProjectPath(filePath);
                console.log("TODO: change active tab to", uri);
                const textDocument = vscode.workspace.textDocuments.find(
                  (doc) => doc.uri.fsPath === uri.fsPath
                );

                const tab = findTabForURI(uri);
                if (tab && textDocument) {
                  this._subviewTextDocument = textDocument;
                  vscode.window.showTextDocument(textDocument, {
                    preserveFocus: false,
                    preview: false,
                    viewColumn: tab,
                  });
                  return;
                }
              }
            }
            this._subviewTextDocument = undefined;
          }
        ),
      }
    );

    // set text content on doc nodes change
    const nodes = this.document.nodesData.y;
    nodes.observeDeep(
      debouncedChange(() => {
        if (this._textEditor) {
          this.saveToTextEditor(this._textEditor);
        }
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

    this.textEditor = textEditor;
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
  private _lastSetTexts = new WeakMap<vscode.TextDocument, string>();
  private _subviewTextDocument: vscode.TextDocument | undefined;
  readonly document = new Document();

  get textEditor(): vscode.TextEditor | undefined {
    return this._textEditor;
  }

  set textEditor(textEditor: vscode.TextEditor | undefined) {
    if (this._textEditor === textEditor) {
      return;
    }

    this._textEditor = textEditor;
    this._lastSetTexts = new WeakMap();
    //this._panel.title = this.titleForEditor(textEditor);
    if (textEditor) {
      this.loadTextDocument(textEditor.document);
    }

    if (this._context) {
      this._context.workspaceState.update(
        "tabPath",
        textEditor?.document.uri.fsPath
      );
    }
  }

  private saveToTextEditor(textEditor: vscode.TextEditor) {
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
    this._lastSetTexts.set(textEditor.document, newText);
  }

  private loadTextDocument(textDocument: vscode.TextDocument) {
    const filePath = this.projectPathFromURI(textDocument.uri);
    const code = textDocument.getText();

    // TODO: load dependency files

    if (code !== this._lastSetTexts.get(textDocument)) {
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
