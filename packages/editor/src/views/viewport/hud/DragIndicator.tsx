import React from "react";
import { observer } from "mobx-react-lite";
import { Artboard } from "../../../state/Artboard";
import { scrollState } from "../../../state/ScrollState";
import { colors } from "@seanchas116/paintkit/src/components/Palette";

export const DragIndicators: React.FC<{
  artboard: Artboard;
}> = observer(function DragIndicators({ artboard }) {
  const dragPreviewRects = artboard.dragPreviewRects;
  const dropTargetPreviewRect = artboard.dropDestination?.parentRect;
  const dropIndexIndicator = artboard.dropDestination?.insertionLine;

  return (
    <>
      {dragPreviewRects.map((rect, i) => (
        <rect
          key={i}
          {...rect.toSVGRectProps()}
          fill="none"
          strokeDasharray="2 2"
          stroke={colors.active}
        />
      ))}
      {dropTargetPreviewRect && (
        <rect
          {...dropTargetPreviewRect.toSVGRectProps()}
          fill="none"
          strokeDasharray="2 2"
          stroke={colors.active}
          strokeWidth={2}
        />
      )}
      {dropIndexIndicator && (
        <line
          {...dropIndexIndicator.toSVGLineProps()}
          stroke={colors.active}
          strokeWidth={2}
        />
      )}
    </>
  );
});
