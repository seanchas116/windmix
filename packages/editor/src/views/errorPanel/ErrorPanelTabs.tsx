import { Icon } from "@iconify/react";
import { IconButton } from "@seanchas116/paintkit/src/components/IconButton";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { artboards } from "../../state/Artboard";
import { appState } from "../../state/AppState";
import { action } from "mobx";
import { LogEntry } from "@windmix/model";

function mostSeriousLogType(logs: LogEntry[]): LogEntry["type"] {
  if (logs.some((log) => log.type === "error")) {
    return "error";
  } else if (logs.some((log) => log.type === "warn")) {
    return "warn";
  } else {
    return "info";
  }
}

const Tab: React.FC<{
  text: string;
  selected: boolean;
  badgeNumber: number;
  badgeType: "log" | "info" | "warn" | "error";
  onClick: () => void;
}> = ({ text, selected, badgeNumber, badgeType, onClick }) => {
  const badgeBg =
    badgeNumber === 0
      ? "bg-macaron-uiBackground"
      : badgeType === "info" || badgeType === "log"
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
              if (open && tab === "console") {
                setOpen(false);
              } else {
                setOpen(true);
              }
              setTab("console");
            }}
            badgeType={mostSeriousLogType(
              artboards.desktop.adapter.unreadConsoleMessages
            )}
            badgeNumber={artboards.desktop.adapter.unreadConsoleMessageCount}
          />
          <Tab
            text="Problems"
            selected={tab === "problems"}
            onClick={() => {
              if (open && tab === "problems") {
                setOpen(false);
              } else {
                setOpen(true);
              }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    action(() => {
      artboards.desktop.adapter.readConsoleMessageCount =
        artboards.desktop.adapter.consoleMessages.length;
    })
  );

  return (
    <LogList logs={[...artboards.desktop.adapter.consoleMessages].reverse()} />
  );
});

const BuildProblemsList: React.FC = observer(() => {
  return <LogList logs={[...appState.document.buildProblems].reverse()} />;
});

const LogList: React.FC<{
  logs: LogEntry[];
}> = ({ logs }) => {
  const ref = useRef<HTMLDivElement>(null);

  // scroll to bottom on show
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  return (
    <div ref={ref} className="h-40 overflow-y-scroll font-mono">
      <div className="flex flex-col-reverse divide-y  divide-y-reverse divide-macaron-separator">
        {logs.map((log, i) => {
          const color =
            log.type === "error"
              ? "text-red-500"
              : log.type === "warn"
              ? "text-yellow-500"
              : "text-macaron-text";

          return (
            <div
              key={i}
              className="flex items-center gap-2 select-text py-1 px-2"
            >
              <div className={color}>{log.messages.join(" ")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
