import { observer } from "mobx-react-lite";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { StyleColorInput } from "./common/StyleColorInput";

export const BackgroundPane: React.FC = observer(() => {
  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Background</PaneHeading>
      </PaneHeadingRow>
      <StyleColorInput property="background" />
    </Pane>
  );
});
