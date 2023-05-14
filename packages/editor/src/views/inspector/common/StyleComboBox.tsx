import { observer } from "mobx-react-lite";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import {
  ResolvedTailwindValue,
  TailwindStyle,
} from "../../../models/style/TailwindStyle";
import { SeparateComboBox } from "@seanchas116/paintkit/src/components/ComboBox";
import { appState } from "../../../state/AppState";
import { MIXED } from "@seanchas116/paintkit/src/util/Mixed";

export const StyleComboBox: React.FC<{
  className?: string;
  tooltip: React.ReactNode;
  icon: JSX.Element;
  property: keyof TailwindStyle["props"];
  tokens: Map<string, string>;
}> = observer(({ className, tooltip, property, tokens, icon }) => {
  const styles = appState.tailwindStyles;

  const value = sameOrNone(styles.map((s) => s.props[property].value));

  const pxValue = (value: string) => {
    // rem -> px
    return value.endsWith("rem") ? `${parseFloat(value) * 16}px` : value;
  };

  const options = [...tokens].map(([name, value]) => {
    return {
      value: name,
      text: (
        <>
          {name} <span className="opacity-50">{pxValue(value)}</span>
        </>
      ),
    };
  });

  return (
    <SeparateComboBox
      title={tooltip}
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
        for (const style of styles) {
          style.props[property].value = value
            ? {
                type: "arbitrary",
                value,
              }
            : undefined;
        }
        return true;
      }}
      onSelectChange={(keyword) => {
        for (const style of styles) {
          style.props[property].value = keyword
            ? ({
                type: "keyword",
                keyword,
              } as ResolvedTailwindValue)
            : undefined;
        }
        return true;
      }}
    />
  );
});
