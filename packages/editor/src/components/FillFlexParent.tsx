import React, { ReactElement } from "react";
import useResizeObserver from "use-resize-observer";

type Props = {
  children: (dimens: { width: number; height: number }) => ReactElement;
};

const style = {
  flex: 1,
  width: "100%",
  height: "100%",
  minHeight: 0,
  minWidth: 0,
};

export function FillFlexParent(props: Props) {
  const { ref, width, height } = useResizeObserver();
  return (
    <div style={style} ref={ref}>
      {width && height ? props.children({ width, height }) : null}
    </div>
  );
}
