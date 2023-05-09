import { observer } from "mobx-react-lite";
import React from "react";
import {
  FourEdgeGrid,
  Pane,
  PaneHeading,
  PaneHeadingRow,
  RowGroup,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import * as icons from "@seanchas116/design-icons";
import { StyleInspectorState } from "../../state/StyleInspectorState";
import { lengthPercentageUnits } from "./Units";
import { StyleDimensionInput, StyleIconRadio } from "./Components";

const positionOptions = [
  {
    value: "static",
    icon: icons.staticPosition,
  },
  {
    value: "relative",
    icon: icons.relativePosition,
  },
  {
    value: "absolute",
    icon: icons.absolutePosition,
  },
];

export const PositionPane: React.FC<{
  state: StyleInspectorState;
}> = observer(function PositionPane({ state }) {
  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Position</PaneHeading>
      </PaneHeadingRow>
      <RowGroup>
        <StyleIconRadio
          options={positionOptions}
          property={state.props.position}
        />
        {state.props.position.computed !== "static" && (
          <FourEdgeGrid>
            <StyleDimensionInput
              icon="T"
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.top}
            />
            <StyleDimensionInput
              icon="R"
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.right}
            />
            <StyleDimensionInput
              icon="B"
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.bottom}
            />
            <StyleDimensionInput
              icon="L"
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.left}
            />
          </FourEdgeGrid>
        )}
        <FourEdgeGrid>
          <StyleDimensionInput
            icon={icons.marginTop}
            units={lengthPercentageUnits}
            keywords={["auto"]}
            property={state.props.marginTop}
          />
          <StyleDimensionInput
            icon={icons.marginRight}
            units={lengthPercentageUnits}
            keywords={["auto"]}
            property={state.props.marginRight}
          />
          <StyleDimensionInput
            icon={icons.marginBottom}
            units={lengthPercentageUnits}
            keywords={["auto"]}
            property={state.props.marginBottom}
          />
          <StyleDimensionInput
            icon={icons.marginLeft}
            units={lengthPercentageUnits}
            keywords={["auto"]}
            property={state.props.marginLeft}
          />
        </FourEdgeGrid>
      </RowGroup>
    </Pane>
  );
});
