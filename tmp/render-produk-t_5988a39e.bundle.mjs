// tmp/render-produk-t_5988a39e.mjs
import React30 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// resources/js/Pages/Admin/Products/Index.jsx
import React20, { useEffect as useEffect6, useState as useState4 } from "react";

// tmp/stitch-inertia-t_5988a39e.mjs
import React from "react";
var kunjungan = { calls: [] };
var Head = () => null;
var hrefDari = (href) => typeof href === "string" ? href : href?.url ?? "#";
var Link = ({ href, children, ...rest }) => React.createElement("a", { href: hrefDari(href), ...rest }, children);
var router = {
  get: (url, data, opsi) => kunjungan.calls.push({ method: "get", url, data, opsi }),
  post: (url, data, opsi) => kunjungan.calls.push({ method: "post", url, data, opsi }),
  put: (url, data, opsi) => kunjungan.calls.push({ method: "put", url, data, opsi }),
  patch: (url, data, opsi) => kunjungan.calls.push({ method: "patch", url, data, opsi }),
  delete: (url, opsi) => kunjungan.calls.push({ method: "delete", url, opsi }),
  reload: (opsi) => kunjungan.calls.push({ method: "reload", opsi }),
  visit: (url, opsi) => kunjungan.calls.push({ method: "visit", url, opsi })
};
var halamanStub = {
  props: { flash: {}, auth: { admin: { name: "Admin Uji" } }, errors: {} },
  url: "/admin/produk",
  component: "Admin/Products/Index"
};
var usePage = () => halamanStub;
var useForm = (awal = {}) => {
  const [data, setDataState] = React.useState({ ...awal });
  const [errors] = React.useState({});
  const transformRef = React.useRef(null);
  const setData = (key, value) => {
    setDataState((sebelumnya) => {
      if (typeof key === "object" && key !== null) return { ...sebelumnya, ...key };
      return { ...sebelumnya, [key]: value };
    });
  };
  return {
    data,
    errors,
    processing: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    hasErrors: Object.keys(errors).length > 0,
    setData,
    transform: (fn) => {
      transformRef.current = fn;
    },
    post: (url, opsi) => kunjungan.calls.push({ method: "post", url, opsi }),
    put: (url, opsi) => kunjungan.calls.push({ method: "put", url, opsi }),
    patch: (url, opsi) => kunjungan.calls.push({ method: "patch", url, opsi }),
    delete: (url, opsi) => kunjungan.calls.push({ method: "delete", url, opsi }),
    reset: (...fields) => setDataState((sebelumnya) => {
      if (fields.length === 0) return { ...awal };
      const berikut = { ...sebelumnya };
      fields.forEach((f) => {
        berikut[f] = awal[f];
      });
      return berikut;
    }),
    clearErrors: () => {
    },
    setError: () => {
    }
  };
};

// resources/js/Layouts/AdminLayout.jsx
import React3, { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";

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
import React2 from "react";
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
var TrashIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M4 7h16" }),
  /* @__PURE__ */ jsx("path", { d: "M10 11v6" }),
  /* @__PURE__ */ jsx("path", { d: "M14 11v6" }),
  /* @__PURE__ */ jsx("path", { d: "M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" }),
  /* @__PURE__ */ jsx("path", { d: "M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" })
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
import React5 from "react";

// resources/js/Components/Breadcrumb.jsx
import React4 from "react";
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

// resources/js/Components/Badge.jsx
import React6 from "react";
import { jsx as jsx5 } from "react/jsx-runtime";
var CLASSES = {
  brand: "bg-brand/10 text-brand",
  accent: "bg-accent-500 text-ink",
  sale: "bg-sale-500 text-white",
  success: "bg-success/10 text-success-strong",
  warning: "bg-warning/10 text-warning-strong",
  danger: "bg-danger/10 text-danger-strong"
};
function Badge({ tone = "brand", children, className = "" }) {
  return /* @__PURE__ */ jsx5(
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

// resources/js/Components/Button.jsx
import React7 from "react";
import { Fragment, jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
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
    /* @__PURE__ */ jsx6(SpinnerIcon, { size: 16 }),
    /* @__PURE__ */ jsx6("span", { children: "Memproses\u2026" })
  ] }) : /* @__PURE__ */ jsxs5(Fragment, { children: [
    icon,
    /* @__PURE__ */ jsx6("span", { children })
  ] });
  if (as === "a") {
    return /* @__PURE__ */ jsx6("a", { href, className: classes, ...rest, children: content });
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ jsx6(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest, children: content });
  }
  return /* @__PURE__ */ jsx6(
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
import React11 from "react";

// resources/js/Components/EmptyState.jsx
import React8 from "react";
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
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
    /* @__PURE__ */ jsx7("span", { className: "text-slate-300", "aria-hidden": "true", children: icon ?? /* @__PURE__ */ jsx7(ImageOffIcon, { size: 96 }) }),
    /* @__PURE__ */ jsx7("p", { className: "text-h3 text-ink", children: title }),
    description && /* @__PURE__ */ jsx7("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
    actionLabel && onAction && /* @__PURE__ */ jsx7(Button, { variant: "secondary", onClick: onAction, className: "mt-2", children: actionLabel }),
    actionLabel && !onAction && actionHref && /* @__PURE__ */ jsx7(Button, { variant: "secondary", href: actionHref, className: "mt-2", children: actionLabel })
  ] });
}

// resources/js/Components/ErrorState.jsx
import React9 from "react";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
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
        /* @__PURE__ */ jsx8("span", { className: "text-danger", "aria-hidden": "true", children: /* @__PURE__ */ jsx8(AlertIcon, { size: 48 }) }),
        /* @__PURE__ */ jsx8("p", { className: "text-h3 text-ink", children: title }),
        description && /* @__PURE__ */ jsx8("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
        /* @__PURE__ */ jsxs7("div", { className: "mt-2 flex flex-wrap items-center justify-center gap-3", children: [
          onRetry && /* @__PURE__ */ jsx8(Button, { variant: "primary", onClick: onRetry, children: retryLabel }),
          supportHref && /* @__PURE__ */ jsx8(Button, { variant: "secondary", href: supportHref, children: supportLabel })
        ] })
      ]
    }
  );
}

// resources/js/Components/Skeleton.jsx
import React10 from "react";
import { jsx as jsx9 } from "react/jsx-runtime";
var SHAPES = {
  text: "h-3 w-full",
  title: "h-6 w-2/3",
  card: "aspect-square w-full",
  row: "h-tableRow w-full",
  circle: "h-10 w-10 rounded-full"
};
function Skeleton({ variant = "text", count = 1, className = "" }) {
  return Array.from({ length: count }).map((_, index) => /* @__PURE__ */ jsx9(
    "div",
    {
      "aria-hidden": "true",
      className: cn("skeleton", SHAPES[variant] ?? SHAPES.text, className)
    },
    index
  ));
}

