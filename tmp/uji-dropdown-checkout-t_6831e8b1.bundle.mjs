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
  const copyrightText = formatCopyright(copyright, year, storeName);
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
    /* @__PURE__ */ jsx("div", { className: "mt-10 border-t border-white/15 pt-6", children: /* @__PURE__ */ jsx("p", { className: "text-meta text-white/60", children: copyrightText }) })
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const menuButtonRef = useRef(null);
  const skipFocusOpen = useRef(false);
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
  useEffect(() => {
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
  return /* @__PURE__ */ jsx(
    "header",
    {
      className: cn(
        "sticky top-0 z-header border-b bg-white",
        scrolled ? "border-line backdrop-blur-sm" : "border-transparent"
      ),
      children: /* @__PURE__ */ jsxs("div", { className: "container flex h-headerMobile items-center justify-between gap-4 md:h-header", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 md:hidden", children: /* @__PURE__ */ jsx(IconButton, { label: "Buka menu", onClick: onOpenDrawer, className: "-ml-2", children: /* @__PURE__ */ jsx(MenuIcon, { size: 20 }) }) }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/",
            title: storeName,
            "aria-label": `${storeName} \u2014 beranda`,
            className: "flex min-w-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 md:mr-6",
            children: [
              logoUrl && !logoFailed && /* @__PURE__ */ jsx(
                "img",
                {
                  src: logoUrl,
                  alt: "",
                  className: "h-8 w-auto shrink-0",
                  loading: "eager",
                  onError: () => setLogoFailed(true)
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "max-w-[42vw] truncate font-display text-h2 uppercase tracking-[0.02em] text-brand md:max-w-[24rem]", children: storeName })
            ]
          }
        ),
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
          user ? /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative hidden md:block",
              onMouseEnter: () => setMenuOpen(true),
              onMouseLeave: () => setMenuOpen(false),
              onBlur: (event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
              },
              onKeyDown: onMenuKeyDown,
              children: [
                /* @__PURE__ */ jsx(
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
                    className: "inline-flex h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                    children: /* @__PURE__ */ jsx(UserIcon, { size: 20 })
                  }
                ),
                menuOpen && /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-full pt-2", children: /* @__PURE__ */ jsxs(
                  "div",
                  {
                    id: "menu-profil",
                    className: "w-60 rounded-xl border border-line bg-white p-2 shadow-raised",
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "border-b border-line px-3 pb-3 pt-2", children: [
                        /* @__PURE__ */ jsx("p", { className: "truncate text-label font-semibold text-ink", children: displayName }),
                        displayEmail && /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-meta text-slate-500", children: displayEmail })
                      ] }),
                      /* @__PURE__ */ jsx(Link, { href: "/history", onClick: tutupMenu, className: cn(itemMenu, "mt-2 text-ink"), children: "Riwayat pesanan" }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: keluar,
                          disabled: loggingOut,
                          "aria-busy": loggingOut || void 0,
                          className: cn(itemMenu, "text-brand disabled:cursor-not-allowed disabled:opacity-45"),
                          children: loggingOut ? "Memproses\u2026" : "Keluar"
                        }
                      )
                    ]
                  }
                ) })
              ]
            }
          ) : /* @__PURE__ */ jsxs(Fragment2, { children: [
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
function PublicLayout({ settings: settingsProp = null, cartCount = null, user = null, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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
        footer: currentUser ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-meta text-ink-soft", children: `Masuk sebagai ${currentUser.name ?? currentUser.email ?? "Akun"}` }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/history",
              onClick: () => setDrawerOpen(false),
              className: "btn-secondary w-full justify-center",
              children: "Riwayat pesanan"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: keluar,
              disabled: loggingOut,
              "aria-busy": loggingOut || void 0,
              className: "btn-ghost w-full justify-center disabled:cursor-not-allowed disabled:opacity-45",
              children: loggingOut ? "Memproses\u2026" : "Keluar"
            }
          )
        ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
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
        storeName,
        copyright: settings.footer_copyright ?? null
      }
    )
  ] });
}

