import { observer } from "mobx-react-lite";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { Icon } from "@iconify/react";
import * as icons from "@seanchas116/design-icons";
import {
  IconButton,
  MinusButton,
  PlusButton,
} from "@seanchas116/paintkit/src/components/IconButton";
import { useState } from "react";
import { margins } from "../../models/style/TailwindStyle";
import { appState } from "../../state/AppState";
import { StyleComboBox } from "./common/StyleComboBox";
import { useOnSelectionChange } from "./common/useOnSelectionChange";
import { isEqual } from "lodash-es";

export const MarginPane: React.FC = observer(() => {
  const styles = appState.tailwindStyles;

  const [open, setOpen] = useState(false);
  const [separate, setSeparate] = useState(true);

  useOnSelectionChange(() => {
    const hasMargin = styles.some(
      (style) =>
        style.marginTop.value ||
        style.marginRight.value ||
        style.marginBottom.value ||
        style.marginLeft.value
    );
    const hasSeparateMargin = styles.some(
      (style) =>
        !isEqual(style.marginTop.value, style.marginBottom.value) ||
        !isEqual(style.marginLeft.value, style.marginRight.value)
    );

    setOpen(hasMargin);
    setSeparate(hasSeparateMargin);
  });

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading dimmed={!open}>Margin</PaneHeading>
        {open && (
          <IconButton
            className="shrink-0"
            onClick={() => setSeparate(!separate)}
            pressed={separate}
          >
            <Icon icon={icons.separateEdges} />
          </IconButton>
        )}
        {open ? (
          <MinusButton onClick={() => setOpen(false)} />
        ) : (
          <PlusButton onClick={() => setOpen(true)} />
        )}
      </PaneHeadingRow>
      {open &&
        (separate ? (
          <>
            <Row11>
              <StyleComboBox
                tooltip="Margin left"
                icon={<Icon icon={icons.edgeTop} rotate={3} />}
                property="marginLeft"
                tokens={margins}
              />
              <StyleComboBox
                tooltip="Margin right"
                icon={<Icon icon={icons.edgeTop} rotate={1} />}
                property="marginRight"
                tokens={margins}
              />
            </Row11>
            <Row11>
              <StyleComboBox
                tooltip="Margin top"
                icon={<Icon icon={icons.edgeTop} />}
                property="marginTop"
                tokens={margins}
              />
              <StyleComboBox
                tooltip="Margin bottom"
                icon={<Icon icon={icons.edgeTop} rotate={2} />}
                property="marginBottom"
                tokens={margins}
              />
            </Row11>
          </>
        ) : (
          <Row11>
            <StyleComboBox
              tooltip="Margin X"
              icon={<Icon icon={icons.edgeTop} rotate={3} />}
              property="mixedMarginX"
              tokens={margins}
            />
            <StyleComboBox
              tooltip="Margin Y"
              icon={<Icon icon={icons.edgeTop} />}
              property="mixedMarginY"
              tokens={margins}
            />
          </Row11>
        ))}
    </Pane>
  );
});
