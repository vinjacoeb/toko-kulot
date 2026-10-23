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
var mulaiPass = () => {
  store.hitung = 0;
  store.kotor = false;
  store.pass += 1;
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
var Head = () => null;

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
var PhoneIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" }) });
var MapPinIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" }),
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "2.6" })
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
  return /* @__PURE__ */ jsx("footer", { className: "bg-footer pb-8 pt-section text-white/75", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-gutterLg", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-1", children: [
        /* @__PURE__ */ jsx("p", { className: "font-display text-h2 uppercase text-white", children: storeName }),
        about && /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-xs text-meta text-white/75", children: about }),
        socialItems.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-4 flex items-center gap-3", children: socialItems.map((item2) => {
          const Icon = SOCIAL_ICONS[String(item2.name).toLowerCase()];
          if (!Icon) return null;
          return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            "a",
            {
              href: item2.href,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": item2.label ?? item2.name,
              className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors duration-hover hover:border-white/50 hover:text-white",
              children: /* @__PURE__ */ jsx(Icon, { size: 20 })
            }
          ) }, `${item2.name}-${item2.href}`);
        }) })
      ] }),
      columns.map((column) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-badge uppercase text-white", children: column.title }),
        /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-2", children: column.items.map((item2) => /* @__PURE__ */ jsx("li", { children: item2.href?.startsWith("http") ? /* @__PURE__ */ jsx(
          "a",
          {
            href: item2.href,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-meta text-white/75 hover:text-white hover:underline",
            children: item2.label
          }
        ) : /* @__PURE__ */ jsx(
          Link,
          {
            href: item2.href ?? "#",
            className: "text-meta text-white/75 hover:text-white hover:underline",
            children: item2.label
          }
        ) }, `${column.title}-${item2.label}`)) })
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
        /* @__PURE__ */ jsx("nav", { className: "hidden flex-1 items-center gap-1 md:flex", "aria-label": "Navigasi utama", children: nav.map((item2) => /* @__PURE__ */ jsx(
          Link,
          {
            href: item2.href,
            className: "px-3.5 py-3 text-meta text-ink hover:underline hover:decoration-accent-500 hover:decoration-2 hover:underline-offset-4",
            children: item2.label
          },
          item2.href ?? item2.label
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
          ] }) : /* @__PURE__ */ jsx(
            Link,
            {
              href: loginHref,
              "aria-label": "Masuk",
              title: "Masuk",
              className: "hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex",
              children: /* @__PURE__ */ jsx(UserIcon, { size: 20 })
            }
          )
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
          /* @__PURE__ */ jsx("nav", { className: "flex-1 overflow-y-auto", "aria-label": "Navigasi utama", children: /* @__PURE__ */ jsx("ul", { children: nav.map((item2) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            Link,
            {
              href: item2.href,
              onClick: onClose,
              className: "flex h-drawerItem items-center border-b border-line px-4 text-label text-ink transition-colors duration-hover hover:bg-surface",
              children: item2.label
            }
          ) }, item2.href ?? item2.label)) }) }),
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
var hrefOf = (item2) => item2?.url ?? item2?.href ?? null;
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
  const nav = Array.isArray(rawNav) && rawNav.length > 0 ? rawNav.filter((item2) => item2 && item2.label && hrefOf(item2)).map((item2) => ({ label: item2.label, href: hrefOf(item2) })) : DEFAULT_NAV;
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
        footer: currentUser ? /* @__PURE__ */ jsx("p", { className: "text-meta text-ink-soft", children: `Masuk sebagai ${currentUser.name ?? currentUser.email ?? "Akun"}` }) : /* @__PURE__ */ jsx(Link, { href: "/login", className: "btn-primary w-full justify-center", children: "Masuk" })
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

