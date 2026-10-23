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
var shim_react_t_321bf03c_default = R;

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

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");
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

// tmp/shim-jsx-runtime-t_321bf03c.mjs
import { createRequire as createRequire3 } from "node:module";
var require4 = createRequire3(import.meta.url);
var JR = require4("react/jsx-runtime");
var jsx = JR.jsx;
var jsxs = JR.jsxs;
var Fragment2 = JR.Fragment;

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const menuRef = useRef(null);
  useBodyScrollLock(drawerOpen);
  useFocusTrap(drawerRef, drawerOpen);
  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [url]);
  useEffect(() => {
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
  const navList = (onNavigate = null) => /* @__PURE__ */ jsx("ul", { className: "flex flex-1 flex-col gap-1 p-3", children: items.map((item) => {
    const Icon = item.icon ?? GridIcon;
    const active = isActive(url, item.href);
    return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
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
          /* @__PURE__ */ jsx(Icon, { size: 18 }),
          item.label
        ]
      }
    ) }, item.key ?? item.href);
  }) });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-surface", children: [
    title && /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("aside", { className: "fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col bg-brand-700 lg:flex", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-topbar items-center px-4 text-white", children: /* @__PURE__ */ jsx(Link, { href: "/admin", className: "text-label font-semibold uppercase tracking-wide", children: "Daster Kulot" }) }),
      /* @__PURE__ */ jsx("nav", { "aria-label": "Navigasi admin", className: "flex flex-1 flex-col overflow-y-auto", children: navList() })
    ] }),
    drawerOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-drawer lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": "Tutup menu",
          onClick: () => setDrawerOpen(false),
          className: "absolute inset-0 h-full w-full bg-ink/40"
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: drawerRef,
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Navigasi admin",
          className: "animate-drawer-in absolute inset-y-0 left-0 flex w-drawer max-w-[85%] flex-col bg-brand-700",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex h-topbar items-center justify-between px-4 text-white", children: [
              /* @__PURE__ */ jsx("span", { className: "text-label font-semibold uppercase tracking-wide", children: "Daster Kulot" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setDrawerOpen(false),
                  "aria-label": "Tutup menu",
                  className: "flex h-touch w-touch items-center justify-center rounded-md text-white/80 transition-colors duration-hover hover:bg-white/10 hover:text-white",
                  children: /* @__PURE__ */ jsx(CloseIcon, { size: 20 })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("nav", { "aria-label": "Navigasi admin", className: "flex flex-1 flex-col overflow-y-auto", children: navList(() => setDrawerOpen(false)) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:pl-sidebar", children: [
      /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-20 flex h-topbar items-center justify-between gap-3 border-b border-line bg-white px-4 lg:px-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setDrawerOpen(true),
            "aria-label": "Buka menu",
            "aria-expanded": drawerOpen,
            className: "flex h-touch w-touch items-center justify-center rounded-md text-ink transition-colors duration-hover hover:bg-surface lg:hidden",
            children: /* @__PURE__ */ jsx(MenuIcon, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "hidden text-label font-semibold text-ink lg:block", children: "Panel Admin" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", ref: menuRef, children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setMenuOpen((open) => !open),
              "aria-haspopup": "menu",
              "aria-expanded": menuOpen,
              className: "flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-hover hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    "aria-hidden": "true",
                    className: "flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-label font-semibold text-brand",
                    children: initial
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "hidden max-w-[160px] truncate text-meta text-ink sm:block", children: userName })
              ]
            }
          ),
          menuOpen && /* @__PURE__ */ jsxs(
            "div",
            {
              role: "menu",
              className: "absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white shadow-raised",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "border-b border-line px-4 py-3", children: [
                  /* @__PURE__ */ jsx("p", { className: "truncate text-label font-semibold text-ink", children: userName }),
                  userEmail && /* @__PURE__ */ jsx("p", { className: "truncate text-meta text-slate-500", children: userEmail })
                ] }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    role: "menuitem",
                    onClick: logout,
                    className: "flex w-full items-center gap-2 px-4 py-3 text-left text-label text-ink transition-colors duration-hover hover:bg-surface",
                    children: [
                      /* @__PURE__ */ jsx(LogOutIcon, { size: 16 }),
                      "Keluar"
                    ]
                  }
                )
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "mx-auto w-full max-w-[1200px] px-4 py-6 lg:px-6", children })
    ] })
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

// resources/js/Components/PageHeader.jsx
function PageHeader({ title = "", breadcrumb = [], actions = null, description = null, className = "" }) {
  return /* @__PURE__ */ jsxs("header", { className: cn("flex flex-col gap-3", className), children: [
    breadcrumb.length > 0 && /* @__PURE__ */ jsx(Breadcrumb, { items: breadcrumb }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-h1 font-bold text-ink", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-meta text-slate-600", children: description })
      ] }),
      actions && /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center", children: actions })
    ] })
  ] });
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

// resources/js/Components/EmptyState.jsx
function EmptyState({
  title = "Belum ada data",
  description = null,
  actionLabel = null,
  actionHref = null,
  onAction = null,
  icon = null,
  className = ""
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center gap-3 py-12 text-center", className), children: [
    /* @__PURE__ */ jsx("span", { className: "text-slate-300", "aria-hidden": "true", children: icon ?? /* @__PURE__ */ jsx(ImageOffIcon, { size: 96 }) }),
    /* @__PURE__ */ jsx("p", { className: "text-h3 text-ink", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
    actionLabel && onAction && /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onAction, className: "mt-2", children: actionLabel }),
    actionLabel && !onAction && actionHref && /* @__PURE__ */ jsx(Button, { variant: "secondary", href: actionHref, className: "mt-2", children: actionLabel })
  ] });
}

// resources/js/Components/ErrorState.jsx
function ErrorState({
  title = "Gagal memuat data",
  description = "Periksa koneksi Anda lalu coba lagi.",
  onRetry = null,
  supportHref = "/kontak-kami",
  retryLabel = "Coba lagi",
  supportLabel = "Hubungi kami",
  className = ""
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "alert",
      className: cn("flex flex-col items-center gap-3 py-12 text-center", className),
      children: [
        /* @__PURE__ */ jsx("span", { className: "text-danger", "aria-hidden": "true", children: /* @__PURE__ */ jsx(AlertIcon, { size: 48 }) }),
        /* @__PURE__ */ jsx("p", { className: "text-h3 text-ink", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap items-center justify-center gap-3", children: [
          onRetry && /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: onRetry, children: retryLabel }),
          supportHref && /* @__PURE__ */ jsx(Button, { variant: "secondary", href: supportHref, children: supportLabel })
        ] })
      ]
    }
  );
}

// resources/js/Components/Skeleton.jsx
var SHAPES = {
  text: "h-3 w-full",
  title: "h-6 w-2/3",
  card: "aspect-square w-full",
  row: "h-tableRow w-full",
  circle: "h-10 w-10 rounded-full"
};
function Skeleton({ variant = "text", count = 1, className = "" }) {
  return Array.from({ length: count }).map((_, index) => /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": "true",
      className: cn("skeleton", SHAPES[variant] ?? SHAPES.text, className)
    },
    index
  ));
}

