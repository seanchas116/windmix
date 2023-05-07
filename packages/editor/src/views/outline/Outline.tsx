import { observer } from "mobx-react-lite";
import { NodeRendererProps, Tree } from "react-arborist";
import { FillFlexParent } from "../../components/FillFlexParent";
import { Icon } from "@iconify/react";
import { Node } from "@windmix/model";
import { appState } from "../../state/AppState";
import { action } from "mobx";
import { domLocator } from "../DOMLocator";
import { Rect } from "paintvec";
import { twMerge } from "tailwind-merge";

const NodeRow = observer(function NodeRow({
  node: treeNode,
  style,
  dragHandle,
}: NodeRendererProps<TreeData>) {
  /* This node instance can do many things. See the API reference. */
  const node = treeNode.data.node;

  const hover = appState.hover?.node === node;

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

  const onMouseEnter = action(() => {
    const elem = domLocator.findDOM(node);

    appState.hover = {
      node,
      rect: elem && Rect.from(elem.getBoundingClientRect()),
    };
  });

  const onMouseLeave = action(() => {
    appState.hover = undefined;
  });

  return (
    <div
      style={style}
      ref={dragHandle}
      className={twMerge("h-full", hover && "ring-1 ring-inset ring-blue-500")}
      onClick={() => {
        appState.reveal(node.location);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center h-full pl-1">
        <span className="w-5 h-hull opacity-50 flex items-center justify-center">
          {mayHaveChildren() && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                treeNode.toggle();
              }}
            >
              {treeNode.isOpen ? (
                <Icon icon="material-symbols:chevron-right" rotate={1} />
              ) : (
                <Icon icon="material-symbols:chevron-right" />
              )}
            </button>
          )}
        </span>
        <span className="opacity-50 mr-2">{getIcon()}</span>
        <span className="flex-1 min-w-0 truncate">{getName()}</span>
      </div>
    </div>
  );
});

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
