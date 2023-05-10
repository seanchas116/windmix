import { observer } from "mobx-react-lite";
import { appState } from "../state/AppState";
import { StyleInspector } from "./inspector/StyleInspector";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import { ScrollArea } from "@seanchas116/paintkit/src/components/ScrollArea";
import { Outline } from "./outline/Outline";
import { Viewport } from "./viewport/Viewport";

const App: React.FC = observer(() => {
  return (
    <PaintkitRoot colorScheme="dark">
      <div
        className="
    fixed inset-0 flex text-xs
    "
      >
        <aside className="w-[224px] h-full bg-macaron-uiBackground border-r border-macaron-separator relative contain-strict">
          <Outline />
        </aside>
        <Viewport />
        <aside className="w-[224px] h-full bg-macaron-uiBackground border-l border-macaron-separator relative">
          <ScrollArea>
            <StyleInspector state={appState.styleInspectorState} />
          </ScrollArea>
        </aside>
      </div>
    </PaintkitRoot>
  );
});

export default App;
