import React, { useEffect, useRef } from "react";
import { cn } from "../lib/format";
import { useBodyScrollLock, useFocusTrap } from "../lib/hooks";
import { CloseIcon } from "./icons";
const SIZES = {
  md: "max-w-modal",
  lg: "max-w-modalLg"
};
export default function Modal({
  open = false,
  title = null,
  description = null,
  children = null,
  footer = null,
  onClose,
  size = "md",
  closeLabel = "Tutup"
}) {
  const panelRef = useRef(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);
  useEffect(() => {
    if (!open) return void 0;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose?.();
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: panelRef,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": title ? "modal-title" : void 0,
        tabIndex: -1,
        className: cn(
          "w-full rounded-xl bg-white p-6 shadow-raised animate-modal-in",
          SIZES[size] ?? SIZES.md
        )
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, title && /* @__PURE__ */ React.createElement("h2", { id: "modal-title", className: "text-h3 text-ink" }, title), description && /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-meta text-ink-soft" }, description)), onClose && /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: onClose,
          "aria-label": closeLabel,
          className: "-mr-2 -mt-1 inline-flex h-touch w-touch items-center justify-center rounded-md text-ink-soft transition-colors duration-hover hover:bg-surface"
        },
        /* @__PURE__ */ React.createElement(CloseIcon, { size: 20 })
      )),
      children && /* @__PURE__ */ React.createElement("div", { className: "mt-4 text-body text-ink" }, children),
      footer && /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex flex-wrap justify-end gap-3" }, footer)
    )
  );
}
