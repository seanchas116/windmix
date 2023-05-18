import React, { Fragment } from "react";
import { observer } from "mobx-react-lite";
import { Rect } from "paintvec";
import { Artboard } from "../../../state/Artboard";

function rectToSVGPoints(rect: Rect) {
  return [...rect.vertices, rect.topLeft].map((v) => `${v.x},${v.y}`).join(" ");
}
function rectToSVGPointsReverse(rect: Rect) {
  return [...rect.vertices, rect.topLeft]
    .reverse()
    .map((v) => `${v.x},${v.y}`)
    .join(" ");
}

export const MarginPaddingIndicator: React.FC<{
  artboard: Artboard;
}> = observer(function MarginPaddingArea({ artboard }) {
  const computations = artboard.selectedComputations;

  return (
    <g opacity={0.1}>
      {computations.map((computation, i) => {
        // TODO: take transforms on margin/padding into account
        const borderRect = computation.rect;
        const paddingRect = computation.paddingRect;
        const contentRect = computation.contentRect;
        const marginRect = computation.marginRect;

        const marginPoints = `${rectToSVGPoints(
          marginRect
        )} ${rectToSVGPointsReverse(borderRect)}`;
        const paddingPoints = `${rectToSVGPoints(
          paddingRect
        )} ${rectToSVGPointsReverse(contentRect)}`;

        return (
          <Fragment key={i}>
            <polygon points={marginPoints} fill="#FF7800" />
            <polygon points={paddingPoints} fill="#00C553" />
          </Fragment>
        );
      })}
    </g>
  );
});
