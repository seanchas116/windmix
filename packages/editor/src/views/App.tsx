import { observer } from "mobx-react-lite";
import { StyleInspector } from "./inspector/StyleInspector";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import { ScrollArea } from "@seanchas116/paintkit/src/components/ScrollArea";
import { Outline } from "./outline/Outline";
import { Viewport } from "./viewport/Viewport";

// 221px = 100px * 2 (rows) + 8px * 2 (padding) + 4px (gap) + 1px (border)

const App: React.FC = observer(() => {
  return (
    <PaintkitRoot colorScheme="dark">
      <div
        className="
    fixed inset-0 w-screen h-screen flex text-xs
    "
      >
        <Viewport />
      </div>
    </PaintkitRoot>
  );
});

export default App;
