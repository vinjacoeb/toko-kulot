// tmp/verify-admin-nav.mjs
import React4 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// resources/js/Layouts/AdminLayout.jsx
import React3, { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";

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

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");

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
var GridIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("rect", { x: "3.5", y: "3.5", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ React2.createElement("rect", { x: "13.5", y: "3.5", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ React2.createElement("rect", { x: "3.5", y: "13.5", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ React2.createElement("rect", { x: "13.5", y: "13.5", width: "7", height: "7", rx: "1.5" }));
var BoxIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M20.5 7.8v8.4a1.5 1.5 0 0 1-.8 1.3l-7 3.7a1.5 1.5 0 0 1-1.4 0l-7-3.7a1.5 1.5 0 0 1-.8-1.3V7.8" }), /* @__PURE__ */ React2.createElement("path", { d: "m3.9 7.1 7.4-3.8a1.5 1.5 0 0 1 1.4 0l7.4 3.8-8.1 4.2Z" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 11.3V20" }));
var LayersIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m12 3.5 8 4-8 4-8-4Z" }), /* @__PURE__ */ React2.createElement("path", { d: "m4 12 8 4 8-4" }), /* @__PURE__ */ React2.createElement("path", { d: "m4 16.5 8 4 8-4" }));
var ArchiveIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("rect", { x: "3.5", y: "4", width: "17", height: "4", rx: "1" }), /* @__PURE__ */ React2.createElement("path", { d: "M5 8v10.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V8" }), /* @__PURE__ */ React2.createElement("path", { d: "M10 12h4" }));
var GearIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React2.createElement("path", { d: "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" }));
var LogOutIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M15 4.5h3A1.5 1.5 0 0 1 19.5 6v12a1.5 1.5 0 0 1-1.5 1.5h-3" }), /* @__PURE__ */ React2.createElement("path", { d: "M10 8 6 12l4 4" }), /* @__PURE__ */ React2.createElement("path", { d: "M6 12h9" }));

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

// tmp/verify-admin-nav.mjs
var ANCHOR = /<a\s([^>]*)>/g;
var ATTR = (tag, name) => {
  const match = new RegExp(`${name}="([^"]*)"`).exec(tag);
  return match ? match[1] : null;
};
var failures = 0;
var checks = 0;
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
var isNavItem = (anchor) => anchor.includes("h-11 items-center gap-3");
var renderNav = (url) => {
  __setUrl(url);
  const html = renderToStaticMarkup(React4.createElement(AdminLayout, { title: "Uji" }, React4.createElement("p", null, "konten")));
  const anchors = [...html.matchAll(ANCHOR)].map((m) => `href="${ATTR(m[1], "href")}" ${m[1]}`);
  return { html, anchors };
};
console.log("1. ADMIN_NAV (sumber tunggal nav admin)");
var HARAPAN = [
  ["dashboard", "/admin"],
  ["produk", "/admin/produk"],
  ["kategori", "/admin/kategori"],
  ["stok", "/admin/stok"],
  ["pesanan", "/admin/pesanan"],
  ["pesan", "/admin/pesan-masuk"],
  ["penilaian", "/admin/penilaian"],
  ["pengaturan", "/admin/pengaturan"],
  ["akun", "/admin/akun"]
];
assert(ADMIN_NAV.length === HARAPAN.length, `jumlah item nav = ${HARAPAN.length}`, `dapat ${ADMIN_NAV.length}`);
for (const [key, href] of HARAPAN) {
  const item = ADMIN_NAV.find((i) => i.key === key);
  assert(!!item, `item ${key} ada`);
  if (!item) continue;
  assert(item.href === href, `item ${key} -> ${href}`, `dapat ${item.href}`);
  assert(!item.disabled, `item ${key} tidak disabled`, `disabled=${item.disabled}`);
  assert(typeof item.icon === "function" || typeof item.icon === "object", `item ${key} punya ikon`);
}
console.log("2. Render per halaman (design \xA75.10)");
var KASUS = [
  ["/admin", "dashboard"],
  ["/admin/", "dashboard"],
  ["/admin/produk", "produk"],
  ["/admin/produk/tambah", "produk"],
  ["/admin/produk?page=2", "produk"],
  ["/admin/kategori", "kategori"],
  ["/admin/stok", "stok"],
  ["/admin/stok/riwayat", "stok"],
  ["/admin/pesanan", "pesanan"],
  ["/admin/pesanan/12", "pesanan"],
  ["/admin/pesan-masuk", "pesan"],
  ["/admin/penilaian", "penilaian"],
  ["/admin/pengaturan", "pengaturan"],
  ["/admin/akun", "akun"]
];
for (const [url, aktif] of KASUS) {
  const { html, anchors } = renderNav(url);
  const aktifHref = HARAPAN.find(([key]) => key === aktif)[1];
  const tautanNav = anchors.filter(isNavItem);
  assert(tautanNav.length === HARAPAN.length, `${url}: ${HARAPAN.length} tautan nav dirender`, `dapat ${tautanNav.length}`);
  assert(!html.includes("aria-disabled"), `${url}: tanpa item aria-disabled`);
  assert(!/<a[^>]*href="#"/.test(html), `${url}: tanpa href kosong`);
  assert(HARAPAN.every(([, href]) => tautanNav.some((a) => a.startsWith(`href="${href}" `))), `${url}: semua 9 tautan modul ada`);
  const current = tautanNav.filter((a) => a.includes('aria-current="page"'));
  assert(current.length === 1, `${url}: tepat satu item tersorot`, `dapat ${current.length}`);
  assert(current[0]?.startsWith(`href="${aktifHref}" `), `${url}: penyorotan di ${aktifHref}`, `dapat ${current[0] ?? "-"}`);
  assert(!!current[0]?.includes("border-accent-500"), `${url}: penyorot pakai border-accent-500`);
  assert(!!current[0]?.includes("bg-white/10"), `${url}: penyorot pakai bg-white/10`);
  assert(!!current[0]?.includes("text-white"), `${url}: penyorot teks putih`);
  const lain = tautanNav.filter((a) => !a.includes('aria-current="page"'));
  assert(lain.every((a) => a.includes("border-transparent")), `${url}: item lain border-transparent (tanpa geser tata letak)`);
}
console.log("3. Prop `nav` per halaman masih diterima");
{
  const nav = ADMIN_NAV.map((item) => ({ ...item, disabled: false }));
  __setUrl("/admin/pesan-masuk");
  const html = renderToStaticMarkup(
    React4.createElement(AdminLayout, { nav, title: "Uji" }, React4.createElement("p", null, "konten"))
  );
  const anchors = [...html.matchAll(ANCHOR)].map((m) => `href="${ATTR(m[1], "href")}" ${m[1]}`);
  assert(anchors.filter(isNavItem).length === HARAPAN.length, "nav kustom dari halaman tetap dirender", `dapat ${anchors.filter(isNavItem).length}`);
  assert(!html.includes("aria-disabled"), "nav kustom tanpa aria-disabled");
}
console.log(`
${failures === 0 ? "LULUS" : "GAGAL"}: ${checks - failures}/${checks} pemeriksaan lolos`);
process.exit(failures === 0 ? 0 : 1);
