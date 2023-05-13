import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import { ResolvedTailwindValue } from "../../models/style/TailwindStyle";
import { PositionPane } from "./PositionPane";
import { SizePane } from "./SizePane";
import { PaddingPane } from "./PaddingPane";
import { LayoutPane } from "./LayoutPane";
import { TextPane } from "./TextPane";
import { MarginPane } from "./MarginPane";

function stringifyValue(value: ResolvedTailwindValue | undefined) {
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

  const color = sameOrNone(styles.map((s) => s.props.color.value));
  const width = sameOrNone(styles.map((s) => s.props.width.value));
  const height = sameOrNone(styles.map((s) => s.props.height.value));
  const fontSize = sameOrNone(styles.map((s) => s.props.fontSize.value));
  const fontWeight = sameOrNone(styles.map((s) => s.props.fontWeight.value));
  const textAlign = sameOrNone(styles.map((s) => s.props.textAlign.value));

  return (
    <>
      <PositionPane />
      <MarginPane />
      <SizePane />
      <PaddingPane />
      <LayoutPane />
      <TextPane />
      <dl className="p-2">
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
        <dt className="text-macaron-disabledText">Text Align</dt>
        <dd>{stringifyValue(textAlign)}</dd>
      </dl>
    </>
  );
});
