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

export const LayoutPane: React.FC = observer(() => {
  return (
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
          <Input
            icon={<Icon icon="icon-park-outline:align-horizontal-center-two" />}
            value="Auto"
          />
          <Input
            icon={<Icon icon="icon-park-outline:align-horizontally" />}
            value="Start"
          />
        </div>
      </div>
    </Pane>
  );
});
