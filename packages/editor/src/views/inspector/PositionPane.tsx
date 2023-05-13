import { observer } from "mobx-react-lite";
import {
  FourEdgeGrid,
  Pane,
  PaneHeading,
  PaneHeadingRow,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { ComboBox } from "@seanchas116/paintkit/src/components/ComboBox";
import { Icon } from "@iconify/react";
import { IconRadio } from "@seanchas116/paintkit/src/components/IconRadio";
import * as icons from "@seanchas116/design-icons";
import {
  MinusButton,
  PlusButton,
} from "@seanchas116/paintkit/src/components/IconButton";
import { useState } from "react";

const positionOptions = [
  {
    value: "static",
    icon: <Icon icon={icons.staticPosition} />,
  },
  {
    value: "relative",
    icon: <Icon icon={icons.relativePosition} />,
  },
  {
    value: "absolute",
    icon: <Icon icon={icons.absolutePosition} />,
  },
];

export const PositionPane: React.FC = observer(() => {
  const [positionPaneOpen, setPositionPaneOpen] = useState(false);

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading dimmed={!positionPaneOpen}>Position</PaneHeading>
        {positionPaneOpen ? (
          <MinusButton onClick={() => setPositionPaneOpen(false)} />
        ) : (
          <PlusButton onClick={() => setPositionPaneOpen(true)} />
        )}
      </PaneHeadingRow>
      {positionPaneOpen && (
        <>
          <IconRadio options={positionOptions} />
          <FourEdgeGrid>
            <ComboBox icon={<Icon icon={icons.edgeTop} />} />
            <ComboBox icon={<Icon icon={icons.edgeTop} rotate={1} />} />
            <ComboBox icon={<Icon icon={icons.edgeTop} rotate={2} />} />
            <ComboBox icon={<Icon icon={icons.edgeTop} rotate={3} />} />
          </FourEdgeGrid>
        </>
      )}
    </Pane>
  );
});
