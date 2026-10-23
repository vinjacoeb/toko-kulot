// tmp/uji-ssr-daftar-t_e3f68f7f.mjs
import fs from "node:fs";
import path from "node:path";
import React16 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// tmp/inertia-stub.jsx
import React from "react";
import { jsx } from "react/jsx-runtime";
var pageProps = {
  errors: {},
  auth: { user: null, admin: null },
  cart: { count: 0 },
  flash: { success: null, error: null },
  meta: { description: null },
  settings: { store_name: "Toko Kulot", store_logo: null, store_tagline: null }
};
var formErrors = {};
function __reset() {
  pageProps = {
    errors: {},
    auth: { user: null, admin: null },
    cart: { count: 0 },
    flash: { success: null, error: null },
    meta: { description: null },
    settings: { store_name: "Toko Kulot", store_logo: null, store_tagline: null }
  };
  formErrors = {};
}
function __setPageProps(next) {
  pageProps = { ...pageProps, ...next };
}
function __setFormErrors(next) {
  formErrors = next;
}
function usePage() {
  return { props: pageProps, url: "/", component: "", version: null };
}
function Head() {
  return null;
}
function Link({ href, children, ...rest }) {
  return /* @__PURE__ */ jsx("a", { href: typeof href === "string" ? href : "#", ...rest, children });
}
function useForm(initial = {}) {
  return {
    data: initial,
    setData: () => {
    },
    post: () => {
    },
    put: () => {
    },
    patch: () => {
    },
    delete: () => {
    },
    processing: false,
    errors: formErrors,
    hasErrors: Object.keys(formErrors).length > 0,
    reset: () => {
    },
    clearErrors: () => {
    },
    setError: () => {
    },
    transform: () => {
    }
  };
}
var router = { get: () => {
}, post: () => {
}, visit: () => {
}, reload: () => {
} };

// resources/js/Components/Header.jsx
import React4 from "react";

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");
var toList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
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
import React2 from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function IconButton({ label, badge = null, children, className = "", type = "button", ...rest }) {
  return /* @__PURE__ */ jsxs(
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
      ...rest,
      children: [
        children,
        badge !== null && badge !== void 0 && badge !== "" && /* @__PURE__ */ jsx2("span", { className: "absolute right-1 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-badge text-ink", children: badge })
      ]
    }
  );
}

// resources/js/Components/icons.jsx
import React3 from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var Svg = ({ size = 20, className = "", children, filled = false, ...rest }) => /* @__PURE__ */ jsx3(
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
var SearchIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("circle", { cx: "11", cy: "11", r: "7" }),
  /* @__PURE__ */ jsx3("path", { d: "m20.5 20.5-3.9-3.9" })
] });
var CartIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M3 4h2.2l2.1 10.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" }),
  /* @__PURE__ */ jsx3("circle", { cx: "10", cy: "20", r: "1.2" }),
  /* @__PURE__ */ jsx3("circle", { cx: "17.5", cy: "20", r: "1.2" })
] });
var MenuIcon = (props) => /* @__PURE__ */ jsx3(Svg, { ...props, children: /* @__PURE__ */ jsx3("path", { d: "M4 7h16M4 12h16M4 17h16" }) });
var CloseIcon = (props) => /* @__PURE__ */ jsx3(Svg, { ...props, children: /* @__PURE__ */ jsx3("path", { d: "M6 6l12 12M18 6 6 18" }) });
var CheckIcon = (props) => /* @__PURE__ */ jsx3(Svg, { ...props, children: /* @__PURE__ */ jsx3("path", { d: "m5 12.5 4.5 4.5L19 7" }) });
var TruckIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M2.5 7.5h10v8h-10z" }),
  /* @__PURE__ */ jsx3("path", { d: "M12.5 10.5h4l3 3v2h-7z" }),
  /* @__PURE__ */ jsx3("circle", { cx: "6", cy: "18", r: "1.6" }),
  /* @__PURE__ */ jsx3("circle", { cx: "16.5", cy: "18", r: "1.6" })
] });
var ReturnIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M4 9h9a5 5 0 0 1 0 10H8" }),
  /* @__PURE__ */ jsx3("path", { d: "m7.5 5.5-3.5 3.5 3.5 3.5" })
] });
var ShieldCheckIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M12 3.5l7 2.5v5.4c0 4-3 7.2-7 8.6-4-1.4-7-4.6-7-8.6V6l7-2.5z" }),
  /* @__PURE__ */ jsx3("path", { d: "m8.8 12 2.2 2.2 4.2-4.2" })
] });
var HeadsetIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" }),
  /* @__PURE__ */ jsx3("path", { d: "M4.5 13h2.2v5H5.6A1.6 1.6 0 0 1 4 16.4V13z" }),
  /* @__PURE__ */ jsx3("path", { d: "M19.5 13h-2.2v5h1.1a1.6 1.6 0 0 0 1.6-1.6V13z" }),
  /* @__PURE__ */ jsx3("path", { d: "M17.3 18v.6a2.4 2.4 0 0 1-2.4 2.4H12" })
] });
var UserIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("circle", { cx: "12", cy: "8.5", r: "3.5" }),
  /* @__PURE__ */ jsx3("path", { d: "M4.5 20a7.5 7.5 0 0 1 15 0" })
] });
var MailIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("rect", { x: "3", y: "5.5", width: "18", height: "13", rx: "2" }),
  /* @__PURE__ */ jsx3("path", { d: "m4 7 8 6 8-6" })
] });
var PhoneIcon = (props) => /* @__PURE__ */ jsx3(Svg, { ...props, children: /* @__PURE__ */ jsx3("path", { d: "M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" }) });
var MapPinIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" }),
  /* @__PURE__ */ jsx3("circle", { cx: "12", cy: "10", r: "2.6" })
] });
var AlertIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M12 4.5 21 20H3L12 4.5z" }),
  /* @__PURE__ */ jsx3("path", { d: "M12 10v4" }),
  /* @__PURE__ */ jsx3("path", { d: "M12 17h.01" })
] });
var SpinnerIcon = ({ size = 16, className = "" }) => /* @__PURE__ */ jsxs2(
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
      /* @__PURE__ */ jsx3("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "1.5", opacity: "0.25" }),
      /* @__PURE__ */ jsx3("path", { d: "M21 12a9 9 0 0 0-9-9", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ]
  }
);
var InstagramIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("rect", { x: "3.5", y: "3.5", width: "17", height: "17", rx: "5" }),
  /* @__PURE__ */ jsx3("circle", { cx: "12", cy: "12", r: "4" }),
  /* @__PURE__ */ jsx3("path", { d: "M17 7h.01" })
] });
var FacebookIcon = (props) => /* @__PURE__ */ jsx3(Svg, { ...props, children: /* @__PURE__ */ jsx3("path", { d: "M14.5 8.5h2.5V5h-2.5a4 4 0 0 0-4 4v2H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9.5a1 1 0 0 1 1-1z" }) });
var TikTokIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" }),
  /* @__PURE__ */ jsx3("path", { d: "M14 4c.5 2.4 2.2 3.9 4.5 4" })
] });
var WhatsAppIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M20 11.7A8 8 0 0 1 8.3 19L4 20l1-4.2A8 8 0 1 1 20 11.7z" }),
  /* @__PURE__ */ jsx3("path", { d: "M9 9.5c.6 2.2 2.3 3.9 4.5 4.5" })
] });
var LeafIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("path", { d: "M20 4c-8 0-13 3.5-13 9.5A5.5 5.5 0 0 0 12.5 19C18.5 19 20 12 20 4z" }),
  /* @__PURE__ */ jsx3("path", { d: "M4 21c1.5-5 5-8.5 9-10.5" })
] });
var ScissorsIcon = (props) => /* @__PURE__ */ jsxs2(Svg, { ...props, children: [
  /* @__PURE__ */ jsx3("circle", { cx: "6", cy: "6", r: "2.5" }),
  /* @__PURE__ */ jsx3("circle", { cx: "6", cy: "18", r: "2.5" }),
  /* @__PURE__ */ jsx3("path", { d: "M8.2 7.6 20 18M8.2 16.4 20 6" })
] });
var TRUST_ICONS = {
  truck: TruckIcon,
  shipping: TruckIcon,
  return: ReturnIcon,
  retur: ReturnIcon,
  refresh: ReturnIcon,
  qris: ShieldCheckIcon,
  payment: ShieldCheckIcon,
  secure: ShieldCheckIcon,
  support: HeadsetIcon,
  headset: HeadsetIcon,
  chat: HeadsetIcon,
  leaf: LeafIcon,
  scissors: ScissorsIcon,
  check: CheckIcon
};
var SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon
};

