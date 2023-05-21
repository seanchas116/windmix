import { observer } from "mobx-react-lite";
import { MoveHandler, NodeApi, NodeRendererProps, Tree } from "react-arborist";
import { FillFlexParent } from "../../components/FillFlexParent";
import { Icon } from "@iconify/react";
import { ComponentNode, Node } from "@windmix/model";
import { appState } from "../../state/AppState";
import { action, reaction } from "mobx";
import { twMerge } from "tailwind-merge";
import { useEffect } from "react";
import {
  Pane,
  PaneHeading,
} from "@seanchas116/paintkit/src/components/sidebar/Inspector";

const nodeApis = new WeakMap<Node, NodeApi>();

const NodeRow = observer(function NodeRow({
  node: nodeApi,
  style,
  dragHandle,
}: NodeRendererProps<TreeData>) {
  nodeApis.set(nodeApi.data.node, nodeApi);

  /* This node instance can do many things. See the API reference. */
  const node = nodeApi.data.node;

  const hover = appState.hover === node;
  const selected = node.selected;

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
    appState.hover = node;
  });

  const onMouseLeave = action(() => {
    appState.hover = undefined;
  });

  return (
    <div
      style={style}
      ref={dragHandle}
      className={twMerge(
        "h-full",
        hover && "ring-1 ring-inset ring-blue-500",
        selected && "bg-blue-500 text-white"
      )}
      onMouseDown={action((e) => {
        if (!(e.shiftKey || e.altKey) && !node.selected) {
          appState.document.deselectAll();
        }
        node.select();
      })}
      onDoubleClick={() => {
        appState.jumpToLocation(node.location);
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
                nodeApi.toggle();
              }}
            >
              {nodeApi.isOpen ? (
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

export const Outline: React.FC<{ className?: string }> = observer(
  ({ className }) => {
    const fileNode = appState.document.fileNode;
    const components =
      fileNode?.children.filter(
        (child): child is ComponentNode => child.type === "component"
      ) ?? [];

    // WIP: select component

    return (
      <div className={twMerge("flex flex-col", className)}>
        <Pane>
          <PaneHeading>Components</PaneHeading>
          <div className="-mx-3">
            {components.map((c) => (
              <ComponentTitle
                key={c.id}
                selected={c === appState.document.currentComponent}
                onClick={action(() => {
                  appState.document.deselectAll();
                  appState.document.currentComponent = c;
                })}
              >
                {c.name}
              </ComponentTitle>
            ))}
          </div>
        </Pane>
        <Pane className="flex flex-col flex-1">
          <PaneHeading>
            <div className="flex items-center">
              <Icon
                icon="icon-park-outline:figma-component"
                className="mr-1.5 text-indigo-500 [&>*]:fill-current [&>*]:stroke-current"
              />
              {appState.document.currentComponent?.name ?? "No component"}
            </div>
          </PaneHeading>
          <ComponentOutline />
        </Pane>
      </div>
    );
  }
);
Outline.displayName = "Outline";

const ComponentOutline: React.FC<{
  className?: string;
}> = observer(({ className }) => {
  const component = appState.document.currentComponent;
  const data = component ? buildTreeData(component).children : [];

  const onMove: MoveHandler<TreeData> = action(({ parentNode, index }) => {
    const parent = parentNode?.data.node;
    if (!parent) {
      return;
    }

    if (parent.type !== "element") {
      return;
    }

    const next = (parentNode.children ?? [])[index]?.data.node;
    console.log(index, next);
    const selectedNodes = appState.document.selectedNodes;
    parent.insertBefore(selectedNodes, next);
  });

  useEffect(() => {
    return reaction(
      () => appState.document.selectedNodes,
      (selectedNodes) => {
        for (const selected of selectedNodes) {
          const nodeApi = nodeApis.get(selected);
          if (nodeApi) {
            nodeApi.openParents();

            setTimeout(() => {
              const listEl = nodeApi.tree.listEl.current;
              if (listEl && nodeApi.rowIndex) {
                // scroll into if it is not visible

                const rowOffset = nodeApi.rowIndex * 22;

                const scrollTop = listEl.scrollTop;
                const scrollBottom = scrollTop + listEl.clientHeight;

                if (rowOffset < scrollTop || rowOffset > scrollBottom) {
                  listEl.scrollTop = rowOffset;
                }
              }
            }, 0);
          }
        }
      }
    );
  }, []);

  return (
    <div className={twMerge("flex flex-col flex-1 -mx-3", className)}>
      <FillFlexParent>
        {({ width, height }) => (
          <Tree
            data={data}
            onMove={onMove}
            openByDefault={true}
            width={width}
            height={height}
            indent={8}
            rowHeight={22}
            // paddingTop={12}
            // paddingBottom={12}
            overscanCount={10000} // enlarge the overscan count to make auto-scrolling-in work (TODO: avoid this hack)
          >
            {NodeRow}
          </Tree>
        )}
      </FillFlexParent>
    </div>
  );
});
ComponentOutline.displayName = "ComponentOutline";

const ComponentTitle: React.FC<
  JSX.IntrinsicElements["button"] & {
    selected?: boolean;
  }
> = (props) => {
  return (
    <button
      {...props}
      className={twMerge(
        "text-left px-2 py-1 pl-3 flex items-center w-full",
        props.selected ? "bg-macaron-active text-macaron-activeText" : "",
        props.className
      )}
    >
      <Icon
        icon="icon-park-outline:figma-component"
        className={twMerge("mr-1.5 opacity-50")}
      />
      {props.children}
    </button>
  );
};
