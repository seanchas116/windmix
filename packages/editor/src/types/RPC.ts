export interface IRootToEditorRPCHandler {
  init(data: Uint8Array): Promise<void>;
  update(data: Uint8Array): Promise<void>;
}

export interface IEditorToRootRPCHandler {
  ready(data: Uint8Array): Promise<void>;
  update(data: Uint8Array): Promise<void>;
  revealLocation(location: { line: number; column: number }): Promise<void>;
  jumpToLocation(location: { line: number; column: number }): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  reloadWebviews(): Promise<void>;
}
