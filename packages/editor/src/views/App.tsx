import { observer } from "mobx-react-lite";
import { editorState } from "../state/AppState";
import { Renderer } from "./Renderer";
import * as path from "path-browserify";

const StubInput: React.FC = () => {
  return (
    <div className="h-7 bg-white/5 rounded flex items-center p-2">100</div>
  );
};

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
            {editorState.tabPath &&
              path.basename(
                editorState.tabPath,
                path.extname(editorState.tabPath)
              )}
          </h2>
          <div className="w-[1024px] bg-white">
            <Renderer />
          </div>
        </div>
      </div>
      <aside className="w-[256px] bg-white/5 border-l border-white/5">
        <div className="p-3 flex flex-col gap-2">
          <div>Position</div>
          <div className="grid grid-cols-2 gap-2">
            <StubInput />
            <StubInput />
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <div>Size</div>
          <div className="grid grid-cols-2 gap-2">
            <StubInput />
            <StubInput />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StubInput />
            <StubInput />
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <div>Background</div>
          <div className="grid grid-cols-1 gap-2">
            <StubInput />
          </div>
        </div>
      </aside>
    </main>
  );
});

export default App;
