import React, { useRef } from "react";
import { appState } from "../../state/AppState";
import { observer } from "mobx-react-lite";
import { DOMLocator, domLocators } from "../DOMLocator";
import { action } from "mobx";
import { Rect } from "paintvec";
import { compact } from "lodash-es";

declare global {
  interface Window {
    __uimixOnBodyHeightChange(window: Window, height: number): void;
  }
}

window.__uimixOnBodyHeightChange = (window: Window, height: number) => {
  console.log("body height change", height);
};

export const Renderer: React.FC<{
  width: number;
  domLocator: DOMLocator;
}> = observer(({ width, domLocator }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const srcdoc = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script type="module">
      import RefreshRuntime from "http://localhost:1337/@react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
      </script>
    <script type="module" src="http://localhost:1337/@vite/client"></script>
    <meta charset="UTF-8" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="http://localhost:1337/virtual:windmix${appState.tabPath}"></script>
  </body>
</html>
`;

  return (
    <div
      className="relative bg-white"
      style={{
        width: `${width}px`,
        height: `${domLocator.windowBodyHeight ?? 1024}px`,
        contain: "strict",
      }}
    >
      <iframe
        srcDoc={srcdoc}
        className="w-full h-[2048px]"
        ref={iframeRef}
        onLoad={(e) => {
          domLocator.setWindow(e.currentTarget.contentWindow ?? undefined);
        }}
      />
      <MouseOverlay domLocator={domLocator} />
      <HUD domLocator={domLocator} />
    </div>
  );
});

const MouseOverlay = ({ domLocator }: { domLocator: DOMLocator }) => {
  return (
    <div
      className="absolute inset-0 w-full h-full"
      onClick={action((event) => {
        const nodeElem = domLocator.findNode(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY
        );
        if (!nodeElem) {
          return;
        }

        const [node] = nodeElem;

        domLocators.updateDimension(node);
        appState.document.deselectAll();
        node.select();
      })}
      onDoubleClick={action((event) => {
        const nodeElem = domLocator.findNode(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY
        );
        if (!nodeElem) {
          return;
        }

        const [node] = nodeElem;
        appState.reveal(node.location);
      })}
      onMouseMove={action((event) => {
        const nodeElem = domLocator.findNode(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY
        );
        if (!nodeElem) {
          return;
        }
        const [node] = nodeElem;
        domLocators.updateDimension(node);
        appState.hover = node;
      })}
    />
  );
};

const HUD: React.FC<{
  domLocator: DOMLocator;
}> = observer(({ domLocator }) => {
  if (!appState.hover) {
    return null;
  }

  const hoveredRect = domLocator.getDimension(appState.hover).rect;

  const selectedRect = Rect.union(
    ...compact(
      appState.document.selectedNodes.map(
        (node) => domLocator.getDimension(node).rect
      )
    )
  );

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {hoveredRect && (
        <rect
          x={hoveredRect.left}
          y={hoveredRect.top}
          width={hoveredRect.width}
          height={hoveredRect.height}
          fill="none"
          stroke="blue"
          strokeWidth={1}
        />
      )}
      {selectedRect && (
        <rect
          x={selectedRect.left}
          y={selectedRect.top}
          width={selectedRect.width}
          height={selectedRect.height}
          fill="none"
          stroke="blue"
          strokeWidth={1}
        />
      )}
    </svg>
  );
});
