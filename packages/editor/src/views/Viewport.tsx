import { observer } from "mobx-react-lite";
import * as path from "path-browserify";
import { appState } from "../state/AppState";
import { Renderer } from "./Renderer";

export const Viewport: React.FC = observer(() => {
  return (
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
  );
});
