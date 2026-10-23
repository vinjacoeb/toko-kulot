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

// resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx
var asText = (nilai) => nilai === null || nilai === void 0 ? "" : String(nilai);
function SyncPaymentButton({ pesananId = null, onHasilSinkron = null }) {
  const form = useForm({});
  const [hasil2, setHasil] = useState(null);
  const id = asText(pesananId).trim();
  if (id === "") {
    return null;
  }
  const sinkronkan = () => {
    if (form.processing) {
      return;
    }
    setHasil(null);
    form.patch(`/admin/pesanan/${encodeURIComponent(id)}/sinkron-pembayaran`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (halaman) => {
        const flashHalaman = halaman?.props?.flash ?? {};
        const sukses = asText(flashHalaman.success);
        const galat = asText(flashHalaman.error);
        if (sukses !== "") {
          setHasil({ tone: "success", pesan: sukses });
        } else if (galat !== "") {
          setHasil({ tone: "error", pesan: galat });
        }
        if ((sukses !== "" || galat !== "") && onHasilSinkron) {
          onHasilSinkron(`${sukses}|${galat}`);
        }
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
      Button,
      {
        variant: "secondary",
        className: "min-w-[16rem]",
        loading: form.processing,
        onClick: sinkronkan,
        children: "Sinkronkan status pembayaran"
      }
    ) }),
    hasil2 !== null && /* @__PURE__ */ jsx(InlineNotice, { tone: hasil2.tone, children: hasil2.pesan })
  ] });
}

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

// resources/js/Components/StatusBadge.jsx
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
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase",
        CLASSES[tone?.token ?? "neutral"],
        className
      ),
      children: text
    }
  );
}

// resources/js/Components/Toast.jsx
var TONES3 = {
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
  const config = TONES3[tone] ?? TONES3.info;
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

// resources/js/Pages/Admin/Orders/partials/KartuBagian.jsx
function KartuBagian({ title = "", description = null, actions = null, children = null, className = "" }) {
  return /* @__PURE__ */ jsxs("section", { className: cn("flex flex-col gap-4 rounded-lg border border-line bg-white p-6", className), children: [
    (title !== "" || actions) && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        title !== "" && /* @__PURE__ */ jsx("h2", { className: "text-h3 text-ink", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-meta text-slate-600", children: description })
      ] }),
      actions
    ] }),
    children
  ] });
}

