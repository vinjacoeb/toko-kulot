import React from "react";
import { cn } from "../lib/format";
import { AlertIcon, CheckIcon, CloseIcon, SearchIcon } from "./icons";
const TONES = {
  info: "bg-brand-100 text-ink",
  success: "bg-success/10 text-ink",
  warning: "bg-warning/10 text-ink",
  error: "bg-red-50 border border-danger text-ink"
};
const ICONS = {
  info: SearchIcon,
  success: CheckIcon,
  warning: AlertIcon,
  error: AlertIcon
};
const ICON_TONES = {
  info: "text-brand",
  success: "text-success",
  warning: "text-warning",
  error: "text-danger"
};
export default function InlineNotice({
  tone = "info",
  title = null,
  children = null,
  onDismiss = null,
  className = ""
}) {
  const Icon = ICONS[tone] ?? ICONS.info;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn("flex items-start gap-3 rounded-md p-4", TONES[tone] ?? TONES.info, className)
    },
    /* @__PURE__ */ React.createElement("span", { className: cn("mt-0.5 shrink-0", ICON_TONES[tone] ?? ICON_TONES.info), "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { size: 20 })),
    /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, title && /* @__PURE__ */ React.createElement("p", { className: "text-label" }, title), children && /* @__PURE__ */ React.createElement("div", { className: "text-meta text-ink-soft" }, children)),
    onDismiss && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onDismiss,
        "aria-label": "Tutup pesan",
        className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60"
      },
      /* @__PURE__ */ React.createElement(CloseIcon, { size: 16 })
    )
  );
}
