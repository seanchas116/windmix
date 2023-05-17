import { observer } from "mobx-react-lite";
import { ringWidths } from "../../models/style/TailwindStyle";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { Icon } from "@iconify/react";
import { StyleComboBox } from "./common/StyleComboBox";
import { StyleColorInput } from "./common/StyleColorInput";

export const RingPane: React.FC = observer(() => {
  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Ring</PaneHeading>
      </PaneHeadingRow>
      <StyleColorInput property="ringColor" />
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
