import { observer } from "mobx-react-lite";
import { editorState } from "./EditorState";
import { Renderer } from "./Renderer";
import * as path from "path-browserify";

const App: React.FC = observer(() => {
  return (
    <main>
      <div>{editorState.tabPath}</div>
      <div className="m-8">
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
    </main>
  );
});

export default App;
