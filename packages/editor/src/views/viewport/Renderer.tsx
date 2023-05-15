import React, { useRef } from "react";
import { appState } from "../../state/AppState";
import { observer } from "mobx-react-lite";
import { DOMLocator, domLocators } from "../DOMLocator";
import { action, runInAction } from "mobx";
import { Rect } from "paintvec";

export const Renderer: React.FC<{
  width: number;
  domLocator: DOMLocator;
}> = observer(({ width, domLocator }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const height = Math.max(domLocator.windowBodyHeight, 1);

  return (
    <div
      className="relative bg-white"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        contain: "strict",
      }}
    >
      <iframe
        //srcDoc={srcdoc}
        src={`http://localhost:1337/windmix?path=${appState.tabPath}&component=default`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
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
