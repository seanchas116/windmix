import { observer } from "mobx-react-lite";
import { appState } from "../../state/AppState";
import { sameOrNone } from "@seanchas116/paintkit/src/util/Collection";
import {
  ResolvedTailwindValue,
  TailwindStyle,
  colors,
  fontSizes,
  fontWeights,
  heights,
  widths,
} from "../../models/style2/TailwindStyle";
import {
  FourEdgeGrid,
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
  RowPackLeft,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import {
  ComboBox,
  SeparateComboBox,
} from "@seanchas116/paintkit/src/components/ComboBox";
import { ColorInput } from "@seanchas116/paintkit/src/components/css/ColorInput";
import { Icon } from "@iconify/react";
import { Input, LetterIcon } from "@seanchas116/paintkit/src/components/Input";
import { IconRadio } from "@seanchas116/paintkit/src/components/IconRadio";
import formatAlignLeftIcon from "@iconify-icons/ic/outline-format-align-left";
import formatAlignCenterIcon from "@iconify-icons/ic/outline-format-align-center";
import formatAlignRightIcon from "@iconify-icons/ic/outline-format-align-right";
import * as icons from "@seanchas116/design-icons";
import {
  IconButton,
  MinusButton,
  PlusButton,
} from "@seanchas116/paintkit/src/components/IconButton";
import { AlignmentEdit } from "@seanchas116/paintkit/src/components/alignment/AlignmentEdit";
import { useState } from "react";

const textAlignOptions = [
  {
    value: "left",
    text: "Left",
    icon: <Icon icon={formatAlignLeftIcon} />,
  },
  {
    value: "center",
    text: "Center",
    icon: <Icon icon={formatAlignCenterIcon} />,
  },
  {
    value: "right",
    text: "Right",
    icon: <Icon icon={formatAlignRightIcon} />,
  },
];

function stringifyValue(value: ResolvedTailwindValue | undefined) {
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

const positionOptions = [
  {
    value: "static",
    icon: <Icon icon={icons.staticPosition} />,
  },
  {
    value: "relative",
    icon: <Icon icon={icons.relativePosition} />,
  },
  {
    value: "absolute",
    icon: <Icon icon={icons.absolutePosition} />,
  },
];

const horizontalSizeConstraintOptions = [
  {
    value: "hug",
    text: "Hug Contents",
    icon: <Icon icon={icons.hugContents} />,
  },
  {
    value: "fixed",
    text: "Fixed",
    icon: <Icon icon={icons.fixedSize} />,
  },
  {
    value: "fill",
    text: "Fill Container",
    icon: <Icon icon={icons.fillArea} />,
  },
];

const verticalSizeConstraintOptions = [
  {
    value: "hug",
    text: "Hug Contents",
    icon: <Icon icon={icons.hugContents} rotate={1} />,
  },
  {
    value: "fixed",
    text: "Fixed",
    icon: <Icon icon={icons.fixedSize} rotate={1} />,
  },
  {
    value: "fill",
    text: "Fill Container",
    icon: <Icon icon={icons.fillArea} rotate={1} />,
  },
];

const layoutOptions = [
  {
    value: "block",
    tooltip: "Block",
    icon: <Icon icon={icons.staticPosition} />,
  },
  {
    value: "flex",
    tooltip: "Flex",
    icon: <Icon icon={icons.hStack} />,
  },
  {
    value: "grid",
    tooltip: "Grid",
    icon: <Icon icon="icon-park-outline:all-application" />,
  },
];

const layoutDirectionOptions = [
  {
    value: "row",
    tooltip: "Row",
    icon: <Icon icon="ic:arrow-forward" />,
  },
  {
    value: "column",
    tooltip: "Column",
    icon: <Icon icon="ic:arrow-forward" rotate={1} />,
  },
  {
    value: "row-reverse",
    tooltip: "Row Reverse",
    icon: <Icon icon="ic:arrow-forward" rotate={2} />,
  },
  {
    value: "column-reverse",
    tooltip: "Column Reverse",
    icon: <Icon icon="ic:arrow-forward" rotate={3} />,
  },
];

export const StyleInspector: React.FC = observer(() => {
  const styles = appState.tailwindStyles;
  console.log(styles.map((s) => s.height));

  const color = sameOrNone(styles.map((s) => s.color));
  const width = sameOrNone(styles.map((s) => s.width));
  const height = sameOrNone(styles.map((s) => s.height));
  const fontSize = sameOrNone(styles.map((s) => s.fontSize));
  const fontWeight = sameOrNone(styles.map((s) => s.fontWeight));
  const textAlign = sameOrNone(styles.map((s) => s.textAlign));

  const [positionPaneOpen, setPositionPaneOpen] = useState(false);
  const [sizePaneOpen, setSizePaneOpen] = useState(false);
  const [paddingPaneOpen, setPaddingPaneOpen] = useState(false);
  const [separateMargins, setSeparateMargins] = useState(false);

  return (
    <>
      <Pane>
        <PaneHeadingRow>
          <PaneHeading dimmed={!positionPaneOpen}>Position</PaneHeading>
          {positionPaneOpen ? (
            <MinusButton onClick={() => setPositionPaneOpen(false)} />
          ) : (
            <PlusButton onClick={() => setPositionPaneOpen(true)} />
          )}
        </PaneHeadingRow>
        {positionPaneOpen && (
          <>
            <IconRadio options={positionOptions} />
            <FourEdgeGrid>
              <ComboBox icon={<Icon icon={icons.edgeTop} />} />
              <ComboBox icon={<Icon icon={icons.edgeTop} rotate={1} />} />
              <ComboBox icon={<Icon icon={icons.edgeTop} rotate={2} />} />
              <ComboBox icon={<Icon icon={icons.edgeTop} rotate={3} />} />
            </FourEdgeGrid>
          </>
        )}
      </Pane>
      <Pane>
        <PaneHeadingRow>
          <PaneHeading dimmed={!sizePaneOpen}>Size</PaneHeading>
          {sizePaneOpen ? (
            <MinusButton onClick={() => setSizePaneOpen(false)} />
          ) : (
            <PlusButton onClick={() => setSizePaneOpen(true)} />
          )}
        </PaneHeadingRow>
        {sizePaneOpen && (
          <>
            <Row11>
              <StyleComboBox
                styles={styles}
                icon={<LetterIcon>W</LetterIcon>}
                name="width"
                tokens={widths}
              />
              <IconRadio options={horizontalSizeConstraintOptions} />
            </Row11>
            <Row11>
              <StyleComboBox
                styles={styles}
                icon={<LetterIcon>H</LetterIcon>}
                name="height"
                tokens={heights}
              />
              <IconRadio options={verticalSizeConstraintOptions} />
            </Row11>
          </>
        )}
      </Pane>
      <Pane>
        <PaneHeadingRow>
          <PaneHeading dimmed={!paddingPaneOpen}>Padding</PaneHeading>
          {paddingPaneOpen && (
            <IconButton
              className="shrink-0"
              onClick={() => setSeparateMargins(!separateMargins)}
              pressed={separateMargins}
            >
              <Icon icon={icons.separateEdges} />
            </IconButton>
          )}
          {paddingPaneOpen ? (
            <MinusButton onClick={() => setPaddingPaneOpen(false)} />
          ) : (
            <PlusButton onClick={() => setPaddingPaneOpen(true)} />
          )}
        </PaneHeadingRow>
        {paddingPaneOpen &&
          (separateMargins ? (
            <FourEdgeGrid>
              <ComboBox icon={<Icon icon={icons.edgeTop} />} />
              <ComboBox icon={<Icon icon={icons.edgeTop} rotate={1} />} />
              <ComboBox icon={<Icon icon={icons.edgeTop} rotate={2} />} />
              <ComboBox icon={<Icon icon={icons.edgeTop} rotate={3} />} />
            </FourEdgeGrid>
          ) : (
            <Row11>
              <ComboBox icon={<Icon icon={icons.edgeTop} />} />
              <ComboBox icon={<Icon icon={icons.edgeTop} />} />
            </Row11>
          ))}
      </Pane>
      <Pane>
        <PaneHeadingRow>
          <PaneHeading>Layout</PaneHeading>
        </PaneHeadingRow>
        <RowPackLeft>
          <IconRadio options={layoutOptions} />
          <IconRadio options={layoutDirectionOptions} />
        </RowPackLeft>
        <Row11>
          <ComboBox icon={<Icon icon="ic:space-bar" />} />
          <ComboBox icon={<Icon icon="ic:space-bar" rotate={1} />} />
        </Row11>
        <div className="flex gap-1">
          <AlignmentEdit
            className="w-[52px]"
            direction="x"
            align="start"
            justify="start"
            onChange={(align, justify) => {
              // TODO
            }}
          />
          <div
            className="min-w-0 flex flex-col gap-1"
            style={{
              width: "calc((100% - 8px) / 2)",
            }}
          >
            <Input icon={<Icon icon="ic:space-bar" />} value="Auto" />
            <Input icon={<Icon icon="ic:space-bar" />} value="Start" />
          </div>
        </div>
      </Pane>
      <Pane>
        <PaneHeadingRow>
          <PaneHeading>Text</PaneHeading>
        </PaneHeadingRow>
        <ColorComboBox styles={styles} />
        <Row11>
          <StyleComboBox
            styles={styles}
            icon={<Icon icon="ic:outline-format-size" />}
            name="fontSize"
            tokens={fontSizes}
          />
          <StyleComboBox
            styles={styles}
            icon={<Icon icon="ic:outline-line-weight" />}
            name="fontWeight"
            tokens={fontWeights}
          />
        </Row11>
        <IconRadio
          options={textAlignOptions}
          value={textAlign?.type === "keyword" ? textAlign.keyword : undefined}
          unsettable
          onChange={(value) => {
            for (const style of styles) {
              style.textAlign = value
                ? {
                    type: "keyword",
                    keyword: value,
                  }
                : undefined;
            }
          }}
        />
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
        <dt className="text-macaron-disabledText">Text Align</dt>
        <dd>{stringifyValue(textAlign)}</dd>
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
            };
          }
        }
      }}
    />
  );
};

const StyleComboBox: React.FC<{
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
