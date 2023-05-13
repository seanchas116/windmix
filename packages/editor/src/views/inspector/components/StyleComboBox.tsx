import { observer } from "mobx-react-lite";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import { ResolvedTailwindValue } from "../../../models/style/TailwindStyle";
import { SeparateComboBox } from "@seanchas116/paintkit/src/components/ComboBox";
import { appState } from "../../../state/AppState";
import { MIXED } from "@seanchas116/paintkit/src/util/Mixed";

type Property =
  | "fontSize"
  | "fontWeight"
  | "width"
  | "height"
  | "mixedMargin"
  | "mixedMarginX"
  | "mixedMarginY"
  | "marginTop"
  | "marginBottom"
  | "marginLeft"
  | "marginRight";

export const StyleComboBox: React.FC<{
  icon: JSX.Element;
  property: Property;
  tokens: Map<string, string>;
}> = observer(({ property, tokens, icon }) => {
  const styles = appState.tailwindStyles;

  const value = sameOrNone(styles.map((s) => s[property]));

  const pxValue = (value: string) => {
    // rem -> px
    return value.endsWith("rem") ? `${parseFloat(value) * 16}px` : value;
  };

  const options = [...tokens].map(([name, value]) => {
    return {
      value: name,
      text: (
        <>
          {name}{" "}
          <span
            style={{
              opacity: 0.5,
            }}
          >
            {pxValue(value)}
          </span>
        </>
      ),
    };
  });

  return (
    <SeparateComboBox
      icon={icon}
      value={value === MIXED ? MIXED : value ? pxValue(value.value) : undefined}
      selectOptions={options}
      selectValue={
        value === MIXED
          ? MIXED
          : value?.type === "keyword"
          ? value.keyword
          : undefined
      }
      onChange={(value) => {
        for (const style of styles) {
          style[property] = value
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
          style[property] = keyword
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