// resources/js/lib/qr.js
var EC_LEVEL_BITS = 1;
var RS_BLOCKS = {
  1: [26, 7, [[1, 19]]],
  2: [44, 10, [[1, 34]]],
  3: [70, 15, [[1, 55]]],
  4: [100, 20, [[1, 80]]],
  5: [134, 26, [[1, 108]]],
  6: [172, 18, [[2, 68]]],
  7: [196, 20, [[2, 78]]],
  8: [242, 24, [[2, 97]]],
  9: [292, 30, [[2, 116]]],
  10: [346, 18, [[2, 68], [2, 69]]],
  11: [404, 20, [[4, 81]]],
  12: [466, 24, [[2, 92], [2, 93]]],
  13: [532, 26, [[4, 107]]],
  14: [581, 30, [[3, 115], [1, 116]]],
  15: [655, 22, [[5, 87], [1, 88]]],
  16: [733, 24, [[5, 98], [1, 99]]],
  17: [815, 28, [[1, 107], [5, 108]]],
  18: [901, 30, [[5, 120], [1, 121]]],
  19: [991, 28, [[3, 113], [4, 114]]],
  20: [1085, 28, [[3, 107], [5, 108]]]
};
var ALIGN = {
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
  11: [6, 30, 54],
  12: [6, 32, 58],
  13: [6, 34, 62],
  14: [6, 26, 46, 66],
  15: [6, 26, 48, 70],
  16: [6, 26, 50, 74],
  17: [6, 30, 54, 78],
  18: [6, 30, 56, 82],
  19: [6, 30, 58, 86],
  20: [6, 34, 62, 90]
};
var EXP = new Uint8Array(512);
var LOG = new Uint8Array(256);
(function initGalois() {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 285;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
})();
var gfMul = (a, b) => a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
function rsGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}
function rsRemainder(data, generator) {
  const res = new Array(generator.length - 1).fill(0);
  data.forEach((byte) => {
    const factor = byte ^ res[0];
    res.shift();
    res.push(0);
    for (let i = 0; i < res.length; i += 1) res[i] ^= gfMul(generator[i + 1], factor);
  });
  return res;
}
var lengthBits = (version) => version < 10 ? 8 : 16;
function dataCodewords(version) {
  const [, , groups] = RS_BLOCKS[version];
  return groups.reduce((sum, [count, per]) => sum + count * per, 0);
}
function byteCapacity(version) {
  return Math.floor((dataCodewords(version) * 8 - 4 - lengthBits(version)) / 8);
}
function pickVersion(byteLength) {
  for (let version = 1; version <= 20; version += 1) {
    if (byteCapacity(version) >= byteLength) return version;
  }
  return null;
}
function toCodewords(bytes, version) {
  const bits = [];
  const push = (value, length) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push(value >> i & 1);
  };
  push(4, 4);
  push(bytes.length, lengthBits(version));
  bytes.forEach((byte) => push(byte, 8));
  const capacity = dataCodewords(version) * 8;
  push(0, Math.min(4, capacity - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);
  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((acc, bit) => acc << 1 | bit, 0));
  }
  let padToggle = true;
  while (codewords.length < dataCodewords(version)) {
    codewords.push(padToggle ? 236 : 17);
    padToggle = !padToggle;
  }
  return codewords;
}
function interleave(codewords, version) {
  const [, eccPerBlock, groups] = RS_BLOCKS[version];
  const generator = rsGenerator(eccPerBlock);
  const blocks = [];
  let offset = 0;
  groups.forEach(([count, per]) => {
    for (let i = 0; i < count; i += 1) {
      blocks.push(codewords.slice(offset, offset + per));
      offset += per;
    }
  });
  const eccBlocks = blocks.map((block) => rsRemainder(block, generator));
  const out = [];
  const maxData = Math.max(...blocks.map((b) => b.length));
  for (let i = 0; i < maxData; i += 1) {
    blocks.forEach((block) => {
      if (i < block.length) out.push(block[i]);
    });
  }
  for (let i = 0; i < eccPerBlock; i += 1) {
    eccBlocks.forEach((block) => out.push(block[i]));
  }
  return out;
}
var MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => r * c % 2 + r * c % 3 === 0,
  (r, c) => (r * c % 2 + r * c % 3) % 2 === 0,
  (r, c) => ((r + c) % 2 + r * c % 3) % 2 === 0
];
function formatBits(mask) {
  const data = EC_LEVEL_BITS << 3 | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) rem = rem << 1 ^ (rem >>> 9) * 1335;
  return ((data << 10 | rem) ^ 21522) & 32767;
}
function versionBits(version) {
  let rem = version;
  for (let i = 0; i < 12; i += 1) rem = rem << 1 ^ (rem >>> 11) * 7973;
  return (version << 12 | rem) & 262143;
}
function placeholderMatrix(version) {
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => new Array(size).fill(false));
  const fixed = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (row, col, dark) => {
    modules[row][col] = dark;
    fixed[row][col] = true;
  };
  const finder = (row0, col0) => {
    for (let dr = -1; dr <= 7; dr += 1) {
      for (let dc = -1; dc <= 7; dc += 1) {
        const row = row0 + dr;
        const col = col0 + dc;
        if (row < 0 || col < 0 || row >= size || col >= size) continue;
        const dark = dr >= 0 && dr <= 6 && (dc === 0 || dc === 6) || dc >= 0 && dc <= 6 && (dr === 0 || dr === 6) || dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        set(row, col, dark);
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  for (let i = 8; i < size - 8; i += 1) {
    if (!fixed[6][i]) set(6, i, i % 2 === 0);
    if (!fixed[i][6]) set(i, 6, i % 2 === 0);
  }
  const centers = ALIGN[version] || [];
  const last = centers.length - 1;
  centers.forEach((row, i) => {
    centers.forEach((col, j) => {
      if (i === 0 && j === 0 || i === 0 && j === last || i === last && j === 0) return;
      for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          set(row + dr, col + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
        }
      }
    });
  });
  set(size - 8, 8, true);
  const reserve = (row, col) => {
    if (!fixed[row][col]) set(row, col, false);
  };
  for (let i = 0; i < 9; i += 1) {
    reserve(8, i);
    reserve(i, 8);
  }
  for (let i = 0; i < 8; i += 1) {
    reserve(8, size - 1 - i);
    reserve(size - 1 - i, 8);
  }
  if (version >= 7) {
    const bits = versionBits(version);
    for (let i = 0; i < 18; i += 1) {
      const dark = (bits >> i & 1) === 1;
      const row = Math.floor(i / 3);
      const col = size - 11 + i % 3;
      reserve(row, col);
      reserve(col, row);
      set(row, col, dark);
      set(col, row, dark);
    }
  }
  return { size, modules, fixed };
}
function placeData({ size, modules, fixed }, codewords) {
  const totalBits = codewords.length * 8;
  const bitAt = (index2) => index2 < totalBits ? (codewords[index2 >> 3] >> 7 - (index2 & 7) & 1) === 1 : false;
  let index = 0;
  for (let col = size - 1; col > 0; col -= 2) {
    const upward = (size - 1 - col) / 2 % 2 === 0;
    for (let i = 0; i < size; i += 1) {
      const row = upward ? size - 1 - i : i;
      for (let k = 0; k < 2; k += 1) {
        const c = col - k;
        if (fixed[row][c]) continue;
        modules[row][c] = bitAt(index);
        index += 1;
      }
    }
  }
}
function applyMask({ modules, fixed }, mask) {
  const fn = MASKS[mask];
  for (let row = 0; row < modules.length; row += 1) {
    for (let col = 0; col < modules.length; col += 1) {
      if (!fixed[row][col] && fn(row, col)) modules[row][col] = !modules[row][col];
    }
  }
}
function writeFormat({ size, modules, fixed }, mask) {
  const bits = formatBits(mask);
  const bit = (i) => (bits >> i & 1) === 1;
  const set = (row, col, dark) => {
    modules[row][col] = dark;
    fixed[row][col] = true;
  };
  for (let i = 0; i <= 5; i += 1) set(i, 8, bit(i));
  set(7, 8, bit(6));
  set(8, 8, bit(7));
  set(8, 7, bit(8));
  for (let i = 9; i < 15; i += 1) set(8, 14 - i, bit(i));
  for (let i = 0; i < 8; i += 1) set(8, size - 1 - i, bit(i));
  for (let i = 8; i < 15; i += 1) set(size - 15 + i, 8, bit(i));
  set(size - 8, 8, true);
}
function penalty(modules) {
  const size = modules.length;
  let score = 0;
  for (let row = 0; row < size; row += 1) {
    let run = 1;
    for (let col = 1; col < size; col += 1) {
      if (modules[row][col] === modules[row][col - 1]) {
        run += 1;
        if (run === 5) score += 3;
        else if (run > 5) score += 1;
      } else run = 1;
    }
  }
  for (let col = 0; col < size; col += 1) {
    let run = 1;
    for (let row = 1; row < size; row += 1) {
      if (modules[row][col] === modules[row - 1][col]) {
        run += 1;
        if (run === 5) score += 3;
        else if (run > 5) score += 1;
      } else run = 1;
    }
  }
  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const v = modules[row][col];
      if (v === modules[row][col + 1] && v === modules[row + 1][col] && v === modules[row + 1][col + 1]) {
        score += 3;
      }
    }
  }
  const pattern = [true, false, true, true, true, false, true];
  const matches = (line, start) => {
    for (let i = 0; i < 7; i += 1) if (line[start + i] !== pattern[i]) return false;
    const before = start - 1 >= 0 ? line[start - 1] : null;
    const after = start + 7 < line.length ? line[start + 7] : null;
    return before !== true && after !== true;
  };
  const scanLine = (line) => {
    for (let i = 0; i + 7 <= line.length; i += 1) if (matches(line, i)) score += 40;
  };
  for (let row = 0; row < size; row += 1) scanLine(modules[row]);
  for (let col = 0; col < size; col += 1) scanLine(modules.map((row) => row[col]));
  let dark = 0;
  modules.forEach((row) => row.forEach((v) => {
    if (v) dark += 1;
  }));
  const percent = dark * 100 / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return score;
}
function qrMatrix(value) {
  const text = String(value ?? "");
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = pickVersion(bytes.length);
  if (version === null) {
    throw new Error("QrCode: muatan melebihi kapasitas versi 20 level L (858 byte).");
  }
  const base = placeholderMatrix(version);
  placeData(base, interleave(toCodewords(bytes, version), version));
  let best = null;
  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = {
      size: base.size,
      modules: base.modules.map((row) => row.slice()),
      fixed: base.fixed.map((row) => row.slice())
    };
    applyMask(candidate, mask);
    writeFormat(candidate, mask);
    const score = penalty(candidate.modules);
    if (best === null || score < best.score) best = { score, mask, modules: candidate.modules };
  }
  return { size: base.size, modules: best.modules, version, mask: best.mask };
}
function qrPath(matrix) {
  const { size, modules } = matrix;
  let d = "";
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (modules[row][col]) d += `M${col} ${row}h1v1h-1z`;
    }
  }
  return d;
}

