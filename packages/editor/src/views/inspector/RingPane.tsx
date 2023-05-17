import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import {
  TailwindStyle,
  ringColors,
  ringWidths,
} from "../../models/style/TailwindStyle";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { ColorInput } from "@seanchas116/paintkit/src/components/css/ColorInput";
import { Icon } from "@iconify/react";
import { StyleComboBox } from "./common/StyleComboBox";

export const RingPane: React.FC = observer(() => {
  const styles = appState.tailwindStyles;

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Ring</PaneHeading>
      </PaneHeadingRow>
      <BackgroundComboBox styles={styles} />
      <Row11>
        <StyleComboBox
          tooltip="Ring Width"
          icon={<Icon icon="ic:outline-line-weight" />}
          property="ringWidth"
          tokens={ringWidths}
        />
      </Row11>
    </Pane>
  );
});

const BackgroundComboBox: React.FC<{ styles: TailwindStyle[] }> = observer(
  ({ styles }) => {
    const value = sameOrNone(styles.map((s) => s.ringColor.value));

    return (
      <ColorInput
        value={value?.value}
        tokenValue={value?.type === "keyword" ? value.keyword : undefined}
        tokens={ringColors}
        onChange={(value) => {
          for (const style of styles) {
            style.ringColor.value = value
              ? { type: "arbitrary", value }
              : undefined;
          }
        }}
        onTokenChange={(keyword) => {
          for (const style of styles) {
            style.ringColor.value = keyword
              ? { type: "keyword", keyword }
              : undefined;
          }
        }}
      />
    );
  }
);
