// tmp/shim-react-t_321bf03c.mjs
import { createRequire } from "node:module";
var require2 = createRequire(import.meta.url);
var R = require2("react");
var store = {
  hitung: 0,
  state: {},
  deps: {},
  ref: {},
  efek: {},
  tulisan: [],
  kotor: false,
  pass: 0
};
var bersihkanStore = () => {
  store.hitung = 0;
  store.state = {};
  store.deps = {};
  store.ref = {};
  store.efek = {};
  store.tulisan = [];
  store.kotor = false;
  store.pass = 0;
};
var berikut = (label) => {
  store.hitung += 1;
  return `${label}#${store.hitung}`;
};
var useState = (awal) => {
  const kunci = berikut("state");
  if (!(kunci in store.state)) {
    store.state[kunci] = typeof awal === "function" ? awal() : awal;
  }
  const set = (nilai) => {
    const sebelumnya = store.state[kunci];
    const berikut2 = typeof nilai === "function" ? nilai(sebelumnya) : nilai;
    if (Object.is(sebelumnya, berikut2)) return;
    store.state[kunci] = berikut2;
    store.tulisan.push({ kunci, sebelumnya, berikut: berikut2 });
    store.kotor = true;
  };
  return [store.state[kunci], set];
};
var useRef = (awal) => {
  const kunci = berikut("ref");
  if (!(kunci in store.ref)) store.ref[kunci] = { current: awal };
  return store.ref[kunci];
};
var depsSama = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((nilai, i) => Object.is(nilai, b[i]));
};
var useEffect = (efek, deps) => {
  const kunci = berikut("efek");
  const sebelumnya = store.efek[kunci];
  if (sebelumnya && depsSama(sebelumnya.deps, deps)) return;
  if (sebelumnya && typeof sebelumnya.bersihkan === "function") sebelumnya.bersihkan();
  const bersihkan2 = efek();
  store.efek[kunci] = { deps, bersihkan: typeof bersihkan2 === "function" ? bersihkan2 : null };
};
var useMemo = (hitung, deps) => {
  const kunci = berikut("memo");
  if (kunci in store.deps && depsSama(store.deps[kunci], deps)) return store.ref[kunci].current;
  store.deps[kunci] = deps;
  store.ref[kunci] = { current: hitung() };
  return store.ref[kunci].current;
};
var useCallback = (fn, deps) => useMemo(() => fn, deps);
var Fragment = R.Fragment;
var createElement = R.createElement;
var cloneElement = R.cloneElement;
var isValidElement = R.isValidElement;
var Children = R.Children;
var memo = R.memo;
var forwardRef = R.forwardRef;
var createContext = R.createContext;
var useContext = R.useContext;
var StrictMode = R.StrictMode;
var shim_react_t_321bf03c_default = R;

// tmp/uji-pohon-daftar-t_e3f68f7f.mjs
import { renderToStaticMarkup } from "react-dom/server";

// tmp/stub-inertia-t_321bf03c.mjs
import { createRequire as createRequire2 } from "node:module";
var require3 = createRequire2(import.meta.url);
var R2 = require3("react");
var h = R2.createElement;
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
var Link = ({ href, children, ...sisa }) => h("a", { href, ...sisa }, children);

// tmp/shim-jsx-runtime-t_321bf03c.mjs
import { createRequire as createRequire3 } from "node:module";
var require4 = createRequire3(import.meta.url);
var JR = require4("react/jsx-runtime");
var jsx = JR.jsx;
var jsxs = JR.jsxs;
var Fragment2 = JR.Fragment;

// resources/js/Components/Announcement.jsx
function Announcement({ text = null, href = null }) {
  if (!text) return null;
  const content = /* @__PURE__ */ jsx("span", { className: "text-meta text-white", children: text });
  return /* @__PURE__ */ jsx("div", { className: "flex h-9 items-center justify-center bg-brand-700 px-4 text-center", children: href ? /* @__PURE__ */ jsx(Link, { href, className: "underline-offset-4 hover:underline", children: content }) : content });
}

