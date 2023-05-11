import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import {
  TailwindStyle,
  TailwindValue,
  colors,
  fontSizes,
  fontWeights,
  widths,
} from "../../models/style2/TailwindStyle";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { SeparateComboBox } from "@seanchas116/paintkit/src/components/ComboBox";
import { ColorInput } from "@seanchas116/paintkit/src/components/css/ColorInput";
import { Icon } from "@iconify/react";
import { LetterIcon } from "@seanchas116/paintkit/src/components/Input";

function stringifyValue(value: TailwindValue | undefined) {
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
  console.log(styles.map((s) => s.height));

  const color = sameOrNone(styles.map((s) => s.color));
  const width = sameOrNone(styles.map((s) => s.width));
  const height = sameOrNone(styles.map((s) => s.height));
  const fontSize = sameOrNone(styles.map((s) => s.fontSize));
  const fontWeight = sameOrNone(styles.map((s) => s.fontWeight));

  return (
    <>
      <Pane>
        <PaneHeadingRow>
          <PaneHeading>Size</PaneHeading>
        </PaneHeadingRow>
        <div className="grid grid-cols-2 gap-2">
          <SeparateComboBox
            icon={<LetterIcon>W</LetterIcon>}
            value={width?.value}
          />
          <SeparateComboBox
            icon={<LetterIcon>H</LetterIcon>}
            value={height?.value}
          />
        </div>
      </Pane>
      <Pane>
        <PaneHeadingRow>
          <PaneHeading>Text</PaneHeading>
        </PaneHeadingRow>
        <ColorComboBox styles={styles} />
        <div className="grid grid-cols-2 gap-2">
          <FontSizeComboBox styles={styles} />
          <FontWeightComboBox styles={styles} />
        </div>
      </Pane>
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
      </dl>
    </>
  );
});

const ColorComboBox: React.FC<{ styles: TailwindStyle[] }> = ({ styles }) => {
  const value = sameOrNone(styles.map((s) => s.color));

  return (
    <ColorInput
      value={value?.value}
      tokenValue={value?.type === "keyword" ? value.keyword : undefined}
      tokens={colors}
      onChange={(value) => {
        if (value) {
          for (const style of styles) {
            style.color = {
              type: "arbitrary",
              value,
            };
          }
        }
      }}
      onTokenChange={(keyword) => {
        if (keyword) {
          for (const style of styles) {
            style.color = {
              type: "keyword",
              keyword,
              value: "", // unnecessary
            };
          }
        }
      }}
    />
  );
};

const FontSizeComboBox: React.FC<{ styles: TailwindStyle[] }> = ({
  styles,
}) => {
  const value = sameOrNone(styles.map((s) => s.fontSize));

  const pxValue = (value: string) => {
    // rem -> px
    return value.endsWith("rem") ? `${parseFloat(value) * 16}px` : value;
  };

  const options = [...fontSizes].map(([name, value]) => {
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
      icon={<Icon icon="ic:outline-format-size" />}
      value={value ? pxValue(value.value) : undefined}
      selectOptions={options}
      selectValue={value?.type === "keyword" ? value.keyword : undefined}
    />
  );
};

const FontWeightComboBox: React.FC<{ styles: TailwindStyle[] }> = ({
  styles,
}) => {
  const value = sameOrNone(styles.map((s) => s.fontWeight));

  const pxValue = (value: string) => {
    // rem -> px
    return value.endsWith("rem") ? `${parseFloat(value) * 16}px` : value;
  };

  const options = [...fontWeights].map(([name, value]) => {
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
      icon={<Icon icon="ic:outline-line-weight" />}
      value={value ? pxValue(value.value) : undefined}
      selectOptions={options}
      selectValue={value?.type === "keyword" ? value.keyword : undefined}
    />
  );
};
