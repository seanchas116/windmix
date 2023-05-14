import { observer } from "mobx-react-lite";
import {
  FourEdgeGrid,
  Pane,
  Row11,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import { Icon } from "@iconify/react";
import { IconRadio } from "@seanchas116/paintkit/src/components/IconRadio";
import * as icons from "@seanchas116/design-icons";
import { LetterIcon } from "@seanchas116/paintkit/src/components/Input";
import {
  widths,
  heights,
  margins,
  maxWidths,
  radiuses,
  insets,
} from "../../models/style/TailwindStyle";
import { StyleComboBox } from "./common/StyleComboBox";
import { StyleIconRadio } from "./common/StyleIconRadio";

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

const flexItemConstraintsOptions = [
  {
    value: "start",
    text: "Flex Start",
    icon: <Icon icon="material-symbols:align-flex-start" />,
  },
  {
    value: "center",
    text: "Flex Center",
    icon: <Icon icon="material-symbols:align-flex-center" />,
  },
  {
    value: "end",
    text: "Flex End",
    icon: <Icon icon="material-symbols:align-flex-end" />,
  },
  {
    value: "fill",
    text: "Stretch",
    icon: <Icon icon="material-symbols:align-self-stretch" />,
  },
];

export const DimensionPane: React.FC = observer(() => {
  return (
    <>
      <Pane>
        <StyleIconRadio options={positionOptions} property="position" />
        <FourEdgeGrid>
          <StyleComboBox
            tooltip="Top"
            icon={<LetterIcon>T</LetterIcon>}
            property="top"
            tokens={insets}
          />
          <StyleComboBox
            tooltip="Right"
            icon={<LetterIcon>R</LetterIcon>}
            property="right"
            tokens={insets}
          />
          <StyleComboBox
            tooltip="Bottom"
            icon={<LetterIcon>B</LetterIcon>}
            property="bottom"
            tokens={insets}
          />
          <StyleComboBox
            tooltip="Left"
            icon={<LetterIcon>L</LetterIcon>}
            property="left"
            tokens={insets}
          />
        </FourEdgeGrid>
        <Row11>
          <StyleComboBox
            tooltip="Margin left"
            icon={<Icon icon={icons.edgeTop} rotate={3} />}
            property="marginLeft"
            tokens={margins}
          />
          <StyleComboBox
            tooltip="Margin right"
            icon={<Icon icon={icons.edgeTop} rotate={1} />}
            property="marginRight"
            tokens={margins}
          />
        </Row11>
        <Row11>
          <StyleComboBox
            tooltip="Margin top"
            icon={<Icon icon={icons.edgeTop} />}
            property="marginTop"
            tokens={margins}
          />
          <StyleComboBox
            tooltip="Margin bottom"
            icon={<Icon icon={icons.edgeTop} rotate={2} />}
            property="marginBottom"
            tokens={margins}
          />
        </Row11>
      </Pane>
      <Pane>
        <Row11>
          <StyleComboBox
            tooltip="Width"
            icon={<LetterIcon>W</LetterIcon>}
            property="width"
            tokens={widths}
          />
          <IconRadio
            options={[
              {
                value: "flex-1",
                text: "Flex 1",
                icon: <Icon icon={icons.fillArea} />,
              },
            ]}
          />
        </Row11>
        <Row11>
          <StyleComboBox
            tooltip="Height"
            icon={<LetterIcon>H</LetterIcon>}
            property="height"
            tokens={heights}
          />
          <IconRadio options={flexItemConstraintsOptions} />
        </Row11>
        <Row11>
          <StyleComboBox
            tooltip="Max Width"
            icon={<LetterIcon>{"<"}</LetterIcon>}
            property="maxWidth"
            tokens={maxWidths}
          />
        </Row11>
        <Row11>
          <StyleComboBox
            tooltip="Radius"
            icon={<Icon icon="material-symbols:line-curve" />}
            property="radius"
            tokens={radiuses}
          />
        </Row11>
      </Pane>
    </>
  );
});
