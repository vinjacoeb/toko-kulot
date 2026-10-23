// tmp/verify-header-footer.mjs
import React9 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// tmp/inertia-stub-header-footer.jsx
import React from "react";
var currentProps = {
  settings: {},
  auth: { user: null },
  cart: { count: 0 },
  flash: { success: null, error: null },
  errors: {}
};
function __setProps(next) {
  currentProps = next;
}
function usePage() {
  return {
    props: currentProps,
    url: "/",
    component: "Public/Home",
    version: null
  };
}
function Link({ href, children, ...rest }) {
  return /* @__PURE__ */ React.createElement("a", { href: typeof href === "string" ? href : "#", ...rest }, children);
}
var router = { get: () => {
}, post: () => {
}, visit: () => {
}, reload: () => {
} };

// resources/js/Layouts/PublicLayout.jsx
import React8, { useState as useState3 } from "react";

// resources/js/Components/Announcement.jsx
import React2 from "react";
function Announcement({ text = null, href = null }) {
  if (!text) return null;
  const content = /* @__PURE__ */ React2.createElement("span", { className: "text-meta text-white" }, text);
  return /* @__PURE__ */ React2.createElement("div", { className: "flex h-9 items-center justify-center bg-brand-700 px-4 text-center" }, href ? /* @__PURE__ */ React2.createElement(Link, { href, className: "underline-offset-4 hover:underline" }, content) : content);
}

// resources/js/Components/Footer.jsx
import React4 from "react";

// resources/js/Components/icons.jsx
import React3 from "react";
var Svg = ({ size = 20, className = "", children, filled = false, ...rest }) => /* @__PURE__ */ React3.createElement(
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
var SearchIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("circle", { cx: "11", cy: "11", r: "7" }), /* @__PURE__ */ React3.createElement("path", { d: "m20.5 20.5-3.9-3.9" }));
var CartIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M3 4h2.2l2.1 10.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" }), /* @__PURE__ */ React3.createElement("circle", { cx: "10", cy: "20", r: "1.2" }), /* @__PURE__ */ React3.createElement("circle", { cx: "17.5", cy: "20", r: "1.2" }));
var MenuIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M4 7h16M4 12h16M4 17h16" }));
var CloseIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M6 6l12 12M18 6 6 18" }));
var UserIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("circle", { cx: "12", cy: "8.5", r: "3.5" }), /* @__PURE__ */ React3.createElement("path", { d: "M4.5 20a7.5 7.5 0 0 1 15 0" }));
var MailIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("rect", { x: "3", y: "5.5", width: "18", height: "13", rx: "2" }), /* @__PURE__ */ React3.createElement("path", { d: "m4 7 8 6 8-6" }));
var PhoneIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" }));
var MapPinIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" }), /* @__PURE__ */ React3.createElement("circle", { cx: "12", cy: "10", r: "2.6" }));
var InstagramIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("rect", { x: "3.5", y: "3.5", width: "17", height: "17", rx: "5" }), /* @__PURE__ */ React3.createElement("circle", { cx: "12", cy: "12", r: "4" }), /* @__PURE__ */ React3.createElement("path", { d: "M17 7h.01" }));
var FacebookIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M14.5 8.5h2.5V5h-2.5a4 4 0 0 0-4 4v2H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9.5a1 1 0 0 1 1-1z" }));
var TikTokIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" }), /* @__PURE__ */ React3.createElement("path", { d: "M14 4c.5 2.4 2.2 3.9 4.5 4" }));
var WhatsAppIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M20 11.7A8 8 0 0 1 8.3 19L4 20l1-4.2A8 8 0 1 1 20 11.7z" }), /* @__PURE__ */ React3.createElement("path", { d: "M9 9.5c.6 2.2 2.3 3.9 4.5 4.5" }));
var SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon
};