// resources/js/Components/Header.jsx
import { Fragment, jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
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
  const wordmark = logoUrl ? /* @__PURE__ */ jsx4("img", { src: logoUrl, alt: storeName, className: "h-8 w-auto", loading: "eager" }) : /* @__PURE__ */ jsx4("span", { className: "font-display text-h2 uppercase tracking-[0.02em] text-brand", children: storeName });
  return /* @__PURE__ */ jsx4(
    "header",
    {
      className: cn(
        "sticky top-0 z-header border-b bg-white",
        scrolled ? "border-line backdrop-blur-sm" : "border-transparent"
      ),
      children: /* @__PURE__ */ jsxs3("div", { className: "container flex h-headerMobile items-center justify-between gap-4 md:h-header", children: [
        /* @__PURE__ */ jsx4("div", { className: "flex items-center gap-2 md:hidden", children: /* @__PURE__ */ jsx4(IconButton, { label: "Buka menu", onClick: onOpenDrawer, className: "-ml-2", children: /* @__PURE__ */ jsx4(MenuIcon, { size: 20 }) }) }),
        /* @__PURE__ */ jsx4(Link, { href: "/", className: "flex items-center md:mr-6", "aria-label": `${storeName} \u2014 beranda`, children: wordmark }),
        /* @__PURE__ */ jsx4("nav", { className: "hidden flex-1 items-center gap-1 md:flex", "aria-label": "Navigasi utama", children: nav.map((item) => /* @__PURE__ */ jsx4(
          Link,
          {
            href: item.href,
            className: "px-3.5 py-3 text-meta text-ink hover:underline hover:decoration-accent-500 hover:decoration-2 hover:underline-offset-4",
            children: item.label
          },
          item.href ?? item.label
        )) }),
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx4(
            Link,
            {
              href: searchHref,
              "aria-label": "Cari produk",
              title: "Cari produk",
              className: "hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex",
              children: /* @__PURE__ */ jsx4(SearchIcon, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsx4(
            IconButton,
            {
              label: `Keranjang${count > 0 ? `, ${count} item` : ""}`,
              badge: count > 0 ? count : null,
              onClick: () => router.visit(cartHref),
              children: /* @__PURE__ */ jsx4(CartIcon, { size: 20 })
            }
          ),
          user ? /* @__PURE__ */ jsxs3("div", { className: "hidden items-center gap-2 md:flex", children: [
            /* @__PURE__ */ jsx4("span", { className: "max-w-[120px] truncate text-meta text-ink", children: user.name ?? user.email ?? "Akun" }),
            /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                onClick: () => router.post("/logout"),
                className: "text-meta text-brand underline underline-offset-4",
                children: "Keluar"
              }
            )
          ] }) : /* @__PURE__ */ jsxs3(Fragment, { children: [
            /* @__PURE__ */ jsx4(
              Link,
              {
                href: loginHref,
                "aria-label": "Masuk",
                title: "Masuk",
                className: "hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex",
                children: /* @__PURE__ */ jsx4(UserIcon, { size: 20 })
              }
            ),
            /* @__PURE__ */ jsx4(
              Link,
              {
                href: "/register",
                className: "hidden text-meta text-brand underline underline-offset-4 md:inline-flex",
                children: "Daftar"
              }
            )
          ] })
        ] })
      ] })
    }
  );
}

// resources/js/Layouts/PublicLayout.jsx
import React8, { useState as useState2 } from "react";

// resources/js/Components/Announcement.jsx
import React5 from "react";
import { jsx as jsx5 } from "react/jsx-runtime";
function Announcement({ text = null, href = null }) {
  if (!text) return null;
  const content = /* @__PURE__ */ jsx5("span", { className: "text-meta text-white", children: text });
  return /* @__PURE__ */ jsx5("div", { className: "flex h-9 items-center justify-center bg-brand-700 px-4 text-center", children: href ? /* @__PURE__ */ jsx5(Link, { href, className: "underline-offset-4 hover:underline", children: content }) : content });
}

