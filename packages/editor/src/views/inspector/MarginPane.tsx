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

export const MarginPane: React.FC = observer(() => {
  const styles = appState.tailwindStyles;

  const [open, setOpen] = useState(false);
  const [separate, setSeparate] = useState(true);

  useOnSelectionChange(() => {
    const hasMargin = styles.some(
      (style) =>
        style.props.marginTop.value ||
        style.props.marginRight.value ||
        style.props.marginBottom.value ||
        style.props.marginLeft.value
    );
    const hasSeparateMargin = styles.some(
      (style) =>
        style.props.marginTop.value !== style.props.marginBottom.value ||
        style.props.marginLeft.value !== style.props.marginRight.value
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
                icon={<Icon icon={icons.edgeTop} rotate={3} />}
                property="marginLeft"
                tokens={margins}
              />
              <StyleComboBox
                icon={<Icon icon={icons.edgeTop} rotate={1} />}
                property="marginRight"
                tokens={margins}
              />
            </Row11>
            <Row11>
              <StyleComboBox
                icon={<Icon icon={icons.edgeTop} />}
                property="marginTop"
                tokens={margins}
              />
              <StyleComboBox
                icon={<Icon icon={icons.edgeTop} rotate={2} />}
                property="marginBottom"
                tokens={margins}
              />
            </Row11>
          </>
        ) : (
          <Row11>
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} rotate={3} />}
              property="mixedMarginX"
              tokens={margins}
            />
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} />}
              property="mixedMarginY"
              tokens={margins}
            />
          </Row11>
        ))}
    </Pane>
  );
});
