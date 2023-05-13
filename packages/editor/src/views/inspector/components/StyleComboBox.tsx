import { observer } from "mobx-react-lite";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import {
  ResolvedTailwindValue,
  TailwindStyle,
} from "../../../models/style/TailwindStyle";
import { SeparateComboBox } from "@seanchas116/paintkit/src/components/ComboBox";

export const StyleComboBox: React.FC<{
  styles: TailwindStyle[];
  icon: JSX.Element;
  name: "fontSize" | "fontWeight" | "width" | "height";
  tokens: Map<string, string>;
}> = observer(({ styles, name, tokens, icon }) => {
  const value = sameOrNone(styles.map((s) => s[name]));

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
      value={value ? pxValue(value.value) : undefined}
      selectOptions={options}
      selectValue={value?.type === "keyword" ? value.keyword : undefined}
      onChange={(value) => {
        if (value) {
          for (const style of styles) {
            style[name] = {
              type: "arbitrary",
              value,
            };
          }
        }
        return true;
      }}
      onSelectChange={(keyword) => {
        for (const style of styles) {
          style[name] = keyword
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
