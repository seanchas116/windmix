import { observer } from "mobx-react-lite";
import { appState } from "../state/AppState";
import { StyleInspector } from "./inspector/StyleInspector";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import { ScrollArea } from "@seanchas116/paintkit/src/components/ScrollArea";
import { Outline } from "./outline/Outline";
import { Viewport } from "./Viewport";

const App: React.FC = observer(() => {
  return (
    <div
      className="
    fixed inset-0 flex text-xs
    "
    >
      <aside className="w-[224px] h-full bg-white/5 border-r border-white/5 relative contain-strict">
        <Outline />
      </aside>
      <Viewport />
      <aside className="w-[224px] h-full bg-white/5 border-l border-white/5 relative contain-strict">
        <ScrollArea>
          <PaintkitRoot colorScheme="dark">
            <StyleInspector state={appState.styleInspectorState} />
          </PaintkitRoot>
        </ScrollArea>
      </aside>
    </div>
  );
});

export default App;