// resources/js/Components/Badge.jsx
var CLASSES = {
  brand: "bg-brand/10 text-brand",
  accent: "bg-accent-500 text-ink",
  sale: "bg-sale-500 text-white",
  success: "bg-success/10 text-success-strong",
  warning: "bg-warning/10 text-warning-strong",
  danger: "bg-danger/10 text-danger-strong"
};
function Badge({ tone = "brand", children, className = "" }) {
  return /* @__PURE__ */ jsx(
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
  const content = loading ? /* @__PURE__ */ jsxs(Fragment2, { children: [
    /* @__PURE__ */ jsx(SpinnerIcon, { size: 16 }),
    /* @__PURE__ */ jsx("span", { children: loadingLabel })
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
  items = null,
  subtotal = null,
  shipping = null,
  total = null,
  shippingText = null,
  shippingBadge = null,
  totalLabel = "Total",
  helper = null,
  ctaLabel = null,
  ctaHref = null,
  onSubmit = null,
  formId = null,
  loading = false,
  disabled = false,
  note = null,
  className = "",
  children = null
}) {
  const row = "flex items-baseline justify-between gap-4";
  const teksOngkir = typeof shippingText === "string" && shippingText.trim() !== "" ? shippingText : null;
  const daftarItem = Array.isArray(items) ? items : [];
  return /* @__PURE__ */ jsxs("section", { className: cn("card p-6", className), "aria-label": "Ringkasan pesanan", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-h3 text-ink", children: "Ringkasan Pesanan" }),
    daftarItem.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-4 flex flex-col gap-3 border-b border-line pb-4", children: daftarItem.map((item, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface", children: item?.image ? /* @__PURE__ */ jsx("img", { src: item.image, alt: "", className: "h-full w-full object-cover", loading: "lazy" }) : null }),
      /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("span", { className: "block text-body text-ink", children: item?.name ?? "-" }),
        item?.variant_label ? /* @__PURE__ */ jsx("span", { className: "block text-meta text-slate-500", children: item.variant_label }) : null,
        /* @__PURE__ */ jsxs("span", { className: "block text-meta text-slate-500", children: [
          /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatNumber(item?.qty ?? 0) ?? "-" }),
          " \xD7",
          " ",
          /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: rupiah(item?.unit_price) ?? "-" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "shrink-0 whitespace-nowrap text-body font-semibold text-ink tabular-nums", children: rupiah(item?.line_total) ?? "-" })
    ] }, item?.id ?? index)) }),
    /* @__PURE__ */ jsxs("dl", { className: cn("flex flex-col gap-3", daftarItem.length > 0 ? "mt-4" : "mt-4"), children: [
      /* @__PURE__ */ jsxs("div", { className: row, children: [
        /* @__PURE__ */ jsx("dt", { className: "text-body text-ink-soft", children: "Subtotal" }),
        /* @__PURE__ */ jsx("dd", { className: "text-body text-ink tabular-nums", children: rupiah(subtotal) ?? "-" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: row, children: [
        /* @__PURE__ */ jsx("dt", { className: "text-body text-ink-soft", children: "Ongkir" }),
        /* @__PURE__ */ jsxs("dd", { className: "flex items-baseline justify-end gap-2 text-body text-ink", children: [
          /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap tabular-nums", "aria-live": "polite", children: teksOngkir ?? rupiah(shipping) ?? "-" }),
          shippingBadge
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: cn(row, "mt-1 border-t border-line pt-4"), children: [
        /* @__PURE__ */ jsx("dt", { className: "text-body font-bold text-ink", children: totalLabel }),
        /* @__PURE__ */ jsx("dd", { className: "whitespace-nowrap text-h3 font-bold text-ink tabular-nums", "aria-live": "polite", children: rupiah(total) ?? "-" })
      ] })
    ] }),
    helper && /* @__PURE__ */ jsx("p", { className: "mt-2 text-meta tabular-nums text-slate-500", children: helper }),
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

// resources/js/Components/Select.jsx
var BASE2 = "w-full h-field appearance-none rounded-md border border-line bg-white pl-3.5 pr-10 text-body text-ink transition-colors duration-hover focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Select({ error = null, className = "", id = null, children, ...rest }) {
  return /* @__PURE__ */ jsxs("span", { className: "relative block", children: [
    /* @__PURE__ */ jsx(
      "select",
      {
        id,
        "aria-invalid": error ? "true" : void 0,
        "aria-describedby": error && id ? id + "-error" : void 0,
        className: cn(BASE2, error ? "border-danger" : null, className),
        ...rest,
        children
      }
    ),
    /* @__PURE__ */ jsx(
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
        children: /* @__PURE__ */ jsx("path", { d: "M6 9l6 6 6-6" })
      }
    )
  ] });
}

// resources/js/Components/Textarea.jsx
var BASE3 = "w-full min-h-[120px] resize-y rounded-md border border-line bg-white px-3.5 py-3 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Textarea({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx(
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

// resources/js/Pages/Public/Checkout.jsx
var PHONE_PATTERN = /^(\+62|62|0)8[0-9]{7,12}$/;
var POSTAL_PATTERN = /^\d{5}$/;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var TARIF_DEBOUNCE_MS = 600;
var TARIF_TIMEOUT_MS = 1e4;
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
function gulirKe(id, { fokus = true } = {}) {
  if (!id || typeof document === "undefined") return;
  const elemen = document.getElementById(id);
  if (!elemen) return;
  const gerakDikurangi = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  if (typeof elemen.scrollIntoView === "function") {
    elemen.scrollIntoView({ behavior: gerakDikurangi ? "instant" : "smooth", block: "center" });
  }
  if (fokus && typeof elemen.focus === "function") elemen.focus({ preventScroll: true });
}
function SkeletonOpsi() {
  return /* @__PURE__ */ jsxs("div", { "aria-busy": "true", "aria-live": "polite", className: "mt-4 flex flex-col gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "text-meta text-slate-500", children: "Memuat tarif\u2026" }),
    [0, 1].map((baris) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-md border border-line p-4 motion-safe:animate-pulse", children: [
      /* @__PURE__ */ jsx("span", { className: "mt-1 h-4 w-4 shrink-0 rounded-full bg-line", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "h-3 w-2/5 rounded bg-line", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("span", { className: "h-3 w-3/5 rounded bg-line", "aria-hidden": "true" })
      ] })
    ] }, baris))
  ] });
}
function Checkout({ keranjang: keranjang2 = null, prefill = null, pengiriman = null, flash = null }) {
  const [clientErrors, setClientErrors] = useState({});
  const [throttle, setThrottle] = useState(null);
  const form = useForm({
    customer_name: prefill?.customer_name ?? "",
    customer_phone: prefill?.customer_phone ?? "",
    customer_email: prefill?.customer_email ?? "",
    customer_address: prefill?.customer_address ?? "",
    customer_city: prefill?.customer_city ?? "",
    customer_postal_code: prefill?.customer_postal_code ?? "",
    note: prefill?.note ?? "",
    shipping_courier: null,
    shipping_service: null,
    shipping_cost: null
  });
  const [opsi, setOpsi] = useState([]);
  const [gratis, setGratis] = useState(pengiriman?.gratis ?? null);
  const [pilihan, setPilihan] = useState(null);
  const [statusTarif, setStatusTarif] = useState("menunggu");
  const [galatTarif, setGalatTarif] = useState(null);
  const [kodePosOpsi, setKodePosOpsi] = useState(null);
  const [versiTarif, setVersiTarif] = useState(0);
  const abortRef = useRef(null);
  const cacheRef = useRef(/* @__PURE__ */ new Map());
  const items = Array.isArray(keranjang2?.items) ? keranjang2.items : [];
  const isEmpty = keranjang2?.is_empty === true || items.length === 0;
  const subtotal = Number(keranjang2?.subtotal ?? 0) || 0;
  const modeFake = pengiriman?.mode === "fake";
  const galatKonfig = pengiriman?.galat ?? null;
  const asal = pengiriman?.asal ?? null;
  const beratGram = Number(pengiriman?.berat_gram ?? 0) || 0;
  const tarifUji = Number(pengiriman?.tarif_uji ?? 0) || 0;
  const gratisAktif = gratis?.aktif === true;
  const gratisTerpenuhi = gratis?.terpenuhi === true;
  const gratisMin = Number(gratis?.min ?? 0) || 0;
  const postal = String(form.data.customer_postal_code ?? "");
  const alamat = String(form.data.customer_address ?? "");
  const postalValid = POSTAL_PATTERN.test(postal);
  const tarifSiap = postalValid && alamat.trim().length >= 10;
  const biayaOngkir = pilihan ? pilihan.gratis === true ? 0 : Number(pilihan.cost ?? 0) || 0 : modeFake && statusTarif === "siap" ? tarifUji : null;
  const ongkirFinal = biayaOngkir !== null;
  const total = subtotal + (biayaOngkir ?? 0);
  const tarifMemblokir = ["memuat", "kosong", "galat", "timeout"].includes(statusTarif);
  const siapKirim = !isEmpty && !galatKonfig && !tarifMemblokir && (Boolean(pilihan) || modeFake);
  const fieldError = (key) => clientErrors[key] ?? form.errors?.[key] ?? null;
  const kolomBermasalah = URUTAN_KOLOM.filter((key) => Boolean(fieldError(key)));
  const kolomPertama = kolomBermasalah[0] ?? null;
  const jumlahBermasalah = kolomBermasalah.length;
  const kunciGalatServer = URUTAN_KOLOM.filter((key) => Boolean(form.errors?.[key])).join(",");
  useEffect(() => {
    if (kunciGalatServer === "") return;
    gulirKe(kunciGalatServer.split(",")[0], { fokus: false });
  }, [kunciGalatServer]);
  useEffect(() => {
    if (String(prefill?.customer_address ?? "").trim().length >= 10) return void 0;
    const timer = window.setTimeout(() => document.getElementById("customer_address")?.focus?.(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (typeof flash?.error !== "string" || !flash.error.includes("Ongkir berubah")) return;
    setPilihan(null);
    form.setData((data) => ({ ...data, shipping_courier: null, shipping_service: null, shipping_cost: null }));
    cacheRef.current.delete(String(form.data.customer_postal_code ?? ""));
    setVersiTarif((nilai) => nilai + 1);
  }, [flash?.error]);
  const update = (key, value) => {
    form.setData(key, value);
    if (clientErrors[key]) setClientErrors((prev) => ({ ...prev, [key]: void 0 }));
  };
  const kosongkanKurir = () => {
    form.setData((nilai) => ({
      ...nilai,
      shipping_courier: null,
      shipping_service: null,
      shipping_cost: null
    }));
  };
  const updateKodePos = (value) => {
    update("customer_postal_code", value);
    if (value !== postal) {
      setOpsi([]);
      setPilihan(null);
      setKodePosOpsi(null);
      setGalatTarif(null);
      setStatusTarif("menunggu");
      kosongkanKurir();
    }
  };
  useEffect(() => {
    let debounce = null;
    let controller = null;
    let batas = null;
    let lewat = false;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;
    if (galatKonfig) {
      setStatusTarif("menunggu");
      return void 0;
    }
    if (!tarifSiap) {
      setOpsi([]);
      setPilihan(null);
      setKodePosOpsi(null);
      setGalatTarif(null);
      setStatusTarif("menunggu");
      kosongkanKurir();
      return void 0;
    }
    const tersimpan = cacheRef.current.get(postal);
    if (tersimpan) {
      setOpsi(tersimpan.opsi);
      setGratis(tersimpan.gratis ?? null);
      setKodePosOpsi(postal);
      setGalatTarif(null);
      setStatusTarif(tersimpan.opsi.length > 0 ? "siap" : "kosong");
      return void 0;
    }
    const mulai = () => {
      controller = new AbortController();
      abortRef.current = controller;
      setStatusTarif("memuat");
      setGalatTarif(null);
      batas = window.setTimeout(() => {
        lewat = true;
        controller.abort();
      }, TARIF_TIMEOUT_MS);
      fetch(`/checkout/ongkir?postal_code=${encodeURIComponent(postal)}`, {
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "same-origin",
        signal: controller.signal
      }).then(async (response) => {
        if (abortRef.current !== controller) return;
        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }
        if (abortRef.current !== controller) return;
        if (!data || typeof data !== "object") {
          setOpsi([]);
          setPilihan(null);
          setKodePosOpsi(null);
          setGalatTarif(null);
          setStatusTarif("galat");
          kosongkanKurir();
          return;
        }
        if (!response.ok) {
          const pesan = data?.errors?.postal_code?.[0] ?? data?.errors?.customer_postal_code?.[0] ?? data?.message ?? null;
          setOpsi([]);
          setPilihan(null);
          setKodePosOpsi(null);
          setGalatTarif(pesan);
          setStatusTarif("galat");
          kosongkanKurir();
          return;
        }
        const daftar = Array.isArray(data?.opsi) ? data.opsi : [];
        const pesanGalat = typeof data?.galat === "string" && data.galat.trim() !== "" ? data.galat : null;
        setOpsi(daftar);
        setKodePosOpsi(postal);
        setPilihan(null);
        setGratis(data?.gratis ?? null);
        if (pesanGalat) {
          setGalatTarif(pesanGalat);
          setStatusTarif("galat");
          kosongkanKurir();
          return;
        }
        cacheRef.current.set(postal, { opsi: daftar, gratis: data?.gratis ?? null });
        setGalatTarif(null);
        setStatusTarif(daftar.length > 0 ? "siap" : "kosong");
        kosongkanKurir();
      }).catch((error) => {
        if (abortRef.current !== controller) return;
        if (error?.name === "AbortError") {
          if (lewat) {
            setGalatTarif(null);
            setStatusTarif("timeout");
          }
          return;
        }
        setOpsi([]);
        setPilihan(null);
        setKodePosOpsi(null);
        setGalatTarif(null);
        setStatusTarif("galat");
        kosongkanKurir();
      }).finally(() => {
        if (batas) window.clearTimeout(batas);
        if (abortRef.current === controller) abortRef.current = null;
      });
    };
    debounce = window.setTimeout(mulai, TARIF_DEBOUNCE_MS);
    return () => {
      if (debounce) window.clearTimeout(debounce);
      if (batas) window.clearTimeout(batas);
      if (controller) controller.abort();
      if (abortRef.current === controller) abortRef.current = null;
    };
  }, [postal, tarifSiap, galatKonfig, versiTarif]);
  const cobaLagiTarif = () => setVersiTarif((nilai) => nilai + 1);
  const pilihOpsi = (opsiDipilih) => {
    setPilihan(opsiDipilih);
    form.setData((nilai) => ({
      ...nilai,
      shipping_courier: opsiDipilih?.courier_code ?? null,
      shipping_service: opsiDipilih?.service_code ?? null,
      shipping_cost: opsiDipilih ? opsiDipilih.gratis === true ? 0 : Number(opsiDipilih.cost ?? 0) || 0 : null
    }));
  };
  const nilaiOpsi = pilihan ? `${pilihan.courier_code}|${pilihan.service_code}` : "";
  const cariOpsi = (nilai) => {
    const [kodeKurir, kodeLayanan] = String(nilai ?? "").split("|");
    return opsi.find((item) => item?.courier_code === kodeKurir && item?.service_code === kodeLayanan) ?? null;
  };
  const teksOpsi = (item) => {
    const layanan = item?.service_name || item?.service_code || "-";
    const harga = item?.gratis === true ? "GRATIS" : rupiah(item?.cost) ?? "-";
    return `${layanan} \xB7 ${item?.etd || "\u2014"} \xB7 ${harga}`;
  };
  const grup = [];
  opsi.forEach((item) => {
    const kode = item?.courier_code ?? "-";
    let kelompok = grup.find((pasangan) => pasangan[0] === kode);
    if (!kelompok) {
      kelompok = [kode, { courier_name: item?.courier_name || kode, opsi: [] }];
      grup.push(kelompok);
    }
    kelompok[1].opsi.push(item);
  });
  const submit = (event) => {
    event.preventDefault();
    if (form.processing) return;
    const found = validate(form.data);
    setClientErrors(found);
    if (Object.keys(found).length > 0) {
      gulirKe(URUTAN_KOLOM.find((key) => found[key]) ?? null);
      return;
    }
    if (!siapKirim) {
      gulirKe("judul-pengiriman", { fokus: false });
      if (!pilihan) document.getElementById("pilih-layanan")?.focus?.({ preventScroll: true });
      return;
    }
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
    return /* @__PURE__ */ jsxs(InlineNotice, { tone: "error", className, title: `Ada ${jumlahBermasalah} kolom yang perlu diperbaiki`, children: [
      /* @__PURE__ */ jsx("p", { children: ringkas }),
      /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "mt-3", onClick: () => gulirKe(kolomPertama), children: "Perbaiki kolom" })
    ] });
  };
  const sisaGratis = gratisAktif && !gratisTerpenuhi && gratisMin > subtotal ? gratisMin - subtotal : 0;
  const helperRingkasan = pilihan ? pilihan.gratis === true ? "Gratis ongkir reguler aktif." : gratisTerpenuhi && pilihan.is_regular !== true ? "Layanan ini tidak termasuk gratis ongkir." : sisaGratis > 0 ? `Tambah ${rupiah(sisaGratis) ?? "-"} lagi untuk gratis ongkir reguler.` : null : null;
  const alasanTolak = !isEmpty && !modeFake && statusTarif === "siap" && !pilihan ? "Pilih layanan pengiriman dulu." : null;
  const ringkasan = (className, { tanpaCta = false } = {}) => /* @__PURE__ */ jsx(
    OrderSummary,
    {
      className,
      items,
      subtotal: keranjang2?.subtotal ?? null,
      shipping: biayaOngkir,
      shippingText: pilihan?.gratis === true ? "GRATIS" : ongkirFinal ? null : "\u2014",
      shippingBadge: ongkirFinal && modeFake ? /* @__PURE__ */ jsx(Badge, { tone: "warning", children: "Tarif uji" }) : null,
      total,
      helper: helperRingkasan,
      ctaLabel: tanpaCta ? null : form.processing ? "Membuat pesanan\u2026" : "Buat pesanan",
      formId: "checkout-form",
      onSubmit: submit,
      loading: form.processing,
      disabled: form.processing || isEmpty || !siapKirim,
      note: tanpaCta ? null : alasanTolak ?? "Pembayaran dipilih di langkah berikutnya.",
      children: noticeValidasi("mt-4")
    }
  );
  return /* @__PURE__ */ jsxs(PublicLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Checkout" }),
    /* @__PURE__ */ jsxs("div", { className: "container py-4", children: [
      /* @__PURE__ */ jsx(
        Breadcrumb,
        {
          items: [{ label: "Beranda", href: "/" }, { label: "Keranjang", href: "/keranjang" }, { label: "Checkout" }]
        }
      ),
      /* @__PURE__ */ jsxs("header", { className: "mt-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-h1 text-ink", children: "Checkout" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-body text-ink-soft", children: "Lengkapi data penerima, pilih pengiriman, lalu buat pesanan." })
      ] }),
      isEmpty && /* @__PURE__ */ jsx(InlineNotice, { tone: "warning", className: "mt-4", children: /* @__PURE__ */ jsxs("p", { children: [
        "Keranjang masih kosong.",
        " ",
        /* @__PURE__ */ jsx(Link, { href: "/keranjang", className: "underline underline-offset-4", children: "Kembali ke keranjang" }),
        " ",
        "untuk menambah produk."
      ] }) }),
      flash?.error && /* @__PURE__ */ jsx(InlineNotice, { tone: "error", className: "mt-4", children: /* @__PURE__ */ jsx("p", { children: flash.error }) }),
      throttle && /* @__PURE__ */ jsx(InlineNotice, { tone: "error", className: "mt-4", children: /* @__PURE__ */ jsx("p", { children: throttle }) }),
      noticeValidasi("mt-4"),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10", children: [
        /* @__PURE__ */ jsxs("form", { id: "checkout-form", className: "min-w-0 lg:col-span-7", onSubmit: submit, noValidate: true, children: [
          /* @__PURE__ */ jsxs("section", { className: "card p-6", "aria-labelledby": "judul-penerima", children: [
            /* @__PURE__ */ jsx("h2", { id: "judul-penerima", className: "text-h3 text-ink", children: "Kontak & Penerima" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-4", children: [
              /* @__PURE__ */ jsx(Field, { label: "Nama Penerima", htmlFor: "customer_name", required: true, error: fieldError("customer_name"), children: /* @__PURE__ */ jsx(
                Input,
                {
                  id: "customer_name",
                  name: "customer_name",
                  autoComplete: "name",
                  required: true,
                  maxLength: 100,
                  value: form.data.customer_name,
                  error: fieldError("customer_name"),
                  onChange: (event) => update("customer_name", event.target.value)
                }
              ) }),
              /* @__PURE__ */ jsx(
                Field,
                {
                  label: "Nomor WhatsApp",
                  htmlFor: "customer_phone",
                  required: true,
                  error: fieldError("customer_phone"),
                  hint: "Format 08\u2026, 62\u2026, atau +62\u2026",
                  children: /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "customer_phone",
                      name: "customer_phone",
                      type: "tel",
                      inputMode: "tel",
                      autoComplete: "tel",
                      placeholder: "08xxxxxxxxxx",
                      maxLength: 20,
                      required: true,
                      value: form.data.customer_phone,
                      error: fieldError("customer_phone"),
                      onChange: (event) => update("customer_phone", event.target.value)
                    }
                  )
                }
              ),
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
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-meta text-slate-500", children: "Diisi dari alamat akun. Perubahan hanya berlaku untuk pesanan ini." }),
            String(prefill?.customer_address ?? "").trim().length < 10 && String(form.data.customer_address ?? "").trim().length < 10 && /* @__PURE__ */ jsx(
              InlineNotice,
              {
                tone: "warning",
                className: "mt-4",
                title: "Lengkapi alamat pengiriman untuk menghitung ongkir."
              }
            ),
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
                    onChange: (event) => updateKodePos(event.target.value.replace(/[^0-9]/g, ""))
                  }
                ) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "card mt-6 p-6", "aria-labelledby": "judul-pengiriman", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsx("h2", { id: "judul-pengiriman", className: "text-h3 text-ink", children: "Pengiriman" }),
              modeFake ? /* @__PURE__ */ jsx(Badge, { tone: "warning", children: "Tarif uji" }) : /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Tarif Biteship" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2 text-meta text-slate-500", children: [
              asal?.nama ? `Dikirim dari ${asal.nama}${asal.kode_pos ? ` (${asal.kode_pos})` : ""}.` : "Asal pengiriman belum diatur penjual.",
              beratGram > 0 ? ` Berat ${formatNumber(beratGram)} g.` : ""
            ] }),
            galatKonfig && /* @__PURE__ */ jsxs(InlineNotice, { tone: "error", className: "mt-4", title: "Pengiriman belum siap", children: [
              /* @__PURE__ */ jsx("p", { children: galatKonfig }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1", children: [
                /* @__PURE__ */ jsx(Link, { href: "/kontak-kami", className: "underline underline-offset-4", children: "Hubungi penjual" }),
                " ",
                "untuk menyelesaikan pesanan."
              ] })
            ] }),
            !galatKonfig && statusTarif === "menunggu" && /* @__PURE__ */ jsx("p", { className: "mt-4 text-body text-ink-soft", children: "Tarif muncul otomatis setelah alamat dan kode pos terisi." }),
            !galatKonfig && statusTarif === "memuat" && /* @__PURE__ */ jsx(SkeletonOpsi, {}),
            !galatKonfig && statusTarif === "galat" && /* @__PURE__ */ jsxs(InlineNotice, { tone: "error", className: "mt-4", title: "Tarif gagal dimuat.", children: [
              galatTarif ? /* @__PURE__ */ jsx("p", { children: galatTarif }) : null,
              /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "mt-3", onClick: cobaLagiTarif, children: "Coba lagi" })
            ] }),
            !galatKonfig && statusTarif === "timeout" && /* @__PURE__ */ jsx(InlineNotice, { tone: "warning", className: "mt-4", title: "Tarif lama dimuat. Coba lagi.", children: /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "mt-3", onClick: cobaLagiTarif, children: "Coba lagi" }) }),
            !galatKonfig && statusTarif === "kosong" && /* @__PURE__ */ jsxs("p", { className: "mt-4 text-body text-ink-soft", children: [
              "Belum ada layanan aktif untuk kode pos ini.",
              " ",
              /* @__PURE__ */ jsx(Link, { href: "/kontak-kami", className: "underline underline-offset-4", children: "Hubungi penjual." })
            ] }),
            !galatKonfig && statusTarif === "siap" && opsi.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsx(
                Field,
                {
                  label: "Pilih layanan pengiriman",
                  htmlFor: "pilih-layanan",
                  hint: `Tarif untuk kode pos ${kodePosOpsi ?? "-"}`,
                  children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      id: "pilih-layanan",
                      "aria-describedby": "pilih-layanan-hint",
                      value: nilaiOpsi,
                      onChange: (event) => pilihOpsi(cariOpsi(event.target.value)),
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Pilih layanan pengiriman" }),
                        grup.map(([kode, kelompok]) => /* @__PURE__ */ jsx("optgroup", { label: kelompok.courier_name, children: kelompok.opsi.map((item) => {
                          const nilai = `${item?.courier_code}|${item?.service_code}`;
                          return /* @__PURE__ */ jsx("option", { value: nilai, children: teksOpsi(item) }, nilai);
                        }) }, kode))
                      ]
                    }
                  )
                }
              ),
              pilihan && /* @__PURE__ */ jsxs("div", { className: "mt-3", role: "status", "aria-live": "polite", children: [
                /* @__PURE__ */ jsx("p", { className: "text-body font-semibold text-ink", children: `${pilihan.courier_name ?? pilihan.courier_code ?? "-"} ${pilihan.service_name ?? pilihan.service_code ?? "-"} \xB7 ${pilihan.etd ?? "\u2014"}` }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1 flex flex-wrap items-center gap-2 text-body", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: pilihan.gratis ? "font-semibold tabular-nums text-success-strong" : "font-semibold tabular-nums text-ink",
                      children: pilihan.gratis ? "GRATIS" : rupiah(pilihan.cost) ?? "-"
                    }
                  ),
                  pilihan.is_regular === true && /* @__PURE__ */ jsx(Badge, { tone: "brand", children: "Reguler" }),
                  pilihan.gratis === true && /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Gratis Ongkir" })
                ] }),
                gratisTerpenuhi && pilihan.is_regular !== true && /* @__PURE__ */ jsx("p", { className: "mt-1 text-meta text-slate-500", children: "Layanan ini tidak termasuk gratis ongkir." })
              ] }),
              gratisAktif && gratisTerpenuhi && /* @__PURE__ */ jsx("p", { className: "mt-3 text-meta text-success-strong", children: "Gratis ongkir reguler aktif." }),
              sisaGratis > 0 && pilihan && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-meta tabular-nums text-slate-500", children: [
                "Tambah ",
                rupiah(sisaGratis) ?? "-",
                " lagi untuk gratis ongkir reguler."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 lg:hidden", children: ringkasan(null, { tanpaCta: true }) }),
          /* @__PURE__ */ jsxs("section", { className: "card mt-6 p-6", "aria-labelledby": "judul-catatan", children: [
            /* @__PURE__ */ jsx("h2", { id: "judul-catatan", className: "text-h3 text-ink", children: "Catatan (opsional)" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsx(
                Field,
                {
                  label: "Catatan",
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
              ),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-right text-meta text-slate-500", "aria-live": "polite", children: [
                String(form.data.note ?? "").length,
                "/500"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 lg:hidden", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                form: "checkout-form",
                fullWidth: true,
                loading: form.processing,
                disabled: form.processing || isEmpty || !siapKirim,
                children: "Buat pesanan"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-meta text-slate-500", children: alasanTolak ?? "Pembayaran dipilih di langkah berikutnya." })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hidden lg:col-span-5 lg:block", children: ringkasan("lg:sticky lg:top-[88px]") })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-4 text-meta text-slate-500", children: [
        "Pembayaran aman lewat Midtrans.",
        asal?.nama ? ` Dikirim dari ${asal.nama}.` : ""
      ] })
    ] })
  ] });
}

