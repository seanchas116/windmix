import { Icon } from "@iconify/react";
import { IconButton } from "@seanchas116/paintkit/src/components/IconButton";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const Tab: React.FC<{
  text: string;
  selected: boolean;
  badgeNumber: number;
  badgeType: "info" | "warn" | "error";
  onClick: () => void;
}> = ({ text, selected, badgeNumber, badgeType, onClick }) => {
  const badgeBg =
    badgeType === "info"
      ? "bg-macaron-disabledText"
      : badgeType === "warn"
      ? "bg-yellow-400"
      : "bg-red-400";

  return (
    <button
      className={twMerge(
        "p-1.5 px-2 flex items-center gap-1",
        selected
          ? "text-macaron-text"
          : "text-macaron-disabledText hover:text-macaron-label"
      )}
      onClick={onClick}
    >
      {text}
      <span
        className={twMerge(
          "block min-w-[16px] h-4 px-[3px] rounded-full text-white leading-4 text-center font-bold text-[9px] tabular-nums tracking-tight",
          badgeBg
        )}
      >
        {badgeNumber}
      </span>
    </button>
  );
};

export const ErrorPanelTabs: React.FC<{
  className?: string;
}> = ({ className }) => {
  const [tab, setTab] = useState<"console" | "problems">("console");
  const [open, setOpen] = useState(false);

  return (
    <div className={twMerge("bg-macaron-background", className)}>
      <div className="flex px-2 border-t border-macaron-separator justify-between items-center">
        <div className="flex">
          <Tab
            text="Console"
            selected={tab === "console"}
            onClick={() => {
              setOpen(true);
              setTab("console");
            }}
            badgeType="info"
            badgeNumber={123}
          />
          <Tab
            text="Problems"
            selected={tab === "problems"}
            onClick={() => {
              setOpen(true);
              setTab("problems");
            }}
            badgeType="error"
            badgeNumber={4}
          />
        </div>
        <IconButton
          onClick={() => {
            setOpen(!open);
          }}
        >
          <Icon
            icon={
              open
                ? "material-symbols:keyboard-arrow-down"
                : "material-symbols:keyboard-arrow-up"
            }
            className="text-base"
          />
        </IconButton>
      </div>
      {open && <div className="h-40"></div>}
    </div>
  );
};
