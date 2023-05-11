import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";

export const StyleInspector: React.FC = observer(() => {
  const styles = appState.tailwindStyles;
  console.log(styles.map((s) => s.height));

  return <div>{sameOrNone(styles.map((s) => s.color?.value))}</div>;
});