// resources/js/Components/icons.jsx
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
var UserIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "8.5", r: "3.5" }),
  /* @__PURE__ */ jsx("path", { d: "M4.5 20a7.5 7.5 0 0 1 15 0" })
] });
var MailIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "5.5", width: "18", height: "13", rx: "2" }),
  /* @__PURE__ */ jsx("path", { d: "m4 7 8 6 8-6" })
] });
var PhoneIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" }) });
var MapPinIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" }),
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "2.6" })
] });
var InstagramIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("rect", { x: "3.5", y: "3.5", width: "17", height: "17", rx: "5" }),
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "4" }),
  /* @__PURE__ */ jsx("path", { d: "M17 7h.01" })
] });
var FacebookIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M14.5 8.5h2.5V5h-2.5a4 4 0 0 0-4 4v2H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9.5a1 1 0 0 1 1-1z" }) });
var TikTokIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" }),
  /* @__PURE__ */ jsx("path", { d: "M14 4c.5 2.4 2.2 3.9 4.5 4" })
] });
var WhatsAppIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M20 11.7A8 8 0 0 1 8.3 19L4 20l1-4.2A8 8 0 1 1 20 11.7z" }),
  /* @__PURE__ */ jsx("path", { d: "M9 9.5c.6 2.2 2.3 3.9 4.5 4.5" })
] });
var SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon
};

// resources/js/Components/Footer.jsx
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
  return /* @__PURE__ */ jsx("footer", { className: "bg-footer pb-8 pt-section text-white/75", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-gutterLg", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-1", children: [
        /* @__PURE__ */ jsx("p", { className: "font-display text-h2 uppercase text-white", children: storeName }),
        about && /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-xs text-meta text-white/75", children: about }),
        socialItems.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-4 flex items-center gap-3", children: socialItems.map((item) => {
          const Icon = SOCIAL_ICONS[String(item.name).toLowerCase()];
          if (!Icon) return null;
          return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            "a",
            {
              href: item.href,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": item.label ?? item.name,
              className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors duration-hover hover:border-white/50 hover:text-white",
              children: /* @__PURE__ */ jsx(Icon, { size: 20 })
            }
          ) }, `${item.name}-${item.href}`);
        }) })
      ] }),
      columns.map((column) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-badge uppercase text-white", children: column.title }),
        /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-2", children: column.items.map((item) => /* @__PURE__ */ jsx("li", { children: item.href?.startsWith("http") ? /* @__PURE__ */ jsx(
          "a",
          {
            href: item.href,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-meta text-white/75 hover:text-white hover:underline",
            children: item.label
          }
        ) : /* @__PURE__ */ jsx(
          Link,
          {
            href: item.href ?? "#",
            className: "text-meta text-white/75 hover:text-white hover:underline",
            children: item.label
          }
        ) }, `${column.title}-${item.label}`)) })
      ] }, column.title)),
      contactRows.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-badge uppercase text-white", children: "Hubungi Kami" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-2", children: contactRows.map((row) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "mt-0.5 shrink-0 text-white/60", children: /* @__PURE__ */ jsx(row.icon, { size: 20 }) }),
          row.href ? /* @__PURE__ */ jsx(
            "a",
            {
              href: row.href,
              className: "text-meta text-white/75 hover:text-white hover:underline",
              children: row.text
            }
          ) : /* @__PURE__ */ jsx("span", { className: "text-meta text-white/75", children: row.text })
        ] }, row.text)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 border-t border-white/15 pt-6", children: /* @__PURE__ */ jsx("p", { className: "text-meta text-white/60", children: `\xA9 ${year} ${storeName}. Semua hak dilindungi.` }) })
  ] }) });
}

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");

// resources/js/lib/hooks.js
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
        badge !== null && badge !== void 0 && badge !== "" && /* @__PURE__ */ jsx("span", { className: "absolute right-1 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-badge text-ink", children: badge })
      ]
    }
  );
}

