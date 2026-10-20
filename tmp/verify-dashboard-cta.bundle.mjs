// tmp/verify-dashboard-cta.mjs
import React15 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// resources/js/Pages/Admin/Dashboard.jsx
import React14, { useEffect as useEffect3, useState as useState4 } from "react";

// tmp/inertia-stub-admin-nav.jsx
import React from "react";
var currentUrl = "/admin";
function __setUrl(url) {
  currentUrl = url;
}
function usePage() {
  return {
    props: {
      errors: {},
      auth: { admin: { name: "Admin Uji", email: "admin@contoh.test" } },
      flash: { success: null, error: null }
    },
    url: currentUrl,
    component: "Admin/Products/Index",
    version: null
  };
}
function Head() {
  return null;
}
function Link({ href, children, ...rest }) {
  return /* @__PURE__ */ React.createElement("a", { href: typeof href === "string" ? href : "#", ...rest }, children);
}
var router = { get: () => {
}, post: () => {
}, visit: () => {
}, reload: () => {
} };

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
var toObject = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
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
var Svg = ({ size = 20, className = "", children, filled = false, ...rest }) => /* @__PURE__ */ React2.createElement(
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
    ...rest
  },
  children
);
var CartIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M3 4h2.2l2.1 10.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" }), /* @__PURE__ */ React2.createElement("circle", { cx: "10", cy: "20", r: "1.2" }), /* @__PURE__ */ React2.createElement("circle", { cx: "17.5", cy: "20", r: "1.2" }));
var MenuIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M4 7h16M4 12h16M4 17h16" }));
var CloseIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M6 6l12 12M18 6 6 18" }));
var StarIcon = ({ filled = false, ...props }) => /* @__PURE__ */ React2.createElement(Svg, { filled, ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M12 3.6l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8L12 3.6z" }));
var UserIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "8.5", r: "3.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M4.5 20a7.5 7.5 0 0 1 15 0" }));
var MailIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("rect", { x: "3", y: "5.5", width: "18", height: "13", rx: "2" }), /* @__PURE__ */ React2.createElement("path", { d: "m4 7 8 6 8-6" }));
var AlertIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M12 4.5 21 20H3L12 4.5z" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 10v4" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 17h.01" }));
var ImageOffIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M4 5.5h16v13H4z" }), /* @__PURE__ */ React2.createElement("path", { d: "m4 15 4.5-4.5 4 4 3-3 4.5 4.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M3 3l18 18" }));
var SpinnerIcon = ({ size = 16, className = "" }) => /* @__PURE__ */ React2.createElement(
  "svg",
  {
    className: `animate-spin ${className}`,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
    focusable: "false"
  },
  /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "1.5", opacity: "0.25" }),
  /* @__PURE__ */ React2.createElement("path", { d: "M21 12a9 9 0 0 0-9-9", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
);
var GridIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("rect", { x: "3.5", y: "3.5", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ React2.createElement("rect", { x: "13.5", y: "3.5", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ React2.createElement("rect", { x: "3.5", y: "13.5", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ React2.createElement("rect", { x: "13.5", y: "13.5", width: "7", height: "7", rx: "1.5" }));
var BoxIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M20.5 7.8v8.4a1.5 1.5 0 0 1-.8 1.3l-7 3.7a1.5 1.5 0 0 1-1.4 0l-7-3.7a1.5 1.5 0 0 1-.8-1.3V7.8" }), /* @__PURE__ */ React2.createElement("path", { d: "m3.9 7.1 7.4-3.8a1.5 1.5 0 0 1 1.4 0l7.4 3.8-8.1 4.2Z" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 11.3V20" }));
var LayersIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m12 3.5 8 4-8 4-8-4Z" }), /* @__PURE__ */ React2.createElement("path", { d: "m4 12 8 4 8-4" }), /* @__PURE__ */ React2.createElement("path", { d: "m4 16.5 8 4 8-4" }));
var ArchiveIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("rect", { x: "3.5", y: "4", width: "17", height: "4", rx: "1" }), /* @__PURE__ */ React2.createElement("path", { d: "M5 8v10.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V8" }), /* @__PURE__ */ React2.createElement("path", { d: "M10 12h4" }));
var GearIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React2.createElement("path", { d: "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" }));
var LogOutIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M15 4.5h3A1.5 1.5 0 0 1 19.5 6v12a1.5 1.5 0 0 1-1.5 1.5h-3" }), /* @__PURE__ */ React2.createElement("path", { d: "M10 8 6 12l4 4" }), /* @__PURE__ */ React2.createElement("path", { d: "M6 12h9" }));
var WalletIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("rect", { x: "3", y: "6", width: "18", height: "13", rx: "2.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M3 10.5h18" }), /* @__PURE__ */ React2.createElement("path", { d: "M16.5 15h2" }));
var TrendUpIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m3.5 16.5 5.5-5.5 3.5 3.5 7.5-7.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M15 7h5v5" }));
var TrendDownIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m3.5 7.5 5.5 5.5 3.5-3.5 7.5 7.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M15 17h5v-5" }));
var ChartIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M4 20V4" }), /* @__PURE__ */ React2.createElement("path", { d: "M4 20h16" }), /* @__PURE__ */ React2.createElement("path", { d: "M8 16v-4" }), /* @__PURE__ */ React2.createElement("path", { d: "M12.5 16V8" }), /* @__PURE__ */ React2.createElement("path", { d: "M17 16v-6" }));