// resources/js/Components/QrCode.jsx
function QrCode({ value = "", size = 240, label = "Kode QR pembayaran", className = "" }) {
  const matrix = useMemo(() => {
    if (!value) return null;
    try {
      return qrMatrix(value);
    } catch (error) {
      return null;
    }
  }, [value]);
  if (!matrix) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className,
        style: { width: size, height: size },
        role: "img",
        "aria-label": "Kode QR belum tersedia"
      }
    );
  }
  const total = matrix.size;
  const path = qrPath(matrix);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      className,
      viewBox: `0 0 ${total} ${total}`,
      width: size,
      height: size,
      role: "img",
      "aria-label": label,
      shapeRendering: "crispEdges",
      children: [
        /* @__PURE__ */ jsx("rect", { width: total, height: total, fill: "#ffffff" }),
        /* @__PURE__ */ jsx("path", { d: path, fill: "#111827" })
      ]
    }
  );
}

// resources/js/Pages/Admin/Orders/partials/BuktiPembayaran.jsx
var asText2 = (value) => value === null || value === void 0 ? "" : String(value);
var uang = (value) => rupiah(value) ?? "-";
var baris = (label, nilai, kunci) => /* @__PURE__ */ jsxs(
  "div",
  {
    className: "flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-b-0",
    children: [
      /* @__PURE__ */ jsx("dt", { className: "text-meta text-slate-600", children: label }),
      /* @__PURE__ */ jsx("dd", { className: "min-w-0 break-words text-right text-body text-ink", children: nilai })
    ]
  },
  kunci ?? label
);
function BuktiPembayaran({ payment = null, paymentLabel = null }) {
  const [gambarGagal, setGambarGagal] = useState(false);
  if (payment === null || payment === void 0) {
    return /* @__PURE__ */ jsx(InlineNotice, { tone: "info", title: "Belum ada data pembayaran", children: "Pesanan ini belum punya baris pembayaran di server, jadi kode QR dan ID transaksi belum tersedia." });
  }
  const qrString = asText2(payment.qr_string);
  const qrisUrl = asText2(payment.qris_url);
  const lunas = asText2(payment.status) === "settlement";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
    lunas && /* @__PURE__ */ jsxs(InlineNotice, { tone: "success", title: "Pembayaran lunas", children: [
      "Server mencatat pembayaran diterima pada ",
      formatDateTime(payment.paid_at),
      "."
    ] }),
    qrString !== "" ? /* @__PURE__ */ jsx("div", { className: "flex justify-center rounded-md border border-line bg-white p-4", children: /* @__PURE__ */ jsx(QrCode, { value: qrString, size: 200, label: "Kode QR pembayaran pesanan" }) }) : qrisUrl !== "" && !gambarGagal ? /* @__PURE__ */ jsx("div", { className: "flex justify-center rounded-md border border-line bg-white p-4", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: qrisUrl,
        alt: "Gambar kode QR pembayaran dari penyedia",
        width: 200,
        height: 200,
        className: "h-[200px] w-[200px] object-contain",
        onError: () => setGambarGagal(true)
      }
    ) }) : qrisUrl !== "" && gambarGagal ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 rounded-md border border-line bg-white p-6 text-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-slate-500", "aria-hidden": "true", children: /* @__PURE__ */ jsx(ImageOffIcon, { size: 28 }) }),
      /* @__PURE__ */ jsx("p", { className: "text-meta text-slate-600", children: "Gambar QR dari penyedia pembayaran gagal dimuat. Buka pesanan ini lagi untuk mencoba ulang." })
    ] }) : /* @__PURE__ */ jsx(InlineNotice, { tone: "warning", title: "Kode QR belum tersedia", children: "Penyedia pembayaran belum mengirim tautan gambar maupun isi kode QR untuk pesanan ini." }),
    /* @__PURE__ */ jsxs("dl", { className: "flex flex-col", children: [
      baris(
        "Status pembayaran",
        /* @__PURE__ */ jsx(StatusBadge, { status: payment.status, label: asText2(paymentLabel) || null })
      ),
      baris("Penyedia", asText2(payment.provider) || "-"),
      baris("ID transaksi", asText2(payment.transaction_id) || "-"),
      baris("Jumlah", uang(payment.gross_amount)),
      baris("Kedaluwarsa", formatDateTime(payment.expires_at)),
      baris("Dibayar", formatDateTime(payment.paid_at))
    ] })
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

