import { observer } from "mobx-react-lite";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  Row11,
  RowPackLeft,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { ComboBox } from "@seanchas116/paintkit/src/components/ComboBox";
import { Icon } from "@iconify/react";
import { Input } from "@seanchas116/paintkit/src/components/Input";
import { IconRadio } from "@seanchas116/paintkit/src/components/IconRadio";
import * as icons from "@seanchas116/design-icons";
import { AlignmentEdit } from "@seanchas116/paintkit/src/components/alignment/AlignmentEdit";
import {
  alignItemsTokens,
  gaps,
  justifyContentTokens,
  paddings,
} from "../../models/style/TailwindStyle";
import { StyleComboBox } from "./common/StyleComboBox";
import { IconButton } from "@seanchas116/paintkit/src/components/IconButton";
import { StyleIconRadio } from "./common/StyleIconRadio";

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
    value: "col",
    tooltip: "Column",
    icon: <Icon icon="ic:arrow-forward" rotate={1} />,
  },
  {
    value: "row-reverse",
    tooltip: "Row Reverse",
    icon: <Icon icon="ic:arrow-forward" rotate={2} />,
  },
  {
    value: "col-reverse",
    tooltip: "Column Reverse",
    icon: <Icon icon="ic:arrow-forward" rotate={3} />,
  },
];

export const LayoutPane: React.FC = observer(() => {
  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Layout</PaneHeading>
      </PaneHeadingRow>
      <RowPackLeft>
        <StyleIconRadio options={layoutOptions} property="display" />
        <StyleIconRadio
          options={layoutDirectionOptions}
          property="flexDirection"
        />
      </RowPackLeft>
      <Row11>
        <StyleComboBox
          icon={<Icon icon="ic:space-bar" />}
          tooltip="Column Gap"
          property="columnGap"
          tokens={gaps}
        />
        <StyleComboBox
          icon={<Icon icon="ic:space-bar" rotate={1} />}
          tooltip="Row Gap"
          property="rowGap"
          tokens={gaps}
        />
      </Row11>
      <div className="flex gap-1">
        <AlignmentEdit
          className="w-[52px]"
          direction="x"
          align="start"
          justify="start"
          onChange={() => {
            // TODO
          }}
        />
        <div
          className="min-w-0 flex flex-col gap-1"
          style={{
            width: "calc((100% - 8px) / 2)",
          }}
        >
          <StyleComboBox
            icon={<Icon icon="icon-park-outline:align-horizontal-center-two" />}
            tooltip="Align Items"
            property="alignItems"
            tokens={alignItemsTokens}
          />
          <StyleComboBox
            icon={<Icon icon="icon-park-outline:align-horizontally" />}
            tooltip="Justify Content"
            property="justifyContent"
            tokens={justifyContentTokens}
          />
        </div>
      </div>
      <div className="flex gap-1 items-center">
        <StyleComboBox
          tooltip="Padding X"
          className="flex-1"
          icon={<Icon icon={icons.edgeTop} rotate={3} />}
          property="mixedPaddingX"
          tokens={paddings}
        />
        <StyleComboBox
          tooltip="Padding Y"
          className="flex-1"
          icon={<Icon icon={icons.edgeTop} />}
          property="mixedPaddingY"
          tokens={paddings}
        />
        <IconButton className="shrink-0">
          <Icon icon={icons.separateEdges} />
        </IconButton>
      </div>
    </Pane>
  );
});
