import React, { useRef } from "react";
import { appState } from "../../state/AppState";
import { observer } from "mobx-react-lite";
import { Artboard } from "../../state/Artboard";
import { action, runInAction } from "mobx";
import { Rect } from "paintvec";
import { NodeResizeBox } from "./hud/NodeResizeBox";
import { DragHandlerOverlay } from "./dragHandler/DragHandlerOverlay";
import { DragIndicators } from "./hud/DragIndicator";
import { MarginPaddingIndicator } from "./hud/MarginPaddingIndicator";
import { usePointerStroke } from "@seanchas116/paintkit/src/components/hooks/usePointerStroke";
import { twMerge } from "tailwind-merge";
import colors from "tailwindcss/colors";
import { scrollState } from "../../state/ScrollState";
import { breakpoints } from "./constants";

export const Renderer: React.FC<{
  artboard: Artboard;
}> = observer(({ artboard }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const width = artboard.width;
  const height = artboard.adapter.windowBodyHeight;

  const pointerEventHandlers = usePointerStroke({
    onBegin() {
      return artboard.width;
    },
    onMove(e, { totalDeltaX, initData }) {
      const newWidth = initData + (totalDeltaX * 2) / scrollState.scale;
      artboard.width = newWidth;
      return newWidth;
    },
  });

  const currentBreakpoint = breakpoints.findIndex(
    (bp) => artboard.width < bp.minWidth
  );

  return (
    <div className="absolute inset-0">
      {breakpoints.map((bp, i) => {
        return (
          <div
            className="absolute border-x"
            style={{
              left: `${-bp.minWidth / 2}px`,
              width: `${bp.minWidth}px`,
              height: `${height}px`,
              borderColor: bp.color + "80",
              backgroundColor:
                i === currentBreakpoint ? bp.color + "08" : "transparent",
            }}
          />
        );
      })}
      <div
        className="absolute left-0 top-0"
        style={{
          left: `${-width / 2}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <iframe
          className="absolute left-0 top-0 w-full h-full"
          src={`http://localhost:1337/windmix?path=${appState.tabPath}&component=default`}
          ref={iframeRef}
          onLoad={(e) => {
            console.log(e.currentTarget.contentWindow);
            artboard.adapter.setWindow(
              e.currentTarget.contentWindow ?? undefined
            );
          }}
        />
        <DragHandlerOverlay artboard={artboard} />
        <HUD artboard={artboard} />
      </div>
      <div
        {...pointerEventHandlers}
        className="absolute top-0 bottom-0 w-2 bg-white/20 cursor-ew-resize"
        style={{
          left: `${width / 2}px`,
          height: `${height}px`,
        }}
      ></div>
    </div>
  );
});
Renderer.displayName = "Renderer";

const MouseOverlay = observer(({ artboard }: { artboard: Artboard }) => {
  const cursor = appState.tool ? "crosshair" : "default";

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
        //await artboards.updateDimension(node);
        runInAction(() => {
          if (appState.tool?.type === "insert") {
            // insert node

            const element = appState.document.nodes.create("element");
            element.tagName = "div";

            if (appState.tool.insertMode === "text") {
              const text = appState.document.nodes.create("text");
              text.text = "Hello World";
              element.append([text]);
            } else {
              element.className = "w-20 h-20 bg-blue-300";
            }
            node.append([element]);
            appState.document.deselectAll();
            element.select();

            appState.tool = undefined;
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
  const hoveredRects = artboard.hoverComputations.map((c) => c.rect);

  const selectedRect = Rect.union(
    ...artboard.selectedComputations.map((c) => c.rect)
  );

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <MarginPaddingIndicator artboard={artboard} />
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
      <DragIndicators artboard={artboard} />
      <NodeResizeBox artboard={artboard} />
    </svg>
  );
});