// resources/js/Pages/Admin/Orders/partials/InfoResi.jsx
var BATAS_RESI = 60;
var ID_INPUT = "resi-pesanan";
var asText3 = (nilai) => nilai === null || nilai === void 0 ? "" : String(nilai);
function InfoResi({ pesanan = null }) {
  const id = pesanan?.id ?? null;
  const tersimpan = asText3(pesanan?.tracking_number);
  const galat = usePage().props.errors?.tracking_number ?? null;
  const [nilai, setNilai] = useState(tersimpan);
  const [proses, setProses] = useState(false);
  useEffect(() => {
    setNilai(asText3(pesanan?.tracking_number));
  }, [pesanan?.id, pesanan?.tracking_number]);
  if (id === null) {
    return null;
  }
  const kirim = (event) => {
    event.preventDefault();
    if (proses) {
      return;
    }
    router.patch(
      `/admin/pesanan/${id}/resi`,
      { tracking_number: nilai },
      {
        preserveScroll: true,
        onStart: () => setProses(true),
        onFinish: () => setProses(false)
      }
    );
  };
  return /* @__PURE__ */ jsxs("form", { className: "flex flex-col gap-4", onSubmit: kirim, noValidate: true, children: [
    /* @__PURE__ */ jsx(
      Field,
      {
        label: "Nomor resi",
        htmlFor: ID_INPUT,
        hint: "Isi nomor resi dari ekspedisi setelah paket dikirim. Kosongkan untuk menghapus.",
        error: galat,
        children: /* @__PURE__ */ jsx(
          Input,
          {
            id: ID_INPUT,
            name: "tracking_number",
            type: "text",
            maxLength: BATAS_RESI,
            autoComplete: "off",
            value: nilai,
            error: galat,
            onChange: (event) => setNilai(event.target.value)
          }
        )
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "text-meta text-slate-500", children: tersimpan === "" ? "Belum ada nomor resi." : `Tersimpan: ${tersimpan}` }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Button, { variant: "primary", type: "submit", loading: proses, children: "Simpan resi" }) })
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

// resources/js/Pages/Admin/Orders/partials/UbahStatusModal.jsx
var batasCatatan = 255;
function UbahStatusModal({
  open = false,
  pesanan = null,
  statusBerikut = [],
  onClose = () => {
  }
}) {
  const pilihan = Array.isArray(statusBerikut) ? statusBerikut : [];
  const id = pesanan?.id ?? null;
  const [galatLokal, setGalatLokal] = useState(null);
  const form = useForm({ status: "", note: "" });
  useEffect(() => {
    if (open) {
      form.clearErrors();
      form.setData({ status: "", note: "" });
      setGalatLokal(null);
    }
  }, [open]);
  if (id === null) return null;
  const terpilih = pilihan.find((item) => item?.value === form.data.status) ?? null;
  const jadiBatal = form.data.status === "batal";
  const jadiDibayar = form.data.status === "dibayar" && !pesanan?.paid_at;
  const galatLain = Object.entries(form.errors).filter(
    ([kunci]) => kunci !== "status" && kunci !== "note"
  );
  const kirim = () => {
    if (form.data.status === "") {
      setGalatLokal("Status pesanan wajib dipilih.");
      return;
    }
    setGalatLokal(null);
    form.patch(`/admin/pesanan/${id}/status`, {
      preserveScroll: true,
      onSuccess: () => onClose()
    });
  };
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      title: "Ubah status pesanan",
      onClose: () => {
        if (!form.processing) onClose();
      },
      footer: /* @__PURE__ */ jsxs(Fragment2, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onClose, disabled: form.processing, children: "Batal" }),
        /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: kirim, loading: form.processing, children: "Simpan status" })
      ] }),
      children: /* @__PURE__ */ jsxs(
        "form",
        {
          className: "flex flex-col gap-4",
          onSubmit: (event) => {
            event.preventDefault();
            kirim();
          },
          children: [
            /* @__PURE__ */ jsxs("p", { className: "text-body text-slate-600", children: [
              "Status saat ini",
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink", children: pesanan?.status_label ? String(pesanan.status_label) : "-" }),
              ". Pilih status baru lalu simpan."
            ] }),
            /* @__PURE__ */ jsx(
              Field,
              {
                label: "Status baru",
                htmlFor: "status-pesanan",
                required: true,
                hint: "Hanya status lanjutan yang sah yang bisa dipilih.",
                error: galatLokal ?? form.errors.status ?? null,
                children: /* @__PURE__ */ jsxs(
                  Select,
                  {
                    id: "status-pesanan",
                    value: form.data.status,
                    onChange: (event) => form.setData("status", event.target.value),
                    error: galatLokal ?? form.errors.status ?? null,
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Pilih status" }),
                      pilihan.map((item, index) => /* @__PURE__ */ jsx("option", { value: item?.value ?? "", children: item?.label ?? item?.value ?? "-" }, `${item?.value ?? "status"}-${index}`))
                    ]
                  }
                )
              }
            ),
            terpilih && terpilih.value !== "" && /* @__PURE__ */ jsxs(InlineNotice, { tone: "info", title: "Status yang dipilih", children: [
              "Pesanan akan menjadi",
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink", children: String(terpilih.label ?? terpilih.value) }),
              "."
            ] }),
            jadiBatal && /* @__PURE__ */ jsx(InlineNotice, { tone: "warning", title: "Membatalkan mengembalikan stok", children: "Status batal mengembalikan stok setiap item pesanan ini (satu pergerakan stok masuk per varian)." }),
            jadiDibayar && /* @__PURE__ */ jsx(InlineNotice, { tone: "info", title: "Waktu pembayaran diisi otomatis", children: "Waktu pembayaran akan diisi sekarang karena pesanan ini belum punya waktu pembayaran." }),
            /* @__PURE__ */ jsx(
              Field,
              {
                label: "Catatan",
                htmlFor: "catatan-status",
                hint: `Opsional, maksimal ${batasCatatan} karakter.`,
                error: form.errors.note ?? null,
                children: /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    id: "catatan-status",
                    rows: 3,
                    maxLength: batasCatatan,
                    value: form.data.note,
                    onChange: (event) => form.setData("note", event.target.value),
                    error: form.errors.note ?? null
                  }
                )
              }
            ),
            galatLain.length > 0 && /* @__PURE__ */ jsx(InlineNotice, { tone: "error", title: "Perubahan gagal disimpan", children: /* @__PURE__ */ jsx("ul", { className: "list-inside list-disc", children: galatLain.map(([kunci, pesan]) => /* @__PURE__ */ jsx("li", { children: String(pesan) }, kunci)) }) })
          ]
        }
      )
    }
  );
}

