import { action } from "mobx";
import React, { useMemo } from "react";
import { Vec2 } from "paintvec";
import { observer } from "mobx-react-lite";
import { Artboard } from "../../../state/Artboard";
import { ResizeBox } from "@seanchas116/paintkit/src/components/ResizeBox";
import { NodeResizeBoxState } from "./NodeResizeBoxState";

export const NodeResizeBox: React.FC<{
  artboard: Artboard;
}> = observer(function NodeResizeBox({ artboard }) {
  const state = useMemo(() => new NodeResizeBoxState(artboard), [artboard]);

  if (artboard.dragPreviewRects.length) {
    return null;
  }

  const boundingBox = state.boundingBox;
  if (!boundingBox) {
    return null;
  }

  return (
    <ResizeBox
      p0={boundingBox.topLeft}
      p1={boundingBox.bottomRight}
      snap={action((p: Vec2) => {
        return p;
        // return await artboard.snapper.snapResizePoint(
        //   state.selectedInstances,
        //   p
        // );
      })}
      onChangeBegin={action(state.begin.bind(state))}
      onChange={action(state.change.bind(state))}
      onChangeEnd={action(state.end.bind(state))}
      stroke={state.stroke}
    />
  );
});
