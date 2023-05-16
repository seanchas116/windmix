export type InsertMode = "text" | "box";

export type Tool = {
  type: "insert";
  insertMode: InsertMode;
};
