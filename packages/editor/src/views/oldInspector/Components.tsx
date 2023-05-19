import { ComboBox } from "@seanchas116/paintkit/src/components/ComboBox";
import { DimensionInput } from "@seanchas116/paintkit/src/components/DimensionInput";
import {
  IconRadio,
  IconRadioOption,
} from "@seanchas116/paintkit/src/components/IconRadio";
import { Input, InputProps } from "@seanchas116/paintkit/src/components/Input";
import { CSSColorInput } from "@seanchas116/paintkit/src/components/css/CSSColorInput";
import {
  Select,
  SelectItem,
} from "@seanchas116/paintkit/src/components/Select";
import { kebabCase } from "lodash-es";
import { observer } from "mobx-react-lite";
import React from "react";
import { OldStylePropertyState } from "../../state/old/OldStyleInspectorState";

export const StyleDimensionInput: React.FC<{
  className?: string;
  property: OldStylePropertyState;
  icon?: InputProps["icon"];
  units?: readonly string[];
  keywords?: readonly string[];
}> = observer(({ property, ...props }) => {
  return (
    <DimensionInput
      {...props}
      tooltip={kebabCase(property.key)}
      placeholder={property.computed}
      value={property.value}
      onChange={property.onChange}
    />
  );
});

export const StyleInput: React.FC<{
  className?: string;
  property: OldStylePropertyState;
  icon?: InputProps["icon"];
}> = observer(({ property, ...props }) => {
  return (
    <Input
      {...props}
      tooltip={kebabCase(property.key)}
      placeholder={property.computed}
      value={property.value}
      onChange={property.onChange}
    />
  );
});

export const StyleComboBox: React.FC<{
  className?: string;
  property: OldStylePropertyState;
  icon?: InputProps["icon"];
  options?: SelectItem[];
}> = observer(({ property, ...props }) => {
  return (
    <ComboBox
      {...props}
      tooltip={kebabCase(property.key)}
      placeholder={property.computed}
      value={property.value}
      onChange={property.onChange}
    />
  );
});

export const StyleColorInput: React.FC<{
  className?: string;
  property: OldStylePropertyState;
}> = observer(({ property, ...props }) => {
  return (
    <CSSColorInput
      {...props}
      title={kebabCase(property.key)}
      value={property.value}
      //options={editorState.colorInputOptions}
      //resolveCSSVariable={editorState.resolveCSSVariableCallback}
      placeholder={property.computed}
      onChange={property.onChangeWithoutCommit}
      onChangeEnd={property.onCommit}
    />
  );
});

export const StyleIconRadio: React.FC<{
  className?: string;
  property: OldStylePropertyState;
  options: IconRadioOption<string>[];
}> = observer(({ property, options, ...props }) => {
  return (
    <IconRadio
      {...props}
      options={options.map((option) => ({
        ...option,
        text: `${kebabCase(property.key)}: ${option.value}`,
      }))}
      value={property.value}
      placeholder={property.computed}
      unsettable
      onChange={property.onChange}
    />
  );
});

export const StyleSelect: React.FC<{
  className?: string;
  property: OldStylePropertyState;
  icon?: JSX.Element;
  options?: SelectItem[];
}> = observer(({ property, ...props }) => {
  return (
    <Select
      {...props}
      tooltip={kebabCase(property.key)}
      placeholder={property.computed}
      value={property.value}
      onChange={property.onChange}
    />
  );
});
