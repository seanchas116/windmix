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
import { LetterIcon } from "@seanchas116/paintkit/src/components/Input";
import { Icon } from "@iconify/react";

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
              icon={<LetterIcon>T</LetterIcon>}
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.top}
            />
            <StyleDimensionInput
              icon={<LetterIcon>R</LetterIcon>}
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.right}
            />
            <StyleDimensionInput
              icon={<LetterIcon>B</LetterIcon>}
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.bottom}
            />
            <StyleDimensionInput
              icon={<LetterIcon>L</LetterIcon>}
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.left}
            />
          </FourEdgeGrid>
        )}
        <FourEdgeGrid>
          <StyleDimensionInput
            icon={<Icon icon={icons.marginTop} />}
            units={lengthPercentageUnits}
            keywords={["auto"]}
            property={state.props.marginTop}
          />
          <StyleDimensionInput
            icon={<Icon icon={icons.marginRight} />}
            units={lengthPercentageUnits}
            keywords={["auto"]}
            property={state.props.marginRight}
          />
          <StyleDimensionInput
            icon={<Icon icon={icons.marginBottom} />}
            units={lengthPercentageUnits}
            keywords={["auto"]}
            property={state.props.marginBottom}
          />
          <StyleDimensionInput
            icon={<Icon icon={icons.marginLeft} />}
            units={lengthPercentageUnits}
            keywords={["auto"]}
            property={state.props.marginLeft}
          />
        </FourEdgeGrid>
      </RowGroup>
    </Pane>
  );
});