// resources/js/Components/DataTable.jsx
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
  return /* @__PURE__ */ jsx("div", { className: cn("overflow-hidden rounded-lg border border-line bg-white", className), children: error ? /* @__PURE__ */ jsx(
    ErrorState,
    {
      title: "Gagal memuat data",
      description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
      onRetry,
      supportHref: null
    }
  ) : loading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col", "aria-busy": "true", children: [
    /* @__PURE__ */ jsx("div", { className: "h-tableHead w-full border-b border-line bg-surface", "aria-hidden": "true" }),
    Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 border-b border-line px-4 last:border-b-0", children: /* @__PURE__ */ jsx(Skeleton, { variant: "row" }) }, index))
  ] }) : !hasRows ? /* @__PURE__ */ jsx(
    EmptyState,
    {
      title: emptyTitle,
      description: emptyDescription,
      actionLabel: emptyActionLabel,
      actionHref: emptyActionHref
    }
  ) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse text-meta", children: [
    caption && /* @__PURE__ */ jsx("caption", { className: "sr-only", children: caption }),
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "bg-surface", children: columns.map((column) => {
      const isSorted = sort && sort.key === column.key;
      const sortable = Boolean(onSort && column.sortable !== false);
      return /* @__PURE__ */ jsx(
        "th",
        {
          scope: "col",
          "aria-sort": isSorted ? sortState(column) : void 0,
          className: cn(
            "h-tableHead whitespace-nowrap border-b border-line px-4 text-label uppercase text-slate-600",
            cellAlign(column)
          ),
          children: sortable ? /* @__PURE__ */ jsxs(
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
                /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: isSorted ? sort.dir === "desc" ? "\u2193" : "\u2191" : "\u2195" })
              ]
            }
          ) : column.header
        },
        column.key
      );
    }) }) }),
    /* @__PURE__ */ jsx("tbody", { children: list.map((row, index) => {
      const clickable = typeof onRowClick === "function";
      return /* @__PURE__ */ jsx(
        "tr",
        {
          className: cn(
            "h-tableRow border-b border-line last:border-b-0",
            clickable && "cursor-pointer transition-colors duration-hover hover:bg-surface focus-within:bg-surface"
          ),
          onClick: clickable ? () => onRowClick(row, index) : void 0,
          children: columns.map((column) => /* @__PURE__ */ jsx(
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

// resources/js/Components/Pagination.jsx
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
  return /* @__PURE__ */ jsx(
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
      children: direction === "left" ? /* @__PURE__ */ jsx("path", { d: "M15 6l-6 6 6 6" }) : /* @__PURE__ */ jsx("path", { d: "M9 6l6 6-6 6" })
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
  return /* @__PURE__ */ jsxs("nav", { "aria-label": "Navigasi halaman", className: cn("flex items-center justify-center gap-1", className), children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => go(current - 1),
        disabled: current <= 1,
        "aria-label": "Halaman sebelumnya",
        className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"),
        children: /* @__PURE__ */ jsx(Chevron, { direction: "left" })
      }
    ),
    /* @__PURE__ */ jsxs("span", { className: "px-2 text-meta text-ink-soft sm:hidden", "aria-live": "polite", children: [
      current,
      " / ",
      last
    ] }),
    /* @__PURE__ */ jsx("div", { className: "hidden items-center gap-1 sm:flex", children: pages.map((page, index) => {
      const previous = pages[index - 1];
      const gap = previous && page - previous > 1;
      return /* @__PURE__ */ jsxs(shim_react_t_321bf03c_default.Fragment, { children: [
        gap && /* @__PURE__ */ jsx("span", { className: "px-1 text-meta text-slate-400", "aria-hidden": "true", children: "..." }),
        /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => go(current + 1),
        disabled: current >= last,
        "aria-label": "Halaman berikutnya",
        className: cn(base, "text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"),
        children: /* @__PURE__ */ jsx(Chevron, { direction: "right" })
      }
    )
  ] });
}

// resources/js/Components/SearchInput.jsx
function SearchInput({
  value = "",
  onChange = null,
  placeholder = "Cari produk",
  label = "Cari produk",
  loading = false,
  className = ""
}) {
  const [text, setText] = useState(value);
  const mounted = useRef(false);
  useEffect(() => {
    setText(value);
  }, [value]);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return void 0;
    }
    const timer = window.setTimeout(() => {
      if (typeof onChange === "function") onChange(text.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [text]);
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400", "aria-hidden": "true", children: /* @__PURE__ */ jsx(SearchIcon, { width: 18, height: 18 }) }),
    /* @__PURE__ */ jsx(
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
    text.length > 0 && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setText(""),
        "aria-label": "Bersihkan pencarian",
        className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-slate-400 transition-colors duration-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        children: /* @__PURE__ */ jsx(CloseIcon, { width: 16, height: 16 })
      }
    )
  ] });
}

// resources/js/Components/Select.jsx
var BASE = "w-full h-field appearance-none rounded-md border border-line bg-white pl-3.5 pr-10 text-body text-ink transition-colors duration-hover focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Select({ error = null, className = "", id = null, children, ...rest }) {
  return /* @__PURE__ */ jsxs("span", { className: "relative block", children: [
    /* @__PURE__ */ jsx(
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

// resources/js/Components/Modal.jsx
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
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose?.();
      },
      children: /* @__PURE__ */ jsxs(
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
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                title && /* @__PURE__ */ jsx("h2", { id: "modal-title", className: "text-h3 text-ink", children: title }),
                description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-meta text-ink-soft", children: description })
              ] }),
              onClose && /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  "aria-label": closeLabel,
                  className: "-mr-2 -mt-1 inline-flex h-touch w-touch items-center justify-center rounded-md text-ink-soft transition-colors duration-hover hover:bg-surface",
                  children: /* @__PURE__ */ jsx(CloseIcon, { size: 20 })
                }
              )
            ] }),
            children && /* @__PURE__ */ jsx("div", { className: "mt-4 text-body text-ink", children }),
            footer && /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap justify-end gap-3", children: footer })
          ]
        }
      )
    }
  );
}