// resources/js/Components/Breadcrumb.jsx
function Breadcrumb({ items = [], className = "" }) {
  const list = (Array.isArray(items) ? items : []).filter((item2) => item2 && item2.label);
  if (list.length === 0) return null;
  const first = list[0];
  const last = list[list.length - 1];
  const middle = list.slice(1, -1);
  const renderItem = (item2, isLast) => isLast || !item2.href ? /* @__PURE__ */ jsx("span", { className: "text-ink", "aria-current": "page", children: item2.label }) : /* @__PURE__ */ jsx(Link, { href: item2.href, className: "transition-colors duration-hover hover:text-ink", children: item2.label });
  return /* @__PURE__ */ jsx("nav", { "aria-label": "Breadcrumb", className: cn("h-12", className), children: /* @__PURE__ */ jsxs("ol", { className: "flex h-full items-center gap-2 text-meta text-slate-600", children: [
    /* @__PURE__ */ jsx("li", { className: "flex items-center gap-2", children: renderItem(first, list.length === 1) }),
    list.length > 1 && /* @__PURE__ */ jsx("li", { className: "flex items-center gap-2", "aria-hidden": "true", children: /* @__PURE__ */ jsx("span", { children: "/" }) }),
    middle.length > 0 && /* @__PURE__ */ jsx("li", { className: "flex items-center gap-2 sm:hidden", "aria-hidden": "true", children: /* @__PURE__ */ jsx("span", { children: "..." }) }),
    list.length > 1 && /* @__PURE__ */ jsx("li", { className: "flex items-center gap-2", children: renderItem(last, true) })
  ] }) });
}

// resources/js/Components/InlineNotice.jsx
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
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn("flex items-start gap-3 rounded-md p-4", TONES[tone] ?? TONES.info, className),
      children: [
        /* @__PURE__ */ jsx("span", { className: cn("mt-0.5 shrink-0", ICON_TONES[tone] ?? ICON_TONES.info), "aria-hidden": "true", children: /* @__PURE__ */ jsx(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx("p", { className: "text-label", children: title }),
          children && /* @__PURE__ */ jsx("div", { className: "text-meta text-ink-soft", children })
        ] }),
        onDismiss && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onDismiss,
            "aria-label": "Tutup pesan",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60",
            children: /* @__PURE__ */ jsx(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}

// resources/js/Components/Button.jsx
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
  const content = loading ? /* @__PURE__ */ jsxs(Fragment2, { children: [
    /* @__PURE__ */ jsx(SpinnerIcon, { size: 16 }),
    /* @__PURE__ */ jsx("span", { children: "Memproses\u2026" })
  ] }) : /* @__PURE__ */ jsxs(Fragment2, { children: [
    icon,
    /* @__PURE__ */ jsx("span", { children })
  ] });
  if (as === "a") {
    return /* @__PURE__ */ jsx("a", { href, className: classes, ...rest, children: content });
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ jsx(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest, children: content });
  }
  return /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col", className), children: [
    label && /* @__PURE__ */ jsxs("label", { htmlFor, className: "mb-1.5 block text-meta font-semibold text-ink", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "text-danger", "aria-hidden": "true", children: " *" })
    ] }),
    children,
    hint && !error && /* @__PURE__ */ jsx("p", { id: hintId, className: "mt-1.5 text-meta text-slate-500", children: hint }),
    error && /* @__PURE__ */ jsx("p", { id: errorId, className: "mt-1.5 text-meta text-danger-strong", role: "alert", children: error })
  ] });
}

