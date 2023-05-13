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
import { Icon } from "@iconify/react";
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
    icon: <Icon icon={closeIcon} />,
  },
  {
    value: "solid",
    icon: <Icon icon={icons.solidLine} />,
  },
  {
    value: "dotted",
    icon: <Icon icon={icons.dottedLine} />,
  },
  {
    value: "dashed",
    icon: <Icon icon={icons.dashedLine} />,
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
            pressed={state.borderEdgeMode === "all"}
            onClick={state.setBorderEdgeModeToAll}
          >
            <Icon icon={icons.edgeAll} />
          </IconButton>
        </Tippy>
        <Tippy content="Top">
          <IconButton
            pressed={state.borderEdgeMode === "top"}
            onClick={state.setBorderEdgeModeToTop}
          >
            <Icon icon={icons.edgeTop} />
          </IconButton>
        </Tippy>
        <Tippy content="Right">
          <IconButton
            pressed={state.borderEdgeMode === "right"}
            onClick={state.setBorderEdgeModeToRight}
          >
            <Icon icon={icons.edgeRight} />
          </IconButton>
        </Tippy>
        <Tippy content="Bottom">
          <IconButton
            pressed={state.borderEdgeMode === "bottom"}
            onClick={state.setBorderEdgeModeToBottom}
          >
            <Icon icon={icons.edgeBottom} />
          </IconButton>
        </Tippy>
        <Tippy content="Left">
          <IconButton
            pressed={state.borderEdgeMode === "left"}
            onClick={state.setBorderEdgeModeToLeft}
          >
            <Icon icon={icons.edgeLeft} />
          </IconButton>
        </Tippy>
      </PaneHeadingRow>
      <RowGroup>
        <Row12>
          <StyleIconRadio options={borderStyleOptions} property={style} />
          {style.computed !== "none" && (
            <StyleDimensionInput
              icon={<Icon icon={lineWeightIcon} />}
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
