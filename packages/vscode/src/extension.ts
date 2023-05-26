// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { EditorPanelSerializer, EditorSession } from "./EditorSession";
import { DevServer } from "./DevServer";
import { ExtensionState } from "./ExtensionState";
import { InspectorWebviewViewProvider } from "./Inspector";
import { OutlineWebviewViewProvider } from "./Outline";

let _devServer: DevServer | undefined;
let _extensionState: ExtensionState | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "windmix-vscode" is now active!'
  );

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    // show alert
    vscode.window.showErrorMessage(
      "Windmix requires an open workspace folder to work."
    );
    return;
  }

  const devServer = new DevServer(workspaceFolder);
  await devServer.start();
  const extensionState = new ExtensionState(workspaceFolder, devServer);
  await extensionState.init(context);

  _devServer = devServer;
  _extensionState = extensionState;

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand("windmix-vscode.openEditor", () => {
      EditorSession.createWithNewPanel(extensionState);
    }),
    vscode.commands.registerCommand("windmix-vscode.openEditorExternal", () => {
      vscode.env.openExternal(vscode.Uri.parse("http://localhost:5173"));
    }),
    vscode.window.registerWebviewViewProvider(
      "windmix-vscode.inspector",
      new InspectorWebviewViewProvider(extensionState)
    ),
    vscode.window.registerWebviewViewProvider(
      "windmix-vscode.outline",
      new OutlineWebviewViewProvider(extensionState)
    ),
    vscode.window.registerWebviewPanelSerializer(
      "windmixEditor",
      new EditorPanelSerializer(extensionState)
    )
  );
}

// This method is called when your extension is deactivated
export async function deactivate() {
  await _devServer?.dispose();
  await _extensionState?.dispose();
}
