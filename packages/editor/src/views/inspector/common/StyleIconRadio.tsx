import { observer } from "mobx-react-lite";
import { TailwindStyle } from "../../../models/style/TailwindStyle";
import { appState } from "../../../state/AppState";
import { MIXED, sameOrMixed } from "@seanchas116/paintkit/src/util/Mixed";
import {
  IconRadio,
  IconRadioOption,
} from "@seanchas116/paintkit/src/components/IconRadio";

export const StyleIconRadio = observer(function StyleIconRadio({
  className,
  options,
  property,
}: {
  className?: string;
  options: IconRadioOption<string>[];
  property: keyof TailwindStyle["props"];
}) {
  const styles = appState.tailwindStyles;

  const value = sameOrMixed(styles.map((s) => s.props[property].value));

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
        for (const style of styles) {
          style.props[property].value = value
            ? { type: "keyword", keyword: value }
            : undefined;
        }
      }}
    />
  );
});
