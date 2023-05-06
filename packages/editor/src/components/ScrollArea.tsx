import * as RadixScrollArea from "@radix-ui/react-scroll-area";
import { twMerge } from "tailwind-merge";

export function ScrollArea({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <RadixScrollArea.Root
      className={twMerge("flex-1 w-full h-full min-w-0 min-h-0", className)}
    >
      <RadixScrollArea.Viewport
        asChild
        className="absolute top-0 left-0 w-full h-full !block"
      >
        {children}
      </RadixScrollArea.Viewport>
      <RadixScrollArea.Scrollbar orientation="horizontal">
        <RadixScrollArea.Thumb className="bg-white" />
      </RadixScrollArea.Scrollbar>
      <RadixScrollArea.Scrollbar orientation="vertical">
        <RadixScrollArea.Thumb>
          <div className="w-4 h-full relative group">
            <div className="bg-white/20 absolute left-1 right-1 top-1 bottom-1 rounded-full group-hover:bg-white/30"></div>
          </div>
        </RadixScrollArea.Thumb>
      </RadixScrollArea.Scrollbar>
      <RadixScrollArea.Corner />
    </RadixScrollArea.Root>
  );
}
