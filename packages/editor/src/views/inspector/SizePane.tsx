import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { heights, widths } from "../../models/style/TailwindStyle";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { Icon } from "@iconify/react";
import { LetterIcon } from "@seanchas116/paintkit/src/components/Input";
import { IconRadio } from "@seanchas116/paintkit/src/components/IconRadio";
import * as icons from "@seanchas116/design-icons";
import {
  MinusButton,
  PlusButton,
} from "@seanchas116/paintkit/src/components/IconButton";
import { useState } from "react";
import { StyleComboBox } from "./components/StyleComboBox";

const horizontalSizeConstraintOptions = [
  {
    value: "hug",
    text: "Hug Contents",
    icon: <Icon icon={icons.hugContents} />,
  },
  {
    value: "fixed",
    text: "Fixed",
    icon: <Icon icon={icons.fixedSize} />,
  },
  {
    value: "fill",
    text: "Fill Container",
    icon: <Icon icon={icons.fillArea} />,
  },
];

const verticalSizeConstraintOptions = [
  {
    value: "hug",
    text: "Hug Contents",
    icon: <Icon icon={icons.hugContents} rotate={1} />,
  },
  {
    value: "fixed",
    text: "Fixed",
    icon: <Icon icon={icons.fixedSize} rotate={1} />,
  },
  {
    value: "fill",
    text: "Fill Container",
    icon: <Icon icon={icons.fillArea} rotate={1} />,
  },
];

export const SizePane: React.FC = observer(() => {
  const styles = appState.tailwindStyles;
  const [sizePaneOpen, setSizePaneOpen] = useState(false);

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading dimmed={!sizePaneOpen}>Size</PaneHeading>
        {sizePaneOpen ? (
          <MinusButton onClick={() => setSizePaneOpen(false)} />
        ) : (
          <PlusButton onClick={() => setSizePaneOpen(true)} />
        )}
      </PaneHeadingRow>
      {sizePaneOpen && (
        <>
          <Row11>
            <StyleComboBox
              styles={styles}
              icon={<LetterIcon>W</LetterIcon>}
              name="width"
              tokens={widths}
            />
            <IconRadio options={horizontalSizeConstraintOptions} />
          </Row11>
          <Row11>
            <StyleComboBox
              styles={styles}
              icon={<LetterIcon>H</LetterIcon>}
              name="height"
              tokens={heights}
            />
            <IconRadio options={verticalSizeConstraintOptions} />
          </Row11>
        </>
      )}
    </Pane>
  );
});
