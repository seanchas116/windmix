import React from "react";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";
import { scrollState } from "../../state/ScrollState";

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
      className={twMerge(
        "flex items-center bg-macaron-background border border-macaron-popoverBorder rounded-full",
        className
      )}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <button onClick={onZoomOut} className="px-2 py-1">
        <Icon icon="ic:remove" />
      </button>
      <input
        className="w-10 h-6 rounded text-xs text-center bg-transparent"
        value={`${percentage}%`}
        disabled // TODO: enable
        onChange={action((e) => {
          const newPercent = Number.parseFloat(e.currentTarget.value);
          if (isNaN(newPercent)) {
            return false;
          }
          onChangePercentage(newPercent);
          return true;
        })}
      />
      <button onClick={onZoomIn} className="px-2 p-1">
        <Icon icon="ic:add" />
      </button>
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
