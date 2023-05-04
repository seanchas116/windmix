import { observer } from "mobx-react-lite";
import { editorState } from "./EditorState";
import { Renderer } from "./Renderer";

const App: React.FC = observer(() => {
  return (
    <main>
      <div>{editorState.tabPath}</div>
      <Renderer />
    </main>
  );
});

export default App;
