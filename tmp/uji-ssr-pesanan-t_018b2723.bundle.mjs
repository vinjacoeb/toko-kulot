// tmp/uji-ssr-pesanan-t_018b2723.mjs
import fs from "node:fs";
import path from "node:path";
import React29 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// resources/js/Pages/Admin/Orders/Index.jsx
import React19, { useEffect as useEffect5, useState as useState4 } from "react";

// tmp/stub-inertia-t_321bf03c.mjs
import { createRequire } from "node:module";
var require2 = createRequire(import.meta.url);
var R = require2("react");
var h = R.createElement;
var kendali = {
  kunjungan: [],
  formulir: [],
  halaman: { props: {} },
  berikutnya: { processing: false, errors: {}, sukses: null }
};
var bersihkan = () => {
  kendali.kunjungan.length = 0;
  kendali.formulir.length = 0;
  kendali.berikutnya = { processing: false, errors: {}, sukses: null };
};
var catat = (metode, url, data, opsi) => {
  const kunjungan = { metode, url, data, opsi: opsi || {} };
  kendali.kunjungan.push(kunjungan);
  return kunjungan;
};
var router = {
  get: (url, data, opsi) => catat("get", url, data, opsi),
  post: (url, data, opsi) => catat("post", url, data, opsi),
  put: (url, data, opsi) => catat("put", url, data, opsi),
  patch: (url, data, opsi) => catat("patch", url, data, opsi),
  delete: (url, data, opsi) => catat("delete", url, data, opsi),
  reload: (opsi) => catat("reload", null, null, opsi),
  visit: (url, opsi) => catat("visit", url, null, opsi)
};
var usePage = () => kendali.halaman;
var useForm = (awal = {}) => {
  const nilaiAwal = { ...awal || {} };
  if (!kendali.formulir[0]) {
    const bentuk2 = {
      data: { ...nilaiAwal },
      errors: { ...kendali.berikutnya.errors },
      processing: Boolean(kendali.berikutnya.processing),
      __aksi: null,
      setData(kunci, nilai) {
        if (kunci && typeof kunci === "object") {
          Object.assign(bentuk2.data, kunci);
        } else {
          bentuk2.data[kunci] = nilai;
        }
        return bentuk2.data;
      },
      reset(...argumen) {
        if (argumen.length === 0) {
          bentuk2.data = { ...nilaiAwal };
        } else if (argumen.length === 1 && argumen[0] && typeof argumen[0] === "object") {
          bentuk2.data = { ...argumen[0] };
        } else {
          argumen.forEach((nama) => {
            bentuk2.data[nama] = nilaiAwal[nama] ?? "";
          });
        }
      },
      clearErrors(...nama) {
        if (nama.length === 0) {
          bentuk2.errors = {};
        } else {
          nama.forEach((kunci) => delete bentuk2.errors[kunci]);
        }
      },
      setError(kunci, pesan) {
        bentuk2.errors[kunci] = pesan;
      },
      transform(fn) {
        bentuk2.__transform = fn;
        return bentuk2;
      },
      post(url, opsi) {
        bentuk2.__aksi = catat("post", url, { ...bentuk2.data }, opsi);
        return bentuk2.__aksi;
      },
      put(url, opsi) {
        bentuk2.__aksi = catat("put", url, { ...bentuk2.data }, opsi);
        return bentuk2.__aksi;
      },
      patch(url, opsi) {
        bentuk2.__aksi = catat("patch", url, { ...bentuk2.data }, opsi);
        return bentuk2.__aksi;
      },
      delete(url, opsi) {
        bentuk2.__aksi = catat("delete", url, { ...bentuk2.data }, opsi);
        return bentuk2.__aksi;
      }
    };
    kendali.formulir[0] = bentuk2;
  }
  const bentuk = kendali.formulir[0];
  bentuk.processing = Boolean(kendali.berikutnya.processing);
  return bentuk;
};
var Link = ({ href, children, ...sisa }) => h("a", { href, ...sisa }, children);
var Head = () => null;

// resources/js/Layouts/AdminLayout.jsx
import React2, { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");
var rupiah = (value) => {
  if (value === null || value === void 0 || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `Rp${Math.round(number).toLocaleString("id-ID")}`;
};
var formatNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("id-ID") : "0";
};
var formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};
var formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })}, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
};

// resources/js/lib/hooks.js
import { useCallback, useEffect, useRef, useState } from "react";
function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return void 0;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
function useFocusTrap(ref, active) {
  const previouslyFocused = useRef(null);
  const focusFirst = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const targets = node.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (targets.length > 0) targets[0].focus();
    else node.focus();
  }, [ref]);
  useEffect(() => {
    if (!active) return void 0;
    previouslyFocused.current = document.activeElement;
    focusFirst();
    const onKeyDown = (event) => {
      if (event.key !== "Tab") return;
      const node = ref.current;
      if (!node) return;
      const targets = Array.from(
        node.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (targets.length === 0) {
        event.preventDefault();
        return;
      }
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [active, focusFirst, ref]);
}

// resources/js/Components/icons.jsx
import React from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var Svg = ({ size = 20, className = "", children, filled = false, ...rest }) => /* @__PURE__ */ jsx(
  "svg",
  {
    className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: filled ? "none" : "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
    ...rest,
    children
  }
);
var SearchIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "7" }),
  /* @__PURE__ */ jsx("path", { d: "m20.5 20.5-3.9-3.9" })
] });
var CartIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M3 4h2.2l2.1 10.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" }),
  /* @__PURE__ */ jsx("circle", { cx: "10", cy: "20", r: "1.2" }),
  /* @__PURE__ */ jsx("circle", { cx: "17.5", cy: "20", r: "1.2" })
] });
var MenuIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M4 7h16M4 12h16M4 17h16" }) });
var CloseIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6 6 18" }) });
var StarIcon = ({ filled = false, ...props }) => /* @__PURE__ */ jsx(Svg, { filled, ...props, children: /* @__PURE__ */ jsx("path", { d: "M12 3.6l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8L12 3.6z" }) });
var CheckIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "m5 12.5 4.5 4.5L19 7" }) });
var UserIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "8.5", r: "3.5" }),
  /* @__PURE__ */ jsx("path", { d: "M4.5 20a7.5 7.5 0 0 1 15 0" })
] });
var MailIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "5.5", width: "18", height: "13", rx: "2" }),
  /* @__PURE__ */ jsx("path", { d: "m4 7 8 6 8-6" })
] });
var AlertIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M12 4.5 21 20H3L12 4.5z" }),
  /* @__PURE__ */ jsx("path", { d: "M12 10v4" }),
  /* @__PURE__ */ jsx("path", { d: "M12 17h.01" })
] });
var ImageOffIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M4 5.5h16v13H4z" }),
  /* @__PURE__ */ jsx("path", { d: "m4 15 4.5-4.5 4 4 3-3 4.5 4.5" }),
  /* @__PURE__ */ jsx("path", { d: "M3 3l18 18" })
] });
var SpinnerIcon = ({ size = 16, className = "" }) => /* @__PURE__ */ jsxs(
  "svg",
  {
    className: `animate-spin ${className}`,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
    focusable: "false",
    children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "1.5", opacity: "0.25" }),
      /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 0 0-9-9", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ]
  }
);
var GridIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("rect", { x: "3.5", y: "3.5", width: "7", height: "7", rx: "1.5" }),
  /* @__PURE__ */ jsx("rect", { x: "13.5", y: "3.5", width: "7", height: "7", rx: "1.5" }),
  /* @__PURE__ */ jsx("rect", { x: "3.5", y: "13.5", width: "7", height: "7", rx: "1.5" }),
  /* @__PURE__ */ jsx("rect", { x: "13.5", y: "13.5", width: "7", height: "7", rx: "1.5" })
] });
var BoxIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M20.5 7.8v8.4a1.5 1.5 0 0 1-.8 1.3l-7 3.7a1.5 1.5 0 0 1-1.4 0l-7-3.7a1.5 1.5 0 0 1-.8-1.3V7.8" }),
  /* @__PURE__ */ jsx("path", { d: "m3.9 7.1 7.4-3.8a1.5 1.5 0 0 1 1.4 0l7.4 3.8-8.1 4.2Z" }),
  /* @__PURE__ */ jsx("path", { d: "M12 11.3V20" })
] });
var LayersIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "m12 3.5 8 4-8 4-8-4Z" }),
  /* @__PURE__ */ jsx("path", { d: "m4 12 8 4 8-4" }),
  /* @__PURE__ */ jsx("path", { d: "m4 16.5 8 4 8-4" })
] });
var ArchiveIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("rect", { x: "3.5", y: "4", width: "17", height: "4", rx: "1" }),
  /* @__PURE__ */ jsx("path", { d: "M5 8v10.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V8" }),
  /* @__PURE__ */ jsx("path", { d: "M10 12h4" })
] });
var GearIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" }),
  /* @__PURE__ */ jsx("path", { d: "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" })
] });
var LogOutIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M15 4.5h3A1.5 1.5 0 0 1 19.5 6v12a1.5 1.5 0 0 1-1.5 1.5h-3" }),
  /* @__PURE__ */ jsx("path", { d: "M10 8 6 12l4 4" }),
  /* @__PURE__ */ jsx("path", { d: "M6 12h9" })
] });
var TrendUpIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "m3.5 16.5 5.5-5.5 3.5 3.5 7.5-7.5" }),
  /* @__PURE__ */ jsx("path", { d: "M15 7h5v5" })
] });
var TrendDownIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "m3.5 7.5 5.5 5.5 3.5-3.5 7.5 7.5" }),
  /* @__PURE__ */ jsx("path", { d: "M15 17h5v-5" })
] });

