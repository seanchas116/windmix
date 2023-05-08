import { observer } from "mobx-react-lite";
import * as path from "path-browserify";
import { appState } from "../../state/AppState";
import { Renderer } from "./Renderer";
import { scrollState, viewportGeometry } from "../../state/ScrollState";
import { Rect, Vec2 } from "paintvec";
import { action } from "mobx";
import { createRef, useEffect } from "react";

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
    console.log("onWheel");
    const scroll = scrollState;

    if (e.ctrlKey || e.metaKey) {
      const factor = Math.pow(2, -e.deltaY / 100);
      const pos = new Vec2(e.clientX, e.clientY).sub(
        viewportGeometry.domClientRect.topLeft
      );
      console.log(factor, pos);
      scroll.zoomAround(pos, scroll.scale * factor);
      console.log(scroll.scale, scroll.translation);
    } else {
      scroll.setTranslation(
        scroll.translation.sub(new Vec2(e.deltaX, e.deltaY).round)
      );
    }
    console.log(scroll.documentToViewport.toCSSMatrixString());
  });

  return (
    <main
      className="flex-1 min-w-0 contain-strict relative"
      onWheel={onWheel}
      ref={ref}
    >
      <div
        style={{
          position: "absolute",
          transformOrigin: "left top",
          transform: scrollState.documentToViewport.toCSSMatrixString(),
        }}
      >
        <div className="absolute left-4 top-4 flex gap-4">
          <div>
            <h2 className="font-semibold mb-1">
              {appState.tabPath &&
                path.basename(appState.tabPath, path.extname(appState.tabPath))}
            </h2>
            <Renderer width={1024} />
          </div>
          <div>
            <h2 className="font-semibold mb-1">
              {appState.tabPath &&
                path.basename(appState.tabPath, path.extname(appState.tabPath))}
            </h2>
            <Renderer width={375} />
          </div>
        </div>
      </div>
    </main>
  );
});