// resources/js/Components/StarRating.jsx
var SIZES2 = { sm: 14, md: 20, lg: 32 };
var stars = (size, filled) => [0, 1, 2, 3, 4].map((index) => /* @__PURE__ */ jsx(StarIcon, { size, filled }, index));
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
  const [preview, setPreview] = useState(0);
  const shown = preview || clamped;
  const readable = clamped.toFixed(1).replace(".", ",");
  if (readOnly) {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxs(
        "span",
        {
          className: "relative inline-flex",
          role: "img",
          "aria-label": label ?? `Rating ${readable} dari 5`,
          style: { height: px },
          children: [
            /* @__PURE__ */ jsx("span", { className: "flex gap-0.5 text-slate-300", children: stars(px, false) }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-accent-500",
                style: { width: `${clamped / 5 * 100}%` },
                "aria-hidden": "true",
                children: stars(px, true)
              }
            )
          ]
        }
      ),
      count !== null && count !== void 0 && /* @__PURE__ */ jsxs("span", { className: "text-meta text-slate-600", children: [
        "(",
        formatNumber(count),
        ")"
      ] })
    ] });
  }
  const step = (delta) => {
    const next = Math.max(1, Math.min(5, Math.round(shown) + delta));
    onChange?.(next);
  };
  return /* @__PURE__ */ jsx(
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
      },
      children: [1, 2, 3, 4, 5].map((index) => /* @__PURE__ */ jsx(
        "button",
        {
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
          onClick: () => onChange?.(index),
          children: /* @__PURE__ */ jsx(StarIcon, { size: px, filled: index <= shown, className: index <= shown ? "text-accent-500" : "text-slate-300" })
        },
        index
      ))
    }
  );
}

