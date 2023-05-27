import React, { useEffect, useRef } from "react";
import { appState } from "../../state/AppState";
import { observer } from "mobx-react-lite";
import { Artboard, artboards } from "../../state/Artboard";
import { action, runInAction } from "mobx";
import { Rect } from "paintvec";
import { NodeResizeBox } from "./hud/NodeResizeBox";
import { DragHandlerOverlay } from "./dragHandler/DragHandlerOverlay";
import { DragIndicators } from "./hud/DragIndicator";
import { MarginPaddingIndicator } from "./hud/MarginPaddingIndicator";
import { usePointerStroke } from "@seanchas116/paintkit/src/components/hooks/usePointerStroke";
import { scrollState } from "../../state/ScrollState";
import { breakpoints } from "../../state/ViewportSize";

const breakpointGradientHeight = 100;
const breakpointGradientWidth = 2000;

const viewportSideMargin = 20;

const SideHandle: React.FC<{
  position: "left" | "right";
  scaledWidth: number;
}> = ({ position, scaledWidth }) => {
  const viewportSize = artboards.desktop.viewportSize;

  const pointerEventHandlers = usePointerStroke({
    onBegin() {
      return viewportSize.manualWidth;
    },
    onMove(e, { totalDeltaX, initData }) {
      if (initData === "auto") {
        return;
      }

      const newWidth =
        initData +
        Math.round(
          (totalDeltaX * 2 * (position === "left" ? -1 : 1)) / scrollState.scale
        );
      viewportSize.manualWidth = Math.max(newWidth, 100);
      return newWidth;
    },
  });

  return (
    <div
      {...pointerEventHandlers}
      className="absolute top-0 bottom-0 w-5 cursor-ew-resize flex items-center justify-center"
      style={{
        left:
          position === "left"
            ? `calc(50% - ${scaledWidth}px / 2 - ${viewportSideMargin}px)`
            : `calc(50% + ${scaledWidth}px / 2)`,
      }}
    >
      <div className="w-1 h-32 bg-white/20 rounded"></div>
    </div>
  );
};

export const Renderer: React.FC<{
  artboard: Artboard;
}> = observer(({ artboard }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const viewportSize = artboard.viewportSize;

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const resizeObserver = new ResizeObserver(
      action(() => {
        viewportSize.availableWidth = node.clientWidth - viewportSideMargin * 2;
      })
    );
    resizeObserver.observe(node);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const width = viewportSize.width;
  const scale = viewportSize.scale;
  const currentBreakpoint = viewportSize.breakpointIndex;

  return (
    <div className="absolute inset-0" ref={ref}>
      <div
        className="pointer-events-none h-full"
        style={{
          transform: "translateX(50%)",
        }}
      >
        {breakpoints.map((bp, i) => {
          return (
            <div
              className="absolute border-x"
              style={{
                top: 0,
                bottom: 0,
                left: `${(-bp.minWidth / 2) * scale}px`,
                width: `${bp.minWidth}px`,
                borderColor: bp.color + "80",
                backgroundColor:
                  i === currentBreakpoint ? bp.color + "08" : "transparent",
              }}
            />
          );
        })}
        {/* <div
          className="absolute"
          style={{
            top: `-${breakpointGradientHeight}px`,
            height: `${breakpointGradientHeight}px`,
            width: `${breakpointGradientWidth * 2}px`,
            left: `-${breakpointGradientWidth}px`,
            backgroundImage:
              "linear-gradient(var(--macaron-background), transparent)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: `${height}px`,
            height: `${breakpointGradientHeight}px`,
            width: `${breakpointGradientWidth * 2}px`,
            left: `-${breakpointGradientWidth}px`,
            backgroundImage:
              "linear-gradient(transparent, var(--macaron-background))",
          }}
        /> */}
      </div>
      <div
        className="absolute left-0 top-0 h-full"
        style={{
          left: `calc(50% - ${width}px / 2)`,
          width: `${width}px`,
          height: `calc(100% / ${scale})`,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <iframe
          className="absolute left-0 top-0 w-full h-full bg-white"
          src={appState.previewURL}
          ref={iframeRef}
          onLoad={(e) => {
            artboard.adapter.setWindow(
              e.currentTarget.contentWindow ?? undefined
            );
          }}
        />
        <DragHandlerOverlay artboard={artboard} />
        <HUD artboard={artboard} />
      </div>
      <SideHandle position="left" scaledWidth={width * scale} />
      <SideHandle position="right" scaledWidth={width * scale} />
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
          appState.document.hoverNode = node;
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

  const scrollTransform = `translate(${-artboard.adapter.scrollX} ${-artboard
    .adapter.scrollY})`;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <g transform={scrollTransform}>
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
      </g>
    </svg>
  );
});