// resources/js/Components/DataTable.jsx
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx10("div", { className: cn("overflow-hidden rounded-lg border border-line bg-white", className), children: error ? /* @__PURE__ */ jsx10(
    ErrorState,
    {
      title: "Gagal memuat data",
      description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
      onRetry,
      supportHref: null
    }
  ) : loading ? /* @__PURE__ */ jsxs8("div", { className: "flex flex-col", "aria-busy": "true", children: [
    /* @__PURE__ */ jsx10("div", { className: "h-tableHead w-full border-b border-line bg-surface", "aria-hidden": "true" }),
    Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsx10("div", { className: "flex items-center gap-4 border-b border-line px-4 last:border-b-0", children: /* @__PURE__ */ jsx10(Skeleton, { variant: "row" }) }, index))
  ] }) : !hasRows ? /* @__PURE__ */ jsx10(
    EmptyState,
    {
      title: emptyTitle,
      description: emptyDescription,
      actionLabel: emptyActionLabel,
      actionHref: emptyActionHref
    }
  ) : /* @__PURE__ */ jsx10("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs8("table", { className: "w-full border-collapse text-meta", children: [
    caption && /* @__PURE__ */ jsx10("caption", { className: "sr-only", children: caption }),
    /* @__PURE__ */ jsx10("thead", { children: /* @__PURE__ */ jsx10("tr", { className: "bg-surface", children: columns.map((column) => {
      const isSorted = sort && sort.key === column.key;
      const sortable = Boolean(onSort && column.sortable !== false);
      return /* @__PURE__ */ jsx10(
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
                /* @__PURE__ */ jsx10("span", { "aria-hidden": "true", children: isSorted ? sort.dir === "desc" ? "\u2193" : "\u2191" : "\u2195" })
              ]
            }
          ) : column.header
        },
        column.key
      );
    }) }) }),
    /* @__PURE__ */ jsx10("tbody", { children: list.map((row, index) => {
      const clickable = typeof onRowClick === "function";
      return /* @__PURE__ */ jsx10(
        "tr",
        {
          className: cn(
            "h-tableRow border-b border-line last:border-b-0",
            clickable && "cursor-pointer transition-colors duration-hover hover:bg-surface focus-within:bg-surface"
          ),
          onClick: clickable ? () => onRowClick(row, index) : void 0,
          children: columns.map((column) => /* @__PURE__ */ jsx10(
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

// resources/js/Components/Field.jsx
import React12 from "react";
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs9("div", { className: cn("flex flex-col", className), children: [
    label && /* @__PURE__ */ jsxs9("label", { htmlFor, className: "mb-1.5 block text-meta font-semibold text-ink", children: [
      label,
      required && /* @__PURE__ */ jsx11("span", { className: "text-danger", "aria-hidden": "true", children: " *" })
    ] }),
    children,
    hint && !error && /* @__PURE__ */ jsx11("p", { id: hintId, className: "mt-1.5 text-meta text-slate-500", children: hint }),
    error && /* @__PURE__ */ jsx11("p", { id: errorId, className: "mt-1.5 text-meta text-danger-strong", role: "alert", children: error })
  ] });
}

// resources/js/Components/KpiCard.jsx
import React13 from "react";
import { Fragment as Fragment2, jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
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
  const body = /* @__PURE__ */ jsxs10(Fragment2, { children: [
    /* @__PURE__ */ jsxs10("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsx12("p", { className: "text-label uppercase text-slate-500", children: label }),
      Icon && /* @__PURE__ */ jsx12(
        "span",
        {
          className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand",
          "aria-hidden": "true",
          children: /* @__PURE__ */ jsx12(Icon, { size: 18 })
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxs10("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx12(Skeleton, { variant: "title", className: "h-7 w-3/5" }),
      /* @__PURE__ */ jsx12(Skeleton, { variant: "text", className: "h-3 w-2/5" })
    ] }) : /* @__PURE__ */ jsxs10("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx12("p", { className: "text-[28px] font-bold leading-none text-ink", children: shownValue }),
      (hasDelta || deltaLabel) && /* @__PURE__ */ jsxs10(
        "p",
        {
          className: cn(
            "flex items-center gap-1 text-meta",
            hasDelta && numericDelta > 0 && "text-success-strong",
            hasDelta && numericDelta < 0 && "text-danger-strong",
            (!hasDelta || numericDelta === 0) && "text-ink-soft"
          ),
          children: [
            hasDelta && numericDelta !== 0 && /* @__PURE__ */ jsx12(DeltaIcon, { size: 14 }),
            hasDelta && numericDelta !== 0 && /* @__PURE__ */ jsxs10("span", { children: [
              numericDelta > 0 ? "+" : "",
              numericDelta,
              "%"
            ] }),
            deltaLabel && /* @__PURE__ */ jsx12("span", { className: "text-slate-500", children: deltaLabel })
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
    return /* @__PURE__ */ jsx12("div", { className: base, "aria-busy": "true", children: body });
  }
  if (href) {
    return /* @__PURE__ */ jsx12(
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
  return /* @__PURE__ */ jsx12("div", { className: base, children: body });
}

// resources/js/Components/Modal.jsx
import React14, { useEffect as useEffect3, useRef as useRef3 } from "react";
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
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
  const panelRef = useRef3(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);
  useEffect3(() => {
    if (!open) return void 0;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsx13(
    "div",
    {
      className: "fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose?.();
      },
      children: /* @__PURE__ */ jsxs11(
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
            /* @__PURE__ */ jsxs11("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs11("div", { className: "min-w-0", children: [
                title && /* @__PURE__ */ jsx13("h2", { id: "modal-title", className: "text-h3 text-ink", children: title }),
                description && /* @__PURE__ */ jsx13("p", { className: "mt-1 text-meta text-ink-soft", children: description })
              ] }),
              onClose && /* @__PURE__ */ jsx13(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  "aria-label": closeLabel,
                  className: "-mr-2 -mt-1 inline-flex h-touch w-touch items-center justify-center rounded-md text-ink-soft transition-colors duration-hover hover:bg-surface",
                  children: /* @__PURE__ */ jsx13(CloseIcon, { size: 20 })
                }
              )
            ] }),
            children && /* @__PURE__ */ jsx13("div", { className: "mt-4 text-body text-ink", children }),
            footer && /* @__PURE__ */ jsx13("div", { className: "mt-6 flex flex-wrap justify-end gap-3", children: footer })
          ]
        }
      )
    }
  );
}

// resources/js/Components/Pagination.jsx
import React15 from "react";
import { jsx as jsx14, jsxs as jsxs12 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx14(
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
      children: direction === "left" ? /* @__PURE__ */ jsx14("path", { d: "M15 6l-6 6 6 6" }) : /* @__PURE__ */ jsx14("path", { d: "M9 6l6 6-6 6" })
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
  return /* @__PURE__ */ jsxs12("nav", { "aria-label": "Navigasi halaman", className: cn("flex items-center justify-center gap-1", className), children: [
    /* @__PURE__ */ jsx14(
      "button",
      {
        type: "button",
        onClick: () => go(current - 1),
        disabled: current <= 1,
        "aria-label": "Halaman sebelumnya",
        className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"),
        children: /* @__PURE__ */ jsx14(Chevron, { direction: "left" })
      }
    ),
    /* @__PURE__ */ jsxs12("span", { className: "px-2 text-meta text-ink-soft sm:hidden", "aria-live": "polite", children: [
      current,
      " / ",
      last
    ] }),
    /* @__PURE__ */ jsx14("div", { className: "hidden items-center gap-1 sm:flex", children: pages.map((page, index) => {
      const previous = pages[index - 1];
      const gap = previous && page - previous > 1;
      return /* @__PURE__ */ jsxs12(React15.Fragment, { children: [
        gap && /* @__PURE__ */ jsx14("span", { className: "px-1 text-meta text-slate-400", "aria-hidden": "true", children: "..." }),
        /* @__PURE__ */ jsx14(
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
    /* @__PURE__ */ jsx14(
      "button",
      {
        type: "button",
        onClick: () => go(current + 1),
        disabled: current >= last,
        "aria-label": "Halaman berikutnya",
        className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"),
        children: /* @__PURE__ */ jsx14(Chevron, { direction: "right" })
      }
    )
  ] });
}

// resources/js/Components/SearchInput.jsx
import React16, { useEffect as useEffect4, useRef as useRef4, useState as useState3 } from "react";
import { jsx as jsx15, jsxs as jsxs13 } from "react/jsx-runtime";
function SearchInput({
  value = "",
  onChange = null,
  placeholder = "Cari produk",
  label = "Cari produk",
  loading = false,
  className = ""
}) {
  const [text, setText] = useState3(value);
  const mounted = useRef4(false);
  useEffect4(() => {
    setText(value);
  }, [value]);
  useEffect4(() => {
    if (!mounted.current) {
      mounted.current = true;
      return void 0;
    }
    const timer = window.setTimeout(() => {
      if (typeof onChange === "function") onChange(text.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [text]);
  return /* @__PURE__ */ jsxs13("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx15("span", { className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400", "aria-hidden": "true", children: /* @__PURE__ */ jsx15(SearchIcon, { width: 18, height: 18 }) }),
    /* @__PURE__ */ jsx15(
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
    text.length > 0 && /* @__PURE__ */ jsx15(
      "button",
      {
        type: "button",
        onClick: () => setText(""),
        "aria-label": "Bersihkan pencarian",
        className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-slate-400 transition-colors duration-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        children: /* @__PURE__ */ jsx15(CloseIcon, { width: 16, height: 16 })
      }
    )
  ] });
}

// resources/js/Components/Select.jsx
import React17 from "react";
import { jsx as jsx16, jsxs as jsxs14 } from "react/jsx-runtime";
var BASE = "w-full h-field appearance-none rounded-md border border-line bg-white pl-3.5 pr-10 text-body text-ink transition-colors duration-hover focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Select({ error = null, className = "", id = null, children, ...rest }) {
  return /* @__PURE__ */ jsxs14("span", { className: "relative block", children: [
    /* @__PURE__ */ jsx16(
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
    /* @__PURE__ */ jsx16(
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
        children: /* @__PURE__ */ jsx16("path", { d: "M6 9l6 6 6-6" })
      }
    )
  ] });
}

// resources/js/Components/StatusBadge.jsx
import React18 from "react";
import { jsx as jsx17 } from "react/jsx-runtime";
var TONES = {
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
  const tone = TONES[key] ?? null;
  const text = label ?? tone?.label ?? (key === "" ? "-" : status);
  return /* @__PURE__ */ jsx17(
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

// resources/js/Components/Toast.jsx
import React19, { useEffect as useEffect5 } from "react";
import { jsx as jsx18, jsxs as jsxs15 } from "react/jsx-runtime";
var TONES2 = {
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
  const config = TONES2[tone] ?? TONES2.info;
  const Icon = config.icon;
  useEffect5(() => {
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

// resources/js/Pages/Admin/Products/Index.jsx
import { Fragment as Fragment3, jsx as jsx19, jsxs as jsxs16 } from "react/jsx-runtime";
var BREADCRUMB = [{ label: "Dashboard", href: "/admin" }, { label: "Produk" }];
var DASAR = { q: "", kategori: "", status: "semua", stok: "semua", urut: "terbaru" };
var STATUS = [
  { value: "semua", label: "Semua status" },
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" }
];
var STOK = [
  { value: "semua", label: "Semua stok" },
  { value: "habis", label: "Stok habis" },
  { value: "kritis", label: "Stok kritis (di bawah 5)" }
];
var URUT = [
  { value: "terbaru", label: "Terbaru" },
  { value: "nama", label: "Nama A\u2013Z" },
  { value: "harga", label: "Harga terendah" },
  { value: "stok", label: "Stok terendah" }
];
var asText = (value) => value === null || value === void 0 ? "" : String(value);
var asAngka = (value) => {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : 0;
};
var angkaTeks = (value) => value === null || value === void 0 ? "-" : formatNumber(value);
var keFilter = (sumber) => ({
  q: asText(sumber?.q ?? ""),
  kategori: sumber?.kategori === null || sumber?.kategori === void 0 ? "" : asText(sumber.kategori),
  status: sumber?.status ? asText(sumber.status) : DASAR.status,
  stok: sumber?.stok ? asText(sumber.stok) : DASAR.stok,
  urut: sumber?.urut ? asText(sumber.urut) : DASAR.urut
});
function Index({ produk = null, filter = null, kategori = [], ringkasan = null, flash = null }) {
  const aktif = keFilter(filter);
  const [memuat, setMemuat] = useState4(false);
  const [galat, setGalat] = useState4(null);
  const [toast, setToast] = useState4(null);
  const [hapus, setHapus] = useState4(null);
  useEffect6(() => {
    if (flash?.success) {
      setToast({ tone: "success", title: "Berhasil", message: String(flash.success) });
    }
  }, [flash?.success]);
  const daftar = Array.isArray(produk?.data) ? produk.data : [];
  const meta = produk?.meta ?? {};
  const halaman = asAngka(meta.current_page) || 1;
  const halamanAkhir = asAngka(meta.last_page) || 1;
  const adaFilter = aktif.q !== DASAR.q || aktif.kategori !== DASAR.kategori || aktif.status !== DASAR.status || aktif.stok !== DASAR.stok || aktif.urut !== DASAR.urut;
  const buka = (perubahan, opsi = {}) => {
    const berikut = { ...aktif, ...perubahan };
    const query = {};
    if (berikut.q !== "") query.q = berikut.q;
    if (berikut.kategori !== "") query.kategori = berikut.kategori;
    if (berikut.status !== DASAR.status) query.status = berikut.status;
    if (berikut.stok !== DASAR.stok) query.stok = berikut.stok;
    if (berikut.urut !== DASAR.urut) query.urut = berikut.urut;
    if (opsi.page && opsi.page > 1) query.page = opsi.page;
    router.get("/admin/produk", query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onStart: () => {
        setMemuat(true);
        setGalat(null);
      },
      onFinish: () => setMemuat(false),
      onError: () => setGalat("Gagal memuat daftar produk. Periksa koneksi lalu coba lagi.")
    });
  };
  const reset = () => buka({ ...DASAR });
  const gantiSort = (key) => {
    const berikut = aktif.urut === key && key !== "terbaru" ? "terbaru" : key;
    buka({ urut: berikut });
  };
  const kolom = [
    {
      key: "nama",
      header: "Produk",
      render: (baris) => /* @__PURE__ */ jsxs16("div", { className: "flex items-center gap-3", children: [
        asText(baris?.image?.path) === "" ? /* @__PURE__ */ jsx19("span", { className: "flex h-thumb w-thumb shrink-0 items-center justify-center rounded-md border border-line bg-surface text-slate-500", children: /* @__PURE__ */ jsx19(ImageOffIcon, {}) }) : /* @__PURE__ */ jsx19(
          "img",
          {
            src: asText(baris.image.path),
            alt: asText(baris.image.alt),
            loading: "lazy",
            className: "h-thumb w-thumb shrink-0 rounded-md border border-line object-cover"
          }
        ),
        /* @__PURE__ */ jsxs16("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx19("p", { className: "truncate font-semibold text-ink", children: asText(baris?.name) || "-" }),
          /* @__PURE__ */ jsx19("p", { className: "truncate text-meta text-slate-500", children: asText(baris?.sku) || "Tanpa SKU" })
        ] })
      ] })
    },
    {
      key: "kategori",
      header: "Kategori",
      sortable: false,
      render: (baris) => asText(baris?.category?.name) || "-"
    },
    {
      key: "harga",
      header: "Harga",
      align: "right",
      render: (baris) => rupiah(baris?.base_price) ?? "-"
    },
    {
      key: "stok",
      header: "Stok",
      align: "right",
      render: (baris) => /* @__PURE__ */ jsxs16("div", { className: "flex flex-col items-end", children: [
        /* @__PURE__ */ jsx19("span", { className: "font-semibold text-ink", children: angkaTeks(baris?.stock) }),
        /* @__PURE__ */ jsx19("span", { className: "text-meta text-slate-500", children: baris?.variant_count === null || baris?.variant_count === void 0 ? "-" : `${formatNumber(baris.variant_count)} varian` })
      ] })
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsxs16("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx19(
          StatusBadge,
          {
            status: baris?.is_active ? "aktif" : "nonaktif",
            label: baris?.is_active ? "Aktif" : "Nonaktif"
          }
        ),
        baris?.is_featured && /* @__PURE__ */ jsx19(Badge, { tone: "brand", children: "Unggulan" })
      ] })
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "right",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsxs16("div", { className: "flex items-center justify-end gap-2", children: [
        /* @__PURE__ */ jsx19(Button, { variant: "secondary", size: "sm", href: `/admin/produk/${baris?.id}`, children: "Detail" }),
        /* @__PURE__ */ jsx19(Button, { variant: "secondary", size: "sm", href: `/admin/produk/${baris?.id}/ubah`, children: "Ubah" }),
        /* @__PURE__ */ jsx19(Button, { variant: "danger", size: "sm", onClick: () => setHapus(baris), children: "Hapus" })
      ] })
    }
  ];
  const konfirmasiHapus = () => {
    if (hapus === null) return;
    router.delete(`/admin/produk/${hapus.id}`, {
      preserveScroll: true,
      onFinish: () => setHapus(null)
    });
  };
  return /* @__PURE__ */ jsxs16(AdminLayout, { title: "Produk", children: [
    /* @__PURE__ */ jsxs16("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx19(
        PageHeader,
        {
          title: "Produk",
          breadcrumb: BREADCRUMB,
          description: "Kelola katalog produk, harga, varian, dan stok.",
          actions: /* @__PURE__ */ jsx19(Button, { variant: "primary", href: "/admin/produk/tambah", children: "Tambah produk" })
        }
      ),
      /* @__PURE__ */ jsxs16("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsx19(
          KpiCard,
          {
            label: "Total produk",
            value: angkaTeks(ringkasan?.total),
            href: "/admin/produk"
          }
        ),
        /* @__PURE__ */ jsx19(
          KpiCard,
          {
            label: "Produk aktif",
            value: angkaTeks(ringkasan?.aktif),
            href: "/admin/produk?status=aktif"
          }
        ),
        /* @__PURE__ */ jsx19(
          KpiCard,
          {
            label: "Produk nonaktif",
            value: angkaTeks(ringkasan?.nonaktif),
            href: "/admin/produk?status=nonaktif"
          }
        ),
        /* @__PURE__ */ jsx19(
          KpiCard,
          {
            label: "Stok kritis",
            value: angkaTeks(ringkasan?.stok_kritis),
            href: "/admin/produk?stok=kritis"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs16("div", { className: "flex flex-col gap-4 rounded-lg border border-line bg-white p-4", children: [
        /* @__PURE__ */ jsx19(SearchInput, { value: aktif.q, onChange: (nilai) => buka({ q: nilai }), loading: memuat }),
        /* @__PURE__ */ jsxs16("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
          /* @__PURE__ */ jsx19(Field, { label: "Kategori", htmlFor: "filter-kategori", children: /* @__PURE__ */ jsxs16(
            Select,
            {
              id: "filter-kategori",
              value: aktif.kategori,
              disabled: memuat,
              onChange: (event) => buka({ kategori: event.target.value }),
              children: [
                /* @__PURE__ */ jsx19("option", { value: "", children: "Semua kategori" }),
                kategori.map((item) => /* @__PURE__ */ jsx19("option", { value: item.id, children: asText(item.name) }, item.id))
              ]
            }
          ) }),
          /* @__PURE__ */ jsx19(Field, { label: "Status", htmlFor: "filter-status", children: /* @__PURE__ */ jsx19(
            Select,
            {
              id: "filter-status",
              value: aktif.status,
              disabled: memuat,
              onChange: (event) => buka({ status: event.target.value }),
              children: STATUS.map((item) => /* @__PURE__ */ jsx19("option", { value: item.value, children: item.label }, item.value))
            }
          ) }),
          /* @__PURE__ */ jsx19(Field, { label: "Stok", htmlFor: "filter-stok", children: /* @__PURE__ */ jsx19(
            Select,
            {
              id: "filter-stok",
              value: aktif.stok,
              disabled: memuat,
              onChange: (event) => buka({ stok: event.target.value }),
              children: STOK.map((item) => /* @__PURE__ */ jsx19("option", { value: item.value, children: item.label }, item.value))
            }
          ) }),
          /* @__PURE__ */ jsx19(Field, { label: "Urutkan", htmlFor: "filter-urut", children: /* @__PURE__ */ jsx19(
            Select,
            {
              id: "filter-urut",
              value: aktif.urut,
              disabled: memuat,
              onChange: (event) => buka({ urut: event.target.value }),
              children: URUT.map((item) => /* @__PURE__ */ jsx19("option", { value: item.value, children: item.label }, item.value))
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs16("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs16("p", { className: "text-meta text-slate-500", children: [
            "Menampilkan ",
            formatNumber(daftar.length),
            " dari ",
            angkaTeks(meta.total),
            " produk."
          ] }),
          adaFilter && /* @__PURE__ */ jsx19(Button, { variant: "secondary", size: "sm", onClick: reset, disabled: memuat, children: "Reset filter" })
        ] })
      ] }),
      /* @__PURE__ */ jsx19(
        DataTable,
        {
          columns: kolom,
          rows: daftar,
          loading: memuat,
          error: galat,
          onRetry: () => buka({}),
          emptyTitle: adaFilter ? "Tidak ada produk yang cocok" : "Belum ada produk",
          emptyDescription: adaFilter ? "Ubah kata kunci atau reset filter untuk melihat produk lain." : "Tambahkan produk pertama agar katalog toko terisi.",
          emptyActionLabel: adaFilter ? null : "Tambah produk",
          emptyActionHref: adaFilter ? null : "/admin/produk/tambah",
          sort: { key: aktif.urut, dir: aktif.urut === "terbaru" ? "desc" : "asc" },
          onSort: gantiSort,
          caption: "Daftar produk"
        }
      ),
      /* @__PURE__ */ jsx19(Pagination, { currentPage: halaman, lastPage: halamanAkhir, onPageChange: (page) => buka({}, { page }) }),
      /* @__PURE__ */ jsx19(
        Modal,
        {
          open: hapus !== null,
          onClose: () => setHapus(null),
          title: "Hapus produk?",
          description: hapus ? `Produk "${asText(hapus.name)}" akan dihapus dari katalog.` : "",
          footer: /* @__PURE__ */ jsxs16(Fragment3, { children: [
            /* @__PURE__ */ jsx19(Button, { variant: "secondary", onClick: () => setHapus(null), children: "Batal" }),
            /* @__PURE__ */ jsx19(Button, { variant: "danger", onClick: konfirmasiHapus, children: "Hapus produk" })
          ] }),
          children: /* @__PURE__ */ jsx19("p", { className: "text-body text-ink-soft", children: "Gambar galeri produk ikut dihapus dari server. Tindakan ini tidak bisa dibatalkan." })
        }
      )
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

// resources/js/Pages/Admin/Products/Create.jsx
import React27 from "react";

// resources/js/Pages/Admin/Products/partials/ProdukForm.jsx
import React26, { useMemo, useState as useState6 } from "react";

// resources/js/Components/Input.jsx
import React21 from "react";
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

// resources/js/Components/InlineNotice.jsx
import React22 from "react";
import { jsx as jsx21, jsxs as jsxs17 } from "react/jsx-runtime";
var TONES3 = {
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
  return /* @__PURE__ */ jsxs17(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn("flex items-start gap-3 rounded-md p-4", TONES3[tone] ?? TONES3.info, className),
      children: [
        /* @__PURE__ */ jsx21("span", { className: cn("mt-0.5 shrink-0", ICON_TONES[tone] ?? ICON_TONES.info), "aria-hidden": "true", children: /* @__PURE__ */ jsx21(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs17("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx21("p", { className: "text-label", children: title }),
          children && /* @__PURE__ */ jsx21("div", { className: "text-meta text-ink-soft", children })
        ] }),
        onDismiss && /* @__PURE__ */ jsx21(
          "button",
          {
            type: "button",
            onClick: onDismiss,
            "aria-label": "Tutup pesan",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60",
            children: /* @__PURE__ */ jsx21(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}

// resources/js/Components/Textarea.jsx
import React23 from "react";
import { jsx as jsx22 } from "react/jsx-runtime";
var BASE3 = "w-full min-h-[120px] resize-y rounded-md border border-line bg-white px-3.5 py-3 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Textarea({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx22(
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

// resources/js/Pages/Admin/Products/partials/DropzoneGalery.jsx
import React24, { useRef as useRef5, useState as useState5 } from "react";
import { jsx as jsx23, jsxs as jsxs18 } from "react/jsx-runtime";
var TIPE_DITERIMA = ["image/jpeg", "image/png", "image/webp"];
var MAKS_UKURAN = 2 * 1024 * 1024;
var labelUkuran = (byte) => `${(byte / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
var UnggahIcon = ({ size = 24, className = "" }) => /* @__PURE__ */ jsxs18(
  "svg",
  {
    className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
    children: [
      /* @__PURE__ */ jsx23("path", { d: "M12 16V4" }),
      /* @__PURE__ */ jsx23("path", { d: "m7.5 8.5 4.5-4.5 4.5 4.5" }),
      /* @__PURE__ */ jsx23("path", { d: "M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" })
    ]
  }
);
function DropzoneGalery({
  berkas = [],
  onTambah = null,
  onAlt = null,
  onHapus = null,
  maks = 5,
  disabled = false,
  error = null
}) {
  const inputRef = useRef5(null);
  const [dragover, setDragover] = useState5(false);
  const [galatBerkas, setGalatBerkas] = useState5([]);
  const sisa = Math.max(0, maks - berkas.length);
  const pesanGalat = galatBerkas.length > 0 ? galatBerkas : error ? [String(error)] : [];
  const adaGalat = pesanGalat.length > 0;
  const terima = (daftar) => {
    if (disabled || typeof onTambah !== "function") return;
    const ditolak = [];
    const lolos = [];
    Array.from(daftar ?? []).forEach((file) => {
      if (!file) return;
      if (!TIPE_DITERIMA.includes(file.type)) {
        ditolak.push(`${file.name} bukan JPG, PNG, atau WebP.`);
        return;
      }
      if (file.size > MAKS_UKURAN) {
        ditolak.push(`${file.name} lebih dari ${labelUkuran(MAKS_UKURAN)}.`);
        return;
      }
      lolos.push(file);
    });
    const diterima = lolos.slice(0, sisa);
    if (lolos.length > sisa) {
      ditolak.push(`Sisa slot hanya ${sisa} gambar per simpan.`);
    }
    setGalatBerkas(ditolak);
    if (diterima.length > 0) onTambah(diterima);
  };
  const bukaPicker = () => {
    if (!disabled) inputRef.current?.click();
  };
  return /* @__PURE__ */ jsxs18("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsx23(
      "input",
      {
        ref: inputRef,
        id: "produk-galeri-input",
        name: "galeri-picker",
        type: "file",
        multiple: true,
        accept: "image/jpeg,image/png,image/webp",
        className: "sr-only",
        disabled,
        "aria-describedby": adaGalat ? "produk-galeri-error" : "produk-galeri-hint",
        "aria-invalid": adaGalat ? "true" : void 0,
        onChange: (event) => {
          terima(event.target.files);
          event.target.value = "";
        }
      }
    ),
    /* @__PURE__ */ jsxs18("div", { className: "grid grid-cols-2 gap-3", children: [
      sisa > 0 && /* @__PURE__ */ jsxs18(
        "button",
        {
          type: "button",
          onClick: bukaPicker,
          disabled,
          onDragOver: (event) => {
            event.preventDefault();
            if (!disabled) setDragover(true);
          },
          onDragLeave: () => setDragover(false),
          onDrop: (event) => {
            event.preventDefault();
            setDragover(false);
            terima(event.dataTransfer?.files);
          },
          "aria-label": "Tarik gambar atau klik untuk memilih berkas",
          className: cn(
            "flex aspect-square flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed bg-white p-3 text-center transition-colors duration-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45",
            dragover ? "border-brand text-brand" : "border-line text-slate-500",
            adaGalat && !dragover ? "border-danger" : null
          ),
          children: [
            /* @__PURE__ */ jsx23(UnggahIcon, { size: 24 }),
            /* @__PURE__ */ jsx23("span", { className: "text-meta", children: "Tarik gambar atau klik" }),
            /* @__PURE__ */ jsxs18("span", { className: "text-meta text-slate-500", children: [
              "Maks ",
              maks,
              " berkas \xB7 JPG/PNG/WebP \xB7 2 MB"
            ] })
          ]
        }
      ),
      berkas.map((item, index) => /* @__PURE__ */ jsxs18("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxs18("div", { className: "relative", children: [
          /* @__PURE__ */ jsx23(
            "img",
            {
              src: item.url,
              alt: "",
              className: "aspect-square w-full rounded-md border border-line object-cover"
            }
          ),
          /* @__PURE__ */ jsx23(
            Button,
            {
              variant: "danger",
              size: "sm",
              className: "absolute right-1 top-1 h-8 w-8 px-0",
              "aria-label": `Hapus gambar baru ${index + 1}`,
              disabled,
              onClick: () => onHapus?.(item.key),
              children: /* @__PURE__ */ jsx23("span", { "aria-hidden": "true", children: "\xD7" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx23(
          Input,
          {
            id: `produk-galeri-alt-${item.key}`,
            name: `images_alt[${index}]`,
            value: item.alt,
            maxLength: 180,
            disabled,
            placeholder: "Teks alternatif",
            "aria-label": `Teks alternatif gambar baru ${index + 1}`,
            onChange: (event) => onAlt?.(item.key, event.target.value)
          }
        )
      ] }, item.key))
    ] }),
    /* @__PURE__ */ jsx23("p", { id: "produk-galeri-hint", className: "text-meta text-slate-500", children: berkas.length > 0 ? `${berkas.length} gambar baru siap diunggah saat disimpan.` : "Belum ada gambar baru dipilih." }),
    adaGalat && /* @__PURE__ */ jsx23("ul", { id: "produk-galeri-error", role: "alert", className: "flex flex-col gap-1", children: pesanGalat.map((pesan) => /* @__PURE__ */ jsx23("li", { className: "text-meta text-danger-strong", children: pesan }, pesan)) })
  ] });
}

// resources/js/Pages/Admin/Products/partials/VarianEditor.jsx
import React25 from "react";
import { jsx as jsx24, jsxs as jsxs19 } from "react/jsx-runtime";
var MAKS_BARIS = 50;
var idSel = (index, field) => `varian-${index}-${field}`;
function PesanGalat({ id, message }) {
  if (!message) return null;
  return /* @__PURE__ */ jsx24("p", { id: `${id}-error`, className: "mt-1.5 text-meta text-danger-strong", role: "alert", children: message });
}
function VarianEditor({
  baris = [],
  errors = {},
  ukuranBaku = [],
  onChange = null,
  onTambah = null,
  onHapus = null,
  disabled = false
}) {
  const galatBaris = (index, field) => errors[`variants.${index}.${field}`] ?? null;
  return /* @__PURE__ */ jsxs19("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsx24("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs19("table", { className: "w-full min-w-[760px] border-collapse text-body", children: [
      /* @__PURE__ */ jsx24("caption", { className: "sr-only", children: "Varian produk" }),
      /* @__PURE__ */ jsx24("thead", { children: /* @__PURE__ */ jsxs19("tr", { className: "h-tableHead border-b border-line bg-surface text-badge uppercase text-slate-600", children: [
        /* @__PURE__ */ jsx24("th", { scope: "col", className: "w-12 px-3 text-left font-semibold", children: "No" }),
        /* @__PURE__ */ jsx24("th", { scope: "col", className: "px-3 text-left font-semibold", children: "Ukuran *" }),
        /* @__PURE__ */ jsx24("th", { scope: "col", className: "px-3 text-left font-semibold", children: "Warna" }),
        /* @__PURE__ */ jsx24("th", { scope: "col", className: "px-3 text-left font-semibold", children: "SKU" }),
        /* @__PURE__ */ jsx24("th", { scope: "col", className: "px-3 text-left font-semibold", children: "Harga tambahan" }),
        /* @__PURE__ */ jsx24("th", { scope: "col", className: "px-3 text-left font-semibold", children: "Stok" }),
        /* @__PURE__ */ jsx24("th", { scope: "col", className: "px-3 text-left font-semibold", children: "Aktif" }),
        /* @__PURE__ */ jsx24("th", { scope: "col", className: "px-3 text-right font-semibold", children: "Aksi" })
      ] }) }),
      baris.map((row, index) => /* @__PURE__ */ jsx24("tbody", { className: "border-b border-line", children: /* @__PURE__ */ jsxs19("tr", { children: [
        /* @__PURE__ */ jsx24("td", { className: "px-3 py-3 align-top text-meta text-slate-600", children: index + 1 }),
        /* @__PURE__ */ jsxs19("td", { className: "w-40 px-3 py-3 align-top", children: [
          /* @__PURE__ */ jsxs19(
            Select,
            {
              id: idSel(index, "size"),
              name: `variants[${index}][size]`,
              value: row.size,
              disabled,
              error: galatBaris(index, "size"),
              "aria-label": `Ukuran varian baris ${index + 1}`,
              onChange: (event) => onChange?.(index, "size", event.target.value),
              children: [
                /* @__PURE__ */ jsx24("option", { value: "", children: "Pilih ukuran" }),
                ukuranBaku.map((ukuran) => /* @__PURE__ */ jsx24("option", { value: ukuran, children: ukuran }, ukuran))
              ]
            }
          ),
          /* @__PURE__ */ jsx24(PesanGalat, { id: idSel(index, "size"), message: galatBaris(index, "size") })
        ] }),
        /* @__PURE__ */ jsxs19("td", { className: "w-36 px-3 py-3 align-top", children: [
          /* @__PURE__ */ jsx24(
            Input,
            {
              id: idSel(index, "color"),
              name: `variants[${index}][color]`,
              value: row.color,
              maxLength: 40,
              disabled,
              error: galatBaris(index, "color"),
              "aria-label": `Warna varian baris ${index + 1}`,
              placeholder: "Mis. Hitam",
              onChange: (event) => onChange?.(index, "color", event.target.value)
            }
          ),
          /* @__PURE__ */ jsx24(PesanGalat, { id: idSel(index, "color"), message: galatBaris(index, "color") })
        ] }),
        /* @__PURE__ */ jsxs19("td", { className: "w-48 px-3 py-3 align-top", children: [
          /* @__PURE__ */ jsx24(
            Input,
            {
              id: idSel(index, "sku"),
              name: `variants[${index}][sku]`,
              value: row.sku,
              maxLength: 60,
              disabled,
              error: galatBaris(index, "sku"),
              "aria-label": `SKU varian baris ${index + 1}`,
              placeholder: "Kosongkan = otomatis",
              onChange: (event) => onChange?.(index, "sku", event.target.value)
            }
          ),
          /* @__PURE__ */ jsx24(PesanGalat, { id: idSel(index, "sku"), message: galatBaris(index, "sku") })
        ] }),
        /* @__PURE__ */ jsxs19("td", { className: "w-40 px-3 py-3 align-top", children: [
          /* @__PURE__ */ jsx24(
            Input,
            {
              id: idSel(index, "price_delta"),
              name: `variants[${index}][price_delta]`,
              type: "number",
              step: 1,
              inputMode: "numeric",
              value: row.price_delta,
              disabled,
              error: galatBaris(index, "price_delta"),
              "aria-label": `Harga tambahan varian baris ${index + 1}`,
              placeholder: "0",
              onChange: (event) => onChange?.(index, "price_delta", event.target.value)
            }
          ),
          /* @__PURE__ */ jsx24(
            PesanGalat,
            {
              id: idSel(index, "price_delta"),
              message: galatBaris(index, "price_delta")
            }
          )
        ] }),
        /* @__PURE__ */ jsxs19("td", { className: "w-28 px-3 py-3 align-top", children: [
          /* @__PURE__ */ jsx24(
            Input,
            {
              id: idSel(index, "stock"),
              name: `variants[${index}][stock]`,
              type: "number",
              min: 0,
              step: 1,
              inputMode: "numeric",
              value: row.stock,
              disabled,
              error: galatBaris(index, "stock"),
              "aria-label": `Stok varian baris ${index + 1}`,
              placeholder: "0",
              onChange: (event) => onChange?.(index, "stock", event.target.value)
            }
          ),
          /* @__PURE__ */ jsx24(PesanGalat, { id: idSel(index, "stock"), message: galatBaris(index, "stock") })
        ] }),
        /* @__PURE__ */ jsx24("td", { className: "px-3 py-3 align-top", children: /* @__PURE__ */ jsxs19(
          "label",
          {
            htmlFor: idSel(index, "is_active"),
            className: "flex items-center gap-2 text-meta text-ink",
            children: [
              /* @__PURE__ */ jsx24(
                "input",
                {
                  id: idSel(index, "is_active"),
                  name: `variants[${index}][is_active]`,
                  type: "checkbox",
                  className: "h-4 w-4 shrink-0",
                  checked: row.is_active,
                  disabled,
                  onChange: (event) => onChange?.(index, "is_active", event.target.checked)
                }
              ),
              /* @__PURE__ */ jsx24("span", { className: "sr-only", children: "Aktifkan varian baris" }),
              /* @__PURE__ */ jsx24("span", { "aria-hidden": "true", children: row.is_active ? "Aktif" : "Nonaktif" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx24("td", { className: "px-3 py-3 text-right align-top", children: /* @__PURE__ */ jsxs19(
          Button,
          {
            variant: "danger",
            size: "sm",
            disabled: disabled || baris.length <= 1,
            "aria-label": `Hapus varian baris ${index + 1}`,
            onClick: () => onHapus?.(index),
            children: [
              /* @__PURE__ */ jsx24(TrashIcon, { className: "h-4 w-4" }),
              "Hapus"
            ]
          }
        ) })
      ] }) }, row.key ?? `varian-${index}`))
    ] }) }),
    /* @__PURE__ */ jsxs19("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx24(
        Button,
        {
          variant: "secondary",
          size: "sm",
          disabled: disabled || baris.length >= MAKS_BARIS,
          onClick: () => onTambah?.(),
          children: "Tambah varian"
        }
      ),
      /* @__PURE__ */ jsxs19("p", { className: "text-meta text-slate-500", children: [
        baris.length,
        " dari maksimal ",
        MAKS_BARIS,
        " varian. SKU varian dibuat otomatis dari SKU produk, ukuran, dan warna bila dikosongkan."
      ] })
    ] })
  ] });
}

// resources/js/Pages/Admin/Products/partials/ProdukForm.jsx
import { Fragment as Fragment4, jsx as jsx25, jsxs as jsxs20 } from "react/jsx-runtime";
var MAKS_GAMBAR = 5;
var asText2 = (value) => value === null || value === void 0 ? "" : String(value);
var asAngka2 = (value) => {
  if (value === null || value === void 0 || value === "") return "";
  const angka = Number(value);
  return Number.isFinite(angka) ? String(angka) : "";
};
var asBool = (value) => value === true || value === 1 || value === "1" || value === "true";
var urutan = 0;
var uid = () => {
  urutan += 1;
  return `baris-${Date.now()}-${urutan}`;
};
var variansAwal = (produk) => (produk?.variants ?? []).map((varian) => ({
  key: `varian-${asText2(varian.id) || uid()}`,
  id: varian.id ?? null,
  size: asText2(varian.size),
  color: asText2(varian.color),
  sku: asText2(varian.sku),
  price_delta: asAngka2(varian.price_delta ?? 0),
  stock: asAngka2(varian.stock ?? 0),
  is_active: asBool(varian.is_active)
}));
var barisKosong = () => ({
  key: uid(),
  id: null,
  size: "",
  color: "",
  sku: "",
  price_delta: "",
  stock: "",
  is_active: true
});
var dataAwal = (produk) => ({
  name: asText2(produk?.name),
  slug: asText2(produk?.slug),
  sku: asText2(produk?.sku),
  category_id: asText2(produk?.category_id),
  short_description: asText2(produk?.short_description),
  description: asText2(produk?.description),
  weight_gram: asAngka2(produk?.weight_gram),
  base_price: asAngka2(produk?.base_price),
  compare_price: asAngka2(produk?.compare_price),
  wholesale_price: asAngka2(produk?.wholesale_price),
  min_wholesale_qty: asAngka2(produk?.min_wholesale_qty),
  is_active: produk ? asBool(produk.is_active) : true,
  is_featured: produk ? asBool(produk.is_featured) : false,
  variants: produk ? variansAwal(produk) : [barisKosong()]
});
function GambarLama({ gambar, hapus, primary, onMintaHapus, onBatalHapus, onPilihPrimary, disabled }) {
  return /* @__PURE__ */ jsxs20(
    "li",
    {
      className: hapus ? "flex flex-col gap-3 rounded-md border border-danger bg-white p-3" : "flex flex-col gap-3 rounded-md border border-line bg-white p-3",
      children: [
        /* @__PURE__ */ jsxs20("div", { className: "flex items-start gap-3", children: [
          asText2(gambar.path) === "" ? /* @__PURE__ */ jsx25(
            "span",
            {
              "aria-hidden": "true",
              className: "flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-slate-500",
              children: /* @__PURE__ */ jsx25(ImageOffIcon, {})
            }
          ) : /* @__PURE__ */ jsx25(
            "img",
            {
              src: asText2(gambar.path),
              alt: asText2(gambar.alt),
              loading: "lazy",
              className: "h-16 w-16 shrink-0 rounded-md border border-line object-cover"
            }
          ),
          /* @__PURE__ */ jsxs20("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx25("p", { className: "text-meta font-semibold text-ink", children: asBool(gambar.is_primary) ? "Gambar utama" : "Gambar galeri" }),
            /* @__PURE__ */ jsx25("p", { className: "mt-0.5 break-words text-meta text-slate-500", children: asText2(gambar.alt) || "Teks alternatif belum diisi" })
          ] })
        ] }),
        hapus ? /* @__PURE__ */ jsxs20("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsx25("p", { className: "text-meta text-danger-strong", children: "Ditandai untuk dihapus saat disimpan." }),
          /* @__PURE__ */ jsx25(Button, { variant: "secondary", size: "sm", disabled, onClick: () => onBatalHapus(gambar.id), children: "Batalkan" })
        ] }) : /* @__PURE__ */ jsxs20("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxs20("label", { htmlFor: `gambar-primary-${gambar.id}`, className: "flex items-center gap-2 text-meta text-ink", children: [
            /* @__PURE__ */ jsx25(
              "input",
              {
                id: `gambar-primary-${gambar.id}`,
                type: "radio",
                name: "gambar-primary",
                className: "h-4 w-4 shrink-0",
                checked: primary,
                disabled,
                onChange: () => onPilihPrimary(gambar.id)
              }
            ),
            "Jadikan gambar utama"
          ] }),
          /* @__PURE__ */ jsx25(Button, { variant: "danger", size: "sm", disabled, onClick: () => onMintaHapus(gambar), children: "Hapus" })
        ] })
      ]
    }
  );
}
function ProdukForm({ produk = null, kategori = [], ukuran_baku = [] }) {
  const ubah = produk !== null;
  const form = useForm({ ...dataAwal(produk) });
  const [berkas, setBerkas] = useState6([]);
  const [hapusIds, setHapusIds] = useState6([]);
  const [primaryId, setPrimaryId] = useState6(() => {
    const utama = (produk?.images ?? []).find((gambar) => asBool(gambar.is_primary));
    return utama ? utama.id : null;
  });
  const [konfirmasiGambar, setKonfirmasiGambar] = useState6(null);
  const gambarLama = useMemo(() => (produk?.images ?? []).filter(Boolean), [produk]);
  const gambarTersisa = gambarLama.filter((gambar) => !hapusIds.includes(gambar.id));
  const galatGambar = [
    form.errors.images,
    form.errors["images.0"],
    form.errors.hapus_images,
    form.errors.primary_image_id
  ].filter(Boolean).map((pesan) => asText2(pesan));
  const ditangani = /* @__PURE__ */ new Set([
    "name",
    "slug",
    "sku",
    "category_id",
    "short_description",
    "description",
    "weight_gram",
    "base_price",
    "compare_price",
    "wholesale_price",
    "min_wholesale_qty",
    "is_active",
    "is_featured",
    "images",
    "images.0",
    "hapus_images",
    "primary_image_id"
  ]);
  const galatLain = Object.entries(form.errors).filter(
    ([kunci]) => !ditangani.has(kunci) && kunci !== "variants" && !kunci.startsWith("variants.")
  );
  const adaGalat = Object.keys(form.errors).length > 0;
  const tambahBerkas = (daftar) => {
    setBerkas((sebelumnya) => [
      ...sebelumnya,
      ...daftar.map((file) => ({ key: uid(), file, url: URL.createObjectURL(file), alt: "" }))
    ]);
  };
  const hapusBerkas = (key) => {
    setBerkas((sebelumnya) => {
      const baris = sebelumnya.find((item) => item.key === key);
      if (baris) URL.revokeObjectURL(baris.url);
      return sebelumnya.filter((item) => item.key !== key);
    });
  };
  const ubahAlt = (key, nilai) => {
    setBerkas(
      (sebelumnya) => sebelumnya.map((item) => item.key === key ? { ...item, alt: nilai } : item)
    );
  };
  const mintaHapusGambar = (gambar) => setKonfirmasiGambar(gambar);
  const konfirmasiHapusGambar = () => {
    if (konfirmasiGambar === null) return;
    setHapusIds((sebelumnya) => [...sebelumnya, konfirmasiGambar.id]);
    if (primaryId === konfirmasiGambar.id) setPrimaryId(null);
    setKonfirmasiGambar(null);
  };
  const batalHapusGambar = (id) => setHapusIds((sebelumnya) => sebelumnya.filter((nilai) => nilai !== id));
  const ubahVarian = (index, field, nilai) => {
    form.setData(
      "variants",
      form.data.variants.map(
        (baris, urutanBaris) => urutanBaris === index ? { ...baris, [field]: nilai } : baris
      )
    );
  };
  const tambahVarian = () => {
    form.setData("variants", [...form.data.variants, barisKosong()]);
  };
  const hapusVarian = (index) => {
    form.setData(
      "variants",
      form.data.variants.filter((_, urutanBaris) => urutanBaris !== index)
    );
  };
  const kirim = (event) => {
    event.preventDefault();
    if (form.processing) return;
    form.transform((data) => {
      const muatan = {
        ...data,
        images: berkas.map((item) => item.file),
        images_alt: berkas.map((item) => item.alt),
        variants: data.variants.map((baris) => {
          const { key, ...sisa } = baris;
          const hasil = {
            ...sisa,
            size: asText2(sisa.size),
            color: asText2(sisa.color).trim(),
            sku: asText2(sisa.sku).trim(),
            price_delta: sisa.price_delta === "" ? 0 : sisa.price_delta,
            stock: sisa.stock === "" ? 0 : sisa.stock
          };
          if (hasil.id === null || hasil.id === "") delete hasil.id;
          return hasil;
        })
      };
      if (!ubah) {
        delete muatan.hapus_images;
        delete muatan.primary_image_id;
        return muatan;
      }
      return {
        ...muatan,
        _method: "put",
        hapus_images: hapusIds,
        primary_image_id: primaryId === null ? "" : primaryId
      };
    });
    form.post(ubah ? `/admin/produk/${produk.id}` : "/admin/produk", {
      forceFormData: true,
      preserveScroll: true
    });
  };
  const previewHarga = rupiah(form.data.base_price);
  return /* @__PURE__ */ jsxs20("form", { onSubmit: kirim, noValidate: true, className: "flex flex-col gap-6", children: [
    adaGalat && /* @__PURE__ */ jsxs20(InlineNotice, { tone: "error", title: "Isian belum bisa disimpan", children: [
      /* @__PURE__ */ jsx25("p", { children: "Sebagian data belum benar. Periksa kolom yang ditandai merah, lalu simpan lagi. Data yang sudah diisi tidak hilang." }),
      galatLain.length > 0 && /* @__PURE__ */ jsx25("ul", { className: "mt-2 flex list-disc flex-col gap-1 pl-5", children: galatLain.map(([kunci, pesan]) => /* @__PURE__ */ jsx25("li", { children: asText2(pesan) }, kunci)) })
    ] }),
    /* @__PURE__ */ jsxs20("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]", children: [
      /* @__PURE__ */ jsxs20("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxs20("section", { className: "flex flex-col gap-5 rounded-lg border border-line bg-white p-6", children: [
          /* @__PURE__ */ jsx25("h2", { className: "text-h3 font-semibold text-ink", children: "Informasi produk" }),
          /* @__PURE__ */ jsx25(
            Field,
            {
              label: "Nama produk",
              htmlFor: "produk-name",
              required: true,
              error: form.errors.name ?? null,
              children: /* @__PURE__ */ jsx25(
                Input,
                {
                  id: "produk-name",
                  name: "name",
                  value: form.data.name,
                  maxLength: 180,
                  disabled: form.processing,
                  error: form.errors.name ?? null,
                  onChange: (event) => form.setData("name", event.target.value)
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs20("div", { className: "grid gap-5 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx25(
              Field,
              {
                label: "Slug",
                htmlFor: "produk-slug",
                hint: "Kosongkan untuk dibuat otomatis dari nama.",
                error: form.errors.slug ?? null,
                children: /* @__PURE__ */ jsx25(
                  Input,
                  {
                    id: "produk-slug",
                    name: "slug",
                    value: form.data.slug,
                    maxLength: 200,
                    disabled: form.processing,
                    error: form.errors.slug ?? null,
                    onChange: (event) => form.setData("slug", event.target.value)
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx25(Field, { label: "SKU produk", htmlFor: "produk-sku", required: true, error: form.errors.sku ?? null, children: /* @__PURE__ */ jsx25(
              Input,
              {
                id: "produk-sku",
                name: "sku",
                value: form.data.sku,
                maxLength: 60,
                disabled: form.processing,
                error: form.errors.sku ?? null,
                onChange: (event) => form.setData("sku", event.target.value)
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx25(
            Field,
            {
              label: "Deskripsi singkat",
              htmlFor: "produk-deskripsi-singkat",
              hint: "Maksimal 255 karakter, tampil di kartu produk katalog.",
              error: form.errors.short_description ?? null,
              children: /* @__PURE__ */ jsx25(
                Input,
                {
                  id: "produk-deskripsi-singkat",
                  name: "short_description",
                  value: form.data.short_description,
                  maxLength: 255,
                  disabled: form.processing,
                  error: form.errors.short_description ?? null,
                  onChange: (event) => form.setData("short_description", event.target.value)
                }
              )
            }
          ),
          /* @__PURE__ */ jsx25(
            Field,
            {
              label: "Deskripsi",
              htmlFor: "produk-deskripsi",
              hint: "Maksimal 5000 karakter, tampil di halaman detail produk.",
              error: form.errors.description ?? null,
              children: /* @__PURE__ */ jsx25(
                Textarea,
                {
                  id: "produk-deskripsi",
                  name: "description",
                  rows: 6,
                  maxLength: 5e3,
                  value: form.data.description,
                  disabled: form.processing,
                  error: form.errors.description ?? null,
                  onChange: (event) => form.setData("description", event.target.value)
                }
              )
            }
          ),
          /* @__PURE__ */ jsx25(
            Field,
            {
              label: "Berat (gram)",
              htmlFor: "produk-berat",
              hint: "Opsional, dipakai untuk perhitungan ongkir.",
              error: form.errors.weight_gram ?? null,
              children: /* @__PURE__ */ jsx25(
                Input,
                {
                  id: "produk-berat",
                  name: "weight_gram",
                  type: "number",
                  min: 0,
                  max: 1e5,
                  step: 1,
                  inputMode: "numeric",
                  value: form.data.weight_gram,
                  disabled: form.processing,
                  error: form.errors.weight_gram ?? null,
                  onChange: (event) => form.setData("weight_gram", event.target.value)
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsxs20("section", { className: "flex flex-col gap-5 rounded-lg border border-line bg-white p-6", children: [
          /* @__PURE__ */ jsx25("h2", { className: "text-h3 font-semibold text-ink", children: "Harga" }),
          /* @__PURE__ */ jsxs20("div", { className: "grid gap-5 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx25(
              Field,
              {
                label: "Harga jual",
                htmlFor: "produk-harga",
                required: true,
                hint: previewHarga ? `Tampil di katalog sebagai ${previewHarga}.` : "Rupiah, tanpa titik.",
                error: form.errors.base_price ?? null,
                children: /* @__PURE__ */ jsx25(
                  Input,
                  {
                    id: "produk-harga",
                    name: "base_price",
                    type: "number",
                    min: 0,
                    step: 1,
                    inputMode: "numeric",
                    value: form.data.base_price,
                    disabled: form.processing,
                    error: form.errors.base_price ?? null,
                    onChange: (event) => form.setData("base_price", event.target.value)
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx25(
              Field,
              {
                label: "Harga coret",
                htmlFor: "produk-harga-coret",
                hint: "Opsional, harus lebih besar dari harga jual.",
                error: form.errors.compare_price ?? null,
                children: /* @__PURE__ */ jsx25(
                  Input,
                  {
                    id: "produk-harga-coret",
                    name: "compare_price",
                    type: "number",
                    min: 0,
                    step: 1,
                    inputMode: "numeric",
                    value: form.data.compare_price,
                    disabled: form.processing,
                    error: form.errors.compare_price ?? null,
                    onChange: (event) => form.setData("compare_price", event.target.value)
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx25(
              Field,
              {
                label: "Harga grosir",
                htmlFor: "produk-harga-grosir",
                hint: "Opsional, harus lebih kecil dari harga jual.",
                error: form.errors.wholesale_price ?? null,
                children: /* @__PURE__ */ jsx25(
                  Input,
                  {
                    id: "produk-harga-grosir",
                    name: "wholesale_price",
                    type: "number",
                    min: 0,
                    step: 1,
                    inputMode: "numeric",
                    value: form.data.wholesale_price,
                    disabled: form.processing,
                    error: form.errors.wholesale_price ?? null,
                    onChange: (event) => form.setData("wholesale_price", event.target.value)
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx25(
              Field,
              {
                label: "Minimal qty grosir",
                htmlFor: "produk-min-grosir",
                hint: "Wajib diisi bila harga grosir diisi.",
                error: form.errors.min_wholesale_qty ?? null,
                children: /* @__PURE__ */ jsx25(
                  Input,
                  {
                    id: "produk-min-grosir",
                    name: "min_wholesale_qty",
                    type: "number",
                    min: 1,
                    step: 1,
                    inputMode: "numeric",
                    value: form.data.min_wholesale_qty,
                    disabled: form.processing,
                    error: form.errors.min_wholesale_qty ?? null,
                    onChange: (event) => form.setData("min_wholesale_qty", event.target.value)
                  }
                )
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs20("section", { className: "flex flex-col gap-5 rounded-lg border border-line bg-white p-6", children: [
          /* @__PURE__ */ jsxs20("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx25("h2", { className: "text-h3 font-semibold text-ink", children: "Varian" }),
            /* @__PURE__ */ jsx25("p", { className: "text-meta text-slate-500", children: "Minimal 1 varian. Stok dan harga tambahan per ukuran atau warna." })
          ] }),
          form.errors.variants && /* @__PURE__ */ jsx25(InlineNotice, { tone: "error", title: "Varian belum benar", children: /* @__PURE__ */ jsx25("p", { children: asText2(form.errors.variants) }) }),
          /* @__PURE__ */ jsx25(
            VarianEditor,
            {
              baris: form.data.variants,
              errors: form.errors,
              ukuranBaku: ukuran_baku,
              disabled: form.processing,
              onChange: ubahVarian,
              onTambah: tambahVarian,
              onHapus: hapusVarian
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs20("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxs20("section", { className: "flex flex-col gap-5 rounded-lg border border-line bg-white p-6", children: [
          /* @__PURE__ */ jsx25("h2", { className: "text-h3 font-semibold text-ink", children: "Status & kategori" }),
          /* @__PURE__ */ jsx25(Field, { label: "Kategori", htmlFor: "produk-kategori", required: true, error: form.errors.category_id ?? null, children: /* @__PURE__ */ jsxs20(
            Select,
            {
              id: "produk-kategori",
              name: "category_id",
              value: form.data.category_id,
              disabled: form.processing,
              error: form.errors.category_id ?? null,
              onChange: (event) => form.setData("category_id", event.target.value),
              children: [
                /* @__PURE__ */ jsx25("option", { value: "", children: "Pilih kategori" }),
                kategori.map((item) => /* @__PURE__ */ jsx25("option", { value: item.id, children: asText2(item.name) }, item.id))
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs20("div", { className: "flex flex-col gap-4", children: [
            /* @__PURE__ */ jsxs20("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxs20("label", { htmlFor: "produk-aktif", className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx25(
                  "input",
                  {
                    id: "produk-aktif",
                    name: "is_active",
                    type: "checkbox",
                    className: "mt-0.5 h-4 w-4 shrink-0",
                    checked: asBool(form.data.is_active),
                    disabled: form.processing,
                    "aria-describedby": form.errors.is_active ? "produk-aktif-error" : "produk-aktif-hint",
                    onChange: (event) => form.setData("is_active", event.target.checked)
                  }
                ),
                /* @__PURE__ */ jsxs20("span", { className: "text-body text-ink", children: [
                  "Tampilkan produk di katalog",
                  /* @__PURE__ */ jsx25(
                    "span",
                    {
                      id: "produk-aktif-hint",
                      className: "mt-0.5 block text-meta text-slate-500",
                      children: "Produk nonaktif tidak tampil di halaman publik."
                    }
                  )
                ] })
              ] }),
              form.errors.is_active && /* @__PURE__ */ jsx25("p", { id: "produk-aktif-error", className: "mt-1.5 text-meta text-danger-strong", role: "alert", children: form.errors.is_active })
            ] }),
            /* @__PURE__ */ jsxs20("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxs20("label", { htmlFor: "produk-unggulan", className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx25(
                  "input",
                  {
                    id: "produk-unggulan",
                    name: "is_featured",
                    type: "checkbox",
                    className: "mt-0.5 h-4 w-4 shrink-0",
                    checked: asBool(form.data.is_featured),
                    disabled: form.processing,
                    "aria-describedby": form.errors.is_featured ? "produk-unggulan-error" : "produk-unggulan-hint",
                    onChange: (event) => form.setData("is_featured", event.target.checked)
                  }
                ),
                /* @__PURE__ */ jsxs20("span", { className: "text-body text-ink", children: [
                  "Tandai produk unggulan",
                  /* @__PURE__ */ jsx25(
                    "span",
                    {
                      id: "produk-unggulan-hint",
                      className: "mt-0.5 block text-meta text-slate-500",
                      children: "Produk unggulan tampil di bagian produk unggulan landing page."
                    }
                  )
                ] })
              ] }),
              form.errors.is_featured && /* @__PURE__ */ jsx25(
                "p",
                {
                  id: "produk-unggulan-error",
                  className: "mt-1.5 text-meta text-danger-strong",
                  role: "alert",
                  children: form.errors.is_featured
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs20("section", { className: "flex flex-col gap-5 rounded-lg border border-line bg-white p-6", children: [
          /* @__PURE__ */ jsxs20("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx25("h2", { className: "text-h3 font-semibold text-ink", children: "Galeri" }),
            /* @__PURE__ */ jsxs20("p", { className: "text-meta text-slate-500", children: [
              "Maksimal ",
              MAKS_GAMBAR,
              " gambar per simpan \xB7 2 MB per berkas."
            ] })
          ] }),
          ubah && gambarLama.length > 0 && /* @__PURE__ */ jsx25("ul", { className: "flex flex-col gap-3", children: gambarLama.map((gambar) => /* @__PURE__ */ jsx25(
            GambarLama,
            {
              gambar,
              hapus: hapusIds.includes(gambar.id),
              primary: primaryId === gambar.id,
              disabled: form.processing,
              onMintaHapus: mintaHapusGambar,
              onBatalHapus: batalHapusGambar,
              onPilihPrimary: setPrimaryId
            },
            gambar.id
          )) }),
          ubah && gambarTersisa.length === 0 && /* @__PURE__ */ jsx25("p", { className: "text-meta text-slate-500", children: "Tidak ada gambar lama tersisa. Unggah gambar baru agar produk punya foto." }),
          /* @__PURE__ */ jsx25(
            DropzoneGalery,
            {
              berkas,
              maks: MAKS_GAMBAR,
              disabled: form.processing,
              error: galatGambar.length > 0 ? galatGambar.join(" ") : null,
              onTambah: tambahBerkas,
              onAlt: ubahAlt,
              onHapus: hapusBerkas
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs20("div", { className: "flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4", children: [
      /* @__PURE__ */ jsx25(Button, { variant: "secondary", href: "/admin/produk", disabled: form.processing, children: "Batal" }),
      /* @__PURE__ */ jsx25(Button, { type: "submit", variant: "primary", loading: form.processing, disabled: form.processing, children: "Simpan produk" })
    ] }),
    /* @__PURE__ */ jsx25(
      Modal,
      {
        open: konfirmasiGambar !== null,
        onClose: () => setKonfirmasiGambar(null),
        title: "Hapus gambar ini?",
        description: konfirmasiGambar ? `Gambar ${asText2(konfirmasiGambar.alt) || "tanpa teks alternatif"} akan dihapus saat produk disimpan.` : "",
        footer: /* @__PURE__ */ jsxs20(Fragment4, { children: [
          /* @__PURE__ */ jsx25(Button, { variant: "secondary", onClick: () => setKonfirmasiGambar(null), children: "Batal" }),
          /* @__PURE__ */ jsx25(Button, { variant: "danger", onClick: konfirmasiHapusGambar, children: "Tandai hapus" })
        ] }),
        children: /* @__PURE__ */ jsx25("p", { className: "text-body text-ink-soft", children: "Berkas gambar dihapus permanen dari server saat produk disimpan. Tindakan ini tidak bisa dibatalkan." })
      }
    )
  ] });
}

// resources/js/Pages/Admin/Products/Create.jsx
import { jsx as jsx26, jsxs as jsxs21 } from "react/jsx-runtime";
var BREADCRUMB2 = [{ label: "Dashboard", href: "/admin" }, { label: "Produk", href: "/admin/produk" }, { label: "Tambah produk" }];
function Create({ kategori = [], ukuran_baku = [] }) {
  return /* @__PURE__ */ jsx26(AdminLayout, { title: "Tambah produk", children: /* @__PURE__ */ jsxs21("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsx26(PageHeader, { title: "Tambah produk", breadcrumb: BREADCRUMB2, description: "Isi data produk, harga, varian, dan galeri." }),
    /* @__PURE__ */ jsx26(ProdukForm, { kategori: Array.isArray(kategori) ? kategori : [], ukuran_baku: Array.isArray(ukuran_baku) ? ukuran_baku : [] })
  ] }) });
}

// resources/js/Pages/Admin/Products/Edit.jsx
import React28 from "react";
import { jsx as jsx27, jsxs as jsxs22 } from "react/jsx-runtime";
var BREADCRUMB3 = [
  { label: "Dashboard", href: "/admin" },
  { label: "Produk", href: "/admin/produk" },
  { label: "Ubah produk" }
];
var asText3 = (value) => value === null || value === void 0 ? "" : String(value);
function Edit({ produk = null, kategori = [], ukuran_baku = [] }) {
  if (produk === null) return null;
  return /* @__PURE__ */ jsx27(AdminLayout, { title: `Ubah ${asText3(produk.name)}`, children: /* @__PURE__ */ jsxs22("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsx27(
      PageHeader,
      {
        title: `Ubah ${asText3(produk.name)}`,
        breadcrumb: BREADCRUMB3,
        description: `SKU ${asText3(produk.sku) || "-"} \xB7 ${asText3(produk.category?.name) || "Tanpa kategori"}`
      }
    ),
    /* @__PURE__ */ jsx27(
      ProdukForm,
      {
        produk,
        kategori: Array.isArray(kategori) ? kategori : [],
        ukuran_baku: Array.isArray(ukuran_baku) ? ukuran_baku : []
      }
    )
  ] }) });
}

// resources/js/Pages/Admin/Products/Show.jsx
import React29, { useState as useState7 } from "react";
import { Fragment as Fragment5, jsx as jsx28, jsxs as jsxs23 } from "react/jsx-runtime";
var BREADCRUMB4 = [
  { label: "Dashboard", href: "/admin" },
  { label: "Produk", href: "/admin/produk" },
  { label: "Detail produk" }
];
var asText4 = (value) => value === null || value === void 0 ? "" : String(value);
var asAngka3 = (value) => {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : null;
};
var angkaTeks2 = (value) => {
  const angka = asAngka3(value);
  return angka === null ? "-" : formatNumber(angka);
};
function Baris({ label, children }) {
  return /* @__PURE__ */ jsxs23("div", { className: "flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0", children: [
    /* @__PURE__ */ jsx28("dt", { className: "text-meta text-slate-500", children: label }),
    /* @__PURE__ */ jsx28("dd", { className: "text-right text-body text-ink", children })
  ] });
}
function Show({ produk = null, ringkasan = null }) {
  const [hapus, setHapus] = useState7(false);
  if (produk === null) return null;
  const gambar = Array.isArray(produk.images) ? produk.images : [];
  const varian = Array.isArray(produk.variants) ? produk.variants : [];
  const kolomVarian = [
    { key: "size", header: "Ukuran", render: (baris) => asText4(baris?.size) || "-" },
    { key: "color", header: "Warna", render: (baris) => asText4(baris?.color) || "-" },
    { key: "sku", header: "SKU", render: (baris) => asText4(baris?.sku) || "-" },
    {
      key: "price_delta",
      header: "Harga tambahan",
      align: "right",
      render: (baris) => {
        const delta = asAngka3(baris?.price_delta) ?? 0;
        if (delta === 0) return "Tanpa tambahan";
        return `${delta > 0 ? "+" : "-"}${rupiah(Math.abs(delta)) ?? ""}`;
      }
    },
    {
      key: "stock",
      header: "Stok",
      align: "right",
      render: (baris) => angkaTeks2(baris?.stock)
    },
    {
      key: "is_active",
      header: "Status",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx28(
        StatusBadge,
        {
          status: baris?.is_active ? "aktif" : "nonaktif",
          label: baris?.is_active ? "Aktif" : "Nonaktif"
        }
      )
    }
  ];
  const konfirmasiHapus = () => {
    router.delete(`/admin/produk/${produk.id}`, {
      preserveScroll: true,
      onFinish: () => setHapus(false)
    });
  };
  return /* @__PURE__ */ jsx28(AdminLayout, { title: asText4(produk.name), children: /* @__PURE__ */ jsxs23("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsx28(
      PageHeader,
      {
        title: asText4(produk.name) || "-",
        breadcrumb: BREADCRUMB4,
        description: `SKU ${asText4(produk.sku) || "-"} \xB7 ${asText4(produk.category?.name) || "Tanpa kategori"}`,
        actions: /* @__PURE__ */ jsxs23(Fragment5, { children: [
          /* @__PURE__ */ jsx28(Button, { variant: "secondary", href: "/admin/produk", children: "Kembali" }),
          /* @__PURE__ */ jsx28(Button, { variant: "primary", href: `/admin/produk/${produk.id}/ubah`, children: "Ubah produk" }),
          /* @__PURE__ */ jsx28(Button, { variant: "danger", onClick: () => setHapus(true), children: "Hapus" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs23("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx28(KpiCard, { label: "Jumlah varian", value: angkaTeks2(ringkasan?.varian_total) }),
      /* @__PURE__ */ jsx28(KpiCard, { label: "Total stok", value: angkaTeks2(ringkasan?.stok_total) }),
      /* @__PURE__ */ jsx28(KpiCard, { label: "Varian stok kritis", value: angkaTeks2(ringkasan?.stok_kritis) }),
      /* @__PURE__ */ jsx28(KpiCard, { label: "Terjual", value: angkaTeks2(ringkasan?.terjual) })
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]", children: [
      /* @__PURE__ */ jsxs23("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxs23("section", { className: "flex flex-col gap-4 rounded-lg border border-line bg-white p-6", children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-h3 font-semibold text-ink", children: "Galeri" }),
          gambar.length === 0 ? /* @__PURE__ */ jsx28("p", { className: "text-meta text-slate-500", children: "Produk ini belum punya gambar." }) : /* @__PURE__ */ jsx28("ul", { className: "grid gap-4 sm:grid-cols-3", children: gambar.map((item) => /* @__PURE__ */ jsxs23("li", { className: "flex flex-col gap-2", children: [
            asText4(item.path) === "" ? /* @__PURE__ */ jsx28("span", { className: "flex h-32 items-center justify-center rounded-md border border-line bg-surface text-slate-500", children: /* @__PURE__ */ jsx28(ImageOffIcon, {}) }) : /* @__PURE__ */ jsx28(
              "img",
              {
                src: asText4(item.path),
                alt: asText4(item.alt),
                loading: "lazy",
                className: "h-32 w-full rounded-md border border-line object-cover"
              }
            ),
            /* @__PURE__ */ jsxs23("p", { className: "text-meta text-slate-500", children: [
              item.is_primary ? "Gambar utama" : "Gambar galeri",
              asText4(item.alt) === "" ? " \xB7 teks alternatif belum diisi" : ""
            ] })
          ] }, item.id)) })
        ] }),
        /* @__PURE__ */ jsxs23("section", { className: "flex flex-col gap-3 rounded-lg border border-line bg-white p-6", children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-h3 font-semibold text-ink", children: "Deskripsi" }),
          asText4(produk.short_description) !== "" && /* @__PURE__ */ jsx28("p", { className: "text-body text-ink", children: asText4(produk.short_description) }),
          asText4(produk.description) === "" ? /* @__PURE__ */ jsx28("p", { className: "text-meta text-slate-500", children: "Belum ada deskripsi." }) : /* @__PURE__ */ jsx28("p", { className: "whitespace-pre-line text-body text-ink-soft", children: asText4(produk.description) })
        ] }),
        /* @__PURE__ */ jsxs23("section", { className: "flex flex-col gap-4 rounded-lg border border-line bg-white p-6", children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-h3 font-semibold text-ink", children: "Varian" }),
          /* @__PURE__ */ jsx28(
            DataTable,
            {
              columns: kolomVarian,
              rows: varian,
              emptyTitle: "Belum ada varian",
              emptyDescription: "Tambahkan varian lewat tombol Ubah produk.",
              caption: "Daftar varian produk"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx28("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ jsxs23("section", { className: "rounded-lg border border-line bg-white p-6", children: [
        /* @__PURE__ */ jsx28("h2", { className: "text-h3 font-semibold text-ink", children: "Rincian" }),
        /* @__PURE__ */ jsxs23("dl", { className: "mt-2 flex flex-col", children: [
          /* @__PURE__ */ jsx28(Baris, { label: "Status", children: /* @__PURE__ */ jsxs23("span", { className: "inline-flex flex-wrap items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsx28(
              StatusBadge,
              {
                status: produk.is_active ? "aktif" : "nonaktif",
                label: produk.is_active ? "Aktif" : "Nonaktif"
              }
            ),
            produk.is_featured && /* @__PURE__ */ jsx28(Badge, { tone: "brand", children: "Unggulan" })
          ] }) }),
          /* @__PURE__ */ jsx28(Baris, { label: "Kategori", children: asText4(produk.category?.name) || "-" }),
          /* @__PURE__ */ jsx28(Baris, { label: "Harga jual", children: rupiah(produk.base_price) ?? "-" }),
          /* @__PURE__ */ jsx28(Baris, { label: "Harga coret", children: produk.compare_price === null || produk.compare_price === void 0 ? "-" : rupiah(produk.compare_price) ?? "-" }),
          /* @__PURE__ */ jsx28(Baris, { label: "Harga grosir", children: produk.wholesale_price === null || produk.wholesale_price === void 0 ? "-" : `${rupiah(produk.wholesale_price) ?? "-"} \xB7 min ${angkaTeks2(produk.min_wholesale_qty)} pcs` }),
          /* @__PURE__ */ jsx28(Baris, { label: "Total stok", children: angkaTeks2(produk.stock) }),
          /* @__PURE__ */ jsx28(Baris, { label: "Berat", children: produk.weight_gram === null || produk.weight_gram === void 0 ? "-" : `${formatNumber(produk.weight_gram)} gram` }),
          /* @__PURE__ */ jsx28(Baris, { label: "Slug", children: asText4(produk.slug) || "-" }),
          /* @__PURE__ */ jsx28(Baris, { label: "Tanggal dibuat", children: formatDate(produk.created_at) ?? "-" }),
          /* @__PURE__ */ jsx28(Baris, { label: "Terakhir diperbarui", children: formatDate(produk.updated_at) ?? "-" })
        ] }),
        asText4(produk.url) !== "" && /* @__PURE__ */ jsx28("p", { className: "mt-3 text-meta", children: /* @__PURE__ */ jsx28(
          "a",
          {
            href: asText4(produk.url),
            target: "_blank",
            rel: "noreferrer",
            className: "text-brand underline-offset-2 transition-colors duration-hover hover:underline",
            children: "Lihat halaman publik produk"
          }
        ) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx28(
      Modal,
      {
        open: hapus,
        onClose: () => setHapus(false),
        title: "Hapus produk?",
        description: `Produk "${asText4(produk.name)}" akan dihapus dari katalog.`,
        footer: /* @__PURE__ */ jsxs23(Fragment5, { children: [
          /* @__PURE__ */ jsx28(Button, { variant: "secondary", onClick: () => setHapus(false), children: "Batal" }),
          /* @__PURE__ */ jsx28(Button, { variant: "danger", onClick: konfirmasiHapus, children: "Hapus produk" })
        ] }),
        children: /* @__PURE__ */ jsx28("p", { className: "text-body text-ink-soft", children: "Gambar galeri produk ikut dihapus dari server. Tindakan ini tidak bisa dibatalkan." })
      }
    )
  ] }) });
}

// tmp/render-produk-t_5988a39e.mjs
var KATEGORI = [
  { id: 1, name: "Daster", slug: "daster" },
  { id: 2, name: "Kulot", slug: "kulot" }
];
var UKURAN = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL", "ALL SIZE"];
var BARIS = {
  id: 3,
  name: "Daster Batik Pekalongan",
  slug: "daster-batik-pekalongan",
  sku: "DSR-BTK-01",
  category: { id: 1, name: "Daster", slug: "daster" },
  base_price: 85e3,
  compare_price: 99e3,
  wholesale_price: 75e3,
  min_wholesale_qty: 6,
  is_active: true,
  is_featured: false,
  stock: 24,
  variant_count: 3,
  image: { id: 7, path: "/images/seed/produk/daster-1.png", alt: "Daster Batik Pekalongan" },
  url: "/produk/daster-batik-pekalongan",
  created_at: "2026-10-20T09:15:00+07:00",
  updated_at: "2026-10-20T09:15:00+07:00"
};
var BARIS_TANPA_GAMBAR = {
  id: 4,
  name: "Kulot Jumbo",
  slug: "kulot-jumbo",
  sku: null,
  category: null,
  base_price: "99000",
  compare_price: null,
  wholesale_price: null,
  min_wholesale_qty: null,
  is_active: false,
  is_featured: true,
  stock: 0,
  variant_count: 1,
  image: null,
  url: "/produk/kulot-jumbo",
  created_at: null,
  updated_at: null
};
var PRODUK_INDEX = {
  data: [BARIS, BARIS_TANPA_GAMBAR],
  links: [],
  meta: { current_page: 1, last_page: 2, per_page: 15, total: 17 }
};
var FILTER = { q: null, kategori: null, status: "semua", stok: "semua", urut: "terbaru" };
var RINGKASAN_INDEX = { total: 3, aktif: 3, nonaktif: 0, stok_kritis: 1 };
var DETAIL = {
  id: 3,
  name: "Daster Batik Pekalongan",
  slug: "daster-batik-pekalongan",
  sku: "DSR-BTK-01",
  category_id: 1,
  category: { id: 1, name: "Daster", slug: "daster" },
  short_description: "Daster batik adem",
  description: "Baris satu.\nBaris dua.",
  weight_gram: 300,
  base_price: 85e3,
  compare_price: 99e3,
  wholesale_price: 75e3,
  min_wholesale_qty: 6,
  is_active: true,
  is_featured: false,
  stock: 24,
  variant_count: 3,
  url: "/produk/daster-batik-pekalongan",
  created_at: "2026-10-20T09:15:00+07:00",
  updated_at: "2026-10-20T09:15:00+07:00",
  images: [
    { id: 7, path: "/images/seed/produk/daster-1.png", alt: "Daster depan", is_primary: true, sort_order: 0 },
    { id: 8, path: "/images/seed/produk/daster-2.png", alt: null, is_primary: false, sort_order: 1 }
  ],
  variants: [
    { id: 12, size: "L", color: "Hitam", sku: "DSR-BTK-01-L-HITAM", label: "L / Hitam", price_delta: 0, stock: 10, is_active: true },
    { id: 13, size: "XL", color: null, sku: "DSR-BTK-01-XL", label: "XL", price_delta: "5000", stock: 0, is_active: false }
  ]
};
var KASUS = [
  ["Index \u2014 daftar terisi", Index, { produk: PRODUK_INDEX, filter: FILTER, kategori: KATEGORI, ringkasan: RINGKASAN_INDEX, flash: { success: "Produk dihapus." } }],
  ["Index \u2014 kosong tanpa filter", Index, { produk: { data: [], links: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } }, filter: FILTER, kategori: KATEGORI, ringkasan: { total: 0, aktif: 0, nonaktif: 0, stok_kritis: 0 } }],
  ["Index \u2014 filter aktif tanpa hasil", Index, { produk: { data: [], links: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } }, filter: { q: "batik", kategori: 1, status: "aktif", stok: "kritis", urut: "nama" }, kategori: KATEGORI, ringkasan: RINGKASAN_INDEX }],
  ["Index \u2014 props server hilang", Index, {}],
  ["Create", Create, { kategori: KATEGORI, ukuran_baku: UKURAN }],
  ["Create \u2014 kategori kosong", Create, { kategori: [], ukuran_baku: UKURAN }],
  ["Edit", Edit, { produk: DETAIL, kategori: KATEGORI, ukuran_baku: UKURAN }],
  ["Edit \u2014 tanpa gambar/varian", Edit, { produk: { ...DETAIL, images: [], variants: [] }, kategori: KATEGORI, ukuran_baku: UKURAN }],
  ["Show", Show, { produk: DETAIL, ukuran_baku: UKURAN, ringkasan: { varian_total: 3, stok_total: 24, stok_kritis: 1, terjual: 12 } }],
  ["Show \u2014 ringkasan null", Show, { produk: DETAIL }],
  ["Show \u2014 data null di banyak kolom", Show, { produk: { ...DETAIL, short_description: null, description: null, weight_gram: null, compare_price: null, wholesale_price: null, min_wholesale_qty: null, category: null, slug: null, stock: null, url: null, created_at: null, updated_at: null, images: [], variants: [] }, ringkasan: null }]
];
var HARUS_ADA = {
  "Index \u2014 daftar terisi": ["Daster Batik Pekalongan", "DSR-BTK-01", "Rp", "varian", "Kulot Jumbo", "Tanpa SKU", "Unggulan", "Nonaktif", "Tambah produk", "Menampilkan 2 dari 17 produk", "Produk dihapus."],
  "Index \u2014 kosong tanpa filter": ["Belum ada produk", "Tambah produk"],
  "Index \u2014 filter aktif tanpa hasil": ["Tidak ada produk yang cocok", "Reset filter"],
  "Create": ["Tambah produk", "Informasi produk", "Varian", "Galeri", "Pilih ukuran", "Ukuran *"],
  "Edit": ["Daster Batik Pekalongan", "DSR-BTK-01", "Gambar utama", "Jadikan gambar utama", "L / Hitam".replace("L / Hitam", "L")],
  "Show": ["Daster Batik Pekalongan", "Gambar utama", "Terjual", "Lihat halaman publik produk", "Tanpa tambahan", "XL"]
};
var gagal = 0;
var periksa = (nama, markup, wajib = []) => {
  const masalah = [];
  if (/NaN/.test(markup)) masalah.push("mengandung teks NaN");
  if (/undefined/.test(markup)) masalah.push("mengandung teks undefined");
  if (/\[CONTOH\]|Placeholder|lorem ipsum/i.test(markup)) masalah.push("mengandung teks placeholder");
  if (/<img(?![^>]*\salt=)/.test(markup)) masalah.push("ada <img> tanpa alt");
  if (/text-slate-400/.test(markup)) masalah.push("memakai text-slate-400 (aturan \xA711.4 T1)");
  wajib.forEach((teks) => {
    if (!markup.includes(teks)) masalah.push(`teks wajib hilang: "${teks}"`);
  });
  if (masalah.length > 0) {
    gagal += 1;
    console.log(`GAGAL  ${nama}`);
    masalah.forEach((m) => console.log(`        - ${m}`));
  } else {
    console.log(`OK     ${nama} (${markup.length} karakter)`);
  }
};
KASUS.forEach(([nama, Komponen, props]) => {
  try {
    const markup = renderToStaticMarkup(React30.createElement(Komponen, props));
    periksa(nama, markup, HARUS_ADA[nama] ?? []);
  } catch (error) {
    gagal += 1;
    console.log(`GAGAL  ${nama} -> render melempar: ${error?.message}`);
  }
});
var MARKUP_INDEX = renderToStaticMarkup(React30.createElement(Index, { produk: PRODUK_INDEX, filter: FILTER, kategori: KATEGORI, ringkasan: RINGKASAN_INDEX }));
var MARKUP_DETAIL = renderToStaticMarkup(React30.createElement(Show, { produk: DETAIL, ringkasan: null }));
var tautanWajib = [
  ["/admin/produk/tambah", MARKUP_INDEX],
  ["/admin/produk/3", MARKUP_INDEX],
  ["/admin/produk/3/ubah", MARKUP_INDEX],
  ["/admin/produk/4/ubah", MARKUP_INDEX],
  ["/admin/produk", MARKUP_DETAIL],
  ["/admin/produk/3/ubah", MARKUP_DETAIL]
];
tautanWajib.forEach(([href, markup]) => {
  if (!markup.includes(`href="${href}"`)) {
    gagal += 1;
    console.log(`GAGAL  tautan ${href} tidak ada di markup`);
  } else {
    console.log(`OK     tautan ${href}`);
  }
});
console.log(gagal === 0 ? "\nHASIL: semua kasus lulus" : `
HASIL: ${gagal} masalah`);
process.exit(gagal === 0 ? 0 : 1);
