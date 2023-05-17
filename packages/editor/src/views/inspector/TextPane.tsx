import { observer } from "mobx-react-lite";
import { fontSizes, fontWeights } from "../../models/style/TailwindStyle";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { Icon } from "@iconify/react";
import formatAlignLeftIcon from "@iconify-icons/ic/outline-format-align-left";
import formatAlignCenterIcon from "@iconify-icons/ic/outline-format-align-center";
import formatAlignRightIcon from "@iconify-icons/ic/outline-format-align-right";
import { StyleComboBox } from "./common/StyleComboBox";
import { StyleIconRadio } from "./common/StyleIconRadio";
import { StyleColorInput } from "./common/StyleColorInput";

const textAlignOptions = [
  {
    value: "left",
    text: "Left",
    icon: <Icon icon={formatAlignLeftIcon} />,
  },
  {
    value: "center",
    text: "Center",
    icon: <Icon icon={formatAlignCenterIcon} />,
  },
  {
    value: "right",
    text: "Right",
    icon: <Icon icon={formatAlignRightIcon} />,
  },
];

export const TextPane: React.FC = observer(() => {
  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Text</PaneHeading>
      </PaneHeadingRow>
      <StyleColorInput property="color" />
      <Row11>
        <StyleComboBox
          tooltip="Font Size"
          icon={<Icon icon="ic:outline-format-size" />}
          property="fontSize"
          tokens={fontSizes}
        />
        <StyleComboBox
          tooltip="Font Weight"
          icon={<Icon icon="ic:outline-line-weight" />}
          property="fontWeight"
          tokens={fontWeights}
        />
      </Row11>
      <StyleIconRadio options={textAlignOptions} property="textAlign" />
    </Pane>
  );
});
