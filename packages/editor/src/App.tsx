import { observer } from "mobx-react-lite";
import { editorState } from "./EditorState";

const App: React.FC = observer(() => {
  return <div>{editorState.tabPath}</div>;
});

export default App;
