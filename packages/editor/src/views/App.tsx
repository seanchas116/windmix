import { observer } from "mobx-react-lite";
import { Viewport } from "./viewport/Viewport";
import { ToolBar } from "./viewport/ToolBar";
import { AppWrap } from "./AppWrap";
import { ErrorPanelTabs } from "./errorPanel/ErrorPanelTabs";

// 221px = 100px * 2 (rows) + 8px * 2 (padding) + 4px (gap) + 1px (border)

const App: React.FC = observer(() => {
  return (
    <AppWrap>
      <div className="w-full h-full flex flex-col relative">
        <ToolBar />
        <Viewport />
        <ErrorPanelTabs className="absolute w-full left-0 bottom-0 " />
      </div>
    </AppWrap>
  );
});

export default App;