// resources/js/Layouts/AdminLayout.jsx
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
  const navList = (onNavigate = null) => /* @__PURE__ */ React3.createElement("ul", { className: "flex flex-1 flex-col gap-1 p-3" }, items.map((item) => {
    const Icon = item.icon ?? GridIcon;
    const active = isActive(url, item.href);
    return /* @__PURE__ */ React3.createElement("li", { key: item.key ?? item.href }, /* @__PURE__ */ React3.createElement(
      Link,
      {
        href: item.href,
        onClick: onNavigate,
        "aria-current": active ? "page" : void 0,
        className: cn(
          "flex h-11 items-center gap-3 rounded-md border-l-[3px] px-3 text-meta transition-colors duration-hover",
          active ? "border-accent-500 bg-white/10 text-white" : "border-transparent text-white/75 hover:bg-white/10 hover:text-white"
        )
      },
      /* @__PURE__ */ React3.createElement(Icon, { size: 18 }),
      item.label
    ));
  }));
  return /* @__PURE__ */ React3.createElement("div", { className: "min-h-screen bg-surface" }, title && /* @__PURE__ */ React3.createElement(Head, { title }), /* @__PURE__ */ React3.createElement("aside", { className: "fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col bg-brand-700 lg:flex" }, /* @__PURE__ */ React3.createElement("div", { className: "flex h-topbar items-center px-4 text-white" }, /* @__PURE__ */ React3.createElement(Link, { href: "/admin", className: "text-label font-semibold uppercase tracking-wide" }, "Daster Kulot")), /* @__PURE__ */ React3.createElement("nav", { "aria-label": "Navigasi admin", className: "flex flex-1 flex-col overflow-y-auto" }, navList())), drawerOpen && /* @__PURE__ */ React3.createElement("div", { className: "fixed inset-0 z-drawer lg:hidden" }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      "aria-label": "Tutup menu",
      onClick: () => setDrawerOpen(false),
      className: "absolute inset-0 h-full w-full bg-ink/40"
    }
  ), /* @__PURE__ */ React3.createElement(
    "div",
    {
      ref: drawerRef,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Navigasi admin",
      className: "animate-drawer-in absolute inset-y-0 left-0 flex w-drawer max-w-[85%] flex-col bg-brand-700"
    },
    /* @__PURE__ */ React3.createElement("div", { className: "flex h-topbar items-center justify-between px-4 text-white" }, /* @__PURE__ */ React3.createElement("span", { className: "text-label font-semibold uppercase tracking-wide" }, "Daster Kulot"), /* @__PURE__ */ React3.createElement(
      "button",
      {
        type: "button",
        onClick: () => setDrawerOpen(false),
        "aria-label": "Tutup menu",
        className: "flex h-touch w-touch items-center justify-center rounded-md text-white/80 transition-colors duration-hover hover:bg-white/10 hover:text-white"
      },
      /* @__PURE__ */ React3.createElement(CloseIcon, { size: 20 })
    )),
    /* @__PURE__ */ React3.createElement("nav", { "aria-label": "Navigasi admin", className: "flex flex-1 flex-col overflow-y-auto" }, navList(() => setDrawerOpen(false)))
  )), /* @__PURE__ */ React3.createElement("div", { className: "lg:pl-sidebar" }, /* @__PURE__ */ React3.createElement("header", { className: "sticky top-0 z-20 flex h-topbar items-center justify-between gap-3 border-b border-line bg-white px-4 lg:px-6" }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      onClick: () => setDrawerOpen(true),
      "aria-label": "Buka menu",
      "aria-expanded": drawerOpen,
      className: "flex h-touch w-touch items-center justify-center rounded-md text-ink transition-colors duration-hover hover:bg-surface lg:hidden"
    },
    /* @__PURE__ */ React3.createElement(MenuIcon, { size: 20 })
  ), /* @__PURE__ */ React3.createElement("p", { className: "hidden text-label font-semibold text-ink lg:block" }, "Panel Admin"), /* @__PURE__ */ React3.createElement("div", { className: "relative", ref: menuRef }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      onClick: () => setMenuOpen((open) => !open),
      "aria-haspopup": "menu",
      "aria-expanded": menuOpen,
      className: "flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-hover hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    },
    /* @__PURE__ */ React3.createElement(
      "span",
      {
        "aria-hidden": "true",
        className: "flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-label font-semibold text-brand"
      },
      initial
    ),
    /* @__PURE__ */ React3.createElement("span", { className: "hidden max-w-[160px] truncate text-meta text-ink sm:block" }, userName)
  ), menuOpen && /* @__PURE__ */ React3.createElement(
    "div",
    {
      role: "menu",
      className: "absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white shadow-raised"
    },
    /* @__PURE__ */ React3.createElement("div", { className: "border-b border-line px-4 py-3" }, /* @__PURE__ */ React3.createElement("p", { className: "truncate text-label font-semibold text-ink" }, userName), userEmail && /* @__PURE__ */ React3.createElement("p", { className: "truncate text-meta text-slate-500" }, userEmail)),
    /* @__PURE__ */ React3.createElement(
      "button",
      {
        type: "button",
        role: "menuitem",
        onClick: logout,
        className: "flex w-full items-center gap-2 px-4 py-3 text-left text-label text-ink transition-colors duration-hover hover:bg-surface"
      },
      /* @__PURE__ */ React3.createElement(LogOutIcon, { size: 16 }),
      "Keluar"
    )
  ))), /* @__PURE__ */ React3.createElement("main", { className: "mx-auto w-full max-w-[1200px] px-4 py-6 lg:px-6" }, children)));
}

