import { observer } from "mobx-react-lite";
import React from "react";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row12,
  RowGroup,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import lineWeightIcon from "@iconify-icons/ic/outline-line-weight";
import closeIcon from "@iconify-icons/ic/outline-close";
import * as icons from "@seanchas116/design-icons";
import Tippy from "@tippyjs/react";
import { IconButton } from "@seanchas116/paintkit/src/components/IconButton";
import {
  StyleInspectorState,
  StylePropertyState,
} from "../../state/StyleInspectorState";
import { lengthPercentageUnits } from "./Units";
import {
  StyleColorInput,
  StyleDimensionInput,
  StyleIconRadio,
} from "./Components";

const borderStyleOptions = [
  {
    value: "none",
    icon: closeIcon,
  },
  {
    value: "solid",
    icon: icons.solidLine,
  },
  {
    value: "dotted",
    icon: icons.dottedLine,
  },
  {
    value: "dashed",
    icon: icons.dashedLine,
  },
];

export const BorderPane: React.FC<{
  state: StyleInspectorState;
}> = observer(function BorderPane({ state }) {
  let color: StylePropertyState;
  let width: StylePropertyState;
  let style: StylePropertyState;

  switch (state.borderEdgeMode) {
    case "all":
      color = state.props.borderColor;
      width = state.props.borderWidth;
      style = state.props.borderStyle;
      break;
    case "top":
      color = state.props.borderTopColor;
      width = state.props.borderTopWidth;
      style = state.props.borderTopStyle;
      break;
    case "bottom":
      color = state.props.borderBottomColor;
      width = state.props.borderBottomWidth;
      style = state.props.borderBottomStyle;
      break;
    case "left":
      color = state.props.borderLeftColor;
      width = state.props.borderLeftWidth;
      style = state.props.borderLeftStyle;
      break;
    case "right":
      color = state.props.borderRightColor;
      width = state.props.borderRightWidth;
      style = state.props.borderRightStyle;
  }

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Border</PaneHeading>
        <Tippy content="All">
          <IconButton
            icon={icons.edgeAll}
            pressed={state.borderEdgeMode === "all"}
            onClick={state.setBorderEdgeModeToAll}
          />
        </Tippy>
        <Tippy content="Top">
          <IconButton
            icon={icons.edgeTop}
            pressed={state.borderEdgeMode === "top"}
            onClick={state.setBorderEdgeModeToTop}
          />
        </Tippy>
        <Tippy content="Right">
          <IconButton
            icon={icons.edgeRight}
            pressed={state.borderEdgeMode === "right"}
            onClick={state.setBorderEdgeModeToRight}
          />
        </Tippy>
        <Tippy content="Bottom">
          <IconButton
            icon={icons.edgeBottom}
            pressed={state.borderEdgeMode === "bottom"}
            onClick={state.setBorderEdgeModeToBottom}
          />
        </Tippy>
        <Tippy content="Left">
          <IconButton
            icon={icons.edgeLeft}
            pressed={state.borderEdgeMode === "left"}
            onClick={state.setBorderEdgeModeToLeft}
          />
        </Tippy>
      </PaneHeadingRow>
      <RowGroup>
        <Row12>
          <StyleIconRadio options={borderStyleOptions} property={style} />
          {style.computed !== "none" && (
            <StyleDimensionInput
              icon={lineWeightIcon}
              units={lengthPercentageUnits}
              property={width}
            />
          )}
        </Row12>
        {style.computed !== "none" && <StyleColorInput property={color} />}
      </RowGroup>
    </Pane>
  );
});
