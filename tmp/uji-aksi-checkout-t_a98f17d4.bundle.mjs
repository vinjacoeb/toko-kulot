// tmp/uji-aksi-checkout-t_a98f17d4.mjs
import { readFileSync } from "node:fs";

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
var rupiah = (value) => {
  if (value === null || value === void 0 || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `Rp${Math.round(number).toLocaleString("id-ID")}`;
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

// resources/js/Components/Breadcrumb.jsx
function Breadcrumb({ items = [], className = "" }) {
  const list = (Array.isArray(items) ? items : []).filter((item) => item && item.label);
  if (list.length === 0) return null;
  const first = list[0];
  const last = list[list.length - 1];
  const middle = list.slice(1, -1);
  const renderItem = (item, isLast) => isLast || !item.href ? /* @__PURE__ */ jsx("span", { className: "text-ink", "aria-current": "page", children: item.label }) : /* @__PURE__ */ jsx(Link, { href: item.href, className: "transition-colors duration-hover hover:text-ink", children: item.label });
  return /* @__PURE__ */ jsx("nav", { "aria-label": "Breadcrumb", className: cn("h-12", className), children: /* @__PURE__ */ jsxs("ol", { className: "flex h-full items-center gap-2 text-meta text-slate-600", children: [
    /* @__PURE__ */ jsx("li", { className: "flex items-center gap-2", children: renderItem(first, list.length === 1) }),
    list.length > 1 && /* @__PURE__ */ jsx("li", { className: "flex items-center gap-2", "aria-hidden": "true", children: /* @__PURE__ */ jsx("span", { children: "/" }) }),
    middle.length > 0 && /* @__PURE__ */ jsx("li", { className: "flex items-center gap-2 sm:hidden", "aria-hidden": "true", children: /* @__PURE__ */ jsx("span", { children: "..." }) }),
    list.length > 1 && /* @__PURE__ */ jsx("li", { className: "flex items-center gap-2", children: renderItem(last, true) })
  ] }) });
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

// resources/js/Components/Input.jsx
var BASE = "w-full h-field rounded-md border border-line bg-white px-3.5 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Input({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx(
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

// resources/js/Components/OrderSummary.jsx
function OrderSummary({
  subtotal = null,
  shipping = null,
  total = null,
  ctaLabel = null,
  ctaHref = null,
  onSubmit = null,
  formId = null,
  loading = false,
  disabled = false,
  note = "Pembayaran QRIS",
  className = "",
  children = null
}) {
  const row = "flex items-baseline justify-between gap-4";
  return /* @__PURE__ */ jsxs("section", { className: cn("card p-6", className), "aria-label": "Ringkasan pesanan", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-h3 text-ink", children: "Ringkasan Pesanan" }),
    /* @__PURE__ */ jsxs("dl", { className: "mt-4 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: row, children: [
        /* @__PURE__ */ jsx("dt", { className: "text-body text-ink-soft", children: "Subtotal" }),
        /* @__PURE__ */ jsx("dd", { className: "text-body text-ink", children: rupiah(subtotal) ?? "-" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: row, children: [
        /* @__PURE__ */ jsx("dt", { className: "text-body text-ink-soft", children: "Ongkir" }),
        /* @__PURE__ */ jsx("dd", { className: "text-body text-ink", children: rupiah(shipping) ?? "-" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: cn(row, "mt-1 border-t border-line pt-4"), children: [
        /* @__PURE__ */ jsx("dt", { className: "text-body font-bold text-ink", children: "Total" }),
        /* @__PURE__ */ jsx("dd", { className: "text-[20px] font-bold leading-none text-ink", children: rupiah(total) ?? "-" })
      ] })
    ] }),
    children,
    ctaLabel && (ctaHref || onSubmit) && /* @__PURE__ */ jsx("div", { className: "mt-5", children: onSubmit ? /* @__PURE__ */ jsx(
      Button,
      {
        type: formId ? "submit" : "button",
        form: formId ?? void 0,
        fullWidth: true,
        loading,
        disabled,
        onClick: formId ? void 0 : onSubmit,
        children: ctaLabel
      }
    ) : /* @__PURE__ */ jsx(Button, { href: ctaHref, fullWidth: true, loading, children: ctaLabel }) }),
    note && /* @__PURE__ */ jsx("p", { className: "mt-3 text-meta text-slate-500", children: note })
  ] });
}

// resources/js/Components/Textarea.jsx
var BASE2 = "w-full min-h-[120px] resize-y rounded-md border border-line bg-white px-3.5 py-3 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Textarea({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      id,
      "aria-invalid": error ? "true" : void 0,
      "aria-describedby": error && id ? id + "-error" : void 0,
      className: cn(BASE2, error ? "border-danger" : null, className),
      ...rest
    }
  );
}

// resources/js/Pages/Public/Checkout.jsx
var PHONE_PATTERN = /^(\+62|62|0)8[0-9]{7,12}$/;
var POSTAL_PATTERN = /^\d{5}$/;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var URUTAN_KOLOM = [
  "customer_name",
  "customer_phone",
  "customer_email",
  "customer_address",
  "customer_city",
  "customer_postal_code",
  "note"
];
var LABEL_KOLOM = {
  customer_name: "Nama Penerima",
  customer_phone: "Nomor WhatsApp",
  customer_email: "Email",
  customer_address: "Alamat Lengkap",
  customer_city: "Kota/Kecamatan",
  customer_postal_code: "Kode Pos",
  note: "Catatan"
};
function validate(values) {
  const errors = {};
  const teks = (nilai) => String(nilai ?? "").trim();
  const nama = teks(values.customer_name);
  if (nama === "") errors.customer_name = "Nama penerima wajib diisi.";
  else if (nama.length < 3) errors.customer_name = "Nama penerima minimal 3 karakter.";
  else if (nama.length > 100) errors.customer_name = "Nama penerima maksimal 100 karakter.";
  const telepon = teks(values.customer_phone);
  if (telepon === "") errors.customer_phone = "Nomor WhatsApp wajib diisi.";
  else if (!PHONE_PATTERN.test(telepon)) errors.customer_phone = "Nomor WhatsApp tidak valid.";
  const email = teks(values.customer_email);
  if (email === "") errors.customer_email = "Email wajib diisi.";
  else if (!EMAIL_PATTERN.test(email)) errors.customer_email = "Email tidak valid.";
  else if (email.length > 150) errors.customer_email = "Email maksimal 150 karakter.";
  const alamat = teks(values.customer_address);
  if (alamat === "") errors.customer_address = "Alamat lengkap wajib diisi.";
  else if (alamat.length < 10) errors.customer_address = "Alamat terlalu singkat. Tulis jalan, nomor, RT/RW.";
  else if (alamat.length > 500) errors.customer_address = "Alamat maksimal 500 karakter.";
  const kota = teks(values.customer_city);
  if (kota === "") errors.customer_city = "Kota/kecamatan wajib diisi.";
  else if (kota.length < 3) errors.customer_city = "Nama kota/kecamatan terlalu singkat.";
  else if (kota.length > 100) errors.customer_city = "Kota/kecamatan maksimal 100 karakter.";
  const kodePos = teks(values.customer_postal_code);
  if (kodePos === "") errors.customer_postal_code = "Kode pos wajib diisi.";
  else if (!POSTAL_PATTERN.test(kodePos)) errors.customer_postal_code = "Kode pos harus 5 angka.";
  if (teks(values.note).length > 500) errors.note = "Catatan maksimal 500 karakter.";
  return errors;
}
function gulirKeKolom(id, { fokus = true } = {}) {
  if (!id || typeof document === "undefined") return;
  const elemen = document.getElementById(id);
  if (!elemen || typeof elemen.scrollIntoView !== "function") return;
  const gerakDikurangi2 = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  elemen.scrollIntoView({ behavior: gerakDikurangi2 ? "instant" : "smooth", block: "center" });
  if (fokus && typeof elemen.focus === "function") elemen.focus({ preventScroll: true });
}
function Checkout({ keranjang = null, prefill = null, pembayaran = null, flash = null }) {
  const [clientErrors, setClientErrors] = useState({});
  const [throttle, setThrottle] = useState(null);
  const form = useForm({
    customer_name: prefill?.customer_name ?? "",
    customer_phone: prefill?.customer_phone ?? "",
    customer_email: prefill?.customer_email ?? "",
    customer_address: prefill?.customer_address ?? "",
    customer_city: prefill?.customer_city ?? "",
    customer_postal_code: prefill?.customer_postal_code ?? "",
    note: prefill?.note ?? ""
  });
  const items = Array.isArray(keranjang?.items) ? keranjang.items : [];
  const isEmpty = keranjang?.is_empty === true || items.length === 0;
  const expiryMinutes = Number(pembayaran?.expiry_minutes ?? 0) || null;
  const fieldError = (key) => clientErrors[key] ?? form.errors?.[key] ?? null;
  const kolomBermasalah = URUTAN_KOLOM.filter((key) => Boolean(fieldError(key)));
  const kolomPertama = kolomBermasalah[0] ?? null;
  const jumlahBermasalah = kolomBermasalah.length;
  const kunciGalatServer = URUTAN_KOLOM.filter((key) => Boolean(form.errors?.[key])).join(",");
  useEffect(() => {
    if (kunciGalatServer === "") return;
    gulirKeKolom(kunciGalatServer.split(",")[0], { fokus: false });
  }, [kunciGalatServer]);
  const update = (key, value) => {
    form.setData(key, value);
    if (clientErrors[key]) setClientErrors((prev) => ({ ...prev, [key]: void 0 }));
  };
  const submit = (event) => {
    event.preventDefault();
    if (form.processing) return;
    const found = validate(form.data);
    setClientErrors(found);
    if (Object.keys(found).length > 0) return;
    setThrottle(null);
    form.post("/checkout", {
      preserveScroll: true,
      onHttpException: (response) => {
        if (response?.status === 429) {
          setThrottle("Terlalu banyak percobaan membuat pesanan. Tunggu sebentar, lalu coba lagi.");
          return false;
        }
        return void 0;
      }
    });
  };
  const noticeValidasi = (className) => {
    if (jumlahBermasalah === 0) return null;
    const label = LABEL_KOLOM[kolomPertama] ?? kolomPertama;
    const pesan = fieldError(kolomPertama);
    const ringkas = jumlahBermasalah === 1 ? `Kolom ${label}: ${pesan}` : `Kolom pertama ${label}: ${pesan}`;
    return /* @__PURE__ */ jsxs(
      InlineNotice,
      {
        tone: "error",
        className,
        title: `Ada ${jumlahBermasalah} kolom yang perlu diperbaiki`,
        children: [
          /* @__PURE__ */ jsx("p", { children: ringkas }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "mt-3", onClick: () => gulirKeKolom(kolomPertama), children: "Perbaiki kolom" })
        ]
      }
    );
  };
  return /* @__PURE__ */ jsxs(PublicLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Checkout" }),
    /* @__PURE__ */ jsxs("div", { className: "container py-4", children: [
      /* @__PURE__ */ jsx(
        Breadcrumb,
        {
          items: [
            { label: "Beranda", href: "/" },
            { label: "Keranjang", href: "/keranjang" },
            { label: "Checkout" }
          ]
        }
      ),
      /* @__PURE__ */ jsxs("header", { className: "mt-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-h1 text-ink", children: "Checkout" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-body text-ink-soft", children: "Lengkapi data penerima, lalu selesaikan pembayaran QRIS." })
      ] }),
      isEmpty && /* @__PURE__ */ jsx(InlineNotice, { tone: "warning", className: "mt-4", children: /* @__PURE__ */ jsxs("p", { children: [
        "Keranjang masih kosong. ",
        /* @__PURE__ */ jsx(Link, { href: "/keranjang", className: "underline underline-offset-4", children: "Kembali ke keranjang" }),
        " untuk menambah produk."
      ] }) }),
      flash?.error && /* @__PURE__ */ jsx(InlineNotice, { tone: "error", className: "mt-4", children: /* @__PURE__ */ jsx("p", { children: flash.error }) }),
      throttle && /* @__PURE__ */ jsx(InlineNotice, { tone: "error", className: "mt-4", children: /* @__PURE__ */ jsx("p", { children: throttle }) }),
      noticeValidasi("mt-4"),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10", children: [
        /* @__PURE__ */ jsxs(
          "form",
          {
            id: "checkout-form",
            className: "min-w-0 flex-1 lg:basis-[60%]",
            onSubmit: submit,
            noValidate: true,
            children: [
              /* @__PURE__ */ jsxs("section", { className: "card p-6", "aria-labelledby": "judul-penerima", children: [
                /* @__PURE__ */ jsx("h2", { id: "judul-penerima", className: "text-h3 text-ink", children: "Data Penerima" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-4", children: [
                  /* @__PURE__ */ jsx(Field, { label: "Nama Penerima", htmlFor: "customer_name", required: true, error: fieldError("customer_name"), children: /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "customer_name",
                      name: "customer_name",
                      autoComplete: "name",
                      maxLength: 100,
                      value: form.data.customer_name,
                      error: fieldError("customer_name"),
                      onChange: (event) => update("customer_name", event.target.value)
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Field, { label: "Nomor WhatsApp", htmlFor: "customer_phone", required: true, error: fieldError("customer_phone"), children: /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "customer_phone",
                      name: "customer_phone",
                      type: "tel",
                      inputMode: "tel",
                      autoComplete: "tel",
                      placeholder: "08xxxxxxxxxx",
                      maxLength: 20,
                      value: form.data.customer_phone,
                      error: fieldError("customer_phone"),
                      onChange: (event) => update("customer_phone", event.target.value)
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Field, { label: "Email", htmlFor: "customer_email", required: true, error: fieldError("customer_email"), children: /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "customer_email",
                      name: "customer_email",
                      type: "email",
                      autoComplete: "email",
                      maxLength: 150,
                      value: form.data.customer_email,
                      error: fieldError("customer_email"),
                      onChange: (event) => update("customer_email", event.target.value)
                    }
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("section", { className: "card mt-6 p-6", "aria-labelledby": "judul-alamat", children: [
                /* @__PURE__ */ jsx("h2", { id: "judul-alamat", className: "text-h3 text-ink", children: "Alamat Pengiriman" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-4", children: [
                  /* @__PURE__ */ jsx(
                    Field,
                    {
                      label: "Alamat Lengkap",
                      htmlFor: "customer_address",
                      required: true,
                      error: fieldError("customer_address"),
                      hint: "Nama jalan, nomor rumah, RT/RW, kelurahan, dan patokan bila ada.",
                      children: /* @__PURE__ */ jsx(
                        Textarea,
                        {
                          id: "customer_address",
                          name: "customer_address",
                          autoComplete: "street-address",
                          maxLength: 500,
                          value: form.data.customer_address,
                          error: fieldError("customer_address"),
                          onChange: (event) => update("customer_address", event.target.value)
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                    /* @__PURE__ */ jsx(Field, { label: "Kota/Kecamatan", htmlFor: "customer_city", required: true, error: fieldError("customer_city"), children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "customer_city",
                        name: "customer_city",
                        autoComplete: "address-level2",
                        maxLength: 100,
                        value: form.data.customer_city,
                        error: fieldError("customer_city"),
                        onChange: (event) => update("customer_city", event.target.value)
                      }
                    ) }),
                    /* @__PURE__ */ jsx(Field, { label: "Kode Pos", htmlFor: "customer_postal_code", required: true, error: fieldError("customer_postal_code"), children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "customer_postal_code",
                        name: "customer_postal_code",
                        inputMode: "numeric",
                        autoComplete: "postal-code",
                        maxLength: 5,
                        value: form.data.customer_postal_code,
                        error: fieldError("customer_postal_code"),
                        onChange: (event) => update("customer_postal_code", event.target.value.replace(/[^0-9]/g, ""))
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsx(
                    Field,
                    {
                      label: "Catatan (opsional)",
                      htmlFor: "note",
                      error: fieldError("note"),
                      hint: "Contoh: ukuran atau warna alternatif bila stok habis.",
                      children: /* @__PURE__ */ jsx(
                        Textarea,
                        {
                          id: "note",
                          name: "note",
                          maxLength: 500,
                          value: form.data.note,
                          error: fieldError("note"),
                          onChange: (event) => update("note", event.target.value)
                        }
                      )
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("section", { className: "card mt-6 p-6", "aria-labelledby": "judul-pembayaran", children: [
                /* @__PURE__ */ jsx("h2", { id: "judul-pembayaran", className: "text-h3 text-ink", children: "Metode Pembayaran" }),
                /* @__PURE__ */ jsxs("label", { className: "mt-3 block rounded-md border-2 border-brand p-4", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "radio",
                        name: "payment_method",
                        value: "qris",
                        defaultChecked: true,
                        disabled: true,
                        "aria-describedby": "metode-qris-hint",
                        className: "h-4 w-4 accent-brand"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-body font-semibold text-ink", children: pembayaran?.label ?? "QRIS (semua e-wallet & m-banking)" })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { id: "metode-qris-hint", className: "mt-1 block pl-7 text-meta text-slate-500", children: [
                    "Pindai kode QR dengan aplikasi e-wallet atau m-banking",
                    expiryMinutes ? `, lalu bayar dalam ${expiryMinutes} menit.` : "."
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-meta text-slate-500", children: "Metode pembayaran lain belum tersedia." })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "lg:w-summary lg:shrink-0", children: /* @__PURE__ */ jsx(
          OrderSummary,
          {
            className: "lg:sticky lg:top-20",
            subtotal: keranjang?.subtotal ?? null,
            shipping: keranjang?.shipping_cost ?? null,
            total: keranjang?.total ?? null,
            ctaLabel: "Buat Pesanan",
            formId: "checkout-form",
            onSubmit: submit,
            loading: form.processing,
            disabled: form.processing || isEmpty,
            note: "Pembayaran QRIS",
            children: noticeValidasi("mt-4")
          }
        ) })
      ] })
    ] })
  ] });
}

// tmp/uji-aksi-checkout-t_a98f17d4.mjs
var berkasRequest = readFileSync(new URL("../app/Http/Requests/CheckoutRequest.php", import.meta.url), "utf8");
var pesanServer = {};
for (const m of berkasRequest.matchAll(/'([a-z_]+)\.([a-z_]+)'\s*=>\s*'([^']*)'/g)) {
  pesanServer[`${m[1]}.${m[2]}`] = m[3];
}
var gerakDikurangi = false;
var dicatat = { gulir: [], fokus: [] };
var elemenAda = /* @__PURE__ */ new Map();
var daftarId = [
  "customer_name",
  "customer_phone",
  "customer_email",
  "customer_address",
  "customer_city",
  "customer_postal_code",
  "note"
];
var daftarkanElemen = (id) => {
  if (!elemenAda.has(id)) {
    elemenAda.set(id, {
      id,
      scrollIntoView(opsi) {
        dicatat.gulir.push({ id, opsi });
      },
      focus(opsi) {
        dicatat.fokus.push({ id, opsi });
      }
    });
  }
  return elemenAda.get(id);
};
daftarId.forEach(daftarkanElemen);
var banyakKelas = () => ({ add() {
}, remove() {
}, toggle() {
}, contains: () => false });
var jam = { antre: [], urut: 0 };
globalThis.HTMLElement = class HTMLElement2 {
};
globalThis.window = {
  scrollY: 0,
  innerWidth: 1280,
  location: { href: "http://127.0.0.1:8000/checkout", pathname: "/checkout", search: "" },
  matchMedia: () => ({ matches: gerakDikurangi, addEventListener() {
  }, removeEventListener() {
  } }),
  addEventListener() {
  },
  removeEventListener() {
  },
  setTimeout(fn, ms) {
    jam.urut += 1;
    jam.antre.push({ id: jam.urut, fn, ms });
    return jam.urut;
  },
  clearTimeout(id) {
    jam.antre = jam.antre.filter((t) => t.id !== id);
  }
};
globalThis.document = {
  visibilityState: "visible",
  activeElement: null,
  documentElement: { classList: banyakKelas(), style: {} },
  body: {
    style: { overflow: "" },
    classList: banyakKelas(),
    appendChild() {
    },
    removeChild() {
    },
    addEventListener() {
    },
    removeEventListener() {
    },
    contains: () => false
  },
  addEventListener() {
  },
  removeEventListener() {
  },
  getElementById: (id) => elemenAda.get(id) ?? null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: banyakKelas(), appendChild() {
  } })
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
var kumpulan = (pohon, hasil2 = []) => {
  if (pohon === null || pohon === void 0 || typeof pohon === "boolean") return hasil2;
  if (Array.isArray(pohon)) {
    pohon.forEach((isi) => kumpulan(isi, hasil2));
    return hasil2;
  }
  if (typeof pohon === "string" || typeof pohon === "number") return hasil2;
  if (typeof pohon.type === "function" && pohon.type.__shim) return hasil2;
  hasil2.push(pohon);
  kumpulan(pohon.props?.children, hasil2);
  return hasil2;
};
var semuaElemen = (pohon) => kumpulan(pohon);
var cari = (pohon, predikat) => semuaElemen(pohon).find(predikat) ?? null;
var cariSemua = (pohon, predikat) => semuaElemen(pohon).filter(predikat);
var bernama = (nama) => (el) => typeof el.type === "function" && el.type.name === nama;
var berid = (id) => (el) => el.props?.id === id;
var teksPohon = (pohon) => {
  const bagian = [];
  const kumpul = (simpul) => {
    if (simpul === null || simpul === void 0 || typeof simpul === "boolean") return;
    if (Array.isArray(simpul)) return simpul.forEach(kumpul);
    if (typeof simpul === "string" || typeof simpul === "number") {
      bagian.push(String(simpul));
      return;
    }
    if (typeof simpul === "object") kumpul(simpul.props?.children);
  };
  kumpul(pohon);
  return bagian.join(" | ");
};
var kirimKejadian = (el, nilai) => el.props.onChange?.({ target: { value: nilai }, currentTarget: { value: nilai }, preventDefault() {
} });
var klik = (el) => el.props.onClick?.({ preventDefault() {
}, stopPropagation() {
}, currentTarget: { disabled: false } });
var poskan = (el) => el.props.onSubmit?.({ preventDefault() {
} });
var medanDari = (pohon, htmlFor) => cari(pohon, (el) => bernama("Field")(el) && el.props.htmlFor === htmlFor);
var noticeKolom = (pohon) => cariSemua(pohon, bernama("InlineNotice")).filter(
  (el) => el.props.tone === "error" && String(el.props.title ?? "").includes("kolom yang perlu diperbaiki")
);
var tombolPerbaiki = (pohon) => cariSemua(pohon, bernama("Button")).filter((el) => teksPohon(el).includes("Perbaiki kolom"));
var keranjangIsi = () => ({
  items: [
    {
      id: 1,
      product_id: 7,
      name: "Daster Kulot Batik",
      slug: "daster-kulot-batik",
      variant_label: "L / Hitam",
      qty: 2,
      price: 85e3,
      subtotal: 17e4
    }
  ],
  count: 2,
  subtotal: 17e4,
  shipping_cost: 0,
  total: 17e4,
  is_empty: false
});
var keranjangKosong = () => ({
  items: [],
  count: 0,
  subtotal: 0,
  shipping_cost: 0,
  total: 0,
  is_empty: true
});
var propsCheckout = ({ keranjang, ...sisa } = {}) => ({
  keranjang: keranjang === void 0 ? keranjangIsi() : keranjang,
  prefill: null,
  pembayaran: { method: "qris", label: "QRIS (semua e-wallet & m-banking)", expiry_minutes: 5 },
  flash: null,
  ...sisa
});
var ISI_SAH = {
  customer_name: "Siti Aminah",
  customer_phone: "081234567890",
  customer_email: "siti@example.com",
  customer_address: "Jl. Melati 12, RT 03 RW 04, Pekalongan",
  customer_city: "Pekalongan",
  customer_postal_code: "51111",
  note: "Tolong dibungkus rapi."
};
var isiSemua = (props, ubah = {}) => {
  const nilai = { ...ISI_SAH, ...ubah };
  let pohon = renderPohon(Checkout, props);
  Object.entries(nilai).forEach(([kunci, isi]) => {
    kirimKejadian(cari(pohon, berid(kunci)), isi);
  });
  return renderPohon(Checkout, props);
};
var hasil = [];
var uji = (nama, fn) => {
  bersihkanStore();
  bersihkan();
  dicatat.gulir = [];
  dicatat.fokus = [];
  gerakDikurangi = false;
  jam.antre = [];
  try {
    fn();
    hasil.push({ nama, lulus: true, pesan: "" });
  } catch (galat) {
    hasil.push({ nama, lulus: false, pesan: galat.message });
  }
};
var harus = (syarat, pesan) => {
  if (!syarat) throw new Error(pesan);
};
var sama = (nyata, harap, pesan) => {
  const a = JSON.stringify(nyata);
  const b = JSON.stringify(harap);
  if (a !== b) throw new Error(`${pesan} (dapat ${a}, harap ${b})`);
};
uji('A1 CTA "Buat Pesanan" submit ke form yang sama, mati hanya saat processing/keranjang kosong', () => {
  const ringkasan = (pohon) => cari(pohon, bernama("OrderSummary"));
  let cta = ringkasan(renderPohon(Checkout, propsCheckout()));
  harus(cta !== null, "OrderSummary tidak dirender");
  harus(cta.props.formId === "checkout-form", `CTA tidak menunjuk formulir checkout (formId=${cta.props.formId})`);
  harus(cta.props.ctaLabel === "Buat Pesanan", "label CTA berubah");
  harus(cta.props.disabled === false && cta.props.loading === false, "CTA harus aktif saat keranjang berisi");
  harus(typeof cta.props.onSubmit === "function", "CTA kehilangan penangan submit formulir");
  kendali.berikutnya.processing = true;
  cta = ringkasan(renderPohon(Checkout, propsCheckout()));
  harus(cta.props.loading === true, "CTA tidak menandai loading saat processing");
  harus(cta.props.disabled === true, "CTA masih bisa diklik saat processing");
  kendali.berikutnya.processing = false;
  cta = ringkasan(renderPohon(Checkout, propsCheckout({ keranjang: keranjangKosong() })));
  harus(cta.props.disabled === true, "CTA harus mati saat keranjang kosong");
  harus(cta.props.loading === false, "keranjang kosong bukan keadaan memuat");
  cta = ringkasan(renderPohon(Checkout, propsCheckout({ keranjang: null })));
  harus(cta.props.disabled === true, "keranjang null harus dianggap kosong");
  harus(teksPohon(renderPohon(Checkout, propsCheckout({ keranjang: null }))).includes("Keranjang masih kosong"), "notice cart-empty hilang");
});
uji("A2 validate() gagal: tidak ada permintaan ke server, notice di atas form DAN di atas CTA", () => {
  const props = propsCheckout();
  const pohon = renderPohon(Checkout, props);
  poskan(cari(pohon, (el) => el.type === "form"));
  harus(kendali.kunjungan.length === 0, "formulir tidak sah tetap dikirim ke server");
  const kini = renderPohon(Checkout, props);
  const notice = noticeKolom(kini);
  harus(notice.length === 2, `notice kolom bermasalah tidak tampil dua kali (dapat ${notice.length})`);
  sama(notice[0].props.title, "Ada 6 kolom yang perlu diperbaiki", "judul notice salah");
  harus(
    teksPohon(notice[0]).includes("Kolom pertama Nama Penerima: Nama penerima wajib diisi."),
    "notice tidak menyebut kolom pertama dan sebabnya"
  );
  harus(teksPohon(notice[0]).includes("Perbaiki kolom"), "tombol Perbaiki kolom hilang dari notice atas");
  sama(teksPohon(notice[1]), teksPohon(notice[0]), "notice atas CTA berbunyi beda dari notice atas form");
  const urut = semuaElemen(kini);
  const indeksForm = urut.findIndex((el) => el.type === "form");
  const indeksNoticeAtas = urut.indexOf(notice[0]);
  const indeksNoticeBawah = urut.indexOf(notice[1]);
  harus(indeksNoticeAtas < indeksForm, "notice pertama tidak berada sebelum formulir");
  harus(indeksNoticeBawah > indeksForm, "notice kedua tidak berada setelah formulir (dekat CTA)");
  const ringkasan = cari(kini, bernama("OrderSummary"));
  harus(
    semuaElemen(ringkasan.props.children).includes(notice[1]),
    "notice dekat CTA tidak berada di dalam OrderSummary"
  );
  harus(
    teksPohon(ringkasan.props.children).includes("Perbaiki kolom"),
    "notice di dalam OrderSummary kehilangan tombol Perbaiki kolom"
  );
  sama(medanDari(kini, "customer_name").props.error, "Nama penerima wajib diisi.", "galat Field name salah");
  sama(cari(kini, berid("customer_name")).props.error, "Nama penerima wajib diisi.", "galat Input name salah");
  sama(medanDari(kini, "note").props.error, null, "catatan opsional tidak boleh dianggap salah");
  const fieldJadi = renderPohon(Field, medanDari(kini, "customer_name").props);
  harus(teksPohon(fieldJadi).includes("Nama penerima wajib diisi."), "pesan galat tidak dirender Field");
  harus(cari(fieldJadi, (el) => el.props?.id === "customer_name-error") !== null, "elemen galat tanpa id customer_name-error");
  const inputJadi = cari(renderPohon(Input, cari(kini, berid("customer_name")).props), (el) => el.type === "input");
  harus(inputJadi.props["aria-invalid"] === "true", "input galat tanpa aria-invalid");
  sama(inputJadi.props["aria-describedby"], "customer_name-error", "input galat tanpa aria-describedby");
  kirimKejadian(cari(kini, berid("customer_name")), "Siti Aminah");
  const sesudah = renderPohon(Checkout, props);
  sama(medanDari(sesudah, "customer_name").props.error, null, "galat kolom tidak dibersihkan setelah diperbaiki");
  harus(noticeKolom(sesudah).length === 2, "notice harus tetap tampil sampai semua kolom benar");
});
uji("A3 pesan klien sama persis dengan pesan server (dibaca dari CheckoutRequest.php)", () => {
  const kasus = [
    [{ customer_name: "ab" }, "customer_name.min", "Nama penerima minimal 3 karakter."],
    [{ customer_name: "x".repeat(101) }, "customer_name.max", "Nama penerima maksimal 100 karakter."],
    [{ customer_phone: "12345" }, "customer_phone.regex", "Nomor WhatsApp tidak valid."],
    [{ customer_phone: "62812" }, "customer_phone.regex", "Nomor WhatsApp tidak valid."],
    [{ customer_email: "bukan-email" }, "customer_email.email", "Email tidak valid."],
    [{ customer_address: "pendek" }, "customer_address.min", "Alamat terlalu singkat. Tulis jalan, nomor, RT/RW."],
    [{ customer_city: "ab" }, "customer_city.min", "Nama kota/kecamatan terlalu singkat."],
    [{ customer_postal_code: "1234" }, "customer_postal_code.digits", "Kode pos harus 5 angka."],
    [{ customer_postal_code: "12345 6" }, "customer_postal_code.digits", "Kode pos harus 5 angka."],
    [{ note: "x".repeat(501) }, "note.max", "Catatan maksimal 500 karakter."]
  ];
  kasus.forEach(([ubah, kunci, harap]) => {
    bersihkanStore();
    bersihkan();
    dicatat.gulir = [];
    dicatat.fokus = [];
    const props2 = propsCheckout();
    const pohon = isiSemua(props2, ubah);
    poskan(cari(pohon, (el) => el.type === "form"));
    const kolom = Object.keys(ubah)[0];
    harus(kendali.kunjungan.length === 0, `${kolom} ${JSON.stringify(ubah[kolom]).slice(0, 20)} tetap dikirim ke server`);
    sama(medanDari(renderPohon(Checkout, props2), kolom).props.error, harap, `pesan ${kunci} tidak sesuai`);
    sama(
      pesanServer[kunci],
      harap,
      `harapan harness tidak lagi sama dengan CheckoutRequest.php untuk ${kunci}`
    );
  });
  bersihkanStore();
  bersihkan();
  const props = propsCheckout();
  poskan(cari(isiSemua(props, { customer_phone: "+6281234567890" }), (el) => el.type === "form"));
  harus(kendali.kunjungan.length === 1, "nilai sah ditolak validasi klien");
  sama(kendali.kunjungan[0].url, "/checkout", "URL kirim salah");
});
uji("A4 kirim sah: URL literal, data form utuh, dan processing mencegah kirim ganda", () => {
  const props = propsCheckout();
  poskan(cari(isiSemua(props), (el) => el.type === "form"));
  const kirim = kendali.kunjungan[kendali.kunjungan.length - 1] ?? null;
  harus(kirim !== null, "formulir sah tidak dikirim");
  harus(kirim.metode === "post", "aksi checkout bukan POST");
  sama(kirim.url, "/checkout", "URL checkout salah");
  sama(kirim.data, ISI_SAH, "data form tidak utuh");
  harus(kirim.opsi.preserveScroll === true, "preserveScroll hilang");
  harus(typeof kirim.opsi.onHttpException === "function", "penangan 429 hilang");
  kirim.opsi.onHttpException({ status: 429 });
  harus(
    teksPohon(renderPohon(Checkout, props)).includes("Terlalu banyak percobaan membuat pesanan"),
    "pesan 429 tidak tampil"
  );
  bersihkanStore();
  bersihkan();
  kendali.berikutnya.processing = true;
  const sebelum = kendali.kunjungan.length;
  poskan(cari(renderPohon(Checkout, propsCheckout()), (el) => el.type === "form"));
  sama(kendali.kunjungan.length, sebelum, "kirim ganda saat processing tidak dicegah");
});
uji("B1 galat dari server: notice sama + gulir ke kolom pertama tanpa merebut fokus", () => {
  const props = propsCheckout();
  renderPohon(Checkout, props);
  kendali.formulir[0].errors = {
    customer_email: "Email tidak valid.",
    customer_postal_code: "Kode pos harus 5 angka."
  };
  const pohon = renderPohon(Checkout, props);
  const notice = noticeKolom(pohon);
  harus(notice.length === 2, `notice galat server tidak tampil dua kali (dapat ${notice.length})`);
  sama(notice[0].props.title, "Ada 2 kolom yang perlu diperbaiki", "jumlah kolom bermasalah dari server salah");
  harus(
    teksPohon(notice[0]).includes("Kolom pertama Email: Email tidak valid."),
    "notice galat server tidak menyebut kolom pertama"
  );
  sama(dicatat.gulir, [{ id: "customer_email", opsi: { behavior: "smooth", block: "center" } }], "gulir kolom pertama salah");
  sama(dicatat.fokus, [], "fokus tidak boleh direbut saat jawaban server datang");
  sama(medanDari(pohon, "customer_email").props.error, "Email tidak valid.", "galat server tidak sampai ke Field");
});
uji('B2 tombol "Perbaiki kolom": scrollIntoView + focus kolom pertama, hormat prefers-reduced-motion', () => {
  const props = propsCheckout();
  poskan(cari(renderPohon(Checkout, props), (el) => el.type === "form"));
  const pohon = renderPohon(Checkout, props);
  const tombol = tombolPerbaiki(pohon);
  harus(tombol.length === 2, `tombol Perbaiki kolom tidak ada di kedua notice (dapat ${tombol.length})`);
  klik(tombol[0]);
  sama(dicatat.gulir, [{ id: "customer_name", opsi: { behavior: "smooth", block: "center" } }], "gulir kolom pertama salah");
  sama(dicatat.fokus, [{ id: "customer_name", opsi: { preventScroll: true } }], "fokus kolom pertama salah");
  dicatat.gulir = [];
  dicatat.fokus = [];
  klik(tombol[1]);
  sama(dicatat.gulir.map((g) => g.id), ["customer_name"], "tombol dekat CTA menuju kolom lain");
  sama(dicatat.fokus.map((f) => f.id), ["customer_name"], "tombol dekat CTA memfokuskan kolom lain");
  dicatat.gulir = [];
  gerakDikurangi = true;
  klik(tombol[0]);
  sama(dicatat.gulir, [{ id: "customer_name", opsi: { behavior: "instant", block: "center" } }], "prefers-reduced-motion diabaikan");
});
uji("B3 galat kolom kedua kali (setelah semua lengkap) menggulir ke kolom yang benar", () => {
  const props = propsCheckout();
  const pohon = isiSemua(props, { customer_postal_code: "5111" });
  poskan(cari(pohon, (el) => el.type === "form"));
  harus(kendali.kunjungan.length === 0, "kode pos 4 angka tetap dikirim ke server");
  const kini = renderPohon(Checkout, props);
  sama(noticeKolom(kini)[0].props.title, "Ada 1 kolom yang perlu diperbaiki", "hitungan kolom bermasalah salah");
  harus(
    teksPohon(noticeKolom(kini)[0]).includes("Kolom Kode Pos: Kode pos harus 5 angka."),
    "kolom pertama bukan Kode Pos"
  );
  klik(tombolPerbaiki(kini)[0]);
  sama(dicatat.fokus.map((f) => f.id), ["customer_postal_code"], "fokus bukan pada kolom kode pos");
});
uji("B4 order tidak dobel saat error-payment (design \xA75.7): pesan flash server tetap tampil", () => {
  const props = propsCheckout({ flash: { error: "Gagal membuat pembayaran QRIS. Coba lagi." } });
  const pohon = renderPohon(Checkout, props);
  harus(
    teksPohon(pohon).includes("Gagal membuat pembayaran QRIS. Coba lagi."),
    "pesan galat pembayaran dari server tidak ditampilkan"
  );
  harus(noticeKolom(pohon).length === 0, "notice kolom bermasalah muncul tanpa galat kolom");
  const ringkasan = cari(pohon, bernama("OrderSummary"));
  harus(ringkasan.props.formId === "checkout-form", "CTA berubah target setelah galat pembayaran");
});
console.log("=== UJI INTERAKSI kartu t_a98f17d4 (/checkout) ===");
hasil.forEach((item) => {
  console.log(`${item.lulus ? "[OK]  " : "[GAGAL]"} ${item.nama}${item.lulus ? "" : ` -> ${item.pesan}`}`);
});
var gagal = hasil.filter((item) => !item.lulus).length;
console.log(`
TOTAL: ${hasil.length} uji, ${gagal} gagal`);
console.log(`Cek 1: pesan server terbaca ${Object.keys(pesanServer).length} kunci dari CheckoutRequest.php`);
process.exitCode = gagal === 0 ? 0 : 1;