// resources/js/Components/Button.jsx
import React4 from "react";
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
  const content = loading ? /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(SpinnerIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Memproses\u2026")) : /* @__PURE__ */ React4.createElement(React4.Fragment, null, icon, /* @__PURE__ */ React4.createElement("span", null, children));
  if (as === "a") {
    return /* @__PURE__ */ React4.createElement("a", { href, className: classes, ...rest }, content);
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ React4.createElement(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest }, content);
  }
  return /* @__PURE__ */ React4.createElement(
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

// resources/js/Components/ChartCard.jsx
import React8, { useId, useState as useState3 } from "react";

// resources/js/Components/EmptyState.jsx
import React5 from "react";
function EmptyState({
  title = "Belum ada data",
  description = null,
  actionLabel = null,
  actionHref = null,
  onAction = null,
  icon = null,
  className = ""
}) {
  return /* @__PURE__ */ React5.createElement("div", { className: cn("flex flex-col items-center gap-3 py-12 text-center", className) }, /* @__PURE__ */ React5.createElement("span", { className: "text-slate-300", "aria-hidden": "true" }, icon ?? /* @__PURE__ */ React5.createElement(ImageOffIcon, { size: 96 })), /* @__PURE__ */ React5.createElement("p", { className: "text-h3 text-ink" }, title), description && /* @__PURE__ */ React5.createElement("p", { className: "max-w-sm text-meta text-slate-500" }, description), actionLabel && onAction && /* @__PURE__ */ React5.createElement(Button, { variant: "secondary", onClick: onAction, className: "mt-2" }, actionLabel), actionLabel && !onAction && actionHref && /* @__PURE__ */ React5.createElement(Button, { variant: "secondary", href: actionHref, className: "mt-2" }, actionLabel));
}

// resources/js/Components/ErrorState.jsx
import React6 from "react";
function ErrorState({
  title = "Gagal memuat data",
  description = "Periksa koneksi Anda lalu coba lagi.",
  onRetry = null,
  supportHref = "/kontak-kami",
  retryLabel = "Coba lagi",
  supportLabel = "Hubungi kami",
  className = ""
}) {
  return /* @__PURE__ */ React6.createElement(
    "div",
    {
      role: "alert",
      className: cn("flex flex-col items-center gap-3 py-12 text-center", className)
    },
    /* @__PURE__ */ React6.createElement("span", { className: "text-danger", "aria-hidden": "true" }, /* @__PURE__ */ React6.createElement(AlertIcon, { size: 48 })),
    /* @__PURE__ */ React6.createElement("p", { className: "text-h3 text-ink" }, title),
    description && /* @__PURE__ */ React6.createElement("p", { className: "max-w-sm text-meta text-slate-500" }, description),
    /* @__PURE__ */ React6.createElement("div", { className: "mt-2 flex flex-wrap items-center justify-center gap-3" }, onRetry && /* @__PURE__ */ React6.createElement(Button, { variant: "primary", onClick: onRetry }, retryLabel), supportHref && /* @__PURE__ */ React6.createElement(Button, { variant: "secondary", href: supportHref }, supportLabel))
  );
}

// resources/js/Components/Skeleton.jsx
import React7 from "react";
var SHAPES = {
  text: "h-3 w-full",
  title: "h-6 w-2/3",
  card: "aspect-square w-full",
  row: "h-tableRow w-full",
  circle: "h-10 w-10 rounded-full"
};
function Skeleton({ variant = "text", count = 1, className = "" }) {
  return Array.from({ length: count }).map((_, index) => /* @__PURE__ */ React7.createElement(
    "div",
    {
      key: index,
      "aria-hidden": "true",
      className: cn("skeleton", SHAPES[variant] ?? SHAPES.text, className)
    }
  ));
}

// resources/js/Components/ChartCard.jsx
var WIDTH = 600;
var HEIGHT = 180;
var PAD_TOP = 12;
var PAD_BOTTOM = 8;
var PAD_X = 8;
var compact = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  if (Math.abs(number) >= 1e6) return `${(number / 1e6).toFixed(1).replace(".", ",")} jt`;
  if (Math.abs(number) >= 1e3) return `${Math.round(number / 1e3)} rb`;
  return String(number);
};
function ChartCard({
  title = "Grafik",
  range = null,
  series = [],
  labels = [],
  type = "area",
  loading = false,
  error = null,
  onRetry = null,
  emptyTitle = "Belum ada penjualan",
  emptyDescription = null,
  emptyActionLabel = null,
  emptyActionHref = null,
  height = HEIGHT,
  valueFormatter = rupiah,
  className = ""
}) {
  const [activeIndex, setActiveIndex] = useState3(null);
  const titleId = useId();
  const values = (Array.isArray(series) ? series : []).map((item) => {
    if (item && typeof item === "object") return item.value ?? null;
    return item;
  });
  const numeric = values.map((value) => {
    const number = Number(value);
    return value === null || value === void 0 || value === "" || !Number.isFinite(number) ? null : number;
  });
  const present = numeric.filter((value) => value !== null);
  const maxValue = present.length > 0 ? Math.max(...present) : 0;
  const total = present.reduce((sum, value) => sum + value, 0);
  const hasData = present.length > 0 && maxValue > 0;
  const axisMax = hasData ? maxValue : 0;
  const count = numeric.length;
  const usableWidth = WIDTH - PAD_X * 2;
  const usableHeight = height - PAD_TOP - PAD_BOTTOM;
  const xAt = (index) => count <= 1 ? WIDTH / 2 : PAD_X + index / (count - 1) * usableWidth;
  const yAt = (value) => PAD_TOP + usableHeight - (axisMax > 0 ? value / axisMax * usableHeight : 0);
  const segments = [];
  let current = [];
  numeric.forEach((value, index) => {
    if (value === null) {
      if (current.length > 0) segments.push(current);
      current = [];
      return;
    }
    current.push({ index, value, x: xAt(index), y: yAt(value) });
  });
  if (current.length > 0) segments.push(current);
  const linePath = (points) => points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const areaPath = (points) => {
    if (points.length === 0) return "";
    const baseline = PAD_TOP + usableHeight;
    return `${linePath(points)} L${points[points.length - 1].x.toFixed(2)} ${baseline} L${points[0].x.toFixed(2)} ${baseline} Z`;
  };
  const labelAt = (index) => {
    if (!Array.isArray(labels) || labels.length === 0) return null;
    return labels[index] ?? null;
  };
  const axisLabels = (() => {
    if (count === 0) return [];
    if (count <= 4) return numeric.map((_, index) => labelAt(index));
    return [labelAt(0), labelAt(Math.floor((count - 1) / 2)), labelAt(count - 1)];
  })();
  const activePoint = activeIndex !== null && numeric[activeIndex] !== null && numeric[activeIndex] !== void 0 ? { x: xAt(activeIndex), value: numeric[activeIndex], label: labelAt(activeIndex) } : null;
  return /* @__PURE__ */ React8.createElement(
    "section",
    {
      className: cn("flex flex-col gap-4 rounded-lg border border-line bg-white p-6", className),
      "aria-labelledby": titleId
    },
    /* @__PURE__ */ React8.createElement("div", { className: "flex flex-wrap items-center justify-between gap-2" }, /* @__PURE__ */ React8.createElement("h2", { id: titleId, className: "text-label font-semibold text-ink" }, title), range && /* @__PURE__ */ React8.createElement("p", { className: "text-meta text-slate-500" }, range)),
    loading && /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col gap-3", "aria-busy": "true" }, /* @__PURE__ */ React8.createElement(Skeleton, { variant: "title", className: "h-4 w-1/4" }), /* @__PURE__ */ React8.createElement(Skeleton, { variant: "text", className: "h-[180px] w-full" })),
    !loading && error && /* @__PURE__ */ React8.createElement(
      ErrorState,
      {
        title: "Gagal memuat grafik",
        description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
        onRetry,
        supportHref: null
      }
    ),
    !loading && !error && !hasData && /* @__PURE__ */ React8.createElement(
      EmptyState,
      {
        title: emptyTitle,
        description: emptyDescription,
        actionLabel: emptyActionLabel,
        actionHref: emptyActionHref,
        icon: /* @__PURE__ */ React8.createElement(ChartIcon, { size: 72 }),
        className: "py-8"
      }
    ),
    !loading && !error && hasData && /* @__PURE__ */ React8.createElement("div", { className: "relative" }, /* @__PURE__ */ React8.createElement(
      "svg",
      {
        role: "img",
        "aria-label": `${title}${range ? ` ${range}` : ""}: total ${valueFormatter(total)}`,
        viewBox: `0 0 ${WIDTH} ${height}`,
        width: "100%",
        height,
        preserveAspectRatio: "none",
        className: "block text-brand",
        onMouseLeave: () => setActiveIndex(null)
      },
      [0, 0.5, 1].map((ratio) => {
        const y = PAD_TOP + usableHeight * ratio;
        return /* @__PURE__ */ React8.createElement(
          "line",
          {
            key: ratio,
            x1: PAD_X,
            x2: WIDTH - PAD_X,
            y1: y,
            y2: y,
            stroke: "currentColor",
            strokeWidth: "1",
            vectorEffect: "non-scaling-stroke",
            className: "text-line",
            "aria-hidden": "true"
          }
        );
      }),
      type === "area" && segments.map((points, index) => /* @__PURE__ */ React8.createElement(
        "path",
        {
          key: `area-${index}`,
          d: areaPath(points),
          fill: "currentColor",
          fillOpacity: "0.12",
          stroke: "none",
          "aria-hidden": "true"
        }
      )),
      segments.map((points, index) => /* @__PURE__ */ React8.createElement(
        "path",
        {
          key: `line-${index}`,
          d: linePath(points),
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          vectorEffect: "non-scaling-stroke",
          "aria-hidden": "true"
        }
      )),
      numeric.map(
        (value, index) => value === null ? null : /* @__PURE__ */ React8.createElement(
          "circle",
          {
            key: `point-${index}`,
            cx: xAt(index),
            cy: yAt(value),
            r: activeIndex === index ? 4 : 2.5,
            fill: "currentColor",
            "aria-hidden": "true"
          }
        )
      ),
      numeric.map(
        (value, index) => value === null ? null : /* @__PURE__ */ React8.createElement(
          "rect",
          {
            key: `hit-${index}`,
            x: xAt(index) - usableWidth / Math.max(count, 1) / 2,
            y: PAD_TOP,
            width: usableWidth / Math.max(count, 1),
            height: usableHeight,
            fill: "transparent",
            onMouseEnter: () => setActiveIndex(index),
            onFocus: () => setActiveIndex(index),
            tabIndex: 0,
            role: "img",
            "aria-label": `${labelAt(index) ?? `Titik ${index + 1}`}: ${valueFormatter(value)}`,
            className: "outline-none"
          }
        )
      )
    ), activePoint && /* @__PURE__ */ React8.createElement(
      "div",
      {
        className: "pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-line bg-white px-2 py-1 text-meta text-ink shadow-raised",
        style: {
          left: `${activePoint.x / WIDTH * 100}%`,
          top: `${activePoint.y / height * 100}%`
        }
      },
      activePoint.label && /* @__PURE__ */ React8.createElement("span", { className: "text-slate-500" }, activePoint.label, " \xB7 "),
      valueFormatter(activePoint.value)
    ), axisLabels.length > 0 && /* @__PURE__ */ React8.createElement("div", { className: "mt-2 flex justify-between text-meta text-slate-500", "aria-hidden": "true" }, axisLabels.map((label, index) => /* @__PURE__ */ React8.createElement("span", { key: index }, label ?? ""))), /* @__PURE__ */ React8.createElement("p", { className: "mt-1 text-meta text-slate-500" }, "Tertinggi ", compact(axisMax)))
  );
}