// resources/js/Components/Footer.jsx
import React6 from "react";
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
function Footer({
  about = null,
  links = [],
  social = [],
  contact = null,
  storeName = "Toko Kulot"
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
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsx6("footer", { className: "bg-footer pb-8 pt-section text-white/75", children: /* @__PURE__ */ jsxs4("div", { className: "container", children: [
    /* @__PURE__ */ jsxs4("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-gutterLg", children: [
      /* @__PURE__ */ jsxs4("div", { className: "md:col-span-1", children: [
        /* @__PURE__ */ jsx6("p", { className: "font-display text-h2 uppercase text-white", children: storeName }),
        about && /* @__PURE__ */ jsx6("p", { className: "mt-3 max-w-xs text-meta text-white/75", children: about }),
        socialItems.length > 0 && /* @__PURE__ */ jsx6("ul", { className: "mt-4 flex items-center gap-3", children: socialItems.map((item) => {
          const Icon = SOCIAL_ICONS[String(item.name).toLowerCase()];
          if (!Icon) return null;
          return /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(
            "a",
            {
              href: item.href,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": item.label ?? item.name,
              className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors duration-hover hover:border-white/50 hover:text-white",
              children: /* @__PURE__ */ jsx6(Icon, { size: 20 })
            }
          ) }, `${item.name}-${item.href}`);
        }) })
      ] }),
      columns.map((column) => /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx6("p", { className: "text-badge uppercase text-white", children: column.title }),
        /* @__PURE__ */ jsx6("ul", { className: "mt-3 space-y-2", children: column.items.map((item) => /* @__PURE__ */ jsx6("li", { children: item.href?.startsWith("http") ? /* @__PURE__ */ jsx6(
          "a",
          {
            href: item.href,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-meta text-white/75 hover:text-white hover:underline",
            children: item.label
          }
        ) : /* @__PURE__ */ jsx6(
          Link,
          {
            href: item.href ?? "#",
            className: "text-meta text-white/75 hover:text-white hover:underline",
            children: item.label
          }
        ) }, `${column.title}-${item.label}`)) })
      ] }, column.title)),
      contactRows.length > 0 && /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx6("p", { className: "text-badge uppercase text-white", children: "Hubungi Kami" }),
        /* @__PURE__ */ jsx6("ul", { className: "mt-3 space-y-2", children: contactRows.map((row) => /* @__PURE__ */ jsxs4("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx6("span", { className: "mt-0.5 shrink-0 text-white/60", children: /* @__PURE__ */ jsx6(row.icon, { size: 20 }) }),
          row.href ? /* @__PURE__ */ jsx6(
            "a",
            {
              href: row.href,
              className: "text-meta text-white/75 hover:text-white hover:underline",
              children: row.text
            }
          ) : /* @__PURE__ */ jsx6("span", { className: "text-meta text-white/75", children: row.text })
        ] }, row.text)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "mt-10 border-t border-white/15 pt-6", children: /* @__PURE__ */ jsx6("p", { className: "text-meta text-white/60", children: `\xA9 ${year} ${storeName}. Semua hak dilindungi.` }) })
  ] }) });
}

// resources/js/Components/NavDrawer.jsx
import React7, { useEffect as useEffect2, useRef as useRef2 } from "react";
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
function NavDrawer({ open = false, nav = [], onClose, title = "Menu", footer = null }) {
  const panelRef = useRef2(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);
  useEffect2(() => {
    if (!open) return void 0;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs5("div", { className: "fixed inset-0 z-drawer", children: [
    /* @__PURE__ */ jsx7(
      "button",
      {
        type: "button",
        "aria-label": "Tutup menu",
        onClick: onClose,
        className: "absolute inset-0 h-full w-full cursor-default bg-black/50"
      }
    ),
    /* @__PURE__ */ jsxs5(
      "div",
      {
        ref: panelRef,
        role: "dialog",
        "aria-modal": "true",
        "aria-label": title,
        tabIndex: -1,
        className: cn(
          "relative flex h-screen w-drawer max-w-[84%] flex-col bg-white animate-drawer-in"
        ),
        children: [
          /* @__PURE__ */ jsxs5("div", { className: "flex h-header items-center justify-between border-b border-line px-4", children: [
            /* @__PURE__ */ jsx7("span", { className: "text-badge uppercase text-slate-500", children: title }),
            /* @__PURE__ */ jsx7(
              "button",
              {
                type: "button",
                onClick: onClose,
                "aria-label": "Tutup menu",
                className: "inline-flex h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface",
                children: /* @__PURE__ */ jsx7(CloseIcon, { size: 20 })
              }
            )
          ] }),
          /* @__PURE__ */ jsx7("nav", { className: "flex-1 overflow-y-auto", "aria-label": "Navigasi utama", children: /* @__PURE__ */ jsx7("ul", { children: nav.map((item) => /* @__PURE__ */ jsx7("li", { children: /* @__PURE__ */ jsx7(
            Link,
            {
              href: item.href,
              onClick: onClose,
              className: "flex h-drawerItem items-center border-b border-line px-4 text-label text-ink transition-colors duration-hover hover:bg-surface",
              children: item.label
            }
          ) }, item.href ?? item.label)) }) }),
          footer && /* @__PURE__ */ jsx7("div", { className: "border-t border-line p-4", children: footer })
        ]
      }
    )
  ] });
}

// resources/js/Layouts/PublicLayout.jsx
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
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
function PublicLayout({ settings = {}, cartCount = null, user = null, children }) {
  const [drawerOpen, setDrawerOpen] = useState2(false);
  const page = usePage();
  const storeName = settings?.store_name ?? "Toko Kulot";
  const rawNav = settings?.header_nav;
  const nav = Array.isArray(rawNav) && rawNav.length > 0 ? rawNav.filter((item) => item && item.label && hrefOf(item)).map((item) => ({ label: item.label, href: hrefOf(item) })) : DEFAULT_NAV;
  const announcement = settings?.landing_sections?.announcement ?? null;
  const announcementText = announcement?.text ?? settings?.announcement_text ?? null;
  const announcementHref = announcement ? hrefOf(announcement) : settings?.announcement_href ?? null;
  const currentUser = user ?? page?.props?.auth?.user ?? null;
  const count = toCount(page?.props?.cart?.count) ?? toCount(cartCount) ?? toCount(settings?.cart_count) ?? 0;
  return /* @__PURE__ */ jsxs6("div", { className: "flex min-h-screen flex-col bg-white text-ink", children: [
    /* @__PURE__ */ jsx8(
      "a",
      {
        href: "#konten-utama",
        className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white",
        children: "Lewati ke konten utama"
      }
    ),
    /* @__PURE__ */ jsx8(Announcement, { text: announcementText, href: announcementHref }),
    /* @__PURE__ */ jsx8(
      Header,
      {
        nav,
        cartCount: count,
        user: currentUser,
        storeName,
        logoUrl: settings?.store_logo ?? settings?.logo_url ?? null,
        onOpenDrawer: () => setDrawerOpen(true)
      }
    ),
    /* @__PURE__ */ jsx8(
      NavDrawer,
      {
        open: drawerOpen,
        nav,
        onClose: () => setDrawerOpen(false),
        title: "Menu",
        footer: currentUser ? /* @__PURE__ */ jsx8("p", { className: "text-meta text-ink-soft", children: `Masuk sebagai ${currentUser.name ?? currentUser.email ?? "Akun"}` }) : /* @__PURE__ */ jsxs6("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx8(Link, { href: "/register", className: "btn-primary w-full justify-center", children: "Daftar" }),
          /* @__PURE__ */ jsx8(Link, { href: "/login", className: "btn-secondary w-full justify-center", children: "Masuk" })
        ] })
      }
    ),
    /* @__PURE__ */ jsx8("main", { id: "konten-utama", className: "flex-1", children }),
    /* @__PURE__ */ jsx8(
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
        storeName
      }
    )
  ] });
}

