import React, { useRef } from "react";
import { appState } from "../../state/AppState";
import { observer } from "mobx-react-lite";
import { Artboard, artboards } from "../../state/Artboard";
import { action, runInAction } from "mobx";
import { Rect } from "paintvec";

export const ArtboardView: React.FC<{
  width: number;
  artboard: Artboard;
}> = observer(({ width, artboard }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const height = Math.max(artboard.windowBodyHeight, 1);

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
        src={`http://localhost:1337/windmix?path=${appState.tabPath}&component=default`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        ref={iframeRef}
        onLoad={(e) => {
          console.log(e.currentTarget.contentWindow);
          artboard.setWindow(e.currentTarget.contentWindow ?? undefined);
        }}
      />
      <MouseOverlay artboard={artboard} />
      <HUD artboard={artboard} />
    </div>
  );
});

const MouseOverlay = observer(({ artboard }: { artboard: Artboard }) => {
  const cursor = appState.insertMode ? "crosshair" : "default";

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ cursor }}
      onClick={async (e) => {
        const node = await artboard.findNode(
          e.nativeEvent.offsetX,
          e.nativeEvent.offsetY
        );
        if (!node) {
          return;
        }
        await artboards.updateDimension(node);
        runInAction(() => {
          if (appState.insertMode) {
            // insert node

            const element = appState.document.nodes.create("element");
            element.tagName = "div";

            if (appState.insertMode === "text") {
              const text = appState.document.nodes.create("text");
              text.text = "Hello World";
              element.append([text]);
            } else {
              element.attributes = [
                {
                  name: "className",
                  value: JSON.stringify("w-20 h-20 bg-blue-300"),
                  trailingSpace: " ",
                },
              ];
            }
            node.append([element]);
            appState.document.deselectAll();
            element.select();

            appState.insertMode = undefined;
          } else {
            if (!(e.shiftKey || e.altKey)) {
              appState.document.deselectAll();
            }
            node.select();
          }
        });
      }}
      onDoubleClick={action(async (event) => {
        const node = await artboard.findNode(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY
        );
        if (!node) {
          return;
        }
        runInAction(() => {
          appState.jumpToLocation(node.location);
        });
      })}
      onMouseMove={action(async (event) => {
        const node = await artboard.findNode(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY
        );
        if (!node) {
          return;
        }
        await artboards.updateDimension(node);
        runInAction(() => {
          appState.hover = node;
        });
      })}
    />
  );
});
MouseOverlay.displayName = "MouseOverlay";

const HUD: React.FC<{
  artboard: Artboard;
}> = observer(({ artboard }) => {
  const { hover } = appState;
  const hoveredRects = hover ? artboard.getDimension(hover).rects : [];

  const selectedRect = Rect.union(
    ...appState.document.selectedNodes.flatMap(
      (node) => artboard.getDimension(node).rects
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
