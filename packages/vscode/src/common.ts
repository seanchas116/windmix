import * as vscode from "vscode";

export function findTabColumnForURI(
  uri: vscode.Uri
): vscode.ViewColumn | undefined {
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

export function findTabColumnForWebview(
  pattern: RegExp
): vscode.ViewColumn | undefined {
  for (const tab of vscode.window.tabGroups.all.flatMap(
    (group) => group.tabs
  )) {
    if (tab.input instanceof vscode.TabInputWebview) {
      if (pattern.test(tab.input.viewType)) {
        return tab.group.viewColumn;
      }
    }
  }
}

export const microtaskDebounce = (onUpdate: () => void): (() => void) => {
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
