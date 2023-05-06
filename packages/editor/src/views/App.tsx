import { observer } from "mobx-react-lite";
import { appState } from "../state/AppState";
import { Renderer } from "./Renderer";
import * as path from "path-browserify";
import { StyleInspector } from "./inspector/StyleInspector";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import { ScrollArea } from "@seanchas116/paintkit/src/components/ScrollArea";
import { Outline } from "./outline/Outline";

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
      <main className="flex-1 min-w-0 contain-strict">
        <div className="m-4">
          <h2 className="font-semibold mb-1">
            {appState.tabPath &&
              path.basename(appState.tabPath, path.extname(appState.tabPath))}
          </h2>
          <div className="w-[1024px] bg-white">
            <Renderer />
          </div>
        </div>
      </main>
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
