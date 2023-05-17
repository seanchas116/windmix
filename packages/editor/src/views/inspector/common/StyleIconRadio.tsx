import { observer } from "mobx-react-lite";
import { TailwindStyleKey } from "../../../models/style/TailwindStyle";
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
  property: TailwindStyleKey;
}) {
  const styles = appState.tailwindStyles;

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
        for (const style of styles) {
          style[property].value = value
            ? { type: "keyword", keyword: value }
            : undefined;
        }
      }}
    />
  );
});
