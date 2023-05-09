import { observer } from "mobx-react-lite";
import React from "react";
import {
  FourEdgeGrid,
  Pane,
  PaneHeading,
  PaneHeadingRow,
  RowGroup,
  RowPackLeft,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { Button } from "@seanchas116/paintkit/src/components/Button";
import * as icons from "@seanchas116/design-icons";
import visibilityOffIcon from "@iconify-icons/ic/outline-visibility-off";
import arrowForwardIcon from "@iconify-icons/ic/outline-arrow-forward";
import closeIcon from "@iconify-icons/ic/outline-close";
import wrapTextIcon from "@iconify-icons/ic/outline-wrap-text";
import alignVerticalTopIcon from "@iconify-icons/ic/outline-align-vertical-top";
import alignVerticalCenterIcon from "@iconify-icons/ic/outline-align-vertical-center";
import alignVerticalBottomIcon from "@iconify-icons/ic/outline-align-vertical-bottom";
import spaceBarIcon from "@iconify-icons/ic/outline-space-bar";
import styled from "styled-components";
import { StyleInspectorState } from "../../state/StyleInspectorState";
import { lengthPercentageUnits } from "./Units";
import { StyleDimensionInput, StyleIconRadio } from "./Components";

const verticalSpaceBarIcon = {
  ...spaceBarIcon,
  rotate: 1,
};

const displayOptions = [
  {
    value: "block",
    icon: icons.staticPosition,
  },
  {
    value: "flex",
    icon: icons.hStack,
  },
  // TODO: grid
  {
    value: "inline",
    icon: icons.text,
  },
  {
    value: "none",
    icon: visibilityOffIcon,
  },
];

const flexDirectionOptions = [
  {
    value: "row",
    icon: arrowForwardIcon,
  },
  {
    value: "column",
    icon: { ...arrowForwardIcon, rotate: 1 },
  },
  {
    value: "row-reverse",
    icon: { ...arrowForwardIcon, rotate: 2 },
  },
  {
    value: "column-reverse",
    icon: { ...arrowForwardIcon, rotate: 3 },
  },
];

const flexWrapOptions = [
  {
    value: "nowrap",
    icon: closeIcon,
  },
  {
    value: "wrap",
    icon: wrapTextIcon,
  },
  {
    value: "wrap-reverse",
    icon: { ...wrapTextIcon, vFlip: true },
  },
];

const alignItemsOptionsRow = [
  {
    value: "stretch",
    icon: icons.alignStretch,
  },
  {
    value: "flex-start",
    icon: alignVerticalTopIcon,
  },
  {
    value: "center",
    icon: alignVerticalCenterIcon,
  },
  {
    value: "flex-end",
    icon: alignVerticalBottomIcon,
  },
];

const alignItemsOptionsColumn = alignItemsOptionsRow.map((option) => ({
  value: option.value,
  icon: { ...option.icon, rotate: (option.icon.rotate ?? 0) - 1 },
}));

const justifyContentOptionsRow = [
  {
    value: "flex-start",
    icon: icons.justifyStart,
  },
  {
    value: "center",
    icon: icons.justifyCenter,
  },

  {
    value: "flex-end",
    icon: icons.justifyEnd,
  },
  {
    value: "space-between",
    icon: icons.justifySpaceBetween,
  },
];

const justifyContentOptionsRowReverse = justifyContentOptionsRow.map(
  (option) => ({
    value: option.value,
    icon: { ...option.icon, rotate: (option.icon.rotate ?? 0) + 2 },
  })
);

const justifyContentOptionsColumn = justifyContentOptionsRow.map((option) => ({
  value: option.value,
  icon: { ...option.icon, rotate: (option.icon.rotate ?? 0) + 1 },
}));

const justifyContentOptionsColumnReverse = justifyContentOptionsRow.map(
  (option) => ({
    value: option.value,
    icon: { ...option.icon, rotate: (option.icon.rotate ?? 0) + 3 },
  })
);

export const LayoutPane: React.FC<{
  state: StyleInspectorState;
}> = observer(function LayoutPane({ state }) {
  const computedDisplay = state.props.display.computed;
  const computedFlexDirection = state.props.flexDirection.computed;

  const flexInputs =
    computedDisplay === "flex" ? (
      <>
        <RowPackLeft>
          <StyleIconRadio
            options={flexDirectionOptions}
            property={state.props.flexDirection}
          />
          <StyleIconRadio
            options={flexWrapOptions}
            property={state.props.flexWrap}
          />
        </RowPackLeft>
        <RowPackLeft>
          <StyleIconRadio
            options={
              computedFlexDirection?.includes("column")
                ? alignItemsOptionsColumn
                : alignItemsOptionsRow
            }
            property={state.props.alignItems}
          />
          <SizedDimensionInput
            icon={verticalSpaceBarIcon}
            units={lengthPercentageUnits}
            property={state.props.rowGap}
          />
        </RowPackLeft>
        <RowPackLeft>
          <StyleIconRadio
            options={
              computedFlexDirection === "column-reverse"
                ? justifyContentOptionsColumnReverse
                : computedFlexDirection === "row-reverse"
                ? justifyContentOptionsRowReverse
                : computedFlexDirection === "column"
                ? justifyContentOptionsColumn
                : justifyContentOptionsRow
            }
            property={state.props.justifyContent}
          />
          <SizedDimensionInput
            icon={spaceBarIcon}
            units={lengthPercentageUnits}
            property={state.props.columnGap}
          />
        </RowPackLeft>
      </>
    ) : null;

  const paddingInputs =
    computedDisplay !== "none" ? (
      <FourEdgeGrid>
        <StyleDimensionInput
          icon={icons.edgeTop}
          units={lengthPercentageUnits}
          property={state.props.paddingTop}
        />
        <StyleDimensionInput
          icon={icons.edgeRight}
          units={lengthPercentageUnits}
          property={state.props.paddingRight}
        />
        <StyleDimensionInput
          icon={icons.edgeBottom}
          units={lengthPercentageUnits}
          property={state.props.paddingBottom}
        />
        <StyleDimensionInput
          icon={icons.edgeLeft}
          units={lengthPercentageUnits}
          property={state.props.paddingLeft}
        />
      </FourEdgeGrid>
    ) : null;

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Layout</PaneHeading>
      </PaneHeadingRow>
      <RowGroup>
        <StyleIconRadio
          options={displayOptions}
          property={state.props.display}
        />
        {paddingInputs}
        {flexInputs}
        {/* {!state.editorState.commands.autoLayoutChildren.disabled && (
          <Button
            primary
            onClick={state.editorState.commands.autoLayoutChildren.onClick}
          >
            Auto-layout children
          </Button>
        )} */}
      </RowGroup>
    </Pane>
  );
});

const SizedDimensionInput = styled(StyleDimensionInput)`
  width: 72px;
`;
