import { observer } from "mobx-react-lite";
import { appState } from "../state/AppState";
import { Renderer } from "./Renderer";
import * as path from "path-browserify";
import { StyleInspector } from "./inspector/StyleInspector";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";

const App: React.FC = observer(() => {
  return (
    <main
      className="
    fixed inset-0 flex text-xs
    "
    >
      <div className="flex-1">
        <div className="m-4">
          <h2 className="font-semibold mb-1">
            {appState.tabPath &&
              path.basename(appState.tabPath, path.extname(appState.tabPath))}
          </h2>
          <div className="w-[1024px] bg-white">
            <Renderer />
          </div>
        </div>
      </div>
      <aside className="w-[224px] bg-white/5 border-l border-white/5">
        <PaintkitRoot colorScheme="dark">
          <StyleInspector state={appState.styleInspectorState} />
        </PaintkitRoot>
      </aside>
    </main>
  );
});

export default App;