// resources/js/Pages/Admin/Orders/Show.jsx
var asText4 = (value) => value === null || value === void 0 ? "" : String(value);
var uang2 = (value) => rupiah(value) ?? "-";
var jumlah = (value) => value === null || value === void 0 ? "-" : formatNumber(value);
var barisInfo = (label, nilai, kunci) => /* @__PURE__ */ jsxs(
  "div",
  {
    className: "flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-b-0",
    children: [
      /* @__PURE__ */ jsx("dt", { className: "text-meta text-slate-600", children: label }),
      /* @__PURE__ */ jsx("dd", { className: "min-w-0 break-words text-right text-body text-ink", children: nilai })
    ]
  },
  kunci ?? label
);
var barisTotal = (label, nilai, kunci, tebal = false) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
  /* @__PURE__ */ jsx("dt", { className: cn("text-meta", tebal ? "font-semibold text-ink" : "text-slate-600"), children: label }),
  /* @__PURE__ */ jsx("dd", { className: cn("text-body", tebal ? "font-bold text-ink" : "text-ink"), children: nilai })
] }, kunci ?? label);
function Show({ pesanan = null, status_berikut = [], flash = null }) {
  const data = pesanan ?? {};
  const customer = data.customer ?? {};
  const items = Array.isArray(data.items) ? data.items : [];
  const berikut2 = Array.isArray(status_berikut) ? status_berikut : [];
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [toast, setToast] = useState(null);
  const [flashSinkron, setFlashSinkron] = useState(null);
  const final = berikut2.length === 0;
  const pasanganFlash = `${asText4(flash?.success)}|${asText4(flash?.error)}`;
  useEffect(() => {
    if (flashSinkron !== null && pasanganFlash !== "|" && pasanganFlash === flashSinkron) {
      setToast(null);
      return;
    }
    if (flash?.success) {
      setToast({ tone: "success", title: "Berhasil", message: asText4(flash.success) });
    } else if (flash?.error) {
      setToast({ tone: "error", title: "Gagal", message: asText4(flash.error) });
    }
  }, [flash?.success, flash?.error, flashSinkron, pasanganFlash]);
  const kolomItem = [
    {
      key: "product_name",
      header: "Produk",
      render: (baris2) => /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-ink", children: asText4(baris2?.product_name) || "-" }),
        asText4(baris2?.variant_label) !== "" && /* @__PURE__ */ jsx("p", { className: "text-meta text-slate-500", children: asText4(baris2.variant_label) })
      ] })
    },
    {
      key: "qty",
      header: "Jumlah",
      align: "right",
      render: (baris2) => jumlah(baris2?.qty)
    },
    {
      key: "unit_price",
      header: "Harga satuan",
      align: "right",
      render: (baris2) => /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: uang2(baris2?.unit_price) })
    },
    {
      key: "line_total",
      header: "Subtotal",
      align: "right",
      render: (baris2) => /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap font-semibold text-ink", children: uang2(baris2?.line_total) })
    }
  ];
  return /* @__PURE__ */ jsxs(AdminLayout, { title: asText4(data.code) || "Pesanan", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: asText4(data.code) || "Detail pesanan",
          description: asText4(data.created_at) === "" ? null : `Dibuat ${formatDateTime(data.created_at)}`,
          breadcrumb: [
            { label: "Dasbor", href: "/admin" },
            { label: "Pesanan", href: "/admin/pesanan" },
            { label: asText4(data.code) || "Detail" }
          ],
          actions: /* @__PURE__ */ jsxs(Fragment2, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "secondary", href: "/admin/pesanan", children: "Kembali ke daftar" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "primary",
                onClick: () => setModalTerbuka(true),
                disabled: final,
                "aria-describedby": final ? "status-final" : void 0,
                children: "Ubah status"
              }
            )
          ] })
        }
      ),
      final && /* @__PURE__ */ jsx("div", { id: "status-final", children: /* @__PURE__ */ jsxs(InlineNotice, { tone: "info", title: "Status sudah final", children: [
        "Pesanan ini berstatus ",
        asText4(data.status_label) || "-",
        " dan tidak punya status lanjutan, jadi tombol Ubah status dinonaktifkan."
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(KartuBagian, { title: "Ringkasan pesanan", className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("dl", { className: "flex flex-col", children: [
          barisInfo(
            "Status pesanan",
            /* @__PURE__ */ jsx(
              StatusBadge,
              {
                status: data.status,
                label: asText4(data.status_label) || null
              }
            )
          ),
          barisInfo(
            "Status pembayaran",
            /* @__PURE__ */ jsx(
              StatusBadge,
              {
                status: data.payment_status,
                label: asText4(data.payment_label) || null
              }
            )
          ),
          barisInfo("Metode pembayaran", asText4(data.payment_method).toUpperCase() || "-"),
          barisInfo("Dibuat", formatDateTime(data.created_at)),
          barisInfo("Dibayar", formatDateTime(data.paid_at))
        ] }) }),
        /* @__PURE__ */ jsx(KartuBagian, { title: "Data pembeli", className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("dl", { className: "flex flex-col", children: [
          barisInfo("Nama", asText4(customer.name) || "-"),
          barisInfo("Telepon", asText4(customer.phone) || "-"),
          barisInfo("Email", asText4(customer.email) || "-")
        ] }) }),
        /* @__PURE__ */ jsx(KartuBagian, { title: "Pengiriman", className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("dl", { className: "flex flex-col", children: [
            barisInfo("Nama penerima", asText4(customer.name) || "-"),
            barisInfo("Telepon", asText4(customer.phone) || "-"),
            barisInfo(
              "Alamat",
              /* @__PURE__ */ jsx("span", { className: "whitespace-pre-line", children: asText4(customer.address) || "-" })
            ),
            barisInfo("Kota", asText4(customer.city) || "-"),
            barisInfo("Kode pos", asText4(customer.postal_code) || "-")
          ] }),
          /* @__PURE__ */ jsx(InfoResi, { pesanan: data })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(KartuBagian, { title: "Item pesanan", description: `${jumlah(items.length)} baris item pada pesanan ini.`, children: [
        /* @__PURE__ */ jsx(
          DataTable,
          {
            columns: kolomItem,
            rows: items,
            rowKey: (baris2, index) => baris2?.id ?? index,
            emptyTitle: "Pesanan ini belum punya item",
            emptyDescription: "Hubungi backend bila pesanan seharusnya berisi item.",
            caption: "Item pesanan"
          }
        ),
        /* @__PURE__ */ jsxs("dl", { className: "flex flex-col gap-2 border-t border-line pt-4 sm:ml-auto sm:w-72", children: [
          barisTotal("Subtotal", uang2(data.subtotal), "subtotal"),
          barisTotal("Ongkos kirim", uang2(data.shipping_cost), "ongkir"),
          barisTotal("Diskon", uang2(data.discount), "diskon"),
          barisTotal("Total", uang2(data.total), "total", true)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsx(
          KartuBagian,
          {
            title: "Bukti pembayaran",
            description: "Pratinjau readonly \u2014 kode QR dan ID transaksi dikirim penyedia pembayaran.",
            children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
              /* @__PURE__ */ jsx(BuktiPembayaran, { payment: data.payment ?? null, paymentLabel: data.payment_label ?? null }),
              data.payment !== null && data.payment !== void 0 && /* @__PURE__ */ jsx(SyncPaymentButton, { pesananId: data.id, onHasilSinkron: setFlashSinkron })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(KartuBagian, { title: "Catatan pembeli", children: asText4(data.notes) === "" ? /* @__PURE__ */ jsx("p", { className: "text-body text-slate-600", children: "Tidak ada catatan dari pembeli." }) : /* @__PURE__ */ jsx("p", { className: "whitespace-pre-line text-body text-ink", children: asText4(data.notes) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      UbahStatusModal,
      {
        open: modalTerbuka,
        pesanan: data,
        statusBerikut: berikut2,
        onClose: () => setModalTerbuka(false)
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

// tmp/uji-aksi-sinkron-t_8e89556f.mjs
var LABEL = "Sinkronkan status pembayaran";
var URL_SINKRON = "/admin/pesanan/5/sinkron-pembayaran";
var hasil = [];
var uji = (nama, fn) => {
  try {
    bersihkanStore();
    bersihkan();
    kendali.halaman.props = {};
    kendali.berikutnya = { processing: false, errors: {}, sukses: null };
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
var kumpul = (pohon, keluar = []) => {
  if (pohon === null || pohon === void 0 || typeof pohon === "boolean") return keluar;
  if (Array.isArray(pohon)) {
    pohon.forEach((isi) => kumpul(isi, keluar));
    return keluar;
  }
  if (shim_react_t_321bf03c_default.isValidElement(pohon)) {
    keluar.push(pohon);
    kumpul(pohon.props?.children, keluar);
    return keluar;
  }
  return keluar;
};
var teksDari = (simpul, keluar = []) => {
  if (simpul === null || simpul === void 0 || typeof simpul === "boolean") return keluar;
  if (Array.isArray(simpul)) {
    simpul.forEach((isi) => teksDari(isi, keluar));
    return keluar;
  }
  if (shim_react_t_321bf03c_default.isValidElement(simpul)) {
    teksDari(simpul.props?.children, keluar);
    return keluar;
  }
  keluar.push(String(simpul));
  return keluar;
};
var semuaTeks = (pohon) => teksDari(pohon).join(" | ");
var tombolDari = (pohon) => kumpul(pohon).filter((el) => el.type === Button).map((el) => Button(el.props));
var PESANAN_UJI = {
  id: 5,
  code: "TK-20261020-0001",
  status: "pending",
  status_label: "Menunggu pembayaran",
  payment_status: "pending",
  payment_label: "Menunggu pembayaran",
  subtotal: 17e4,
  shipping_cost: 5e3,
  discount: 0,
  total: 175e3,
  payment_method: "qris",
  notes: null,
  tracking_number: null,
  customer: { name: "Pembeli Uji", phone: "0800000000", email: "uji@contoh.test", address: "Jl. Uji", city: "Bandung", postal_code: "40000" },
  items: [],
  payment: { provider: "midtrans", status: "pending", transaction_id: "trx-uji", qris_url: "https://contoh.test/qr.png", qr_string: "QR-UJI", gross_amount: 175e3, expires_at: "2026-10-22T10:00:00+07:00", paid_at: null },
  created_at: "2026-10-22T09:00:00+07:00",
  paid_at: null
};
var BERIKUT_UJI = [{ value: "diproses", label: "Diproses" }];
uji("A1. Render: satu tombol, label beku, varian secondary, lebar dikunci min-w-[16rem]", () => {
  const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
  const tombol = tombolDari(pohon);
  harus(tombol.length === 1, `jumlah tombol harus 1, dapat ${tombol.length}`);
  harus(semuaTeks(tombol[0]).includes(LABEL), "label beku tidak ditemukan");
  harus(tombol[0].props.type === "button", 'tombol harus type="button"');
  harus(String(tombol[0].props.className).includes("btn-secondary"), "varian harus btn-secondary \xA74.1");
  harus(String(tombol[0].props.className).includes("min-w-[16rem]"), "lebar dikunci (D13) tidak ada di className");
  harus(tombol[0].props.disabled !== true, "tombol tidak boleh disabled saat idle (alasan terlihat \xA74.0)");
  harus(!tombol[0].props["aria-busy"], "aria-busy hanya saat memproses");
});
uji("A2. Klik: PATCH URL literal kontrak \xA712.24, tanpa body, preserveScroll + preserveState", () => {
  const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
  const tombol = tombolDari(pohon)[0];
  tombol.props.onClick();
  harus(kendali.kunjungan.length === 1, `kunjungan harus 1, dapat ${kendali.kunjungan.length}`);
  const kunjungan = kendali.kunjungan[0];
  harus(kunjungan.metode === "patch", `metode harus patch, dapat ${kunjungan.metode}`);
  harus(kunjungan.url === URL_SINKRON, `url harus ${URL_SINKRON}, dapat ${kunjungan.url}`);
  harus(Object.keys(kunjungan.data ?? {}).length === 0, "body harus kosong (\xA712.24 tanpa field)");
  harus(kunjungan.opsi.preserveScroll === true, "preserveScroll harus true");
  harus(kunjungan.opsi.preserveState === true, "preserveState harus true (state hasil bertahan setelah props berganti)");
  harus(typeof kunjungan.opsi.onSuccess === "function", "onSuccess harus dipasang");
});
uji('A3. State memproses: label "Memproses\u2026" + disabled + aria-busy, kelas lebar tetap', () => {
  renderPohon(SyncPaymentButton, { pesananId: 5 });
  kendali.berikutnya.processing = true;
  const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
  const tombol = tombolDari(pohon)[0];
  const teks = semuaTeks(tombol);
  harus(tombol.props.disabled === true, "tombol harus disabled saat memproses");
  harus(tombol.props["aria-busy"] === true, "aria-busy harus true saat memproses");
  harus(teks.includes("Memproses\u2026"), 'label saat memproses harus "Memproses\u2026" (\xA74.1)');
  harus(!teks.includes(LABEL), "label beku diganti saat memproses");
  harus(String(tombol.props.className).includes("min-w-[16rem]"), "kelas lebar dikunci harus tetap ada saat memproses");
});
uji("A4. Klik ganda saat memproses: tidak ada kunjungan kedua", () => {
  const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
  tombolDari(pohon)[0].props.onClick();
  kendali.berikutnya.processing = true;
  const pohon2 = renderPohon(SyncPaymentButton, { pesananId: 5 });
  tombolDari(pohon2)[0].props.onClick();
  harus(kendali.kunjungan.length === 1, `kunjungan harus tetap 1, dapat ${kendali.kunjungan.length}`);
});
uji("A5. Jawaban flash.error: InlineNotice tone error + pesan server apa adanya + pelaporan pasangan", () => {
  const tersalur = [];
  const pohon = renderPohon(SyncPaymentButton, { pesananId: 5, onHasilSinkron: (p) => tersalur.push(p) });
  tombolDari(pohon)[0].props.onClick();
  const pesan = "Mode uji Midtrans: status tidak bisa disinkronkan.";
  kendali.kunjungan[0].opsi.onSuccess({ props: { flash: { error: pesan } } });
  const pohon2 = renderPohon(SyncPaymentButton, { pesananId: 5, onHasilSinkron: (p) => tersalur.push(p) });
  const notice = kumpul(pohon2).filter((el) => el.type === InlineNotice);
  harus(notice.length === 1, `harus ada 1 InlineNotice, dapat ${notice.length}`);
  harus(notice[0].props.tone === "error", `tone harus error, dapat ${notice[0].props.tone}`);
  harus(semuaTeks(notice[0]).includes(pesan), "pesan server harus tampil apa adanya");
  harus(tersalur.length === 1 && tersalur[0] === `|${pesan}`, `pasangan flash harus dilaporkan, dapat ${JSON.stringify(tersalur)}`);
});
uji("A6. Jawaban flash.success: InlineNotice tone success + pelaporan pasangan", () => {
  const tersalur = [];
  const pohon = renderPohon(SyncPaymentButton, { pesananId: 5, onHasilSinkron: (p) => tersalur.push(p) });
  tombolDari(pohon)[0].props.onClick();
  const pesan = "Status pembayaran diperbarui dari Menunggu pembayaran ke Lunas.";
  kendali.kunjungan[0].opsi.onSuccess({ props: { flash: { success: pesan } } });
  const pohon2 = renderPohon(SyncPaymentButton, { pesananId: 5, onHasilSinkron: (p) => tersalur.push(p) });
  const notice = kumpul(pohon2).filter((el) => el.type === InlineNotice);
  harus(notice.length === 1, `harus ada 1 InlineNotice, dapat ${notice.length}`);
  harus(notice[0].props.tone === "success", `tone harus success, dapat ${notice[0].props.tone}`);
  harus(semuaTeks(notice[0]).includes(pesan), "pesan server harus tampil apa adanya");
  harus(tersalur.length === 1 && tersalur[0] === `${pesan}|`, `pasangan flash harus dilaporkan, dapat ${JSON.stringify(tersalur)}`);
});
uji("A7. Klik berikutnya: notice lama hilang sebelum jawaban baru", () => {
  const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
  tombolDari(pohon)[0].props.onClick();
  kendali.kunjungan[0].opsi.onSuccess({ props: { flash: { success: "Pembayaran sudah lunas, sinkronisasi tidak perlu dijalankan." } } });
  const pohon2 = renderPohon(SyncPaymentButton, { pesananId: 5 });
  harus(kumpul(pohon2).some((el) => el.type === InlineNotice), "notice pertama harus tampil lebih dulu");
  tombolDari(pohon2)[0].props.onClick();
  const pohon3 = renderPohon(SyncPaymentButton, { pesananId: 5 });
  harus(!kumpul(pohon3).some((el) => el.type === InlineNotice), "notice lama harus hilang saat aksi baru dimulai");
});
uji("A8. Tanpa id pesanan: tidak merender tombol (tidak menembak URL tanpa id)", () => {
  const nol = renderPohon(SyncPaymentButton, { pesananId: null });
  harus(nol === null, "pesananId null harus merender null");
  harus(renderPohon(SyncPaymentButton, { pesananId: "" }) === null, "pesananId kosong harus merender null");
  harus(renderPohon(SyncPaymentButton, {}) === null, "pesananId absen harus merender null");
});
uji("A9. Higiene teks: tanpa undefined/NaN/[CONTOH]/placeholder di semua state", () => {
  const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
  const teks = `${semuaTeks(pohon)} ${String(tombolDari(pohon)[0].props.className)}`;
  ["undefined", "NaN", "[CONTOH]", "lorem"].forEach((buruk) => {
    harus(!teks.includes(buruk), `teks/kelas tidak boleh memuat "${buruk}"`);
  });
});
uji('B1. Show: tombol dirender di dalam kartu "Bukti pembayaran" dengan props dari pesanan.id', () => {
  const pohon = renderPohon(Show, { pesanan: PESANAN_UJI, status_berikut: BERIKUT_UJI, flash: null });
  const elems = kumpul(pohon);
  const sinkron = elems.filter((el) => el.type === SyncPaymentButton);
  const kartu = elems.filter((el) => el.type === KartuBagian && el.props.title === "Bukti pembayaran");
  harus(sinkron.length === 1, `tombol sinkron harus 1, dapat ${sinkron.length}`);
  harus(sinkron[0].props.pesananId === 5, "pesananId harus dari pesanan.id");
  harus(typeof sinkron[0].props.onHasilSinkron === "function", "onHasilSinkron harus terhubung ke halaman");
  harus(kartu.length === 1, 'kartu "Bukti pembayaran" harus ada');
  harus(kumpul(kartu[0].props.children).some((el) => el.type === SyncPaymentButton), "tombol harus di dalam kartu yang sama (D13)");
  harus(!elems.some((el) => el.type === Toast), "tanpa flash: Toast tidak boleh tampil");
  harus(!semuaTeks(pohon).includes("undefined"), "teks halaman tidak boleh memuat undefined");
});
uji("B2. Show: payment null/absen \u2192 tombol sinkron tidak dirender (D13)", () => {
  [{ ...PESANAN_UJI, payment: null }, { ...PESANAN_UJI, payment: void 0 }].forEach((pesanan) => {
    const elems = kumpul(renderPohon(Show, { pesanan, status_berikut: BERIKUT_UJI, flash: null }));
    harus(!elems.some((el) => el.type === SyncPaymentButton), "tombol tidak boleh dirender tanpa baris payments");
  });
});
uji("B3. Show: flash aksi lain tetap menjadi Toast halaman (suppress tidak bocor)", () => {
  const pohon = renderPohon(Show, {
    pesanan: PESANAN_UJI,
    status_berikut: BERIKUT_UJI,
    flash: { success: "Nomor resi pesanan diperbarui." }
  });
  const toast = kumpul(pohon).filter((el) => el.type === Toast);
  harus(toast.length === 1, `Toast harus tampil untuk flash aksi lain, dapat ${toast.length}`);
  harus(toast[0].props.message === "Nomor resi pesanan diperbarui.", "pesan Toast harus dari flash server");
});
uji("B4. Show: flash aksi sinkron di-suppress dari Toast setelah dilaporkan partial (U6-1)", () => {
  const pesan = "Status pembayaran tidak berubah: Lunas.";
  const pohon = renderPohon(Show, { pesanan: PESANAN_UJI, status_berikut: BERIKUT_UJI, flash: null });
  const sinkron = kumpul(pohon).filter((el) => el.type === SyncPaymentButton)[0];
  sinkron.props.onHasilSinkron(`${pesan}|`);
  harus(store.kotor === true, "pelaporan pasangan harus memicu render ulang halaman");
  const panjangTulisan = store.tulisan.length;
  const pohon2 = renderPohon(Show, { pesanan: PESANAN_UJI, status_berikut: BERIKUT_UJI, flash: { success: pesan } });
  const toast = kumpul(pohon2).filter((el) => el.type === Toast);
  harus(toast.length === 0, "flash aksi sinkron tidak boleh muncul lagi sebagai Toast (dobel dengan InlineNotice)");
  harus(store.tulisan.length === panjangTulisan, "tidak ada state Toast baru yang ditulis untuk flash aksi sinkron");
});
uji("B5. Integrasi: props dari Show \u2192 klik \u2192 URL kontrak \u2192 flash.error server tampil di kartu", () => {
  const pohon = renderPohon(Show, { pesanan: PESANAN_UJI, status_berikut: BERIKUT_UJI, flash: null });
  const propsDariShow = kumpul(pohon).filter((el) => el.type === SyncPaymentButton)[0].props;
  bersihkanStore();
  const pohon2 = renderPohon(SyncPaymentButton, propsDariShow);
  const tombol = tombolDari(pohon2);
  harus(tombol.length === 1, "tombol harus dirender dari props Show");
  harus(semuaTeks(tombol[0]).includes(LABEL), "label beku harus tampil");
  tombol[0].props.onClick();
  harus(kendali.kunjungan.length === 1, "klik harus memanggil satu kunjungan");
  harus(kendali.kunjungan[0].url === URL_SINKRON, `url harus ${URL_SINKRON}, dapat ${kendali.kunjungan[0].url}`);
  const pesan = "Pesanan ini belum punya tagihan pembayaran, jadi status tidak bisa disinkronkan.";
  kendali.kunjungan[0].opsi.onSuccess({ props: { flash: { error: pesan } } });
  const pohon3 = renderPohon(SyncPaymentButton, propsDariShow);
  const notice = kumpul(pohon3).filter((el) => el.type === InlineNotice);
  harus(notice.length === 1, `notice hasil harus tampil sekali, dapat ${notice.length}`);
  harus(semuaTeks(notice[0]).includes(pesan), "pesan server harus tampil apa adanya");
  harus(!kumpul(pohon3).some((el) => el.type === Toast), "partial tidak boleh membuat Toast sendiri");
});
var gagal = hasil.filter((b) => b.status === "GAGAL");
console.log("=== Hasil harness aksi kartu t_8e89556f (F8) ===");
hasil.forEach((b, i) => {
  console.log(`${String(i + 1).padStart(2, "0")}. [${b.status}] ${b.nama}${b.catatan === "" ? "" : `
      -> ${b.catatan}`}`);
});
console.log(`
RINGKAS: ${hasil.length - gagal.length}/${hasil.length} OK, ${gagal.length} GAGAL`);
if (gagal.length > 0) process.exit(1);