// resources/js/Pages/Public/Auth/Login.jsx
import React14 from "react";

// resources/js/Layouts/AuthLayout.jsx
import React9 from "react";
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
function AuthLayout({ title, heading, lead = null, settings = null, children }) {
  const page = usePage();
  const source = settings ?? page?.props?.settings ?? null;
  const storeName = source?.store_name ?? "Toko Kulot";
  const tagline = source?.store_tagline ?? source?.tagline ?? null;
  const logoUrl = source?.store_logo ?? source?.logo_url ?? null;
  const bullets = toList(source?.landing_sections?.trust_strip).filter((item) => item && (item.title || item.label)).slice(0, 3).map((item) => ({
    icon: item.icon ?? "check",
    title: item.title ?? item.label,
    subtitle: item.subtitle ?? item.description ?? item.body ?? null
  }));
  return /* @__PURE__ */ jsxs7("div", { className: "min-h-screen bg-white text-ink lg:grid lg:grid-cols-2", children: [
    /* @__PURE__ */ jsx9(Head, { title }),
    /* @__PURE__ */ jsx9(
      "a",
      {
        href: "#konten-utama",
        className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white",
        children: "Lewati ke konten utama"
      }
    ),
    /* @__PURE__ */ jsxs7("aside", { className: "flex h-[160px] flex-col justify-center gap-3 bg-brand-700 px-6 py-6 text-white lg:h-auto lg:justify-between lg:gap-10 lg:px-12 lg:py-14", children: [
      /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-3", children: [
        logoUrl && /* @__PURE__ */ jsx9("img", { src: logoUrl, alt: "", className: "h-10 w-auto" }),
        /* @__PURE__ */ jsx9("span", { className: "font-display text-h2 uppercase text-white", children: storeName })
      ] }),
      tagline && /* @__PURE__ */ jsx9("p", { className: "hidden text-body text-white/75 lg:block", children: tagline }),
      bullets.length > 0 && /* @__PURE__ */ jsx9("ul", { className: "hidden space-y-5 lg:block", children: bullets.map((item, index) => {
        const Icon = TRUST_ICONS[String(item.icon).toLowerCase()] ?? TRUST_ICONS.check;
        return /* @__PURE__ */ jsxs7("li", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx9("span", { className: "mt-0.5 shrink-0 text-accent-500", "aria-hidden": "true", children: /* @__PURE__ */ jsx9(Icon, { size: 22 }) }),
          /* @__PURE__ */ jsxs7("span", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx9("span", { className: "block text-label text-white", children: item.title }),
            item.subtitle && /* @__PURE__ */ jsx9("span", { className: "mt-0.5 block text-meta text-white/75", children: item.subtitle })
          ] })
        ] }, `${item.icon}-${index}`);
      }) })
    ] }),
    /* @__PURE__ */ jsx9("main", { id: "konten-utama", className: "flex items-center justify-center px-4 py-10 lg:px-12 lg:py-16", children: /* @__PURE__ */ jsxs7("div", { className: "w-full max-w-form", children: [
      /* @__PURE__ */ jsx9("h1", { className: "text-h1 text-ink", children: heading }),
      lead && /* @__PURE__ */ jsx9("p", { className: "mt-2 text-body text-ink-soft", children: lead }),
      /* @__PURE__ */ jsx9("div", { className: "mt-6", children })
    ] }) })
  ] });
}

