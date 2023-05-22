import { Icon } from "@iconify/react";
import { IconButton } from "@seanchas116/paintkit/src/components/IconButton";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { artboards } from "../../state/Artboard";
import { appState } from "../../state/AppState";

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
}> = observer(({ className }) => {
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
            badgeNumber={artboards.desktop.adapter.consoleMessages.length}
          />
          <Tab
            text="Problems"
            selected={tab === "problems"}
            onClick={() => {
              setOpen(true);
              setTab("problems");
            }}
            badgeType="error"
            badgeNumber={appState.document.buildProblems.length}
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
      {open && tab === "console" && <ConsoleMessageList />}
      {open && tab === "problems" && <BuildProblemsList />}
    </div>
  );
});

const ConsoleMessageList: React.FC = observer(() => {
  const ref = useRef<HTMLDivElement>(null);

  // scroll to bottom on show
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  return (
    <div ref={ref} className="h-40 overflow-y-scroll">
      <div className="p-2 flex flex-col-reverse">
        {[...artboards.desktop.adapter.consoleMessages]
          .reverse()
          .map((message, i) => {
            const color =
              message.level === "log"
                ? "text-macaron-text"
                : message.level === "warn"
                ? "text-yellow-500"
                : "text-red-500";

            return (
              <div key={i} className="flex items-center gap-2 select-text">
                <div className={color}>{message.args.join(" ")}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
});

const BuildProblemsList: React.FC = observer(() => {
  const ref = useRef<HTMLDivElement>(null);

  // scroll to bottom on show
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  const problems = [...appState.document.buildProblems].reverse();

  return (
    <div ref={ref} className="h-40 overflow-y-scroll">
      <div className="p-2 flex flex-col-reverse">
        {problems.map((message, i) => {
          const color =
            message.type === "warning" ? "text-yellow-500" : "text-red-500";

          return (
            <div key={i} className="flex items-center gap-2 select-text">
              <div className={color}>{message.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
