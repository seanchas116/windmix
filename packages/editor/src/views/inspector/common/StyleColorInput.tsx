import { ColorInput } from "@seanchas116/paintkit/src/components/css/ColorInput";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import { observer } from "mobx-react-lite";
import {
  ResolvedTailwindValue,
  TailwindValue,
  backgroundColors,
} from "../../../models/style/TailwindStyle";
import { appState } from "../../../state/AppState";
import { artboards } from "../../../state/Artboard";
import { getElementTailwindStyle } from "../../../state/getElementTailwindStyle";
import { useState } from "react";

export const StyleColorInput: React.FC<{
  className?: string;
  property: "background" | "color" | "ringColor";
}> = observer(({ className, property }) => {
  const [lastValue, setLastValue] = useState<
    ResolvedTailwindValue | undefined
  >();

  const elements = appState.document.selectedElements;
  const styles = elements.map(getElementTailwindStyle);
  const value = lastValue ?? sameOrNone(styles.map((s) => s[property].value));

  const previewValue = (value: ResolvedTailwindValue | undefined) => {
    for (const element of elements) {
      const style = getElementTailwindStyle(element);
      style[property].value = value;
      artboards.setPreviewClassName(element, style.className);
    }

    setLastValue(value);
  };

  const setValue = (value: TailwindValue | undefined) => {
    for (const element of elements) {
      const style = getElementTailwindStyle(element);
      style[property].value = value;

      element.className = style.className;
      artboards.setPreviewClassName(element, style.className);
    }

    setLastValue(undefined);
  };

  return (
    <ColorInput
      className={className}
      value={value?.value}
      tokenValue={value?.type === "keyword" ? value.keyword : undefined}
      tokens={backgroundColors}
      onChange={(value) => {
        previewValue(value ? { type: "arbitrary", value } : undefined);
      }}
      onChangeEnd={() => {
        setValue(lastValue);
      }}
      onTokenChange={(keyword) => {
        setValue(keyword ? { type: "keyword", keyword } : undefined);
      }}
    />
  );
});
