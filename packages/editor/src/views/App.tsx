import { observer } from "mobx-react-lite";
import { appState } from "../state/AppState";
import { Renderer } from "./Renderer";
import * as path from "path-browserify";
import { StyleInspector } from "./inspector/StyleInspector";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import { ScrollArea } from "../components/ScrollArea";
import { NodeRendererProps, Tree } from "react-arborist";
import { FillFlexParent } from "../components/FillFlexParent";

function Node({ node, style, dragHandle }: NodeRendererProps<any>) {
  /* This node instance can do many things. See the API reference. */
  return (
    <div style={style} ref={dragHandle} onClick={() => node.toggle()}>
      {node.isLeaf ? " " : node.isOpen ? "-" : "+"} {node.data.name}
    </div>
  );
}

const data = [
  { id: "1", name: "Unread" },
  { id: "2", name: "Threads" },
  {
    id: "3",
    name: "Chat Rooms",
    children: [
      { id: "c1", name: "General" },
      { id: "c2", name: "Random" },
      { id: "c3", name: "Open Source Projects" },
    ],
  },
  {
    id: "4",
    name: "Direct Messages",
    children: [
      { id: "d1", name: "Alice" },
      { id: "d2", name: "Bob" },
      { id: "d3", name: "Charlie" },
    ],
  },
];

const App: React.FC = observer(() => {
  return (
    <main
      className="
    fixed inset-0 flex text-xs
    "
    >
      <aside className="w-[224px] h-full bg-white/5 border-r border-white/5 relative">
        <FillFlexParent>
          {({ width, height }) => (
            <Tree
              initialData={data}
              openByDefault={false}
              width={width}
              height={height}
              indent={16}
              rowHeight={32}
              paddingTop={12}
              paddingBottom={12}
              padding={12}
            >
              {Node}
            </Tree>
          )}
        </FillFlexParent>
      </aside>
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
      <aside className="w-[224px] h-full bg-white/5 border-l border-white/5 relative">
        <ScrollArea className="absolute inset-0 w-full h-full">
          <PaintkitRoot colorScheme="dark">
            <StyleInspector state={appState.styleInspectorState} />
          </PaintkitRoot>
        </ScrollArea>
      </aside>
    </main>
  );
});

export default App;
