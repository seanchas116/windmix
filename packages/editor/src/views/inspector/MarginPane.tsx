import { observer } from "mobx-react-lite";
import {
  FourEdgeGrid,
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { ComboBox } from "@seanchas116/paintkit/src/components/ComboBox";
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

export const MarginPane: React.FC = observer(() => {
  const [open, setOpen] = useState(false);
  const [separate, setSeparate] = useState(false);

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
          <FourEdgeGrid>
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} />}
              property="marginTop"
              tokens={margins}
            />
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} rotate={1} />}
              property="marginRight"
              tokens={margins}
            />
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} rotate={2} />}
              property="marginBottom"
              tokens={margins}
            />
            <StyleComboBox
              icon={<Icon icon={icons.edgeTop} rotate={3} />}
              property="marginLeft"
              tokens={margins}
            />
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
