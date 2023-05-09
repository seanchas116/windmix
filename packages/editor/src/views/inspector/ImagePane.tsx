import { observer } from "mobx-react-lite";
import React from "react";
import {
  Pane,
  PaneHeading,
  PaneHeadingRow,
  RowGroup,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";
import * as icons from "@seanchas116/design-icons";
import closeIcon from "@iconify-icons/ic/outline-close";
import { IconRadioOption } from "@seanchas116/paintkit/src/components/IconRadio";
import { StyleInspectorState } from "../../state/StyleInspectorState";
import { StyleIconRadio } from "./Components";

const objectFitOptions: IconRadioOption<string>[] = [
  {
    value: "fill",
    icon: icons.sizeFill,
  },
  {
    value: "cover",
    icon: icons.sizeCover,
  },
  {
    value: "contain",
    icon: icons.sizeContain,
  },
  {
    value: "none",
    icon: closeIcon,
  },
];

export const ImagePane: React.FC<{
  state: StyleInspectorState;
}> = observer(function ImagePane({ state }) {
  if (!state.imageTargets.length) {
    return null;
  }

  // TODO: better object-fit toggle group

  return (
    <Pane>
      <PaneHeadingRow>
        <PaneHeading>Image</PaneHeading>
      </PaneHeadingRow>
      <RowGroup>
        <StyleIconRadio
          property={state.props.objectFit}
          options={objectFitOptions}
        />
      </RowGroup>
    </Pane>
  );
});
