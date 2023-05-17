import { observer } from "mobx-react-lite";
import { TailwindStyleKey } from "../../../models/style/TailwindStyle";
import { appState } from "../../../state/AppState";
import { MIXED, sameOrMixed } from "@seanchas116/paintkit/src/util/Mixed";
import {
  IconRadio,
  IconRadioOption,
} from "@seanchas116/paintkit/src/components/IconRadio";
import { artboards } from "../../../state/Artboard";
import { getElementTailwindStyle } from "../../../state/getElementTailwindStyle";

export const StyleIconRadio = observer(function StyleIconRadio({
  className,
  options,
  property,
}: {
  className?: string;
  options: IconRadioOption<string>[];
  property: TailwindStyleKey;
}) {
  const elements = appState.document.selectedElements;
  const styles = elements.map(getElementTailwindStyle);

  const value = sameOrMixed(styles.map((s) => s[property].value));

  return (
    <IconRadio
      className={className}
      options={options}
      value={
        value === MIXED
          ? undefined
          : value?.type === "keyword"
          ? value.keyword
          : undefined
      }
      unsettable
      onChange={(value) => {
        for (const element of elements) {
          const style = getElementTailwindStyle(element);
          style[property].value = value
            ? { type: "keyword", keyword: value }
            : undefined;
          element.className = style.className;
          artboards.setPreviewClassName(element, style.className);
        }
      }}
    />
  );
});