// resources/js/Components/Button.jsx
import React10 from "react";
import { Fragment as Fragment2, jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
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
  const content = loading ? /* @__PURE__ */ jsxs8(Fragment2, { children: [
    /* @__PURE__ */ jsx10(SpinnerIcon, { size: 16 }),
    /* @__PURE__ */ jsx10("span", { children: "Memproses\u2026" })
  ] }) : /* @__PURE__ */ jsxs8(Fragment2, { children: [
    icon,
    /* @__PURE__ */ jsx10("span", { children })
  ] });
  if (as === "a") {
    return /* @__PURE__ */ jsx10("a", { href, className: classes, ...rest, children: content });
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ jsx10(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest, children: content });
  }
  return /* @__PURE__ */ jsx10(
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

// resources/js/Components/Field.jsx
import React11 from "react";
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

// resources/js/Components/InlineNotice.jsx
import React12 from "react";
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs10(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn("flex items-start gap-3 rounded-md p-4", TONES[tone] ?? TONES.info, className),
      children: [
        /* @__PURE__ */ jsx12("span", { className: cn("mt-0.5 shrink-0", ICON_TONES[tone] ?? ICON_TONES.info), "aria-hidden": "true", children: /* @__PURE__ */ jsx12(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs10("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx12("p", { className: "text-label", children: title }),
          children && /* @__PURE__ */ jsx12("div", { className: "text-meta text-ink-soft", children })
        ] }),
        onDismiss && /* @__PURE__ */ jsx12(
          "button",
          {
            type: "button",
            onClick: onDismiss,
            "aria-label": "Tutup pesan",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60",
            children: /* @__PURE__ */ jsx12(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}

// resources/js/Components/Input.jsx
import React13 from "react";
import { jsx as jsx13 } from "react/jsx-runtime";
var BASE = "w-full h-field rounded-md border border-line bg-white px-3.5 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Input({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx13(
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

// resources/js/Pages/Public/Auth/Login.jsx
import { jsx as jsx14, jsxs as jsxs11 } from "react/jsx-runtime";
function Login({ status = null, settings = null, flash = null }) {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false
  });
  const submit = (e) => {
    e.preventDefault();
    if (processing) return;
    post("/login");
  };
  return /* @__PURE__ */ jsxs11(AuthLayout, { title: "Masuk", heading: "Masuk", settings, children: [
    flash?.success && /* @__PURE__ */ jsx14(InlineNotice, { tone: "success", className: "mb-4", children: /* @__PURE__ */ jsx14("p", { children: flash.success }) }),
    flash?.error && /* @__PURE__ */ jsx14(InlineNotice, { tone: "error", className: "mb-4", children: /* @__PURE__ */ jsx14("p", { children: flash.error }) }),
    status && /* @__PURE__ */ jsx14(InlineNotice, { tone: "info", className: "mb-4", children: /* @__PURE__ */ jsx14("p", { children: status }) }),
    /* @__PURE__ */ jsxs11("form", { onSubmit: submit, className: "space-y-4", noValidate: true, children: [
      /* @__PURE__ */ jsx14(Field, { label: "Email", htmlFor: "login-email", required: true, error: errors.email, children: /* @__PURE__ */ jsx14(
        Input,
        {
          id: "login-email",
          name: "email",
          type: "email",
          autoComplete: "email",
          value: data.email,
          onChange: (e) => setData("email", e.target.value),
          error: errors.email
        }
      ) }),
      /* @__PURE__ */ jsx14(Field, { label: "Kata Sandi", htmlFor: "login-password", required: true, error: errors.password, children: /* @__PURE__ */ jsx14(
        Input,
        {
          id: "login-password",
          name: "password",
          type: "password",
          autoComplete: "current-password",
          value: data.password,
          onChange: (e) => setData("password", e.target.value),
          error: errors.password
        }
      ) }),
      /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx14(
          "input",
          {
            id: "login-remember",
            name: "remember",
            type: "checkbox",
            checked: data.remember,
            onChange: (e) => setData("remember", e.target.checked),
            className: "h-4 w-4 rounded-sm border border-line accent-brand"
          }
        ),
        /* @__PURE__ */ jsx14("label", { htmlFor: "login-remember", className: "text-meta text-ink", children: "Ingat Saya" })
      ] }),
      /* @__PURE__ */ jsx14(Button, { type: "submit", fullWidth: true, loading: processing, children: "Masuk" })
    ] }),
    /* @__PURE__ */ jsx14("p", { className: "mt-4 text-meta", children: /* @__PURE__ */ jsx14(Link, { href: "/forgot-password", className: "text-brand underline underline-offset-4", children: "Lupa kata sandi?" }) }),
    /* @__PURE__ */ jsxs11("p", { className: "mt-4 text-meta", children: [
      "Belum punya akun?",
      " ",
      /* @__PURE__ */ jsx14(Link, { href: "/register", className: "text-brand underline underline-offset-4", children: "Daftar" })
    ] })
  ] });
}

// resources/js/Pages/Public/Auth/Register.jsx
import React15 from "react";
import { jsx as jsx15, jsxs as jsxs12 } from "react/jsx-runtime";
function Register({ settings = null, flash = null }) {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    terms: false
  });
  const submit = (e) => {
    e.preventDefault();
    if (processing) return;
    post("/register");
  };
  return /* @__PURE__ */ jsxs12(AuthLayout, { title: "Daftar Akun", heading: "Daftar Akun", settings, children: [
    flash?.success && /* @__PURE__ */ jsx15(InlineNotice, { tone: "success", className: "mb-4", children: /* @__PURE__ */ jsx15("p", { children: flash.success }) }),
    flash?.error && /* @__PURE__ */ jsx15(InlineNotice, { tone: "error", className: "mb-4", children: /* @__PURE__ */ jsx15("p", { children: flash.error }) }),
    /* @__PURE__ */ jsxs12("form", { onSubmit: submit, className: "space-y-4", noValidate: true, children: [
      /* @__PURE__ */ jsx15(Field, { label: "Nama", htmlFor: "register-name", required: true, error: errors.name, children: /* @__PURE__ */ jsx15(
        Input,
        {
          id: "register-name",
          name: "name",
          type: "text",
          autoComplete: "name",
          value: data.name,
          onChange: (e) => setData("name", e.target.value),
          error: errors.name
        }
      ) }),
      /* @__PURE__ */ jsx15(Field, { label: "Email", htmlFor: "register-email", required: true, error: errors.email, children: /* @__PURE__ */ jsx15(
        Input,
        {
          id: "register-email",
          name: "email",
          type: "email",
          autoComplete: "email",
          value: data.email,
          onChange: (e) => setData("email", e.target.value),
          error: errors.email
        }
      ) }),
      /* @__PURE__ */ jsx15(Field, { label: "Nomor WhatsApp", htmlFor: "register-phone", required: true, error: errors.phone, children: /* @__PURE__ */ jsx15(
        Input,
        {
          id: "register-phone",
          name: "phone",
          type: "text",
          inputMode: "tel",
          autoComplete: "tel",
          value: data.phone,
          onChange: (e) => setData("phone", e.target.value),
          error: errors.phone
        }
      ) }),
      /* @__PURE__ */ jsx15(Field, { label: "Kata Sandi", htmlFor: "register-password", required: true, error: errors.password, children: /* @__PURE__ */ jsx15(
        Input,
        {
          id: "register-password",
          name: "password",
          type: "password",
          autoComplete: "new-password",
          value: data.password,
          onChange: (e) => setData("password", e.target.value),
          error: errors.password
        }
      ) }),
      /* @__PURE__ */ jsx15(
        Field,
        {
          label: "Konfirmasi Kata Sandi",
          htmlFor: "register-password-confirmation",
          required: true,
          error: errors.password_confirmation,
          children: /* @__PURE__ */ jsx15(
            Input,
            {
              id: "register-password-confirmation",
              name: "password_confirmation",
              type: "password",
              autoComplete: "new-password",
              value: data.password_confirmation,
              onChange: (e) => setData("password_confirmation", e.target.value),
              error: errors.password_confirmation
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs12("div", { children: [
        /* @__PURE__ */ jsxs12("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx15(
            "input",
            {
              id: "register-terms",
              name: "terms",
              type: "checkbox",
              checked: data.terms,
              onChange: (e) => setData("terms", e.target.checked),
              "aria-invalid": errors.terms ? "true" : void 0,
              "aria-describedby": errors.terms ? "register-terms-error" : void 0,
              className: "mt-0.5 h-4 w-4 rounded-sm border border-line accent-brand"
            }
          ),
          /* @__PURE__ */ jsx15("label", { htmlFor: "register-terms", className: "text-meta text-ink", children: "Saya menyetujui syarat dan ketentuan." })
        ] }),
        errors.terms && /* @__PURE__ */ jsx15("p", { id: "register-terms-error", role: "alert", className: "mt-1.5 text-meta text-danger-strong", children: errors.terms })
      ] }),
      /* @__PURE__ */ jsx15(Button, { type: "submit", fullWidth: true, loading: processing, children: "Daftar" })
    ] }),
    /* @__PURE__ */ jsxs12("p", { className: "mt-4 text-meta", children: [
      "Sudah punya akun?",
      " ",
      /* @__PURE__ */ jsx15(Link, { href: "/login", className: "text-brand underline underline-offset-4", children: "Masuk" })
    ] })
  ] });
}

