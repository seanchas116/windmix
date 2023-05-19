import React from "react";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";
import { scrollState } from "../../state/ScrollState";
import { IconButton } from "@seanchas116/paintkit/src/components/IconButton";
import styled from "styled-components";
import { Input } from "@seanchas116/paintkit/src/components/Input";

const ZoomInput = styled(Input)`
  width: 40px;
  background: none;
  padding: 0;
  input {
    padding: 0;
    margin: 0;
    text-align: center;
  }
`;

export const ZoomControl: React.FC<{
  className?: string;
  percentage: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onChangePercentage: (percentage: number) => void;
}> = function ZoomControl({
  className,
  percentage,
  onZoomIn,
  onZoomOut,
  onChangePercentage,
}) {
  return (
    <div
      className={twMerge("flex items-center", className)}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <IconButton onClick={onZoomOut}>
        <Icon icon="ic:remove" />
      </IconButton>
      <ZoomInput
        value={`${percentage}%`}
        onChange={action((value) => {
          const newPercent = Number.parseFloat(value);
          if (isNaN(newPercent)) {
            return false;
          }
          onChangePercentage(newPercent);
          return true;
        })}
      />
      <IconButton onClick={onZoomIn}>
        <Icon icon="ic:add" />
      </IconButton>
    </div>
  );
};

export const ZoomControlController: React.FC<{ className?: string }> = observer(
  ({ className }) => {
    const scroll = scrollState;

    const percentage = Math.round(scroll.scale * 100);
    const onZoomOut = action(() => scroll.zoomOut());
    const onZoomIn = action(() => scroll.zoomIn());
    const onChangeZoomPercent = action((percent: number) =>
      scroll.zoomAroundCenter(percent / 100)
    );
    return (
      <ZoomControl
        className={className}
        percentage={percentage}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onChangePercentage={onChangeZoomPercent}
      />
    );
  }
);
