import React, { useEffect } from "react";
import { reaction } from "mobx";
import { editorState } from "./EditorState";

export const Renderer: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return;
    }

    return reaction(
      () => editorState.tabPath,
      async (tabPath) => {
        container.innerHTML = "";

        if (!tabPath) {
          return;
        }

        const module = await import(
          "http://localhost:1337/virtual:windmix" + tabPath
        );

        const root = document.createElement("div");
        container.appendChild(root);
        module.render(root);
      },
      { fireImmediately: true }
    );
  }, []);

  return <div ref={ref}></div>;
};