// resources/js/Components/DataTable.jsx
import React9 from "react";
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
  return /* @__PURE__ */ React9.createElement("div", { className: cn("overflow-hidden rounded-lg border border-line bg-white", className) }, error ? /* @__PURE__ */ React9.createElement(
    ErrorState,
    {
      title: "Gagal memuat data",
      description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
      onRetry,
      supportHref: null
    }
  ) : loading ? /* @__PURE__ */ React9.createElement("div", { className: "flex flex-col", "aria-busy": "true" }, /* @__PURE__ */ React9.createElement("div", { className: "h-tableHead w-full border-b border-line bg-surface", "aria-hidden": "true" }), Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ React9.createElement("div", { key: index, className: "flex items-center gap-4 border-b border-line px-4 last:border-b-0" }, /* @__PURE__ */ React9.createElement(Skeleton, { variant: "row" })))) : !hasRows ? /* @__PURE__ */ React9.createElement(
    EmptyState,
    {
      title: emptyTitle,
      description: emptyDescription,
      actionLabel: emptyActionLabel,
      actionHref: emptyActionHref
    }
  ) : /* @__PURE__ */ React9.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React9.createElement("table", { className: "w-full border-collapse text-meta" }, caption && /* @__PURE__ */ React9.createElement("caption", { className: "sr-only" }, caption), /* @__PURE__ */ React9.createElement("thead", null, /* @__PURE__ */ React9.createElement("tr", { className: "bg-surface" }, columns.map((column) => {
    const isSorted = sort && sort.key === column.key;
    const sortable = Boolean(onSort && column.sortable !== false);
    return /* @__PURE__ */ React9.createElement(
      "th",
      {
        key: column.key,
        scope: "col",
        "aria-sort": isSorted ? sortState(column) : void 0,
        className: cn(
          "h-tableHead whitespace-nowrap border-b border-line px-4 text-label uppercase text-slate-500",
          cellAlign(column)
        )
      },
      sortable ? /* @__PURE__ */ React9.createElement(
        "button",
        {
          type: "button",
          onClick: () => onSort(column.key),
          className: cn(
            "inline-flex items-center gap-1 rounded-sm transition-colors duration-hover hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            isSorted && "text-ink"
          )
        },
        column.header,
        /* @__PURE__ */ React9.createElement("span", { "aria-hidden": "true" }, isSorted ? sort.dir === "desc" ? "\u2193" : "\u2191" : "\u2195")
      ) : column.header
    );
  }))), /* @__PURE__ */ React9.createElement("tbody", null, list.map((row, index) => {
    const clickable = typeof onRowClick === "function";
    return /* @__PURE__ */ React9.createElement(
      "tr",
      {
        key: rowKey(row, index),
        className: cn(
          "h-tableRow border-b border-line last:border-b-0",
          clickable && "cursor-pointer transition-colors duration-hover hover:bg-surface focus-within:bg-surface"
        ),
        onClick: clickable ? () => onRowClick(row, index) : void 0
      },
      columns.map((column) => /* @__PURE__ */ React9.createElement(
        "td",
        {
          key: column.key,
          className: cn("px-4 align-middle text-ink", cellAlign(column))
        },
        column.render ? column.render(row, index) : row?.[column.key] ?? "-"
      ))
    );
  })))));
}

