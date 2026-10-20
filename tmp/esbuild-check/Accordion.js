import React from "react";
import { cn } from "../lib/format";
import { ChevronDownIcon } from "./icons";
export default function Accordion({ items = [], openId = null, onToggle = null, className = "" }) {
  if (!items.length) return null;
  return /* @__PURE__ */ React.createElement("div", { className: cn("border-t border-line", className) }, items.map((item) => {
    const id = item.id ?? item.title;
    const open = openId === id;
    const panelId = `accordion-panel-${id}`;
    const buttonId = `accordion-button-${id}`;
    return /* @__PURE__ */ React.createElement("div", { key: id, className: "border-b border-line" }, /* @__PURE__ */ React.createElement("h3", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        id: buttonId,
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: () => onToggle?.(open ? null : id),
        className: "flex w-full items-center justify-between gap-4 py-4 text-left text-h3 text-ink transition-colors duration-hover hover:text-brand"
      },
      /* @__PURE__ */ React.createElement("span", null, item.title),
      /* @__PURE__ */ React.createElement(
        "span",
        {
          className: cn(
            "shrink-0 text-brand transition-transform duration-accordion ease-smooth",
            open ? "rotate-180" : "rotate-0"
          ),
          "aria-hidden": "true"
        },
        /* @__PURE__ */ React.createElement(ChevronDownIcon, { size: 20 })
      )
    )), /* @__PURE__ */ React.createElement(
      "div",
      {
        id: panelId,
        role: "region",
        "aria-labelledby": buttonId,
        hidden: !open,
        className: "pb-4 text-meta text-ink-soft"
      },
      item.content
    ));
  }));
}
