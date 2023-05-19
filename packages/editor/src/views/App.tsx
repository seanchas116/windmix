import { observer } from "mobx-react-lite";
import { StyleInspector } from "./inspector/StyleInspector";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import { ScrollArea } from "@seanchas116/paintkit/src/components/ScrollArea";
import { Outline } from "./outline/Outline";
import { Viewport } from "./viewport/Viewport";
import { ToolBar } from "./viewport/ToolBar";

// 221px = 100px * 2 (rows) + 8px * 2 (padding) + 4px (gap) + 1px (border)

const App: React.FC = observer(() => {
  return (
    <PaintkitRoot colorScheme="dark">
      <div
        className="
    fixed inset-0 w-screen h-screen flex text-xs
    "
      >
        <aside className="w-[221px] h-full bg-macaron-uiBackground border-r border-macaron-separator relative contain-strict">
          <Outline />
        </aside>
        <div className="flex flex-col flex-1">
          <ToolBar />
          <Viewport />
        </div>
        <aside className="w-[221px] h-full bg-macaron-uiBackground border-l border-macaron-separator relative contain-strict">
          <ScrollArea>
            <StyleInspector />
          </ScrollArea>
        </aside>
      </div>
    </PaintkitRoot>
  );
});

export default App;