// tmp/uji-ssr-daftar-t_e3f68f7f.mjs
var AKAR = path.resolve(".");
var hasil = [];
var uji = (nama, fn) => {
  try {
    fn();
    hasil.push({ status: "OK", nama, catatan: "" });
  } catch (galat) {
    hasil.push({ status: "GAGAL", nama, catatan: galat.message });
  }
};
var harus = (syarat, pesan) => {
  if (!syarat) throw new Error(pesan);
};
var teks = (html) => html.replace(/<[^>]+>/g, " ").replace(/&#?\w+;/g, " ").replace(/\s+/g, " ").trim();
var esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var hitung = (html, potongan) => html.split(potongan).length - 1;
var tautanDengan = (html, href) => {
  const m = html.match(new RegExp(`<a [^>]*href="${esc(href)}"[^>]*>(.*?)</a>`, "s"));
  if (!m) return null;
  return { tag: m[0].slice(0, m[0].indexOf(">") + 1), dalam: m[1].replace(/\s+/g, " ").trim(), penuh: m[0] };
};
var tautanBerlabel = (html, label) => {
  const semua = [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  return semua.filter((m) => m[2].replace(/\s+/g, " ").trim() === label).map((m) => m[1]);
};
var baca = (berkas) => fs.readFileSync(path.join(AKAR, berkas), "utf8");
var tanpaKomentar = (isi) => isi.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^[ \t]*\/\/.*$/gm, " ");
var render = (Komponen, props = {}, pageProps2 = {}, formErrors2 = {}) => {
  __reset();
  __setPageProps(pageProps2);
  __setFormErrors(formErrors2);
  return renderToStaticMarkup(React16.createElement(Komponen, props));
};
var NAV = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/produk" },
  { label: "Kontak", href: "/kontak-kami" }
];
var KELAS_TAUTAN_AUTH = "text-brand underline underline-offset-4";
var KELAS_PINTU_DAFTAR = ["hidden", "text-meta", "text-brand", "underline", "underline-offset-4", "md:inline-flex"];
var htmlTamu = "";
var htmlPembeli = "";
uji("A1 Header tamu merender tanpa galat", () => {
  htmlTamu = render(Header, { nav: NAV, cartCount: 2, user: null, storeName: "Toko Kulot" });
  harus(htmlTamu.includes("<header"), "header tidak dirender");
});
uji('A2 Header tamu: tepat satu tautan /register bertulis "Daftar"', () => {
  harus(hitung(htmlTamu, 'href="/register"') === 1, `jumlah href="/register" = ${hitung(htmlTamu, 'href="/register"')}`);
  const a = tautanDengan(htmlTamu, "/register");
  harus(a, "anchor /register tidak ditemukan");
  harus(a.dalam === "Daftar", `teks tautan bukan "Daftar": ${a ? a.dalam : "tidak ada"}`);
});
uji("A3 Header tamu: kelas tautan Daftar persis pola aksi header (D14)", () => {
  const a = tautanDengan(htmlTamu, "/register");
  harus(a, "anchor /register tidak ditemukan");
  for (const kelas of KELAS_PINTU_DAFTAR) {
    harus(a.tag.includes(kelas), `kelas ${kelas} tidak ada di ${a.tag}`);
  }
  for (const kelas of ["px-3.5", "py-3", "hover:underline"]) {
    harus(!a.tag.includes(kelas), `tautan Daftar memakai kelas item nav ${kelas}: ${a.tag}`);
  }
  harus(!a.dalam.includes("<svg"), "tautan Daftar berisi ikon");
});
uji("A4 Header tamu: tautan Daftar disembunyikan < md (hidden + md:inline-flex)", () => {
  const a = tautanDengan(htmlTamu, "/register");
  harus(a, "anchor /register tidak ditemukan");
  harus(/\bhidden\b/.test(a.tag), `kelas hidden tidak ada: ${a.tag}`);
  harus(a.tag.includes("md:inline-flex"), `kelas md:inline-flex tidak ada: ${a.tag}`);
  harus(!a.tag.includes("md:hidden"), `tautan Daftar justru disembunyikan >= md: ${a.tag}`);
});
uji("A5 Header tamu: ikon Masuk tetap ada dan Daftar berada di sebelah kanannya", () => {
  const masuk = tautanDengan(htmlTamu, "/login");
  harus(masuk, "ikon Masuk (anchor /login) tidak ada");
  harus(masuk.tag.includes('aria-label="Masuk"'), `ikon Masuk kehilangan aria-label: ${masuk.tag}`);
  harus(masuk.dalam.includes("<svg"), "ikon Masuk bukan ikon lagi");
  const aMasuk = htmlTamu.indexOf('href="/login"');
  const aDaftar = htmlTamu.indexOf('href="/register"');
  harus(aMasuk < aDaftar, `urutan salah: login@${aMasuk}, register@${aDaftar}`);
});
uji("A6 Header tamu: navigasi, hamburger, cari, keranjang tidak berubah", () => {
  for (const item of NAV) {
    const href = tautanBerlabel(htmlTamu, item.label);
    harus(href.includes(item.href), `item nav ${item.label} hilang/berubah: ${href.join(",") || "tidak ada"}`);
  }
  harus(hitung(htmlTamu, 'href="/produk"') === 2, "tautan Produk harus ada di nav + ikon Cari");
  harus(htmlTamu.includes('aria-label="Buka menu"'), "hamburger mobile hilang");
  harus(htmlTamu.includes('aria-label="Cari produk"'), "tautan cari hilang");
  harus(htmlTamu.includes('aria-label="Keranjang, 2 item"'), "badge keranjang berubah");
  harus(!htmlTamu.includes(">Keluar<"), "tamu tidak boleh melihat tombol Keluar");
  const t = teks(htmlTamu);
  harus(!/NaN|undefined/.test(t), `ada NaN/undefined: ${t.slice(0, 120)}`);
});
uji("A7 Header pembeli: tidak ada pintu Daftar/Masuk, nama + Keluar tetap", () => {
  htmlPembeli = render(Header, {
    nav: NAV,
    cartCount: 1,
    user: { name: "Siti", email: "siti@contoh.test" },
    storeName: "Toko Kulot"
  });
  harus(hitung(htmlPembeli, 'href="/register"') === 0, "pembeli login tidak boleh melihat tautan Daftar");
  harus(hitung(htmlPembeli, 'href="/login"') === 0, "pembeli login tidak boleh melihat tautan Masuk");
  harus(htmlPembeli.includes(">Keluar<"), "tombol Keluar hilang");
  harus(teks(htmlPembeli).includes("Siti"), "nama pengguna hilang");
  harus(!htmlPembeli.includes('aria-label="Masuk"'), "ikon Masuk masih tampil untuk pembeli");
});
uji("B1 PublicLayout tamu: skip link + konten + tepat satu pintu Daftar dari header", () => {
  const html = render(PublicLayout, { settings: { store_name: "Toko Kulot" }, cartCount: 0, user: null }, {}, {});
  harus(html.includes('id="konten-utama"'), "main#konten-utama hilang");
  harus(html.includes('href="#konten-utama"'), "skip link hilang");
  harus(hitung(html, 'href="/register"') === 1, `jumlah href="/register" di halaman tamu = ${hitung(html, 'href="/register"')}`);
  harus(hitung(html, 'href="/login"') === 1, `jumlah href="/login" di halaman tamu = ${hitung(html, 'href="/login"')}`);
});
uji("B2 PublicLayout pembeli: tanpa pintu Daftar/Masuk di halaman", () => {
  const html = render(
    PublicLayout,
    { settings: { store_name: "Toko Kulot" }, cartCount: 3, user: { name: "Siti" } }
  );
  harus(hitung(html, 'href="/register"') === 0, "pembeli login masih melihat tautan Daftar");
  harus(hitung(html, 'href="/login"') === 0, "pembeli login masih melihat tautan Masuk");
  harus(html.includes(">Keluar<"), "tombol Keluar hilang di halaman pembeli");
});
uji('C1 Login: tepat satu tautan /register, teks "Belum punya akun? Daftar"', () => {
  const html = render(Login, {});
  harus(hitung(html, 'href="/register"') === 1, "tautan silang /register tidak ada / ganda");
  const t = teks(html);
  harus(t.includes("Belum punya akun?"), `teks pengantar hilang: ${t.slice(0, 160)}`);
  const a = tautanDengan(html, "/register");
  harus(a && a.dalam === "Daftar", `teks tautan bukan "Daftar": ${a ? a.dalam : "tidak ada"}`);
});
uji("C2 Login: tautan silang setelah </form>, tautan lupa sandi tetap", () => {
  const html = render(Login, {});
  const akhirForm = html.indexOf("</form>");
  const tautanSilang = html.indexOf('href="/register"');
  harus(akhirForm >= 0 && tautanSilang > akhirForm, "tautan silang tidak berada setelah form");
  harus(hitung(html, 'href="/forgot-password"') === 1, "tautan lupa sandi hilang/berubah");
  harus(hitung(html, 'href="/login"') === 0, "halaman Masuk tidak boleh menautkan ke dirinya sendiri");
});
uji("C3 Login: gaya tautan silang sama dengan tautan lupa sandi", () => {
  const html = render(Login, {});
  const a = tautanDengan(html, "/register");
  harus(a.tag.includes(KELAS_TAUTAN_AUTH), `kelas tautan silang: ${a.tag}`);
  const paragraf = html.slice(html.lastIndexOf('<p class="mt-4 text-meta">'));
  harus(paragraf.startsWith('<p class="mt-4 text-meta">'), `paragraf tautan silang: ${paragraf.slice(0, 80)}`);
});
uji("C4 Login: field, tombol, dan galat per kolom tidak berubah", () => {
  const html = render(Login, {});
  for (const id of ["login-email", "login-password", "login-remember"]) {
    harus(html.includes(`id="${id}"`), `kontrol ${id} hilang`);
  }
  harus(/<button[^>]*type="submit"/.test(html) && teks(html).includes("Masuk"), "tombol submit Masuk hilang");
  const pesan = "Email atau kata sandi salah.";
  const htmlGalat = render(Login, { flash: { success: null, error: pesan } }, {}, { email: pesan });
  harus(htmlGalat.includes('role="alert"') && teks(htmlGalat).includes(pesan), "galat global tidak tampil");
  harus(hitung(htmlGalat, 'href="/register"') === 1, "tautan silang hilang saat galat");
});
uji('D1 Register: tepat satu tautan /login, teks "Sudah punya akun? Masuk"', () => {
  const html = render(Register, {});
  harus(hitung(html, 'href="/login"') === 1, "tautan silang /login tidak ada / ganda");
  const t = teks(html);
  harus(t.includes("Sudah punya akun?"), `teks pengantar hilang: ${t.slice(0, 160)}`);
  const a = tautanDengan(html, "/login");
  harus(a && a.dalam === "Masuk", `teks tautan bukan "Masuk": ${a ? a.dalam : "tidak ada"}`);
});
uji("D2 Register: tautan silang setelah </form>, tidak menautkan ke dirinya sendiri", () => {
  const html = render(Register, {});
  const akhirForm = html.indexOf("</form>");
  const tautanSilang = html.indexOf('href="/login"');
  harus(akhirForm >= 0 && tautanSilang > akhirForm, "tautan silang tidak berada setelah form");
  harus(hitung(html, 'href="/register"') === 0, "halaman Daftar tidak boleh menautkan ke dirinya sendiri");
});
uji("D3 Register: gaya tautan silang sama dengan gaya tautan auth lain", () => {
  const html = render(Register, {});
  const a = tautanDengan(html, "/login");
  harus(a.tag.includes(KELAS_TAUTAN_AUTH), `kelas tautan silang: ${a.tag}`);
  const paragraf = html.slice(html.lastIndexOf('<p class="mt-4 text-meta">'));
  harus(paragraf.startsWith('<p class="mt-4 text-meta">'), `paragraf tautan silang: ${paragraf.slice(0, 80)}`);
});
uji("D4 Register: 6 field + tombol Daftar tidak berubah", () => {
  const html = render(Register, {});
  for (const id of [
    "register-name",
    "register-email",
    "register-phone",
    "register-password",
    "register-password-confirmation",
    "register-terms"
  ]) {
    harus(html.includes(`id="${id}"`), `kontrol ${id} hilang`);
  }
  harus(/<button[^>]*type="submit"/.test(html) && teks(html).includes("Daftar"), "tombol submit Daftar hilang");
});
uji("D5 Register: galat per kolom tetap tampil apa adanya", () => {
  const pesan = "Email sudah terdaftar.";
  const html = render(Register, {}, {}, { email: pesan, terms: "Syarat dan ketentuan wajib disetujui." });
  const t = teks(html);
  harus(t.includes(pesan), "galat email tidak tampil");
  harus(t.includes("Syarat dan ketentuan wajib disetujui."), "galat terms tidak tampil");
  harus(html.includes('id="register-terms-error"'), "id galat terms hilang");
  harus(hitung(html, 'href="/login"') === 1, "tautan silang hilang saat galat");
});
uji("D6 Tidak ada NaN/undefined/[CONTOH]/lorem di markup halaman auth", () => {
  const semua = [render(Login, {}), render(Register, {})].map(teks).join(" || ");
  harus(!/NaN|undefined|\[CONTOH\]|lorem/i.test(semua), `teks rusak: ${semua.slice(0, 160)}`);
});
var BERKAS = {
  header: "resources/js/Components/Header.jsx",
  layout: "resources/js/Layouts/PublicLayout.jsx",
  login: "resources/js/Pages/Public/Auth/Login.jsx",
  register: "resources/js/Pages/Public/Auth/Register.jsx"
};
uji("E1 Tidak ada Ziggy/route(), localStorage, atau innerHTML di kode 4 berkas", () => {
  for (const [nama, berkas] of Object.entries(BERKAS)) {
    const kode = tanpaKomentar(baca(berkas));
    harus(!/ziggy/i.test(kode), `${nama}: memakai Ziggy`);
    harus(!/from\s+['"]ziggy|require\(['"]ziggy/i.test(kode), `${nama}: mengimpor ziggy`);
    harus(!/\broute\(/.test(kode), `${nama}: memakai helper route()`);
    harus(!/localStorage|sessionStorage/.test(kode), `${nama}: menyimpan data di storage browser`);
    harus(!/dangerouslySetInnerHTML/.test(kode), `${nama}: memakai dangerouslySetInnerHTML`);
  }
});
uji("E2 URL literal sesuai PRD \xA715.2 dan tidak ada rute karangan", () => {
  const header = baca(BERKAS.header);
  const layout = baca(BERKAS.layout);
  const login = baca(BERKAS.login);
  const register = baca(BERKAS.register);
  harus(header.includes('href="/register"'), "Header: tautan /register hilang");
  harus(layout.includes('href="/register"') && layout.includes('href="/login"'), "PublicLayout: pintu tamu hilang");
  harus(login.includes('href="/register"') && login.includes("post('/login')"), "Login: tautan silang / URL kirim berubah");
  harus(register.includes('href="/login"') && register.includes("post('/register')"), "Register: tautan silang / URL kirim berubah");
  const semuaTautan = [...`${header}${layout}${login}${register}`.matchAll(/href="(\/[a-z0-9/-]*)"/g)].map((m) => m[1]);
  harus(!semuaTautan.some((u) => u.includes("tiruan")), "ada tautan sisa uji");
});
uji("E3 Register: impor @inertiajs/react tunggal berisi Link + useForm", () => {
  const isi = baca(BERKAS.register);
  const baris = isi.split("\n").filter((l) => l.includes("from '@inertiajs/react'"));
  harus(baris.length === 1, `jumlah impor @inertiajs/react = ${baris.length}`);
  harus(/Link/.test(baris[0]) && /useForm/.test(baris[0]), `impor tidak lengkap: ${baris[0]}`);
});
uji("E4 Jejak deviasi D14/D15/D16 tercatat di berkas yang tepat", () => {
  const peta = [
    ["Header.jsx", "D14"],
    ["PublicLayout.jsx", "D15"],
    ["Login.jsx", "D16"],
    ["Register.jsx", "D16"]
  ];
  let diperiksa = 0;
  const terlihat = /* @__PURE__ */ new Set();
  for (const berkas of Object.values(BERKAS)) {
    const isi = baca(berkas);
    harus(!/D13\b/.test(isi), `${berkas}: memakai label D13 (milik kartu admin t_8e89556f)`);
    const label = peta.filter(([nama]) => String(berkas).endsWith(nama)).map(([, l]) => l);
    harus(label.length === 1, `${berkas}: tidak dipetakan ke tepat satu deviasi`);
    for (const l of label) {
      harus(isi.includes(l), `${berkas}: tanpa catatan deviasi ${l}`);
      terlihat.add(l);
    }
    diperiksa += 1;
  }
  harus(diperiksa === 4, `berkas diperiksa = ${diperiksa}`);
  harus(terlihat.size === 3, `label deviasi terlihat = ${[...terlihat].join(",")}`);
});
var gagal = hasil.filter((r) => r.status === "GAGAL");
for (const r of hasil) {
  console.log(`${r.status === "OK" ? "OK   " : "GAGAL"} ${r.nama}${r.catatan ? ` -> ${r.catatan}` : ""}`);
}
console.log(`
ringkasan: ${hasil.length - gagal.length}/${hasil.length} pemeriksaan lulus`);
process.exit(gagal.length === 0 ? 0 : 1);
