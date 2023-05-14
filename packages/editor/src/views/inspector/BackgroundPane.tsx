import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import {
  TailwindStyle,
  backgroundColors,
  colors,
} from "../../models/style/TailwindStyle";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { ColorInput } from "@seanchas116/paintkit/src/components/css/ColorInput";

export const BackgroundPane: React.FC = observer(() => {
  const styles = appState.tailwindStyles;

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Background</PaneHeading>
      </PaneHeadingRow>
      <BackgroundComboBox styles={styles} />
    </Pane>
  );
});

const BackgroundComboBox: React.FC<{ styles: TailwindStyle[] }> = observer(
  ({ styles }) => {
    const value = sameOrNone(styles.map((s) => s.props.background.value));

    return (
      <ColorInput
        value={value?.value}
        tokenValue={value?.type === "keyword" ? value.keyword : undefined}
        tokens={backgroundColors}
        onChange={(value) => {
          if (value) {
            for (const style of styles) {
              style.props.background.value = {
                type: "arbitrary",
                value,
              };
            }
          }
        }}
        onTokenChange={(keyword) => {
          if (keyword) {
            for (const style of styles) {
              style.props.background.value = {
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