// resources/js/Components/KpiCard.jsx
import React10 from "react";
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
  const body = /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React10.createElement("p", { className: "text-label uppercase text-slate-500" }, label), Icon && /* @__PURE__ */ React10.createElement(
    "span",
    {
      className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand",
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React10.createElement(Icon, { size: 18 })
  )), loading ? /* @__PURE__ */ React10.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ React10.createElement(Skeleton, { variant: "title", className: "h-7 w-3/5" }), /* @__PURE__ */ React10.createElement(Skeleton, { variant: "text", className: "h-3 w-2/5" })) : /* @__PURE__ */ React10.createElement("div", { className: "flex flex-col gap-1" }, /* @__PURE__ */ React10.createElement("p", { className: "text-[28px] font-bold leading-none text-ink" }, shownValue), (hasDelta || deltaLabel) && /* @__PURE__ */ React10.createElement(
    "p",
    {
      className: cn(
        "flex items-center gap-1 text-meta",
        hasDelta && numericDelta > 0 && "text-success-strong",
        hasDelta && numericDelta < 0 && "text-danger-strong",
        (!hasDelta || numericDelta === 0) && "text-ink-soft"
      )
    },
    hasDelta && numericDelta !== 0 && /* @__PURE__ */ React10.createElement(DeltaIcon, { size: 14 }),
    hasDelta && numericDelta !== 0 && /* @__PURE__ */ React10.createElement("span", null, numericDelta > 0 ? "+" : "", numericDelta, "%"),
    deltaLabel && /* @__PURE__ */ React10.createElement("span", { className: "text-slate-500" }, deltaLabel)
  )));
  const base = cn(
    "flex h-full flex-col gap-3 rounded-lg border border-line bg-white p-4 text-left",
    className
  );
  if (loading) {
    return /* @__PURE__ */ React10.createElement("div", { className: base, "aria-busy": "true" }, body);
  }
  if (href) {
    return /* @__PURE__ */ React10.createElement(
      Link,
      {
        href,
        className: cn(
          base,
          "transition-colors duration-hover hover:border-brand/40 hover:bg-surface/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        )
      },
      body
    );
  }
  return /* @__PURE__ */ React10.createElement("div", { className: base }, body);
}

// resources/js/Components/PageHeader.jsx
import React12 from "react";

// resources/js/Components/Breadcrumb.jsx
import React11 from "react";
function Breadcrumb({ items = [], className = "" }) {
  const list = (Array.isArray(items) ? items : []).filter((item) => item && item.label);
  if (list.length === 0) return null;
  const first = list[0];
  const last = list[list.length - 1];
  const middle = list.slice(1, -1);
  const renderItem = (item, isLast) => isLast || !item.href ? /* @__PURE__ */ React11.createElement("span", { className: "text-ink", "aria-current": "page" }, item.label) : /* @__PURE__ */ React11.createElement(Link, { href: item.href, className: "transition-colors duration-hover hover:text-ink" }, item.label);
  return /* @__PURE__ */ React11.createElement("nav", { "aria-label": "Breadcrumb", className: cn("h-12", className) }, /* @__PURE__ */ React11.createElement("ol", { className: "flex h-full items-center gap-2 text-meta text-slate-500" }, /* @__PURE__ */ React11.createElement("li", { className: "flex items-center gap-2" }, renderItem(first, list.length === 1)), list.length > 1 && /* @__PURE__ */ React11.createElement("li", { className: "flex items-center gap-2", "aria-hidden": "true" }, /* @__PURE__ */ React11.createElement("span", null, "/")), middle.length > 0 && /* @__PURE__ */ React11.createElement("li", { className: "flex items-center gap-2 sm:hidden", "aria-hidden": "true" }, /* @__PURE__ */ React11.createElement("span", null, "...")), list.length > 1 && /* @__PURE__ */ React11.createElement("li", { className: "flex items-center gap-2" }, renderItem(last, true))));
}

// resources/js/Components/PageHeader.jsx
function PageHeader({ title = "", breadcrumb = [], actions = null, description = null, className = "" }) {
  return /* @__PURE__ */ React12.createElement("header", { className: cn("flex flex-col gap-3", className) }, breadcrumb.length > 0 && /* @__PURE__ */ React12.createElement(Breadcrumb, { items: breadcrumb }), /* @__PURE__ */ React12.createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" }, /* @__PURE__ */ React12.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React12.createElement("h1", { className: "text-h1 font-bold text-ink" }, title), description && /* @__PURE__ */ React12.createElement("p", { className: "mt-1 text-meta text-slate-500" }, description)), actions && /* @__PURE__ */ React12.createElement("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center" }, actions)));
}

// resources/js/Components/StatusBadge.jsx
import React13 from "react";
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
  return /* @__PURE__ */ React13.createElement(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase",
        CLASSES[tone?.token ?? "neutral"],
        className
      )
    },
    text
  );
}

