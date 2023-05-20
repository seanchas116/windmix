import { Icon } from "@iconify/react";
import { IconButton } from "@seanchas116/paintkit/src/components/IconButton";
import Tippy from "@tippyjs/react";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { appState } from "../../state/AppState";
import { observer } from "mobx-react-lite";
import { ZoomControlController } from "./ZoomControl";
import { artboards } from "../../state/Artboard";
import { breakpoints } from "./constants";

export const ToolBar: React.FC<{
  className?: string;
}> = observer(({ className }) => {
  const tool = appState.tool;

  return (
    <div
      className={twMerge(
        "flex items-center justify-between bg-macaron-uiBackground border-b border-macaron-popoverBorder px-2 py-1",
        className
      )}
    >
      <div className="flex gap-1">
        <Tippy content="Insert Text">
          <IconButton
            pressed={tool?.type === "insert" && tool.insertMode === "text"}
            onClick={action(() => {
              appState.tool = {
                type: "insert",
                insertMode: "text",
              };
            })}
          >
            <Icon icon="icon-park-outline:font-size" />
          </IconButton>
        </Tippy>
        <Tippy content="Insert Box">
          <IconButton
            pressed={tool?.type === "insert" && tool.insertMode === "box"}
            onClick={action(() => {
              appState.tool = {
                type: "insert",
                insertMode: "box",
              };
            })}
          >
            <Icon icon="icon-park-outline:square" />
          </IconButton>
        </Tippy>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Tippy content="Mobile">
            <IconButton
              pressed={artboards.desktop.width < breakpoints[0].minWidth}
              onClick={action(() => {
                artboards.desktop.width = 360;
              })}
            >
              <Icon icon="icon-park-outline:iphone" />
            </IconButton>
          </Tippy>
          <Tippy content="Tablet">
            <IconButton
              pressed={
                breakpoints[0].minWidth <= artboards.desktop.width &&
                artboards.desktop.width < breakpoints[1].minWidth
              }
              onClick={action(() => {
                artboards.desktop.width = 960;
              })}
            >
              <Icon icon="icon-park-outline:ipad" />
            </IconButton>
          </Tippy>
          <Tippy content="Desktop">
            <IconButton
              pressed={artboards.desktop.width >= breakpoints[1].minWidth}
              onClick={action(() => {
                artboards.desktop.width = 1440;
              })}
            >
              <Icon icon="icon-park-outline:new-computer" />
            </IconButton>
          </Tippy>
        </div>
        <ZoomControlController />
      </div>
    </div>
  );
});

ToolBar.displayName = "ToolBar";