// resources/js/Components/Toast.jsx
var TONES = {
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
  const config = TONES[tone] ?? TONES.info;
  const Icon = config.icon;
  useEffect(() => {
    if (!duration || !onClose) return void 0;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [duration, onClose]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn(
        "pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-md border border-line border-l-[3px] bg-white p-4 shadow-raised animate-fade-up",
        config.bar
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: cn("mt-0.5 shrink-0", config.color), "aria-hidden": "true", children: /* @__PURE__ */ jsx(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx("p", { className: "text-label text-ink", children: title }),
          message && /* @__PURE__ */ jsx("p", { className: "text-meta text-ink-soft", children: message })
        ] }),
        onClose && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            "aria-label": "Tutup notifikasi",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-surface",
            children: /* @__PURE__ */ jsx(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}

// resources/js/Components/InlineNotice.jsx
var TONES2 = {
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
      className: cn("flex items-start gap-3 rounded-md p-4", TONES2[tone] ?? TONES2.info, className),
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

// resources/js/Components/StatusBadge.jsx
var TONES3 = {
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
  const tone = TONES3[key] ?? null;
  const text = label ?? tone?.label ?? (key === "" ? "-" : status);
  return /* @__PURE__ */ jsx(
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

// resources/js/Components/KpiCard.jsx
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
  const body = /* @__PURE__ */ jsxs(Fragment2, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-label uppercase text-slate-500", children: label }),
      Icon && /* @__PURE__ */ jsx(
        "span",
        {
          className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand",
          "aria-hidden": "true",
          children: /* @__PURE__ */ jsx(Icon, { size: 18 })
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { variant: "title", className: "h-7 w-3/5" }),
      /* @__PURE__ */ jsx(Skeleton, { variant: "text", className: "h-3 w-2/5" })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[28px] font-bold leading-none text-ink", children: shownValue }),
      (hasDelta || deltaLabel) && /* @__PURE__ */ jsxs(
        "p",
        {
          className: cn(
            "flex items-center gap-1 text-meta",
            hasDelta && numericDelta > 0 && "text-success-strong",
            hasDelta && numericDelta < 0 && "text-danger-strong",
            (!hasDelta || numericDelta === 0) && "text-ink-soft"
          ),
          children: [
            hasDelta && numericDelta !== 0 && /* @__PURE__ */ jsx(DeltaIcon, { size: 14 }),
            hasDelta && numericDelta !== 0 && /* @__PURE__ */ jsxs("span", { children: [
              numericDelta > 0 ? "+" : "",
              numericDelta,
              "%"
            ] }),
            deltaLabel && /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: deltaLabel })
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
    return /* @__PURE__ */ jsx("div", { className: base, "aria-busy": "true", children: body });
  }
  if (href) {
    return /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsx("div", { className: base, children: body });
}

// resources/js/Components/Input.jsx
var BASE2 = "w-full h-field rounded-md border border-line bg-white px-3.5 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Input({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx(
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

// resources/js/Pages/Admin/Stocks/partials/StokAksiModal.jsx
var QTY_MAKS = 1e5;
var asText = (value) => value === null || value === void 0 ? "" : String(value);
var asAngka = (value) => {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : 0;
};
function StokAksiModal({ open = false, mode = "in", baris = null, onClose = null }) {
  const keluar = mode === "out";
  const form = useForm({ qty: "", note: "" });
  const [galatLokal, setGalatLokal] = useState(null);
  useEffect(() => {
    if (!open) return;
    form.setData({ qty: "", note: "" });
    form.clearErrors();
    setGalatLokal(null);
  }, [open, baris?.id, mode]);
  const idVarian = baris?.id ?? null;
  const namaVarian = `${asText(baris?.product?.name) || "Produk tanpa nama"} \u2014 ${asText(baris?.label) || "varian tanpa label"}`;
  const stokSaatIni = formatNumber(asAngka(baris?.stock));
  const url = keluar ? `/admin/stok/${idVarian}/keluar` : `/admin/stok/${idVarian}/masuk`;
  const galatQty = galatLokal ?? form.errors.qty ?? null;
  const galatNote = form.errors.note ?? null;
  const galatLain = Object.entries(form.errors ?? {}).filter(
    ([kunci, pesan]) => !["qty", "note"].includes(kunci) && Boolean(pesan)
  );
  const kirim = (event) => {
    if (event) event.preventDefault();
    if (form.processing || idVarian === null) return;
    const mentah = asText(form.data.qty).trim();
    const jumlah = Number(mentah);
    if (mentah === "") {
      setGalatLokal("Jumlah wajib diisi.");
      return;
    }
    if (!Number.isInteger(jumlah) || jumlah < 1) {
      setGalatLokal("Jumlah minimal 1.");
      return;
    }
    if (jumlah > QTY_MAKS) {
      setGalatLokal(`Jumlah maksimal ${formatNumber(QTY_MAKS)}.`);
      return;
    }
    setGalatLokal(null);
    form.post(url, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => onClose?.()
    });
  };
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose,
      title: keluar ? "Catat stok keluar" : "Catat stok masuk",
      description: baris === null ? "" : `${namaVarian} \xB7 stok tercatat saat ini ${stokSaatIni}`,
      size: "lg",
      footer: /* @__PURE__ */ jsxs(Fragment2, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onClose, disabled: form.processing, children: "Batal" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "primary",
            type: "submit",
            form: "form-stok-aksi",
            loading: form.processing,
            disabled: baris === null,
            children: keluar ? "Simpan stok keluar" : "Simpan stok masuk"
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxs("form", { id: "form-stok-aksi", className: "flex flex-col gap-4", onSubmit: kirim, noValidate: true, children: [
        galatLain.length > 0 && /* @__PURE__ */ jsx(InlineNotice, { tone: "error", title: "Perubahan stok gagal disimpan", children: galatLain.map(([kunci, pesan]) => /* @__PURE__ */ jsx("p", { children: asText(pesan) }, kunci)) }),
        /* @__PURE__ */ jsx(
          Field,
          {
            label: "Jumlah",
            htmlFor: "stok-aksi-qty",
            required: true,
            hint: keluar ? `Stok tercatat saat ini ${stokSaatIni}. Server menolak jumlah yang melebihi stok tersedia.` : "Jumlah ditambahkan ke stok varian ini dan tercatat di riwayat.",
            error: galatQty,
            children: /* @__PURE__ */ jsx(
              Input,
              {
                id: "stok-aksi-qty",
                name: "qty",
                type: "number",
                inputMode: "numeric",
                min: 1,
                max: QTY_MAKS,
                step: 1,
                autoComplete: "off",
                value: form.data.qty,
                error: galatQty,
                onChange: (event) => {
                  setGalatLokal(null);
                  form.clearErrors("qty");
                  form.setData("qty", event.target.value);
                },
                placeholder: "mis. 10"
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          Field,
          {
            label: "Catatan (opsional)",
            htmlFor: "stok-aksi-note",
            hint: "Maksimal 255 karakter. Catatan tampil di riwayat pergerakan.",
            error: galatNote,
            children: /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "stok-aksi-note",
                name: "note",
                rows: 3,
                maxLength: 255,
                value: form.data.note,
                error: galatNote,
                onChange: (event) => {
                  form.clearErrors("note");
                  form.setData("note", event.target.value);
                },
                placeholder: keluar ? "mis. barang rusak saat pengemasan" : "mis. kiriman dari supplier"
              }
            )
          }
        )
      ] })
    }
  );
}

// resources/js/Pages/Admin/Stocks/Index.jsx
var BREADCRUMB = [{ label: "Dashboard", href: "/admin" }, { label: "Stok" }];
var BATAS_KRITIS = 5;
var DASAR = { q: "", status: "semua", kategori: "", urut: "nama" };
var STATUS = [
  { value: "semua", label: "Semua status" },
  { value: "habis", label: "Stok habis" },
  { value: "kritis", label: "Stok di bawah 5" }
];
var URUT = [
  { value: "nama", label: "Nama produk A\u2013Z" },
  { value: "stok_terkecil", label: "Stok terendah" },
  { value: "stok_terbesar", label: "Stok tertinggi" }
];
var BADGE_STATUS = {
  habis: { tone: "danger", label: "Habis" },
  kritis: { tone: "warning", label: "Kritis" },
  aman: { tone: "success", label: "Aman" }
};
var asText2 = (value) => value === null || value === void 0 ? "" : String(value);
var asAngka2 = (value) => {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : 0;
};
var angkaTeks = (value) => value === null || value === void 0 ? "-" : formatNumber(value);
var asBool = (value) => value === true || value === 1 || value === "1";
var keFilter = (sumber) => ({
  q: asText2(sumber?.q ?? ""),
  status: sumber?.status ? asText2(sumber.status) : DASAR.status,
  kategori: sumber?.kategori === null || sumber?.kategori === void 0 ? "" : asText2(sumber.kategori),
  urut: sumber?.urut ? asText2(sumber.urut) : DASAR.urut
});
function Index({
  stok = null,
  filter = null,
  kategori = [],
  ringkasan = null,
  flash = null,
  errors = null
}) {
  const aktif = keFilter(filter);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState(null);
  const [toast, setToast] = useState(null);
  const [galatTutup, setGalatTutup] = useState(false);
  const [aksi, setAksi] = useState(null);
  const [setel, setSetel] = useState(null);
  useEffect(() => {
    if (flash?.success) {
      setToast({ tone: "success", title: "Berhasil", message: String(flash.success) });
    } else if (flash?.error) {
      setToast({ tone: "error", title: "Gagal", message: String(flash.error) });
    }
  }, [flash?.success, flash?.error]);
  const daftar = Array.isArray(stok?.data) ? stok.data : [];
  const meta = stok?.meta ?? {};
  const halaman = asAngka2(meta.current_page) || 1;
  const halamanAkhir = asAngka2(meta.last_page) || 1;
  const total = meta.total === null || meta.total === void 0 ? "-" : formatNumber(meta.total);
  const daftarKategori = Array.isArray(kategori) ? kategori.filter(Boolean) : [];
  const adaFilter = aktif.q !== DASAR.q || aktif.status !== DASAR.status || aktif.kategori !== DASAR.kategori || aktif.urut !== DASAR.urut;
  const buka = (perubahan, opsi = {}) => {
    const berikut2 = { ...aktif, ...perubahan };
    const query = {};
    if (berikut2.q !== "") query.q = berikut2.q;
    if (berikut2.kategori !== "") query.kategori = berikut2.kategori;
    if (berikut2.status !== DASAR.status) query.status = berikut2.status;
    if (berikut2.urut !== DASAR.urut) query.urut = berikut2.urut;
    if (opsi.page && opsi.page > 1) query.page = opsi.page;
    router.get("/admin/stok", query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onStart: () => {
        setMemuat(true);
        setGalat(null);
      },
      onFinish: () => setMemuat(false),
      onError: () => setGalat("Gagal memuat daftar stok. Periksa koneksi lalu coba lagi.")
    });
  };
  const reset = () => buka({ ...DASAR });
  const gantiSort = (key) => {
    if (key === "produk") {
      buka({ urut: "nama" });
      return;
    }
    if (key === "stok") {
      buka({ urut: aktif.urut === "stok_terbesar" ? "stok_terkecil" : "stok_terbesar" });
    }
  };
  const namaBaris = (baris) => `${asText2(baris?.product?.name) || "Produk tanpa nama"} \u2014 ${asText2(baris?.label) || "varian tanpa label"}`;
  const galatServer = galatTutup ? [] : Object.values(errors ?? {}).filter((pesan) => Boolean(pesan));
  const kolom = [
    {
      key: "produk",
      header: "Produk",
      render: (baris) => /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate font-semibold text-ink", children: asText2(baris?.product?.name) || "-" }),
        /* @__PURE__ */ jsx("p", { className: "truncate text-meta text-slate-500", children: asText2(baris?.product?.slug) || "-" })
      ] })
    },
    {
      key: "varian",
      header: "Varian",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("p", { className: "flex flex-wrap items-center gap-2 font-semibold text-ink", children: [
          /* @__PURE__ */ jsx("span", { className: "truncate", children: asText2(baris?.label) || "-" }),
          asBool(baris?.is_active) ? null : /* @__PURE__ */ jsx(StatusBadge, { status: "nonaktif", label: "Nonaktif" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "truncate text-meta text-slate-500", children: asText2(baris?.sku) || "Tanpa SKU" })
      ] })
    },
    {
      key: "stok",
      header: "Stok",
      align: "right",
      render: (baris) => /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink", children: angkaTeks(baris?.stock) })
    },
    {
      key: "batas",
      header: "Batas kritis",
      align: "right",
      sortable: false,
      render: () => /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap text-slate-600", children: `< ${BATAS_KRITIS}` })
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      render: (baris) => {
        const kunci = asText2(baris?.status);
        const lencana = BADGE_STATUS[kunci] ?? null;
        return lencana === null ? /* @__PURE__ */ jsx(StatusBadge, { status: kunci, label: kunci === "" ? "-" : void 0 }) : /* @__PURE__ */ jsx(Badge, { tone: lencana.tone, children: lencana.label });
      }
    },
    {
      key: "diperbarui",
      header: "Diperbarui",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: asText2(baris?.updated_at) === "" ? "-" : formatDateTime(baris.updated_at) })
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "right",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-end gap-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "secondary",
            size: "sm",
            onClick: () => setAksi({ mode: "in", baris }),
            "aria-label": `Catat stok masuk untuk ${namaBaris(baris)}`,
            children: "Masuk"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "secondary",
            size: "sm",
            onClick: () => setAksi({ mode: "out", baris }),
            "aria-label": `Catat stok keluar untuk ${namaBaris(baris)}`,
            children: "Keluar"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setSetel(baris),
            "aria-label": `Setel stok ${namaBaris(baris)}`,
            children: "Setel"
          }
        )
      ] })
    }
  ];
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Stok", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Stok",
          breadcrumb: BREADCRUMB,
          description: "Pantau stok per varian, catat stok masuk/keluar, dan telusuri riwayat pergerakan.",
          actions: /* @__PURE__ */ jsx(Button, { variant: "secondary", href: "/admin/stok/riwayat", children: "Riwayat pergerakan" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [
        /* @__PURE__ */ jsx(
          KpiCard,
          {
            label: "Total varian",
            value: angkaTeks(ringkasan?.varian),
            href: "/admin/stok"
          }
        ),
        /* @__PURE__ */ jsx(
          KpiCard,
          {
            label: "Stok habis",
            value: angkaTeks(ringkasan?.habis),
            href: "/admin/stok?status=habis"
          }
        ),
        /* @__PURE__ */ jsx(
          KpiCard,
          {
            label: "Stok kritis",
            value: angkaTeks(ringkasan?.kritis),
            href: "/admin/stok?status=kritis"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-meta text-slate-600", children: [
        `Status baris: Habis (stok 0), Kritis (stok 1\u2013${BATAS_KRITIS - 1}), Aman (stok ${BATAS_KRITIS} atau lebih). `,
        `Filter "Stok di bawah ${BATAS_KRITIS}" menampilkan stok di bawah ${BATAS_KRITIS}, termasuk yang habis.`
      ] }),
      galatServer.length > 0 && aksi === null && setel === null && /* @__PURE__ */ jsx(
        InlineNotice,
        {
          tone: "error",
          title: "Perubahan stok gagal disimpan",
          onDismiss: () => setGalatTutup(true),
          children: galatServer.map((pesan, index) => /* @__PURE__ */ jsx("p", { children: asText2(pesan) }, `galat-${index}`))
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 rounded-lg border border-line bg-white p-4", children: [
        /* @__PURE__ */ jsx(
          SearchInput,
          {
            value: aktif.q,
            onChange: (nilai) => buka({ q: nilai }),
            placeholder: "Cari nama produk atau SKU varian",
            label: "Cari stok varian",
            loading: memuat
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [
          /* @__PURE__ */ jsx(Field, { label: "Kategori", htmlFor: "filter-kategori", children: /* @__PURE__ */ jsxs(
            Select,
            {
              id: "filter-kategori",
              value: aktif.kategori,
              disabled: memuat,
              onChange: (event) => buka({ kategori: event.target.value }),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Semua kategori" }),
                daftarKategori.map((item) => /* @__PURE__ */ jsx("option", { value: item.id, children: asText2(item.name) || "-" }, item.id))
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Status", htmlFor: "filter-status", children: /* @__PURE__ */ jsx(
            Select,
            {
              id: "filter-status",
              value: aktif.status,
              disabled: memuat,
              onChange: (event) => buka({ status: event.target.value }),
              children: STATUS.map((item) => /* @__PURE__ */ jsx("option", { value: item.value, children: item.label }, item.value))
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Urutkan", htmlFor: "filter-urut", children: /* @__PURE__ */ jsx(
            Select,
            {
              id: "filter-urut",
              value: aktif.urut,
              disabled: memuat,
              onChange: (event) => buka({ urut: event.target.value }),
              children: URUT.map((item) => /* @__PURE__ */ jsx("option", { value: item.value, children: item.label }, item.value))
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-meta text-slate-500", children: [
            "Menampilkan ",
            formatNumber(daftar.length),
            " dari ",
            total,
            " varian."
          ] }),
          adaFilter && /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", onClick: reset, disabled: memuat, children: "Reset filter" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        DataTable,
        {
          columns: kolom,
          rows: daftar,
          loading: memuat,
          error: galat,
          onRetry: () => buka({}),
          emptyTitle: adaFilter ? "Tidak ada varian yang cocok" : "Belum ada varian",
          emptyDescription: adaFilter ? "Ubah kata kunci atau reset filter untuk melihat varian lain." : "Tambahkan produk beserta variannya agar stok bisa dicatat di sini.",
          emptyActionLabel: adaFilter ? null : "Tambah produk",
          emptyActionHref: adaFilter ? null : "/admin/produk/tambah",
          sort: {
            key: aktif.urut === "nama" ? "produk" : "stok",
            dir: aktif.urut === "stok_terbesar" ? "desc" : "asc"
          },
          onSort: gantiSort,
          caption: "Daftar stok per varian"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-meta text-slate-600", children: [
          "Halaman ",
          formatNumber(halaman),
          " dari ",
          formatNumber(halamanAkhir)
        ] }),
        /* @__PURE__ */ jsx(
          Pagination,
          {
            currentPage: halaman,
            lastPage: halamanAkhir,
            onPageChange: (page) => buka({}, { page })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      StokAksiModal,
      {
        open: aksi !== null,
        mode: aksi?.mode ?? "in",
        baris: aksi?.baris ?? null,
        onClose: () => setAksi(null)
      }
    ),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: setel !== null,
        onClose: () => setSetel(null),
        title: "Setel stok",
        description: setel === null ? "" : namaBaris(setel),
        footer: /* @__PURE__ */ jsxs(Fragment2, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setSetel(null), children: "Tutup" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "primary",
              href: setel?.product?.id ? `/admin/produk/${setel.product.id}/ubah` : "/admin/produk",
              children: "Buka form produk"
            }
          )
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 text-body text-ink-soft", children: [
          /* @__PURE__ */ jsx("p", { children: "Setel stok ke angka tertentu dilakukan dari form produk. Server mencatat selisihnya sebagai pergerakan penyesuaian (kontrak props \xA712.4 dan \xA712.6), jadi riwayat stok tetap lengkap." }),
          /* @__PURE__ */ jsx("p", { children: "Untuk koreksi cepat tanpa membuka produk, pakai tombol Masuk atau Keluar \u2014 keduanya tercatat atas nama petugas yang sedang masuk." })
        ] })
      }
    ),
    toast && /* @__PURE__ */ jsx("div", { className: "pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]", children: /* @__PURE__ */ jsx(
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

// resources/js/Pages/Admin/Stocks/History.jsx
var BREADCRUMB2 = [
  { label: "Dashboard", href: "/admin" },
  { label: "Stok", href: "/admin/stok" },
  { label: "Riwayat pergerakan" }
];
var DASAR2 = { q: "", tipe: "semua", varian: "" };
var TIPE = [
  { value: "semua", label: "Semua tipe" },
  { value: "in", label: "Stok masuk" },
  { value: "out", label: "Stok keluar" },
  { value: "adjust", label: "Penyesuaian" },
  { value: "sale", label: "Penjualan" }
];
var TONE_TIPE = {
  in: "success",
  out: "danger",
  adjust: "brand",
  sale: "sale"
};
var asText3 = (value) => value === null || value === void 0 ? "" : String(value);
var asAngka3 = (value) => {
  const angka = Number(value);
  return Number.isFinite(angka) ? angka : 0;
};
var angkaTeks2 = (value) => value === null || value === void 0 ? "-" : formatNumber(value);
var keFilter2 = (sumber) => ({
  q: asText3(sumber?.q ?? ""),
  tipe: sumber?.tipe ? asText3(sumber.tipe) : DASAR2.tipe,
  varian: sumber?.varian === null || sumber?.varian === void 0 ? "" : asText3(sumber.varian)
});
function History({ riwayat = null, filter = null, varian = [], ringkasan = null, flash = null }) {
  const aktif = keFilter2(filter);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState(null);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (flash?.success) {
      setToast({ tone: "success", title: "Berhasil", message: String(flash.success) });
    } else if (flash?.error) {
      setToast({ tone: "error", title: "Gagal", message: String(flash.error) });
    }
  }, [flash?.success, flash?.error]);
  const daftar = Array.isArray(riwayat?.data) ? riwayat.data : [];
  const meta = riwayat?.meta ?? {};
  const halaman = asAngka3(meta.current_page) || 1;
  const halamanAkhir = asAngka3(meta.last_page) || 1;
  const total = meta.total === null || meta.total === void 0 ? "-" : formatNumber(meta.total);
  const daftarVarian = Array.isArray(varian) ? varian.filter(Boolean) : [];
  const adaFilter = aktif.q !== DASAR2.q || aktif.tipe !== DASAR2.tipe || aktif.varian !== DASAR2.varian;
  const buka = (perubahan, opsi = {}) => {
    const berikut2 = { ...aktif, ...perubahan };
    const query = {};
    if (berikut2.q !== "") query.q = berikut2.q;
    if (berikut2.tipe !== DASAR2.tipe) query.tipe = berikut2.tipe;
    if (berikut2.varian !== "") query.varian = berikut2.varian;
    if (opsi.page && opsi.page > 1) query.page = opsi.page;
    router.get("/admin/stok/riwayat", query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onStart: () => {
        setMemuat(true);
        setGalat(null);
      },
      onFinish: () => setMemuat(false),
      onError: () => setGalat("Gagal memuat riwayat stok. Periksa koneksi lalu coba lagi.")
    });
  };
  const reset = () => buka({ ...DASAR2 });
  const jumlahTanda = (baris) => {
    const nilai = asAngka3(baris?.signed_qty);
    return `${nilai > 0 ? "+" : nilai < 0 ? "\u2212" : ""}${formatNumber(Math.abs(nilai))}`;
  };
  const kolom = [
    {
      key: "waktu",
      header: "Waktu",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: asText3(baris?.created_at) === "" ? "-" : formatDateTime(baris.created_at) })
    },
    {
      key: "produk",
      header: "Produk",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate font-semibold text-ink", children: asText3(baris?.product_name) || "-" }),
        /* @__PURE__ */ jsx("p", { className: "truncate text-meta text-slate-500", children: asText3(baris?.variant_label) || "Varian tidak ditemukan" })
      ] })
    },
    {
      key: "sku",
      header: "SKU",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: asText3(baris?.variant_sku) || "-" })
    },
    {
      key: "tipe",
      header: "Tipe",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx(Badge, { tone: TONE_TIPE[asText3(baris?.type)] ?? "brand", children: asText3(baris?.tipe_label) || "-" })
    },
    {
      key: "jumlah",
      header: "Jumlah",
      align: "right",
      sortable: false,
      render: (baris) => {
        const nilai = asAngka3(baris?.signed_qty);
        return /* @__PURE__ */ jsx(
          "span",
          {
            className: nilai > 0 ? "font-semibold text-success-strong" : nilai < 0 ? "font-semibold text-danger-strong" : "font-semibold text-slate-600",
            children: jumlahTanda(baris)
          }
        );
      }
    },
    {
      key: "catatan",
      header: "Catatan",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx("span", { className: "block max-w-[320px] whitespace-pre-line break-words text-ink", children: asText3(baris?.note) === "" ? "-" : asText3(baris.note) })
    },
    {
      key: "petugas",
      header: "Petugas",
      sortable: false,
      render: (baris) => /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: asText3(baris?.admin?.name) || "-" })
    }
  ];
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Riwayat stok", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Riwayat pergerakan",
          breadcrumb: BREADCRUMB2,
          description: "Semua perubahan stok varian: stok masuk, stok keluar, penyesuaian dari form produk, dan pengurangan dari pesanan.",
          actions: /* @__PURE__ */ jsx(Button, { variant: "secondary", href: "/admin/stok", children: "Daftar stok" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsx(KpiCard, { label: "Pergerakan masuk", value: angkaTeks2(ringkasan?.masuk), href: "/admin/stok/riwayat?tipe=in" }),
        /* @__PURE__ */ jsx(KpiCard, { label: "Pergerakan keluar", value: angkaTeks2(ringkasan?.keluar), href: "/admin/stok/riwayat?tipe=out" }),
        /* @__PURE__ */ jsx(KpiCard, { label: "Penyesuaian", value: angkaTeks2(ringkasan?.adjust), href: "/admin/stok/riwayat?tipe=adjust" }),
        /* @__PURE__ */ jsx(KpiCard, { label: "Penjualan", value: angkaTeks2(ringkasan?.sale), href: "/admin/stok/riwayat?tipe=sale" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-meta text-slate-600", children: "Angka kartu adalah jumlah baris pergerakan per tipe, bukan jumlah unit stok. Kolom Jumlah memakai angka bertanda dari server: masuk positif, keluar dan penjualan negatif, penyesuaian mengikuti selisih." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 rounded-lg border border-line bg-white p-4", children: [
        /* @__PURE__ */ jsx(
          SearchInput,
          {
            value: aktif.q,
            onChange: (nilai) => buka({ q: nilai }),
            placeholder: "Cari nama produk, SKU, atau catatan",
            label: "Cari riwayat pergerakan stok",
            loading: memuat
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Tipe pergerakan", htmlFor: "riwayat-tipe", children: /* @__PURE__ */ jsx(
            Select,
            {
              id: "riwayat-tipe",
              value: aktif.tipe,
              disabled: memuat,
              onChange: (event) => buka({ tipe: event.target.value }),
              children: TIPE.map((item) => /* @__PURE__ */ jsx("option", { value: item.value, children: item.label }, item.value))
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Varian", htmlFor: "riwayat-varian", children: /* @__PURE__ */ jsxs(
            Select,
            {
              id: "riwayat-varian",
              value: aktif.varian,
              disabled: memuat,
              onChange: (event) => buka({ varian: event.target.value }),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Semua varian" }),
                daftarVarian.map((item) => /* @__PURE__ */ jsx("option", { value: item.id, children: `${asText3(item.product_name) || "Produk tanpa nama"} \u2014 ${asText3(item.label) || "varian tanpa label"}` }, item.id))
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-meta text-slate-500", children: [
            "Menampilkan ",
            formatNumber(daftar.length),
            " dari ",
            total,
            " pergerakan."
          ] }),
          adaFilter && /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", onClick: reset, disabled: memuat, children: "Reset filter" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        DataTable,
        {
          columns: kolom,
          rows: daftar,
          loading: memuat,
          error: galat,
          onRetry: () => buka({}),
          emptyTitle: adaFilter ? "Tidak ada pergerakan yang cocok" : "Belum ada pergerakan stok",
          emptyDescription: adaFilter ? "Ubah kata kunci atau reset filter untuk melihat riwayat lain." : "Riwayat terisi otomatis saat ada stok masuk, stok keluar, penyesuaian dari form produk, atau pengurangan dari pesanan.",
          emptyActionLabel: adaFilter ? null : "Lihat daftar stok",
          emptyActionHref: adaFilter ? null : "/admin/stok",
          caption: "Riwayat pergerakan stok"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-meta text-slate-600", children: [
          "Halaman ",
          formatNumber(halaman),
          " dari ",
          formatNumber(halamanAkhir)
        ] }),
        /* @__PURE__ */ jsx(
          Pagination,
          {
            currentPage: halaman,
            lastPage: halamanAkhir,
            onPageChange: (page) => buka({}, { page })
          }
        )
      ] })
    ] }),
    toast && /* @__PURE__ */ jsx("div", { className: "pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]", children: /* @__PURE__ */ jsx(
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

// tmp/uji-aksi-stok-t_321bf03c.mjs
var jam = { antre: [], urut: 0 };
var banyakKelas = () => ({ add() {
}, remove() {
}, toggle() {
}, contains: () => false });
globalThis.HTMLElement = class HTMLElement2 {
};
globalThis.window = {
  scrollY: 0,
  innerWidth: 1280,
  location: { href: "http://127.0.0.1:8000/admin/stok", pathname: "/admin/stok", search: "" },
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
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: banyakKelas(), appendChild() {
  } })
};
var majukanWaktu = () => {
  const kini = [...jam.antre];
  jam.antre = [];
  kini.forEach((t) => t.fn());
  return kini.length;
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
var adaNilai = (simpul, teks) => {
  if (simpul === null || simpul === void 0) return false;
  if (typeof simpul === "string") return simpul.includes(teks);
  if (Array.isArray(simpul)) return simpul.some((anak) => adaNilai(anak, teks));
  if (typeof simpul === "object") {
    if (typeof simpul.type === "function" || typeof simpul.type === "object") {
      return adaNilai(simpul.props ?? {}, teks) || adaNilai(simpul.props?.children, teks);
    }
    return Object.values(simpul).some((nilai) => adaNilai(nilai, teks));
  }
  return false;
};
var poskan = (el) => el.props.onSubmit?.({ preventDefault() {
} });
var barisIndex = (ubah = {}) => ({
  id: 12,
  product: { id: 7, name: "Daster Batik Kulot", slug: "daster-batik-kulot" },
  size: "L",
  color: "Hitam",
  label: "L / Hitam",
  sku: "DBK-L-HTM",
  stock: 9,
  is_active: true,
  status: "aman",
  updated_at: "2026-10-20 09:15:00",
  ...ubah
});
var paginator = (data, meta = {}) => ({
  data,
  links: [],
  meta: { current_page: 1, last_page: 1, per_page: 15, total: data.length, ...meta }
});
var propsIndex = (ubah = {}) => ({
  stok: paginator([barisIndex()], { total: 1 }),
  filter: { q: null, status: "semua", kategori: null, urut: "nama" },
  kategori: [{ id: 3, name: "Daster", slug: "daster" }],
  ringkasan: { varian: 24, habis: 2, kritis: 5 },
  flash: null,
  errors: null,
  ...ubah
});
var barisRiwayat = (ubah = {}) => ({
  id: 7,
  product_name: "Daster Batik Kulot",
  variant_label: "L / Hitam",
  variant_sku: "DBK-L-HTM",
  type: "in",
  tipe_label: "Masuk",
  qty: 10,
  signed_qty: 10,
  note: "Kiriman supplier",
  admin: { id: 2, name: "Sari Admin" },
  created_at: "2026-10-20 09:15:00",
  ...ubah
});
var propsHistory = (ubah = {}) => ({
  riwayat: paginator([barisRiwayat()], { total: 1 }),
  filter: { q: null, tipe: "semua", varian: null },
  varian: [{ id: 12, label: "L / Hitam", product_name: "Daster Batik Kulot", sku: "DBK-L-HTM" }],
  ringkasan: { masuk: 4, keluar: 1, adjust: 2, sale: 3 },
  flash: null,
  ...ubah
});
var hasil = [];
var uji = (nama, fn) => {
  bersihkanStore();
  bersihkan();
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
var kunjunganTerakhir = () => kendali.kunjungan[kendali.kunjungan.length - 1] ?? null;
uji("A1 tombol urut tabel mengirim query urut ke server", () => {
  bersihkan();
  let tabel = cari(renderPohon(Index, propsIndex()), bernama("DataTable"));
  sama(tabel.props.sort, { key: "produk", dir: "asc" }, "penanda urut awal salah");
  tabel.props.onSort("stok");
  sama(kunjunganTerakhir(), {
    metode: "get",
    url: "/admin/stok",
    data: { urut: "stok_terbesar" },
    opsi: {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onStart: kunjunganTerakhir().opsi.onStart,
      onFinish: kunjunganTerakhir().opsi.onFinish,
      onError: kunjunganTerakhir().opsi.onError
    }
  }, "urut stok pertama bukan stok_terbesar");
  tabel = cari(
    renderPohon(Index, propsIndex({ filter: { q: null, status: "semua", kategori: null, urut: "stok_terbesar" } })),
    bernama("DataTable")
  );
  sama(tabel.props.sort, { key: "stok", dir: "desc" }, "penanda urut stok_terbesar salah");
  tabel.props.onSort("stok");
  sama(kunjunganTerakhir().data, { urut: "stok_terkecil" }, "urut kedua bukan stok_terkecil");
  tabel.props.onSort("produk");
  sama(kunjunganTerakhir().data, {}, "kembali ke urut nama harus tanpa query");
});
uji("A2 filter status, kategori, dan urutan lewat router.get literal", () => {
  bersihkan();
  const pohon = renderPohon(Index, propsIndex());
  kirimKejadian(cari(pohon, berid("filter-status")), "habis");
  sama(kunjunganTerakhir(), { metode: "get", url: "/admin/stok", data: { status: "habis" }, opsi: kunjunganTerakhir().opsi }, "filter status salah");
  kirimKejadian(cari(pohon, berid("filter-kategori")), "3");
  sama(kunjunganTerakhir().data, { kategori: "3" }, "filter kategori salah");
  kirimKejadian(cari(pohon, berid("filter-urut")), "stok_terkecil");
  sama(kunjunganTerakhir().data, { urut: "stok_terkecil" }, "filter urut salah");
  harus(
    cariSemua(pohon, bernama("Select")).every((el) => el.props.disabled === false),
    "select filter tidak boleh terkunci saat tidak memuat"
  );
});
uji("A3 pencarian menunggu debounce 300ms sebelum memanggil server", () => {
  const dipanggil = [];
  const cek = (tahap) => {
    if (!process.env.DEBUG_A3) return;
    console.log(`    [A3:${tahap}] dipanggil=${JSON.stringify(dipanggil)} text=${JSON.stringify(store.state["state#1"])} antre=${jam.antre.length} deps=${JSON.stringify(store.deps["efek#2"])}`);
  };
  let pohon = renderPohon(SearchInput, { value: "", onChange: (nilai) => dipanggil.push(nilai) });
  majukanWaktu();
  harus(dipanggil.length === 0, "debounce memanggil onChange di pass pertama");
  cek("pass1");
  kirimKejadian(cari(pohon, (el) => el.props?.type === "search"), "  batik  ");
  pohon = renderPohon(SearchInput, { value: "", onChange: (nilai) => dipanggil.push(nilai) });
  harus(dipanggil.length === 0, "onChange dipanggil sebelum 300ms");
  cek("setelah tik");
  const dijalankan = majukanWaktu();
  harus(dijalankan === 1, `timer debounce tidak dijalankan (${dijalankan})`);
  sama(dipanggil, ["batik"], "nilai pencarian tidak dirapikan");
  cek("setelah debounce1");
  const kotak = renderPohon(SearchInput, { value: "batik", onChange: (nilai) => dipanggil.push(nilai) });
  sama(cari(kotak, (el) => el.type === "input").props.value, "batik", "isian tidak menampilkan nilai terkirim");
  klik(cari(kotak, (el) => el.props?.["aria-label"] === "Bersihkan pencarian"));
  const kosong = renderPohon(SearchInput, { value: "batik", onChange: (nilai) => dipanggil.push(nilai) });
  sama(cari(kosong, (el) => el.type === "input").props.value, "", "tombol bersihkan tidak mengosongkan isian");
  harus(dipanggil.length === 1, "bersihkan memanggil server sebelum debounce selesai");
  majukanWaktu();
  sama(dipanggil, ["batik", ""], "nilai kosong tidak terkirim setelah debounce");
});
uji("A4 reset filter mengembalikan query ke kosong", () => {
  bersihkan();
  const pohon = renderPohon(
    Index,
    propsIndex({ filter: { q: "batik", status: "kritis", kategori: "3", urut: "stok_terbesar" } })
  );
  const tombol = cariSemua(pohon, bernama("Button")).find((el) => /Reset filter/i.test(teksPohon(el)));
  harus(Boolean(tombol), "tombol Reset filter tidak ada saat filter aktif");
  klik(tombol);
  sama(kunjunganTerakhir(), { metode: "get", url: "/admin/stok", data: {}, opsi: kunjunganTerakhir().opsi }, "reset filter tidak mengosongkan query");
});
uji("A5 memuat -> galat -> Coba lagi: tiga keadaan berbeda", () => {
  bersihkan();
  const pohon = renderPohon(Index, propsIndex());
  const sebelum = cari(pohon, bernama("DataTable"));
  harus(sebelum.props.loading === false && sebelum.props.error === null, "keadaan awal harus tenang");
  sebelum.props.onSort("stok");
  const opsiUrut = kunjunganTerakhir().opsi;
  opsiUrut.onStart();
  let kini = cari(renderPohon(Index, propsIndex()), bernama("DataTable"));
  harus(kini.props.loading === true, "onStart tidak menandai memuat");
  harus(Array.isArray(kini.props.rows) && kini.props.rows.length === 1, "baris tidak dipertahankan saat memuat");
  kendali.berikutnya.processing = false;
  opsiUrut.onError();
  opsiUrut.onFinish();
  kini = cari(renderPohon(Index, propsIndex()), bernama("DataTable"));
  harus(kini.props.error === "Gagal memuat daftar stok. Periksa koneksi lalu coba lagi.", "onError tidak mengisi pesan galat");
  harus(kini.props.loading === false, "galat harus mengakhiri keadaan memuat");
  const tabelGalat = cari(renderPohon(Index, propsIndex()), bernama("DataTable"));
  harus(typeof tabelGalat.props.onRetry === "function", "tidak ada aksi Coba lagi saat galat");
  const pohonGalat = renderPohon(DataTable, tabelGalat.props);
  harus(adaNilai(pohonGalat, "Gagal memuat daftar stok."), "pesan galat tidak tampil di tabel");
  harus(!teksPohon(pohonGalat).includes("Belum ada varian"), "galat tampil sebagai daftar kosong");
  tabelGalat.props.onRetry();
  harus(kunjunganTerakhir().url === "/admin/stok", "Coba lagi tidak memuat ulang halaman stok");
  kunjunganTerakhir().opsi.onStart();
  kini = cari(renderPohon(Index, propsIndex()), bernama("DataTable"));
  harus(kini.props.error === null, "galat tidak dibersihkan saat memuat ulang");
});
uji("A6 paginasi mengirim page hanya bila > 1", () => {
  bersihkan();
  const pohon = renderPohon(Index, propsIndex({ stok: paginator([barisIndex()], { last_page: 4, total: 52 }) }));
  const pager = cari(pohon, bernama("Pagination"));
  harus(Boolean(pager), "Pagination tidak dirender padahal last_page 4");
  pager.props.onPageChange(3);
  sama(kunjunganTerakhir().data, { page: 3 }, "page 3 tidak dikirim");
  pager.props.onPageChange(1);
  sama(kunjunganTerakhir().data, {}, "page 1 tidak boleh ikut query");
});
uji("A7 aksi baris membuka modal stok masuk/keluar dan modal Setel", () => {
  bersihkan();
  const pohon = renderPohon(Index, propsIndex());
  const kolom = cari(pohon, bernama("DataTable")).props.columns;
  const kolomAksi = kolom.find((k) => k.key === "aksi");
  const tombolMasuk = cari(kolomAksi.render(barisIndex()), (el) => /^Catat stok masuk/.test(el.props?.["aria-label"] ?? ""));
  harus(Boolean(tombolMasuk), "tombol Masuk tanpa nama aksesibilitas");
  klik(tombolMasuk);
  let modal = cari(renderPohon(Index, propsIndex()), bernama("StokAksiModal"));
  harus(modal.props.open === true, "modal tidak terbuka setelah klik Masuk");
  harus(modal.props.mode === "in", "mode modal bukan in");
  harus(modal.props.baris?.id === 12, "baris modal salah");
  const tombolKeluar = cari(kolomAksi.render(barisIndex()), (el) => /^Catat stok keluar/.test(el.props?.["aria-label"] ?? ""));
  klik(tombolKeluar);
  modal = cari(renderPohon(Index, propsIndex()), bernama("StokAksiModal"));
  harus(modal.props.mode === "out", "mode modal bukan out");
  const tombolSetel = cari(kolomAksi.render(barisIndex()), (el) => /^Setel stok/.test(el.props?.["aria-label"] ?? ""));
  klik(tombolSetel);
  const sesudah = renderPohon(Index, propsIndex());
  const modalSetel = cari(sesudah, (el) => bernama("Modal")(el) && el.props.title === "Setel stok");
  harus(modalSetel?.props.open === true, "modal Setel tidak terbuka");
  harus(String(modalSetel.props.description).includes("Daster Batik Kulot \u2014 L / Hitam"), "deskripsi modal Setel tidak memuat nama produk");
  const bukaForm = cari(modalSetel.props.footer, (el) => bernama("Button")(el) && el.props.href !== void 0);
  harus(bukaForm?.props.href === "/admin/produk/7/ubah", "tautan form produk salah");
  harus(teksPohon(modalSetel.props.footer).includes("Buka form produk"), "tombol Buka form produk hilang");
  harus(teksPohon(modalSetel).includes("penyesuaian"), "penjelasan penyesuaian hilang dari modal Setel");
});
var modalDari = (pohon, judul) => cari(pohon, (el) => bernama("Modal")(el) && el.props.title === judul);
var modalProps = (ubah = {}) => ({
  open: true,
  mode: "in",
  baris: barisIndex(),
  onClose: null,
  ...ubah
});
var simpanDari = (modal) => cari(modal.props.footer, (el) => bernama("Button")(el) && el.props.form === "form-stok-aksi");
var medanDari = (pohon, htmlFor) => cari(pohon, (el) => bernama("Field")(el) && el.props.htmlFor === htmlFor);
var isiDanKirim = (pohon, qty, note = null) => {
  kirimKejadian(cari(pohon, berid("stok-aksi-qty")), qty);
  if (note !== null) kirimKejadian(cari(pohon, berid("stok-aksi-note")), note);
  poskan(cari(pohon, (el) => el.type === "form"));
};
uji("B1 validasi klien: pesan per kondisi, tanpa memanggil server", () => {
  const kasus = [
    ["", "Jumlah wajib diisi."],
    ["0", "Jumlah minimal 1."],
    ["abc", "Jumlah minimal 1."],
    ["2.5", "Jumlah minimal 1."],
    ["100001", "Jumlah maksimal 100.000."]
  ];
  kasus.forEach(([nilai, pesan]) => {
    bersihkanStore();
    bersihkan();
    isiDanKirim(renderPohon(StokAksiModal, modalProps()), nilai);
    harus(kendali.kunjungan.length === 0, `qty "${nilai}" tetap dikirim ke server`);
    sama(medanDari(renderPohon(StokAksiModal, modalProps()), "stok-aksi-qty").props.error, pesan, `pesan untuk qty "${nilai}" salah`);
    sama(cari(renderPohon(StokAksiModal, modalProps()), berid("stok-aksi-qty")).props.error, pesan, "Input tidak menerima galat dari Field");
  });
});
uji("B2 kirim sah: URL literal, data form, opsi Inertia, tutup saat sukses", () => {
  let ditutup = 0;
  const props = () => modalProps({ onClose: () => ditutup += 1 });
  isiDanKirim(renderPohon(StokAksiModal, props()), "5", "Kiriman supplier");
  const kirim = kunjunganTerakhir();
  harus(kirim.metode === "post", "aksi stok bukan POST");
  harus(kirim.url === "/admin/stok/12/masuk", `URL masuk salah: ${kirim.url}`);
  sama(kirim.data, { qty: "5", note: "Kiriman supplier" }, "data form tidak sesuai");
  harus(kirim.opsi.preserveState === true, "modal harus tetap terbuka saat server menolak (preserveState)");
  harus(kirim.opsi.preserveScroll === true, "preserveScroll hilang");
  harus(ditutup === 0, "modal ditutup sebelum server menjawab");
  const modal = modalDari(renderPohon(StokAksiModal, props()), "Catat stok masuk");
  harus(modal !== null, "judul modal masuk hilang");
  harus(teksPohon(modal.props.footer).includes("Simpan stok masuk"), "tombol simpan masuk hilang");
  harus(simpanDari(modal)?.props.type === "submit", "tombol simpan bukan type submit");
  harus(teksPohon(modal.props.footer).includes("Batal"), "tombol Batal hilang");
  harus(String(modal.props.description).includes("stok tercatat saat ini 9"), "deskripsi stok masuk salah");
  kirim.opsi.onSuccess();
  harus(ditutup === 1, "modal tidak ditutup setelah sukses");
});
uji("B3 mode keluar: URL keluar, judul, hint stok saat ini, dan tombolnya", () => {
  const props = () => modalProps({ mode: "out", baris: barisIndex({ stock: 3 }) });
  const pohon = renderPohon(StokAksiModal, props());
  const modal = modalDari(pohon, "Catat stok keluar");
  harus(modal !== null, "judul modal keluar hilang");
  harus(String(modal.props.description).includes("stok tercatat saat ini 3"), "stok saat ini tidak ditampilkan di deskripsi");
  harus(teksPohon(modal.props.footer).includes("Simpan stok keluar"), "tombol simpan keluar hilang");
  const medan = medanDari(pohon, "stok-aksi-qty");
  harus(String(medan.props.hint).includes("Stok tercatat saat ini 3."), `hint stok keluar salah: ${medan.props.hint}`);
  isiDanKirim(renderPohon(StokAksiModal, props()), "2");
  harus(kunjunganTerakhir().url === "/admin/stok/12/keluar", `URL keluar salah: ${kunjunganTerakhir().url}`);
  sama(kunjunganTerakhir().data, { qty: "2", note: "" }, "data keluar salah");
});
uji("B4 jumlah dikirim sekali saja saat server masih memproses", () => {
  kendali.berikutnya.processing = true;
  const pohon = renderPohon(StokAksiModal, modalProps());
  const simpan = simpanDari(modalDari(pohon, "Catat stok masuk"));
  harus(simpan.props.loading === true, "tombol tidak menampilkan keadaan memproses");
  isiDanKirim(pohon, "5");
  harus(kendali.kunjungan.length === 0, "kirim ganda saat processing tidak dicegah");
});
uji("B5 varian null: tombol simpan mati dan tidak ada URL /null/", () => {
  const props = () => modalProps({ baris: null });
  const modal = modalDari(renderPohon(StokAksiModal, props()), "Catat stok masuk");
  harus(simpanDari(modal)?.props.disabled === true, "tombol simpan tetap aktif tanpa varian");
  harus(String(modal.props.description) === "", "deskripsi harus kosong tanpa varian");
  isiDanKirim(renderPohon(StokAksiModal, props()), "5");
  harus(kendali.kunjungan.length === 0, "varian null tetap mengirim permintaan");
});
uji("B6 galat server per kolom terhubung aria-describedby, galat lain jadi notice", () => {
  const pesan = "Stok tidak cukup \u2014 stok saat ini 1.";
  renderPohon(StokAksiModal, modalProps({ baris: barisIndex({ stock: 1 }) }));
  kendali.formulir[0].errors = { qty: pesan };
  const pohon = renderPohon(StokAksiModal, modalProps({ baris: barisIndex({ stock: 1 }) }));
  if (process.env.DEBUG_B6) {
    console.log(`    [B6] pass=${store.pass} berikutnya=${JSON.stringify(kendali.berikutnya.errors)} formulir=${JSON.stringify(kendali.formulir[0]?.errors)} data=${JSON.stringify(kendali.formulir[0]?.data)}`);
    console.log(`    [B6] field=${JSON.stringify(cariSemua(pohon, bernama("Field")).map((el) => [el.props.htmlFor, el.props.error, el.props.hint]))}`);
    console.log(`    [B6] input=${JSON.stringify(cari(pohon, berid("stok-aksi-qty"))?.props)}`);
  }
  sama(medanDari(pohon, "stok-aksi-qty").props.error, pesan, "Field tidak menerima galat qty");
  sama(cari(pohon, berid("stok-aksi-qty")).props.error, pesan, "Input tidak menerima galat qty");
  const fieldJadi = renderPohon(Field, medanDari(pohon, "stok-aksi-qty").props);
  harus(teksPohon(fieldJadi).includes(pesan), "pesan galat tidak dirender Field");
  harus(cari(fieldJadi, (el) => el.props?.role === "alert") !== null, "galat Field tanpa role=alert");
  harus(cari(fieldJadi, (el) => el.props?.id === "stok-aksi-qty-error") !== null, "elemen galat tanpa id stok-aksi-qty-error");
  const fieldQty = cariSemua(pohon, bernama("Field")).find((el) => el.props.htmlFor === "stok-aksi-qty");
  harus(fieldQty !== void 0, "Field qty tidak dirender");
  harus(
    fieldQty.props.label === "Jumlah" && fieldQty.props.required === true,
    `label atau penanda wajib hilang saat galat (label=${JSON.stringify(fieldQty.props.label)} required=${JSON.stringify(fieldQty.props.required)})`
  );
  const inputJadi = cari(renderPohon(Input, cari(pohon, berid("stok-aksi-qty")).props), (el) => el.type === "input");
  harus(inputJadi.props["aria-invalid"] === "true", "input galat tanpa aria-invalid");
  sama(inputJadi.props["aria-describedby"], "stok-aksi-qty-error", "input galat tanpa aria-describedby yang benar");
  harus(inputJadi.props.min === 1 && inputJadi.props.max === 1e5, "batas min/max qty hilang");
  harus(inputJadi.props.inputMode === "numeric", "inputMode numeric hilang");
  kendali.formulir[0].errors = { stok: "Varian tidak aktif." };
  const pohonLain = renderPohon(StokAksiModal, modalProps());
  harus(teksPohon(pohonLain).includes("Varian tidak aktif."), "galat non-kolom tidak tampil");
  const noticeGalat = cariSemua(pohonLain, bernama("InlineNotice"));
  harus(
    noticeGalat.some((el) => el.props.tone === "error" && el.props.title === "Perubahan stok gagal disimpan"),
    "judul notice galat hilang"
  );
});
uji("C1 filter riwayat: tipe, varian, dan reset", () => {
  bersihkan();
  const pohon = renderPohon(History, propsHistory());
  harus(teksPohon(cari(pohon, berid("riwayat-varian"))).includes("Daster Batik Kulot \u2014 L / Hitam"), "opsi varian salah");
  kirimKejadian(cari(pohon, berid("riwayat-tipe")), "adjust");
  sama(kunjunganTerakhir().data, { tipe: "adjust" }, "filter tipe salah");
  kirimKejadian(cari(pohon, berid("riwayat-varian")), "12");
  sama(kunjunganTerakhir().data, { varian: "12" }, "filter varian salah");
  const denganFilter = renderPohon(History, propsHistory({ filter: { q: "batik", tipe: "out", varian: "12" } }));
  const tombol = cariSemua(denganFilter, bernama("Button")).find((el) => /Reset filter/i.test(teksPohon(el)));
  harus(Boolean(tombol), "tombol Reset filter riwayat tidak ada");
  klik(tombol);
  sama(kunjunganTerakhir(), { metode: "get", url: "/admin/stok/riwayat", data: {}, opsi: kunjunganTerakhir().opsi }, "reset filter riwayat salah");
});
uji("C2 galat riwayat tidak menyamar sebagai riwayat kosong + Coba lagi", () => {
  bersihkan();
  const pohon = renderPohon(History, propsHistory());
  const tabel = cari(pohon, bernama("DataTable"));
  harus(tabel.props.onSort === void 0, "riwayat tidak boleh punya tombol urut (kontrak \xA712.15)");
  kirimKejadian(cari(pohon, berid("riwayat-tipe")), "in");
  const opsi = kunjunganTerakhir().opsi;
  opsi.onStart();
  let kini = cari(renderPohon(History, propsHistory()), bernama("DataTable"));
  harus(kini.props.loading === true, "onStart riwayat tidak menandai memuat");
  opsi.onError();
  opsi.onFinish();
  kini = cari(renderPohon(History, propsHistory()), bernama("DataTable"));
  harus(kini.props.error === "Gagal memuat riwayat stok. Periksa koneksi lalu coba lagi.", "pesan galat riwayat salah");
  const tabelRiwayat = cari(renderPohon(History, propsHistory()), bernama("DataTable"));
  harus(typeof tabelRiwayat.props.onRetry === "function", "tidak ada aksi Coba lagi saat galat riwayat");
  const pohonRiwayat = renderPohon(DataTable, tabelRiwayat.props);
  if (process.env.DEBUG_C2) {
    console.log(
      `    [C2] error=${JSON.stringify(tabelRiwayat.props.error)} retry=${typeof tabelRiwayat.props.onRetry} kosong=${JSON.stringify(tabelRiwayat.props.emptyTitle)} loading=${tabelRiwayat.props.loading}`
    );
  }
  harus(adaNilai(pohonRiwayat, "Gagal memuat riwayat stok."), "galat riwayat tidak tampil");
  harus(!teksPohon(pohonRiwayat).includes("Belum ada pergerakan stok"), "galat riwayat tampil sebagai riwayat kosong");
  tabelRiwayat.props.onRetry();
  harus(kunjunganTerakhir().url === "/admin/stok/riwayat", "Coba lagi riwayat salah URL");
});
uji("C3 pencarian riwayat ikut debounce dan memakai query q", () => {
  const pohon = renderPohon(History, propsHistory());
  const kotak = cari(pohon, bernama("SearchInput"));
  harus(kotak !== null, "SearchInput tidak dirender riwayat");
  harus(kotak.props.placeholder === "Cari nama produk, SKU, atau catatan", `placeholder pencarian riwayat salah: ${kotak.props.placeholder}`);
  harus(kotak.props.value === "", `kotak pencarian harus kosong saat tanpa filter: ${kotak.props.value}`);
  const isian = cari(renderPohon(SearchInput, kotak.props), (el) => el.type === "input");
  kirimKejadian(isian, "batik");
  renderPohon(SearchInput, kotak.props);
  const dijalankan = majukanWaktu();
  harus(dijalankan >= 1, `timer debounce riwayat tidak dijalankan (${dijalankan})`);
  harus(kunjunganTerakhir().url === "/admin/stok/riwayat", `pencarian riwayat salah URL: ${kunjunganTerakhir().url}`);
  sama(kunjunganTerakhir().data, { q: "batik" }, "pencarian riwayat tidak memakai query q");
});
console.log("=== UJI INTERAKSI kartu t_321bf03c ===");
hasil.forEach((item) => {
  console.log(`${item.lulus ? "[OK]  " : "[GAGAL]"} ${item.nama}${item.lulus ? "" : ` -> ${item.pesan}`}`);
});
var gagal = hasil.filter((item) => !item.lulus).length;
console.log(`
TOTAL: ${hasil.length} uji, ${gagal} gagal`);
process.exitCode = gagal === 0 ? 0 : 1;