// tmp/uji-dropdown-checkout-t_6831e8b1.mjs
var dicatat = { gulir: [], fokus: [] };
var elemenAda = /* @__PURE__ */ new Map();
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
};
["customer_name", "customer_address", "customer_postal_code", "judul-pengiriman", "pilih-layanan"].forEach(daftarkanElemen);
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
  matchMedia: () => ({ matches: false, addEventListener() {
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
  body: { style: {}, classList: banyakKelas(), appendChild() {
  }, removeChild() {
  }, addEventListener() {
  }, removeEventListener() {
  }, contains: () => false },
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
var OPSI = [
  { courier_code: "jne", courier_name: "JNE", service_code: "reg", service_name: "REG", label: "JNE REG", etd: "2-3 hari", cost: 18e3, is_regular: true, gratis: false },
  { courier_code: "sicepat", courier_name: "SiCepat", service_code: "best", service_name: "BEST", label: "SiCepat BEST", etd: null, cost: 25e3, is_regular: false, gratis: false },
  { courier_code: "jne", courier_name: "JNE", service_code: "yes", service_name: "YES", label: "JNE YES", etd: "1-1 hari", cost: 2e4, is_regular: true, gratis: true }
];
var jawabTarif = { ok: true, body: { opsi: OPSI, gratis: { aktif: true, min: 3e5, terpenuhi: true }, galat: null } };
globalThis.fetch = async () => ({ ok: jawabTarif.ok, json: async () => jawabTarif.body });
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
var berid = (id) => (el) => el.props?.id === id;
var bertipe = (tipe) => (el) => el.type === tipe;
var bernama = (nama) => (el) => typeof el.type === "function" && el.type.name === nama;
var patchSetData = () => {
  const bentuk = kendali.formulir[0];
  if (!bentuk || bentuk.__tambal) return;
  bentuk.setData = (kunci, nilai) => {
    if (typeof kunci === "function") Object.assign(bentuk.data, kunci(bentuk.data));
    else if (kunci && typeof kunci === "object") Object.assign(bentuk.data, kunci);
    else bentuk.data[kunci] = nilai;
    return bentuk.data;
  };
  bentuk.__tambal = true;
};
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
var poskan = (el) => el.props.onSubmit?.({ preventDefault() {
} });
var jalankanTimer = (ms) => {
  const antre = jam.antre.filter((t) => t.ms === ms);
  jam.antre = jam.antre.filter((t) => t.ms !== ms);
  antre.forEach((t) => t.fn());
};
var flush = async () => {
  for (let i = 0; i < 8; i += 1) await new Promise((r) => setImmediate(r));
};
var keranjang = () => ({
  items: [{ id: 1, product_id: 7, name: "Daster Kulot Batik", slug: "daster-kulot-batik", variant_label: "L / Hitam", qty: 2, price: 85e3, subtotal: 17e4 }],
  count: 2,
  subtotal: 17e4,
  shipping_cost: 0,
  total: 17e4,
  is_empty: false
});
var propsCheckout = (pengiriman = {}) => ({
  keranjang: keranjang(),
  prefill: null,
  pengiriman: { mode: "api", asal: { nama: "Toko Kulot", kode_pos: "51111" }, berat_gram: 500, gratis: { aktif: true, min: 3e5, terpenuhi: true }, ...pengiriman },
  pembayaran: null,
  flash: null
});
var ISI_SAH = {
  customer_name: "Siti Aminah",
  customer_phone: "081234567890",
  customer_email: "siti@example.com",
  customer_address: "Jl. Melati 12, RT 03 RW 04, Pekalongan",
  customer_city: "Pekalongan",
  customer_postal_code: "51111",
  note: ""
};
var isiKolom = (props) => {
  let pohon = renderPohon(Checkout, props);
  patchSetData();
  Object.entries(ISI_SAH).forEach(([kunci, isi]) => kirimKejadian(cari(pohon, berid(kunci)), isi));
  return renderPohon(Checkout, props);
};
var siapkanTarif = async (props) => {
  let pohon = isiKolom(props);
  jalankanTimer(600);
  await flush();
  return renderPohon(Checkout, props);
};
var selectLayanan = (pohon) => cari(pohon, berid("pilih-layanan"));
var pilih = (pohon, nilai) => {
  kirimKejadian(selectLayanan(pohon), nilai);
  return renderPohon(Checkout, terakhirProps);
};
var terakhirProps = null;
var hasil = [];
var daftarUji = [];
var uji = (nama, fn) => daftarUji.push({ nama, fn });
var harus = (syarat, pesan) => {
  if (!syarat) throw new Error(pesan);
};
var sama = (nyata, harap, pesan) => {
  const a = JSON.stringify(nyata);
  const b = JSON.stringify(harap);
  if (a !== b) throw new Error(`${pesan} (dapat ${a}, harap ${b})`);
};
var teksOpsiDari = (pohon) => cariSemua(pohon, bertipe("option")).map((el) => ({ nilai: el.props.value, teks: teksPohon(el.props.children) }));
uji("D1 keadaan siap: satu Select ber-optgroup, tanpa radio", async () => {
  const props = propsCheckout();
  terakhirProps = props;
  const pohon = await siapkanTarif(props);
  sama(cariSemua(pohon, (el) => el.type === "input" && el.props?.type === "radio").length, 0, "masih ada radio ongkir");
  const selectEl = selectLayanan(pohon);
  harus(selectEl !== null, "Select #pilih-layanan tidak dirender");
  harus(selectEl.props["aria-describedby"] === "pilih-layanan-hint", "Select tanpa aria-describedby pilih-layanan-hint");
  const field = cariSemua(pohon, bernama("Field")).find((el) => el.props.htmlFor === "pilih-layanan");
  harus(Boolean(field), "Field pembungkus #pilih-layanan hilang");
  const fieldPohon = renderPohon(field.type, field.props);
  const hint = cari(fieldPohon, berid("pilih-layanan-hint"));
  harus(hint !== null, "target aria-describedby (hint) tidak ada di DOM");
  harus(teksPohon(hint).includes("Tarif untuk kode pos 51111"), "hint kode pos salah");
  sama(selectEl.props.value, "", "nilai awal Select harus kosong (tanpa auto-pilih)");
  const selectPohon = renderPohon(selectEl.type, selectEl.props);
  sama(cariSemua(selectPohon, bertipe("select")).length, 1, "jumlah Select bukan satu");
  const opsi = teksOpsiDari(selectPohon);
  sama(opsi[0], { nilai: "", teks: "Pilih layanan pengiriman" }, "placeholder salah");
  harus(cari(selectPohon, bertipe("option")).props.disabled === true, "placeholder harus disabled");
  sama(
    opsi.slice(1),
    [
      { nilai: "jne|reg", teks: "REG \xB7 2-3 hari \xB7 Rp18.000" },
      { nilai: "jne|yes", teks: "YES \xB7 1-1 hari \xB7 GRATIS" },
      { nilai: "sicepat|best", teks: "BEST \xB7 \u2014 \xB7 Rp25.000" }
    ],
    "teks/nilai opsi atau urutan server berubah"
  );
  const grup = cariSemua(selectPohon, bertipe("optgroup"));
  sama(grup.map((g) => g.props.label), ["JNE", "SiCepat"], "label optgroup bukan courier_name / urutan kemunculan salah");
});
uji("D2 pilih layanan reguler: tiga field terkirim + ringkasan di bawah kontrol", async () => {
  const props = propsCheckout();
  terakhirProps = props;
  const pohon = await siapkanTarif(props);
  const sesudah = pilih(pohon, "jne|reg");
  sama(selectLayanan(sesudah).props.value, "jne|reg", "nilai Select tidak mengikuti pilihan");
  sama(
    { courier: kendali.formulir[0].data.shipping_courier, service: kendali.formulir[0].data.shipping_service, cost: kendali.formulir[0].data.shipping_cost },
    { courier: "jne", service: "reg", cost: 18e3 },
    "data form tidak membawa tiga field ongkir"
  );
  const teks = teksPohon(sesudah);
  harus(teks.includes("JNE REG \xB7 2-3 hari"), "ringkasan pilihan tidak tampil");
  harus(teks.includes("Rp18.000"), "harga ringkasan tidak tampil");
  harus(!teks.includes("Layanan ini tidak termasuk gratis ongkir."), "catatan gratis salah muncul untuk layanan reguler");
  const status = cariSemua(sesudah, (el) => el.props?.role === "status").filter((el) => teksPohon(el).includes("JNE REG"));
  sama(status.length, 1, "ringkasan tidak berada di region role=status");
  sama(status[0].props["aria-live"], "polite", "region ringkasan bukan aria-live polite");
  const lencana = cariSemua(status[0], bernama("Badge")).map((el) => teksPohon(el.props.children));
  sama(lencana, ["Reguler"], "badge ringkasan harus hanya Reguler untuk layanan reguler");
});
uji("D3 layanan non-reguler saat gratis terpenuhi: catatan khusus", async () => {
  const props = propsCheckout();
  terakhirProps = props;
  const pohon = await siapkanTarif(props);
  const sesudah = pilih(pohon, "sicepat|best");
  const teks = teksPohon(sesudah);
  harus(teks.includes("SiCepat BEST \xB7 \u2014"), "ringkasan layanan tanpa etd salah");
  harus(teks.includes("Rp25.000"), "harga layanan non-reguler salah");
  harus(teks.includes("Layanan ini tidak termasuk gratis ongkir."), "catatan gratis hilang untuk layanan non-reguler");
  const status = cariSemua(sesudah, (el) => el.props?.role === "status").filter((el) => teksPohon(el).includes("SiCepat BEST"));
  sama(status.length, 1, "ringkasan non-reguler tidak berada di region role=status");
  const lencana = cariSemua(status[0], bernama("Badge")).map((el) => teksPohon(el.props.children));
  sama(lencana, [], "badge Reguler muncul untuk layanan non-reguler");
});
uji("D4 layanan gratis: shipping_cost 0 + label GRATIS", async () => {
  const props = propsCheckout();
  terakhirProps = props;
  const pohon = await siapkanTarif(props);
  const sesudah = pilih(pohon, "jne|yes");
  sama(kendali.formulir[0].data.shipping_cost, 0, "layanan gratis tidak mengirim shipping_cost 0");
  sama(kendali.formulir[0].data.shipping_service, "yes", "service_code gratis salah");
  const teks = teksPohon(sesudah);
  harus(teks.includes("GRATIS"), "ringkasan tidak menampilkan GRATIS");
  const status = cariSemua(sesudah, (el) => el.props?.role === "status").filter((el) => teksPohon(el).includes("JNE YES"));
  sama(status.length, 1, "ringkasan gratis tidak berada di region role=status");
  const lencana = cariSemua(status[0], bernama("Badge")).map((el) => teksPohon(el.props.children));
  sama(lencana, ["Reguler", "Gratis Ongkir"], "badge layanan gratis salah");
});
uji("D5 submit ditolak tanpa pilihan (mode api) \u2192 gulir + fokus Select; mode fake tetap lolos", async () => {
  const props = propsCheckout();
  terakhirProps = props;
  const pohon = await siapkanTarif(props);
  poskan(cari(pohon, bertipe("form")));
  sama(kendali.kunjungan.length, 0, "mode api tanpa pilihan tetap dikirim ke server");
  sama(dicatat.gulir, [{ id: "judul-pengiriman", opsi: { behavior: "smooth", block: "center" } }], "gulir ke judul pengiriman hilang");
  sama(dicatat.fokus.filter((f) => f.id === "pilih-layanan").length, 1, "Select tidak difokuskan setelah ditolak");
  harus(teksPohon(renderPohon(Checkout, props)).includes("Pilih layanan pengiriman dulu."), "alasan tolak hilang");
  bersihkanStore();
  bersihkan();
  dicatat.gulir = [];
  dicatat.fokus = [];
  const fake = propsCheckout({ mode: "fake", tarif_uji: 15e3 });
  terakhirProps = fake;
  poskan(cari(isiKolom(fake), bertipe("form")));
  sama(kendali.kunjungan.length, 1, "mode uji tidak boleh diblokir karena belum memilih");
  sama(kendali.kunjungan[0].data.shipping_courier, null, "mode uji mengirim kurir tanpa pilihan");
  sama(kendali.kunjungan[0].data.shipping_cost, null, "mode uji mengirim biaya tanpa pilihan");
});
uji("D6 keadaan memuat/kosong/galat tetap tanpa Select", async () => {
  const props = propsCheckout();
  terakhirProps = props;
  let pohon = isiKolom(props);
  jalankanTimer(600);
  pohon = renderPohon(Checkout, props);
  sama(selectLayanan(pohon), null, "Select dirender saat tarif masih dimuat");
  const skeleton = cari(pohon, bernama("SkeletonOpsi"));
  harus(skeleton !== null, "placeholder memuat tarif hilang");
  harus(teksPohon(renderPohon(skeleton.type, skeleton.props)).includes("Memuat tarif\u2026"), "teks Memuat tarif\u2026 hilang");
  await flush();
  bersihkanStore();
  bersihkan();
  jawabTarif = { ok: true, body: { opsi: [], gratis: { aktif: true, min: 3e5, terpenuhi: false }, galat: null } };
  pohon = await siapkanTarif(props);
  sama(selectLayanan(pohon), null, "Select dirender untuk daftar kosong");
  harus(teksPohon(pohon).includes("Belum ada layanan aktif untuk kode pos ini."), "copy kosong hilang");
  bersihkanStore();
  bersihkan();
  jawabTarif = { ok: true, body: { opsi: [], gratis: null, galat: "Ongkir tidak bisa dihitung saat ini. Coba lagi atau hubungi penjual." } };
  pohon = await siapkanTarif(props);
  sama(selectLayanan(pohon), null, "Select dirender saat tarif gagal");
  const pemberitahuan = cariSemua(pohon, bernama("InlineNotice")).map((el) => el.props.title);
  harus(pemberitahuan.includes("Tarif gagal dimuat."), "judul galat tarif hilang");
  const tombol = cariSemua(pohon, bernama("Button")).map((el) => teksPohon(el.props.children));
  harus(tombol.includes("Coba lagi"), "tombol Coba lagi hilang");
  harus(cari(pohon, bertipe("form")) !== null, "galat tarif merusak formulir");
});
console.log("=== UJI DROPDOWN EKSPEDISI t_6831e8b1 (/checkout) ===");
for (const { nama, fn } of daftarUji) {
  bersihkanStore();
  bersihkan();
  dicatat.gulir = [];
  dicatat.fokus = [];
  jam.antre = [];
  jawabTarif = { ok: true, body: { opsi: OPSI, gratis: { aktif: true, min: 3e5, terpenuhi: true }, galat: null } };
  try {
    await fn();
    hasil.push({ nama, lulus: true, pesan: "" });
  } catch (galat) {
    hasil.push({ nama, lulus: false, pesan: galat.message });
  }
}
hasil.forEach((item) => console.log(`${item.lulus ? "[OK]  " : "[GAGAL]"} ${item.nama}${item.lulus ? "" : ` -> ${item.pesan}`}`));
var gagal = hasil.filter((item) => !item.lulus).length;
console.log(`
TOTAL: ${hasil.length} uji, ${gagal} gagal`);
process.exitCode = gagal === 0 ? 0 : 1;