// resources/js/Components/Footer.jsx
var formatCopyright = (template, year2, storeName) => {
  const raw = typeof template === "string" ? template.trim() : "";
  if (raw === "") return `\xA9 ${year2} ${storeName}`;
  return raw.split("{tahun}").join(String(year2)).split("{toko}").join(storeName);
};
function Footer({
  about = null,
  links = [],
  social = [],
  contact = null,
  storeName = "Toko Kulot",
  copyright = null
}) {
  const {
    phone = null,
    whatsapp = null,
    email = null,
    address = null
  } = contact ?? {};
  const columns = Array.isArray(links) ? links.filter((column) => column && column.title && Array.isArray(column.items)).map((column) => ({
    title: column.title,
    items: column.items.filter((item) => item && item.label && (item.href ?? item.url)).map((item) => ({ label: item.label, href: item.href ?? item.url }))
  })).filter((column) => column.items.length > 0) : [];
  const socialItems = Array.isArray(social) ? social.filter((item) => item && (item.name ?? item.platform) && (item.href ?? item.url)).map((item) => ({
    name: item.name ?? item.platform,
    label: item.label ?? null,
    href: item.href ?? item.url
  })) : [];
  const contactRows = [
    phone && { icon: PhoneIcon, text: phone, href: `tel:${String(phone).replace(/[^\d+]/g, "")}` },
    whatsapp && {
      icon: PhoneIcon,
      text: whatsapp,
      href: `https://wa.me/${String(whatsapp).replace(/[^\d]/g, "")}`
    },
    email && { icon: MailIcon, text: email, href: `mailto:${email}` },
    address && { icon: MapPinIcon, text: address, href: null }
  ].filter(Boolean);
  const year2 = (/* @__PURE__ */ new Date()).getFullYear();
  const copyrightText = formatCopyright(copyright, year2, storeName);
  return /* @__PURE__ */ React4.createElement("footer", { className: "bg-footer pb-8 pt-section text-white/75" }, /* @__PURE__ */ React4.createElement("div", { className: "container" }, /* @__PURE__ */ React4.createElement("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-gutterLg" }, /* @__PURE__ */ React4.createElement("div", { className: "md:col-span-1" }, /* @__PURE__ */ React4.createElement("p", { className: "font-display text-h2 uppercase text-white" }, storeName), about && /* @__PURE__ */ React4.createElement("p", { className: "mt-3 max-w-xs text-meta text-white/75" }, about), socialItems.length > 0 && /* @__PURE__ */ React4.createElement("ul", { className: "mt-4 flex items-center gap-3" }, socialItems.map((item) => {
    const Icon = SOCIAL_ICONS[String(item.name).toLowerCase()];
    if (!Icon) return null;
    return /* @__PURE__ */ React4.createElement("li", { key: `${item.name}-${item.href}` }, /* @__PURE__ */ React4.createElement(
      "a",
      {
        href: item.href,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": item.label ?? item.name,
        className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors duration-hover hover:border-white/50 hover:text-white"
      },
      /* @__PURE__ */ React4.createElement(Icon, { size: 20 })
    ));
  }))), columns.map((column) => /* @__PURE__ */ React4.createElement("div", { key: column.title }, /* @__PURE__ */ React4.createElement("p", { className: "text-badge uppercase text-white" }, column.title), /* @__PURE__ */ React4.createElement("ul", { className: "mt-3 space-y-2" }, column.items.map((item) => /* @__PURE__ */ React4.createElement("li", { key: `${column.title}-${item.label}` }, item.href?.startsWith("http") ? /* @__PURE__ */ React4.createElement(
    "a",
    {
      href: item.href,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "text-meta text-white/75 hover:text-white hover:underline"
    },
    item.label
  ) : /* @__PURE__ */ React4.createElement(
    Link,
    {
      href: item.href ?? "#",
      className: "text-meta text-white/75 hover:text-white hover:underline"
    },
    item.label
  )))))), contactRows.length > 0 && /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("p", { className: "text-badge uppercase text-white" }, "Hubungi Kami"), /* @__PURE__ */ React4.createElement("ul", { className: "mt-3 space-y-2" }, contactRows.map((row) => /* @__PURE__ */ React4.createElement("li", { key: row.text, className: "flex items-start gap-2" }, /* @__PURE__ */ React4.createElement("span", { className: "mt-0.5 shrink-0 text-white/60" }, /* @__PURE__ */ React4.createElement(row.icon, { size: 20 })), row.href ? /* @__PURE__ */ React4.createElement(
    "a",
    {
      href: row.href,
      className: "text-meta text-white/75 hover:text-white hover:underline"
    },
    row.text
  ) : /* @__PURE__ */ React4.createElement("span", { className: "text-meta text-white/75" }, row.text)))))), /* @__PURE__ */ React4.createElement("div", { className: "mt-10 border-t border-white/15 pt-6" }, /* @__PURE__ */ React4.createElement("p", { className: "text-meta text-white/60" }, copyrightText))));
}

