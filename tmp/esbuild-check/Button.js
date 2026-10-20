import React from "react";
import { Link } from "@inertiajs/react";
import { cn } from "../lib/format";
import { SpinnerIcon } from "./icons";
const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-sm text-label font-semibold leading-none bg-danger text-white transition-colors duration-hover hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed",
  link: "inline-flex items-center gap-2 text-label text-brand underline underline-offset-4 rounded-sm"
};
const SIZES = {
  md: "",
  sm: "h-10 px-4"
};
export default function Button({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  href = null,
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  className = "",
  ...rest
}) {
  const classes = cn(
    VARIANTS[variant] ?? VARIANTS.primary,
    size === "sm" && variant !== "link" ? SIZES.sm : null,
    variant === "link" && size === "sm" ? "text-meta" : null,
    fullWidth ? "w-full" : null,
    "whitespace-nowrap",
    className
  );
  const content = loading ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(SpinnerIcon, { size: 16 }), /* @__PURE__ */ React.createElement("span", null, "Memproses\u2026")) : /* @__PURE__ */ React.createElement(React.Fragment, null, icon, /* @__PURE__ */ React.createElement("span", null, children));
  if (as === "a") {
    return /* @__PURE__ */ React.createElement("a", { href, className: classes, ...rest }, content);
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ React.createElement(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest }, content);
  }
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type,
      className: classes,
      disabled: disabled || loading,
      "aria-busy": loading || void 0,
      ...rest
    },
    content
  );
}
