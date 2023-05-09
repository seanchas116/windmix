import { observer } from "mobx-react-lite";
import React from "react";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
  Row111,
  RowGroup,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import {
  IconButton,
  MoreButton,
} from "@seanchas116/paintkit/src/components/IconButton";
import * as icons from "@seanchas116/design-icons";
import Tippy from "@tippyjs/react";
import { StyleInspectorState } from "../../state/StyleInspectorState";
import { lengthPercentageUnits } from "./Units";
import { StyleDimensionInput } from "./Components";

export const SizePane: React.FC<{
  state: StyleInspectorState;
}> = observer(function SizePane({ state }) {
  const separateRadiusesButton = (
    <IconButton
      style={{
        justifySelf: "flex-end",
      }}
      icon={icons.separateCorners}
      pressed={state.showsSeparateRadiuses}
      onClick={state.onToggleShowSeparateRadiuses}
    />
  );

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Size</PaneHeading>
        <Tippy content="Show details">
          <div>
            <MoreButton
              pressed={state.showsSizeDetails}
              onClick={state.onToggleShowSizeDetails}
            />
          </div>
        </Tippy>
      </PaneHeadingRow>
      <RowGroup>
        {state.showsSizeDetails ? (
          <>
            <Row111>
              <StyleDimensionInput
                icon={{ letter: "W" }}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.width}
              />
              <StyleDimensionInput
                icon={{ letter: ">" }}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.minWidth}
              />
              <StyleDimensionInput
                icon={{ letter: "<" }}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.maxWidth}
              />
            </Row111>
            <Row111>
              <StyleDimensionInput
                icon={{ letter: "H" }}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.height}
              />
              <StyleDimensionInput
                icon={{ letter: ">" }}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.minHeight}
              />
              <StyleDimensionInput
                icon={{ letter: "<" }}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.maxHeight}
              />
            </Row111>
          </>
        ) : (
          <Row11>
            <StyleDimensionInput
              icon={{ letter: "W" }}
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.width}
            />
            <StyleDimensionInput
              icon={{ letter: "H" }}
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.height}
            />
          </Row11>
        )}
        {state.showsSeparateRadiuses ? (
          <>
            <Row111>
              <StyleDimensionInput
                icon={icons.radius}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.borderTopLeftRadius}
              />
              <StyleDimensionInput
                icon={{ ...icons.radius, rotate: 1 }}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.borderTopRightRadius}
              />
              {separateRadiusesButton}
            </Row111>
            <Row111>
              <StyleDimensionInput
                icon={{ ...icons.radius, rotate: 3 }}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.borderBottomLeftRadius}
              />
              <StyleDimensionInput
                icon={{ ...icons.radius, rotate: 2 }}
                units={lengthPercentageUnits}
                keywords={["auto"]}
                property={state.props.borderBottomRightRadius}
              />
            </Row111>
          </>
        ) : (
          <Row111>
            <StyleDimensionInput
              icon={icons.radius}
              units={lengthPercentageUnits}
              keywords={["auto"]}
              property={state.props.borderRadius}
            />
            <div />
            {separateRadiusesButton}
          </Row111>
        )}
      </RowGroup>
    </Pane>
  );
});