// resources/js/Components/Header.jsx
import React6, { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");

// resources/js/lib/hooks.js
import { useCallback, useEffect, useRef, useState } from "react";
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
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

// resources/js/Components/IconButton.jsx
import React5 from "react";
function IconButton({ label, badge = null, children, className = "", type = "button", ...rest }) {
  return /* @__PURE__ */ React5.createElement(
    "button",
    {
      type,
      "aria-label": label,
      title: label,
      className: cn(
        "relative inline-flex h-touch w-touch items-center justify-center rounded-md text-brand",
        "transition-colors duration-hover hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed",
        className
      ),
      ...rest
    },
    children,
    badge !== null && badge !== void 0 && badge !== "" && /* @__PURE__ */ React5.createElement("span", { className: "absolute right-1 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-badge text-ink" }, badge)
  );
}

// resources/js/Components/Header.jsx
var itemMenu = "flex min-h-touch w-full items-center gap-2 rounded-md px-3 text-left text-meta transition-colors duration-hover hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";
function Header({
  nav = [],
  cartCount = 0,
  user = null,
  onOpenDrawer,
  storeName = "Toko Kulot",
  logoUrl = null,
  searchHref = "/produk",
  loginHref = "/login",
  cartHref = "/keranjang"
}) {
  const scrolled = useScrolled(8);
  const count = Number(cartCount) || 0;
  const [menuOpen, setMenuOpen] = useState2(false);
  const [loggingOut, setLoggingOut] = useState2(false);
  const [logoFailed, setLogoFailed] = useState2(false);
  const menuButtonRef = useRef2(null);
  const skipFocusOpen = useRef2(false);
  const displayName = user?.name ?? user?.email ?? "Akun";
  const displayEmail = user?.name && user?.email ? user.email : null;
  const tutupMenu = () => setMenuOpen(false);
  const tutupDanFokus = () => {
    setMenuOpen(false);
    skipFocusOpen.current = true;
    menuButtonRef.current?.focus();
    skipFocusOpen.current = false;
  };
  const onMenuKeyDown = (event) => {
    if (event.key !== "Escape" || !menuOpen) return;
    event.stopPropagation();
    tutupDanFokus();
  };
  useEffect2(() => {
    if (!menuOpen) return void 0;
    const onEscape = (event) => {
      if (event.key === "Escape") tutupDanFokus();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [menuOpen]);
  const keluar = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    router.post("/logout", {}, {
      onFinish: () => {
        setLoggingOut(false);
        setMenuOpen(false);
      }
    });
  };
  return /* @__PURE__ */ React6.createElement(
    "header",
    {
      className: cn(
        "sticky top-0 z-header border-b bg-white",
        scrolled ? "border-line backdrop-blur-sm" : "border-transparent"
      )
    },
    /* @__PURE__ */ React6.createElement("div", { className: "container flex h-headerMobile items-center justify-between gap-4 md:h-header" }, /* @__PURE__ */ React6.createElement("div", { className: "flex items-center gap-2 md:hidden" }, /* @__PURE__ */ React6.createElement(IconButton, { label: "Buka menu", onClick: onOpenDrawer, className: "-ml-2" }, /* @__PURE__ */ React6.createElement(MenuIcon, { size: 20 }))), /* @__PURE__ */ React6.createElement(
      Link,
      {
        href: "/",
        title: storeName,
        "aria-label": `${storeName} \u2014 beranda`,
        className: "flex min-w-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 md:mr-6"
      },
      logoUrl && !logoFailed && /* @__PURE__ */ React6.createElement(
        "img",
        {
          src: logoUrl,
          alt: "",
          className: "h-8 w-auto shrink-0",
          loading: "eager",
          onError: () => setLogoFailed(true)
        }
      ),
      /* @__PURE__ */ React6.createElement("span", { className: "max-w-[42vw] truncate font-display text-h2 uppercase tracking-[0.02em] text-brand md:max-w-[24rem]" }, storeName)
    ), /* @__PURE__ */ React6.createElement("nav", { className: "hidden flex-1 items-center gap-1 md:flex", "aria-label": "Navigasi utama" }, nav.map((item) => /* @__PURE__ */ React6.createElement(
      Link,
      {
        key: item.href ?? item.label,
        href: item.href,
        className: "px-3.5 py-3 text-meta text-ink hover:underline hover:decoration-accent-500 hover:decoration-2 hover:underline-offset-4"
      },
      item.label
    ))), /* @__PURE__ */ React6.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React6.createElement(
      Link,
      {
        href: searchHref,
        "aria-label": "Cari produk",
        title: "Cari produk",
        className: "hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex"
      },
      /* @__PURE__ */ React6.createElement(SearchIcon, { size: 20 })
    ), /* @__PURE__ */ React6.createElement(
      IconButton,
      {
        label: `Keranjang${count > 0 ? `, ${count} item` : ""}`,
        badge: count > 0 ? count : null,
        onClick: () => router.visit(cartHref)
      },
      /* @__PURE__ */ React6.createElement(CartIcon, { size: 20 })
    ), user ? /* @__PURE__ */ React6.createElement(
      "div",
      {
        className: "relative hidden md:block",
        onMouseEnter: () => setMenuOpen(true),
        onMouseLeave: () => setMenuOpen(false),
        onBlur: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
        },
        onKeyDown: onMenuKeyDown
      },
      /* @__PURE__ */ React6.createElement(
        "button",
        {
          type: "button",
          ref: menuButtonRef,
          "aria-haspopup": "true",
          "aria-expanded": menuOpen,
          "aria-controls": "menu-profil",
          "aria-label": `Menu akun ${displayName}`,
          title: "Menu akun",
          onClick: () => setMenuOpen(true),
          onFocus: (event) => {
            if (!skipFocusOpen.current && event.target.matches(":focus-visible")) {
              setMenuOpen(true);
            }
          },
          className: "inline-flex h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        },
        /* @__PURE__ */ React6.createElement(UserIcon, { size: 20 })
      ),
      menuOpen && /* @__PURE__ */ React6.createElement("div", { className: "absolute right-0 top-full pt-2" }, /* @__PURE__ */ React6.createElement(
        "div",
        {
          id: "menu-profil",
          className: "w-60 rounded-xl border border-line bg-white p-2 shadow-raised"
        },
        /* @__PURE__ */ React6.createElement("div", { className: "border-b border-line px-3 pb-3 pt-2" }, /* @__PURE__ */ React6.createElement("p", { className: "truncate text-label font-semibold text-ink" }, displayName), displayEmail && /* @__PURE__ */ React6.createElement("p", { className: "mt-0.5 truncate text-meta text-slate-500" }, displayEmail)),
        /* @__PURE__ */ React6.createElement(Link, { href: "/history", onClick: tutupMenu, className: cn(itemMenu, "mt-2 text-ink") }, "Riwayat pesanan"),
        /* @__PURE__ */ React6.createElement(
          "button",
          {
            type: "button",
            onClick: keluar,
            disabled: loggingOut,
            "aria-busy": loggingOut || void 0,
            className: cn(itemMenu, "text-brand disabled:cursor-not-allowed disabled:opacity-45")
          },
          loggingOut ? "Memproses\u2026" : "Keluar"
        )
      ))
    ) : /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(
      Link,
      {
        href: loginHref,
        "aria-label": "Masuk",
        title: "Masuk",
        className: "hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex"
      },
      /* @__PURE__ */ React6.createElement(UserIcon, { size: 20 })
    ), /* @__PURE__ */ React6.createElement(
      Link,
      {
        href: "/register",
        className: "hidden text-meta text-brand underline underline-offset-4 md:inline-flex"
      },
      "Daftar"
    ))))
  );
}

