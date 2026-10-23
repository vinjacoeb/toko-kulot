// tmp/uji-ssr-stok-t_321bf03c.mjs
import fs from "node:fs";
import path from "node:path";
import React25 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// resources/js/Pages/Admin/Stocks/Index.jsx
import React23, { useEffect as useEffect7, useState as useState5 } from "react";

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
var formatNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("id-ID") : "0";
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

// resources/js/Components/DataTable.jsx
import React9 from "react";

// resources/js/Components/EmptyState.jsx
import React6 from "react";

// resources/js/Components/Button.jsx
import React5 from "react";
import { Fragment, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
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
  const content = loading ? /* @__PURE__ */ jsxs5(Fragment, { children: [
    /* @__PURE__ */ jsx5(SpinnerIcon, { size: 16 }),
    /* @__PURE__ */ jsx5("span", { children: "Memproses\u2026" })
  ] }) : /* @__PURE__ */ jsxs5(Fragment, { children: [
    icon,
    /* @__PURE__ */ jsx5("span", { children })
  ] });
  if (as === "a") {
    return /* @__PURE__ */ jsx5("a", { href, className: classes, ...rest, children: content });
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ jsx5(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest, children: content });
  }
  return /* @__PURE__ */ jsx5(
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

// resources/js/Components/EmptyState.jsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function EmptyState({
  title = "Belum ada data",
  description = null,
  actionLabel = null,
  actionHref = null,
  onAction = null,
  icon = null,
  className = ""
}) {
  return /* @__PURE__ */ jsxs6("div", { className: cn("flex flex-col items-center gap-3 py-12 text-center", className), children: [
    /* @__PURE__ */ jsx6("span", { className: "text-slate-300", "aria-hidden": "true", children: icon ?? /* @__PURE__ */ jsx6(ImageOffIcon, { size: 96 }) }),
    /* @__PURE__ */ jsx6("p", { className: "text-h3 text-ink", children: title }),
    description && /* @__PURE__ */ jsx6("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
    actionLabel && onAction && /* @__PURE__ */ jsx6(Button, { variant: "secondary", onClick: onAction, className: "mt-2", children: actionLabel }),
    actionLabel && !onAction && actionHref && /* @__PURE__ */ jsx6(Button, { variant: "secondary", href: actionHref, className: "mt-2", children: actionLabel })
  ] });
}

// resources/js/Components/ErrorState.jsx
import React7 from "react";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function ErrorState({
  title = "Gagal memuat data",
  description = "Periksa koneksi Anda lalu coba lagi.",
  onRetry = null,
  supportHref = "/kontak-kami",
  retryLabel = "Coba lagi",
  supportLabel = "Hubungi kami",
  className = ""
}) {
  return /* @__PURE__ */ jsxs7(
    "div",
    {
      role: "alert",
      className: cn("flex flex-col items-center gap-3 py-12 text-center", className),
      children: [
        /* @__PURE__ */ jsx7("span", { className: "text-danger", "aria-hidden": "true", children: /* @__PURE__ */ jsx7(AlertIcon, { size: 48 }) }),
        /* @__PURE__ */ jsx7("p", { className: "text-h3 text-ink", children: title }),
        description && /* @__PURE__ */ jsx7("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
        /* @__PURE__ */ jsxs7("div", { className: "mt-2 flex flex-wrap items-center justify-center gap-3", children: [
          onRetry && /* @__PURE__ */ jsx7(Button, { variant: "primary", onClick: onRetry, children: retryLabel }),
          supportHref && /* @__PURE__ */ jsx7(Button, { variant: "secondary", href: supportHref, children: supportLabel })
        ] })
      ]
    }
  );
}

// resources/js/Components/Skeleton.jsx
import React8 from "react";
import { jsx as jsx8 } from "react/jsx-runtime";
var SHAPES = {
  text: "h-3 w-full",
  title: "h-6 w-2/3",
  card: "aspect-square w-full",
  row: "h-tableRow w-full",
  circle: "h-10 w-10 rounded-full"
};
function Skeleton({ variant = "text", count = 1, className = "" }) {
  return Array.from({ length: count }).map((_, index) => /* @__PURE__ */ jsx8(
    "div",
    {
      "aria-hidden": "true",
      className: cn("skeleton", SHAPES[variant] ?? SHAPES.text, className)
    },
    index
  ));
}

// resources/js/Components/DataTable.jsx
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx9("div", { className: cn("overflow-hidden rounded-lg border border-line bg-white", className), children: error ? /* @__PURE__ */ jsx9(
    ErrorState,
    {
      title: "Gagal memuat data",
      description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
      onRetry,
      supportHref: null
    }
  ) : loading ? /* @__PURE__ */ jsxs8("div", { className: "flex flex-col", "aria-busy": "true", children: [
    /* @__PURE__ */ jsx9("div", { className: "h-tableHead w-full border-b border-line bg-surface", "aria-hidden": "true" }),
    Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsx9("div", { className: "flex items-center gap-4 border-b border-line px-4 last:border-b-0", children: /* @__PURE__ */ jsx9(Skeleton, { variant: "row" }) }, index))
  ] }) : !hasRows ? /* @__PURE__ */ jsx9(
    EmptyState,
    {
      title: emptyTitle,
      description: emptyDescription,
      actionLabel: emptyActionLabel,
      actionHref: emptyActionHref
    }
  ) : /* @__PURE__ */ jsx9("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs8("table", { className: "w-full border-collapse text-meta", children: [
    caption && /* @__PURE__ */ jsx9("caption", { className: "sr-only", children: caption }),
    /* @__PURE__ */ jsx9("thead", { children: /* @__PURE__ */ jsx9("tr", { className: "bg-surface", children: columns.map((column) => {
      const isSorted = sort && sort.key === column.key;
      const sortable = Boolean(onSort && column.sortable !== false);
      return /* @__PURE__ */ jsx9(
        "th",
        {
          scope: "col",
          "aria-sort": isSorted ? sortState(column) : void 0,
          className: cn(
            "h-tableHead whitespace-nowrap border-b border-line px-4 text-label uppercase text-slate-600",
            cellAlign(column)
          ),
          children: sortable ? /* @__PURE__ */ jsxs8(
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
                /* @__PURE__ */ jsx9("span", { "aria-hidden": "true", children: isSorted ? sort.dir === "desc" ? "\u2193" : "\u2191" : "\u2195" })
              ]
            }
          ) : column.header
        },
        column.key
      );
    }) }) }),
    /* @__PURE__ */ jsx9("tbody", { children: list.map((row, index) => {
      const clickable = typeof onRowClick === "function";
      return /* @__PURE__ */ jsx9(
        "tr",
        {
          className: cn(
            "h-tableRow border-b border-line last:border-b-0",
            clickable && "cursor-pointer transition-colors duration-hover hover:bg-surface focus-within:bg-surface"
          ),
          onClick: clickable ? () => onRowClick(row, index) : void 0,
          children: columns.map((column) => /* @__PURE__ */ jsx9(
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
import React10 from "react";
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx10(
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
      children: direction === "left" ? /* @__PURE__ */ jsx10("path", { d: "M15 6l-6 6 6 6" }) : /* @__PURE__ */ jsx10("path", { d: "M9 6l6 6-6 6" })
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
  return /* @__PURE__ */ jsxs9("nav", { "aria-label": "Navigasi halaman", className: cn("flex items-center justify-center gap-1", className), children: [
    /* @__PURE__ */ jsx10(
      "button",
      {
        type: "button",
        onClick: () => go(current - 1),
        disabled: current <= 1,
        "aria-label": "Halaman sebelumnya",
        className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"),
        children: /* @__PURE__ */ jsx10(Chevron, { direction: "left" })
      }
    ),
    /* @__PURE__ */ jsxs9("span", { className: "px-2 text-meta text-ink-soft sm:hidden", "aria-live": "polite", children: [
      current,
      " / ",
      last
    ] }),
    /* @__PURE__ */ jsx10("div", { className: "hidden items-center gap-1 sm:flex", children: pages.map((page, index) => {
      const previous = pages[index - 1];
      const gap = previous && page - previous > 1;
      return /* @__PURE__ */ jsxs9(React10.Fragment, { children: [
        gap && /* @__PURE__ */ jsx10("span", { className: "px-1 text-meta text-slate-400", "aria-hidden": "true", children: "..." }),
        /* @__PURE__ */ jsx10(
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
    /* @__PURE__ */ jsx10(
      "button",
      {
        type: "button",
        onClick: () => go(current + 1),
        disabled: current >= last,
        "aria-label": "Halaman berikutnya",
        className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"),
        children: /* @__PURE__ */ jsx10(Chevron, { direction: "right" })
      }
    )
  ] });
}

// resources/js/Components/SearchInput.jsx
import React11, { useEffect as useEffect3, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs10("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx11("span", { className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400", "aria-hidden": "true", children: /* @__PURE__ */ jsx11(SearchIcon, { width: 18, height: 18 }) }),
    /* @__PURE__ */ jsx11(
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
    text.length > 0 && /* @__PURE__ */ jsx11(
      "button",
      {
        type: "button",
        onClick: () => setText(""),
        "aria-label": "Bersihkan pencarian",
        className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-slate-400 transition-colors duration-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        children: /* @__PURE__ */ jsx11(CloseIcon, { width: 16, height: 16 })
      }
    )
  ] });
}

// resources/js/Components/Select.jsx
import React12 from "react";
import { jsx as jsx12, jsxs as jsxs11 } from "react/jsx-runtime";
var BASE = "w-full h-field appearance-none rounded-md border border-line bg-white pl-3.5 pr-10 text-body text-ink transition-colors duration-hover focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Select({ error = null, className = "", id = null, children, ...rest }) {
  return /* @__PURE__ */ jsxs11("span", { className: "relative block", children: [
    /* @__PURE__ */ jsx12(
      "select",
      {
        id,
        "aria-invalid": error ? "true" : void 0,
        "aria-describedby": error && id ? id + "-error" : void 0,
        className: cn(BASE, error ? "border-danger" : null, className),
        ...rest,
        children
      }
    ),
    /* @__PURE__ */ jsx12(
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
        children: /* @__PURE__ */ jsx12("path", { d: "M6 9l6 6 6-6" })
      }
    )
  ] });
}

// resources/js/Components/Field.jsx
import React13 from "react";
import { jsx as jsx13, jsxs as jsxs12 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs12("div", { className: cn("flex flex-col", className), children: [
    label && /* @__PURE__ */ jsxs12("label", { htmlFor, className: "mb-1.5 block text-meta font-semibold text-ink", children: [
      label,
      required && /* @__PURE__ */ jsx13("span", { className: "text-danger", "aria-hidden": "true", children: " *" })
    ] }),
    children,
    hint && !error && /* @__PURE__ */ jsx13("p", { id: hintId, className: "mt-1.5 text-meta text-slate-500", children: hint }),
    error && /* @__PURE__ */ jsx13("p", { id: errorId, className: "mt-1.5 text-meta text-danger-strong", role: "alert", children: error })
  ] });
}

// resources/js/Components/Modal.jsx
import React14, { useEffect as useEffect4, useRef as useRef4 } from "react";
import { jsx as jsx14, jsxs as jsxs13 } from "react/jsx-runtime";
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
  useEffect4(() => {
    if (!open) return void 0;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsx14(
    "div",
    {
      className: "fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose?.();
      },
      children: /* @__PURE__ */ jsxs13(
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
            /* @__PURE__ */ jsxs13("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs13("div", { className: "min-w-0", children: [
                title && /* @__PURE__ */ jsx14("h2", { id: "modal-title", className: "text-h3 text-ink", children: title }),
                description && /* @__PURE__ */ jsx14("p", { className: "mt-1 text-meta text-ink-soft", children: description })
              ] }),
              onClose && /* @__PURE__ */ jsx14(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  "aria-label": closeLabel,
                  className: "-mr-2 -mt-1 inline-flex h-touch w-touch items-center justify-center rounded-md text-ink-soft transition-colors duration-hover hover:bg-surface",
                  children: /* @__PURE__ */ jsx14(CloseIcon, { size: 20 })
                }
              )
            ] }),
            children && /* @__PURE__ */ jsx14("div", { className: "mt-4 text-body text-ink", children }),
            footer && /* @__PURE__ */ jsx14("div", { className: "mt-6 flex flex-wrap justify-end gap-3", children: footer })
          ]
        }
      )
    }
  );
}

// resources/js/Components/Toast.jsx
import React15, { useEffect as useEffect5 } from "react";
import { jsx as jsx15, jsxs as jsxs14 } from "react/jsx-runtime";
var TONES = {
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
  const config = TONES[tone] ?? TONES.info;
  const Icon = config.icon;
  useEffect5(() => {
    if (!duration || !onClose) return void 0;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [duration, onClose]);
  return /* @__PURE__ */ jsxs14(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn(
        "pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-md border border-line border-l-[3px] bg-white p-4 shadow-raised animate-fade-up",
        config.bar
      ),
      children: [
        /* @__PURE__ */ jsx15("span", { className: cn("mt-0.5 shrink-0", config.color), "aria-hidden": "true", children: /* @__PURE__ */ jsx15(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs14("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx15("p", { className: "text-label text-ink", children: title }),
          message && /* @__PURE__ */ jsx15("p", { className: "text-meta text-ink-soft", children: message })
        ] }),
        onClose && /* @__PURE__ */ jsx15(
          "button",
          {
            type: "button",
            onClick: onClose,
            "aria-label": "Tutup notifikasi",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-surface",
            children: /* @__PURE__ */ jsx15(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}

// resources/js/Components/InlineNotice.jsx
import React16 from "react";
import { jsx as jsx16, jsxs as jsxs15 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs15(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn("flex items-start gap-3 rounded-md p-4", TONES2[tone] ?? TONES2.info, className),
      children: [
        /* @__PURE__ */ jsx16("span", { className: cn("mt-0.5 shrink-0", ICON_TONES[tone] ?? ICON_TONES.info), "aria-hidden": "true", children: /* @__PURE__ */ jsx16(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs15("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx16("p", { className: "text-label", children: title }),
          children && /* @__PURE__ */ jsx16("div", { className: "text-meta text-ink-soft", children })
        ] }),
        onDismiss && /* @__PURE__ */ jsx16(
          "button",
          {
            type: "button",
            onClick: onDismiss,
            "aria-label": "Tutup pesan",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60",
            children: /* @__PURE__ */ jsx16(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}

// resources/js/Components/Badge.jsx
import React17 from "react";
import { jsx as jsx17 } from "react/jsx-runtime";
var CLASSES = {
  brand: "bg-brand/10 text-brand",
  accent: "bg-accent-500 text-ink",
  sale: "bg-sale-500 text-white",
  success: "bg-success/10 text-success-strong",
  warning: "bg-warning/10 text-warning-strong",
  danger: "bg-danger/10 text-danger-strong"
};
function Badge({ tone = "brand", children, className = "" }) {
  return /* @__PURE__ */ jsx17(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase",
        CLASSES[tone] ?? CLASSES.brand,
        className
      ),
      children
    }
  );
}

// resources/js/Components/StatusBadge.jsx
import React18 from "react";
import { jsx as jsx18 } from "react/jsx-runtime";
var TONES3 = {
  pending: { token: "warning", label: "Menunggu" },
  dibayar: { token: "brand", label: "Dibayar" },
  diproses: { token: "brand", label: "Diproses" },
  dikirim: { token: "brand", label: "Dikirim" },
  selesai: { token: "success", label: "Selesai" },
  batal: { token: "danger", label: "Batal" }
};
var CLASSES2 = {
  brand: "bg-brand/10 text-brand",
  warning: "bg-warning/10 text-warning-strong",
  success: "bg-success/10 text-success-strong",
  danger: "bg-danger/10 text-danger-strong",
  neutral: "bg-slate-200/60 text-slate-600"
};
function StatusBadge({ status = null, label = null, className = "" }) {
  const key = typeof status === "string" ? status.trim().toLowerCase() : "";
  const tone = TONES3[key] ?? null;
  const text = label ?? tone?.label ?? (key === "" ? "-" : status);
  return /* @__PURE__ */ jsx18(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase",
        CLASSES2[tone?.token ?? "neutral"],
        className
      ),
      children: text
    }
  );
}

// resources/js/Components/KpiCard.jsx
import React19 from "react";
import { Fragment as Fragment2, jsx as jsx19, jsxs as jsxs16 } from "react/jsx-runtime";
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
  const body = /* @__PURE__ */ jsxs16(Fragment2, { children: [
    /* @__PURE__ */ jsxs16("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsx19("p", { className: "text-label uppercase text-slate-500", children: label }),
      Icon && /* @__PURE__ */ jsx19(
        "span",
        {
          className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand",
          "aria-hidden": "true",
          children: /* @__PURE__ */ jsx19(Icon, { size: 18 })
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxs16("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx19(Skeleton, { variant: "title", className: "h-7 w-3/5" }),
      /* @__PURE__ */ jsx19(Skeleton, { variant: "text", className: "h-3 w-2/5" })
    ] }) : /* @__PURE__ */ jsxs16("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx19("p", { className: "text-[28px] font-bold leading-none text-ink", children: shownValue }),
      (hasDelta || deltaLabel) && /* @__PURE__ */ jsxs16(
        "p",
        {
          className: cn(
            "flex items-center gap-1 text-meta",
            hasDelta && numericDelta > 0 && "text-success-strong",
            hasDelta && numericDelta < 0 && "text-danger-strong",
            (!hasDelta || numericDelta === 0) && "text-ink-soft"
          ),
          children: [
            hasDelta && numericDelta !== 0 && /* @__PURE__ */ jsx19(DeltaIcon, { size: 14 }),
            hasDelta && numericDelta !== 0 && /* @__PURE__ */ jsxs16("span", { children: [
              numericDelta > 0 ? "+" : "",
              numericDelta,
              "%"
            ] }),
            deltaLabel && /* @__PURE__ */ jsx19("span", { className: "text-slate-500", children: deltaLabel })
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
    return /* @__PURE__ */ jsx19("div", { className: base, "aria-busy": "true", children: body });
  }
  if (href) {
    return /* @__PURE__ */ jsx19(
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
  return /* @__PURE__ */ jsx19("div", { className: base, children: body });
}

// resources/js/Pages/Admin/Stocks/partials/StokAksiModal.jsx
import React22, { useEffect as useEffect6, useState as useState4 } from "react";

// resources/js/Components/Input.jsx
import React20 from "react";
import { jsx as jsx20 } from "react/jsx-runtime";
var BASE2 = "w-full h-field rounded-md border border-line bg-white px-3.5 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Input({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx20(
    "input",
    {
      id,
      "aria-invalid": error ? "true" : void 0,
      "aria-describedby": error && id ? id + "-error" : void 0,
      className: cn(BASE2, error ? "border-danger" : null, className),
      ...rest
    }
  );
}

// resources/js/Components/Textarea.jsx
import React21 from "react";
import { jsx as jsx21 } from "react/jsx-runtime";
var BASE3 = "w-full min-h-[120px] resize-y rounded-md border border-line bg-white px-3.5 py-3 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Textarea({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx21(
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

// resources/js/Pages/Admin/Stocks/partials/StokAksiModal.jsx
import { Fragment as Fragment3, jsx as jsx22, jsxs as jsxs17 } from "react/jsx-runtime";
var QTY_MAKS = 1e5;
var asText = (value) => value === null || value === void 0 ? "" : String(value);
var asAngka = (value) => {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : 0;
};
function StokAksiModal({ open = false, mode = "in", baris = null, onClose = null }) {
  const keluar = mode === "out";
  const form = useForm({ qty: "", note: "" });
  const [galatLokal, setGalatLokal] = useState4(null);
  useEffect6(() => {
    if (!open) return;
    form.setData({ qty: "", note: "" });
    form.clearErrors();
    setGalatLokal(null);
  }, [open, baris?.id, mode]);
  const idVarian = baris?.id ?? null;
  const namaVarian = `${asText(baris?.product?.name) || "Produk tanpa nama"} \u2014 ${asText(baris?.label) || "varian tanpa label"}`;
  const stokSaatIni = formatNumber(asAngka(baris?.stock));
  const url = keluar ? `/admin/stok/${idVarian}/keluar` : `/admin/stok/${idVarian}/masuk`;
  const galatQty = galatLokal ?? form.errors.qty ?? null;
  const galatNote = form.errors.note ?? null;
  const galatLain = Object.entries(form.errors ?? {}).filter(
    ([kunci, pesan]) => !["qty", "note"].includes(kunci) && Boolean(pesan)
  );
  const kirim = (event) => {
    if (event) event.preventDefault();
    if (form.processing || idVarian === null) return;
    const mentah = asText(form.data.qty).trim();
    const jumlah = Number(mentah);
    if (mentah === "") {
      setGalatLokal("Jumlah wajib diisi.");
      return;
    }
    if (!Number.isInteger(jumlah) || jumlah < 1) {
      setGalatLokal("Jumlah minimal 1.");
      return;
    }
    if (jumlah > QTY_MAKS) {
      setGalatLokal(`Jumlah maksimal ${formatNumber(QTY_MAKS)}.`);
      return;
    }
    setGalatLokal(null);
    form.post(url, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => onClose?.()
    });
  };
  return /* @__PURE__ */ jsx22(
    Modal,
    {
      open,
      onClose,
      title: keluar ? "Catat stok keluar" : "Catat stok masuk",
      description: baris === null ? "" : `${namaVarian} \xB7 stok tercatat saat ini ${stokSaatIni}`,
      size: "lg",
      footer: /* @__PURE__ */ jsxs17(Fragment3, { children: [
        /* @__PURE__ */ jsx22(Button, { variant: "secondary", onClick: onClose, disabled: form.processing, children: "Batal" }),
        /* @__PURE__ */ jsx22(
          Button,
          {
            variant: "primary",
            type: "submit",
            form: "form-stok-aksi",
            loading: form.processing,
            disabled: baris === null,
            children: keluar ? "Simpan stok keluar" : "Simpan stok masuk"
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxs17("form", { id: "form-stok-aksi", className: "flex flex-col gap-4", onSubmit: kirim, noValidate: true, children: [
        galatLain.length > 0 && /* @__PURE__ */ jsx22(InlineNotice, { tone: "error", title: "Perubahan stok gagal disimpan", children: galatLain.map(([kunci, pesan]) => /* @__PURE__ */ jsx22("p", { children: asText(pesan) }, kunci)) }),
        /* @__PURE__ */ jsx22(
          Field,
          {
            label: "Jumlah",
            htmlFor: "stok-aksi-qty",
            required: true,
            hint: keluar ? `Stok tercatat saat ini ${stokSaatIni}. Server menolak jumlah yang melebihi stok tersedia.` : "Jumlah ditambahkan ke stok varian ini dan tercatat di riwayat.",
            error: galatQty,
            children: /* @__PURE__ */ jsx22(
              Input,
              {
                id: "stok-aksi-qty",
                name: "qty",
                type: "number",
                inputMode: "numeric",
                min: 1,
                max: QTY_MAKS,
                step: 1,
                autoComplete: "off",
                value: form.data.qty,
                error: galatQty,
                onChange: (event) => {
                  setGalatLokal(null);
                  form.clearErrors("qty");
                  form.setData("qty", event.target.value);
                },
                placeholder: "mis. 10"
              }
            )
          }
        ),
        /* @__PURE__ */ jsx22(
          Field,
          {
            label: "Catatan (opsional)",
            htmlFor: "stok-aksi-note",
            hint: "Maksimal 255 karakter. Catatan tampil di riwayat pergerakan.",
            error: galatNote,
            children: /* @__PURE__ */ jsx22(
              Textarea,
              {
                id: "stok-aksi-note",
                name: "note",
                rows: 3,
                maxLength: 255,
                value: form.data.note,
                error: galatNote,
                onChange: (event) => {
                  form.clearErrors("note");
                  form.setData("note", event.target.value);
                },
                placeholder: keluar ? "mis. barang rusak saat pengemasan" : "mis. kiriman dari supplier"
              }
            )
          }
        )
      ] })
    }
  );
}

// resources/js/Pages/Admin/Stocks/Index.jsx
import { Fragment as Fragment4, jsx as jsx23, jsxs as jsxs18 } from "react/jsx-runtime";
var BREADCRUMB = [{ label: "Dashboard", href: "/admin" }, { label: "Stok" }];
var BATAS_KRITIS = 5;
var DASAR = { q: "", status: "semua", kategori: "", urut: "nama" };
var STATUS = [
  { value: "semua", label: "Semua status" },
  { value: "habis", label: "Stok habis" },
  { value: "kritis", label: "Stok di bawah 5" }
];
var URUT = [
  { value: "nama", label: "Nama produk A\u2013Z" },
  { value: "stok_terkecil", label: "Stok terendah" },
  { value: "stok_terbesar", label: "Stok tertinggi" }
];
var BADGE_STATUS = {
  habis: { tone: "danger", label: "Habis" },
  kritis: { tone: "warning", label: "Kritis" },
  aman: { tone: "success", label: "Aman" }
};
var asText2 = (value) => value === null || value === void 0 ? "" : String(value);
var asAngka2 = (value) => {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : 0;
};
var angkaTeks = (value) => value === null || value === void 0 ? "-" : formatNumber(value);
var asBool = (value) => value === true || value === 1 || value === "1";
var keFilter = (sumber) => ({
  q: asText2(sumber?.q ?? ""),
  status: sumber?.status ? asText2(sumber.status) : DASAR.status,
  kategori: sumber?.kategori === null || sumber?.kategori === void 0 ? "" : asText2(sumber.kategori),
  urut: sumber?.urut ? asText2(sumber.urut) : DASAR.urut
});
function Index({
  stok = null,
  filter = null,
  kategori = [],
  ringkasan = null,
  flash = null,
  errors = null
}) {
  const aktif = keFilter(filter);
  const [memuat, setMemuat] = useState5(false);
  const [galat, setGalat] = useState5(null);
  const [toast, setToast] = useState5(null);
  const [galatTutup, setGalatTutup] = useState5(false);
  const [aksi, setAksi] = useState5(null);
  const [setel, setSetel] = useState5(null);
  useEffect7(() => {
    if (flash?.success) {
      setToast({ tone: "success", title: "Berhasil", message: String(flash.success) });
    } else if (flash?.error) {
      setToast({ tone: "error", title: "Gagal", message: String(flash.error) });
    }
  }, [flash?.success, flash?.error]);
  const daftar = Array.isArray(stok?.data) ? stok.data : [];
  const meta = stok?.meta ?? {};
  const halaman = asAngka2(meta.current_page) || 1;
  const halamanAkhir = asAngka2(meta.last_page) || 1;
  const total = meta.total === null || meta.total === void 0 ? "-" : formatNumber(meta.total);
  const daftarKategori = Array.isArray(kategori) ? kategori.filter(Boolean) : [];
  const adaFilter = aktif.q !== DASAR.q || aktif.status !== DASAR.status || aktif.kategori !== DASAR.kategori || aktif.urut !== DASAR.urut;
  const buka = (perubahan, opsi = {}) => {
    const berikut = { ...aktif, ...perubahan };
    const query = {};
    if (berikut.q !== "") query.q = berikut.q;
    if (berikut.kategori !== "") query.kategori = berikut.kategori;
    if (berikut.status !== DASAR.status) query.status = berikut.status;
    if (berikut.urut !== DASAR.urut) query.urut = berikut.urut;
    if (opsi.page && opsi.page > 1) query.page = opsi.page;
    router.get("/admin/stok", query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onStart: () => {
        setMemuat(true);
        setGalat(null);
      },
      onFinish: () => setMemuat(false),
      onError: () => setGalat("Gagal memuat daftar stok. Periksa koneksi lalu coba lagi.")
    });
  };
  const reset = () => buka({ ...DASAR });
  const gantiSort = (key) => {
    if (key === "produk") {
      buka({ urut: "nama" });
      return;
    }
    if (key === "stok") {
      buka({ urut: aktif.urut === "stok_terbesar" ? "stok_terkecil" : "stok_terbesar" });
    }
  };
  const namaBaris = (baris) => `${asText2(baris?.product?.name) || "Produk tanpa nama"} \u2014 ${asText2(baris?.label) || "varian tanpa label"}`;
  const galatServer = galatTutup ? [] : Object.values(errors ?? {}).filter((pesan) => Boolean(pesan));
  const kolom = [
    {
      key: "produk",
      header: "Produk",
      render: (baris) => /* @__PURE__ */ jsxs18("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx23("p", { className: "truncate font-semibold text-ink", children: asText2(baris?.product?.name) || "-" }),
        /* @__PURE__ */ jsx23("p", { className: "truncate text-meta text-slate-500", children: asText2(baris?.product?.slug) || "-" })
      ] })
    },
    {
      key: "varian",
      header: "Varian",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsxs18("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs18("p", { className: "flex flex-wrap items-center gap-2 font-semibold text-ink", children: [
          /* @__PURE__ */ jsx23("span", { className: "truncate", children: asText2(baris?.label) || "-" }),
          asBool(baris?.is_active) ? null : /* @__PURE__ */ jsx23(StatusBadge, { status: "nonaktif", label: "Nonaktif" })
        ] }),
        /* @__PURE__ */ jsx23("p", { className: "truncate text-meta text-slate-500", children: asText2(baris?.sku) || "Tanpa SKU" })
      ] })
    },
    {
      key: "stok",
      header: "Stok",
      align: "right",
      render: (baris) => /* @__PURE__ */ jsx23("span", { className: "font-semibold text-ink", children: angkaTeks(baris?.stock) })
    },
    {
      key: "batas",
      header: "Batas kritis",
      align: "right",
      sortable: false,
      render: () => /* @__PURE__ */ jsx23("span", { className: "whitespace-nowrap text-slate-600", children: `< ${BATAS_KRITIS}` })
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      render: (baris) => {
        const kunci = asText2(baris?.status);
        const lencana = BADGE_STATUS[kunci] ?? null;
        return lencana === null ? /* @__PURE__ */ jsx23(StatusBadge, { status: kunci, label: kunci === "" ? "-" : void 0 }) : /* @__PURE__ */ jsx23(Badge, { tone: lencana.tone, children: lencana.label });
      }
    },
    {
      key: "diperbarui",
      header: "Diperbarui",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx23("span", { className: "whitespace-nowrap", children: asText2(baris?.updated_at) === "" ? "-" : formatDateTime(baris.updated_at) })
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "right",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap items-center justify-end gap-2", children: [
        /* @__PURE__ */ jsx23(
          Button,
          {
            variant: "secondary",
            size: "sm",
            onClick: () => setAksi({ mode: "in", baris }),
            "aria-label": `Catat stok masuk untuk ${namaBaris(baris)}`,
            children: "Masuk"
          }
        ),
        /* @__PURE__ */ jsx23(
          Button,
          {
            variant: "secondary",
            size: "sm",
            onClick: () => setAksi({ mode: "out", baris }),
            "aria-label": `Catat stok keluar untuk ${namaBaris(baris)}`,
            children: "Keluar"
          }
        ),
        /* @__PURE__ */ jsx23(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setSetel(baris),
            "aria-label": `Setel stok ${namaBaris(baris)}`,
            children: "Setel"
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxs18(AdminLayout, { title: "Stok", children: [
    /* @__PURE__ */ jsxs18("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx23(
        PageHeader,
        {
          title: "Stok",
          breadcrumb: BREADCRUMB,
          description: "Pantau stok per varian, catat stok masuk/keluar, dan telusuri riwayat pergerakan.",
          actions: /* @__PURE__ */ jsx23(Button, { variant: "secondary", href: "/admin/stok/riwayat", children: "Riwayat pergerakan" })
        }
      ),
      /* @__PURE__ */ jsxs18("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [
        /* @__PURE__ */ jsx23(
          KpiCard,
          {
            label: "Total varian",
            value: angkaTeks(ringkasan?.varian),
            href: "/admin/stok"
          }
        ),
        /* @__PURE__ */ jsx23(
          KpiCard,
          {
            label: "Stok habis",
            value: angkaTeks(ringkasan?.habis),
            href: "/admin/stok?status=habis"
          }
        ),
        /* @__PURE__ */ jsx23(
          KpiCard,
          {
            label: "Stok kritis",
            value: angkaTeks(ringkasan?.kritis),
            href: "/admin/stok?status=kritis"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs18("p", { className: "text-meta text-slate-600", children: [
        `Status baris: Habis (stok 0), Kritis (stok 1\u2013${BATAS_KRITIS - 1}), Aman (stok ${BATAS_KRITIS} atau lebih). `,
        `Filter "Stok di bawah ${BATAS_KRITIS}" menampilkan stok di bawah ${BATAS_KRITIS}, termasuk yang habis.`
      ] }),
      galatServer.length > 0 && aksi === null && setel === null && /* @__PURE__ */ jsx23(
        InlineNotice,
        {
          tone: "error",
          title: "Perubahan stok gagal disimpan",
          onDismiss: () => setGalatTutup(true),
          children: galatServer.map((pesan, index) => /* @__PURE__ */ jsx23("p", { children: asText2(pesan) }, `galat-${index}`))
        }
      ),
      /* @__PURE__ */ jsxs18("div", { className: "flex flex-col gap-4 rounded-lg border border-line bg-white p-4", children: [
        /* @__PURE__ */ jsx23(
          SearchInput,
          {
            value: aktif.q,
            onChange: (nilai) => buka({ q: nilai }),
            placeholder: "Cari nama produk atau SKU varian",
            label: "Cari stok varian",
            loading: memuat
          }
        ),
        /* @__PURE__ */ jsxs18("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [
          /* @__PURE__ */ jsx23(Field, { label: "Kategori", htmlFor: "filter-kategori", children: /* @__PURE__ */ jsxs18(
            Select,
            {
              id: "filter-kategori",
              value: aktif.kategori,
              disabled: memuat,
              onChange: (event) => buka({ kategori: event.target.value }),
              children: [
                /* @__PURE__ */ jsx23("option", { value: "", children: "Semua kategori" }),
                daftarKategori.map((item) => /* @__PURE__ */ jsx23("option", { value: item.id, children: asText2(item.name) || "-" }, item.id))
              ]
            }
          ) }),
          /* @__PURE__ */ jsx23(Field, { label: "Status", htmlFor: "filter-status", children: /* @__PURE__ */ jsx23(
            Select,
            {
              id: "filter-status",
              value: aktif.status,
              disabled: memuat,
              onChange: (event) => buka({ status: event.target.value }),
              children: STATUS.map((item) => /* @__PURE__ */ jsx23("option", { value: item.value, children: item.label }, item.value))
            }
          ) }),
          /* @__PURE__ */ jsx23(Field, { label: "Urutkan", htmlFor: "filter-urut", children: /* @__PURE__ */ jsx23(
            Select,
            {
              id: "filter-urut",
              value: aktif.urut,
              disabled: memuat,
              onChange: (event) => buka({ urut: event.target.value }),
              children: URUT.map((item) => /* @__PURE__ */ jsx23("option", { value: item.value, children: item.label }, item.value))
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs18("p", { className: "text-meta text-slate-500", children: [
            "Menampilkan ",
            formatNumber(daftar.length),
            " dari ",
            total,
            " varian."
          ] }),
          adaFilter && /* @__PURE__ */ jsx23(Button, { variant: "secondary", size: "sm", onClick: reset, disabled: memuat, children: "Reset filter" })
        ] })
      ] }),
      /* @__PURE__ */ jsx23(
        DataTable,
        {
          columns: kolom,
          rows: daftar,
          loading: memuat,
          error: galat,
          onRetry: () => buka({}),
          emptyTitle: adaFilter ? "Tidak ada varian yang cocok" : "Belum ada varian",
          emptyDescription: adaFilter ? "Ubah kata kunci atau reset filter untuk melihat varian lain." : "Tambahkan produk beserta variannya agar stok bisa dicatat di sini.",
          emptyActionLabel: adaFilter ? null : "Tambah produk",
          emptyActionHref: adaFilter ? null : "/admin/produk/tambah",
          sort: {
            key: aktif.urut === "nama" ? "produk" : "stok",
            dir: aktif.urut === "stok_terbesar" ? "desc" : "asc"
          },
          onSort: gantiSort,
          caption: "Daftar stok per varian"
        }
      ),
      /* @__PURE__ */ jsxs18("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs18("p", { className: "text-meta text-slate-600", children: [
          "Halaman ",
          formatNumber(halaman),
          " dari ",
          formatNumber(halamanAkhir)
        ] }),
        /* @__PURE__ */ jsx23(
          Pagination,
          {
            currentPage: halaman,
            lastPage: halamanAkhir,
            onPageChange: (page) => buka({}, { page })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx23(
      StokAksiModal,
      {
        open: aksi !== null,
        mode: aksi?.mode ?? "in",
        baris: aksi?.baris ?? null,
        onClose: () => setAksi(null)
      }
    ),
    /* @__PURE__ */ jsx23(
      Modal,
      {
        open: setel !== null,
        onClose: () => setSetel(null),
        title: "Setel stok",
        description: setel === null ? "" : namaBaris(setel),
        footer: /* @__PURE__ */ jsxs18(Fragment4, { children: [
          /* @__PURE__ */ jsx23(Button, { variant: "secondary", onClick: () => setSetel(null), children: "Tutup" }),
          /* @__PURE__ */ jsx23(
            Button,
            {
              variant: "primary",
              href: setel?.product?.id ? `/admin/produk/${setel.product.id}/ubah` : "/admin/produk",
              children: "Buka form produk"
            }
          )
        ] }),
        children: /* @__PURE__ */ jsxs18("div", { className: "flex flex-col gap-3 text-body text-ink-soft", children: [
          /* @__PURE__ */ jsx23("p", { children: "Setel stok ke angka tertentu dilakukan dari form produk. Server mencatat selisihnya sebagai pergerakan penyesuaian (kontrak props \xA712.4 dan \xA712.6), jadi riwayat stok tetap lengkap." }),
          /* @__PURE__ */ jsx23("p", { children: "Untuk koreksi cepat tanpa membuka produk, pakai tombol Masuk atau Keluar \u2014 keduanya tercatat atas nama petugas yang sedang masuk." })
        ] })
      }
    ),
    toast && /* @__PURE__ */ jsx23("div", { className: "pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]", children: /* @__PURE__ */ jsx23(
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

// resources/js/Pages/Admin/Stocks/History.jsx
import React24, { useEffect as useEffect8, useState as useState6 } from "react";
import { jsx as jsx24, jsxs as jsxs19 } from "react/jsx-runtime";
var BREADCRUMB2 = [
  { label: "Dashboard", href: "/admin" },
  { label: "Stok", href: "/admin/stok" },
  { label: "Riwayat pergerakan" }
];
var DASAR2 = { q: "", tipe: "semua", varian: "" };
var TIPE = [
  { value: "semua", label: "Semua tipe" },
  { value: "in", label: "Stok masuk" },
  { value: "out", label: "Stok keluar" },
  { value: "adjust", label: "Penyesuaian" },
  { value: "sale", label: "Penjualan" }
];
var TONE_TIPE = {
  in: "success",
  out: "danger",
  adjust: "brand",
  sale: "sale"
};
var asText3 = (value) => value === null || value === void 0 ? "" : String(value);
var asAngka3 = (value) => {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : 0;
};
var angkaTeks2 = (value) => value === null || value === void 0 ? "-" : formatNumber(value);
var keFilter2 = (sumber) => ({
  q: asText3(sumber?.q ?? ""),
  tipe: sumber?.tipe ? asText3(sumber.tipe) : DASAR2.tipe,
  varian: sumber?.varian === null || sumber?.varian === void 0 ? "" : asText3(sumber.varian)
});
function History({ riwayat = null, filter = null, varian = [], ringkasan = null, flash = null }) {
  const aktif = keFilter2(filter);
  const [memuat, setMemuat] = useState6(false);
  const [galat, setGalat] = useState6(null);
  const [toast, setToast] = useState6(null);
  useEffect8(() => {
    if (flash?.success) {
      setToast({ tone: "success", title: "Berhasil", message: String(flash.success) });
    } else if (flash?.error) {
      setToast({ tone: "error", title: "Gagal", message: String(flash.error) });
    }
  }, [flash?.success, flash?.error]);
  const daftar = Array.isArray(riwayat?.data) ? riwayat.data : [];
  const meta = riwayat?.meta ?? {};
  const halaman = asAngka3(meta.current_page) || 1;
  const halamanAkhir = asAngka3(meta.last_page) || 1;
  const total = meta.total === null || meta.total === void 0 ? "-" : formatNumber(meta.total);
  const daftarVarian = Array.isArray(varian) ? varian.filter(Boolean) : [];
  const adaFilter = aktif.q !== DASAR2.q || aktif.tipe !== DASAR2.tipe || aktif.varian !== DASAR2.varian;
  const buka = (perubahan, opsi = {}) => {
    const berikut = { ...aktif, ...perubahan };
    const query = {};
    if (berikut.q !== "") query.q = berikut.q;
    if (berikut.tipe !== DASAR2.tipe) query.tipe = berikut.tipe;
    if (berikut.varian !== "") query.varian = berikut.varian;
    if (opsi.page && opsi.page > 1) query.page = opsi.page;
    router.get("/admin/stok/riwayat", query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onStart: () => {
        setMemuat(true);
        setGalat(null);
      },
      onFinish: () => setMemuat(false),
      onError: () => setGalat("Gagal memuat riwayat stok. Periksa koneksi lalu coba lagi.")
    });
  };
  const reset = () => buka({ ...DASAR2 });
  const jumlahTanda = (baris) => {
    const nilai = asAngka3(baris?.signed_qty);
    return `${nilai > 0 ? "+" : nilai < 0 ? "\u2212" : ""}${formatNumber(Math.abs(nilai))}`;
  };
  const kolom = [
    {
      key: "waktu",
      header: "Waktu",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx24("span", { className: "whitespace-nowrap", children: asText3(baris?.created_at) === "" ? "-" : formatDateTime(baris.created_at) })
    },
    {
      key: "produk",
      header: "Produk",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsxs19("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx24("p", { className: "truncate font-semibold text-ink", children: asText3(baris?.product_name) || "-" }),
        /* @__PURE__ */ jsx24("p", { className: "truncate text-meta text-slate-500", children: asText3(baris?.variant_label) || "Varian tidak ditemukan" })
      ] })
    },
    {
      key: "sku",
      header: "SKU",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx24("span", { className: "whitespace-nowrap", children: asText3(baris?.variant_sku) || "-" })
    },
    {
      key: "tipe",
      header: "Tipe",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx24(Badge, { tone: TONE_TIPE[asText3(baris?.type)] ?? "brand", children: asText3(baris?.tipe_label) || "-" })
    },
    {
      key: "jumlah",
      header: "Jumlah",
      align: "right",
      sortable: false,
      render: (baris) => {
        const nilai = asAngka3(baris?.signed_qty);
        return /* @__PURE__ */ jsx24(
          "span",
          {
            className: nilai > 0 ? "font-semibold text-success-strong" : nilai < 0 ? "font-semibold text-danger-strong" : "font-semibold text-slate-600",
            children: jumlahTanda(baris)
          }
        );
      }
    },
    {
      key: "catatan",
      header: "Catatan",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx24("span", { className: "block max-w-[320px] whitespace-pre-line break-words text-ink", children: asText3(baris?.note) === "" ? "-" : asText3(baris.note) })
    },
    {
      key: "petugas",
      header: "Petugas",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx24("span", { className: "whitespace-nowrap", children: asText3(baris?.admin?.name) || "-" })
    }
  ];
  return /* @__PURE__ */ jsxs19(AdminLayout, { title: "Riwayat stok", children: [
    /* @__PURE__ */ jsxs19("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx24(
        PageHeader,
        {
          title: "Riwayat pergerakan",
          breadcrumb: BREADCRUMB2,
          description: "Semua perubahan stok varian: stok masuk, stok keluar, penyesuaian dari form produk, dan pengurangan dari pesanan.",
          actions: /* @__PURE__ */ jsx24(Button, { variant: "secondary", href: "/admin/stok", children: "Daftar stok" })
        }
      ),
      /* @__PURE__ */ jsxs19("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsx24(KpiCard, { label: "Pergerakan masuk", value: angkaTeks2(ringkasan?.masuk), href: "/admin/stok/riwayat?tipe=in" }),
        /* @__PURE__ */ jsx24(KpiCard, { label: "Pergerakan keluar", value: angkaTeks2(ringkasan?.keluar), href: "/admin/stok/riwayat?tipe=out" }),
        /* @__PURE__ */ jsx24(KpiCard, { label: "Penyesuaian", value: angkaTeks2(ringkasan?.adjust), href: "/admin/stok/riwayat?tipe=adjust" }),
        /* @__PURE__ */ jsx24(KpiCard, { label: "Penjualan", value: angkaTeks2(ringkasan?.sale), href: "/admin/stok/riwayat?tipe=sale" })
      ] }),
      /* @__PURE__ */ jsx24("p", { className: "text-meta text-slate-600", children: "Angka kartu adalah jumlah baris pergerakan per tipe, bukan jumlah unit stok. Kolom Jumlah memakai angka bertanda dari server: masuk positif, keluar dan penjualan negatif, penyesuaian mengikuti selisih." }),
      /* @__PURE__ */ jsxs19("div", { className: "flex flex-col gap-4 rounded-lg border border-line bg-white p-4", children: [
        /* @__PURE__ */ jsx24(
          SearchInput,
          {
            value: aktif.q,
            onChange: (nilai) => buka({ q: nilai }),
            placeholder: "Cari nama produk, SKU, atau catatan",
            label: "Cari riwayat pergerakan stok",
            loading: memuat
          }
        ),
        /* @__PURE__ */ jsxs19("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx24(Field, { label: "Tipe pergerakan", htmlFor: "riwayat-tipe", children: /* @__PURE__ */ jsx24(
            Select,
            {
              id: "riwayat-tipe",
              value: aktif.tipe,
              disabled: memuat,
              onChange: (event) => buka({ tipe: event.target.value }),
              children: TIPE.map((item) => /* @__PURE__ */ jsx24("option", { value: item.value, children: item.label }, item.value))
            }
          ) }),
          /* @__PURE__ */ jsx24(Field, { label: "Varian", htmlFor: "riwayat-varian", children: /* @__PURE__ */ jsxs19(
            Select,
            {
              id: "riwayat-varian",
              value: aktif.varian,
              disabled: memuat,
              onChange: (event) => buka({ varian: event.target.value }),
              children: [
                /* @__PURE__ */ jsx24("option", { value: "", children: "Semua varian" }),
                daftarVarian.map((item) => /* @__PURE__ */ jsx24("option", { value: item.id, children: `${asText3(item.product_name) || "Produk tanpa nama"} \u2014 ${asText3(item.label) || "varian tanpa label"}` }, item.id))
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs19("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs19("p", { className: "text-meta text-slate-500", children: [
            "Menampilkan ",
            formatNumber(daftar.length),
            " dari ",
            total,
            " pergerakan."
          ] }),
          adaFilter && /* @__PURE__ */ jsx24(Button, { variant: "secondary", size: "sm", onClick: reset, disabled: memuat, children: "Reset filter" })
        ] })
      ] }),
      /* @__PURE__ */ jsx24(
        DataTable,
        {
          columns: kolom,
          rows: daftar,
          loading: memuat,
          error: galat,
          onRetry: () => buka({}),
          emptyTitle: adaFilter ? "Tidak ada pergerakan yang cocok" : "Belum ada pergerakan stok",
          emptyDescription: adaFilter ? "Ubah kata kunci atau reset filter untuk melihat riwayat lain." : "Riwayat terisi otomatis saat ada stok masuk, stok keluar, penyesuaian dari form produk, atau pengurangan dari pesanan.",
          emptyActionLabel: adaFilter ? null : "Lihat daftar stok",
          emptyActionHref: adaFilter ? null : "/admin/stok",
          caption: "Riwayat pergerakan stok"
        }
      ),
      /* @__PURE__ */ jsxs19("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs19("p", { className: "text-meta text-slate-600", children: [
          "Halaman ",
          formatNumber(halaman),
          " dari ",
          formatNumber(halamanAkhir)
        ] }),
        /* @__PURE__ */ jsx24(
          Pagination,
          {
            currentPage: halaman,
            lastPage: halamanAkhir,
            onPageChange: (page) => buka({}, { page })
          }
        )
      ] })
    ] }),
    toast && /* @__PURE__ */ jsx24("div", { className: "pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]", children: /* @__PURE__ */ jsx24(
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

// tmp/uji-ssr-stok-t_321bf03c.mjs
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
  if (opsi.errors) kendali.berikutnya.errors = opsi.errors;
  if (opsi.processing) kendali.berikutnya.processing = true;
  return renderToStaticMarkup(React25.createElement(Komponen, props));
};
var teksKotor = (s) => ["undefined", "NaN", "[object Object]", "Lorem ipsum", "[Grafik Placeholder]", "TODO"].filter((p) => s.includes(p));
var barisIndex = (ubah = {}) => ({
  id: 12,
  product: { id: 3, name: "Daster Batik Kulot", slug: "daster-batik-kulot" },
  size: "L",
  color: "Hitam",
  label: "L / Hitam",
  sku: "DSR-BTK-01-L-HITAM",
  stock: 3,
  is_active: true,
  status: "kritis",
  updated_at: "2026-10-20T09:15:00+07:00",
  ...ubah
});
var paginatorIndex = (data, meta = {}) => ({
  data,
  links: [],
  meta: { current_page: 1, last_page: 3, per_page: 15, total: 36, ...meta }
});
var propsIndex = (ubah = {}) => ({
  stok: paginatorIndex(
    [
      barisIndex({ id: 12, stock: 3, status: "kritis" }),
      barisIndex({ id: 13, stock: 0, status: "habis", label: "M / Coklat", sku: "DSR-BTK-01-M-CKL" }),
      barisIndex({ id: 14, stock: 24, status: "aman", label: "XL / Hitam" })
    ],
    { total: 36 }
  ),
  filter: { q: null, status: "semua", kategori: null, urut: "nama" },
  kategori: [{ id: 1, name: "Daster", slug: "daster" }],
  ringkasan: { varian: 36, habis: 4, kritis: 9, aman: 23 },
  ...ubah
});
var barisRiwayat = (ubah = {}) => ({
  id: 7,
  product_name: "Daster Batik Kulot",
  variant_label: "L / Hitam",
  variant_sku: "DSR-BTK-01-L-HITAM",
  type: "in",
  tipe_label: "Masuk",
  qty: 10,
  signed_qty: 10,
  note: "Restock dari supplier",
  admin: { id: 2, name: "Sari Admin" },
  created_at: "2026-10-20T09:15:00+07:00",
  ...ubah
});
var propsHistory = (ubah = {}) => ({
  riwayat: {
    data: [
      barisRiwayat(),
      barisRiwayat({ id: 8, type: "out", tipe_label: "Keluar", signed_qty: -3, note: null, admin: null }),
      barisRiwayat({ id: 9, type: "adjust", tipe_label: "Penyesuaian", signed_qty: -2, note: "Koreksi opname" }),
      barisRiwayat({ id: 10, type: "sale", tipe_label: "Penjualan", signed_qty: -1 })
    ],
    links: [],
    meta: { current_page: 2, last_page: 4, per_page: 15, total: 52 }
  },
  filter: { q: null, tipe: "semua", varian: null },
  varian: [{ id: 12, label: "L / Hitam", product_name: "Daster Batik Kulot" }],
  ringkasan: { masuk: 8, keluar: 5, adjust: 3, sale: 11 },
  ...ubah
});
var baca = (relatif) => fs.readFileSync(path.join(AKAR, relatif), "utf8");
var berkasHalaman = [
  "resources/js/Pages/Admin/Stocks/Index.jsx",
  "resources/js/Pages/Admin/Stocks/History.jsx",
  "resources/js/Pages/Admin/Stocks/partials/StokAksiModal.jsx"
];
uji("S1 tidak ada fetch/axios/SPA client", () => {
  berkasHalaman.forEach((relatif) => {
    const isi = baca(relatif);
    ["fetch(", "axios", "new XMLHttpRequest", "useSWR", "@tanstack"].forEach((pola) => {
      harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
    });
  });
});
uji("S2 tidak ada route()/Ziggy dan tidak ada akses storage", () => {
  berkasHalaman.forEach((relatif) => {
    const isi = baca(relatif);
    ["route(", "Ziggy", "localStorage", "sessionStorage", "dangerouslySetInnerHTML"].forEach((pola) => {
      harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
    });
  });
});
uji("S3 semua impor relatif ada di disk", () => {
  berkasHalaman.forEach((relatif) => {
    const isi = baca(relatif);
    const dir = path.dirname(relatif);
    const cocok = isi.match(/from '(\.[^']+)'/g) || [];
    cocok.forEach((baris) => {
      const impor = baris.replace(/from '|'/g, "");
      const pilihan = ["", ".jsx", ".js", "/index.jsx"].map((ekor) => path.join(AKAR, dir, impor + ekor));
      harus(pilihan.some((p) => fs.existsSync(p)), `${relatif} impor ${impor} tidak ditemukan`);
    });
  });
});
uji("S4 props halaman \u2286 props yang dikirim StockController (kontrak \xA712.12/\xA712.15)", () => {
  const php = baca("app/Http/Controllers/Admin/StockController.php");
  const ambilProps = (halaman) => {
    const awal = php.indexOf(`Inertia::render('Admin/Stocks/${halaman}', [`);
    harus(awal !== -1, `render Admin/Stocks/${halaman} tidak ditemukan`);
    const potong = php.slice(awal, php.indexOf("]);", awal));
    return Array.from(potong.matchAll(/^ {12}'([a-z_]+)' =>/gm)).map((m) => m[1]);
  };
  const propsServer = {
    Index: ambilProps("Index"),
    History: ambilProps("History")
  };
  const propsHalaman = (modul) => {
    const isi = baca(modul.berkas);
    const tanda = isi.match(/export default function [A-Za-z]+\(\{([^}]*)\}/);
    harus(Boolean(tanda), `${modul.berkas} tanpa signature props`);
    return tanda[1].split(",").map((bagian) => bagian.split("=")[0].trim()).filter((nama) => nama !== "");
  };
  const peta = {
    Index: propsHalaman({ berkas: berkasHalaman[0] }),
    History: propsHalaman({ berkas: berkasHalaman[1] })
  };
  Object.entries(peta).forEach(([halaman, daftar]) => {
    daftar.forEach((nama) => {
      harus(
        propsServer[halaman].includes(nama) || nama === "errors" || nama === "flash",
        `props "${nama}" di ${halaman} tidak dikirim server (server: ${propsServer[halaman].join(", ")})`
      );
    });
  });
});
uji("S5 URL literal halaman sama dengan rute admin.php", () => {
  const rute = baca("routes/admin.php");
  ["/stok", "/stok/{variant}/masuk", "/stok/{variant}/keluar", "/stok/riwayat"].forEach((pola) => {
    harus(!rute.includes("xx"), "sanity");
    harus(rute.includes(pola) || rute.includes(pola.replace("/", "")), `rute ${pola} tidak ada di admin.php`);
  });
  const index = baca(berkasHalaman[0]);
  harus(index.includes("router.get('/admin/stok'"), "Index tidak memakai router.get('/admin/stok')");
  const modal = baca(berkasHalaman[2]);
  harus(modal.includes("/admin/stok/${idVarian}/masuk"), "modal tidak memakai URL /admin/stok/{id}/masuk");
  harus(modal.includes("/admin/stok/${idVarian}/keluar"), "modal tidak memakai URL /admin/stok/{id}/keluar");
  const history = baca(berkasHalaman[1]);
  harus(history.includes("router.get('/admin/stok/riwayat'"), "History tidak memakai router.get('/admin/stok/riwayat')");
});
uji("S6 tidak ada teks placeholder tersisa", () => {
  berkasHalaman.forEach((relatif) => {
    const isi = baca(relatif);
    ["[Grafik Placeholder]", "lorem ipsum", "Lorem Ipsum", "FIXME", "XXX-"].forEach((pola) => {
      harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
    });
  });
});
uji("I1 daftar terisi: nama, label, SKU, stok, status, ringkasan, hitung", () => {
  const teksHalaman = teks(render(Index, propsIndex()));
  ["Daster Batik Kulot", "L / Hitam", "DSR-BTK-01-L-HITAM", "Kritis", "Habis", "Aman"].forEach(
    (potongan) => harus(teksHalaman.includes(potongan), `hilang: ${potongan}`)
  );
  harus(teksHalaman.includes("Menampilkan 3 dari 36 varian."), "teks hitung varian tidak sesuai");
  harus(teksHalaman.includes("Halaman 1 dari 3"), "pager halaman tidak sesuai");
  harus(teksHalaman.includes("Batas kritis") || teksHalaman.includes("Batas kritis 5"), "label batas kritis hilang");
  harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(", ")}`);
});
uji("I2 status kolom rendah-stok mengikuti aturan kontrak (0 habis / 1-4 kritis / >=5 aman)", () => {
  const markup = render(Index, propsIndex());
  const pemetaan = { habis: "Habis", kritis: "Kritis", aman: "Aman" };
  Object.values(pemetaan).forEach((label) => harus(teks(markup).includes(label), `label ${label} tidak tampil`));
  const jumlah = (label) => (teks(markup).match(new RegExp(`\\b${label}\\b`, "g")) || []).length;
  harus(jumlah("Habis") >= 1 && jumlah("Kritis") >= 1 && jumlah("Aman") >= 1, "badge status tidak lengkap");
  const markupAneh = render(Index, propsIndex({ stok: paginatorIndex([barisIndex({ status: "entah", stock: "7" })]) }));
  harus(!teks(markupAneh).includes("undefined"), "status tak dikenal menghasilkan undefined");
});
uji("I3 kosong tanpa filter: ajakan menambah produk, bukan pesan galat", () => {
  const teksHalaman = teks(render(Index, propsIndex({ stok: paginatorIndex([], { total: 0, last_page: 1 }) })));
  harus(teksHalaman.includes("Belum ada varian"), "judul kosong hilang");
  harus(teksHalaman.includes("Tambah produk"), "aksi tambah produk hilang");
  harus(teksHalaman.includes("Menampilkan 0 dari 0 varian."), "hitung kosong tidak sesuai");
  harus(!teksHalaman.includes("Gagal memuat"), "kosong tidak boleh tampil sebagai galat");
});
uji('I4 kosong karena filter: pesan "tidak cocok" + reset filter', () => {
  const teksHalaman = teks(
    render(
      Index,
      propsIndex({
        stok: paginatorIndex([], { total: 0, last_page: 1 }),
        filter: { q: "daster", status: "habis", kategori: null, urut: "nama" }
      })
    )
  );
  harus(teksHalaman.includes("Tidak ada varian yang cocok"), "judul filter kosong hilang");
  harus(teksHalaman.toLowerCase().includes("reset"), "aksi reset filter hilang");
  harus(!teksHalaman.includes("Belum ada varian"), "kosong terfilter tidak boleh memakai pesan kosong awal");
});
uji("I5 props hilang/null: halaman tetap render aman", () => {
  const teksHalaman = teks(render(Index, {}));
  harus(teksHalaman.includes("Belum ada varian"), "tanpa props tetap harus tampil state kosong");
  harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(", ")}`);
});
uji("I6 angka dari server sebagai string & nilai null tetap tampil benar", () => {
  const markup = render(
    Index,
    propsIndex({
      stok: paginatorIndex(
        [barisIndex({ stock: "3", product: null, sku: null, label: null, updated_at: null, status: "kritis" })],
        { current_page: "1", last_page: "3", total: "36" }
      )
    })
  );
  const teksHalaman = teks(markup);
  harus(teksHalaman.includes("Menampilkan 1 dari 36 varian."), "string angka tidak terkonversi");
  harus(teksHalaman.includes("-"), 'nilai kosong tidak memakai "-"');
  harus(teksHalaman.includes("Tanpa SKU"), "sku null tidak punya fallback");
  harus(markup.includes("Catat stok masuk untuk Produk tanpa nama"), "nama aksesibilitas aksi hilang");
  harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(", ")}`);
});
uji("I7 filter terpilih mengikuti props (status/urut/kategori/q)", () => {
  const markup = render(
    Index,
    propsIndex({ filter: { q: "batik", status: "habis", kategori: 1, urut: "stok_terkecil" } })
  );
  harus(markup.includes('value="batik"'), "kata kunci tidak terisi");
  harus(/<option[^>]*value="habis"[^>]*selected/.test(markup), "opsi status habis tidak terpilih");
  harus(/<option[^>]*value="1"[^>]*selected/.test(markup), "opsi kategori terpilih hilang");
  harus(/<option[^>]*value="stok_terkecil"[^>]*selected/.test(markup), "opsi urut terpilih hilang");
});
uji("I8 modal setel tertutup secara bawaan + tautan riwayat tersedia", () => {
  const markup = render(Index, propsIndex());
  harus(!markup.includes('aria-modal="true"'), "modal tidak boleh terbuka saat render awal");
  harus(markup.includes('href="/admin/stok/riwayat"'), "tautan riwayat hilang");
});
uji('H1 riwayat terisi: angka bertanda, tipe, petugas kosong -> "-"', () => {
  const teksHalaman = teks(render(History, propsHistory()));
  ["+10", "\u22123", "\u22122", "\u22121", "Masuk", "Keluar", "Penyesuaian", "Penjualan", "Sari Admin"].forEach(
    (potongan) => harus(teksHalaman.includes(potongan), `hilang: ${potongan}`)
  );
  harus(teksHalaman.includes("Menampilkan 4 dari 52 pergerakan."), "teks hitung pergerakan tidak sesuai");
  harus(teksHalaman.includes("Halaman 2 dari 4"), "pager halaman tidak sesuai");
  harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(", ")}`);
});
uji("H2 angka kartu ringkasan = jumlah baris per tipe (bukan unit stok)", () => {
  const teksHalaman = teks(render(History, propsHistory({ ringkasan: { masuk: "8", keluar: 5, adjust: null, sale: 11 } })));
  harus(teksHalaman.includes("Pergerakan masuk"), "label kartu masuk hilang");
  harus(teksHalaman.includes("Penyesuaian"), "label kartu penyesuaian hilang");
  harus(teksHalaman.includes("-"), 'ringkasan null harus tampil "-"');
  harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(", ")}`);
});
uji("H3 kosong tanpa filter vs kosong karena filter", () => {
  const kosong = { riwayat: { data: [], links: [], meta: { total: 0, last_page: 1, current_page: 1 } } };
  const teksTanpa = teks(render(History, propsHistory(kosong)));
  harus(teksTanpa.includes("Belum ada pergerakan stok"), "judul kosong hilang");
  const teksFilter = teks(render(History, propsHistory({ ...kosong, filter: { q: "batik", tipe: "out", varian: null } })));
  harus(teksFilter.includes("Tidak ada") && teksFilter.toLowerCase().includes("reset"), "kosong terfilter butuh pesan + reset");
  harus(!teksFilter.includes("Gagal memuat"), "kosong tidak boleh tampil sebagai galat");
});
uji("H4 props hilang/null: halaman tetap render aman", () => {
  const teksHalaman = teks(render(History, {}));
  harus(!teksKotor(teksHalaman).includes("undefined"), "tanpa props menghasilkan undefined");
  harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(", ")}`);
});
uji("H5 signed_qty null & angka string tidak menghasilkan NaN", () => {
  const teksHalaman = teks(
    render(
      History,
      propsHistory({
        riwayat: {
          data: [barisRiwayat({ signed_qty: null, qty: "5" }), barisRiwayat({ id: 8, signed_qty: "-4", tipe_label: null })],
          links: [],
          meta: { total: "52", last_page: "4", current_page: "2" }
        }
      })
    )
  );
  harus(!teksHalaman.includes("NaN"), "signed_qty null menghasilkan NaN");
  harus(teksHalaman.includes("\u22124"), "signed_qty string gagal diformat");
  harus(teksHalaman.includes("Menampilkan 2 dari 52 pergerakan."), "string meta gagal diformat");
});
uji("M1 modal mode masuk: judul, field, tombol sesuai desain", () => {
  const markup = render(StokAksiModal, { mode: "in", baris: barisIndex(), open: true, onClose: () => {
  } });
  const teksModal = teks(markup);
  harus(teksModal.includes("Catat stok masuk"), "judul modal masuk hilang");
  harus(teksModal.includes("Simpan stok masuk"), "tombol simpan modal masuk hilang");
  harus(/<label[^>]*for="stok-aksi-qty"/.test(markup), "field qty tanpa label terhubung");
  harus(markup.includes('aria-modal="true"'), "modal tidak memakai aria-modal");
  harus(teksModal.includes("stok tercatat saat ini 3"), "stok saat ini tidak tampil di deskripsi");
  harus(teksKotor(teksModal).length === 0, `teks kotor: ${teksKotor(teksModal).join(", ")}`);
});
uji("M2 galat server per kolom terhubung aria-describedby", () => {
  const markup = render(
    StokAksiModal,
    { mode: "out", baris: barisIndex({ stock: 1 }), open: true, onClose: () => {
    } },
    { errors: { qty: "Stok tidak cukup \u2014 stok saat ini 1." } }
  );
  const teksModal = teks(markup);
  harus(teksModal.includes("Catat stok keluar"), "judul modal keluar hilang");
  harus(teksModal.includes("Stok tidak cukup"), "pesan galat server tidak tampil");
  harus(markup.includes('aria-describedby="'), "input tanpa aria-describedby");
  harus(markup.includes('aria-invalid="true"'), "input galat tanpa aria-invalid");
});
uji("M3 galat non-kolom tampil sebagai notice, mode keluar beda tombol", () => {
  const markup = render(
    StokAksiModal,
    { mode: "out", baris: barisIndex({ stock: 3 }), open: true, onClose: () => {
    } },
    { errors: { stok: "Varian tidak aktif." } }
  );
  const teksModal = teks(markup);
  harus(teksModal.includes("Varian tidak aktif."), "galat non-kolom tidak tampil");
  harus(teksModal.includes("Simpan stok keluar"), "tombol simpan mode keluar hilang");
});
uji("D1 DataTable: loading, error + Coba lagi, kosong adalah tiga hal berbeda", () => {
  const kolom = [{ key: "nama", header: "Nama", render: (b) => b.nama }];
  const muat = render(DataTable, { columns: kolom, rows: [], loading: true });
  harus(muat.includes('aria-busy="true"') || teks(muat).toLowerCase().includes("memuat"), "state loading tidak jelas");
  const galat = teks(render(DataTable, { columns: kolom, rows: [], error: "Gagal memuat daftar stok.", onRetry: () => {
  } }));
  harus(galat.includes("Gagal memuat daftar stok."), "pesan galat tidak tampil");
  harus(galat.includes("Coba lagi"), "tombol Coba lagi hilang");
  const kosong = teks(render(DataTable, { columns: kolom, rows: [], emptyTitle: "Belum ada data" }));
  harus(kosong.includes("Belum ada data"), "state kosong tidak tampil");
  harus(!kosong.includes("Coba lagi"), "state kosong tidak boleh menawarkan Coba lagi");
});
if (process.env.DEBUG_RENDER) {
  const cuplikan = (markup, sekitar) => {
    const posisi = markup.indexOf(sekitar);
    const mulai = Math.max(0, posisi - 300);
    console.log(`
--- potongan markup sekitar "${sekitar}" ---
${markup.slice(mulai, posisi + 300)}`);
  };
  const markupH1 = render(History, propsHistory());
  const keluaranH1 = markupH1.slice(markupH1.indexOf("<tbody>"));
  console.log("\nH1 baris keluar/penyesuaian:", keluaranH1.split("</tr>").slice(1, 3).join("</tr>"));
  const markupI6 = render(Index, propsIndex({ stok: paginatorIndex([barisIndex({ stock: "3", product: null, sku: null, label: null, updated_at: null })]) }));
  const keluaranI6 = markupI6.slice(markupI6.indexOf("<tbody>"));
  console.log("\nI6 baris:", keluaranI6.split("</tr>")[0]);
}
console.log("=== UJI SSR + STATIK kartu t_321bf03c ===");
hasil.forEach((baris) => {
  console.log(`[${baris.status}] ${baris.nama}${baris.pesan ? ` -> ${baris.pesan}` : ""}`);
});
var gagal = hasil.filter((baris) => baris.status === "GAGAL");
console.log(`
TOTAL: ${hasil.length} uji, ${gagal.length} gagal`);
process.exit(gagal.length === 0 ? 0 : 1);
