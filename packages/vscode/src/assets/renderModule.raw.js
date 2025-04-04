import * as module from "%%path%%";
import React from "react";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
createRoot(root).render(
  React.createElement(module["%%component%%"], module.getWindmixProps?.())
);

window.addEventListener("message", (event) => {
  const data = event.data;
  if (data.type === "windmix:elementsFromPoint") {
    const elems = document.elementsFromPoint(data.x, data.y);
    const ids = [];
    for (const elem of elems) {
      const id = elem.getAttribute("data-windmixid");
      if (id) {
        ids.push(id);
      }
    }

    window.parent.postMessage(
      {
        type: "windmix:elementsFromPointResult",
        callID: data.callID,
        result: ids,
      },
      "*"
    );
  } else if (data.type === "windmix:getComputedStyles") {
    const result = [];

    const scrollX = document.documentElement.scrollLeft;
    const scrollY = document.documentElement.scrollTop;

    for (const id of data.ids) {
      const elems = document.querySelectorAll('[data-windmixid="' + id + '"]');
      const resultsForElem = [];
      for (const elem of elems) {
        const rect = elem.getBoundingClientRect();
        const style = getComputedStyle(elem);
        resultsForElem.push({
          rect: {
            x: rect.x + scrollX,
            y: rect.y + scrollY,
            width: rect.width,
            height: rect.height,
          },
          style: {
            position: style.position,
            display: style.display,
            flexDirection: style.flexDirection,
            marginTop: style.marginTop,
            marginRight: style.marginRight,
            marginBottom: style.marginBottom,
            marginLeft: style.marginLeft,
            borderTopWidth: style.borderTopWidth,
            borderRightWidth: style.borderRightWidth,
            borderBottomWidth: style.borderBottomWidth,
            borderLeftWidth: style.borderLeftWidth,
            paddingTop: style.paddingTop,
            paddingRight: style.paddingRight,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
          },
        });
      }
      result.push(resultsForElem);
    }

    window.parent.postMessage(
      {
        type: "windmix:getComputedStylesResult",
        callID: data.callID,
        result: result,
      },
      "*"
    );
  } else if (data.type === "windmix:setClassName") {
    const elems = document.querySelectorAll(
      '[data-windmixid="' + data.id + '"]'
    );
    for (const elem of elems) {
      elem.className = data.className;
    }
  } else if (data.type === "windmix:wheel") {
    document.documentElement.scrollLeft += data.deltaX;
    document.documentElement.scrollTop += data.deltaY;
  }
});

const resizeObserver = new ResizeObserver(() => {
  window.parent.postMessage(
    {
      type: "windmix:resize",
      height: document.documentElement.offsetHeight,
    },
    "*"
  );
});
resizeObserver.observe(document.documentElement);
window.parent.postMessage(
  {
    type: "windmix:resize",
    height: document.documentElement.offsetHeight,
  },
  "*"
);

const observer = new MutationObserver(() => {
  console.log("DOM change");
  window.parent.postMessage(
    {
      type: "windmix:reloadComputed",
    },
    "*"
  );
});
observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
});

window.addEventListener("resize", () => {
  window.parent.postMessage(
    {
      type: "windmix:reloadComputed",
    },
    "*"
  );
});

for (const type of ["log", "info", "warn", "error"]) {
  const old = console[type];
  console[type] = (...args) => {
    old(...args);
    window.parent.postMessage(
      {
        type: "windmix:console",
        message: {
          type,
          messages: args.map((arg) => {
            if (typeof arg === "object") {
              return JSON.stringify(arg);
            } else {
              return arg;
            }
          }),
        },
      },
      "*"
    );
  };
}

window.addEventListener("scroll", () => {
  window.parent.postMessage(
    {
      type: "windmix:onScroll",
      scrollX: document.documentElement.scrollLeft,
      scrollY: document.documentElement.scrollTop,
    },
    "*"
  );
});

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeUpdate", (data) => {
    window.parent.postMessage(
      {
        type: "windmix:beforeUpdate",
      },
      "*"
    );
  });
}