// resources/js/Layouts/AdminLayout.jsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var ADMIN_NAV = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: GridIcon },
  { key: "produk", label: "Produk", href: "/admin/produk", icon: BoxIcon },
  { key: "kategori", label: "Kategori", href: "/admin/kategori", icon: LayersIcon },
  { key: "stok", label: "Stok", href: "/admin/stok", icon: ArchiveIcon },
  { key: "pesanan", label: "Pesanan", href: "/admin/pesanan", icon: CartIcon },
  { key: "pesan", label: "Pesan", href: "/admin/pesan-masuk", icon: MailIcon },
  { key: "penilaian", label: "Penilaian", href: "/admin/penilaian", icon: StarIcon },
  { key: "pengaturan", label: "Pengaturan", href: "/admin/pengaturan", icon: GearIcon },
  { key: "akun", label: "Akun", href: "/admin/akun", icon: UserIcon }
];
var isActive = (url, href) => {
  if (!url || !href) return false;
  if (href === "/admin") return url === "/admin" || url === "/admin/";
  return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
};
function AdminLayout({ auth = null, nav = ADMIN_NAV, title = null, children }) {
  const page = usePage();
  const url = page?.url ?? "";
  const [drawerOpen, setDrawerOpen] = useState2(false);
  const [menuOpen, setMenuOpen] = useState2(false);
  const drawerRef = useRef2(null);
  const menuRef = useRef2(null);
  useBodyScrollLock(drawerOpen);
  useFocusTrap(drawerRef, drawerOpen);
  useEffect2(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [url]);
  useEffect2(() => {
    if (!menuOpen) return void 0;
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);
  const items = Array.isArray(nav) && nav.length > 0 ? nav : ADMIN_NAV;
  const userName = auth?.name ?? "Admin";
  const userEmail = auth?.email ?? null;
  const initial = String(userName).trim().charAt(0).toUpperCase() || "A";
  const logout = () => router.post("/admin/logout");
  const navList = (onNavigate = null) => /* @__PURE__ */ jsx2("ul", { className: "flex flex-1 flex-col gap-1 p-3", children: items.map((item) => {
    const Icon = item.icon ?? GridIcon;
    const active = isActive(url, item.href);
    return /* @__PURE__ */ jsx2("li", { children: /* @__PURE__ */ jsxs2(
      Link,
      {
        href: item.href,
        onClick: onNavigate,
        "aria-current": active ? "page" : void 0,
        className: cn(
          "flex h-11 items-center gap-3 rounded-md border-l-[3px] px-3 text-meta transition-colors duration-hover",
          active ? "border-accent-500 bg-white/10 text-white" : "border-transparent text-white/75 hover:bg-white/10 hover:text-white"
        ),
        children: [
          /* @__PURE__ */ jsx2(Icon, { size: 18 }),
          item.label
        ]
      }
    ) }, item.key ?? item.href);
  }) });
  return /* @__PURE__ */ jsxs2("div", { className: "min-h-screen bg-surface", children: [
    title && /* @__PURE__ */ jsx2(Head, { title }),
    /* @__PURE__ */ jsxs2("aside", { className: "fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col bg-brand-700 lg:flex", children: [
      /* @__PURE__ */ jsx2("div", { className: "flex h-topbar items-center px-4 text-white", children: /* @__PURE__ */ jsx2(Link, { href: "/admin", className: "text-label font-semibold uppercase tracking-wide", children: "Daster Kulot" }) }),
      /* @__PURE__ */ jsx2("nav", { "aria-label": "Navigasi admin", className: "flex flex-1 flex-col overflow-y-auto", children: navList() })
    ] }),
    drawerOpen && /* @__PURE__ */ jsxs2("div", { className: "fixed inset-0 z-drawer lg:hidden", children: [
      /* @__PURE__ */ jsx2(
        "button",
        {
          type: "button",
          "aria-label": "Tutup menu",
          onClick: () => setDrawerOpen(false),
          className: "absolute inset-0 h-full w-full bg-ink/40"
        }
      ),
      /* @__PURE__ */ jsxs2(
        "div",
        {
          ref: drawerRef,
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Navigasi admin",
          className: "animate-drawer-in absolute inset-y-0 left-0 flex w-drawer max-w-[85%] flex-col bg-brand-700",
          children: [
            /* @__PURE__ */ jsxs2("div", { className: "flex h-topbar items-center justify-between px-4 text-white", children: [
              /* @__PURE__ */ jsx2("span", { className: "text-label font-semibold uppercase tracking-wide", children: "Daster Kulot" }),
              /* @__PURE__ */ jsx2(
                "button",
                {
                  type: "button",
                  onClick: () => setDrawerOpen(false),
                  "aria-label": "Tutup menu",
                  className: "flex h-touch w-touch items-center justify-center rounded-md text-white/80 transition-colors duration-hover hover:bg-white/10 hover:text-white",
                  children: /* @__PURE__ */ jsx2(CloseIcon, { size: 20 })
                }
              )
            ] }),
            /* @__PURE__ */ jsx2("nav", { "aria-label": "Navigasi admin", className: "flex flex-1 flex-col overflow-y-auto", children: navList(() => setDrawerOpen(false)) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "lg:pl-sidebar", children: [
      /* @__PURE__ */ jsxs2("header", { className: "sticky top-0 z-20 flex h-topbar items-center justify-between gap-3 border-b border-line bg-white px-4 lg:px-6", children: [
        /* @__PURE__ */ jsx2(
          "button",
          {
            type: "button",
            onClick: () => setDrawerOpen(true),
            "aria-label": "Buka menu",
            "aria-expanded": drawerOpen,
            className: "flex h-touch w-touch items-center justify-center rounded-md text-ink transition-colors duration-hover hover:bg-surface lg:hidden",
            children: /* @__PURE__ */ jsx2(MenuIcon, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsx2("p", { className: "hidden text-label font-semibold text-ink lg:block", children: "Panel Admin" }),
        /* @__PURE__ */ jsxs2("div", { className: "relative", ref: menuRef, children: [
          /* @__PURE__ */ jsxs2(
            "button",
            {
              type: "button",
              onClick: () => setMenuOpen((open) => !open),
              "aria-haspopup": "menu",
              "aria-expanded": menuOpen,
              className: "flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-hover hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              children: [
                /* @__PURE__ */ jsx2(
                  "span",
                  {
                    "aria-hidden": "true",
                    className: "flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-label font-semibold text-brand",
                    children: initial
                  }
                ),
                /* @__PURE__ */ jsx2("span", { className: "hidden max-w-[160px] truncate text-meta text-ink sm:block", children: userName })
              ]
            }
          ),
          menuOpen && /* @__PURE__ */ jsxs2(
            "div",
            {
              role: "menu",
              className: "absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white shadow-raised",
              children: [
                /* @__PURE__ */ jsxs2("div", { className: "border-b border-line px-4 py-3", children: [
                  /* @__PURE__ */ jsx2("p", { className: "truncate text-label font-semibold text-ink", children: userName }),
                  userEmail && /* @__PURE__ */ jsx2("p", { className: "truncate text-meta text-slate-500", children: userEmail })
                ] }),
                /* @__PURE__ */ jsxs2(
                  "button",
                  {
                    type: "button",
                    role: "menuitem",
                    onClick: logout,
                    className: "flex w-full items-center gap-2 px-4 py-3 text-left text-label text-ink transition-colors duration-hover hover:bg-surface",
                    children: [
                      /* @__PURE__ */ jsx2(LogOutIcon, { size: 16 }),
                      "Keluar"
                    ]
                  }
                )
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx2("main", { className: "mx-auto w-full max-w-[1200px] px-4 py-6 lg:px-6", children })
    ] })
  ] });
}

// resources/js/Components/PageHeader.jsx
import React4 from "react";

// resources/js/Components/Breadcrumb.jsx
import React3 from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function Breadcrumb({ items = [], className = "" }) {
  const list = (Array.isArray(items) ? items : []).filter((item) => item && item.label);
  if (list.length === 0) return null;
  const first = list[0];
  const last = list[list.length - 1];
  const middle = list.slice(1, -1);
  const renderItem = (item, isLast) => isLast || !item.href ? /* @__PURE__ */ jsx3("span", { className: "text-ink", "aria-current": "page", children: item.label }) : /* @__PURE__ */ jsx3(Link, { href: item.href, className: "transition-colors duration-hover hover:text-ink", children: item.label });
  return /* @__PURE__ */ jsx3("nav", { "aria-label": "Breadcrumb", className: cn("h-12", className), children: /* @__PURE__ */ jsxs3("ol", { className: "flex h-full items-center gap-2 text-meta text-slate-600", children: [
    /* @__PURE__ */ jsx3("li", { className: "flex items-center gap-2", children: renderItem(first, list.length === 1) }),
    list.length > 1 && /* @__PURE__ */ jsx3("li", { className: "flex items-center gap-2", "aria-hidden": "true", children: /* @__PURE__ */ jsx3("span", { children: "/" }) }),
    middle.length > 0 && /* @__PURE__ */ jsx3("li", { className: "flex items-center gap-2 sm:hidden", "aria-hidden": "true", children: /* @__PURE__ */ jsx3("span", { children: "..." }) }),
    list.length > 1 && /* @__PURE__ */ jsx3("li", { className: "flex items-center gap-2", children: renderItem(last, true) })
  ] }) });
}

// resources/js/Components/PageHeader.jsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function PageHeader({ title = "", breadcrumb = [], actions = null, description = null, className = "" }) {
  return /* @__PURE__ */ jsxs4("header", { className: cn("flex flex-col gap-3", className), children: [
    breadcrumb.length > 0 && /* @__PURE__ */ jsx4(Breadcrumb, { items: breadcrumb }),
    /* @__PURE__ */ jsxs4("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs4("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx4("h1", { className: "text-h1 font-bold text-ink", children: title }),
        description && /* @__PURE__ */ jsx4("p", { className: "mt-1 text-meta text-slate-600", children: description })
      ] }),
      actions && /* @__PURE__ */ jsx4("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center", children: actions })
    ] })
  ] });
}

// resources/js/Components/KpiCard.jsx
import React6 from "react";

// resources/js/Components/Skeleton.jsx
import React5 from "react";
import { jsx as jsx5 } from "react/jsx-runtime";
var SHAPES = {
  text: "h-3 w-full",
  title: "h-6 w-2/3",
  card: "aspect-square w-full",
  row: "h-tableRow w-full",
  circle: "h-10 w-10 rounded-full"
};
function Skeleton({ variant = "text", count = 1, className = "" }) {
  return Array.from({ length: count }).map((_, index) => /* @__PURE__ */ jsx5(
    "div",
    {
      "aria-hidden": "true",
      className: cn("skeleton", SHAPES[variant] ?? SHAPES.text, className)
    },
    index
  ));
}

// resources/js/Components/KpiCard.jsx
import { Fragment, jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function KpiCard({
  label = "",
  value = null,
  delta = null,
  deltaLabel = null,
  icon = null,
  href = null,
  loading = false,
  className = ""
}) {
  const Icon = icon;
  const numericDelta = delta === null || delta === void 0 || delta === "" ? null : Number(delta);
  const hasDelta = numericDelta !== null && Number.isFinite(numericDelta);
  const DeltaIcon = hasDelta && numericDelta < 0 ? TrendDownIcon : TrendUpIcon;
  const shownValue = value === null || value === void 0 || value === "" ? "-" : value;
  const body = /* @__PURE__ */ jsxs5(Fragment, { children: [
    /* @__PURE__ */ jsxs5("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsx6("p", { className: "text-label uppercase text-slate-500", children: label }),
      Icon && /* @__PURE__ */ jsx6(
        "span",
        {
          className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand",
          "aria-hidden": "true",
          children: /* @__PURE__ */ jsx6(Icon, { size: 18 })
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx6(Skeleton, { variant: "title", className: "h-7 w-3/5" }),
      /* @__PURE__ */ jsx6(Skeleton, { variant: "text", className: "h-3 w-2/5" })
    ] }) : /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx6("p", { className: "text-[28px] font-bold leading-none text-ink", children: shownValue }),
      (hasDelta || deltaLabel) && /* @__PURE__ */ jsxs5(
        "p",
        {
          className: cn(
            "flex items-center gap-1 text-meta",
            hasDelta && numericDelta > 0 && "text-success-strong",
            hasDelta && numericDelta < 0 && "text-danger-strong",
            (!hasDelta || numericDelta === 0) && "text-ink-soft"
          ),
          children: [
            hasDelta && numericDelta !== 0 && /* @__PURE__ */ jsx6(DeltaIcon, { size: 14 }),
            hasDelta && numericDelta !== 0 && /* @__PURE__ */ jsxs5("span", { children: [
              numericDelta > 0 ? "+" : "",
              numericDelta,
              "%"
            ] }),
            deltaLabel && /* @__PURE__ */ jsx6("span", { className: "text-slate-500", children: deltaLabel })
          ]
        }
      )
    ] })
  ] });
  const base = cn(
    "flex h-full flex-col gap-3 rounded-lg border border-line bg-white p-4 text-left",
    className
  );
  if (loading) {
    return /* @__PURE__ */ jsx6("div", { className: base, "aria-busy": "true", children: body });
  }
  if (href) {
    return /* @__PURE__ */ jsx6(
      Link,
      {
        href,
        className: cn(
          base,
          "transition-colors duration-hover hover:border-brand/40 hover:bg-surface/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        ),
        children: body
      }
    );
  }
  return /* @__PURE__ */ jsx6("div", { className: base, children: body });
}

// resources/js/Components/SearchInput.jsx
import React7, { useEffect as useEffect3, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
function SearchInput({
  value = "",
  onChange = null,
  placeholder = "Cari produk",
  label = "Cari produk",
  loading = false,
  className = ""
}) {
  const [text, setText] = useState3(value);
  const mounted = useRef3(false);
  useEffect3(() => {
    setText(value);
  }, [value]);
  useEffect3(() => {
    if (!mounted.current) {
      mounted.current = true;
      return void 0;
    }
    const timer = window.setTimeout(() => {
      if (typeof onChange === "function") onChange(text.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [text]);
  return /* @__PURE__ */ jsxs6("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx7("span", { className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400", "aria-hidden": "true", children: /* @__PURE__ */ jsx7(SearchIcon, { width: 18, height: 18 }) }),
    /* @__PURE__ */ jsx7(
      "input",
      {
        type: "search",
        value: text,
        onChange: (event) => setText(event.target.value),
        placeholder,
        "aria-label": label,
        "aria-busy": loading ? "true" : void 0,
        className: "h-field w-full rounded-md border border-line bg-white pl-10 pr-10 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15"
      }
    ),
    text.length > 0 && /* @__PURE__ */ jsx7(
      "button",
      {
        type: "button",
        onClick: () => setText(""),
        "aria-label": "Bersihkan pencarian",
        className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-slate-400 transition-colors duration-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        children: /* @__PURE__ */ jsx7(CloseIcon, { width: 16, height: 16 })
      }
    )
  ] });
}

// resources/js/Components/Field.jsx
import React8 from "react";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
function Field({
  label,
  htmlFor,
  required = false,
  hint = null,
  error = null,
  children,
  className = ""
}) {
  const hintId = htmlFor ? htmlFor + "-hint" : void 0;
  const errorId = htmlFor ? htmlFor + "-error" : void 0;
  return /* @__PURE__ */ jsxs7("div", { className: cn("flex flex-col", className), children: [
    label && /* @__PURE__ */ jsxs7("label", { htmlFor, className: "mb-1.5 block text-meta font-semibold text-ink", children: [
      label,
      required && /* @__PURE__ */ jsx8("span", { className: "text-danger", "aria-hidden": "true", children: " *" })
    ] }),
    children,
    hint && !error && /* @__PURE__ */ jsx8("p", { id: hintId, className: "mt-1.5 text-meta text-slate-500", children: hint }),
    error && /* @__PURE__ */ jsx8("p", { id: errorId, className: "mt-1.5 text-meta text-danger-strong", role: "alert", children: error })
  ] });
}

// resources/js/Components/Input.jsx
import React9 from "react";
import { jsx as jsx9 } from "react/jsx-runtime";
var BASE = "w-full h-field rounded-md border border-line bg-white px-3.5 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Input({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx9(
    "input",
    {
      id,
      "aria-invalid": error ? "true" : void 0,
      "aria-describedby": error && id ? id + "-error" : void 0,
      className: cn(BASE, error ? "border-danger" : null, className),
      ...rest
    }
  );
}

// resources/js/Components/Select.jsx
import React10 from "react";
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
var BASE2 = "w-full h-field appearance-none rounded-md border border-line bg-white pl-3.5 pr-10 text-body text-ink transition-colors duration-hover focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Select({ error = null, className = "", id = null, children, ...rest }) {
  return /* @__PURE__ */ jsxs8("span", { className: "relative block", children: [
    /* @__PURE__ */ jsx10(
      "select",
      {
        id,
        "aria-invalid": error ? "true" : void 0,
        "aria-describedby": error && id ? id + "-error" : void 0,
        className: cn(BASE2, error ? "border-danger" : null, className),
        ...rest,
        children
      }
    ),
    /* @__PURE__ */ jsx10(
      "svg",
      {
        viewBox: "0 0 24 24",
        width: "16",
        height: "16",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
        className: "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400",
        children: /* @__PURE__ */ jsx10("path", { d: "M6 9l6 6 6-6" })
      }
    )
  ] });
}

// resources/js/Components/Button.jsx
import React11 from "react";
import { Fragment as Fragment2, jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
var VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-sm text-label font-semibold leading-none bg-danger text-white transition-colors duration-hover hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed",
  link: "inline-flex items-center gap-2 text-label text-brand underline underline-offset-4 rounded-sm"
};
var SIZES = {
  md: "",
  sm: "h-10 px-4"
};
function Button({
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
  const content = loading ? /* @__PURE__ */ jsxs9(Fragment2, { children: [
    /* @__PURE__ */ jsx11(SpinnerIcon, { size: 16 }),
    /* @__PURE__ */ jsx11("span", { children: "Memproses\u2026" })
  ] }) : /* @__PURE__ */ jsxs9(Fragment2, { children: [
    icon,
    /* @__PURE__ */ jsx11("span", { children })
  ] });
  if (as === "a") {
    return /* @__PURE__ */ jsx11("a", { href, className: classes, ...rest, children: content });
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ jsx11(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest, children: content });
  }
  return /* @__PURE__ */ jsx11(
    "button",
    {
      type,
      className: classes,
      disabled: disabled || loading,
      "aria-busy": loading || void 0,
      ...rest,
      children: content
    }
  );
}

// resources/js/Components/DataTable.jsx
import React14 from "react";

// resources/js/Components/EmptyState.jsx
import React12 from "react";
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
function EmptyState({
  title = "Belum ada data",
  description = null,
  actionLabel = null,
  actionHref = null,
  onAction = null,
  icon = null,
  className = ""
}) {
  return /* @__PURE__ */ jsxs10("div", { className: cn("flex flex-col items-center gap-3 py-12 text-center", className), children: [
    /* @__PURE__ */ jsx12("span", { className: "text-slate-300", "aria-hidden": "true", children: icon ?? /* @__PURE__ */ jsx12(ImageOffIcon, { size: 96 }) }),
    /* @__PURE__ */ jsx12("p", { className: "text-h3 text-ink", children: title }),
    description && /* @__PURE__ */ jsx12("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
    actionLabel && onAction && /* @__PURE__ */ jsx12(Button, { variant: "secondary", onClick: onAction, className: "mt-2", children: actionLabel }),
    actionLabel && !onAction && actionHref && /* @__PURE__ */ jsx12(Button, { variant: "secondary", href: actionHref, className: "mt-2", children: actionLabel })
  ] });
}

// resources/js/Components/ErrorState.jsx
import React13 from "react";
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
function ErrorState({
  title = "Gagal memuat data",
  description = "Periksa koneksi Anda lalu coba lagi.",
  onRetry = null,
  supportHref = "/kontak-kami",
  retryLabel = "Coba lagi",
  supportLabel = "Hubungi kami",
  className = ""
}) {
  return /* @__PURE__ */ jsxs11(
    "div",
    {
      role: "alert",
      className: cn("flex flex-col items-center gap-3 py-12 text-center", className),
      children: [
        /* @__PURE__ */ jsx13("span", { className: "text-danger", "aria-hidden": "true", children: /* @__PURE__ */ jsx13(AlertIcon, { size: 48 }) }),
        /* @__PURE__ */ jsx13("p", { className: "text-h3 text-ink", children: title }),
        description && /* @__PURE__ */ jsx13("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
        /* @__PURE__ */ jsxs11("div", { className: "mt-2 flex flex-wrap items-center justify-center gap-3", children: [
          onRetry && /* @__PURE__ */ jsx13(Button, { variant: "primary", onClick: onRetry, children: retryLabel }),
          supportHref && /* @__PURE__ */ jsx13(Button, { variant: "secondary", href: supportHref, children: supportLabel })
        ] })
      ]
    }
  );
}

// resources/js/Components/DataTable.jsx
import { jsx as jsx14, jsxs as jsxs12 } from "react/jsx-runtime";
function DataTable({
  columns = [],
  rows = [],
  rowKey = (row, index) => row?.id ?? index,
  loading = false,
  error = null,
  emptyTitle = "Belum ada data",
  emptyDescription = null,
  emptyActionLabel = null,
  emptyActionHref = null,
  onRetry = null,
  onRowClick = null,
  sort = null,
  onSort = null,
  caption = null,
  className = ""
}) {
  const list = Array.isArray(rows) ? rows : [];
  const hasRows = list.length > 0;
  const cellAlign = (column) => column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left";
  const sortState = (column) => {
    if (!sort || sort.key !== column.key) return "none";
    return sort.dir === "desc" ? "descending" : "ascending";
  };
  return /* @__PURE__ */ jsx14("div", { className: cn("overflow-hidden rounded-lg border border-line bg-white", className), children: error ? /* @__PURE__ */ jsx14(
    ErrorState,
    {
      title: "Gagal memuat data",
      description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
      onRetry,
      supportHref: null
    }
  ) : loading ? /* @__PURE__ */ jsxs12("div", { className: "flex flex-col", "aria-busy": "true", children: [
    /* @__PURE__ */ jsx14("div", { className: "h-tableHead w-full border-b border-line bg-surface", "aria-hidden": "true" }),
    Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsx14("div", { className: "flex items-center gap-4 border-b border-line px-4 last:border-b-0", children: /* @__PURE__ */ jsx14(Skeleton, { variant: "row" }) }, index))
  ] }) : !hasRows ? /* @__PURE__ */ jsx14(
    EmptyState,
    {
      title: emptyTitle,
      description: emptyDescription,
      actionLabel: emptyActionLabel,
      actionHref: emptyActionHref
    }
  ) : /* @__PURE__ */ jsx14("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs12("table", { className: "w-full border-collapse text-meta", children: [
    caption && /* @__PURE__ */ jsx14("caption", { className: "sr-only", children: caption }),
    /* @__PURE__ */ jsx14("thead", { children: /* @__PURE__ */ jsx14("tr", { className: "bg-surface", children: columns.map((column) => {
      const isSorted = sort && sort.key === column.key;
      const sortable = Boolean(onSort && column.sortable !== false);
      return /* @__PURE__ */ jsx14(
        "th",
        {
          scope: "col",
          "aria-sort": isSorted ? sortState(column) : void 0,
          className: cn(
            "h-tableHead whitespace-nowrap border-b border-line px-4 text-label uppercase text-slate-600",
            cellAlign(column)
          ),
          children: sortable ? /* @__PURE__ */ jsxs12(
            "button",
            {
              type: "button",
              onClick: () => onSort(column.key),
              className: cn(
                "inline-flex items-center gap-1 rounded-sm transition-colors duration-hover hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                isSorted && "text-ink"
              ),
              children: [
                column.header,
                /* @__PURE__ */ jsx14("span", { "aria-hidden": "true", children: isSorted ? sort.dir === "desc" ? "\u2193" : "\u2191" : "\u2195" })
              ]
            }
          ) : column.header
        },
        column.key
      );
    }) }) }),
    /* @__PURE__ */ jsx14("tbody", { children: list.map((row, index) => {
      const clickable = typeof onRowClick === "function";
      return /* @__PURE__ */ jsx14(
        "tr",
        {
          className: cn(
            "h-tableRow border-b border-line last:border-b-0",
            clickable && "cursor-pointer transition-colors duration-hover hover:bg-surface focus-within:bg-surface"
          ),
          onClick: clickable ? () => onRowClick(row, index) : void 0,
          children: columns.map((column) => /* @__PURE__ */ jsx14(
            "td",
            {
              className: cn("px-4 align-middle text-ink", cellAlign(column)),
              children: column.render ? column.render(row, index) : row?.[column.key] ?? "-"
            },
            column.key
          ))
        },
        rowKey(row, index)
      );
    }) })
  ] }) }) });
}

// resources/js/Components/Pagination.jsx
import React15 from "react";
import { jsx as jsx15, jsxs as jsxs13 } from "react/jsx-runtime";
function buildPages(current, last) {
  const pages = [];
  const push = (value) => {
    if (value >= 1 && value <= last && !pages.includes(value)) pages.push(value);
  };
  push(1);
  for (let page = current - 1; page <= current + 1; page += 1) push(page);
  push(last);
  return pages.sort((a, b) => a - b);
}
function Chevron({ direction }) {
  return /* @__PURE__ */ jsx15(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: direction === "left" ? /* @__PURE__ */ jsx15("path", { d: "M15 6l-6 6 6 6" }) : /* @__PURE__ */ jsx15("path", { d: "M9 6l6 6-6 6" })
    }
  );
}
function Pagination({ currentPage = 1, lastPage = 1, onPageChange = null, className = "" }) {
  const current = Math.max(1, Number(currentPage) || 1);
  const last = Math.max(1, Number(lastPage) || 1);
  if (last <= 1 || typeof onPageChange !== "function") return null;
  const go = (page) => {
    if (page < 1 || page > last || page === current) return;
    onPageChange(page);
  };
  const base = "inline-flex h-9 w-9 items-center justify-center rounded-sm text-meta transition-colors duration-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";
  const pages = buildPages(current, last);
  return /* @__PURE__ */ jsxs13("nav", { "aria-label": "Navigasi halaman", className: cn("flex items-center justify-center gap-1", className), children: [
    /* @__PURE__ */ jsx15(
      "button",
      {
        type: "button",
        onClick: () => go(current - 1),
        disabled: current <= 1,
        "aria-label": "Halaman sebelumnya",
        className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"),
        children: /* @__PURE__ */ jsx15(Chevron, { direction: "left" })
      }
    ),
    /* @__PURE__ */ jsxs13("span", { className: "px-2 text-meta text-ink-soft sm:hidden", "aria-live": "polite", children: [
      current,
      " / ",
      last
    ] }),
    /* @__PURE__ */ jsx15("div", { className: "hidden items-center gap-1 sm:flex", children: pages.map((page, index) => {
      const previous = pages[index - 1];
      const gap = previous && page - previous > 1;
      return /* @__PURE__ */ jsxs13(React15.Fragment, { children: [
        gap && /* @__PURE__ */ jsx15("span", { className: "px-1 text-meta text-slate-400", "aria-hidden": "true", children: "..." }),
        /* @__PURE__ */ jsx15(
          "button",
          {
            type: "button",
            onClick: () => go(page),
            "aria-current": page === current ? "page" : void 0,
            "aria-label": "Halaman " + page,
            className: cn(
              base,
              page === current ? "bg-brand-700 text-white" : "text-ink hover:bg-surface"
            ),
            children: page
          }
        )
      ] }, page);
    }) }),
    /* @__PURE__ */ jsx15(
      "button",
      {
        type: "button",
        onClick: () => go(current + 1),
        disabled: current >= last,
        "aria-label": "Halaman berikutnya",
        className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"),
        children: /* @__PURE__ */ jsx15(Chevron, { direction: "right" })
      }
    )
  ] });
}

// resources/js/Components/StatusBadge.jsx
import React16 from "react";
import { jsx as jsx16 } from "react/jsx-runtime";
var TONES = {
  pending: { token: "warning", label: "Menunggu" },
  dibayar: { token: "brand", label: "Dibayar" },
  diproses: { token: "brand", label: "Diproses" },
  dikirim: { token: "brand", label: "Dikirim" },
  selesai: { token: "success", label: "Selesai" },
  batal: { token: "danger", label: "Batal" }
};
var CLASSES = {
  brand: "bg-brand/10 text-brand",
  warning: "bg-warning/10 text-warning-strong",
  success: "bg-success/10 text-success-strong",
  danger: "bg-danger/10 text-danger-strong",
  neutral: "bg-slate-200/60 text-slate-600"
};
function StatusBadge({ status = null, label = null, className = "" }) {
  const key = typeof status === "string" ? status.trim().toLowerCase() : "";
  const tone = TONES[key] ?? null;
  const text = label ?? tone?.label ?? (key === "" ? "-" : status);
  return /* @__PURE__ */ jsx16(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase",
        CLASSES[tone?.token ?? "neutral"],
        className
      ),
      children: text
    }
  );
}

// resources/js/Components/InlineNotice.jsx
import React17 from "react";
import { jsx as jsx17, jsxs as jsxs14 } from "react/jsx-runtime";
var TONES2 = {
  info: "bg-brand-100 text-ink",
  success: "bg-success/10 text-ink",
  warning: "bg-warning/10 text-ink",
  error: "bg-red-50 border border-danger text-ink"
};
var ICONS = {
  info: SearchIcon,
  success: CheckIcon,
  warning: AlertIcon,
  error: AlertIcon
};
var ICON_TONES = {
  info: "text-brand",
  success: "text-success-strong",
  warning: "text-warning-strong",
  error: "text-danger"
};
function InlineNotice({
  tone = "info",
  title = null,
  children = null,
  onDismiss = null,
  className = ""
}) {
  const Icon = ICONS[tone] ?? ICONS.info;
  return /* @__PURE__ */ jsxs14(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn("flex items-start gap-3 rounded-md p-4", TONES2[tone] ?? TONES2.info, className),
      children: [
        /* @__PURE__ */ jsx17("span", { className: cn("mt-0.5 shrink-0", ICON_TONES[tone] ?? ICON_TONES.info), "aria-hidden": "true", children: /* @__PURE__ */ jsx17(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs14("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx17("p", { className: "text-label", children: title }),
          children && /* @__PURE__ */ jsx17("div", { className: "text-meta text-ink-soft", children })
        ] }),
        onDismiss && /* @__PURE__ */ jsx17(
          "button",
          {
            type: "button",
            onClick: onDismiss,
            "aria-label": "Tutup pesan",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60",
            children: /* @__PURE__ */ jsx17(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}

// resources/js/Components/Toast.jsx
import React18, { useEffect as useEffect4 } from "react";
import { jsx as jsx18, jsxs as jsxs15 } from "react/jsx-runtime";
var TONES3 = {
  info: { bar: "border-l-brand", icon: SearchIcon, color: "text-brand" },
  success: { bar: "border-l-success", icon: CheckIcon, color: "text-success-strong" },
  warning: { bar: "border-l-warning", icon: AlertIcon, color: "text-warning-strong" },
  error: { bar: "border-l-danger", icon: AlertIcon, color: "text-danger" }
};
function Toast({
  tone = "info",
  title = null,
  message = null,
  duration = 4e3,
  onClose = null
}) {
  const config = TONES3[tone] ?? TONES3.info;
  const Icon = config.icon;
  useEffect4(() => {
    if (!duration || !onClose) return void 0;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [duration, onClose]);
  return /* @__PURE__ */ jsxs15(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn(
        "pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-md border border-line border-l-[3px] bg-white p-4 shadow-raised animate-fade-up",
        config.bar
      ),
      children: [
        /* @__PURE__ */ jsx18("span", { className: cn("mt-0.5 shrink-0", config.color), "aria-hidden": "true", children: /* @__PURE__ */ jsx18(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs15("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx18("p", { className: "text-label text-ink", children: title }),
          message && /* @__PURE__ */ jsx18("p", { className: "text-meta text-ink-soft", children: message })
        ] }),
        onClose && /* @__PURE__ */ jsx18(
          "button",
          {
            type: "button",
            onClick: onClose,
            "aria-label": "Tutup notifikasi",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-surface",
            children: /* @__PURE__ */ jsx18(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}

// resources/js/Pages/Admin/Orders/Index.jsx
import { jsx as jsx19, jsxs as jsxs16 } from "react/jsx-runtime";
var DASAR = { q: "", status: "semua", bayar: "semua", dari: "", sampai: "" };
var STATUS = [
  { value: "semua", label: "Semua status" },
  { value: "pending", label: "Pending" },
  { value: "dibayar", label: "Dibayar" },
  { value: "diproses", label: "Diproses" },
  { value: "dikirim", label: "Dikirim" },
  { value: "selesai", label: "Selesai" },
  { value: "batal", label: "Batal" }
];
var BAYAR = [
  { value: "semua", label: "Semua pembayaran" },
  { value: "pending", label: "Menunggu pembayaran" },
  { value: "settlement", label: "Lunas" },
  { value: "expire", label: "Kedaluwarsa" },
  { value: "deny", label: "Ditolak" },
  { value: "cancel", label: "Dibatalkan" }
];
var asText = (value) => value === null || value === void 0 ? "" : String(value);
var keFilter = (sumber) => ({
  q: asText(sumber?.q),
  status: sumber?.status ? asText(sumber.status) : DASAR.status,
  bayar: sumber?.bayar ? asText(sumber.bayar) : DASAR.bayar,
  dari: asText(sumber?.dari),
  sampai: asText(sumber?.sampai)
});
function Index({ pesanan = null, filter = null, ringkasan = null, flash = null }) {
  const daftar = Array.isArray(pesanan?.data) ? pesanan.data : [];
  const meta = pesanan?.meta ?? null;
  const aktif = keFilter(filter);
  const adaFilter = aktif.q !== "" || aktif.status !== DASAR.status || aktif.bayar !== DASAR.bayar || aktif.dari !== "" || aktif.sampai !== "";
  const [memuat, setMemuat] = useState4(false);
  const [galat, setGalat] = useState4(null);
  const [galatTanggal, setGalatTanggal] = useState4(null);
  const [toast, setToast] = useState4(null);
  useEffect5(() => {
    if (flash?.success) {
      setToast({ tone: "success", title: "Berhasil", message: asText(flash.success) });
    } else if (flash?.error) {
      setToast({ tone: "error", title: "Gagal", message: asText(flash.error) });
    }
  }, [flash?.success, flash?.error]);
  const halaman = Number(meta?.current_page) > 0 ? Number(meta.current_page) : 1;
  const halamanAkhir = Number(meta?.last_page) > 0 ? Number(meta.last_page) : 1;
  const urlFilter = (perubahan = {}) => {
    const berikut = { ...aktif, ...perubahan };
    const query = new URLSearchParams();
    if (berikut.q !== "") query.set("q", berikut.q);
    if (berikut.status !== DASAR.status) query.set("status", berikut.status);
    if (berikut.bayar !== DASAR.bayar) query.set("bayar", berikut.bayar);
    if (berikut.dari !== "") query.set("dari", berikut.dari);
    if (berikut.sampai !== "") query.set("sampai", berikut.sampai);
    const teks2 = query.toString();
    return teks2 === "" ? "/admin/pesanan" : `/admin/pesanan?${teks2}`;
  };
  const buka = (perubahan = {}, opsi = {}) => {
    const berikut = { ...aktif, ...perubahan };
    const query = {};
    if (berikut.q !== "") query.q = berikut.q;
    if (berikut.status !== DASAR.status) query.status = berikut.status;
    if (berikut.bayar !== DASAR.bayar) query.bayar = berikut.bayar;
    if (berikut.dari !== "") query.dari = berikut.dari;
    if (berikut.sampai !== "") query.sampai = berikut.sampai;
    if (opsi.page && Number(opsi.page) > 1) query.page = Number(opsi.page);
    setGalat(null);
    router.get("/admin/pesanan", query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onStart: () => setMemuat(true),
      onFinish: () => setMemuat(false),
      onError: () => setGalat("Permintaan daftar pesanan gagal diproses. Periksa koneksi lalu coba lagi.")
    });
  };
  const gantiTanggal = (kunci, nilai) => {
    const berikut = { ...aktif, [kunci]: nilai };
    if (berikut.dari !== "" && berikut.sampai !== "" && berikut.dari > berikut.sampai) {
      setGalatTanggal("Tanggal awal tidak boleh melewati tanggal akhir.");
      return;
    }
    setGalatTanggal(null);
    buka({ [kunci]: nilai });
  };
  const reset = () => {
    setGalatTanggal(null);
    buka({ ...DASAR });
  };
  const kpi = [
    { label: "Total pesanan", value: ringkasan?.total, href: urlFilter({ status: "semua" }) },
    { label: "Pending", value: ringkasan?.pending, href: urlFilter({ status: "pending" }) },
    { label: "Dibayar", value: ringkasan?.dibayar, href: urlFilter({ status: "dibayar" }) },
    { label: "Diproses", value: ringkasan?.diproses, href: urlFilter({ status: "diproses" }) },
    { label: "Dikirim", value: ringkasan?.dikirim, href: urlFilter({ status: "dikirim" }) },
    { label: "Selesai", value: ringkasan?.selesai, href: urlFilter({ status: "selesai" }) },
    { label: "Batal", value: ringkasan?.batal, href: urlFilter({ status: "batal" }) }
  ];
  const kolom = [
    {
      key: "code",
      header: "Kode pesanan",
      render: (baris2) => /* @__PURE__ */ jsx19("span", { className: "font-semibold text-ink", children: asText(baris2?.code) || "-" })
    },
    {
      key: "created_at",
      header: "Tanggal",
      render: (baris2) => /* @__PURE__ */ jsx19("span", { className: "whitespace-nowrap", children: formatDate(baris2?.created_at) })
    },
    {
      key: "customer_name",
      header: "Pelanggan",
      render: (baris2) => /* @__PURE__ */ jsxs16("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx19("p", { className: "truncate font-semibold text-ink", children: asText(baris2?.customer_name) || "-" }),
        /* @__PURE__ */ jsx19("p", { className: "truncate text-meta text-slate-500", children: asText(baris2?.customer_phone) || asText(baris2?.customer_email) || "-" })
      ] })
    },
    {
      key: "items_count",
      header: "Item",
      align: "right",
      render: (baris2) => baris2?.items_count === null || baris2?.items_count === void 0 ? "-" : `${formatNumber(baris2.items_count)} item`
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (baris2) => /* @__PURE__ */ jsx19("span", { className: "whitespace-nowrap font-semibold text-ink", children: rupiah(baris2?.total) ?? "-" })
    },
    {
      key: "payment_status",
      header: "Status bayar",
      render: (baris2) => /* @__PURE__ */ jsx19(StatusBadge, { status: baris2?.payment_status, label: asText(baris2?.payment_label) || null })
    },
    {
      key: "status",
      header: "Status pesanan",
      render: (baris2) => /* @__PURE__ */ jsx19(StatusBadge, { status: baris2?.status, label: asText(baris2?.status_label) || null })
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "right",
      render: (baris2) => /* @__PURE__ */ jsx19(
        Button,
        {
          variant: "link",
          size: "sm",
          href: asText(baris2?.url) || `/admin/pesanan/${asText(baris2?.id)}`,
          children: "Detail"
        }
      )
    }
  ];
  return /* @__PURE__ */ jsxs16(AdminLayout, { title: "Pesanan", children: [
    /* @__PURE__ */ jsxs16("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx19(
        PageHeader,
        {
          title: "Pesanan",
          description: "Pantau pesanan masuk, status pembayaran, dan status pengirimannya."
        }
      ),
      /* @__PURE__ */ jsx19("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7", children: kpi.map((item) => /* @__PURE__ */ jsx19(
        KpiCard,
        {
          label: item.label,
          value: item.value === null || item.value === void 0 || item.value === "" ? null : formatNumber(item.value),
          href: item.href
        },
        item.label
      )) }),
      /* @__PURE__ */ jsxs16("div", { className: "flex flex-col gap-4 rounded-lg border border-line bg-white p-4", children: [
        /* @__PURE__ */ jsx19(
          SearchInput,
          {
            value: aktif.q,
            onChange: (nilai) => buka({ q: nilai }),
            loading: memuat,
            label: "Cari pesanan",
            placeholder: "Cari kode, nama, telepon, atau email"
          }
        ),
        /* @__PURE__ */ jsxs16("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
          /* @__PURE__ */ jsx19(Field, { label: "Status pesanan", htmlFor: "filter-status", children: /* @__PURE__ */ jsx19(
            Select,
            {
              id: "filter-status",
              value: aktif.status,
              disabled: memuat,
              onChange: (event) => buka({ status: event.target.value }),
              children: STATUS.map((item) => /* @__PURE__ */ jsx19("option", { value: item.value, children: item.label }, item.value))
            }
          ) }),
          /* @__PURE__ */ jsx19(Field, { label: "Status pembayaran", htmlFor: "filter-bayar", children: /* @__PURE__ */ jsx19(
            Select,
            {
              id: "filter-bayar",
              value: aktif.bayar,
              disabled: memuat,
              onChange: (event) => buka({ bayar: event.target.value }),
              children: BAYAR.map((item) => /* @__PURE__ */ jsx19("option", { value: item.value, children: item.label }, item.value))
            }
          ) }),
          /* @__PURE__ */ jsx19(Field, { label: "Dari tanggal", htmlFor: "filter-dari", error: galatTanggal, children: /* @__PURE__ */ jsx19(
            Input,
            {
              id: "filter-dari",
              type: "date",
              value: aktif.dari,
              disabled: memuat,
              error: galatTanggal,
              onChange: (event) => gantiTanggal("dari", event.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx19(Field, { label: "Sampai tanggal", htmlFor: "filter-sampai", error: galatTanggal, children: /* @__PURE__ */ jsx19(
            Input,
            {
              id: "filter-sampai",
              type: "date",
              value: aktif.sampai,
              disabled: memuat,
              error: galatTanggal,
              onChange: (event) => gantiTanggal("sampai", event.target.value)
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs16("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs16("p", { className: "text-meta text-slate-500", children: [
            "Menampilkan ",
            formatNumber(daftar.length),
            " dari",
            " ",
            meta?.total === null || meta?.total === void 0 ? "-" : formatNumber(meta.total),
            " ",
            "pesanan."
          ] }),
          adaFilter && /* @__PURE__ */ jsx19(Button, { variant: "secondary", size: "sm", onClick: reset, disabled: memuat, children: "Reset filter" })
        ] })
      ] }),
      galat && /* @__PURE__ */ jsx19(InlineNotice, { tone: "error", title: "Gagal memuat daftar pesanan", children: /* @__PURE__ */ jsxs16("div", { className: "flex flex-col items-start gap-3", children: [
        /* @__PURE__ */ jsx19("p", { children: galat }),
        /* @__PURE__ */ jsx19(Button, { variant: "secondary", size: "sm", onClick: () => buka({}), disabled: memuat, children: "Coba lagi" })
      ] }) }),
      /* @__PURE__ */ jsx19(
        DataTable,
        {
          columns: kolom,
          rows: daftar,
          loading: memuat,
          emptyTitle: adaFilter ? "Tidak ada pesanan yang cocok" : "Belum ada pesanan",
          emptyDescription: adaFilter ? "Ubah atau reset filter untuk melihat pesanan lain." : "Pesanan yang dibuat pelanggan lewat checkout akan tampil di sini.",
          emptyActionLabel: adaFilter ? "Tampilkan semua pesanan" : null,
          emptyActionHref: adaFilter ? "/admin/pesanan" : null,
          caption: "Daftar pesanan"
        }
      ),
      /* @__PURE__ */ jsx19(Pagination, { currentPage: halaman, lastPage: halamanAkhir, onPageChange: (page) => buka({}, { page }) })
    ] }),
    toast && /* @__PURE__ */ jsx19("div", { className: "pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]", children: /* @__PURE__ */ jsx19(
      Toast,
      {
        tone: toast.tone,
        title: toast.title,
        message: toast.message,
        onClose: () => setToast(null)
      }
    ) })
  ] });
}

// resources/js/Pages/Admin/Orders/Show.jsx
import React28, { useEffect as useEffect9, useState as useState9 } from "react";

// resources/js/Pages/Admin/Orders/partials/KartuBagian.jsx
import React20 from "react";
import { jsx as jsx20, jsxs as jsxs17 } from "react/jsx-runtime";
function KartuBagian({ title = "", description = null, actions = null, children = null, className = "" }) {
  return /* @__PURE__ */ jsxs17("section", { className: cn("flex flex-col gap-4 rounded-lg border border-line bg-white p-6", className), children: [
    (title !== "" || actions) && /* @__PURE__ */ jsxs17("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs17("div", { className: "min-w-0", children: [
        title !== "" && /* @__PURE__ */ jsx20("h2", { className: "text-h3 text-ink", children: title }),
        description && /* @__PURE__ */ jsx20("p", { className: "mt-1 text-meta text-slate-600", children: description })
      ] }),
      actions
    ] }),
    children
  ] });
}

// resources/js/Pages/Admin/Orders/partials/BuktiPembayaran.jsx
import React22, { useState as useState5 } from "react";

// resources/js/Components/QrCode.jsx
import React21, { useMemo } from "react";

// resources/js/lib/qr.js
var EC_LEVEL_BITS = 1;
var RS_BLOCKS = {
  1: [26, 7, [[1, 19]]],
  2: [44, 10, [[1, 34]]],
  3: [70, 15, [[1, 55]]],
  4: [100, 20, [[1, 80]]],
  5: [134, 26, [[1, 108]]],
  6: [172, 18, [[2, 68]]],
  7: [196, 20, [[2, 78]]],
  8: [242, 24, [[2, 97]]],
  9: [292, 30, [[2, 116]]],
  10: [346, 18, [[2, 68], [2, 69]]],
  11: [404, 20, [[4, 81]]],
  12: [466, 24, [[2, 92], [2, 93]]],
  13: [532, 26, [[4, 107]]],
  14: [581, 30, [[3, 115], [1, 116]]],
  15: [655, 22, [[5, 87], [1, 88]]],
  16: [733, 24, [[5, 98], [1, 99]]],
  17: [815, 28, [[1, 107], [5, 108]]],
  18: [901, 30, [[5, 120], [1, 121]]],
  19: [991, 28, [[3, 113], [4, 114]]],
  20: [1085, 28, [[3, 107], [5, 108]]]
};
var ALIGN = {
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
  11: [6, 30, 54],
  12: [6, 32, 58],
  13: [6, 34, 62],
  14: [6, 26, 46, 66],
  15: [6, 26, 48, 70],
  16: [6, 26, 50, 74],
  17: [6, 30, 54, 78],
  18: [6, 30, 56, 82],
  19: [6, 30, 58, 86],
  20: [6, 34, 62, 90]
};
var EXP = new Uint8Array(512);
var LOG = new Uint8Array(256);
(function initGalois() {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 285;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
})();
var gfMul = (a, b) => a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
function rsGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}
function rsRemainder(data, generator) {
  const res = new Array(generator.length - 1).fill(0);
  data.forEach((byte) => {
    const factor = byte ^ res[0];
    res.shift();
    res.push(0);
    for (let i = 0; i < res.length; i += 1) res[i] ^= gfMul(generator[i + 1], factor);
  });
  return res;
}
var lengthBits = (version) => version < 10 ? 8 : 16;
function dataCodewords(version) {
  const [, , groups] = RS_BLOCKS[version];
  return groups.reduce((sum, [count, per]) => sum + count * per, 0);
}
function byteCapacity(version) {
  return Math.floor((dataCodewords(version) * 8 - 4 - lengthBits(version)) / 8);
}
function pickVersion(byteLength) {
  for (let version = 1; version <= 20; version += 1) {
    if (byteCapacity(version) >= byteLength) return version;
  }
  return null;
}
function toCodewords(bytes, version) {
  const bits = [];
  const push = (value, length) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push(value >> i & 1);
  };
  push(4, 4);
  push(bytes.length, lengthBits(version));
  bytes.forEach((byte) => push(byte, 8));
  const capacity = dataCodewords(version) * 8;
  push(0, Math.min(4, capacity - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);
  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((acc, bit) => acc << 1 | bit, 0));
  }
  let padToggle = true;
  while (codewords.length < dataCodewords(version)) {
    codewords.push(padToggle ? 236 : 17);
    padToggle = !padToggle;
  }
  return codewords;
}
function interleave(codewords, version) {
  const [, eccPerBlock, groups] = RS_BLOCKS[version];
  const generator = rsGenerator(eccPerBlock);
  const blocks = [];
  let offset = 0;
  groups.forEach(([count, per]) => {
    for (let i = 0; i < count; i += 1) {
      blocks.push(codewords.slice(offset, offset + per));
      offset += per;
    }
  });
  const eccBlocks = blocks.map((block) => rsRemainder(block, generator));
  const out = [];
  const maxData = Math.max(...blocks.map((b) => b.length));
  for (let i = 0; i < maxData; i += 1) {
    blocks.forEach((block) => {
      if (i < block.length) out.push(block[i]);
    });
  }
  for (let i = 0; i < eccPerBlock; i += 1) {
    eccBlocks.forEach((block) => out.push(block[i]));
  }
  return out;
}
var MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => r * c % 2 + r * c % 3 === 0,
  (r, c) => (r * c % 2 + r * c % 3) % 2 === 0,
  (r, c) => ((r + c) % 2 + r * c % 3) % 2 === 0
];
function formatBits(mask) {
  const data = EC_LEVEL_BITS << 3 | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) rem = rem << 1 ^ (rem >>> 9) * 1335;
  return ((data << 10 | rem) ^ 21522) & 32767;
}
function versionBits(version) {
  let rem = version;
  for (let i = 0; i < 12; i += 1) rem = rem << 1 ^ (rem >>> 11) * 7973;
  return (version << 12 | rem) & 262143;
}
function placeholderMatrix(version) {
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => new Array(size).fill(false));
  const fixed = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (row, col, dark) => {
    modules[row][col] = dark;
    fixed[row][col] = true;
  };
  const finder = (row0, col0) => {
    for (let dr = -1; dr <= 7; dr += 1) {
      for (let dc = -1; dc <= 7; dc += 1) {
        const row = row0 + dr;
        const col = col0 + dc;
        if (row < 0 || col < 0 || row >= size || col >= size) continue;
        const dark = dr >= 0 && dr <= 6 && (dc === 0 || dc === 6) || dc >= 0 && dc <= 6 && (dr === 0 || dr === 6) || dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        set(row, col, dark);
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  for (let i = 8; i < size - 8; i += 1) {
    if (!fixed[6][i]) set(6, i, i % 2 === 0);
    if (!fixed[i][6]) set(i, 6, i % 2 === 0);
  }
  const centers = ALIGN[version] || [];
  const last = centers.length - 1;
  centers.forEach((row, i) => {
    centers.forEach((col, j) => {
      if (i === 0 && j === 0 || i === 0 && j === last || i === last && j === 0) return;
      for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          set(row + dr, col + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
        }
      }
    });
  });
  set(size - 8, 8, true);
  const reserve = (row, col) => {
    if (!fixed[row][col]) set(row, col, false);
  };
  for (let i = 0; i < 9; i += 1) {
    reserve(8, i);
    reserve(i, 8);
  }
  for (let i = 0; i < 8; i += 1) {
    reserve(8, size - 1 - i);
    reserve(size - 1 - i, 8);
  }
  if (version >= 7) {
    const bits = versionBits(version);
    for (let i = 0; i < 18; i += 1) {
      const dark = (bits >> i & 1) === 1;
      const row = Math.floor(i / 3);
      const col = size - 11 + i % 3;
      reserve(row, col);
      reserve(col, row);
      set(row, col, dark);
      set(col, row, dark);
    }
  }
  return { size, modules, fixed };
}
function placeData({ size, modules, fixed }, codewords) {
  const totalBits = codewords.length * 8;
  const bitAt = (index2) => index2 < totalBits ? (codewords[index2 >> 3] >> 7 - (index2 & 7) & 1) === 1 : false;
  let index = 0;
  for (let col = size - 1; col > 0; col -= 2) {
    const upward = (size - 1 - col) / 2 % 2 === 0;
    for (let i = 0; i < size; i += 1) {
      const row = upward ? size - 1 - i : i;
      for (let k = 0; k < 2; k += 1) {
        const c = col - k;
        if (fixed[row][c]) continue;
        modules[row][c] = bitAt(index);
        index += 1;
      }
    }
  }
}
function applyMask({ modules, fixed }, mask) {
  const fn = MASKS[mask];
  for (let row = 0; row < modules.length; row += 1) {
    for (let col = 0; col < modules.length; col += 1) {
      if (!fixed[row][col] && fn(row, col)) modules[row][col] = !modules[row][col];
    }
  }
}
function writeFormat({ size, modules, fixed }, mask) {
  const bits = formatBits(mask);
  const bit = (i) => (bits >> i & 1) === 1;
  const set = (row, col, dark) => {
    modules[row][col] = dark;
    fixed[row][col] = true;
  };
  for (let i = 0; i <= 5; i += 1) set(i, 8, bit(i));
  set(7, 8, bit(6));
  set(8, 8, bit(7));
  set(8, 7, bit(8));
  for (let i = 9; i < 15; i += 1) set(8, 14 - i, bit(i));
  for (let i = 0; i < 8; i += 1) set(8, size - 1 - i, bit(i));
  for (let i = 8; i < 15; i += 1) set(size - 15 + i, 8, bit(i));
  set(size - 8, 8, true);
}
function penalty(modules) {
  const size = modules.length;
  let score = 0;
  for (let row = 0; row < size; row += 1) {
    let run = 1;
    for (let col = 1; col < size; col += 1) {
      if (modules[row][col] === modules[row][col - 1]) {
        run += 1;
        if (run === 5) score += 3;
        else if (run > 5) score += 1;
      } else run = 1;
    }
  }
  for (let col = 0; col < size; col += 1) {
    let run = 1;
    for (let row = 1; row < size; row += 1) {
      if (modules[row][col] === modules[row - 1][col]) {
        run += 1;
        if (run === 5) score += 3;
        else if (run > 5) score += 1;
      } else run = 1;
    }
  }
  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const v = modules[row][col];
      if (v === modules[row][col + 1] && v === modules[row + 1][col] && v === modules[row + 1][col + 1]) {
        score += 3;
      }
    }
  }
  const pattern = [true, false, true, true, true, false, true];
  const matches = (line, start) => {
    for (let i = 0; i < 7; i += 1) if (line[start + i] !== pattern[i]) return false;
    const before = start - 1 >= 0 ? line[start - 1] : null;
    const after = start + 7 < line.length ? line[start + 7] : null;
    return before !== true && after !== true;
  };
  const scanLine = (line) => {
    for (let i = 0; i + 7 <= line.length; i += 1) if (matches(line, i)) score += 40;
  };
  for (let row = 0; row < size; row += 1) scanLine(modules[row]);
  for (let col = 0; col < size; col += 1) scanLine(modules.map((row) => row[col]));
  let dark = 0;
  modules.forEach((row) => row.forEach((v) => {
    if (v) dark += 1;
  }));
  const percent = dark * 100 / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return score;
}
function qrMatrix(value) {
  const text = String(value ?? "");
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = pickVersion(bytes.length);
  if (version === null) {
    throw new Error("QrCode: muatan melebihi kapasitas versi 20 level L (858 byte).");
  }
  const base = placeholderMatrix(version);
  placeData(base, interleave(toCodewords(bytes, version), version));
  let best = null;
  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = {
      size: base.size,
      modules: base.modules.map((row) => row.slice()),
      fixed: base.fixed.map((row) => row.slice())
    };
    applyMask(candidate, mask);
    writeFormat(candidate, mask);
    const score = penalty(candidate.modules);
    if (best === null || score < best.score) best = { score, mask, modules: candidate.modules };
  }
  return { size: base.size, modules: best.modules, version, mask: best.mask };
}
function qrPath(matrix) {
  const { size, modules } = matrix;
  let d = "";
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (modules[row][col]) d += `M${col} ${row}h1v1h-1z`;
    }
  }
  return d;
}

