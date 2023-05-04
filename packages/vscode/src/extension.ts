// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "node:path";
import { EditorPanelSerializer, EditorSession } from "./EditorSession";
import { DevServer } from "./DevServer";
import { EditorServer } from "./EditorServer";

let devServer: DevServer | undefined;
let editorServer: EditorServer | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "windmix-vscode" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand("windmix-vscode.openEditor", () => {
      new EditorSession({
        textEditor: vscode.window.activeTextEditor,
      });
    }),
    vscode.commands.registerCommand("windmix-vscode.openEditorExternal", () => {
      vscode.env.openExternal(vscode.Uri.parse("http://localhost:5173"));
    })
  );

  vscode.window.registerWebviewPanelSerializer(
    "windmixEditor",
    new EditorPanelSerializer()
  );

  devServer = await DevServer.start();
  editorServer = new EditorServer();
}

// This method is called when your extension is deactivated
export async function deactivate() {
  await devServer?.dispose();
  await editorServer?.dispose();
}
