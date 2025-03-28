import { ColorInput } from "@seanchas116/paintkit/src/components/css/ColorInput";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import { observer } from "mobx-react-lite";
import {
  ResolvedTailwindValue,
  TailwindValue,
  backgroundColors,
} from "../../../models/style/TailwindStyle";
import { appState } from "../../../state/AppState";
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
    const classNamePreviews: Record<string, string> = {};
    for (const element of elements) {
      const style = getElementTailwindStyle(element);
      style[property].value = value;
      classNamePreviews[element.id] = style.className;
    }
    appState.document.classNamePreviews = classNamePreviews;

    setLastValue(value);
  };

  const setValue = (value: TailwindValue | undefined) => {
    const classNamePreviews: Record<string, string> = {};
    for (const element of elements) {
      const style = getElementTailwindStyle(element);
      style[property].value = value;

      element.className = style.className;
      classNamePreviews[element.id] = style.className;
    }
    appState.document.classNamePreviews = classNamePreviews;

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
