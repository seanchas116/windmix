import React, { useRef } from "react";
import { appState } from "../../state/AppState";
import { observer } from "mobx-react-lite";
import { DOMLocator, domLocators } from "../DOMLocator";
import { action, runInAction } from "mobx";
import { Rect } from "paintvec";

declare global {
  interface Window {
    __windmixOnUpdate(window: Window): void;
  }
}

window.__windmixOnUpdate = (window: Window) => {
  console.log("on update");
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
        //srcDoc={srcdoc}
        src={`http://localhost:1337/windmix?path=${appState.tabPath}`}
        className="w-full h-[2048px]"
        ref={iframeRef}
        onLoad={(e) => {
          console.log(e.currentTarget.contentWindow);
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
      onClick={async (event) => {
        const node = await domLocator.findNode(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY
        );
        if (!node) {
          return;
        }
        await domLocators.updateDimension(node);
        runInAction(() => {
          appState.document.deselectAll();
          node.select();
        });
      }}
      onDoubleClick={action(async (event) => {
        const node = await domLocator.findNode(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY
        );
        if (!node) {
          return;
        }
        runInAction(() => {
          appState.reveal(node.location);
        });
      })}
      onMouseMove={action(async (event) => {
        const node = await domLocator.findNode(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY
        );
        if (!node) {
          return;
        }
        await domLocators.updateDimension(node);
        runInAction(() => {
          appState.hover = node;
        });
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

  const hoveredRects = domLocator.getDimension(appState.hover).rects;

  const selectedRect = Rect.union(
    ...appState.document.selectedNodes.flatMap(
      (node) => domLocator.getDimension(node).rects
    )
  );

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {hoveredRects.map((rect, i) => (
        <rect
          key={i}
          {...rect.toSVGRectProps()}
          fill="none"
          stroke="blue"
          strokeWidth={1}
        />
      ))}
      {selectedRect && (
        <rect
          {...selectedRect.toSVGRectProps()}
          fill="none"
          stroke="blue"
          strokeWidth={1}
        />
      )}
    </svg>
  );
});