// resources/js/Components/NavDrawer.jsx
import React7, { useEffect as useEffect3, useRef as useRef3 } from "react";
function NavDrawer({ open = false, nav = [], onClose, title = "Menu", footer = null }) {
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
  return /* @__PURE__ */ React7.createElement("div", { className: "fixed inset-0 z-drawer" }, /* @__PURE__ */ React7.createElement(
    "button",
    {
      type: "button",
      "aria-label": "Tutup menu",
      onClick: onClose,
      className: "absolute inset-0 h-full w-full cursor-default bg-black/50"
    }
  ), /* @__PURE__ */ React7.createElement(
    "div",
    {
      ref: panelRef,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title,
      tabIndex: -1,
      className: cn(
        "relative flex h-screen w-drawer max-w-[84%] flex-col bg-white animate-drawer-in"
      )
    },
    /* @__PURE__ */ React7.createElement("div", { className: "flex h-header items-center justify-between border-b border-line px-4" }, /* @__PURE__ */ React7.createElement("span", { className: "text-badge uppercase text-slate-500" }, title), /* @__PURE__ */ React7.createElement(
      "button",
      {
        type: "button",
        onClick: onClose,
        "aria-label": "Tutup menu",
        className: "inline-flex h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface"
      },
      /* @__PURE__ */ React7.createElement(CloseIcon, { size: 20 })
    )),
    /* @__PURE__ */ React7.createElement("nav", { className: "flex-1 overflow-y-auto", "aria-label": "Navigasi utama" }, /* @__PURE__ */ React7.createElement("ul", null, nav.map((item) => /* @__PURE__ */ React7.createElement("li", { key: item.href ?? item.label }, /* @__PURE__ */ React7.createElement(
      Link,
      {
        href: item.href,
        onClick: onClose,
        className: "flex h-drawerItem items-center border-b border-line px-4 text-label text-ink transition-colors duration-hover hover:bg-surface"
      },
      item.label
    ))))),
    footer && /* @__PURE__ */ React7.createElement("div", { className: "border-t border-line p-4" }, footer)
  ));
}