// resources/js/Components/QrCode.jsx
import { jsx as jsx21, jsxs as jsxs18 } from "react/jsx-runtime";
function QrCode({ value = "", size = 240, label = "Kode QR pembayaran", className = "" }) {
  const matrix = useMemo(() => {
    if (!value) return null;
    try {
      return qrMatrix(value);
    } catch (error) {
      return null;
    }
  }, [value]);
  if (!matrix) {
    return /* @__PURE__ */ jsx21(
      "div",
      {
        className,
        style: { width: size, height: size },
        role: "img",
        "aria-label": "Kode QR belum tersedia"
      }
    );
  }
  const total = matrix.size;
  const path2 = qrPath(matrix);
  return /* @__PURE__ */ jsxs18(
    "svg",
    {
      className,
      viewBox: `0 0 ${total} ${total}`,
      width: size,
      height: size,
      role: "img",
      "aria-label": label,
      shapeRendering: "crispEdges",
      children: [
        /* @__PURE__ */ jsx21("rect", { width: total, height: total, fill: "#ffffff" }),
        /* @__PURE__ */ jsx21("path", { d: path2, fill: "#111827" })
      ]
    }
  );
}

// resources/js/Pages/Admin/Orders/partials/BuktiPembayaran.jsx
import { jsx as jsx22, jsxs as jsxs19 } from "react/jsx-runtime";
var asText2 = (value) => value === null || value === void 0 ? "" : String(value);
var uang = (value) => rupiah(value) ?? "-";
var baris = (label, nilai, kunci) => /* @__PURE__ */ jsxs19(
  "div",
  {
    className: "flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-b-0",
    children: [
      /* @__PURE__ */ jsx22("dt", { className: "text-meta text-slate-600", children: label }),
      /* @__PURE__ */ jsx22("dd", { className: "min-w-0 break-words text-right text-body text-ink", children: nilai })
    ]
  },
  kunci ?? label
);
function BuktiPembayaran({ payment = null, paymentLabel = null }) {
  const [gambarGagal, setGambarGagal] = useState5(false);
  if (payment === null || payment === void 0) {
    return /* @__PURE__ */ jsx22(InlineNotice, { tone: "info", title: "Belum ada data pembayaran", children: "Pesanan ini belum punya baris pembayaran di server, jadi kode QR dan ID transaksi belum tersedia." });
  }
  const qrString = asText2(payment.qr_string);
  const qrisUrl = asText2(payment.qris_url);
  const lunas = asText2(payment.status) === "settlement";
  return /* @__PURE__ */ jsxs19("div", { className: "flex flex-col gap-4", children: [
    lunas && /* @__PURE__ */ jsxs19(InlineNotice, { tone: "success", title: "Pembayaran lunas", children: [
      "Server mencatat pembayaran diterima pada ",
      formatDateTime(payment.paid_at),
      "."
    ] }),
    qrString !== "" ? /* @__PURE__ */ jsx22("div", { className: "flex justify-center rounded-md border border-line bg-white p-4", children: /* @__PURE__ */ jsx22(QrCode, { value: qrString, size: 200, label: "Kode QR pembayaran pesanan" }) }) : qrisUrl !== "" && !gambarGagal ? /* @__PURE__ */ jsx22("div", { className: "flex justify-center rounded-md border border-line bg-white p-4", children: /* @__PURE__ */ jsx22(
      "img",
      {
        src: qrisUrl,
        alt: "Gambar kode QR pembayaran dari penyedia",
        width: 200,
        height: 200,
        className: "h-[200px] w-[200px] object-contain",
        onError: () => setGambarGagal(true)
      }
    ) }) : qrisUrl !== "" && gambarGagal ? /* @__PURE__ */ jsxs19("div", { className: "flex flex-col items-center gap-2 rounded-md border border-line bg-white p-6 text-center", children: [
      /* @__PURE__ */ jsx22("span", { className: "text-slate-500", "aria-hidden": "true", children: /* @__PURE__ */ jsx22(ImageOffIcon, { size: 28 }) }),
      /* @__PURE__ */ jsx22("p", { className: "text-meta text-slate-600", children: "Gambar QR dari penyedia pembayaran gagal dimuat. Buka pesanan ini lagi untuk mencoba ulang." })
    ] }) : /* @__PURE__ */ jsx22(InlineNotice, { tone: "warning", title: "Kode QR belum tersedia", children: "Penyedia pembayaran belum mengirim tautan gambar maupun isi kode QR untuk pesanan ini." }),
    /* @__PURE__ */ jsxs19("dl", { className: "flex flex-col", children: [
      baris(
        "Status pembayaran",
        /* @__PURE__ */ jsx22(StatusBadge, { status: payment.status, label: asText2(paymentLabel) || null })
      ),
      baris("Penyedia", asText2(payment.provider) || "-"),
      baris("ID transaksi", asText2(payment.transaction_id) || "-"),
      baris("Jumlah", uang(payment.gross_amount)),
      baris("Kedaluwarsa", formatDateTime(payment.expires_at)),
      baris("Dibayar", formatDateTime(payment.paid_at))
    ] })
  ] });
}

