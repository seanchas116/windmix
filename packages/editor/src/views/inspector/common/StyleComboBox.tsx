import { observer } from "mobx-react-lite";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import {
  TailwindStyleKey,
  ResolvedTailwindValue,
  TailwindValue,
} from "../../../models/style/TailwindStyle";
import { SeparateComboBox } from "@seanchas116/paintkit/src/components/ComboBox";
import { appState } from "../../../state/AppState";
import { MIXED } from "@seanchas116/paintkit/src/util/Mixed";
import { getElementTailwindStyle } from "../../../state/getElementTailwindStyle";

export const StyleComboBox: React.FC<{
  className?: string;
  tooltip: React.ReactNode;
  icon: JSX.Element;
  property: TailwindStyleKey;
  tokens: Map<string, string>;
}> = observer(({ className, tooltip, property, tokens, icon }) => {
  const elements = appState.document.selectedElements;
  const styles = elements.map(getElementTailwindStyle);
  const value = sameOrNone(styles.map((s) => s[property].value));

  const setValue = (value: TailwindValue | undefined) => {
    const classNamePreviews: Record<string, string> = {};

    for (const element of elements) {
      const style = getElementTailwindStyle(element);
      style[property].value = value;

      element.className = style.className;
      classNamePreviews[element.id] = style.className;
    }

    appState.document.classNamePreviews = classNamePreviews;
  };

  const pxValue = (value: string) => {
    // rem -> px
    return value.endsWith("rem") ? `${parseFloat(value) * 16}px` : value;
  };

  const options = [...tokens].map(([name, value]) => {
    return {
      value: name,
      text: (
        <>
          {pxValue(value)} <span className="opacity-50">{name}</span>
        </>
      ),
    };
  });

  return (
    <SeparateComboBox
      tooltip={tooltip}
      className={className}
      icon={icon}
      value={value === MIXED ? MIXED : value ? pxValue(value.value) : undefined}
      selectOptions={[
        { value: "", text: <span className="opacity-50">No Value</span> },
        ...options,
      ]}
      selectValue={
        value === MIXED
          ? MIXED
          : value?.type === "keyword"
          ? value.keyword
          : undefined
      }
      onChange={(value) => {
        setValue(value ? { type: "arbitrary", value } : undefined);
        return true;
      }}
      onSelectChange={(keyword) => {
        setValue(
          keyword
            ? ({ type: "keyword", keyword } as ResolvedTailwindValue)
            : undefined
        );
        return true;
      }}
    />
  );
});
