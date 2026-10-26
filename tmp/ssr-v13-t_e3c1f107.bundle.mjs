// tmp/ssr-v13-t_e3c1f107.mjs
import React23 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// resources/js/Pages/Public/CheckoutSuccess.jsx
import React17, { useState as useState7 } from "react";

// tmp/inertia-stub-ssr-v13.jsx
import React from "react";
var pageProps = { errors: {}, auth: { user: null, admin: null }, settings: {}, cart: { count: 0 }, flash: null };
function __setPageProps(next) {
  pageProps = { ...pageProps, ...next };
}
function usePage() {
  return { props: pageProps, url: "/history", component: "Public/History", version: null };
}
function Head() {
  return null;
}
function Link({ href, children, ...rest }) {
  return /* @__PURE__ */ React.createElement("a", { href: typeof href === "string" ? href : "#", ...rest }, children);
}
var router = {
  visit: () => {
  },
  post: () => {
  },
  get: () => {
  },
  delete: () => {
  }
};

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
var ChevronDownIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "m6 9 6 6 6-6" }));
var StarIcon = ({ filled = false, ...props }) => /* @__PURE__ */ React3.createElement(Svg, { filled, ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M12 3.6l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8L12 3.6z" }));
var CheckIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "m5 12.5 4.5 4.5L19 7" }));
var UserIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("circle", { cx: "12", cy: "8.5", r: "3.5" }), /* @__PURE__ */ React3.createElement("path", { d: "M4.5 20a7.5 7.5 0 0 1 15 0" }));
var MailIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("rect", { x: "3", y: "5.5", width: "18", height: "13", rx: "2" }), /* @__PURE__ */ React3.createElement("path", { d: "m4 7 8 6 8-6" }));
var PhoneIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" }));
var MapPinIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" }), /* @__PURE__ */ React3.createElement("circle", { cx: "12", cy: "10", r: "2.6" }));
var AlertIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M12 4.5 21 20H3L12 4.5z" }), /* @__PURE__ */ React3.createElement("path", { d: "M12 10v4" }), /* @__PURE__ */ React3.createElement("path", { d: "M12 17h.01" }));
var ImageOffIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M4 5.5h16v13H4z" }), /* @__PURE__ */ React3.createElement("path", { d: "m4 15 4.5-4.5 4 4 3-3 4.5 4.5" }), /* @__PURE__ */ React3.createElement("path", { d: "M3 3l18 18" }));
var SpinnerIcon = ({ size = 16, className = "" }) => /* @__PURE__ */ React3.createElement(
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
  /* @__PURE__ */ React3.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "1.5", opacity: "0.25" }),
  /* @__PURE__ */ React3.createElement("path", { d: "M21 12a9 9 0 0 0-9-9", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
);
var InstagramIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("rect", { x: "3.5", y: "3.5", width: "17", height: "17", rx: "5" }), /* @__PURE__ */ React3.createElement("circle", { cx: "12", cy: "12", r: "4" }), /* @__PURE__ */ React3.createElement("path", { d: "M17 7h.01" }));
var FacebookIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M14.5 8.5h2.5V5h-2.5a4 4 0 0 0-4 4v2H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9.5a1 1 0 0 1 1-1z" }));
var TikTokIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" }), /* @__PURE__ */ React3.createElement("path", { d: "M14 4c.5 2.4 2.2 3.9 4.5 4" }));
var WhatsAppIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M20 11.7A8 8 0 0 1 8.3 19L4 20l1-4.2A8 8 0 1 1 20 11.7z" }), /* @__PURE__ */ React3.createElement("path", { d: "M9 9.5c.6 2.2 2.3 3.9 4.5 4.5" }));
var CopyIcon = (props) => /* @__PURE__ */ React3.createElement(Svg, { ...props }, /* @__PURE__ */ React3.createElement("rect", { x: "9", y: "9", width: "11", height: "11", rx: "2" }), /* @__PURE__ */ React3.createElement("path", { d: "M15 6.5V5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15h1" }));
var SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon
};

