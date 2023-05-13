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

export const PaddingPane: React.FC = observer(() => {
  const [open, setOpen] = useState(false);
  const [separate, setSeparate] = useState(false);

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
          <FourEdgeGrid>
            <ComboBox icon={<Icon icon={icons.edgeTop} />} />
            <ComboBox icon={<Icon icon={icons.edgeTop} rotate={1} />} />
            <ComboBox icon={<Icon icon={icons.edgeTop} rotate={2} />} />
            <ComboBox icon={<Icon icon={icons.edgeTop} rotate={3} />} />
          </FourEdgeGrid>
        ) : (
          <Row11>
            <ComboBox icon={<Icon icon={icons.edgeTop} />} />
            <ComboBox icon={<Icon icon={icons.edgeTop} />} />
          </Row11>
        ))}
    </Pane>
  );
});