// resources/js/Pages/Admin/Dashboard.jsx
var numOrNull = (value) => {
  if (value === null || value === void 0 || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
var pickName = (...candidates) => {
  for (const candidate of candidates) {
    if (candidate === null || candidate === void 0 || candidate === "") continue;
    return candidate;
  }
  return null;
};
function Dashboard({ stats = null, sales_14d = null, low_stock = null, recent_orders = null, recent_reviews = null, updated_at = null, loading = false, error = null }) {
  const { auth } = usePage().props;
  const [now, setNow] = useState4(() => Date.now());
  useEffect3(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 6e4);
    return () => window.clearInterval(timer);
  }, []);
  const summary = toObject(stats);
  const reload = () => router.reload();
  const kpiCards = [
    {
      key: "revenue_total",
      label: "Omzet total",
      value: rupiah(numOrNull(summary.revenue_total) ?? 0),
      icon: WalletIcon
    },
    {
      key: "orders_pending",
      label: "Pesanan baru",
      value: formatNumber(numOrNull(summary.orders_pending) ?? 0),
      icon: CartIcon
    },
    {
      key: "orders_total",
      label: "Total pesanan",
      value: formatNumber(numOrNull(summary.orders_total) ?? 0),
      icon: ChartIcon
    },
    {
      key: "products_active",
      label: "Produk aktif",
      value: formatNumber(numOrNull(summary.products_active) ?? 0),
      icon: BoxIcon
    }
  ];
  const hasStats = Object.keys(summary).length > 0;
  const chartSeries = Array.isArray(sales_14d) ? sales_14d.map((item) => numOrNull(item && typeof item === "object" ? item.total : item)) : [];
  const chartLabels = Array.isArray(sales_14d) ? sales_14d.map((item) => item && typeof item === "object" ? formatDate(item.date) : null) : [];
  const stockRows = Array.isArray(low_stock) ? low_stock : [];
  const orderRows = Array.isArray(recent_orders) ? recent_orders : [];
  const reviewRows = Array.isArray(recent_reviews) ? recent_reviews : [];
  const updatedLabel = (() => {
    if (!updated_at) return null;
    const stamp = new Date(updated_at);
    if (Number.isNaN(stamp.getTime())) return null;
    const minutes = Math.max(0, Math.floor((now - stamp.getTime()) / 6e4));
    if (minutes < 5) return null;
    if (minutes < 60) return `Diperbarui ${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Diperbarui ${hours} jam lalu`;
    return `Diperbarui ${Math.floor(hours / 24)} hari lalu`;
  })();
  const orderColumns = [
    {
      key: "code",
      header: "Kode",
      render: (row) => /* @__PURE__ */ React14.createElement("span", { className: "font-semibold text-ink" }, pickName(row?.code, row?.order_code, "-"))
    },
    {
      key: "customer_name",
      header: "Pembeli",
      render: (row) => pickName(row?.customer_name, row?.buyer_name, "-")
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (row) => rupiah(numOrNull(row?.total) ?? 0)
    },
    {
      key: "status",
      header: "Status",
      render: (row) => /* @__PURE__ */ React14.createElement(StatusBadge, { status: row?.status ?? null })
    },
    {
      key: "created_at",
      header: "Tanggal",
      align: "right",
      render: (row) => formatDate(row?.created_at)
    }
  ];
  return /* @__PURE__ */ React14.createElement(AdminLayout, { auth }, /* @__PURE__ */ React14.createElement("div", { className: "flex flex-col gap-6" }, /* @__PURE__ */ React14.createElement(
    PageHeader,
    {
      title: "Dashboard",
      breadcrumb: [{ label: "Dashboard" }],
      description: updatedLabel,
      actions: /* @__PURE__ */ React14.createElement(Button, { variant: "secondary", onClick: reload, loading }, "Muat ulang")
    }
  ), error && /* @__PURE__ */ React14.createElement(
    ErrorState,
    {
      title: "Gagal memuat ringkasan",
      description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
      onRetry: reload,
      supportHref: null
    }
  ), !error && /* @__PURE__ */ React14.createElement("section", { "aria-label": "Ringkasan", className: "grid grid-cols-2 gap-4 lg:grid-cols-4" }, kpiCards.map((card) => /* @__PURE__ */ React14.createElement(
    KpiCard,
    {
      key: card.key,
      label: card.label,
      value: card.value,
      icon: card.icon,
      loading: loading || !hasStats
    }
  ))), /* @__PURE__ */ React14.createElement("div", { className: "grid gap-4 lg:grid-cols-3" }, /* @__PURE__ */ React14.createElement(
    ChartCard,
    {
      title: "Penjualan 14 hari",
      range: "14 hari terakhir",
      series: chartSeries,
      labels: chartLabels,
      loading,
      error,
      onRetry: reload,
      emptyTitle: "Belum ada penjualan",
      emptyDescription: "Grafik muncul setelah ada pesanan yang dibayar.",
      emptyActionLabel: "Tambah produk",
      emptyActionHref: "/admin/produk/tambah",
      className: "lg:col-span-2"
    }
  ), /* @__PURE__ */ React14.createElement(
    "section",
    {
      "aria-label": "Stok kritis",
      className: "flex flex-col gap-4 rounded-lg border border-line bg-white p-6"
    },
    /* @__PURE__ */ React14.createElement("h2", { className: "text-label font-semibold text-ink" }, "Stok kritis"),
    error ? /* @__PURE__ */ React14.createElement(
      ErrorState,
      {
        description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
        onRetry: reload,
        supportHref: null,
        className: "py-6"
      }
    ) : stockRows.length === 0 ? /* @__PURE__ */ React14.createElement(
      EmptyState,
      {
        title: "Stok aman",
        description: "Tidak ada varian dengan stok menipis.",
        className: "py-6"
      }
    ) : /* @__PURE__ */ React14.createElement("ul", { className: "flex flex-col divide-y divide-line" }, stockRows.map((row, index) => /* @__PURE__ */ React14.createElement("li", { key: row?.id ?? index, className: "flex items-center justify-between gap-3 py-3" }, /* @__PURE__ */ React14.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React14.createElement("p", { className: "truncate text-label text-ink" }, pickName(row?.product_name, row?.product?.name, "-")), /* @__PURE__ */ React14.createElement("p", { className: "text-meta text-slate-500" }, [row?.size, row?.color].filter(Boolean).join(" \xB7 ") || "-")), /* @__PURE__ */ React14.createElement("span", { className: "shrink-0 text-meta font-semibold text-danger-strong" }, formatNumber(numOrNull(row?.stock) ?? 0)))))
  )), /* @__PURE__ */ React14.createElement("section", { "aria-label": "Pesanan terbaru", className: "flex flex-col gap-3" }, /* @__PURE__ */ React14.createElement("h2", { className: "text-label font-semibold text-ink" }, "Pesanan terbaru"), /* @__PURE__ */ React14.createElement(
    DataTable,
    {
      columns: orderColumns,
      rows: orderRows,
      loading,
      error,
      onRetry: reload,
      emptyTitle: "Belum ada pesanan",
      emptyDescription: "Pesanan masuk akan tampil di sini."
    }
  )), /* @__PURE__ */ React14.createElement("section", { "aria-label": "Ulasan terbaru", className: "flex flex-col gap-3" }, /* @__PURE__ */ React14.createElement("h2", { className: "text-label font-semibold text-ink" }, "Ulasan terbaru"), error ? /* @__PURE__ */ React14.createElement("div", { className: "rounded-lg border border-line bg-white" }, /* @__PURE__ */ React14.createElement(
    ErrorState,
    {
      description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
      onRetry: reload,
      supportHref: null,
      className: "py-8"
    }
  )) : reviewRows.length === 0 ? /* @__PURE__ */ React14.createElement("div", { className: "rounded-lg border border-line bg-white" }, /* @__PURE__ */ React14.createElement(
    EmptyState,
    {
      title: "Belum ada ulasan",
      description: "Ulasan pembeli tampil setelah pesanan selesai.",
      icon: /* @__PURE__ */ React14.createElement(StarIcon, { size: 72 }),
      className: "py-8"
    }
  )) : /* @__PURE__ */ React14.createElement("ul", { className: "flex flex-col gap-3" }, reviewRows.map((row, index) => /* @__PURE__ */ React14.createElement(
    "li",
    {
      key: row?.id ?? index,
      className: "flex flex-col gap-2 rounded-lg border border-line bg-white p-4"
    },
    /* @__PURE__ */ React14.createElement("div", { className: "flex flex-wrap items-center justify-between gap-2" }, /* @__PURE__ */ React14.createElement("p", { className: "text-label font-semibold text-ink" }, pickName(row?.user_name, row?.user?.name, "Pembeli")), /* @__PURE__ */ React14.createElement("p", { className: "flex items-center gap-1 text-meta text-warning-strong" }, /* @__PURE__ */ React14.createElement(StarIcon, { size: 14 }), formatNumber(numOrNull(row?.rating) ?? 0), "/5")),
    /* @__PURE__ */ React14.createElement("p", { className: "whitespace-pre-line text-meta text-ink" }, pickName(row?.comment, "Tanpa komentar")),
    /* @__PURE__ */ React14.createElement("p", { className: "text-meta text-slate-500" }, pickName(row?.product_name, row?.product?.name, "-"), " \xB7", " ", formatDateTime(row?.created_at))
  ))))));
}