// resources/js/Layouts/PublicLayout.jsx
var DEFAULT_NAV = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/produk" },
  { label: "Kontak", href: "/kontak-kami" }
];
var hrefOf = (item) => item?.url ?? item?.href ?? null;
var toCount = (value) => {
  if (value === null || value === void 0 || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
};
function PublicLayout({ settings: settingsProp = null, cartCount = null, user = null, children }) {
  const [drawerOpen, setDrawerOpen] = useState3(false);
  const [loggingOut, setLoggingOut] = useState3(false);
  const page = usePage();
  const sharedSettings = page?.props?.settings;
  const settings = {
    ...sharedSettings && typeof sharedSettings === "object" ? sharedSettings : {},
    ...settingsProp && typeof settingsProp === "object" ? settingsProp : {}
  };
  const storeName = settings.store_name || "Toko Kulot";
  const rawNav = settings?.header_nav;
  const nav = Array.isArray(rawNav) && rawNav.length > 0 ? rawNav.filter((item) => item && item.label && hrefOf(item)).map((item) => ({ label: item.label, href: hrefOf(item) })) : DEFAULT_NAV;
  const announcement = settings?.landing_sections?.announcement ?? null;
  const announcementText = announcement?.text ?? settings?.announcement_text ?? null;
  const announcementHref = announcement ? hrefOf(announcement) : settings?.announcement_href ?? null;
  const currentUser = user ?? page?.props?.auth?.user ?? null;
  const count = toCount(page?.props?.cart?.count) ?? toCount(cartCount) ?? toCount(settings?.cart_count) ?? 0;
  const keluar = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    router.post("/logout", {}, { onFinish: () => setLoggingOut(false) });
  };
  return /* @__PURE__ */ React8.createElement("div", { className: "flex min-h-screen flex-col bg-white text-ink" }, /* @__PURE__ */ React8.createElement(
    "a",
    {
      href: "#konten-utama",
      className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
    },
    "Lewati ke konten utama"
  ), /* @__PURE__ */ React8.createElement(Announcement, { text: announcementText, href: announcementHref }), /* @__PURE__ */ React8.createElement(
    Header,
    {
      nav,
      cartCount: count,
      user: currentUser,
      storeName,
      logoUrl: settings?.store_logo ?? settings?.logo_url ?? null,
      onOpenDrawer: () => setDrawerOpen(true)
    }
  ), /* @__PURE__ */ React8.createElement(
    NavDrawer,
    {
      open: drawerOpen,
      nav,
      onClose: () => setDrawerOpen(false),
      title: "Menu",
      footer: currentUser ? /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col gap-3" }, /* @__PURE__ */ React8.createElement("p", { className: "text-meta text-ink-soft" }, `Masuk sebagai ${currentUser.name ?? currentUser.email ?? "Akun"}`), /* @__PURE__ */ React8.createElement(
        Link,
        {
          href: "/history",
          onClick: () => setDrawerOpen(false),
          className: "btn-secondary w-full justify-center"
        },
        "Riwayat pesanan"
      ), /* @__PURE__ */ React8.createElement(
        "button",
        {
          type: "button",
          onClick: keluar,
          disabled: loggingOut,
          "aria-busy": loggingOut || void 0,
          className: "btn-ghost w-full justify-center disabled:cursor-not-allowed disabled:opacity-45"
        },
        loggingOut ? "Memproses\u2026" : "Keluar"
      )) : /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ React8.createElement(Link, { href: "/register", className: "btn-primary w-full justify-center" }, "Daftar"), /* @__PURE__ */ React8.createElement(Link, { href: "/login", className: "btn-secondary w-full justify-center" }, "Masuk"))
    }
  ), /* @__PURE__ */ React8.createElement("main", { id: "konten-utama", className: "flex-1" }, children), /* @__PURE__ */ React8.createElement(
    Footer,
    {
      about: settings?.footer_about ?? settings?.store_tagline ?? settings?.tagline ?? null,
      links: settings?.footer_links ?? [],
      social: settings?.footer_social ?? [],
      contact: {
        phone: settings?.contact_phone ?? null,
        whatsapp: settings?.contact_whatsapp ?? null,
        email: settings?.contact_email ?? null,
        address: settings?.contact_address ?? null
      },
      storeName,
      copyright: settings.footer_copyright ?? null
    }
  ));
}