// resources/js/Pages/Admin/Orders/partials/InfoResi.jsx
import React23, { useEffect as useEffect6, useState as useState6 } from "react";
import { jsx as jsx23, jsxs as jsxs20 } from "react/jsx-runtime";
var BATAS_RESI = 60;
var ID_INPUT = "resi-pesanan";
var asText3 = (nilai) => nilai === null || nilai === void 0 ? "" : String(nilai);
function InfoResi({ pesanan = null }) {
  const id = pesanan?.id ?? null;
  const tersimpan = asText3(pesanan?.tracking_number);
  const galat = usePage().props.errors?.tracking_number ?? null;
  const [nilai, setNilai] = useState6(tersimpan);
  const [proses, setProses] = useState6(false);
  useEffect6(() => {
    setNilai(asText3(pesanan?.tracking_number));
  }, [pesanan?.id, pesanan?.tracking_number]);
  if (id === null) {
    return null;
  }
  const kirim = (event) => {
    event.preventDefault();
    if (proses) {
      return;
    }
    router.patch(
      `/admin/pesanan/${id}/resi`,
      { tracking_number: nilai },
      {
        preserveScroll: true,
        onStart: () => setProses(true),
        onFinish: () => setProses(false)
      }
    );
  };
  return /* @__PURE__ */ jsxs20("form", { className: "flex flex-col gap-4", onSubmit: kirim, noValidate: true, children: [
    /* @__PURE__ */ jsx23(
      Field,
      {
        label: "Nomor resi",
        htmlFor: ID_INPUT,
        hint: "Isi nomor resi dari ekspedisi setelah paket dikirim. Kosongkan untuk menghapus.",
        error: galat,
        children: /* @__PURE__ */ jsx23(
          Input,
          {
            id: ID_INPUT,
            name: "tracking_number",
            type: "text",
            maxLength: BATAS_RESI,
            autoComplete: "off",
            value: nilai,
            error: galat,
            onChange: (event) => setNilai(event.target.value)
          }
        )
      }
    ),
    /* @__PURE__ */ jsx23("p", { className: "text-meta text-slate-500", children: tersimpan === "" ? "Belum ada nomor resi." : `Tersimpan: ${tersimpan}` }),
    /* @__PURE__ */ jsx23("div", { children: /* @__PURE__ */ jsx23(Button, { variant: "primary", type: "submit", loading: proses, children: "Simpan resi" }) })
  ] });
}

// resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx
import React24, { useState as useState7 } from "react";
import { jsx as jsx24, jsxs as jsxs21 } from "react/jsx-runtime";
var asText4 = (nilai) => nilai === null || nilai === void 0 ? "" : String(nilai);
function SyncPaymentButton({ pesananId = null, onHasilSinkron = null }) {
  const form = useForm({});
  const [hasil2, setHasil] = useState7(null);
  const id = asText4(pesananId).trim();
  if (id === "") {
    return null;
  }
  const sinkronkan = () => {
    if (form.processing) {
      return;
    }
    setHasil(null);
    form.patch(`/admin/pesanan/${encodeURIComponent(id)}/sinkron-pembayaran`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (halaman) => {
        const flashHalaman = halaman?.props?.flash ?? {};
        const sukses = asText4(flashHalaman.success);
        const galat = asText4(flashHalaman.error);
        if (sukses !== "") {
          setHasil({ tone: "success", pesan: sukses });
        } else if (galat !== "") {
          setHasil({ tone: "error", pesan: galat });
        }
        if ((sukses !== "" || galat !== "") && onHasilSinkron) {
          onHasilSinkron(`${sukses}|${galat}`);
        }
      }
    });
  };
  return /* @__PURE__ */ jsxs21("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx24("div", { children: /* @__PURE__ */ jsx24(
      Button,
      {
        variant: "secondary",
        className: "min-w-[16rem]",
        loading: form.processing,
        onClick: sinkronkan,
        children: "Sinkronkan status pembayaran"
      }
    ) }),
    hasil2 !== null && /* @__PURE__ */ jsx24(InlineNotice, { tone: hasil2.tone, children: hasil2.pesan })
  ] });
}