// tmp/verify-dashboard-cta.mjs
var CTA_LABEL = "Tambah produk";
var CTA_HREF = "/admin/produk/tambah";
var EMPTY_TITLE = "Belum ada penjualan";
var RETRY_LABEL = "Coba lagi";
var checks = 0;
var failures = 0;
var ok = (label) => {
  checks += 1;
  console.log(`  ok   ${label}`);
};
var fail = (label, detail) => {
  checks += 1;
  failures += 1;
  console.log(`  FAIL ${label}${detail ? ` -> ${detail}` : ""}`);
};
var assert = (condition, label, detail = null) => condition ? ok(label) : fail(label, detail);
var textOf = (fragment) => fragment.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
var anchors = (html) => [...html.matchAll(/<a\s([^>]*)>([\s\S]*?)<\/a>/g)].map((match) => ({
  href: (/href="([^"]*)"/.exec(match[1]) ?? [])[1] ?? null,
  className: (/class="([^"]*)"/.exec(match[1]) ?? [])[1] ?? "",
  text: textOf(match[2])
}));
var render = (props) => {
  __setUrl("/admin");
  return renderToStaticMarkup(React15.createElement(Dashboard, props));
};
var sales = (totals) => totals.map((total, index) => ({ date: `2026-10-${String(index + 1).padStart(2, "0")}`, total }));
var STATS = { revenue_total: 125e4, orders_pending: 3, orders_total: 12, products_active: 4 };
var scenario = (label, props) => {
  const html = render(props);
  const cta = anchors(html).filter((anchor) => anchor.text === CTA_LABEL);
  console.log(`
${label}`);
  return { html, cta };
};
var checkNoNoise = (html, label) => {
  assert(!/NaN/.test(html), `${label}: tidak ada NaN di markup`);
  assert(!/undefined/.test(html), `${label}: tidak ada undefined di markup`);
  assert(!/\[CONTOH\]|lorem ipsum|Placeholder/i.test(html), `${label}: tidak ada teks placeholder`);
};
var hasChartGraphics = (html) => html.includes('viewBox="0 0 600 180"') || html.includes("Tertinggi");
var chartBlock = (html) => {
  const start = html.indexOf("Penjualan 14 hari");
  if (start === -1) return "";
  const end = html.indexOf("Stok kritis", start);
  return end === -1 ? html.slice(start) : html.slice(start, end);
};
var occurrences = (html, needle) => html.split(needle).length - 1;
var blockBetween = (html, startText, endText = null) => {
  const start = html.indexOf(startText);
  if (start === -1) return "";
  if (!endText) return html.slice(start);
  const end = html.indexOf(endText, start + startText.length);
  return end === -1 ? html.slice(start) : html.slice(start, end);
};
var snippet = (html) => textOf(html).slice(0, 200);
console.log("Harness Dashboard admin \u2014 CTA empty state grafik penjualan (t_099c813c)");
console.log('Design \xA75.11: empty = "Belum ada penjualan" + CTA tambah produk.\n');
console.log("1. State empty grafik");
{
  const { html, cta } = scenario("   (a) sales_14d = []", { stats: STATS, sales_14d: [], loading: false });
  assert(html.includes(EMPTY_TITLE), 'judul empty "Belum ada penjualan" tampil');
  assert(cta.length === 1, 'CTA "Tambah produk" muncul tepat 1 kali di grafik', `dapat ${cta.length}`);
  assert(cta[0]?.href === CTA_HREF, `CTA menunjuk ${CTA_HREF}`, `dapat ${cta[0]?.href ?? "(tidak ada)"}`);
  assert(/btn-secondary/.test(cta[0]?.className ?? ""), "CTA memakai tombol variant secondary (design \xA7406 EmptyState)", cta[0]?.className ?? "(tidak ada)");
  assert(/href="\/admin\/produk\/tambah"/.test(html), "lihat juga pemeriksaan anchor (atribut href mentah)");
  assert(!hasChartGraphics(html), "grafik tidak digambar saat tidak ada data");
  checkNoNoise(html, "empty (a)");
}
{
  const { html, cta } = scenario("   (b) sales_14d = 14 hari semua total 0", {
    stats: STATS,
    sales_14d: sales(Array.from({ length: 14 }, () => 0)),
    loading: false
  });
  assert(html.includes(EMPTY_TITLE), 'judul empty "Belum ada penjualan" tampil');
  assert(cta.length === 1, 'CTA "Tambah produk" muncul tepat 1 kali', `dapat ${cta.length}`);
  assert(cta[0]?.href === CTA_HREF, `CTA menunjuk ${CTA_HREF}`, `dapat ${cta[0]?.href ?? "(tidak ada)"}`);
  assert(!hasChartGraphics(html), "grafik tidak digambar saat semua nol");
  checkNoNoise(html, "empty (b)");
}
{
  const { html, cta } = scenario('   (c) sales_14d = 14 hari total "0" (string dari server)', {
    stats: { revenue_total: "0", orders_pending: "0", orders_total: "0", products_active: "4" },
    sales_14d: sales(Array.from({ length: 14 }, () => "0")),
    loading: false
  });
  assert(html.includes(EMPTY_TITLE), 'judul empty "Belum ada penjualan" tampil');
  assert(cta.length === 1, 'CTA "Tambah produk" muncul tepat 1 kali', `dapat ${cta.length}`);
  checkNoNoise(html, "empty (c)");
}
console.log("\n2. State ada data (CTA tidak boleh tampil)");
{
  const { html, cta } = scenario("   sales_14d = 14 hari dengan penjualan", {
    stats: STATS,
    sales_14d: sales([0, 25e4, 175e3, null, 32e4, 9e4, 0, 41e4, 275e3, 12e4, 98e3, 26e4, 331e3, 155e3]),
    loading: false
  });
  assert(!html.includes(EMPTY_TITLE), "judul empty tidak tampil saat ada data");
  assert(cta.length === 0, 'CTA "Tambah produk" TIDAK tampil saat ada data', `dapat ${cta.length}`);
  assert(hasChartGraphics(html), "grafik digambar saat ada data");
  assert(html.includes("Tertinggi"), "label ringkasan sumbu tampil");
  checkNoNoise(html, "ada data");
}
console.log("\n3. State loading (skeleton, belum ada CTA)");
{
  const { html, cta } = scenario("   loading = true", { stats: null, sales_14d: null, loading: true });
  assert(cta.length === 0, 'CTA "Tambah produk" TIDAK tampil saat loading', `dapat ${cta.length}`);
  assert(!html.includes(EMPTY_TITLE), "judul empty tidak tampil saat loading");
  checkNoNoise(html, "loading");
}
console.log("\n4. State error halaman \u2014 error per blok (design \xA75.11, kartu t_8bca0661 + t_950a38ca)");
{
  const { html, cta } = scenario('   error = "koneksi gagal"', {
    stats: null,
    sales_14d: null,
    loading: false,
    error: "koneksi gagal"
  });
  assert(html.includes("Gagal memuat ringkasan"), "galat tampil sebagai ErrorState di dalam layout");
  assert(html.includes("koneksi gagal"), "pesan galat dari server ditampilkan apa adanya");
  const chart = chartBlock(html);
  const retryCount = occurrences(html, RETRY_LABEL);
  const retryButtons = occurrences(html, `<span>${RETRY_LABEL}</span>`);
  const retryLinks = anchors(html).filter((anchor) => anchor.text === RETRY_LABEL);
  const chartAnchors = anchors(chart);
  assert(chart.length > 0, "blok grafik dapat diisolasi dari markup untuk diperiksa");
  assert(chart.includes("Gagal memuat grafik"), "blok grafik menampilkan galat sendiri, bukan empty state", snippet(chart));
  assert(chart.includes("koneksi gagal"), "pesan galat halaman tampil juga di blok grafik");
  assert(chart.includes(RETRY_LABEL), `blok grafik punya aksi "${RETRY_LABEL}" (onRetry diteruskan)`, snippet(chart));
  assert(retryCount === 5, `"${RETRY_LABEL}" tampil 5 kali: ringkasan halaman + 4 blok (grafik, stok kritis, pesanan, ulasan)`, `dapat ${retryCount}`);
  assert(retryButtons === 5, `kelima aksi "${RETRY_LABEL}" dirender sebagai tombol (bukan tautan)`, `dapat ${retryButtons}`);
  assert(retryLinks.length === 0, `tidak ada "${RETRY_LABEL}" berbentuk tautan tanpa aksi`, `dapat ${retryLinks.length}`);
  assert(occurrences(html, "Gagal memuat data") === 3, 'tiga blok (stok kritis, pesanan terbaru, ulasan terbaru) memakai judul galat baku "Gagal memuat data" (design \xA7442)', `dapat ${occurrences(html, "Gagal memuat data")}`);
  assert(!chart.includes(EMPTY_TITLE), `judul empty "${EMPTY_TITLE}" TIDAK tampil saat galat`, snippet(chart));
  assert(cta.length === 0, `CTA "${CTA_LABEL}" TIDAK tampil saat galat (galat bukan data kosong)`, `dapat ${cta.length}`);
  assert(!hasChartGraphics(chart), "grafik tidak digambar saat galat");
  assert(chartAnchors.length === 0, "blok grafik pada state galat tidak menyisakan tautan CTA/empty", `dapat ${chartAnchors.length}`);
  assert(!/<svg[^>]*viewBox="0 0 600 180"/.test(chart), "tidak ada grafik kosong yang menyesatkan di blok grafik");
  checkNoNoise(html, "error");
}
console.log("\n4b. Tiga blok lain pada state galat (kartu t_950a38ca)");
{
  const { html } = scenario('   error = "koneksi gagal" (blok diisolasi satu per satu)', {
    stats: null,
    sales_14d: null,
    low_stock: null,
    recent_orders: null,
    recent_reviews: null,
    loading: false,
    error: "koneksi gagal"
  });
  const blocks = [
    { label: "Stok kritis", start: "Stok kritis", end: "Pesanan terbaru", emptyTitle: "Stok aman", bodyMarkup: "<ul" },
    { label: "Pesanan terbaru (DataTable)", start: "Pesanan terbaru", end: "Ulasan terbaru", emptyTitle: "Belum ada pesanan", bodyMarkup: "<table" },
    { label: "Ulasan terbaru", start: "Ulasan terbaru", end: null, emptyTitle: "Belum ada ulasan", bodyMarkup: "<ul" }
  ];
  blocks.forEach(({ label, start, end, emptyTitle, bodyMarkup }) => {
    const block = blockBetween(html, start, end);
    assert(block.length > 0, `blok "${label}" dapat diisolasi dari markup`, snippet(block));
    assert(block.includes('role="alert"'), `blok "${label}" merender ErrorState (role="alert")`, snippet(block));
    assert(block.includes("Gagal memuat data"), `blok "${label}" menampilkan judul galat baku, bukan empty state`, snippet(block));
    assert(block.includes("koneksi gagal"), `pesan galat halaman tampil di blok "${label}"`);
    assert(block.includes(RETRY_LABEL), `blok "${label}" punya aksi "${RETRY_LABEL}" (onRetry diteruskan)`, snippet(block));
    assert(!block.includes(emptyTitle), `empty state "${emptyTitle}" TIDAK tampil di blok "${label}" saat galat`, snippet(block));
    assert(!block.includes(bodyMarkup), `blok "${label}" tidak menggambar daftar/tabel data saat galat`, snippet(block));
    assert(anchors(block).length === 0, `blok "${label}" tidak menyisakan tautan (termasuk CTA empty state)`, snippet(block));
  });
  console.log(`   cuplikan blok stok kritis    : ${snippet(blockBetween(html, "Stok kritis", "Pesanan terbaru"))}`);
  console.log(`   cuplikan blok pesanan        : ${snippet(blockBetween(html, "Pesanan terbaru", "Ulasan terbaru"))}`);
  console.log(`   cuplikan blok ulasan         : ${snippet(blockBetween(html, "Ulasan terbaru", null))}`);
}
console.log("\n5. Interaksi tombol lain tidak ikut berubah");
{
  const { html } = scenario("   empty state lain (stok/pesanan/ulasan)", { stats: STATS, sales_14d: [], loading: false });
  assert(html.includes("Stok aman"), 'empty state "Stok aman" (stok kritis) tetap ada');
  assert(html.includes("Belum ada pesanan"), 'empty state "Belum ada pesanan" tetap ada');
  assert(html.includes("Belum ada ulasan"), 'empty state "Belum ada ulasan" tetap ada');
  assert(html.includes("Muat ulang"), 'aksi "Muat ulang" di PageHeader tetap ada');
  assert(anchors(html).every((anchor) => anchor.text !== "Muat ulang"), 'aksi "Muat ulang" tetap tombol, bukan tautan');
  const sameLabel = anchors(html).filter((anchor) => anchor.text === CTA_LABEL);
  assert(sameLabel.length === 1, `label "${CTA_LABEL}" hanya muncul sekali di halaman`, `dapat ${sameLabel.length}`);
}
console.log(`
HASIL: ${checks - failures}/${checks} lulus, ${failures} gagal`);
process.exit(failures === 0 ? 0 : 1);