// tmp/verify-header-footer.mjs
var year = (/* @__PURE__ */ new Date()).getFullYear();
var failed = 0;
function check(label, html, mustHave, mustNotHave = []) {
  const missing = mustHave.filter((text) => !html.includes(text));
  const extra = mustNotHave.filter((text) => html.includes(text));
  const ok = missing.length === 0 && extra.length === 0;
  if (!ok) failed += 1;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}`);
  if (missing.length) console.log("     tidak ada:", missing.join(" | "));
  if (extra.length) console.log("     tidak boleh ada:", extra.join(" | "));
}
function render(settingsProp, sharedSettings) {
  __setProps({
    settings: sharedSettings,
    auth: { user: null },
    cart: { count: 0 },
    flash: { success: null, error: null },
    errors: {}
  });
  return renderToStaticMarkup(
    React9.createElement(
      PublicLayout,
      { settings: settingsProp },
      React9.createElement("main", null, "Isi halaman")
    )
  );
}
var shared = {
  store_name: "Daster Kulot Uji",
  store_logo: "/images/seed/logo-uji.png",
  footer_copyright: "\xA9 {tahun} {toko}. Semua hak dilindungi.",
  header_nav: [{ label: "Beranda", url: "/" }]
};
var html1 = render({}, shared);
check("nama toko dari props bersama tampil di header", html1, [">Daster Kulot Uji</span>", 'title="Daster Kulot Uji"']);
check("logo tampil di samping nama (alt dekoratif)", html1, [
  'src="/images/seed/logo-uji.png"',
  'alt=""'
]);
check("copyright placeholder {tahun}/{toko} diganti", html1, [
  `\xA9 ${year} Daster Kulot Uji. Semua hak dilindungi.`
]);
check("tidak ada placeholder mentah", html1, [], ["{tahun}", "{toko}"]);
var html2 = render({ store_name: "Nama Dari Halaman", footer_copyright: "" }, shared);
check("prop halaman menimpa nama bersama", html2, [">Nama Dari Halaman</span>"]);
check("copyright kosong jatuh ke fallback", html2, [`\xA9 ${year} Nama Dari Halaman`]);
check("fallback tanpa kalimat karangan", html2, [], ["Semua hak dilindungi"]);
var html3 = render(null, {});
check("settings kosong tetap merender nama bawaan", html3, ["Toko Kulot"]);
var html4 = render(null, { store_name: "Toko Spasi", footer_copyright: "   " });
check("copyright spasi jatuh ke fallback", html4, [`\xA9 ${year} Toko Spasi`]);
if (failed > 0) {
  console.log(`
${failed} pemeriksaan GAGAL`);
  process.exit(1);
}
console.log("\nSemua pemeriksaan header/footer lulus.");
