import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";

export const StyleInspector: React.FC = observer(() => {
  const styles = appState.tailwindStyles;
  console.log(styles.map((s) => s.height));

  const color = sameOrNone(styles.map((s) => s.color?.value));
  const width = sameOrNone(styles.map((s) => s.width?.value));
  const height = sameOrNone(styles.map((s) => s.height?.value));

  return (
    <dl>
      <dt className="text-macaron-disabledText">Color</dt>
      <dd>{color}</dd>
      <dt className="text-macaron-disabledText">Width</dt>
      <dd>{width}</dd>
      <dt className="text-macaron-disabledText">Height</dt>
      <dd>{height}</dd>
    </dl>
  );
});