// resources/js/Pages/Admin/Orders/partials/UbahStatusModal.jsx
import React27, { useEffect as useEffect8, useState as useState8 } from "react";

// resources/js/Components/Modal.jsx
import React25, { useEffect as useEffect7, useRef as useRef4 } from "react";
import { jsx as jsx25, jsxs as jsxs22 } from "react/jsx-runtime";
var SIZES2 = {
  md: "max-w-modal",
  lg: "max-w-modalLg"
};
function Modal({
  open = false,
  title = null,
  description = null,
  children = null,
  footer = null,
  onClose,
  size = "md",
  closeLabel = "Tutup"
}) {
  const panelRef = useRef4(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);
  useEffect7(() => {
    if (!open) return void 0;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsx25(
    "div",
    {
      className: "fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose?.();
      },
      children: /* @__PURE__ */ jsxs22(
        "div",
        {
          ref: panelRef,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": title ? "modal-title" : void 0,
          tabIndex: -1,
          className: cn(
            "w-full rounded-xl bg-white p-6 shadow-raised animate-modal-in",
            SIZES2[size] ?? SIZES2.md
          ),
          children: [
            /* @__PURE__ */ jsxs22("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs22("div", { className: "min-w-0", children: [
                title && /* @__PURE__ */ jsx25("h2", { id: "modal-title", className: "text-h3 text-ink", children: title }),
                description && /* @__PURE__ */ jsx25("p", { className: "mt-1 text-meta text-ink-soft", children: description })
              ] }),
              onClose && /* @__PURE__ */ jsx25(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  "aria-label": closeLabel,
                  className: "-mr-2 -mt-1 inline-flex h-touch w-touch items-center justify-center rounded-md text-ink-soft transition-colors duration-hover hover:bg-surface",
                  children: /* @__PURE__ */ jsx25(CloseIcon, { size: 20 })
                }
              )
            ] }),
            children && /* @__PURE__ */ jsx25("div", { className: "mt-4 text-body text-ink", children }),
            footer && /* @__PURE__ */ jsx25("div", { className: "mt-6 flex flex-wrap justify-end gap-3", children: footer })
          ]
        }
      )
    }
  );
}

// resources/js/Components/Textarea.jsx
import React26 from "react";
import { jsx as jsx26 } from "react/jsx-runtime";
var BASE3 = "w-full min-h-[120px] resize-y rounded-md border border-line bg-white px-3.5 py-3 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Textarea({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx26(
    "textarea",
    {
      id,
      "aria-invalid": error ? "true" : void 0,
      "aria-describedby": error && id ? id + "-error" : void 0,
      className: cn(BASE3, error ? "border-danger" : null, className),
      ...rest
    }
  );
}

// resources/js/Pages/Admin/Orders/partials/UbahStatusModal.jsx
import { Fragment as Fragment3, jsx as jsx27, jsxs as jsxs23 } from "react/jsx-runtime";
var batasCatatan = 255;
function UbahStatusModal({
  open = false,
  pesanan = null,
  statusBerikut = [],
  onClose = () => {
  }
}) {
  const pilihan = Array.isArray(statusBerikut) ? statusBerikut : [];
  const id = pesanan?.id ?? null;
  const [galatLokal, setGalatLokal] = useState8(null);
  const form = useForm({ status: "", note: "" });
  useEffect8(() => {
    if (open) {
      form.clearErrors();
      form.setData({ status: "", note: "" });
      setGalatLokal(null);
    }
  }, [open]);
  if (id === null) return null;
  const terpilih = pilihan.find((item) => item?.value === form.data.status) ?? null;
  const jadiBatal = form.data.status === "batal";
  const jadiDibayar = form.data.status === "dibayar" && !pesanan?.paid_at;
  const galatLain = Object.entries(form.errors).filter(
    ([kunci]) => kunci !== "status" && kunci !== "note"
  );
  const kirim = () => {
    if (form.data.status === "") {
      setGalatLokal("Status pesanan wajib dipilih.");
      return;
    }
    setGalatLokal(null);
    form.patch(`/admin/pesanan/${id}/status`, {
      preserveScroll: true,
      onSuccess: () => onClose()
    });
  };
  return /* @__PURE__ */ jsx27(
    Modal,
    {
      open,
      title: "Ubah status pesanan",
      onClose: () => {
        if (!form.processing) onClose();
      },
      footer: /* @__PURE__ */ jsxs23(Fragment3, { children: [
        /* @__PURE__ */ jsx27(Button, { variant: "secondary", onClick: onClose, disabled: form.processing, children: "Batal" }),
        /* @__PURE__ */ jsx27(Button, { variant: "primary", onClick: kirim, loading: form.processing, children: "Simpan status" })
      ] }),
      children: /* @__PURE__ */ jsxs23(
        "form",
        {
          className: "flex flex-col gap-4",
          onSubmit: (event) => {
            event.preventDefault();
            kirim();
          },
          children: [
            /* @__PURE__ */ jsxs23("p", { className: "text-body text-slate-600", children: [
              "Status saat ini",
              " ",
              /* @__PURE__ */ jsx27("span", { className: "font-semibold text-ink", children: pesanan?.status_label ? String(pesanan.status_label) : "-" }),
              ". Pilih status baru lalu simpan."
            ] }),
            /* @__PURE__ */ jsx27(
              Field,
              {
                label: "Status baru",
                htmlFor: "status-pesanan",
                required: true,
                hint: "Hanya status lanjutan yang sah yang bisa dipilih.",
                error: galatLokal ?? form.errors.status ?? null,
                children: /* @__PURE__ */ jsxs23(
                  Select,
                  {
                    id: "status-pesanan",
                    value: form.data.status,
                    onChange: (event) => form.setData("status", event.target.value),
                    error: galatLokal ?? form.errors.status ?? null,
                    children: [
                      /* @__PURE__ */ jsx27("option", { value: "", children: "Pilih status" }),
                      pilihan.map((item, index) => /* @__PURE__ */ jsx27("option", { value: item?.value ?? "", children: item?.label ?? item?.value ?? "-" }, `${item?.value ?? "status"}-${index}`))
                    ]
                  }
                )
              }
            ),
            terpilih && terpilih.value !== "" && /* @__PURE__ */ jsxs23(InlineNotice, { tone: "info", title: "Status yang dipilih", children: [
              "Pesanan akan menjadi",
              " ",
              /* @__PURE__ */ jsx27("span", { className: "font-semibold text-ink", children: String(terpilih.label ?? terpilih.value) }),
              "."
            ] }),
            jadiBatal && /* @__PURE__ */ jsx27(InlineNotice, { tone: "warning", title: "Membatalkan mengembalikan stok", children: "Status batal mengembalikan stok setiap item pesanan ini (satu pergerakan stok masuk per varian)." }),
            jadiDibayar && /* @__PURE__ */ jsx27(InlineNotice, { tone: "info", title: "Waktu pembayaran diisi otomatis", children: "Waktu pembayaran akan diisi sekarang karena pesanan ini belum punya waktu pembayaran." }),
            /* @__PURE__ */ jsx27(
              Field,
              {
                label: "Catatan",
                htmlFor: "catatan-status",
                hint: `Opsional, maksimal ${batasCatatan} karakter.`,
                error: form.errors.note ?? null,
                children: /* @__PURE__ */ jsx27(
                  Textarea,
                  {
                    id: "catatan-status",
                    rows: 3,
                    maxLength: batasCatatan,
                    value: form.data.note,
                    onChange: (event) => form.setData("note", event.target.value),
                    error: form.errors.note ?? null
                  }
                )
              }
            ),
            galatLain.length > 0 && /* @__PURE__ */ jsx27(InlineNotice, { tone: "error", title: "Perubahan gagal disimpan", children: /* @__PURE__ */ jsx27("ul", { className: "list-inside list-disc", children: galatLain.map(([kunci, pesan]) => /* @__PURE__ */ jsx27("li", { children: String(pesan) }, kunci)) }) })
          ]
        }
      )
    }
  );
}