// resources/js/Components/Header.jsx
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
  const wordmark = logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: storeName, className: "h-8 w-auto", loading: "eager" }) : /* @__PURE__ */ jsx("span", { className: "font-display text-h2 uppercase tracking-[0.02em] text-brand", children: storeName });
  return /* @__PURE__ */ jsx(
    "header",
    {
      className: cn(
        "sticky top-0 z-header border-b bg-white",
        scrolled ? "border-line backdrop-blur-sm" : "border-transparent"
      ),
      children: /* @__PURE__ */ jsxs("div", { className: "container flex h-headerMobile items-center justify-between gap-4 md:h-header", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 md:hidden", children: /* @__PURE__ */ jsx(IconButton, { label: "Buka menu", onClick: onOpenDrawer, className: "-ml-2", children: /* @__PURE__ */ jsx(MenuIcon, { size: 20 }) }) }),
        /* @__PURE__ */ jsx(Link, { href: "/", className: "flex items-center md:mr-6", "aria-label": `${storeName} \u2014 beranda`, children: wordmark }),
        /* @__PURE__ */ jsx("nav", { className: "hidden flex-1 items-center gap-1 md:flex", "aria-label": "Navigasi utama", children: nav.map((item) => /* @__PURE__ */ jsx(
          Link,
          {
            href: item.href,
            className: "px-3.5 py-3 text-meta text-ink hover:underline hover:decoration-accent-500 hover:decoration-2 hover:underline-offset-4",
            children: item.label
          },
          item.href ?? item.label
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: searchHref,
              "aria-label": "Cari produk",
              title: "Cari produk",
              className: "hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex",
              children: /* @__PURE__ */ jsx(SearchIcon, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsx(
            IconButton,
            {
              label: `Keranjang${count > 0 ? `, ${count} item` : ""}`,
              badge: count > 0 ? count : null,
              onClick: () => router.visit(cartHref),
              children: /* @__PURE__ */ jsx(CartIcon, { size: 20 })
            }
          ),
          user ? /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-2 md:flex", children: [
            /* @__PURE__ */ jsx("span", { className: "max-w-[120px] truncate text-meta text-ink", children: user.name ?? user.email ?? "Akun" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => router.post("/logout"),
                className: "text-meta text-brand underline underline-offset-4",
                children: "Keluar"
              }
            )
          ] }) : /* @__PURE__ */ jsxs(Fragment2, { children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: loginHref,
                "aria-label": "Masuk",
                title: "Masuk",
                className: "hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex",
                children: /* @__PURE__ */ jsx(UserIcon, { size: 20 })
              }
            ),
            /* @__PURE__ */ jsx(
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

// resources/js/Components/NavDrawer.jsx
function NavDrawer({ open = false, nav = [], onClose, title = "Menu", footer = null }) {
  const panelRef = useRef(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);
  useEffect(() => {
    if (!open) return void 0;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-drawer", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "aria-label": "Tutup menu",
        onClick: onClose,
        className: "absolute inset-0 h-full w-full cursor-default bg-black/50"
      }
    ),
    /* @__PURE__ */ jsxs(
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
          /* @__PURE__ */ jsxs("div", { className: "flex h-header items-center justify-between border-b border-line px-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-badge uppercase text-slate-500", children: title }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                "aria-label": "Tutup menu",
                className: "inline-flex h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface",
                children: /* @__PURE__ */ jsx(CloseIcon, { size: 20 })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex-1 overflow-y-auto", "aria-label": "Navigasi utama", children: /* @__PURE__ */ jsx("ul", { children: nav.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            Link,
            {
              href: item.href,
              onClick: onClose,
              className: "flex h-drawerItem items-center border-b border-line px-4 text-label text-ink transition-colors duration-hover hover:bg-surface",
              children: item.label
            }
          ) }, item.href ?? item.label)) }) }),
          footer && /* @__PURE__ */ jsx("div", { className: "border-t border-line p-4", children: footer })
        ]
      }
    )
  ] });
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
function PublicLayout({ settings = {}, cartCount = null, user = null, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const page = usePage();
  const storeName = settings?.store_name ?? "Toko Kulot";
  const rawNav = settings?.header_nav;
  const nav = Array.isArray(rawNav) && rawNav.length > 0 ? rawNav.filter((item) => item && item.label && hrefOf(item)).map((item) => ({ label: item.label, href: hrefOf(item) })) : DEFAULT_NAV;
  const announcement = settings?.landing_sections?.announcement ?? null;
  const announcementText = announcement?.text ?? settings?.announcement_text ?? null;
  const announcementHref = announcement ? hrefOf(announcement) : settings?.announcement_href ?? null;
  const currentUser = user ?? page?.props?.auth?.user ?? null;
  const count = toCount(page?.props?.cart?.count) ?? toCount(cartCount) ?? toCount(settings?.cart_count) ?? 0;
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col bg-white text-ink", children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "#konten-utama",
        className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white",
        children: "Lewati ke konten utama"
      }
    ),
    /* @__PURE__ */ jsx(Announcement, { text: announcementText, href: announcementHref }),
    /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsx(
      NavDrawer,
      {
        open: drawerOpen,
        nav,
        onClose: () => setDrawerOpen(false),
        title: "Menu",
        footer: currentUser ? /* @__PURE__ */ jsx("p", { className: "text-meta text-ink-soft", children: `Masuk sebagai ${currentUser.name ?? currentUser.email ?? "Akun"}` }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: "/register", className: "btn-primary w-full justify-center", children: "Daftar" }),
          /* @__PURE__ */ jsx(Link, { href: "/login", className: "btn-secondary w-full justify-center", children: "Masuk" })
        ] })
      }
    ),
    /* @__PURE__ */ jsx("main", { id: "konten-utama", className: "flex-1", children }),
    /* @__PURE__ */ jsx(
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

// tmp/uji-pohon-daftar-t_e3f68f7f.mjs
var bikinSimpul = () => ({
  style: {},
  classList: { add() {
  }, remove() {
  }, toggle() {
  } },
  addEventListener() {
  },
  removeEventListener() {
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  appendChild() {
  },
  focus() {
  },
  contains: () => false,
  setAttribute() {
  },
  removeAttribute() {
  },
  getAttribute: () => null,
  offsetParent: null
});
globalThis.document = {
  body: bikinSimpul(),
  documentElement: bikinSimpul(),
  activeElement: null,
  visibilityState: "visible",
  addEventListener() {
  },
  removeEventListener() {
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => bikinSimpul()
};
globalThis.window = {
  scrollY: 0,
  innerWidth: 1280,
  addEventListener() {
  },
  removeEventListener() {
  },
  matchMedia: () => ({ matches: false, addEventListener() {
  }, removeEventListener() {
  } }),
  setTimeout: () => 0,
  clearTimeout() {
  },
  requestAnimationFrame: (fn) => fn()
};
var hasil = [];
var jalankan = (nama, fn) => {
  try {
    bersihkanStore();
    bersihkan();
    kendali.halaman.props = {
      auth: { user: null, admin: null },
      cart: { count: 0 },
      flash: { success: null, error: null },
      settings: {}
    };
    const catatan = fn();
    hasil.push({ status: "OK", nama, catatan: catatan ?? "" });
  } catch (galat) {
    hasil.push({ status: "GAGAL", nama, catatan: galat.message });
  }
};
var harus = (syarat, pesan) => {
  if (!syarat) throw new Error(pesan);
};
var semuaElemen = (simpul, keluar = []) => {
  if (!simpul || typeof simpul !== "object") return keluar;
  if (Array.isArray(simpul)) {
    simpul.forEach((s) => semuaElemen(s, keluar));
    return keluar;
  }
  if (simpul.$$typeof) {
    keluar.push(simpul);
    semuaElemen(simpul.props?.children, keluar);
  }
  return keluar;
};
var cari = (pohon, predikat) => semuaElemen(pohon).find(predikat);
var elemenDenganNama = (pohon, nama) => cari(pohon, (e) => typeof e.type === "function" && e.type.name === nama);
var anakDatar = (elemen) => {
  const anak = elemen?.props?.children;
  if (anak === void 0 || anak === null) return [];
  return (Array.isArray(anak) ? anak.flat(Infinity) : [anak]).filter((a) => a !== null && a !== void 0 && a !== false);
};
var NAV = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/produk" },
  { label: "Kontak", href: "/kontak-kami" }
];
var pintuTamu = (pohon) => semuaElemen(pohon).filter((e) => e.type === Link && (e.props.href === "/register" || e.props.href === "/login"));
var pohonTamu = null;
var footerTamu = null;
jalankan("P1 PublicLayout tamu: drawer dapat footer dua pintu (div flex flex-col gap-2, 2 tautan)", () => {
  pohonTamu = PublicLayout({ settings: { store_name: "Toko Kulot" }, cartCount: 0, user: null, children: null });
  const drawer = cari(pohonTamu, (e) => e.type === NavDrawer);
  harus(drawer, "NavDrawer tidak ada di pohon PublicLayout");
  harus(drawer.props.open === false, `drawer harus tertutup di awal, dapat ${String(drawer.props.open)}`);
  harus(drawer.props.title === "Menu", `judul drawer berubah: ${String(drawer.props.title)}`);
  harus(Array.isArray(drawer.props.nav) && drawer.props.nav.length === 3, "nav drawer tidak 3 item");
  harus(typeof drawer.props.onClose === "function", "drawer kehilangan onClose");
  footerTamu = drawer.props.footer;
  harus(footerTamu && footerTamu.type === "div", "footer tamu bukan <div>");
  harus(
    footerTamu.props.className === "flex flex-col gap-2",
    `kelas footer tamu: ${footerTamu.props.className}`
  );
  const anak = anakDatar(footerTamu);
  harus(anak.length === 2, `jumlah tautan di footer tamu = ${anak.length}`);
  require_dua_tautan(anak);
  return `anak=${anak.length}`;
});
function require_dua_tautan(anak) {
  const [daftar, masuk] = anak;
  harus(daftar.type === Link, "anak pertama bukan Link Inertia");
  harus(daftar.props.href === "/register", `href anak pertama: ${String(daftar.props.href)}`);
  harus(daftar.props.className === "btn-primary w-full justify-center", `kelas Daftar: ${daftar.props.className}`);
  harus(daftar.props.children === "Daftar", `teks anak pertama: ${String(daftar.props.children)}`);
  harus(masuk.type === Link, "anak kedua bukan Link Inertia");
  harus(masuk.props.href === "/login", `href anak kedua: ${String(masuk.props.href)}`);
  harus(masuk.props.className === "btn-secondary w-full justify-center", `kelas Masuk: ${masuk.props.className}`);
  harus(masuk.props.children === "Masuk", `teks anak kedua: ${String(masuk.props.children)}`);
  for (const [nama, tautan] of [["Daftar", daftar], ["Masuk", masuk]]) {
    harus(tautan.props.onClick === void 0, `${nama}: tidak boleh punya onClick (navigasi Inertia biasa)`);
    harus(tautan.props.target === void 0, `${nama}: tidak boleh membuka tab baru`);
  }
}
jalankan("P2 PublicLayout tamu: pintu tamu hanya dari props.footer, header tetap menerima tamu", () => {
  const tautan = pintuTamu(pohonTamu);
  harus(tautan.length === 0, `ada ${tautan.length} tautan tamu di luar props.footer drawer`);
  const header = elemenDenganNama(pohonTamu, "Header");
  harus(header, "Header tidak ada di pohon PublicLayout");
  harus(header.props.user === null, "Header tidak menerima user tamu");
  harus(header.props.cartCount === 0, `badge keranjang Header: ${String(header.props.cartCount)}`);
  harus(header.props.storeName === "Toko Kulot", `nama toko Header: ${String(header.props.storeName)}`);
  harus(typeof header.props.onOpenDrawer === "function", "Header kehilangan onOpenDrawer");
  harus(Array.isArray(header.props.nav) && header.props.nav.length === 3, "nav Header tidak 3 item");
  return `tautan_luar_footer=${tautan.length}`;
});
jalankan("P3 Drawer terbuka: footer asli berada di dalam panel, Daftar sebelum Masuk", () => {
  const html = renderToStaticMarkup(
    shim_react_t_321bf03c_default.createElement(NavDrawer, {
      open: true,
      nav: NAV,
      onClose: () => {
      },
      title: "Menu",
      footer: footerTamu
    })
  );
  harus(html.includes('class="border-t border-line p-4"'), "wrapper footer drawer hilang");
  harus(html.includes('role="dialog"'), "drawer kehilangan role dialog");
  const daftar = html.indexOf('href="/register"');
  const masuk = html.indexOf('href="/login"');
  harus(daftar >= 0 && masuk >= 0, "pintu tamu tidak dirender di drawer");
  harus(daftar < masuk, "urutan Daftar/Masuk tertukar di drawer");
  harus(daftar > html.indexOf("<nav"), "footer drawer harus setelah blok nav");
  const slice = html.slice(html.indexOf("border-t border-line p-4"));
  harus(slice.includes("btn-primary w-full justify-center") && slice.includes("btn-secondary w-full justify-center"), "kelas tombol footer berubah");
  harus(slice.includes(">Daftar<") && slice.includes(">Masuk<"), "teks tombol footer berubah");
  return `posisi daftar=${daftar} masuk=${masuk}`;
});
jalankan('P4 PublicLayout pembeli: footer drawer = "Masuk sebagai ...", tanpa pintu tamu', () => {
  const pohon = PublicLayout({
    settings: { store_name: "Toko Kulot" },
    cartCount: 1,
    user: { name: "Siti", email: "siti@contoh.test" },
    children: null
  });
  const drawer = cari(pohon, (e) => e.type === NavDrawer);
  harus(drawer, "NavDrawer tidak ada di pohon pembeli");
  const footer = drawer.props.footer;
  harus(footer && footer.type === "p", "footer pembeli bukan <p>");
  harus(String(footer.props.children).includes("Masuk sebagai Siti"), `teks footer pembeli: ${String(footer.props.children)}`);
  harus(pintuTamu(pohon).length === 0, "pembeli login masih punya pintu tamu di pohon");
  const html = renderToStaticMarkup(
    shim_react_t_321bf03c_default.createElement(NavDrawer, { open: true, nav: NAV, onClose: () => {
    }, title: "Menu", footer })
  );
  harus(!html.includes('href="/register"') && !html.includes('href="/login"'), "markup drawer pembeli memuat pintu tamu");
  harus(html.includes("Masuk sebagai Siti"), 'teks "Masuk sebagai" hilang di drawer pembeli');
});
jalankan("P5 Halaman pembeli: header/footer/pengumuman tetap, cart.count halaman menang atas prop", () => {
  kendali.halaman.props.cart = { count: 2 };
  const pohon = PublicLayout({ settings: {}, cartCount: 5, user: { name: "Siti" }, children: null });
  const header = elemenDenganNama(pohon, "Header");
  harus(header.props.user && header.props.user.name === "Siti", "Header tidak menerima user pembeli");
  harus(header.props.cartCount === 2, `badge keranjang bukan 2: ${String(header.props.cartCount)}`);
  harus(elemenDenganNama(pohon, "Footer"), "Footer publik hilang dari pohon");
  harus(elemenDenganNama(pohon, "Announcement"), "Announcement hilang dari pohon");
  harus(pintuTamu(pohon).length === 0, "halaman pembeli masih punya pintu tamu");
});
var gagal = hasil.filter((r) => r.status === "GAGAL");
for (const r of hasil) {
  console.log(`${r.status === "OK" ? "OK   " : "GAGAL"} ${r.nama}${r.catatan ? ` -> ${r.catatan}` : ""}`);
}
console.log(`
ringkasan: ${hasil.length - gagal.length}/${hasil.length} pemeriksaan lulus`);
process.exit(gagal.length === 0 ? 0 : 1);
