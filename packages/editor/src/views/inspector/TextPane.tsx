import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import {
  TailwindStyle,
  colors,
  fontSizes,
  fontWeights,
} from "../../models/style/TailwindStyle";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { ColorInput } from "@seanchas116/paintkit/src/components/css/ColorInput";
import { Icon } from "@iconify/react";
import { IconRadio } from "@seanchas116/paintkit/src/components/IconRadio";
import formatAlignLeftIcon from "@iconify-icons/ic/outline-format-align-left";
import formatAlignCenterIcon from "@iconify-icons/ic/outline-format-align-center";
import formatAlignRightIcon from "@iconify-icons/ic/outline-format-align-right";
import { StyleComboBox } from "./common/StyleComboBox";

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
  const styles = appState.tailwindStyles;
  const textAlign = sameOrNone(styles.map((s) => s.props.textAlign.value));

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Text</PaneHeading>
      </PaneHeadingRow>
      <ColorComboBox styles={styles} />
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
      <IconRadio
        options={textAlignOptions}
        value={textAlign?.type === "keyword" ? textAlign.keyword : undefined}
        unsettable
        onChange={(value) => {
          for (const style of styles) {
            style.props.textAlign.value = value
              ? {
                  type: "keyword",
                  keyword: value,
                }
              : undefined;
          }
        }}
      />
    </Pane>
  );
});

const ColorComboBox: React.FC<{ styles: TailwindStyle[] }> = observer(
  ({ styles }) => {
    const value = sameOrNone(styles.map((s) => s.props.color.value));

    return (
      <ColorInput
        value={value?.value}
        tokenValue={value?.type === "keyword" ? value.keyword : undefined}
        tokens={colors}
        onChange={(value) => {
          if (value) {
            for (const style of styles) {
              style.props.color.value = {
                type: "arbitrary",
                value,
              };
            }
          }
        }}
        onTokenChange={(keyword) => {
          if (keyword) {
            for (const style of styles) {
              style.props.color.value = {
                type: "keyword",
                keyword,
              };
            }
          }
        }}
      />
    );
  }
);
