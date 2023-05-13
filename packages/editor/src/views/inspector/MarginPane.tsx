import { observer } from "mobx-react-lite";
import {
  FourEdgeGrid,
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
import { StyleComboBox } from "./components/StyleComboBox";
import { margins } from "../../models/style/TailwindStyle";
import { appState } from "../../state/AppState";

export const MarginPane: React.FC = observer(() => {
  const [forceOpen, setForceOpen] = useState(false);
  const [separate, setSeparate] = useState(false);

  const hasMargin = appState.tailwindStyles.some(
    (style) =>
      style.marginTop ||
      style.marginRight ||
      style.marginBottom ||
      style.marginLeft
  );
  const open = forceOpen || hasMargin;

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
          <MinusButton onClick={() => setForceOpen(false)} />
        ) : (
          <PlusButton onClick={() => setForceOpen(true)} />
        )}
      </PaneHeadingRow>
      {open &&
        (separate ? (
          <FourEdgeGrid>
            <StyleComboBox property="marginTop" tokens={margins} />
            <StyleComboBox property="marginRight" tokens={margins} />
            <StyleComboBox property="marginBottom" tokens={margins} />
            <StyleComboBox property="marginLeft" tokens={margins} />
          </FourEdgeGrid>
        ) : (
          <Row11>
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} rotate={3} />}
              property="marginX"
              tokens={margins}
            />
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} />}
              property="marginY"
              tokens={margins}
            />
          </Row11>
        ))}
    </Pane>
  );
});
