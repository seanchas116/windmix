import { Icon } from "@iconify/react";
import { IconButton } from "@seanchas116/paintkit/src/components/IconButton";
import Tippy from "@tippyjs/react";
import { twMerge } from "tailwind-merge";

export const ToolBar: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div
      className={twMerge(
        "flex items-center bg-macaron-background border border-macaron-popoverBorder rounded-full shadow-lg py-1 px-2 gap-1",
        className
      )}
    >
      <Tippy content="Insert Text">
        <IconButton>
          <Icon icon="icon-park-outline:font-size" />
        </IconButton>
      </Tippy>
      <Tippy content="Insert Rectangle">
        <IconButton>
          <Icon icon="icon-park-outline:square" />
        </IconButton>
      </Tippy>
    </div>
  );
};
