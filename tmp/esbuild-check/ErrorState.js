import React from "react";
import { cn } from "../lib/format";
import Button from "./Button";
import { AlertIcon } from "./icons";
export default function ErrorState({
  title = "Gagal memuat data",
  description = "Periksa koneksi Anda lalu coba lagi.",
  onRetry = null,
  supportHref = "/kontak-kami",
  retryLabel = "Coba lagi",
  supportLabel = "Hubungi kami",
  className = ""
}) {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      role: "alert",
      className: cn("flex flex-col items-center gap-3 py-12 text-center", className)
    },
    /* @__PURE__ */ React.createElement("span", { className: "text-danger", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(AlertIcon, { size: 48 })),
    /* @__PURE__ */ React.createElement("p", { className: "text-h3 text-ink" }, title),
    description && /* @__PURE__ */ React.createElement("p", { className: "max-w-sm text-meta text-slate-400" }, description),
    /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex flex-wrap items-center justify-center gap-3" }, onRetry && /* @__PURE__ */ React.createElement(Button, { variant: "primary", onClick: onRetry }, retryLabel), supportHref && /* @__PURE__ */ React.createElement(Button, { variant: "secondary", href: supportHref }, supportLabel))
  );
}