// resources/js/Pages/Admin/Orders/Show.jsx
import { Fragment as Fragment4, jsx as jsx28, jsxs as jsxs24 } from "react/jsx-runtime";
var asText5 = (value) => value === null || value === void 0 ? "" : String(value);
var uang2 = (value) => rupiah(value) ?? "-";
var jumlah = (value) => value === null || value === void 0 ? "-" : formatNumber(value);
var barisInfo = (label, nilai, kunci) => /* @__PURE__ */ jsxs24(
  "div",
  {
    className: "flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-b-0",
    children: [
      /* @__PURE__ */ jsx28("dt", { className: "text-meta text-slate-600", children: label }),
      /* @__PURE__ */ jsx28("dd", { className: "min-w-0 break-words text-right text-body text-ink", children: nilai })
    ]
  },
  kunci ?? label
);
var barisTotal = (label, nilai, kunci, tebal = false) => /* @__PURE__ */ jsxs24("div", { className: "flex items-center justify-between gap-4", children: [
  /* @__PURE__ */ jsx28("dt", { className: cn("text-meta", tebal ? "font-semibold text-ink" : "text-slate-600"), children: label }),
  /* @__PURE__ */ jsx28("dd", { className: cn("text-body", tebal ? "font-bold text-ink" : "text-ink"), children: nilai })
] }, kunci ?? label);
function Show({ pesanan = null, status_berikut = [], flash = null }) {
  const data = pesanan ?? {};
  const customer = data.customer ?? {};
  const items = Array.isArray(data.items) ? data.items : [];
  const berikut = Array.isArray(status_berikut) ? status_berikut : [];
  const [modalTerbuka, setModalTerbuka] = useState9(false);
  const [toast, setToast] = useState9(null);
  const [flashSinkron, setFlashSinkron] = useState9(null);
  const final = berikut.length === 0;
  const pasanganFlash = `${asText5(flash?.success)}|${asText5(flash?.error)}`;
  useEffect9(() => {
    if (flashSinkron !== null && pasanganFlash !== "|" && pasanganFlash === flashSinkron) {
      setToast(null);
      return;
    }
    if (flash?.success) {
      setToast({ tone: "success", title: "Berhasil", message: asText5(flash.success) });
    } else if (flash?.error) {
      setToast({ tone: "error", title: "Gagal", message: asText5(flash.error) });
    }
  }, [flash?.success, flash?.error, flashSinkron, pasanganFlash]);
  const kolomItem = [
    {
      key: "product_name",
      header: "Produk",
      render: (baris2) => /* @__PURE__ */ jsxs24("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx28("p", { className: "font-semibold text-ink", children: asText5(baris2?.product_name) || "-" }),
        asText5(baris2?.variant_label) !== "" && /* @__PURE__ */ jsx28("p", { className: "text-meta text-slate-500", children: asText5(baris2.variant_label) })
      ] })
    },
    {
      key: "qty",
      header: "Jumlah",
      align: "right",
      render: (baris2) => jumlah(baris2?.qty)
    },
    {
      key: "unit_price",
      header: "Harga satuan",
      align: "right",
      render: (baris2) => /* @__PURE__ */ jsx28("span", { className: "whitespace-nowrap", children: uang2(baris2?.unit_price) })
    },
    {
      key: "line_total",
      header: "Subtotal",
      align: "right",
      render: (baris2) => /* @__PURE__ */ jsx28("span", { className: "whitespace-nowrap font-semibold text-ink", children: uang2(baris2?.line_total) })
    }
  ];
  return /* @__PURE__ */ jsxs24(AdminLayout, { title: asText5(data.code) || "Pesanan", children: [
    /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx28(
        PageHeader,
        {
          title: asText5(data.code) || "Detail pesanan",
          description: asText5(data.created_at) === "" ? null : `Dibuat ${formatDateTime(data.created_at)}`,
          breadcrumb: [
            { label: "Dasbor", href: "/admin" },
            { label: "Pesanan", href: "/admin/pesanan" },
            { label: asText5(data.code) || "Detail" }
          ],
          actions: /* @__PURE__ */ jsxs24(Fragment4, { children: [
            /* @__PURE__ */ jsx28(Button, { variant: "secondary", href: "/admin/pesanan", children: "Kembali ke daftar" }),
            /* @__PURE__ */ jsx28(
              Button,
              {
                variant: "primary",
                onClick: () => setModalTerbuka(true),
                disabled: final,
                "aria-describedby": final ? "status-final" : void 0,
                children: "Ubah status"
              }
            )
          ] })
        }
      ),
      final && /* @__PURE__ */ jsx28("div", { id: "status-final", children: /* @__PURE__ */ jsxs24(InlineNotice, { tone: "info", title: "Status sudah final", children: [
        "Pesanan ini berstatus ",
        asText5(data.status_label) || "-",
        " dan tidak punya status lanjutan, jadi tombol Ubah status dinonaktifkan."
      ] }) }),
      /* @__PURE__ */ jsxs24("div", { className: "grid gap-6 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx28(KartuBagian, { title: "Ringkasan pesanan", className: "lg:col-span-1", children: /* @__PURE__ */ jsxs24("dl", { className: "flex flex-col", children: [
          barisInfo(
            "Status pesanan",
            /* @__PURE__ */ jsx28(
              StatusBadge,
              {
                status: data.status,
                label: asText5(data.status_label) || null
              }
            )
          ),
          barisInfo(
            "Status pembayaran",
            /* @__PURE__ */ jsx28(
              StatusBadge,
              {
                status: data.payment_status,
                label: asText5(data.payment_label) || null
              }
            )
          ),
          barisInfo("Metode pembayaran", asText5(data.payment_method).toUpperCase() || "-"),
          barisInfo("Dibuat", formatDateTime(data.created_at)),
          barisInfo("Dibayar", formatDateTime(data.paid_at))
        ] }) }),
        /* @__PURE__ */ jsx28(KartuBagian, { title: "Data pembeli", className: "lg:col-span-1", children: /* @__PURE__ */ jsxs24("dl", { className: "flex flex-col", children: [
          barisInfo("Nama", asText5(customer.name) || "-"),
          barisInfo("Telepon", asText5(customer.phone) || "-"),
          barisInfo("Email", asText5(customer.email) || "-")
        ] }) }),
        /* @__PURE__ */ jsx28(KartuBagian, { title: "Pengiriman", className: "lg:col-span-1", children: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs24("dl", { className: "flex flex-col", children: [
            barisInfo("Nama penerima", asText5(customer.name) || "-"),
            barisInfo("Telepon", asText5(customer.phone) || "-"),
            barisInfo(
              "Alamat",
              /* @__PURE__ */ jsx28("span", { className: "whitespace-pre-line", children: asText5(customer.address) || "-" })
            ),
            barisInfo("Kota", asText5(customer.city) || "-"),
            barisInfo("Kode pos", asText5(customer.postal_code) || "-")
          ] }),
          /* @__PURE__ */ jsx28(InfoResi, { pesanan: data })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs24(KartuBagian, { title: "Item pesanan", description: `${jumlah(items.length)} baris item pada pesanan ini.`, children: [
        /* @__PURE__ */ jsx28(
          DataTable,
          {
            columns: kolomItem,
            rows: items,
            rowKey: (baris2, index) => baris2?.id ?? index,
            emptyTitle: "Pesanan ini belum punya item",
            emptyDescription: "Hubungi backend bila pesanan seharusnya berisi item.",
            caption: "Item pesanan"
          }
        ),
        /* @__PURE__ */ jsxs24("dl", { className: "flex flex-col gap-2 border-t border-line pt-4 sm:ml-auto sm:w-72", children: [
          barisTotal("Subtotal", uang2(data.subtotal), "subtotal"),
          barisTotal("Ongkos kirim", uang2(data.shipping_cost), "ongkir"),
          barisTotal("Diskon", uang2(data.discount), "diskon"),
          barisTotal("Total", uang2(data.total), "total", true)
        ] })
      ] }),
      /* @__PURE__ */ jsxs24("div", { className: "grid gap-6 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsx28(
          KartuBagian,
          {
            title: "Bukti pembayaran",
            description: "Pratinjau readonly \u2014 kode QR dan ID transaksi dikirim penyedia pembayaran.",
            children: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-4", children: [
              /* @__PURE__ */ jsx28(BuktiPembayaran, { payment: data.payment ?? null, paymentLabel: data.payment_label ?? null }),
              data.payment !== null && data.payment !== void 0 && /* @__PURE__ */ jsx28(SyncPaymentButton, { pesananId: data.id, onHasilSinkron: setFlashSinkron })
            ] })
          }
        ),
        /* @__PURE__ */ jsx28(KartuBagian, { title: "Catatan pembeli", children: asText5(data.notes) === "" ? /* @__PURE__ */ jsx28("p", { className: "text-body text-slate-600", children: "Tidak ada catatan dari pembeli." }) : /* @__PURE__ */ jsx28("p", { className: "whitespace-pre-line text-body text-ink", children: asText5(data.notes) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx28(
      UbahStatusModal,
      {
        open: modalTerbuka,
        pesanan: data,
        statusBerikut: berikut,
        onClose: () => setModalTerbuka(false)
      }
    ),
    toast && /* @__PURE__ */ jsx28("div", { className: "pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]", children: /* @__PURE__ */ jsx28(
      Toast,
      {
        tone: toast.tone,
        title: toast.title,
        message: toast.message,
        onClose: () => setToast(null)
      }
    ) })
  ] });
}