// resources/js/Components/Textarea.jsx
var BASE = "w-full min-h-[120px] resize-y rounded-md border border-line bg-white px-3.5 py-3 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Textarea({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx(
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
  const [ratingValue, setRatingValue] = useState(Number(rating) || 0);
  const [comment, setComment] = useState("");
  const [localError, setLocalError] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);
  const image = product?.image ?? null;
  const name = product?.name ?? "Produk";
  const variantLabel = product?.variant_label ?? null;
  const textareaId = `ulasan-komentar-${productId ?? "x"}`;
  useEffect(() => {
    setImageFailed(false);
  }, [image]);
  if (submitted || alreadyReviewed) {
    return /* @__PURE__ */ jsxs("section", { className: cn("card p-4 sm:p-5", className), "aria-label": `Penilaian ${name}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Thumb, { image: image && !imageFailed ? image : null, onError: () => setImageFailed(true) }),
        /* @__PURE__ */ jsx(ProductTitle, { name, variantLabel })
      ] }),
      ratingValue > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(StarRating, { value: ratingValue, size: "lg", readOnly: true, label: `Rating ${ratingValue} dari 5` }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-body text-ink-soft", children: submitted ? "Terima kasih! Penilaianmu membantu pembeli lain." : "Produk ini sudah kamu nilai pada pesanan ini." })
    ] });
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
  return /* @__PURE__ */ jsxs("form", { className: cn("card p-4 sm:p-5", className), onSubmit: submit, noValidate: true, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Thumb, { image: image && !imageFailed ? image : null, onError: () => setImageFailed(true) }),
      /* @__PURE__ */ jsx(ProductTitle, { name, variantLabel })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 text-body text-ink", children: "Seberapa puas kamu?" }),
    /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
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
    ) }),
    /* @__PURE__ */ jsx(
      Field,
      {
        label: "Komentar (opsional)",
        htmlFor: textareaId,
        error: shownError,
        className: "mt-4",
        children: /* @__PURE__ */ jsx(
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
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Button, { type: "submit", fullWidth: true, loading: submitting, disabled: submitting, children: "Kirim Penilaian" }) })
  ] });
}
function Thumb({ image, onError }) {
  return /* @__PURE__ */ jsx("div", { className: "h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface", children: image ? /* @__PURE__ */ jsx("img", { src: image, alt: "", width: "64", height: "64", className: "h-full w-full object-cover", onError }) : /* @__PURE__ */ jsx("span", { className: "flex h-full w-full items-center justify-center text-slate-300", "aria-hidden": "true", children: /* @__PURE__ */ jsx(ImageOffIcon, { size: 24 }) }) });
}
function ProductTitle({ name, variantLabel }) {
  return /* @__PURE__ */ jsxs("p", { className: "min-w-0 text-h3 text-ink", children: [
    name,
    variantLabel && /* @__PURE__ */ jsxs("span", { className: "text-meta font-normal text-slate-500", children: [
      " \xB7 ",
      variantLabel
    ] })
  ] });
}

// resources/js/Pages/Public/CheckoutSuccess.jsx
var STATUS_BOLEH_DINILAI = ["dibayar", "diproses", "dikirim", "selesai"];
function CheckoutSuccess({ pesanan: pesanan2 = null, ulasan = null, errors = {}, flash = null }) {
  const orderId = pesanan2?.id ?? null;
  const items = Array.isArray(pesanan2?.items) ? pesanan2.items : [];
  const sudah = (Array.isArray(ulasan?.sudah) ? ulasan.sudah : []).map((id) => Number(id));
  const boleh = ulasan?.boleh === true;
  const syaratDinilai = pesanan2?.payment_status === "settlement" && STATUS_BOLEH_DINILAI.includes(String(pesanan2?.status ?? ""));
  const [busyProduct, setBusyProduct] = useState(null);
  const [submittedId, setSubmittedId] = useState(null);
  const [justRated, setJustRated] = useState({});
  const pending = items.filter(
    (item2) => !sudah.includes(Number(item2.product_id)) && justRated[item2.product_id] === void 0
  );
  const sudahAda = items.filter(
    (item2) => sudah.includes(Number(item2.product_id)) || justRated[item2.product_id] !== void 0
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
  return /* @__PURE__ */ jsxs(PublicLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Pesanan Diterima" }),
    /* @__PURE__ */ jsxs("div", { className: "container py-4", children: [
      /* @__PURE__ */ jsx(
        Breadcrumb,
        {
          items: [
            { label: "Beranda", href: "/" },
            { label: "Keranjang", href: "/keranjang" },
            { label: "Pesanan Diterima" }
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-qris text-center", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "mt-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success-strong",
            "aria-hidden": "true",
            children: /* @__PURE__ */ jsx(CheckIcon, { size: 32 })
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "mt-3 text-h1 text-ink", children: "Pesanan diterima" }),
        pesanan2?.code && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-body text-ink-soft", children: [
          "Kode order ",
          /* @__PURE__ */ jsx("span", { className: "font-mono", children: pesanan2.code })
        ] }),
        pesanan2?.paid_at && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-meta text-slate-500", children: [
          "Dibayar ",
          formatDateTime(pesanan2.paid_at)
        ] })
      ] }),
      flash?.success && /* @__PURE__ */ jsx(InlineNotice, { tone: "success", className: "mt-4", children: /* @__PURE__ */ jsx("p", { children: flash.success }) }),
      flash?.error && /* @__PURE__ */ jsx(InlineNotice, { tone: "error", className: "mt-4", children: /* @__PURE__ */ jsx("p", { children: flash.error }) }),
      /* @__PURE__ */ jsxs("section", { className: "card mt-6 p-6", "aria-labelledby": "judul-ringkasan", children: [
        /* @__PURE__ */ jsx("h2", { id: "judul-ringkasan", className: "text-h3 text-ink", children: "Ringkasan Pesanan" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-4 flex flex-col gap-3", children: items.map((item2) => /* @__PURE__ */ jsxs("li", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("span", { className: "block text-body text-ink", children: item2.name ?? "Produk" }),
            /* @__PURE__ */ jsxs("span", { className: "block text-meta text-slate-500", children: [
              item2.variant_label ? `${item2.variant_label} \xB7 ` : "",
              formatNumber(item2.qty),
              " \xD7 ",
              rupiah(item2.unit_price) ?? "-"
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-body text-ink", children: rupiah(item2.line_total) ?? "-" })
        ] }, item2.product_id)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 border-t border-line pt-4", children: /* @__PURE__ */ jsxs("dl", { className: "flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-body text-ink-soft", children: "Subtotal" }),
            /* @__PURE__ */ jsx("dd", { className: "text-body text-ink", children: rupiah(pesanan2?.subtotal) ?? "-" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-body text-ink-soft", children: "Ongkir" }),
            /* @__PURE__ */ jsx("dd", { className: "text-body text-ink", children: rupiah(pesanan2?.shipping_cost) ?? "-" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-body font-bold text-ink", children: "Total" }),
            /* @__PURE__ */ jsx("dd", { className: "text-[20px] font-bold leading-none text-ink", children: rupiah(pesanan2?.total) ?? "-" })
          ] })
        ] }) }),
        pesanan2?.customer_name && /* @__PURE__ */ jsxs("div", { className: "mt-5 border-t border-line pt-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-label uppercase text-slate-500", children: "Dikirim ke" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-body text-ink", children: pesanan2.customer_name }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-meta text-slate-500", children: pesanan2.customer_phone ?? "-" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-body text-ink-soft", children: [
            pesanan2.customer_address ?? "-",
            pesanan2.customer_city ? `, ${pesanan2.customer_city}` : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mt-8", "aria-labelledby": "judul-penilaian", children: [
        /* @__PURE__ */ jsx("h2", { id: "judul-penilaian", className: "text-h2 text-ink", children: tampilkanForm ? "Beri Penilaian" : "Penilaianmu" }),
        errors?.ulasan && /* @__PURE__ */ jsx(InlineNotice, { tone: "error", className: "mt-3", children: /* @__PURE__ */ jsx("p", { children: errors.ulasan }) }),
        alasanBelumBoleh && /* @__PURE__ */ jsx(InlineNotice, { tone: "warning", className: "mt-3", children: /* @__PURE__ */ jsx("p", { children: "Ulasan bisa dikirim setelah pembayaran berhasil." }) }),
        sudahAda.length > 0 && pending.length === 0 && /* @__PURE__ */ jsx(InlineNotice, { tone: "success", className: "mt-3", children: /* @__PURE__ */ jsx("p", { children: "Terima kasih! Penilaianmu membantu pembeli lain." }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-4 lg:grid-cols-2", children: [
          tampilkanForm && pending.map((item2) => /* @__PURE__ */ jsx(
            ReviewForm,
            {
              productId: item2.product_id,
              product: item2,
              submitting: busyProduct === item2.product_id,
              error: errorFor(item2),
              onSubmit: submitReview
            },
            `isi-${item2.product_id}`
          )),
          sudahAda.map((item2) => /* @__PURE__ */ jsx(
            ReviewForm,
            {
              productId: item2.product_id,
              product: item2,
              rating: justRated[item2.product_id] ?? 0,
              submitted: justRated[item2.product_id] !== void 0,
              alreadyReviewed: justRated[item2.product_id] === void 0
            },
            `sudah-${item2.product_id}`
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center", children: [
        /* @__PURE__ */ jsx(Button, { href: "/produk", variant: "secondary", children: "Lihat Produk Lain" }),
        /* @__PURE__ */ jsx(Button, { href: "/", children: "Kembali ke Beranda" })
      ] })
    ] })
  ] });
}

// tmp/uji-aksi-ulasan-t_2de36f29.mjs
var hasil = [];
var uji = (nama, fn) => {
  try {
    bersihkanStore();
    bersihkan();
    kendali.halaman.props = { auth: { user: null }, cart: { count: 2 }, settings: {} };
    fn();
    hasil.push({ status: "OK", nama, catatan: "" });
  } catch (galat) {
    hasil.push({ status: "GAGAL", nama, catatan: galat.message });
  }
};
var harus = (kondisi, pesan) => {
  if (!kondisi) throw new Error(pesan);
};
var renderPohon = (Komponen, props, maks = 10) => {
  let pohon = null;
  for (let i = 0; i < maks; i += 1) {
    mulaiPass();
    pohon = Komponen(props);
    if (!store.kotor) break;
  }
  return pohon;
};
var kumpulan = (pohon, hasilKumpul = []) => {
  if (pohon === null || pohon === void 0 || typeof pohon === "boolean") return hasilKumpul;
  if (Array.isArray(pohon)) {
    pohon.forEach((isi) => kumpulan(isi, hasilKumpul));
    return hasilKumpul;
  }
  if (typeof pohon === "string" || typeof pohon === "number") return hasilKumpul;
  hasilKumpul.push(pohon);
  kumpulan(pohon.props?.children, hasilKumpul);
  return hasilKumpul;
};
var semuaElemen = (pohon) => kumpulan(pohon);
var cariSemua = (pohon, predikat) => semuaElemen(pohon).filter(predikat);
var bernama = (nama) => (el) => typeof el.type === "function" && el.type.name === nama;
var teksPohon = (pohon) => {
  const bagian = [];
  const kumpul = (simpul) => {
    if (simpul === null || simpul === void 0 || typeof simpul === "boolean") return;
    if (Array.isArray(simpul)) return simpul.forEach(kumpul);
    if (typeof simpul === "string" || typeof simpul === "number") {
      bagian.push(String(simpul));
      return;
    }
    if (typeof simpul === "object") {
      kumpul(simpul.props?.children);
      kumpul(simpul.props?.title);
    }
  };
  kumpul(pohon);
  return bagian.join(" | ");
};
var item = (productId) => ({
  id: productId,
  product_id: productId,
  variant_id: null,
  name: `Produk ${productId}`,
  variant_label: "Ukuran L / Merah",
  qty: 1,
  unit_price: 85e3,
  line_total: 85e3,
  image: `/images/seed/produk/produk-${productId}.png`
});
var pesanan = (ubah = {}) => ({
  id: 21,
  code: "TK-20261020-0001",
  status: "dibayar",
  payment_status: "settlement",
  subtotal: 17e4,
  shipping_cost: 2e4,
  total: 19e4,
  customer_name: "Siti Aminah",
  customer_phone: "081234567890",
  customer_address: "Jl. Melati 12",
  customer_city: "Pekalongan",
  created_at: "2026-10-20T14:05:00+07:00",
  paid_at: "2026-10-20T14:09:00+07:00",
  items: [item(3), item(7)],
  ...ubah
});
var SUKSES = "Terima kasih! Penilaianmu membantu pembeli lain.";
var formAktif = (pohon) => cariSemua(pohon, bernama("ReviewForm")).filter((el) => typeof el.props.onSubmit === "function");
var formTerkunci = (pohon) => cariSemua(pohon, bernama("ReviewForm")).filter((el) => el.props.onSubmit === void 0);
var formUntuk = (pohon, productId) => cariSemua(pohon, bernama("ReviewForm")).find((el) => Number(el.props.productId) === Number(productId)) ?? null;
uji("1. kirim ulasan -> POST /checkout/{order}/ulasan payload kontrak \xA79.1", () => {
  const props = { pesanan: pesanan(), ulasan: { boleh: true, sudah: [] } };
  let pohon = renderPohon(CheckoutSuccess, props);
  const aktif = formAktif(pohon);
  harus(aktif.length === 2, `form aktif harus 2, dapat ${aktif.length}`);
  formUntuk(pohon, 3).props.onSubmit({ product_id: 3, rating: 5, comment: "Bagus" });
  harus(kendali.kunjungan.length === 1, `panggilan router harus 1, dapat ${kendali.kunjungan.length}`);
  const kunjungan = kendali.kunjungan[0];
  harus(kunjungan.metode === "post", `metode harus post, dapat ${kunjungan.metode}`);
  harus(kunjungan.url === "/checkout/21/ulasan", `url salah: ${kunjungan.url}`);
  harus(Array.isArray(kunjungan.data?.ulasan) && kunjungan.data.ulasan.length === 1, "payload `ulasan` harus array 1 entri");
  harus(kunjungan.data.ulasan[0].product_id === 3, "product_id entri salah");
  harus(kunjungan.data.ulasan[0].rating === 5, "rating entri salah");
  harus(kunjungan.data.ulasan[0].comment === "Bagus", "comment entri salah");
  harus(kunjungan.opsi?.preserveScroll === true, "preserveScroll harus true");
  harus(typeof kunjungan.opsi?.onSuccess === "function", "onSuccess hilang");
  harus(typeof kunjungan.opsi?.onFinish === "function", "onFinish hilang");
  kunjungan.opsi.onSuccess();
  pohon = renderPohon(CheckoutSuccess, props);
  harus(formAktif(pohon).length === 1, `sisa form aktif harus 1, dapat ${formAktif(pohon).length}`);
  harus(formUntuk(pohon, 3).props.submitted === true, "produk yang baru dikirim harus tampil sebagai terkirim");
  harus(formUntuk(pohon, 3).props.alreadyReviewed === false, 'produk yang baru dikirim bukan "sudah pernah dinilai"');
  harus(formUntuk(pohon, 7).props.submitted === void 0, "produk lain harus tetap berupa form aktif");
  harus(typeof formUntuk(pohon, 7).props.onSubmit === "function", "produk lain harus tetap bisa dinilai");
  kunjungan.opsi.onFinish();
});
uji("2. kirim ganda dicegah selama kiriman pertama belum selesai", () => {
  const props = { pesanan: pesanan(), ulasan: { boleh: true, sudah: [] } };
  let pohon = renderPohon(CheckoutSuccess, props);
  formUntuk(pohon, 3).props.onSubmit({ product_id: 3, rating: 4, comment: null });
  harus(kendali.kunjungan.length === 1, `hanya 1 kiriman, dapat ${kendali.kunjungan.length}`);
  harus(kendali.kunjungan[0].data.ulasan[0].comment === null, "komentar kosong harus tetap null");
  pohon = renderPohon(CheckoutSuccess, props);
  harus(formUntuk(pohon, 3).props.submitting === true, "produk yang sedang dikirim harus berstatus submitting");
  harus(formUntuk(pohon, 7).props.submitting === false, "produk lain tidak berstatus submitting");
  formUntuk(pohon, 7).props.onSubmit({ product_id: 7, rating: 5, comment: null });
  harus(kendali.kunjungan.length === 1, `kiriman kedua harus ditahan, dapat ${kendali.kunjungan.length}`);
  kendali.kunjungan[0].opsi.onFinish();
  pohon = renderPohon(CheckoutSuccess, props);
  harus(formUntuk(pohon, 7).props.submitting === false, "status submitting harus bersih setelah selesai");
  formUntuk(pohon, 7).props.onSubmit({ product_id: 7, rating: 5, comment: null });
  harus(kendali.kunjungan.length === 2, `setelah selesai kiriman berikutnya jalan, dapat ${kendali.kunjungan.length}`);
  harus(kendali.kunjungan[1].data.ulasan[0].product_id === 7, "produk kiriman kedua salah");
});
uji("3. boleh=false & semua sudah diulas -> tanpa form, kartu terkunci, terima kasih", () => {
  const props = { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3, 7] } };
  const pohon = renderPohon(CheckoutSuccess, props);
  harus(formAktif(pohon).length === 0, `form aktif harus 0, dapat ${formAktif(pohon).length}`);
  harus(formTerkunci(pohon).length === 2, `kartu terkunci harus 2, dapat ${formTerkunci(pohon).length}`);
  harus(formTerkunci(pohon).every((el) => el.props.alreadyReviewed === true), "kartu harus berstatus sudah dinilai");
  harus(teksPohon(pohon).includes(SUKSES), "notice terima kasih hilang");
});
uji("4. belum boleh dinilai -> tidak ada jalur kirim ulasan sama sekali", () => {
  const props = {
    pesanan: pesanan({ payment_status: "pending", paid_at: null }),
    ulasan: { boleh: false, sudah: [] }
  };
  const pohon = renderPohon(CheckoutSuccess, props);
  harus(cariSemua(pohon, bernama("ReviewForm")).length === 0, "tidak boleh ada kartu penilaian");
  harus(kendali.kunjungan.length === 0, "tidak boleh ada panggilan router");
});
uji("5. galat validasi server menempel pada produk yang dikirim", () => {
  const props = {
    pesanan: pesanan(),
    ulasan: { boleh: true, sudah: [] },
    errors: { "ulasan.0.rating": "Rating wajib diisi." }
  };
  let pohon = renderPohon(CheckoutSuccess, props);
  harus(formUntuk(pohon, 3).props.error === null, "galat tidak boleh muncul sebelum ada kiriman");
  formUntuk(pohon, 3).props.onSubmit({ product_id: 3, rating: 0, comment: null });
  pohon = renderPohon(CheckoutSuccess, props);
  harus(formUntuk(pohon, 3).props.error === "Rating wajib diisi.", "galat server harus menempel pada produk 3");
  harus(formUntuk(pohon, 7).props.error === null, "produk lain tidak boleh kena galat");
});
uji("6. seluruh produk selesai dinilai dalam sesi -> form habis + terima kasih", () => {
  const props = { pesanan: pesanan(), ulasan: { boleh: true, sudah: [] } };
  let pohon = renderPohon(CheckoutSuccess, props);
  [3, 7].forEach((id) => {
    formUntuk(pohon, id).props.onSubmit({ product_id: id, rating: 5, comment: null });
    const kunjungan = kendali.kunjungan[kendali.kunjungan.length - 1];
    kunjungan.opsi.onSuccess();
    kunjungan.opsi.onFinish();
    pohon = renderPohon(CheckoutSuccess, props);
  });
  harus(formAktif(pohon).length === 0, `form aktif harus 0, dapat ${formAktif(pohon).length}`);
  harus(formTerkunci(pohon).length === 2, `kartu terkirim harus 2, dapat ${formTerkunci(pohon).length}`);
  harus(teksPohon(pohon).includes(SUKSES), "notice terima kasih hilang");
  harus(kendali.kunjungan.length === 2, `total kiriman harus 2, dapat ${kendali.kunjungan.length}`);
});
uji("7. boleh=false + masih ada sisa produk -> tanpa form aktif, nol panggilan router", () => {
  const props = { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3] } };
  const pohon = renderPohon(CheckoutSuccess, props);
  harus(formAktif(pohon).length === 0, `form aktif harus 0 saat boleh=false, dapat ${formAktif(pohon).length}`);
  harus(formUntuk(pohon, 7) === null, "produk sisa tidak dirender sebagai kartu penilaian");
  harus(formUntuk(pohon, 3)?.props.alreadyReviewed === true, "kartu produk yang sudah diulas harus tetap tampil terkunci");
  harus(kendali.kunjungan.length === 0, `tidak boleh ada panggilan router, dapat ${kendali.kunjungan.length}`);
  harus(teksPohon(pohon).includes("Penilaianmu"), 'judul harus "Penilaianmu" saat gerbang tertutup');
});
var lebar = Math.max(...hasil.map((h2) => h2.nama.length));
hasil.forEach((h2) => console.log(`${h2.status.padEnd(5)} | ${h2.nama.padEnd(lebar)} | ${h2.catatan}`));
var gagal = hasil.filter((h2) => h2.status === "GAGAL").length;
console.log(`
RINGKASAN: ${hasil.length - gagal}/${hasil.length} uji lulus`);
process.exitCode = gagal === 0 ? 0 : 1;
