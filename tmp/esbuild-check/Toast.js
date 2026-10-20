import React, { useEffect } from "react";
import { cn } from "../lib/format";
import { AlertIcon, CheckIcon, CloseIcon, SearchIcon } from "./icons";
const TONES = {
  info: { bar: "border-l-brand", icon: SearchIcon, color: "text-brand" },
  success: { bar: "border-l-success", icon: CheckIcon, color: "text-success" },
  warning: { bar: "border-l-warning", icon: AlertIcon, color: "text-warning" },
  error: { bar: "border-l-danger", icon: AlertIcon, color: "text-danger" }
};
export default function Toast({
  tone = "info",
  title = null,
  message = null,
  duration = 4e3,
  onClose = null
}) {
  const config = TONES[tone] ?? TONES.info;
  const Icon = config.icon;
  useEffect(() => {
    if (!duration || !onClose) return void 0;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [duration, onClose]);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn(
        "pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-md border border-line border-l-[3px] bg-white p-4 shadow-raised animate-fade-up",
        config.bar
      )
    },
    /* @__PURE__ */ React.createElement("span", { className: cn("mt-0.5 shrink-0", config.color), "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { size: 20 })),
    /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, title && /* @__PURE__ */ React.createElement("p", { className: "text-label text-ink" }, title), message && /* @__PURE__ */ React.createElement("p", { className: "text-meta text-ink-soft" }, message)),
    onClose && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onClose,
        "aria-label": "Tutup notifikasi",
        className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-surface"
      },
      /* @__PURE__ */ React.createElement(CloseIcon, { size: 16 })
    )
  );
}
