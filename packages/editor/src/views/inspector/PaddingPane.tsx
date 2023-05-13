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
import { paddings } from "../../models/style/TailwindStyle";
import { appState } from "../../state/AppState";
import { StyleComboBox } from "./common/StyleComboBox";
import { useOnSelectionChange } from "./common/useOnSelectionChange";
import { isEqual } from "lodash-es";

export const PaddingPane: React.FC = observer(() => {
  const styles = appState.tailwindStyles;

  const [open, setOpen] = useState(false);
  const [separate, setSeparate] = useState(true);

  useOnSelectionChange(() => {
    const hasPadding = styles.some(
      (style) =>
        style.props.paddingTop.value ||
        style.props.paddingRight.value ||
        style.props.paddingBottom.value ||
        style.props.paddingLeft.value
    );
    const hasSeparatePadding = styles.some(
      (style) =>
        !isEqual(
          style.props.paddingTop.value,
          style.props.paddingBottom.value
        ) ||
        !isEqual(style.props.paddingLeft.value, style.props.paddingRight.value)
    );

    setOpen(hasPadding);
    setSeparate(hasSeparatePadding);
  });

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading dimmed={!open}>Padding</PaneHeading>
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
                icon={<Icon icon={icons.edgeTop} rotate={3} />}
                property="paddingLeft"
                tokens={paddings}
              />
              <StyleComboBox
                icon={<Icon icon={icons.edgeTop} rotate={1} />}
                property="paddingRight"
                tokens={paddings}
              />
            </Row11>
            <Row11>
              <StyleComboBox
                icon={<Icon icon={icons.edgeTop} />}
                property="paddingTop"
                tokens={paddings}
              />
              <StyleComboBox
                icon={<Icon icon={icons.edgeTop} rotate={2} />}
                property="paddingBottom"
                tokens={paddings}
              />
            </Row11>
          </>
        ) : (
          <Row11>
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} rotate={3} />}
              property="mixedPaddingX"
              tokens={paddings}
            />
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} />}
              property="mixedPaddingY"
              tokens={paddings}
            />
          </Row11>
        ))}
    </Pane>
  );
});
