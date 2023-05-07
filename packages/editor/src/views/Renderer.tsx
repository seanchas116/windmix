import React, { useRef } from "react";
import { appState } from "../state/AppState";
import { observer } from "mobx-react-lite";
import { domLocator } from "./DOMLocator";
import { Rect } from "paintvec";
import { action } from "mobx";

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
    <div className="w-[1024px] h-[768px] relative">
      <iframe
        srcDoc={srcdoc}
        className="w-[1024px] h-[768px]"
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

        const [node, elem] = nodeElem;
        appState.hover = {
          node,
          rect: Rect.from(elem.getBoundingClientRect()),
        };
      })}
    />
  );
};

const HUD = observer(() => {
  const hoveredRect = appState.hover?.rect;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {hoveredRect && (
        <rect
          x={hoveredRect.left}
          y={hoveredRect.top}
          width={hoveredRect.width}
          height={hoveredRect.height}
          fill="none"
          stroke="red"
          strokeWidth={1}
        />
      )}
    </svg>
  );
});
