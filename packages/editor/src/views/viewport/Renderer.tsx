import React, { useRef } from "react";
import { appState } from "../../state/AppState";
import { observer } from "mobx-react-lite";
import { domLocator } from "../DOMLocator";
import { action } from "mobx";
import { getNodeDimension, updateNodeDimension } from "../NodeDimension";
import { Rect } from "paintvec";
import { compact } from "lodash-es";

export const Renderer: React.FC = observer(() => {
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
    <div className="w-[1024px] relative">
      <iframe
        srcDoc={srcdoc}
        className="w-[1024px] h-[2048px]"
        ref={iframeRef}
        onLoad={(e) => {
          domLocator.window = e.currentTarget.contentWindow ?? undefined;
        }}
      />
      <MouseOverlay iframeRef={iframeRef} />
      <HUD />
    </div>
  );
});

const MouseOverlay = ({
  iframeRef,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}) => {
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
        updateNodeDimension(node);
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
        updateNodeDimension(node);
        appState.hover = node;
      })}
    />
  );
};

const HUD = observer(() => {
  if (!appState.hover) {
    return null;
  }

  const hoveredRect = getNodeDimension(appState.hover).rect;

  const selectedRect = Rect.union(
    ...compact(
      appState.document.selectedNodes.map((node) => getNodeDimension(node).rect)
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