// tmp/uji-ssr-pesanan-t_018b2723.mjs
var AKAR = process.cwd();
var hasil = [];
var uji = (nama, fn) => {
  try {
    fn();
    hasil.push({ status: "OK", nama });
  } catch (galat) {
    hasil.push({ status: "GAGAL", nama, pesan: galat.message });
  }
};
var harus = (kondisi, pesan) => {
  if (!kondisi) throw new Error(pesan);
};
var teks = (markup) => String(markup ?? "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/\s+/g, " ").trim();
var render = (Komponen, props, opsi = {}) => {
  bersihkan();
  if (opsi.errors) {
    kendali.berikutnya.errors = { ...opsi.errors };
    kendali.formulir.length = 0;
  }
  return renderToStaticMarkup(React29.createElement(Komponen, props));
};
var kotor = (s) => ["undefined", "NaN", "[object Object]", "lorem ipsum", "[Grafik Placeholder]", "TODO:", "FIXME"].filter(
  (p) => s.includes(p)
);
var barisPesanan = (ubah = {}) => ({
  id: 5,
  code: "ORD-0005",
  status: "dibayar",
  status_label: "Dibayar",
  payment_status: "settlement",
  payment_label: "Lunas",
  total: 149e3,
  items_count: 2,
  created_at: "2026-10-20T09:15:00+07:00",
  customer_name: "Sari Pembeli",
  customer_phone: "081200000001",
  customer_email: "sari@example.test",
  url: "/admin/pesanan/5",
  ...ubah
});
var paginator = (data, meta = {}) => ({
  data,
  links: [],
  meta: { current_page: 1, last_page: 3, per_page: 15, total: 36, ...meta }
});
var propsIndex = (ubah = {}) => ({
  pesanan: paginator([
    barisPesanan({ id: 5, code: "ORD-0005", status: "dibayar", status_label: "Dibayar" }),
    barisPesanan({ id: 6, code: "ORD-0006", status: "dikirim", status_label: "Dikirim", payment_label: null }),
    barisPesanan({ id: 7, code: "ORD-0007", status: "batal", status_label: "Batal", customer_name: null })
  ]),
  filter: { q: null, status: "semua", bayar: null, dari: null, sampai: null },
  ringkasan: { total: 36, pending: 4, dibayar: 12, diproses: 9, dikirim: 6, selesai: 4, batal: 1 },
  ...ubah
});
var detailPesanan = (ubah = {}) => ({
  id: 5,
  code: "ORD-0005",
  status: "dikirim",
  status_label: "Dikirim",
  payment_status: "settlement",
  payment_label: "Lunas",
  payment_method: "qris",
  subtotal: 278e3,
  shipping_cost: 2e4,
  discount: 0,
  total: 298e3,
  notes: "Ganti warna bila bisa",
  created_at: "2026-10-20T09:15:00+07:00",
  paid_at: "2026-10-20T09:20:00+07:00",
  customer: {
    name: "Sari Pembeli",
    phone: "081200000001",
    email: "sari@example.test",
    address: "Jl. Melati 12, RT 3 / RW 4",
    city: "Bandung",
    postal_code: "40123"
  },
  items: [
    {
      id: 11,
      product_name: "Daster Batik Kulot",
      variant_label: "L / Hitam",
      qty: 2,
      unit_price: 139e3,
      line_total: 278e3
    }
  ],
  payment: {
    provider: "midtrans",
    transaction_id: "TRX-9f2b31",
    status: "settlement",
    gross_amount: 298e3,
    qr_string: "00020101021226610014ID.CO.QRIS.WWW",
    expires_at: "2026-10-20T09:45:00+07:00",
    paid_at: "2026-10-20T09:20:00+07:00"
  },
  ...ubah
});
var propsShow = (ubah = {}) => ({
  pesanan: detailPesanan(),
  status_berikut: [
    { value: "selesai", label: "Selesai" },
    { value: "batal", label: "Batal" }
  ],
  ...ubah
});
var baca = (relatif) => fs.readFileSync(path.join(AKAR, relatif), "utf8");
var berkasHalaman = [
  "resources/js/Pages/Admin/Orders/Index.jsx",
  "resources/js/Pages/Admin/Orders/Show.jsx",
  "resources/js/Pages/Admin/Orders/partials/KartuBagian.jsx",
  "resources/js/Pages/Admin/Orders/partials/BuktiPembayaran.jsx",
  "resources/js/Pages/Admin/Orders/partials/InfoResi.jsx",
  "resources/js/Pages/Admin/Orders/partials/UbahStatusModal.jsx"
];
uji("S1 tidak ada fetch/axios/SPA client di berkas Orders", () => {
  berkasHalaman.forEach((relatif) => {
    const isi = baca(relatif);
    ["fetch(", "axios", "new XMLHttpRequest", "useSWR", "@tanstack"].forEach((pola) => {
      harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
    });
  });
});
uji("S2 tidak ada route()/Ziggy, storage, atau dangerouslySetInnerHTML", () => {
  berkasHalaman.forEach((relatif) => {
    const isi = baca(relatif);
    ["route(", "Ziggy", "localStorage", "sessionStorage", "dangerouslySetInnerHTML"].forEach((pola) => {
      harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
    });
  });
});
uji("S3 semua impor relatif ada di disk (kedalaman path benar)", () => {
  berkasHalaman.forEach((relatif) => {
    const isi = baca(relatif);
    const dir = path.dirname(relatif);
    const cocok = isi.match(/from '(\.[^']+)'/g) || [];
    harus(cocok.length >= 1, `${relatif} tanpa impor relatif`);
    cocok.forEach((baris2) => {
      const impor = baris2.replace(/from '|'/g, "");
      const pilihan = ["", ".jsx", ".js", "/index.jsx"].map((ekor) => path.join(AKAR, dir, impor + ekor));
      harus(pilihan.some((p) => fs.existsSync(p)), `${relatif} impor ${impor} tidak ditemukan`);
    });
  });
});
uji("S4 props halaman \u2286 props yang dikirim OrderController (kontrak \xA712.16/\xA712.17)", () => {
  const php = baca("app/Http/Controllers/Admin/OrderController.php");
  const ambil = (halaman) => {
    const awal = php.indexOf(`Inertia::render('Admin/Orders/${halaman}', [`);
    harus(awal !== -1, `render Admin/Orders/${halaman} tidak ditemukan di controller`);
    const potong = php.slice(awal, php.indexOf("]);", awal));
    return Array.from(potong.matchAll(/^ {12}'([a-z_]+)' =>/gm)).map((m) => m[1]);
  };
  const server = { Index: ambil("Index"), Show: ambil("Show") };
  const dipakai = (relatif) => {
    const tanda = baca(relatif).match(/export default function [A-Za-z]+\(\{([^}]*)\}/);
    harus(Boolean(tanda), `${relatif} tanpa signature props`);
    return tanda[1].split(",").map((bagian) => bagian.split("=")[0].trim()).filter((nama) => nama !== "");
  };
  const peta = {
    Index: { berkas: berkasHalaman[0], props: dipakai(berkasHalaman[0]) },
    Show: { berkas: berkasHalaman[1], props: dipakai(berkasHalaman[1]) }
  };
  Object.entries(peta).forEach(([halaman, isi]) => {
    harus(isi.props.length > 0, `${halaman} tanpa props`);
    isi.props.forEach((nama) => {
      harus(
        server[halaman].includes(nama) || nama === "errors" || nama === "flash",
        `props "${nama}" di ${halaman} tidak dikirim server (server: ${server[halaman].join(", ")})`
      );
    });
  });
});
uji("S5 URL literal halaman cocok dengan rute admin.php", () => {
  const rute = baca("routes/admin.php");
  ["'/pesanan'", "'/pesanan/{order}'", "'/pesanan/{order}/status'"].forEach((pola) => {
    harus(rute.includes(pola), `rute ${pola} tidak ada di admin.php`);
  });
  harus(
    rute.includes("->name('orders.index')") && rute.includes("->name('orders.status')"),
    "nama rute admin.orders.* tidak ada di admin.php"
  );
  harus(baca(berkasHalaman[0]).includes("router.get('/admin/pesanan'"), "Index tidak memakai router.get('/admin/pesanan')");
  harus(
    baca(berkasHalaman[5]).includes("form.patch(`/admin/pesanan/${id}/status`"),
    "modal tidak memakai PATCH /admin/pesanan/{id}/status"
  );
});
uji("S6 tidak ada placeholder; isian resi memakai rute simpan yang ada (F5b t_d1028202)", () => {
  berkasHalaman.forEach((relatif) => {
    const isi = baca(relatif);
    ["[Grafik Placeholder]", "lorem ipsum", "Lorem Ipsum", "FIXME", "XXX-"].forEach((pola) => {
      harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
    });
  });
  const resi = baca(berkasHalaman[4]);
  harus(!resi.includes("InlineNotice"), "InfoResi masih memuat notice temuan lama");
  harus(resi.includes("<Input"), "InfoResi harus memakai Input standar");
  harus(resi.includes("tracking_number"), "field resi harus bernama tracking_number (kontrak \xA712.17)");
  harus(
    baca(berkasHalaman[1]).includes("<InfoResi pesanan={data} />"),
    "Show tidak mengirim props pesanan ke InfoResi"
  );
});
uji("S7 state galat Index punya pesan konkret + tombol Coba lagi", () => {
  const isi = baca(berkasHalaman[0]);
  harus(isi.includes("Gagal memuat daftar pesanan"), "judul galat hilang");
  harus(isi.includes("Coba lagi"), "aksi Coba lagi hilang");
  harus(isi.includes("onError: () => setGalat(") || isi.includes("setGalat("), "galat tidak diisi dari kegagalan router");
});
uji("I1 daftar terisi: kode, pembeli, status, ringkasan, hitung, pager", () => {
  const markup = render(Index, propsIndex());
  const t = teks(markup);
  ["ORD-0005", "ORD-0006", "Sari Pembeli", "081200000001", "Dibayar", "Dikirim", "Batal", "Lunas"].forEach(
    (p) => harus(t.includes(p), `hilang: ${p}`)
  );
  harus(t.includes("Menampilkan 3 dari 36 pesanan."), `teks hitung tidak sesuai: ${t.slice(0, 400)}`);
  harus(t.includes("1 / 3"), "penanda halaman (current / last) tidak sesuai");
  harus(markup.includes('aria-label="Halaman 3"'), "kontrol paginasi halaman terakhir hilang");
  ["Total pesanan", "Pending", "Diproses", "Selesai"].forEach((p) => harus(t.includes(p), `kartu ringkasan ${p} hilang`));
  harus(t.includes("Rp149.000"), "total rupiah tidak terformat");
  harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(", ")}`);
});
uji("I2 kosong tanpa filter: ajakan, bukan galat", () => {
  const t = teks(render(Index, propsIndex({ pesanan: paginator([], { total: 0, last_page: 1 }) })));
  harus(t.includes("Belum ada pesanan"), "judul kosong hilang");
  harus(t.includes("Menampilkan 0 dari 0 pesanan."), "hitung kosong tidak sesuai");
  harus(!t.includes("Gagal memuat"), "kosong tidak boleh tampil sebagai galat");
});
uji('I3 kosong karena filter: pesan "tidak cocok" + aksi tampilkan semua', () => {
  const markup = render(
    Index,
    propsIndex({
      pesanan: paginator([], { total: 0, last_page: 1 }),
      filter: { q: "sari", status: "dikirim", bayar: "settlement", dari: null, sampai: null }
    })
  );
  const t = teks(markup);
  harus(t.includes("Tidak ada pesanan yang cocok"), "judul kosong-terfilter hilang");
  harus(t.includes("Reset filter"), "aksi reset filter hilang");
  harus(!t.includes("Belum ada pesanan"), "kosong terfilter tidak boleh memakai pesan kosong awal");
  harus(!t.includes("Gagal memuat"), "kosong terfilter tidak boleh tampil sebagai galat");
});
uji("I4 props hilang/null: halaman tetap render aman", () => {
  const t = teks(render(Index, {}));
  harus(t.includes("Belum ada pesanan"), "tanpa props harus tampil state kosong");
  harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(", ")}`);
});
uji('I5 angka string & nilai null: "-" bukan NaN/undefined', () => {
  const markup = render(
    Index,
    propsIndex({
      pesanan: paginator(
        [barisPesanan({ total: "149000", customer_name: null, customer_phone: null, created_at: null, payment_label: null })],
        { current_page: "1", last_page: "3", total: "36" }
      )
    })
  );
  const t = teks(markup);
  harus(t.includes("Menampilkan 1 dari 36 pesanan."), "string meta gagal diformat");
  harus(t.includes("Rp149.000"), "string total gagal diformat");
  harus(t.includes("Tanpa nama") || t.includes("-"), "nilai null tanpa fallback");
  harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(", ")}`);
});
uji("I6 filter terpilih mengikuti props (q, status, bayar, tanggal)", () => {
  const markup = render(
    Index,
    propsIndex({
      filter: { q: "batik", status: "dikirim", bayar: "settlement", dari: "2026-10-01", sampai: "2026-10-31" }
    })
  );
  harus(markup.includes('value="batik"'), "kata kunci tidak terisi");
  harus(/<option[^>]*value="dikirim"[^>]*selected/.test(markup), "opsi status dikirim tidak terpilih");
  harus(/<option[^>]*value="settlement"[^>]*selected/.test(markup), "opsi status bayar tidak terpilih");
  harus(markup.includes('value="2026-10-01"') && markup.includes('value="2026-10-31"'), "tanggal tidak terisi");
});
uji('I7 ringkasan hilang: kartu "-" (bukan 0 karangan); meta hilang: "-"', () => {
  const t = teks(render(Index, propsIndex({ ringkasan: null })));
  harus(t.includes("Total pesanan -"), `ringkasan null tidak memakai "-": ${t.slice(0, 300)}`);
  harus(t.includes("Menampilkan 3 dari 36 pesanan."), "hitung harus tetap dari meta pesanan");
  const tanpaMeta = teks(
    render(Index, propsIndex({ pesanan: { data: [barisPesanan()], links: [], meta: null } }))
  );
  harus(tanpaMeta.includes("Menampilkan 1 dari - pesanan."), `meta hilang tidak memakai "-": ${tanpaMeta.slice(0, 300)}`);
  harus(kotor(tanpaMeta).length === 0, `teks kotor: ${kotor(tanpaMeta).join(", ")}`);
});
uji("I8 penanganan flash server ada (toast, bukan efek SSR)", () => {
  [berkasHalaman[0], berkasHalaman[1]].forEach((relatif) => {
    const isi = baca(relatif);
    harus(isi.includes("flash?.success") && isi.includes("flash?.error"), `${relatif} tidak menangani flash`);
    harus(isi.includes("<Toast"), `${relatif} tidak menampilkan toast`);
  });
});
uji("H1 detail terisi: pembeli, alamat, item, total, status", () => {
  const t = teks(render(Show, propsShow()));
  ["ORD-0005", "Sari Pembeli", "Jl. Melati 12", "Bandung", "40123", "Daster Batik Kulot", "L / Hitam"].forEach(
    (p) => harus(t.includes(p), `hilang: ${p}`)
  );
  harus(t.includes("Rp278.000") && t.includes("Rp20.000") && t.includes("Rp298.000"), "rincian biaya tidak lengkap");
  harus(t.includes("Status pesanan") && t.includes("Status pembayaran"), "label status hilang");
  harus(t.includes("Ganti warna bila bisa"), "catatan pembeli hilang");
  harus(t.includes("Ubah status"), "aksi ubah status hilang");
  harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(", ")}`);
});
uji("H2 status final: tombol nonaktif + penjelasan, tanpa modal terbuka", () => {
  const markup = render(Show, propsShow({ status_berikut: [] }));
  const t = teks(markup);
  harus(t.includes("Status sudah final"), "penjelasan status final hilang");
  const rapat = markup.replace(/\n/g, " ");
  harus(/disabled=""[^>]*>[\s\S]{0,240}?Ubah status/.test(rapat), "tombol Ubah status tidak dinonaktifkan");
  harus(!markup.includes('aria-modal="true"'), "modal tidak boleh terbuka saat render awal");
});
uji("H3 status tidak final: tombol aktif, modal tetap tertutup", () => {
  const markup = render(Show, propsShow());
  harus(!markup.includes('aria-modal="true"'), "modal tidak boleh terbuka saat render awal");
  harus(!teks(markup).includes("Status sudah final"), "penjelasan final tidak boleh tampil saat ada status lanjutan");
});
uji("H4 bukti pembayaran: ada -> detail, null -> pesan jelas (bukan galat)", () => {
  const ada = teks(render(Show, propsShow()));
  harus(ada.includes("Bukti pembayaran"), "judul kartu bukti hilang");
  harus(ada.includes("TRX-9f2b31"), "ID transaksi hilang");
  const kosong = render(Show, propsShow({ pesanan: detailPesanan({ payment: null }) }));
  harus(teks(kosong).includes("Belum ada data pembayaran"), "state tanpa pembayaran tidak jelas");
  harus(!teks(kosong).includes("Gagal"), "pembayaran kosong tidak boleh tampil sebagai galat");
});
uji("H5 items kosong & catatan kosong punya pesan sendiri", () => {
  const t = teks(render(Show, propsShow({ pesanan: detailPesanan({ items: [], notes: null }) })));
  harus(t.includes("Pesanan ini belum punya item"), "pesan item kosong hilang");
  harus(t.includes("Tidak ada catatan dari pembeli."), "pesan catatan kosong hilang");
});
uji("H6 props hilang/null: halaman tetap render aman", () => {
  const t = teks(render(Show, {}));
  harus(t.includes("Detail pesanan"), "tanpa props harus tetap punya judul");
  harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(", ")}`);
  const tKosong = teks(render(Show, { pesanan: { items: null, customer: null }, status_berikut: null }));
  harus(kotor(tKosong).length === 0, `teks kotor (objek parsial): ${kotor(tKosong).join(", ")}`);
});
uji("H7 isian resi tampil dengan nilai dari props server (F5b t_d1028202)", () => {
  const markup = render(Show, propsShow());
  const t = teks(markup);
  harus(t.includes("Nomor resi"), "label resi hilang");
  harus(/<input[^>]*id="resi-pesanan"/i.test(markup), "isian resi tidak tampil");
  harus(t.includes("Simpan resi"), "tombol simpan resi hilang");
  harus(!t.includes("Nomor resi belum bisa diisi"), "notice temuan lama masih tampil");
});
uji("H8 flash sukses ditangani halaman detail (toast, bukan efek SSR)", () => {
  const isi = baca(berkasHalaman[1]);
  harus(isi.includes("flash?.success"), "Show tidak membaca flash.success");
  harus(isi.includes("setToast"), "Show tidak menyiapkan toast untuk flash");
});
uji("M1 modal terbuka: label server, opsi status, tombol simpan", () => {
  const markup = render(UbahStatusModal, {
    open: true,
    pesanan: detailPesanan(),
    statusBerikut: [
      { value: "selesai", label: "Selesai" },
      { value: "batal", label: "Batal" }
    ],
    onClose: () => {
    }
  });
  const t = teks(markup);
  harus(markup.includes('aria-modal="true"'), "modal tidak memakai aria-modal");
  harus(t.includes("Ubah status"), "judul modal hilang");
  harus(t.includes("Selesai") && t.includes("Batal"), "opsi status lanjutan hilang");
  harus(t.includes("Simpan status"), "tombol simpan hilang");
  harus(/<label[^>]*for="status-pesanan"/.test(markup), "field status tanpa label terhubung");
  harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(", ")}`);
});
uji("M2 galat server per kolom terhubung aria-describedby", () => {
  const markup = render(
    UbahStatusModal,
    { open: true, pesanan: detailPesanan(), statusBerikut: [{ value: "selesai", label: "Selesai" }], onClose: () => {
    } },
    { errors: { status: "Transisi status tidak sah." } }
  );
  const t = teks(markup);
  harus(t.includes("Transisi status tidak sah."), "galat kolom tidak tampil");
  harus(markup.includes('aria-describedby="'), "input tanpa aria-describedby");
});
uji("M3 bukti pembayaran tanpa QR: peringatan, bukan galat mati", () => {
  const t = teks(render(BuktiPembayaran, { payment: { provider: "midtrans", status: "pending", gross_amount: 298e3 } }));
  harus(t.includes("Kode QR belum tersedia"), "state QR kosong tidak jelas");
  harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(", ")}`);
});
console.log("=== UJI SSR + STATIK kartu t_018b2723 (F5 Admin Pesanan) ===");
hasil.forEach((baris2) => console.log(`[${baris2.status}] ${baris2.nama}${baris2.pesan ? ` -> ${baris2.pesan}` : ""}`));
var gagal = hasil.filter((baris2) => baris2.status === "GAGAL");
console.log(`
TOTAL: ${hasil.length} uji, ${gagal.length} gagal`);
process.exit(gagal.length === 0 ? 0 : 1);
