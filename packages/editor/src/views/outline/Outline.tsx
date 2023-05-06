import { observer } from "mobx-react-lite";
import { NodeRendererProps, Tree } from "react-arborist";
import { FillFlexParent } from "../../components/FillFlexParent";
import { Icon } from "@iconify/react";
import { Node } from "@windmix/model";
import { appState } from "../../state/AppState";

function NodeRow({
  node: treeNode,
  style,
  dragHandle,
}: NodeRendererProps<TreeData>) {
  /* This node instance can do many things. See the API reference. */
  const node = treeNode.data.node;

  const getName = () => {
    switch (node.type) {
      case "component":
        return node.name;
      case "element":
        return node.data.get("tagName");
      case "text":
        return node.data.get("text");
      case "expression":
        return node.data.get("code");
      case "wrappingExpression":
        return node.data.get("header");
      default:
        return;
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case "component":
        return <Icon icon="icon-park-outline:figma-component" />;
      case "element":
        return <Icon icon="icon-park-outline:code" />;
      case "text":
        return <Icon icon="icon-park-outline:font-size" />;
      case "expression":
      case "wrappingExpression":
        return <Icon icon="icon-park-outline:code-brackets" />;
      default:
    }
  };

  const mayHaveChildren = () => {
    switch (node.type) {
      case "component":
      case "element":
      case "wrappingExpression":
        return true;
      default:
        return false;
    }
  };

  return (
    <div
      style={style}
      ref={dragHandle}
      onClick={() => treeNode.toggle()}
      className="h-full hover:ring-1 hover:ring-inset hover:ring-blue-500"
    >
      <div className="flex items-center h-full pl-1 gap-2">
        {!mayHaveChildren() ? (
          <div className="w-[1em] h-[1em]" />
        ) : treeNode.isOpen ? (
          <Icon icon="material-symbols:chevron-right" rotate={1} />
        ) : (
          <Icon icon="material-symbols:chevron-right" />
        )}
        <span className="opacity-50">{getIcon()}</span>
        <span className="flex-1 min-w-0 truncate">{getName()}</span>
      </div>
    </div>
  );
}

interface TreeData {
  id: string;
  children: TreeData[];
  node: Node;
}

function buildTreeData(node: Node): TreeData {
  return {
    id: node.id,
    node,
    children: node.children
      .filter((child) => {
        if (child.type === "text" && /^\s*$/.test(child.text)) {
          return false;
        }
        return true;
      })
      .map(buildTreeData),
  };
}

export const Outline: React.FC = observer(() => {
  const data = buildTreeData(appState.fileNode).children;
  return (
    <FillFlexParent>
      {({ width, height }) => (
        <Tree
          data={data}
          openByDefault={true}
          width={width}
          height={height}
          indent={8}
          rowHeight={22}
          paddingTop={12}
          paddingBottom={12}
        >
          {NodeRow}
        </Tree>
      )}
    </FillFlexParent>
  );
});
