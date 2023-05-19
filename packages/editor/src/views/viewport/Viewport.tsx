import { observer } from "mobx-react-lite";
import * as path from "path-browserify";
import { appState } from "../../state/AppState";
import { Renderer } from "./Renderer";
import { scrollState, viewportGeometry } from "../../state/ScrollState";
import { Rect, Vec2 } from "paintvec";
import { action } from "mobx";
import { createRef, useEffect } from "react";
import { artboards } from "../../state/Artboard";
import { ZoomControlController } from "./ZoomControl";
import { ToolBar } from "./ToolBar";
import { PanOverlay } from "./PanOverlay";

export const Viewport: React.FC = observer(() => {
  const ref = createRef<HTMLDivElement>();

  useEffect(() => {
    const elem = ref.current;
    if (!elem) {
      return;
    }

    const updateViewportClientRect = action(() => {
      console.log("update viewport");
      viewportGeometry.domClientRect = Rect.from(elem.getBoundingClientRect());
    });

    updateViewportClientRect();

    const resizeObserver = new ResizeObserver(updateViewportClientRect);
    resizeObserver.observe(elem);

    window.addEventListener("scroll", updateViewportClientRect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateViewportClientRect);
    };
  }, []);

  const onWheel = action((e: React.WheelEvent) => {
    const scroll = scrollState;

    if (e.ctrlKey || e.metaKey) {
      const factor = Math.pow(2, -e.deltaY / 100);
      const pos = new Vec2(e.clientX, e.clientY).sub(
        viewportGeometry.domClientRect.topLeft
      );
      scroll.zoomAround(pos, scroll.scale * factor);
    } else {
      scroll.setTranslation(
        scroll.translation.sub(new Vec2(e.deltaX, e.deltaY).round)
      );
    }
  });

  const onMouseLeave = action(() => {
    appState.hover = undefined;
  });

  return (
    <main
      ref={ref}
      className="fixed inset-0"
      onWheel={onWheel}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="absolute inset-0"
        onClick={action(() => {
          appState.document.deselectAll();
        })}
      />
      <Renderer artboard={artboards.desktop} />
      <PanOverlay />
      <ZoomControlController className="absolute right-2 top-2" />
      <ToolBar className="absolute left-2 top-2" />
    </main>
  );
});
