import { Icon } from "@iconify/react";
import { IconButton } from "@seanchas116/paintkit/src/components/IconButton";
import Tippy from "@tippyjs/react";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { appState } from "../../state/AppState";
import { observer } from "mobx-react-lite";

export const ToolBar: React.FC<{
  className?: string;
}> = observer(({ className }) => {
  const tool = appState.tool;

  return (
    <div
      className={twMerge(
        "flex items-center bg-macaron-background border border-macaron-popoverBorder rounded-full shadow-lg py-1 px-2 gap-1",
        className
      )}
    >
      <Tippy content="Insert Text">
        <IconButton
          pressed={tool?.type === "insert" && tool.nodeType === "text"}
          onClick={action(() => {
            appState.tool = {
              type: "insert",
              nodeType: "text",
            };
          })}
        >
          <Icon icon="icon-park-outline:font-size" />
        </IconButton>
      </Tippy>
      <Tippy content="Insert Box">
        <IconButton
          pressed={tool?.type === "insert" && tool.nodeType === "box"}
          onClick={action(() => {
            appState.tool = {
              type: "insert",
              nodeType: "box",
            };
          })}
        >
          <Icon icon="icon-park-outline:square" />
        </IconButton>
      </Tippy>
    </div>
  );
});

ToolBar.displayName = "ToolBar";
