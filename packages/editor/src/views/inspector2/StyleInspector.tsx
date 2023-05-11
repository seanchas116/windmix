import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import { TailwindValue } from "../../models/style2/TailwindStyle";

function stringifyValue(value: TailwindValue | undefined) {
  if (!value) {
    return;
  }
  switch (value.type) {
    case "arbitrary":
      return value.value;
    case "keyword":
      return `${value.keyword} (${value.value})`;
  }
}

export const StyleInspector: React.FC = observer(() => {
  const styles = appState.tailwindStyles;
  console.log(styles.map((s) => s.height));

  const color = sameOrNone(styles.map((s) => s.color));
  const width = sameOrNone(styles.map((s) => s.width));
  const height = sameOrNone(styles.map((s) => s.height));
  const fontSize = sameOrNone(styles.map((s) => s.fontSize));
  const fontWeight = sameOrNone(styles.map((s) => s.fontWeight));

  return (
    <dl>
      <dt className="text-macaron-disabledText">Width</dt>
      <dd>{stringifyValue(width)}</dd>
      <dt className="text-macaron-disabledText">Height</dt>
      <dd>{stringifyValue(height)}</dd>
      <dt className="text-macaron-disabledText">Color</dt>
      <dd>{stringifyValue(color)}</dd>
      <dt className="text-macaron-disabledText">Font Size</dt>
      <dd>{stringifyValue(fontSize)}</dd>
      <dt className="text-macaron-disabledText">Font Weight</dt>
      <dd>{stringifyValue(fontWeight)}</dd>
    </dl>
  );
});
