import { observer } from "mobx-react-lite";
import { NodeRendererProps, Tree } from "react-arborist";
import { FillFlexParent } from "../../components/FillFlexParent";

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

export const Outline: React.FC = observer(() => {
  return (
    <FillFlexParent>
      {({ width, height }) => (
        <Tree
          initialData={data}
          openByDefault={false}
          width={width}
          height={height}
          indent={16}
          rowHeight={24}
          paddingTop={12}
          paddingBottom={12}
          padding={12}
        >
          {Node}
        </Tree>
      )}
    </FillFlexParent>
  );
});
