import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import {
  Pane,
  PaneHeadingRow,
  PaneHeading,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";

export const DebugPane: React.FC = observer(() => {
  const nodes = appState.document.selectedNodes;
  const location = sameOrNone(nodes.map((node) => node.location));

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Debug</PaneHeading>
      </PaneHeadingRow>
      <div>
        {location
          ? `Line ${location.line}, Column ${location.column}`
          : "No selection"}
      </div>
    </Pane>
  );
});