// resources/js/Components/Footer.jsx
var formatCopyright = (template, year, storeName) => {
  const raw = typeof template === "string" ? template.trim() : "";
  if (raw === "") return `\xA9 ${year} ${storeName}`;
  return raw.split("{tahun}").join(String(year)).split("{toko}").join(storeName);
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
    items: column.items.filter((item2) => item2 && item2.label && (item2.href ?? item2.url)).map((item2) => ({ label: item2.label, href: item2.href ?? item2.url }))
  })).filter((column) => column.items.length > 0) : [];
  const socialItems = Array.isArray(social) ? social.filter((item2) => item2 && (item2.name ?? item2.platform) && (item2.href ?? item2.url)).map((item2) => ({
    name: item2.name ?? item2.platform,
    label: item2.label ?? null,
    href: item2.href ?? item2.url
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
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const copyrightText = formatCopyright(copyright, year, storeName);
  return /* @__PURE__ */ React4.createElement("footer", { className: "bg-footer pb-8 pt-section text-white/75" }, /* @__PURE__ */ React4.createElement("div", { className: "container" }, /* @__PURE__ */ React4.createElement("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-gutterLg" }, /* @__PURE__ */ React4.createElement("div", { className: "md:col-span-1" }, /* @__PURE__ */ React4.createElement("p", { className: "font-display text-h2 uppercase text-white" }, storeName), about && /* @__PURE__ */ React4.createElement("p", { className: "mt-3 max-w-xs text-meta text-white/75" }, about), socialItems.length > 0 && /* @__PURE__ */ React4.createElement("ul", { className: "mt-4 flex items-center gap-3" }, socialItems.map((item2) => {
    const Icon = SOCIAL_ICONS[String(item2.name).toLowerCase()];
    if (!Icon) return null;
    return /* @__PURE__ */ React4.createElement("li", { key: `${item2.name}-${item2.href}` }, /* @__PURE__ */ React4.createElement(
      "a",
      {
        href: item2.href,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": item2.label ?? item2.name,
        className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors duration-hover hover:border-white/50 hover:text-white"
      },
      /* @__PURE__ */ React4.createElement(Icon, { size: 20 })
    ));
  }))), columns.map((column) => /* @__PURE__ */ React4.createElement("div", { key: column.title }, /* @__PURE__ */ React4.createElement("p", { className: "text-badge uppercase text-white" }, column.title), /* @__PURE__ */ React4.createElement("ul", { className: "mt-3 space-y-2" }, column.items.map((item2) => /* @__PURE__ */ React4.createElement("li", { key: `${column.title}-${item2.label}` }, item2.href?.startsWith("http") ? /* @__PURE__ */ React4.createElement(
    "a",
    {
      href: item2.href,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "text-meta text-white/75 hover:text-white hover:underline"
    },
    item2.label
  ) : /* @__PURE__ */ React4.createElement(
    Link,
    {
      href: item2.href ?? "#",
      className: "text-meta text-white/75 hover:text-white hover:underline"
    },
    item2.label
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
    ), /* @__PURE__ */ React6.createElement("nav", { className: "hidden flex-1 items-center gap-1 md:flex", "aria-label": "Navigasi utama" }, nav.map((item2) => /* @__PURE__ */ React6.createElement(
      Link,
      {
        key: item2.href ?? item2.label,
        href: item2.href,
        className: "px-3.5 py-3 text-meta text-ink hover:underline hover:decoration-accent-500 hover:decoration-2 hover:underline-offset-4"
      },
      item2.label
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
    /* @__PURE__ */ React7.createElement("nav", { className: "flex-1 overflow-y-auto", "aria-label": "Navigasi utama" }, /* @__PURE__ */ React7.createElement("ul", null, nav.map((item2) => /* @__PURE__ */ React7.createElement("li", { key: item2.href ?? item2.label }, /* @__PURE__ */ React7.createElement(
      Link,
      {
        href: item2.href,
        onClick: onClose,
        className: "flex h-drawerItem items-center border-b border-line px-4 text-label text-ink transition-colors duration-hover hover:bg-surface"
      },
      item2.label
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
var hrefOf = (item2) => item2?.url ?? item2?.href ?? null;
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
  const nav = Array.isArray(rawNav) && rawNav.length > 0 ? rawNav.filter((item2) => item2 && item2.label && hrefOf(item2)).map((item2) => ({ label: item2.label, href: hrefOf(item2) })) : DEFAULT_NAV;
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

// resources/js/Components/Breadcrumb.jsx
import React9 from "react";
function Breadcrumb({ items = [], className = "" }) {
  const list = (Array.isArray(items) ? items : []).filter((item2) => item2 && item2.label);
  if (list.length === 0) return null;
  const first = list[0];
  const last = list[list.length - 1];
  const middle = list.slice(1, -1);
  const renderItem = (item2, isLast) => isLast || !item2.href ? /* @__PURE__ */ React9.createElement("span", { className: "text-ink", "aria-current": "page" }, item2.label) : /* @__PURE__ */ React9.createElement(Link, { href: item2.href, className: "transition-colors duration-hover hover:text-ink" }, item2.label);
  return /* @__PURE__ */ React9.createElement("nav", { "aria-label": "Breadcrumb", className: cn("h-12", className) }, /* @__PURE__ */ React9.createElement("ol", { className: "flex h-full items-center gap-2 text-meta text-slate-600" }, /* @__PURE__ */ React9.createElement("li", { className: "flex items-center gap-2" }, renderItem(first, list.length === 1)), list.length > 1 && /* @__PURE__ */ React9.createElement("li", { className: "flex items-center gap-2", "aria-hidden": "true" }, /* @__PURE__ */ React9.createElement("span", null, "/")), middle.length > 0 && /* @__PURE__ */ React9.createElement("li", { className: "flex items-center gap-2 sm:hidden", "aria-hidden": "true" }, /* @__PURE__ */ React9.createElement("span", null, "...")), list.length > 1 && /* @__PURE__ */ React9.createElement("li", { className: "flex items-center gap-2" }, renderItem(last, true))));
}

// resources/js/Components/InlineNotice.jsx
import React10 from "react";
var TONES = {
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
  return /* @__PURE__ */ React10.createElement(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn("flex items-start gap-3 rounded-md p-4", TONES[tone] ?? TONES.info, className)
    },
    /* @__PURE__ */ React10.createElement("span", { className: cn("mt-0.5 shrink-0", ICON_TONES[tone] ?? ICON_TONES.info), "aria-hidden": "true" }, /* @__PURE__ */ React10.createElement(Icon, { size: 20 })),
    /* @__PURE__ */ React10.createElement("div", { className: "min-w-0 flex-1" }, title && /* @__PURE__ */ React10.createElement("p", { className: "text-label" }, title), children && /* @__PURE__ */ React10.createElement("div", { className: "text-meta text-ink-soft" }, children)),
    onDismiss && /* @__PURE__ */ React10.createElement(
      "button",
      {
        type: "button",
        onClick: onDismiss,
        "aria-label": "Tutup pesan",
        className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60"
      },
      /* @__PURE__ */ React10.createElement(CloseIcon, { size: 16 })
    )
  );
}

// resources/js/Components/ReviewForm.jsx
import React15, { useEffect as useEffect4, useState as useState5 } from "react";

// resources/js/Components/Button.jsx
import React11 from "react";
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
  loadingLabel = "Memproses\u2026",
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
  const content = loading ? /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement(SpinnerIcon, { size: 16 }), /* @__PURE__ */ React11.createElement("span", null, loadingLabel)) : /* @__PURE__ */ React11.createElement(React11.Fragment, null, icon, /* @__PURE__ */ React11.createElement("span", null, children));
  if (as === "a") {
    return /* @__PURE__ */ React11.createElement("a", { href, className: classes, ...rest }, content);
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ React11.createElement(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest }, content);
  }
  return /* @__PURE__ */ React11.createElement(
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

// resources/js/Components/Field.jsx
import React12 from "react";
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
  return /* @__PURE__ */ React12.createElement("div", { className: cn("flex flex-col", className) }, label && /* @__PURE__ */ React12.createElement("label", { htmlFor, className: "mb-1.5 block text-meta font-semibold text-ink" }, label, required && /* @__PURE__ */ React12.createElement("span", { className: "text-danger", "aria-hidden": "true" }, " *")), children, hint && !error && /* @__PURE__ */ React12.createElement("p", { id: hintId, className: "mt-1.5 text-meta text-slate-500" }, hint), error && /* @__PURE__ */ React12.createElement("p", { id: errorId, className: "mt-1.5 text-meta text-danger-strong", role: "alert" }, error));
}

// resources/js/Components/StarRating.jsx
import React13, { useState as useState4 } from "react";
var SIZES2 = { sm: 14, md: 20, lg: 32 };
var stars = (size, filled) => [0, 1, 2, 3, 4].map((index) => /* @__PURE__ */ React13.createElement(StarIcon, { key: index, size, filled }));
function StarRating({
  value = 0,
  size = "sm",
  readOnly = true,
  count = null,
  onChange,
  label = null
}) {
  const px = SIZES2[size] ?? SIZES2.sm;
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const [preview, setPreview] = useState4(0);
  const shown = preview || clamped;
  const readable = clamped.toFixed(1).replace(".", ",");
  if (readOnly) {
    return /* @__PURE__ */ React13.createElement("span", { className: "inline-flex items-center gap-1.5" }, /* @__PURE__ */ React13.createElement(
      "span",
      {
        className: "relative inline-flex",
        role: "img",
        "aria-label": label ?? `Rating ${readable} dari 5`,
        style: { height: px }
      },
      /* @__PURE__ */ React13.createElement("span", { className: "flex gap-0.5 text-slate-300" }, stars(px, false)),
      /* @__PURE__ */ React13.createElement(
        "span",
        {
          className: "absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-accent-500",
          style: { width: `${clamped / 5 * 100}%` },
          "aria-hidden": "true"
        },
        stars(px, true)
      )
    ), count !== null && count !== void 0 && /* @__PURE__ */ React13.createElement("span", { className: "text-meta text-slate-600" }, "(", formatNumber(count), ")"));
  }
  const step = (delta) => {
    const next = Math.max(1, Math.min(5, Math.round(shown) + delta));
    onChange?.(next);
  };
  return /* @__PURE__ */ React13.createElement(
    "div",
    {
      className: "inline-flex items-center gap-0.5",
      role: "group",
      "aria-label": label ?? "Pilih rating",
      onMouseLeave: () => setPreview(0),
      onKeyDown: (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          step(1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          step(-1);
        }
      }
    },
    [1, 2, 3, 4, 5].map((index) => /* @__PURE__ */ React13.createElement(
      "button",
      {
        key: index,
        type: "button",
        className: cn(
          "inline-flex h-touch w-touch items-center justify-center rounded-sm transition-colors duration-hover",
          "hover:bg-surface"
        ),
        "aria-label": `${index} dari 5 bintang`,
        "aria-pressed": clamped >= index,
        onMouseEnter: () => setPreview(index),
        onFocus: () => setPreview(index),
        onBlur: () => setPreview(0),
        onClick: () => onChange?.(index)
      },
      /* @__PURE__ */ React13.createElement(StarIcon, { size: px, filled: index <= shown, className: index <= shown ? "text-accent-500" : "text-slate-300" })
    ))
  );
}

// resources/js/Components/Textarea.jsx
import React14 from "react";
var BASE = "w-full min-h-[120px] resize-y rounded-md border border-line bg-white px-3.5 py-3 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Textarea({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ React14.createElement(
    "textarea",
    {
      id,
      "aria-invalid": error ? "true" : void 0,
      "aria-describedby": error && id ? id + "-error" : void 0,
      className: cn(BASE, error ? "border-danger" : null, className),
      ...rest
    }
  );
}

// resources/js/Components/ReviewForm.jsx
function ReviewForm({
  productId = null,
  product = null,
  rating = 0,
  submitting = false,
  submitted = false,
  alreadyReviewed = false,
  error = null,
  onSubmit = null,
  className = ""
}) {
  const [ratingValue, setRatingValue] = useState5(Number(rating) || 0);
  const [comment, setComment] = useState5("");
  const [localError, setLocalError] = useState5(null);
  const [imageFailed, setImageFailed] = useState5(false);
  const image = product?.image ?? null;
  const name = product?.name ?? "Produk";
  const variantLabel = product?.variant_label ?? null;
  const textareaId = `ulasan-komentar-${productId ?? "x"}`;
  useEffect4(() => {
    setImageFailed(false);
  }, [image]);
  if (submitted || alreadyReviewed) {
    return /* @__PURE__ */ React15.createElement("section", { className: cn("card p-4 sm:p-5", className), "aria-label": `Penilaian ${name}` }, /* @__PURE__ */ React15.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React15.createElement(Thumb, { image: image && !imageFailed ? image : null, onError: () => setImageFailed(true) }), /* @__PURE__ */ React15.createElement(ProductTitle, { name, variantLabel })), ratingValue > 0 && /* @__PURE__ */ React15.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React15.createElement(StarRating, { value: ratingValue, size: "lg", readOnly: true, label: `Rating ${ratingValue} dari 5` })), /* @__PURE__ */ React15.createElement("p", { className: "mt-3 text-body text-ink-soft" }, submitted ? "Terima kasih! Penilaianmu membantu pembeli lain." : "Produk ini sudah kamu nilai pada pesanan ini."));
  }
  const submit = (event) => {
    event.preventDefault();
    if (ratingValue < 1) {
      setLocalError("Pilih jumlah bintang dulu.");
      return;
    }
    setLocalError(null);
    onSubmit?.({
      product_id: productId,
      rating: ratingValue,
      comment: comment.trim() === "" ? null : comment.trim()
    });
  };
  const shownError = localError ?? error;
  return /* @__PURE__ */ React15.createElement("form", { className: cn("card p-4 sm:p-5", className), onSubmit: submit, noValidate: true }, /* @__PURE__ */ React15.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React15.createElement(Thumb, { image: image && !imageFailed ? image : null, onError: () => setImageFailed(true) }), /* @__PURE__ */ React15.createElement(ProductTitle, { name, variantLabel })), /* @__PURE__ */ React15.createElement("p", { className: "mt-4 text-body text-ink" }, "Seberapa puas kamu?"), /* @__PURE__ */ React15.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React15.createElement(
    StarRating,
    {
      value: ratingValue,
      size: "lg",
      readOnly: false,
      label: `Pilih rating untuk ${name}`,
      onChange: (next) => {
        setRatingValue(next);
        setLocalError(null);
      }
    }
  )), /* @__PURE__ */ React15.createElement(
    Field,
    {
      label: "Komentar (opsional)",
      htmlFor: textareaId,
      error: shownError,
      className: "mt-4"
    },
    /* @__PURE__ */ React15.createElement(
      Textarea,
      {
        id: textareaId,
        name: `ulasan[${productId ?? 0}][comment]`,
        value: comment,
        maxLength: 1e3,
        placeholder: "Tulis komentarmu\u2026",
        error: shownError,
        disabled: submitting,
        onChange: (event) => setComment(event.target.value)
      }
    )
  ), /* @__PURE__ */ React15.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React15.createElement(Button, { type: "submit", fullWidth: true, loading: submitting, disabled: submitting }, "Kirim Penilaian")));
}
function Thumb({ image, onError }) {
  return /* @__PURE__ */ React15.createElement("div", { className: "h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface" }, image ? /* @__PURE__ */ React15.createElement("img", { src: image, alt: "", width: "64", height: "64", className: "h-full w-full object-cover", onError }) : /* @__PURE__ */ React15.createElement("span", { className: "flex h-full w-full items-center justify-center text-slate-300", "aria-hidden": "true" }, /* @__PURE__ */ React15.createElement(ImageOffIcon, { size: 24 })));
}
function ProductTitle({ name, variantLabel }) {
  return /* @__PURE__ */ React15.createElement("p", { className: "min-w-0 text-h3 text-ink" }, name, variantLabel && /* @__PURE__ */ React15.createElement("span", { className: "text-meta font-normal text-slate-500" }, " \xB7 ", variantLabel));
}

// resources/js/Components/SalinButton.jsx
import React16, { useEffect as useEffect5, useRef as useRef4, useState as useState6 } from "react";
function SalinButton({
  value = "",
  ariaLabel = "Salin",
  children = null,
  className = "",
  valueClassName = "",
  buttonClassName = ""
}) {
  const [tersalin, setTersalin] = useState6(false);
  const [gagal2, setGagal] = useState6(false);
  const nilaiRef = useRef4(null);
  const timerRef = useRef4(null);
  useEffect5(() => () => window.clearTimeout(timerRef.current), []);
  const pilihTeks = () => {
    const node = nilaiRef.current;
    if (!node || typeof window === "undefined" || !window.getSelection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };
  const salin = async () => {
    const teks2 = String(value ?? "");
    if (teks2 === "") return;
    let berhasil = false;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(teks2);
        berhasil = true;
      } catch {
        berhasil = false;
      }
    }
    if (!berhasil && typeof document !== "undefined") {
      try {
        const area = document.createElement("textarea");
        area.value = teks2;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        berhasil = document.execCommand("copy");
        document.body.removeChild(area);
      } catch {
        berhasil = false;
      }
    }
    if (berhasil) {
      setTersalin(true);
      setGagal(false);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setTersalin(false), 2e3);
      return;
    }
    setTersalin(false);
    setGagal(true);
    pilihTeks();
  };
  return /* @__PURE__ */ React16.createElement("span", { className: cn("inline-flex flex-wrap items-center gap-2", className) }, /* @__PURE__ */ React16.createElement("span", { ref: nilaiRef, className: cn("min-w-0 break-all", valueClassName) }, children ?? value), /* @__PURE__ */ React16.createElement(
    "button",
    {
      type: "button",
      onClick: salin,
      "aria-label": ariaLabel,
      className: cn(
        "inline-flex h-touch min-w-touch shrink-0 items-center justify-center gap-1.5 rounded-md border border-line px-3 text-label text-ink transition-colors duration-hover hover:bg-surface",
        buttonClassName
      )
    },
    tersalin ? /* @__PURE__ */ React16.createElement(CheckIcon, { size: 16 }) : /* @__PURE__ */ React16.createElement(CopyIcon, { size: 16 }),
    /* @__PURE__ */ React16.createElement("span", null, tersalin ? "Tersalin" : "Salin")
  ), /* @__PURE__ */ React16.createElement("span", { role: "status", className: "sr-only" }, tersalin ? "Tersalin" : ""), gagal2 && /* @__PURE__ */ React16.createElement("span", { className: "basis-full text-meta text-ink-soft" }, "Salin manual: tekan Ctrl+C."));
}

// resources/js/Pages/Public/CheckoutSuccess.jsx
var STATUS_BOLEH_DINILAI = ["dibayar", "diproses", "dikirim", "selesai"];
var isi = (value) => {
  const str = String(value ?? "").trim();
  return str === "" ? null : str;
};
function BarisKirim({ label, children }) {
  return /* @__PURE__ */ React17.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ React17.createElement("dt", { className: "text-body text-ink-soft" }, label), /* @__PURE__ */ React17.createElement("dd", { className: "min-w-0 break-words text-body text-ink" }, children));
}
function CheckoutSuccess({ pesanan: pesanan2 = null, ulasan: ulasan2 = null, errors = {}, flash = null }) {
  const orderId = pesanan2?.id ?? null;
  const items = Array.isArray(pesanan2?.items) ? pesanan2.items : [];
  const sudah = (Array.isArray(ulasan2?.sudah) ? ulasan2.sudah : []).map((id) => Number(id));
  const shipping = pesanan2?.shipping ?? null;
  const statusKirim = isi(shipping?.status_label);
  const resi = isi(shipping?.tracking_number);
  const kurirKirim = [isi(shipping?.courier_name), isi(shipping?.service_name)].filter(Boolean).join(" \xB7 ");
  const petugasKirim = isi(shipping?.driver?.name);
  const diperbaruiKirim = formatDateTime(shipping?.updated_at);
  const linkLacak = /^https?:\/\//i.test(isi(shipping?.driver?.link) ?? "") ? isi(shipping?.driver?.link) : null;
  const boleh = ulasan2?.boleh === true;
  const syaratDinilai = pesanan2?.payment_status === "settlement" && STATUS_BOLEH_DINILAI.includes(String(pesanan2?.status ?? ""));
  const [busyProduct, setBusyProduct] = useState7(null);
  const [submittedId, setSubmittedId] = useState7(null);
  const [justRated, setJustRated] = useState7({});
  const produkUnik = items.reduce((daftar2, item2) => {
    const id = Number(item2?.product_id);
    if (!Number.isFinite(id) || id <= 0) return daftar2;
    let produk = daftar2.find((row) => row.product_id === id);
    if (!produk) {
      produk = { ...item2, product_id: id, labelVarian: [] };
      daftar2.push(produk);
    }
    const label = String(item2?.variant_label ?? "").trim();
    if (label && !produk.labelVarian.includes(label)) produk.labelVarian.push(label);
    return daftar2;
  }, []).map(({ labelVarian, ...produk }) => ({
    ...produk,
    variant_label: labelVarian.length > 0 ? labelVarian.join(", ") : null
  }));
  const pending = produkUnik.filter(
    (item2) => !sudah.includes(item2.product_id) && justRated[item2.product_id] === void 0
  );
  const sudahAda = produkUnik.filter(
    (item2) => sudah.includes(item2.product_id) || justRated[item2.product_id] !== void 0
  );
  const tampilkanForm = boleh && pending.length > 0;
  const alasanBelumBoleh = !tampilkanForm && !syaratDinilai && pending.length > 0;
  const errorFor = (item2) => Number(item2?.product_id) !== Number(submittedId) ? null : errors?.["ulasan.0.rating"] ?? errors?.["ulasan.0.product_id"] ?? errors?.["ulasan.0.comment"] ?? null;
  const submitReview = (payload) => {
    if (!orderId || busyProduct !== null) return;
    setSubmittedId(payload.product_id ?? null);
    setBusyProduct(payload.product_id ?? "x");
    router.post(
      `/checkout/${orderId}/ulasan`,
      {
        ulasan: [
          {
            product_id: payload.product_id,
            rating: payload.rating,
            comment: payload.comment
          }
        ]
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setJustRated((prev) => ({ ...prev, [payload.product_id]: payload.rating }));
        },
        onFinish: () => setBusyProduct(null)
      }
    );
  };
  return /* @__PURE__ */ React17.createElement(PublicLayout, null, /* @__PURE__ */ React17.createElement(Head, { title: "Pesanan Diterima" }), /* @__PURE__ */ React17.createElement("div", { className: "container py-4" }, /* @__PURE__ */ React17.createElement(
    Breadcrumb,
    {
      items: [
        { label: "Beranda", href: "/" },
        { label: "Keranjang", href: "/keranjang" },
        { label: "Pesanan Diterima" }
      ]
    }
  ), /* @__PURE__ */ React17.createElement("div", { className: "mx-auto max-w-qris text-center" }, /* @__PURE__ */ React17.createElement(
    "span",
    {
      className: "mt-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success-strong",
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React17.createElement(CheckIcon, { size: 32 })
  ), /* @__PURE__ */ React17.createElement("h1", { className: "mt-3 text-h1 text-ink" }, "Pesanan diterima"), pesanan2?.code && /* @__PURE__ */ React17.createElement("p", { className: "mt-1 text-body text-ink-soft" }, "Kode order ", /* @__PURE__ */ React17.createElement("span", { className: "font-mono tabular-nums" }, pesanan2.code)), pesanan2?.paid_at && /* @__PURE__ */ React17.createElement("p", { className: "mt-1 text-meta tabular-nums text-slate-500" }, "Dibayar ", formatDateTime(pesanan2.paid_at))), flash?.success && /* @__PURE__ */ React17.createElement(InlineNotice, { tone: "success", className: "mt-4" }, /* @__PURE__ */ React17.createElement("p", null, flash.success)), flash?.error && /* @__PURE__ */ React17.createElement(InlineNotice, { tone: "error", className: "mt-4" }, /* @__PURE__ */ React17.createElement("p", null, flash.error)), /* @__PURE__ */ React17.createElement("section", { className: "card mt-6 p-6", "aria-labelledby": "judul-ringkasan" }, /* @__PURE__ */ React17.createElement("h2", { id: "judul-ringkasan", className: "text-h3 text-ink" }, "Ringkasan Pesanan"), /* @__PURE__ */ React17.createElement("ul", { className: "mt-4 flex flex-col gap-3" }, items.map((item2, index) => /* @__PURE__ */ React17.createElement("li", { key: `${item2.product_id ?? "x"}-${index}`, className: "flex items-start justify-between gap-4" }, /* @__PURE__ */ React17.createElement("span", { className: "min-w-0" }, /* @__PURE__ */ React17.createElement("span", { className: "block text-body text-ink" }, item2.name ?? "Produk"), /* @__PURE__ */ React17.createElement("span", { className: "block text-meta tabular-nums text-slate-500" }, item2.variant_label ? `${item2.variant_label} \xB7 ` : "", formatNumber(item2.qty), " \xD7 ", rupiah(item2.unit_price) ?? "-")), /* @__PURE__ */ React17.createElement("span", { className: "shrink-0 whitespace-nowrap text-body tabular-nums text-ink" }, rupiah(item2.line_total) ?? "-")))), /* @__PURE__ */ React17.createElement("div", { className: "mt-5 border-t border-line pt-4" }, /* @__PURE__ */ React17.createElement("dl", { className: "flex flex-col gap-3" }, /* @__PURE__ */ React17.createElement("div", { className: "flex items-baseline justify-between gap-4" }, /* @__PURE__ */ React17.createElement("dt", { className: "text-body text-ink-soft" }, "Subtotal"), /* @__PURE__ */ React17.createElement("dd", { className: "text-body tabular-nums text-ink" }, rupiah(pesanan2?.subtotal) ?? "-")), /* @__PURE__ */ React17.createElement("div", { className: "flex items-baseline justify-between gap-4" }, /* @__PURE__ */ React17.createElement("dt", { className: "text-body text-ink-soft" }, "Ongkir"), /* @__PURE__ */ React17.createElement("dd", { className: "text-body tabular-nums text-ink" }, rupiah(pesanan2?.shipping_cost) ?? "-")), /* @__PURE__ */ React17.createElement("div", { className: "flex items-baseline justify-between gap-4" }, /* @__PURE__ */ React17.createElement("dt", { className: "text-body font-bold text-ink" }, "Total"), /* @__PURE__ */ React17.createElement("dd", { className: "whitespace-nowrap text-h2 font-bold tabular-nums text-ink" }, rupiah(pesanan2?.total) ?? "-")))), pesanan2?.customer_name && /* @__PURE__ */ React17.createElement("div", { className: "mt-5 border-t border-line pt-5" }, /* @__PURE__ */ React17.createElement("h3", { className: "text-h3 text-ink" }, "Dikirim ke"), /* @__PURE__ */ React17.createElement("p", { className: "mt-2 text-body text-ink" }, pesanan2.customer_name), /* @__PURE__ */ React17.createElement("p", { className: "mt-1 text-meta text-slate-500" }, pesanan2.customer_phone ?? "-"), /* @__PURE__ */ React17.createElement("p", { className: "mt-2 text-body text-ink-soft" }, pesanan2.customer_address ?? "-", pesanan2.customer_city ? `, ${pesanan2.customer_city}` : "")), /* @__PURE__ */ React17.createElement("section", { className: "mt-5 border-t border-line pt-5", "aria-labelledby": "judul-pengiriman" }, /* @__PURE__ */ React17.createElement("h3", { id: "judul-pengiriman", className: "text-h3 text-ink" }, "Status pengiriman"), /* @__PURE__ */ React17.createElement("dl", { className: "mt-3 grid gap-3 sm:grid-cols-2" }, /* @__PURE__ */ React17.createElement(BarisKirim, { label: "Status" }, statusKirim ?? "\u2014"), /* @__PURE__ */ React17.createElement(BarisKirim, { label: "Resi" }, resi ? /* @__PURE__ */ React17.createElement(
    SalinButton,
    {
      value: resi,
      ariaLabel: `Salin nomor resi ${pesanan2?.code ?? ""}`.trim(),
      valueClassName: "font-mono tabular-nums"
    },
    resi
  ) : "Resi sedang disiapkan."), kurirKirim && /* @__PURE__ */ React17.createElement(BarisKirim, { label: "Kurir" }, kurirKirim), petugasKirim && /* @__PURE__ */ React17.createElement(BarisKirim, { label: "Petugas kurir" }, petugasKirim), diperbaruiKirim !== "-" && /* @__PURE__ */ React17.createElement(BarisKirim, { label: "Diperbarui" }, /* @__PURE__ */ React17.createElement("span", { className: "tabular-nums" }, diperbaruiKirim))), linkLacak && /* @__PURE__ */ React17.createElement(
    Button,
    {
      as: "a",
      variant: "secondary",
      href: linkLacak,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "mt-4"
    },
    "Lacak paket"
  ))), /* @__PURE__ */ React17.createElement("section", { className: "mt-8", "aria-labelledby": "judul-penilaian" }, /* @__PURE__ */ React17.createElement("h2", { id: "judul-penilaian", className: "text-h2 text-ink" }, tampilkanForm ? "Beri Penilaian" : "Penilaianmu"), errors?.ulasan && /* @__PURE__ */ React17.createElement(InlineNotice, { tone: "error", className: "mt-3" }, /* @__PURE__ */ React17.createElement("p", null, errors.ulasan)), alasanBelumBoleh && /* @__PURE__ */ React17.createElement(InlineNotice, { tone: "warning", className: "mt-3" }, /* @__PURE__ */ React17.createElement("p", null, "Ulasan bisa dikirim setelah pembayaran berhasil.")), sudahAda.length > 0 && pending.length === 0 && /* @__PURE__ */ React17.createElement(InlineNotice, { tone: "success", className: "mt-3" }, /* @__PURE__ */ React17.createElement("p", null, "Terima kasih! Penilaianmu membantu pembeli lain.")), /* @__PURE__ */ React17.createElement("div", { className: "mt-4 grid gap-4 lg:grid-cols-2" }, tampilkanForm && pending.map((item2) => /* @__PURE__ */ React17.createElement(
    ReviewForm,
    {
      key: `isi-${item2.product_id}`,
      productId: item2.product_id,
      product: item2,
      submitting: busyProduct === item2.product_id,
      error: errorFor(item2),
      onSubmit: submitReview
    }
  )), sudahAda.map((item2) => /* @__PURE__ */ React17.createElement(
    ReviewForm,
    {
      key: `sudah-${item2.product_id}`,
      productId: item2.product_id,
      product: item2,
      rating: justRated[item2.product_id] ?? 0,
      submitted: justRated[item2.product_id] !== void 0,
      alreadyReviewed: justRated[item2.product_id] === void 0
    }
  )))), /* @__PURE__ */ React17.createElement("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center" }, /* @__PURE__ */ React17.createElement(Button, { href: "/produk", variant: "secondary" }, "Lihat Produk Lain"), /* @__PURE__ */ React17.createElement(Button, { href: "/" }, "Kembali ke Beranda"))));
}

// resources/js/Pages/Public/History.jsx
import React22, { useEffect as useEffect6, useState as useState8 } from "react";

// resources/js/Components/EmptyState.jsx
import React18 from "react";
function EmptyState({
  title = "Belum ada data",
  description = null,
  actionLabel = null,
  actionHref = null,
  onAction = null,
  icon = null,
  className = ""
}) {
  return /* @__PURE__ */ React18.createElement("div", { className: cn("flex flex-col items-center gap-3 py-12 text-center", className) }, /* @__PURE__ */ React18.createElement("span", { className: "text-slate-300", "aria-hidden": "true" }, icon ?? /* @__PURE__ */ React18.createElement(ImageOffIcon, { size: 96 })), /* @__PURE__ */ React18.createElement("p", { className: "text-h3 text-ink" }, title), description && /* @__PURE__ */ React18.createElement("p", { className: "max-w-sm text-meta text-slate-600" }, description), actionLabel && onAction && /* @__PURE__ */ React18.createElement(Button, { variant: "secondary", onClick: onAction, className: "mt-2" }, actionLabel), actionLabel && !onAction && actionHref && /* @__PURE__ */ React18.createElement(Button, { variant: "secondary", href: actionHref, className: "mt-2" }, actionLabel));
}

// resources/js/Components/Pagination.jsx
import React19 from "react";
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
  return /* @__PURE__ */ React19.createElement(
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
      "aria-hidden": "true"
    },
    direction === "left" ? /* @__PURE__ */ React19.createElement("path", { d: "M15 6l-6 6 6 6" }) : /* @__PURE__ */ React19.createElement("path", { d: "M9 6l6 6-6 6" })
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
  return /* @__PURE__ */ React19.createElement("nav", { "aria-label": "Navigasi halaman", className: cn("flex items-center justify-center gap-1", className) }, /* @__PURE__ */ React19.createElement(
    "button",
    {
      type: "button",
      onClick: () => go(current - 1),
      disabled: current <= 1,
      "aria-label": "Halaman sebelumnya",
      className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45")
    },
    /* @__PURE__ */ React19.createElement(Chevron, { direction: "left" })
  ), /* @__PURE__ */ React19.createElement("span", { className: "px-2 text-meta text-ink-soft sm:hidden", "aria-live": "polite" }, current, " / ", last), /* @__PURE__ */ React19.createElement("div", { className: "hidden items-center gap-1 sm:flex" }, pages.map((page, index) => {
    const previous = pages[index - 1];
    const gap = previous && page - previous > 1;
    return /* @__PURE__ */ React19.createElement(React19.Fragment, { key: page }, gap && /* @__PURE__ */ React19.createElement("span", { className: "px-1 text-meta text-slate-400", "aria-hidden": "true" }, "..."), /* @__PURE__ */ React19.createElement(
      "button",
      {
        type: "button",
        onClick: () => go(page),
        "aria-current": page === current ? "page" : void 0,
        "aria-label": "Halaman " + page,
        className: cn(
          base,
          page === current ? "bg-brand-700 text-white" : "text-ink hover:bg-surface"
        )
      },
      page
    ));
  })), /* @__PURE__ */ React19.createElement(
    "button",
    {
      type: "button",
      onClick: () => go(current + 1),
      disabled: current >= last,
      "aria-label": "Halaman berikutnya",
      className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45")
    },
    /* @__PURE__ */ React19.createElement(Chevron, { direction: "right" })
  ));
}

// resources/js/Components/Skeleton.jsx
import React20 from "react";
var SHAPES = {
  text: "h-3 w-full",
  title: "h-6 w-2/3",
  card: "aspect-square w-full",
  row: "h-tableRow w-full",
  circle: "h-10 w-10 rounded-full"
};
function Skeleton({ variant = "text", count = 1, className = "" }) {
  return Array.from({ length: count }).map((_, index) => /* @__PURE__ */ React20.createElement(
    "div",
    {
      key: index,
      "aria-hidden": "true",
      className: cn("skeleton", SHAPES[variant] ?? SHAPES.text, className)
    }
  ));
}

// resources/js/Components/StatusBadge.jsx
import React21 from "react";
var TONES2 = {
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
  const tone = TONES2[key] ?? null;
  const text = label ?? tone?.label ?? (key === "" ? "-" : status);
  return /* @__PURE__ */ React21.createElement(
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

// resources/js/Pages/Public/History.jsx
var DASH = "\u2014";
var teks = (value) => {
  if (value === null || value === void 0) return DASH;
  const str = String(value).trim();
  return str === "" ? DASH : str;
};
var opsional = (value) => {
  if (value === null || value === void 0) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
};
var uang = (value) => rupiah(value) ?? DASH;
var toCount2 = (value) => {
  if (value === null || value === void 0 || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
};
var jumlah = (value) => {
  const angka = toCount2(value);
  return angka === null ? DASH : formatNumber(angka);
};
var waktu = (value) => {
  const hasil = formatDateTime(value);
  return hasil === "-" ? DASH : hasil;
};
var gabung = (...values) => {
  const isi2 = values.filter((value) => value !== null && value !== void 0 && String(value).trim() !== "").map((value) => String(value).trim());
  return isi2.length === 0 ? DASH : isi2.join(" \xB7 ");
};
var labelDetail = (order2) => order2?.payment_status === "settlement" ? "Lihat pesanan" : "Bayar sekarang";
function ItemThumb({ src }) {
  const [gagal2, setGagal] = useState8(false);
  useEffect6(() => {
    setGagal(false);
  }, [src]);
  if (!src || gagal2) {
    return /* @__PURE__ */ React22.createElement(
      "span",
      {
        className: "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface text-slate-300",
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React22.createElement(ImageOffIcon, { size: 24 })
    );
  }
  return /* @__PURE__ */ React22.createElement("span", { className: "h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface" }, /* @__PURE__ */ React22.createElement(
    "img",
    {
      src,
      alt: "",
      width: "64",
      height: "64",
      loading: "lazy",
      className: "h-full w-full object-cover",
      onError: () => setGagal(true)
    }
  ));
}
function Baris({ label, value, wrap = false }) {
  return /* @__PURE__ */ React22.createElement(
    "div",
    {
      className: cn(
        "flex gap-4",
        wrap ? "flex-col gap-1 sm:flex-row sm:items-start sm:justify-between" : "items-baseline justify-between"
      )
    },
    /* @__PURE__ */ React22.createElement("dt", { className: "shrink-0 text-body text-ink-soft" }, label),
    /* @__PURE__ */ React22.createElement(
      "dd",
      {
        className: cn(
          "min-w-0 text-body text-ink",
          wrap ? "break-words sm:text-right" : "whitespace-nowrap text-right tabular-nums"
        )
      },
      value
    )
  );
}
function Timeline({ status = null, paymentStatus = null, timeline = null }) {
  const nodes = [
    { key: "created", label: "Dibuat", time: timeline?.created_at ?? null },
    { key: "paid", label: "Dibayar", time: timeline?.paid_at ?? null },
    { key: "shipped", label: "Dikirim", time: timeline?.shipped_at ?? null }
  ];
  const terminal = status === "batal" ? { key: "batal", label: "Batal", danger: true } : paymentStatus === "expire" ? { key: "expire", label: "Kedaluwarsa", danger: true } : null;
  const tampil = terminal ? [...nodes.filter((node) => node.time !== null), { ...terminal, time: null }] : nodes;
  return /* @__PURE__ */ React22.createElement("ol", { className: "mt-3 flex flex-col gap-4 md:flex-row md:items-start md:gap-6" }, tampil.map((node) => {
    const aktif = Boolean(node.time);
    const bahaya = Boolean(node.danger);
    return /* @__PURE__ */ React22.createElement("li", { key: node.key, className: "flex items-start gap-3 md:flex-1 md:flex-col md:gap-2" }, /* @__PURE__ */ React22.createElement(
      "span",
      {
        "aria-hidden": "true",
        className: cn(
          "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full md:mt-0",
          bahaya ? "bg-danger" : aktif ? "bg-brand" : "bg-slate-300"
        )
      }
    ), /* @__PURE__ */ React22.createElement("span", { className: "min-w-0" }, /* @__PURE__ */ React22.createElement(
      "span",
      {
        className: cn(
          "block text-label",
          bahaya ? "text-danger-strong" : aktif ? "text-ink" : "text-slate-400"
        )
      },
      node.label
    ), /* @__PURE__ */ React22.createElement(
      "span",
      {
        className: cn(
          "mt-1 block text-meta tabular-nums",
          aktif ? "text-slate-500" : "text-slate-400"
        )
      },
      waktu(node.time)
    )));
  }));
}
function OrderCard({ order: order2 }) {
  const [buka, setBuka] = useState8(false);
  const items = Array.isArray(order2?.items) ? order2.items : [];
  const customer = order2?.customer ?? {};
  const shipping = order2?.shipping ?? {};
  const timeline = order2?.timeline ?? null;
  const jumlahBaris = toCount2(order2?.items_count) ?? items.length;
  const jumlahItem = toCount2(order2?.total_qty);
  const ringkasItem = jumlahBaris > 0 ? `${formatNumber(jumlahBaris)} item${jumlahItem !== null ? ` / ${formatNumber(jumlahItem)} qty` : ""}` : null;
  const detailUrl = order2?.detail_url ?? null;
  const headingId = `pesanan-${order2?.id ?? "tanpa-id"}`;
  const panelId = `rincian-${order2?.id ?? "tanpa-id"}`;
  const tujuan = gabung(customer.name, customer.city);
  const kurirLayanan = [shipping.courier_name, shipping.service_name].filter((value) => value !== null && value !== void 0 && String(value).trim() !== "").map((value) => String(value).trim()).join(" ") || DASH;
  const resi = shipping.tracking_number ? String(shipping.tracking_number) : null;
  const statusKirim = opsional(shipping.status_label);
  const petugasKirim = opsional(shipping.driver?.name);
  const teleponPetugas = opsional(shipping.driver?.phone);
  const diperbaruiKirim = waktu(shipping.updated_at);
  return /* @__PURE__ */ React22.createElement("article", { className: "card p-4 md:p-6", "aria-labelledby": headingId }, /* @__PURE__ */ React22.createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" }, /* @__PURE__ */ React22.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React22.createElement("h2", { id: headingId, className: "break-words font-mono text-h3 text-ink" }, teks(order2?.code)), /* @__PURE__ */ React22.createElement("div", { className: "mt-2 flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React22.createElement(StatusBadge, { status: order2?.status, label: order2?.status_label }), /* @__PURE__ */ React22.createElement(StatusBadge, { status: order2?.payment_status, label: order2?.payment_label })), /* @__PURE__ */ React22.createElement("div", { className: "mt-2 grid gap-0.5 text-meta text-slate-500 sm:grid-cols-2" }, /* @__PURE__ */ React22.createElement("p", { className: "tabular-nums" }, waktu(order2?.created_at)), ringkasItem && /* @__PURE__ */ React22.createElement("p", null, ringkasItem))), /* @__PURE__ */ React22.createElement("p", { className: "text-h3 font-bold text-ink sm:text-right" }, /* @__PURE__ */ React22.createElement("span", { className: "sr-only" }, "Total "), /* @__PURE__ */ React22.createElement("span", { className: "whitespace-nowrap tabular-nums" }, uang(order2?.total)))), /* @__PURE__ */ React22.createElement("div", { className: "mt-3 flex flex-col gap-1 border-t border-line pt-3" }, /* @__PURE__ */ React22.createElement("p", { className: "text-meta text-slate-600" }, "Dikirim ke ", /* @__PURE__ */ React22.createElement("span", { className: "text-ink" }, tujuan)), /* @__PURE__ */ React22.createElement("p", { className: "text-meta text-slate-600" }, kurirLayanan, resi && /* @__PURE__ */ React22.createElement(React22.Fragment, null, " \xB7 ", /* @__PURE__ */ React22.createElement("span", { className: "font-mono tabular-nums text-ink" }, resi))), statusKirim && /* @__PURE__ */ React22.createElement("p", { className: "text-meta text-ink" }, statusKirim)), /* @__PURE__ */ React22.createElement("div", { className: "mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-end" }, /* @__PURE__ */ React22.createElement(
    Button,
    {
      variant: "secondary",
      onClick: () => setBuka((nilai) => !nilai),
      "aria-expanded": buka,
      "aria-controls": panelId,
      className: "w-full sm:w-auto",
      icon: /* @__PURE__ */ React22.createElement(
        "span",
        {
          "aria-hidden": "true",
          className: cn(
            "transition-transform duration-accordion ease-smooth",
            buka ? "rotate-180" : "rotate-0"
          )
        },
        /* @__PURE__ */ React22.createElement(ChevronDownIcon, { size: 16 })
      )
    },
    "Lihat rincian"
  ), detailUrl && /* @__PURE__ */ React22.createElement(Button, { href: detailUrl, className: "w-full sm:w-auto" }, labelDetail(order2))), /* @__PURE__ */ React22.createElement(
    "div",
    {
      id: panelId,
      className: cn(
        "mt-4 flex-col gap-6 border-t border-line pt-4",
        buka ? "flex" : "hidden"
      )
    },
    /* @__PURE__ */ React22.createElement("section", { "aria-labelledby": `${panelId}-kirim` }, /* @__PURE__ */ React22.createElement("h3", { id: `${panelId}-kirim`, className: "text-h3 text-ink" }, "Pengiriman"), /* @__PURE__ */ React22.createElement("dl", { className: "mt-3 flex flex-col gap-2" }, /* @__PURE__ */ React22.createElement(Baris, { label: "Penerima", value: teks(customer.name) }), /* @__PURE__ */ React22.createElement(Baris, { label: "Telepon", value: teks(customer.phone) }), /* @__PURE__ */ React22.createElement(Baris, { label: "Alamat", value: teks(customer.address), wrap: true }), /* @__PURE__ */ React22.createElement(Baris, { label: "Kota", value: teks(customer.city) }), /* @__PURE__ */ React22.createElement(Baris, { label: "Kode pos", value: teks(customer.postal_code) }), /* @__PURE__ */ React22.createElement(Baris, { label: "Kurir / layanan", value: kurirLayanan, wrap: true }), /* @__PURE__ */ React22.createElement(
      Baris,
      {
        label: "Resi",
        wrap: true,
        value: resi ? /* @__PURE__ */ React22.createElement(
          SalinButton,
          {
            value: resi,
            ariaLabel: `Salin nomor resi ${teks(order2?.code)}`,
            valueClassName: "font-mono tabular-nums"
          }
        ) : "Resi belum tersedia."
      }
    ), /* @__PURE__ */ React22.createElement(Baris, { label: "Status pengiriman", value: teks(shipping.status_label), wrap: true }), petugasKirim && /* @__PURE__ */ React22.createElement(
      Baris,
      {
        label: "Petugas kurir",
        wrap: true,
        value: /* @__PURE__ */ React22.createElement(React22.Fragment, null, petugasKirim, teleponPetugas && /* @__PURE__ */ React22.createElement("span", { className: "mt-0.5 block text-meta tabular-nums" }, teleponPetugas))
      }
    ), diperbaruiKirim !== DASH && /* @__PURE__ */ React22.createElement(Baris, { label: "Diperbarui", value: diperbaruiKirim }))),
    /* @__PURE__ */ React22.createElement("section", { "aria-labelledby": `${panelId}-biaya` }, /* @__PURE__ */ React22.createElement("h3", { id: `${panelId}-biaya`, className: "text-h3 text-ink" }, "Rincian biaya"), /* @__PURE__ */ React22.createElement("dl", { className: "mt-3 flex flex-col gap-2" }, /* @__PURE__ */ React22.createElement(Baris, { label: "Subtotal", value: uang(order2?.subtotal) }), /* @__PURE__ */ React22.createElement(Baris, { label: "Ongkir", value: uang(order2?.shipping_cost) }), /* @__PURE__ */ React22.createElement(Baris, { label: "Diskon", value: uang(order2?.discount) }), /* @__PURE__ */ React22.createElement("div", { className: "flex items-baseline justify-between gap-4 border-t border-line pt-3" }, /* @__PURE__ */ React22.createElement("dt", { className: "text-body font-semibold text-ink" }, "Total"), /* @__PURE__ */ React22.createElement("dd", { className: "whitespace-nowrap text-h3 font-bold text-ink tabular-nums" }, uang(order2?.total))))),
    /* @__PURE__ */ React22.createElement("section", { "aria-labelledby": `${panelId}-item` }, /* @__PURE__ */ React22.createElement("h3", { id: `${panelId}-item`, className: "text-h3 text-ink" }, "Item"), items.length === 0 ? /* @__PURE__ */ React22.createElement("p", { className: "mt-3 text-meta text-slate-500" }, DASH) : /* @__PURE__ */ React22.createElement("ul", { className: "mt-3 divide-y divide-line" }, items.map((item2, index) => /* @__PURE__ */ React22.createElement(
      "li",
      {
        key: item2?.id ?? `${order2?.id ?? "pesanan"}-${index}`,
        className: "flex items-start gap-3 py-3"
      },
      /* @__PURE__ */ React22.createElement(ItemThumb, { src: item2?.image ?? null }),
      /* @__PURE__ */ React22.createElement("div", { className: "min-w-0 flex-1" }, item2?.product_id ? /* @__PURE__ */ React22.createElement(
        Link,
        {
          href: `/produk/${item2.product_id}`,
          className: "line-clamp-2 text-body text-ink underline-offset-4 hover:text-brand hover:underline"
        },
        teks(item2?.name)
      ) : /* @__PURE__ */ React22.createElement("p", { className: "line-clamp-2 text-body text-ink" }, teks(item2?.name)), item2?.variant_label && /* @__PURE__ */ React22.createElement("p", { className: "mt-0.5 text-meta text-slate-500" }, item2.variant_label), /* @__PURE__ */ React22.createElement("p", { className: "mt-1 text-meta text-slate-500" }, /* @__PURE__ */ React22.createElement("span", { className: "tabular-nums" }, jumlah(item2?.qty)), " \xD7", " ", /* @__PURE__ */ React22.createElement("span", { className: "tabular-nums" }, uang(item2?.unit_price)))),
      /* @__PURE__ */ React22.createElement("p", { className: "shrink-0 whitespace-nowrap text-label font-semibold text-ink tabular-nums" }, uang(item2?.line_total))
    )))),
    /* @__PURE__ */ React22.createElement("section", { "aria-labelledby": `${panelId}-timeline` }, /* @__PURE__ */ React22.createElement("h3", { id: `${panelId}-timeline`, className: "text-h3 text-ink" }, "Timeline"), /* @__PURE__ */ React22.createElement(
      Timeline,
      {
        status: order2?.status ?? null,
        paymentStatus: order2?.payment_status ?? null,
        timeline
      }
    ))
  ));
}
function SkeletonKartu() {
  return /* @__PURE__ */ React22.createElement("div", { className: "card p-4 md:p-6" }, /* @__PURE__ */ React22.createElement(Skeleton, { variant: "title" }), /* @__PURE__ */ React22.createElement(Skeleton, { variant: "text", className: "mt-3" }), /* @__PURE__ */ React22.createElement(Skeleton, { variant: "text", className: "mt-2 w-1/2" }));
}
function History({ orders = null, ringkasan = null }) {
  const page = usePage();
  const settings = page?.props?.settings ?? {};
  const daftar2 = Array.isArray(orders?.data) ? orders.data : [];
  const currentPage = Math.max(1, Number(orders?.meta?.current_page) || 1);
  const lastPage = Math.max(1, Number(orders?.meta?.last_page) || 1);
  const totalPesanan = toCount2(ringkasan?.total) ?? toCount2(orders?.meta?.total) ?? daftar2.length;
  const [memuat, setMemuat] = useState8(false);
  const [galat, setGalat] = useState8(null);
  const [halamanGagal, setHalamanGagal] = useState8(null);
  const muat = (halaman) => {
    if (memuat) return;
    const tujuan = Math.min(Math.max(1, Number(halaman) || 1), lastPage);
    setGalat(null);
    setHalamanGagal(tujuan);
    setMemuat(true);
    router.get("/history", tujuan > 1 ? { page: tujuan } : {}, {
      preserveState: true,
      onHttpException: (response) => {
        setGalat(`Server mengembalikan ${response.status}. Coba lagi beberapa saat.`);
        return false;
      },
      onNetworkError: () => {
        setGalat("Tidak bisa menghubungi server. Periksa koneksi internet, lalu coba lagi.");
        return false;
      },
      onFinish: () => setMemuat(false)
    });
  };
  const kosong = daftar2.length === 0;
  return /* @__PURE__ */ React22.createElement(PublicLayout, { settings }, /* @__PURE__ */ React22.createElement(Head, { title: "Riwayat Pesanan" }), /* @__PURE__ */ React22.createElement("div", { className: "container py-4" }, /* @__PURE__ */ React22.createElement("div", { className: "mx-auto w-full max-w-[1040px]" }, /* @__PURE__ */ React22.createElement(Breadcrumb, { items: [{ label: "Beranda", href: "/" }, { label: "Riwayat Pesanan" }] }), /* @__PURE__ */ React22.createElement("header", { className: "mt-2" }, /* @__PURE__ */ React22.createElement("h1", { className: "text-h1 text-ink" }, "Riwayat Pesanan"), totalPesanan > 0 && /* @__PURE__ */ React22.createElement("p", { className: "mt-1 max-w-[65ch] text-body text-ink-soft" }, `${formatNumber(totalPesanan)} pesanan tercatat di akunmu.`)), galat && /* @__PURE__ */ React22.createElement(InlineNotice, { tone: "error", title: "Riwayat pesanan gagal dimuat", className: "mt-4" }, /* @__PURE__ */ React22.createElement("p", null, galat), /* @__PURE__ */ React22.createElement(
    Button,
    {
      variant: "secondary",
      size: "sm",
      className: "mt-3",
      onClick: () => muat(halamanGagal ?? currentPage)
    },
    "Coba lagi"
  )), memuat ? /* @__PURE__ */ React22.createElement(
    "div",
    {
      className: "mt-6 flex flex-col gap-4",
      role: "status",
      "aria-busy": "true",
      "aria-label": "Memuat pesanan"
    },
    /* @__PURE__ */ React22.createElement(SkeletonKartu, null),
    /* @__PURE__ */ React22.createElement(SkeletonKartu, null),
    /* @__PURE__ */ React22.createElement(SkeletonKartu, null)
  ) : kosong ? /* @__PURE__ */ React22.createElement(
    EmptyState,
    {
      className: "mt-6",
      title: "Belum ada pesanan.",
      actionLabel: "Mulai belanja",
      actionHref: "/produk"
    }
  ) : /* @__PURE__ */ React22.createElement("ul", { className: "mt-6 flex flex-col gap-4" }, daftar2.map((order2) => /* @__PURE__ */ React22.createElement("li", { key: order2?.id ?? order2?.code }, /* @__PURE__ */ React22.createElement(OrderCard, { order: order2 })))), /* @__PURE__ */ React22.createElement(
    Pagination,
    {
      currentPage,
      lastPage,
      onPageChange: muat,
      className: "mt-8"
    }
  ))));
}

// tmp/ssr-v13-t_e3c1f107.mjs
var gagal = 0;
var cek = (nama, kondisi, info = "") => {
  if (kondisi) {
    console.log(`OK   ${nama}`);
  } else {
    gagal += 1;
    console.log(`GAGAL ${nama}${info ? ` \u2014 ${info}` : ""}`);
  }
};
var render = (element) => renderToStaticMarkup(element);
var tanpaNilaiAneh = (nama, html) => {
  cek(`${nama}: tanpa undefined/NaN`, !/undefined|NaN/.test(html), (html.match(/undefined|NaN/g) ?? []).join(","));
};
__setPageProps({ settings: {}, cart: { count: 0 }, auth: { user: { name: "Siti" } } });
var item = {
  product_id: 3,
  name: "Daster Batik Pekalongan",
  variant_label: "Ukuran L / Merah",
  qty: 1,
  unit_price: 34e4,
  line_total: 34e4,
  image: null
};
var pesanan = (shipping) => ({
  id: 21,
  code: "TK-20261020-0001",
  status: "dibayar",
  payment_status: "settlement",
  subtotal: 34e4,
  shipping_cost: 2e4,
  total: 36e4,
  customer_name: "Siti Aminah",
  customer_phone: "081234567890",
  customer_address: "Jl. Melati 12",
  customer_city: "Pekalongan",
  created_at: "2026-10-20T14:05:00+07:00",
  paid_at: "2026-10-20T14:09:00+07:00",
  items: [item],
  shipping
});
var SHIP_KOSONG = {
  courier_code: "jne",
  courier_name: "JNE",
  service_name: "REG",
  etd: "2-3 hari",
  weight_gram: 2e3,
  shipping_cost: 2e4,
  tracking_number: null,
  status: null,
  status_label: null,
  biteship_order_id: null,
  updated_at: null,
  driver: null,
  perlu_tindakan: false,
  tindakan: null,
  galat: null
};
var ulasan = { boleh: false, sudah: [] };
var selesaiKosong = render(/* @__PURE__ */ React23.createElement(CheckoutSuccess, { pesanan: pesanan(SHIP_KOSONG), ulasan }));
tanpaNilaiAneh("selesai/belum ada webhook", selesaiKosong);
cek('selesai/belum ada webhook: "Resi sedang disiapkan."', selesaiKosong.includes("Resi sedang disiapkan."));
cek('selesai/belum ada webhook: status "\u2014"', selesaiKosong.includes(">\u2014<"));
cek('selesai/belum ada webhook: tanpa "Lacak paket"', !selesaiKosong.includes("Lacak paket"));
cek('selesai: kop "Status pengiriman"', selesaiKosong.includes("Status pengiriman"));
var selesaiPicked = render(
  /* @__PURE__ */ React23.createElement(
    CheckoutSuccess,
    {
      pesanan: pesanan({
        ...SHIP_KOSONG,
        tracking_number: "JX1234567890",
        status: "picked",
        status_label: "Dikonfirmasi",
        updated_at: "2026-10-21T09:15:00+07:00",
        driver: { name: "Budi", phone: "081234567891", link: "https://track.contoh.id/BS-123" }
      }),
      ulasan
    }
  )
);
tanpaNilaiAneh("selesai/picked", selesaiPicked);
cek("selesai/picked: label status dari server", selesaiPicked.includes("Dikonfirmasi"));
cek("selesai/picked: resi + tombol salin", selesaiPicked.includes("JX1234567890") && selesaiPicked.includes("Salin nomor resi"));
cek("selesai/picked: petugas kurir", selesaiPicked.includes("Petugas kurir") && selesaiPicked.includes("Budi"));
cek("selesai/picked: diperbarui", selesaiPicked.includes("Diperbarui"));
cek(
  "selesai/picked: tautan lacak aman",
  selesaiPicked.includes("Lacak paket") && selesaiPicked.includes('href="https://track.contoh.id/BS-123"') && selesaiPicked.includes('target="_blank"') && selesaiPicked.includes('rel="noopener noreferrer"')
);
var selesaiDelivered = render(
  /* @__PURE__ */ React23.createElement(
    CheckoutSuccess,
    {
      pesanan: pesanan({
        ...SHIP_KOSONG,
        tracking_number: "JX1234567890",
        status: "delivered",
        status_label: "Terkirim",
        updated_at: "2026-10-22T10:00:00+07:00",
        driver: { name: null, phone: null, link: "javascript:alert(1)" }
      }),
      ulasan
    }
  )
);
tanpaNilaiAneh("selesai/delivered tanpa driver", selesaiDelivered);
cek('selesai/delivered: label "Terkirim"', selesaiDelivered.includes("Terkirim"));
cek("selesai: tautan non-http tidak dirender", !selesaiDelivered.includes("Lacak paket") && !selesaiDelivered.includes("javascript:"));
cek("selesai: baris Petugas kurir disembunyikan saat driver null", !selesaiDelivered.includes("Petugas kurir"));
var selesaiTanpaShipping = render(/* @__PURE__ */ React23.createElement(CheckoutSuccess, { pesanan: { ...pesanan(SHIP_KOSONG), shipping: null }, ulasan }));
tanpaNilaiAneh("selesai/tanpa shipping", selesaiTanpaShipping);
cek('selesai/tanpa shipping: tetap "Resi sedang disiapkan."', selesaiTanpaShipping.includes("Resi sedang disiapkan."));
var order = (id, extra) => ({
  id,
  code: `TK-2026102${id}-0001`,
  status: "pending",
  status_label: "Pending",
  payment_status: "pending",
  payment_label: "Menunggu pembayaran",
  subtotal: 34e4,
  shipping_cost: 2e4,
  discount: 0,
  total: 36e4,
  items_count: 1,
  total_qty: 1,
  created_at: "2026-10-23T09:00:00+07:00",
  paid_at: null,
  detail_url: null,
  customer: { name: "Siti Aminah", phone: "0812", address: "Jl. Melati 12", city: "Pekalongan", postal_code: "51100" },
  shipping: SHIP_KOSONG,
  timeline: { created_at: "2026-10-23T09:00:00+07:00", paid_at: null, shipped_at: null },
  items: [item],
  ...extra
});
var daftar = [
  order(42),
  order(43, {
    status: "dikirim",
    status_label: "Dikirim",
    shipping: {
      ...SHIP_KOSONG,
      tracking_number: "JX1234567890",
      status: "picked",
      status_label: "Dikonfirmasi",
      updated_at: "2026-10-21T09:15:00+07:00",
      driver: { name: "Budi", phone: "081234567891", link: "https://track.contoh.id/BS-123" }
    },
    timeline: { created_at: "2026-10-23T09:00:00+07:00", paid_at: "2026-10-23T09:05:00+07:00", shipped_at: "2026-10-24T08:30:00+07:00" }
  }),
  order(44, {
    status: "diproses",
    status_label: "Diproses",
    shipping: {
      ...SHIP_KOSONG,
      tracking_number: "JX999",
      status: "delivered",
      status_label: "Terkirim",
      updated_at: "2026-10-22T10:00:00+07:00",
      driver: null
    }
  }),
  order(45, {
    status: "selesai",
    status_label: "Selesai",
    shipping: {
      ...SHIP_KOSONG,
      tracking_number: "JX777",
      status: "delivered",
      status_label: "Terkirim",
      updated_at: "2026-10-25T11:00:00+07:00",
      driver: { name: "Budi", phone: "081234567891", link: "https://track.contoh.id/BS-777" }
    },
    timeline: { created_at: "2026-10-23T09:00:00+07:00", paid_at: "2026-10-23T09:05:00+07:00", shipped_at: "2026-10-24T08:30:00+07:00" }
  })
];
var riwayat = render(
  /* @__PURE__ */ React23.createElement(
    History,
    {
      orders: {
        data: daftar,
        links: [],
        meta: { current_page: 1, last_page: 1, per_page: 10, total: daftar.length }
      },
      ringkasan: { total: daftar.length, pending: 1, dibayar: 0, diproses: 1, dikirim: 1, selesai: 1, batal: 0 }
    }
  )
);
tanpaNilaiAneh("riwayat", riwayat);
cek("riwayat: resi kosong pakai copy existing", riwayat.includes("Resi belum tersedia."));
cek("riwayat: status_label tampil (Dikonfirmasi/Terkirim)", riwayat.includes("Dikonfirmasi") && riwayat.includes("Terkirim"));
cek("riwayat: baris Petugas kurir + telepon", riwayat.includes("Petugas kurir") && riwayat.includes("081234567891"));
cek("riwayat: baris Diperbarui", riwayat.includes("Diperbarui"));
cek("riwayat: timeline Dikirim pakai shipped_at", riwayat.includes("24 Okt 2026, 08.30"));
cek("riwayat: tanpa tautan lacak", !riwayat.includes("Lacak paket") && !riwayat.includes("track.contoh.id"));
cek("riwayat: tanpa harga aktual/selisih/payload", !/price_final|price_selisih|webhook/i.test(riwayat));
cek("riwayat: tanpa aksi ubah status / tindakan", !/Perlu tindakan|Ubah status/i.test(riwayat));
var riwayatDiproses = render(
  /* @__PURE__ */ React23.createElement(
    History,
    {
      orders: { data: [daftar[2]], links: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 } },
      ringkasan: { total: 1 }
    }
  )
);
tanpaNilaiAneh("riwayat/delivered-dari-diproses", riwayatDiproses);
cek(
  "riwayat/delivered-dari-diproses: label tampil, timeline Dikirim belum berisi waktu",
  riwayatDiproses.includes("Terkirim") && !riwayatDiproses.includes("08.30")
);
var riwayatKosong = render(
  /* @__PURE__ */ React23.createElement(History, { orders: { data: [], links: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } }, ringkasan: { total: 0 } })
);
tanpaNilaiAneh("riwayat kosong", riwayatKosong);
cek("riwayat kosong: EmptyState", riwayatKosong.includes("Belum ada pesanan."));
console.log(gagal === 0 ? "\nSEMUA CEK LULUS" : `
${gagal} CEK GAGAL`);
process.exit(gagal === 0 ? 0 : 1);
