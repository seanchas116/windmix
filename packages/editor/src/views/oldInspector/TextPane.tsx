import { observer } from "mobx-react-lite";
import React from "react";
import spaceBarIcon from "@iconify-icons/ic/outline-space-bar";
import formatSizeIcon from "@iconify-icons/ic/outline-format-size";
import lineSpacingIcon from "@iconify-icons/ic/outline-format-line-spacing";
import formatAlignLeftIcon from "@iconify-icons/ic/outline-format-align-left";
import formatAlignCenterIcon from "@iconify-icons/ic/outline-format-align-center";
import formatAlignRightIcon from "@iconify-icons/ic/outline-format-align-right";
import lineWeightIcon from "@iconify-icons/ic/outline-line-weight";
import fontDownloadIcon from "@iconify-icons/ic/outline-font-download";
import * as icons from "@seanchas116/design-icons";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
  Row111,
  RowGroup,
  RowPackLeft,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { ComboBox } from "@seanchas116/paintkit/src/components/ComboBox";
import strikethroughIcon from "@iconify-icons/ic/outline-strikethrough-s";
import underlineIcon from "@iconify-icons/ic/outline-format-underlined";
import closeIcon from "@iconify-icons/ic/outline-close";
import { stripQuotes } from "@seanchas116/paintkit/src/util/String";
import { StyleInspectorState } from "../../state/old/OldStyleInspectorState";
import { lengthPercentageEmptyUnits, lengthPercentageUnits } from "./Units";
import {
  StyleColorInput,
  StyleComboBox,
  StyleDimensionInput,
  StyleIconRadio,
} from "./Components";
import { Icon } from "@iconify/react";

const textAlignOptions = [
  {
    value: "left",
    icon: <Icon icon={formatAlignLeftIcon} />,
  },
  {
    value: "center",
    icon: <Icon icon={formatAlignCenterIcon} />,
  },
  {
    value: "right",
    icon: <Icon icon={formatAlignRightIcon} />,
  },
];

const fontStyleOptions = [
  {
    value: "normal",
    icon: <Icon icon={icons.noItalic} />,
  },
  {
    value: "italic",
    icon: <Icon icon={icons.italic} />,
  },
];

const textDecorationOptions = [
  {
    value: "none",
    icon: <Icon icon={closeIcon} />,
  },
  {
    value: "underline",
    icon: <Icon icon={underlineIcon} />,
  },
  {
    value: "line-through",
    icon: <Icon icon={strikethroughIcon} />,
  },
];

const fontWeightOptions = [
  { value: "100", text: "100" },
  { value: "200", text: "200" },
  { value: "300", text: "300" },
  { value: "400", text: "400 (normal)" },
  { value: "500", text: "500" },
  { value: "600", text: "600" },
  { value: "700", text: "700 (bold)" },
  { value: "800", text: "800" },
  { value: "900", text: "900" },
];

export const TextPane: React.FC<{
  state: StyleInspectorState;
}> = observer(function TextPane({ state }) {
  if (!state.textTargets.length) {
    return null;
  }

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Text</PaneHeading>
      </PaneHeadingRow>
      <RowGroup>
        <ComboBox
          icon={<Icon icon={fontDownloadIcon} />}
          tooltip="font-family"
          value={state.props.fontFamily.value}
          placeholder={stripQuotes(state.props.fontFamily.computed ?? "")}
          //options={editorState.fontFamilyOptions}
          onChange={state.props.fontFamily.onChange}
        />
        <Row11>
          <StyleComboBox
            icon={<Icon icon={lineWeightIcon} />}
            options={fontWeightOptions}
            property={state.props.fontWeight}
          />
          <StyleColorInput property={state.props.color} />
        </Row11>
        <Row111>
          <StyleDimensionInput
            icon={<Icon icon={formatSizeIcon} />}
            units={lengthPercentageUnits}
            property={state.props.fontSize}
          />
          <StyleDimensionInput
            icon={<Icon icon={lineSpacingIcon} />}
            units={lengthPercentageEmptyUnits}
            property={state.props.lineHeight}
          />
          <StyleDimensionInput
            icon={<Icon icon={spaceBarIcon} />}
            units={lengthPercentageEmptyUnits}
            property={state.props.letterSpacing}
          />
        </Row111>
        <RowPackLeft>
          <StyleIconRadio
            options={fontStyleOptions}
            property={state.props.fontStyle}
          />
          <StyleIconRadio
            options={textDecorationOptions}
            property={state.props.textDecorationLine}
          />
        </RowPackLeft>
        <StyleIconRadio
          options={textAlignOptions}
          property={state.props.textAlign}
        />
      </RowGroup>
    </Pane>
  );
});
