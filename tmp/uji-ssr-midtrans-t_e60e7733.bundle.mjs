var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// tmp/stub-inertia-t_321bf03c.mjs
var stub_inertia_t_321bf03c_exports = {};
__export(stub_inertia_t_321bf03c_exports, {
  Deferred: () => Deferred,
  Head: () => Head,
  Link: () => Link,
  WhenVisible: () => WhenVisible,
  bersihkan: () => bersihkan,
  createInertiaApp: () => createInertiaApp,
  default: () => stub_inertia_t_321bf03c_default,
  kendali: () => kendali,
  router: () => router,
  useForm: () => useForm,
  usePage: () => usePage
});
import { createRequire } from "node:module";
var require2, R, h, kendali, bersihkan, catat, router, usePage, useForm, Link, Head, Deferred, WhenVisible, createInertiaApp, stub_inertia_t_321bf03c_default;
var init_stub_inertia_t_321bf03c = __esm({
  "tmp/stub-inertia-t_321bf03c.mjs"() {
    require2 = createRequire(import.meta.url);
    R = require2("react");
    h = R.createElement;
    kendali = {
      kunjungan: [],
      formulir: [],
      halaman: { props: {} },
      berikutnya: { processing: false, errors: {}, sukses: null }
    };
    bersihkan = () => {
      kendali.kunjungan.length = 0;
      kendali.formulir.length = 0;
      kendali.berikutnya = { processing: false, errors: {}, sukses: null };
    };
    catat = (metode, url, data, opsi) => {
      const kunjungan = { metode, url, data, opsi: opsi || {} };
      kendali.kunjungan.push(kunjungan);
      return kunjungan;
    };
    router = {
      get: (url, data, opsi) => catat("get", url, data, opsi),
      post: (url, data, opsi) => catat("post", url, data, opsi),
      put: (url, data, opsi) => catat("put", url, data, opsi),
      patch: (url, data, opsi) => catat("patch", url, data, opsi),
      delete: (url, data, opsi) => catat("delete", url, data, opsi),
      reload: (opsi) => catat("reload", null, null, opsi),
      visit: (url, opsi) => catat("visit", url, null, opsi)
    };
    usePage = () => kendali.halaman;
    useForm = (awal = {}) => {
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
    Link = ({ href, children, ...sisa }) => h("a", { href, ...sisa }, children);
    Head = () => null;
    Deferred = ({ children }) => typeof children === "function" ? children() : children;
    WhenVisible = ({ children }) => typeof children === "function" ? children() : children;
    createInertiaApp = () => {
      throw new Error("createInertiaApp tidak dipakai di harness");
    };
    stub_inertia_t_321bf03c_default = { router, usePage, useForm, Link, Head };
  }
});

// resources/js/lib/format.js
var cn, rupiah, formatNumber, formatDateTime;
var init_format = __esm({
  "resources/js/lib/format.js"() {
    cn = (...classes) => classes.flat().filter(Boolean).join(" ");
    rupiah = (value) => {
      if (value === null || value === void 0 || value === "") return null;
      const number = Number(value);
      if (!Number.isFinite(number)) return null;
      return `Rp${Math.round(number).toLocaleString("id-ID")}`;
    };
    formatNumber = (value) => {
      const number = Number(value);
      return Number.isFinite(number) ? number.toLocaleString("id-ID") : "0";
    };
    formatDateTime = (value) => {
      if (!value) return "-";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "-";
      return `${date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })}, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    };
  }
});

// resources/js/lib/midtrans.js
var midtrans_exports = {};
__export(midtrans_exports, {
  midtransMode: () => midtransMode
});
function midtransMode(midtrans = null) {
  const data = midtrans && typeof midtrans === "object" ? midtrans : {};
  const flag = data.fake;
  const mode = data.mode === "uji" || data.mode === "asli" ? data.mode : null;
  const uji2 = mode === "uji" || flag === true || flag === "true" || flag === 1;
  const teks2 = (nilai) => typeof nilai === "string" && nilai.trim() !== "" ? nilai : null;
  const langkah = Array.isArray(data.langkah_perbaikan) ? data.langkah_perbaikan.filter((item) => typeof item === "string" && item.trim() !== "") : [];
  return {
    diketahui: mode !== null || typeof flag === "boolean",
    uji: uji2,
    alasan: uji2 ? teks2(data.alasan) : null,
    langkah: uji2 ? langkah : [],
    catatan: teks2(data.catatan),
    sumberKredensial: teks2(data.sumber_kredensial)
  };
}
var init_midtrans = __esm({
  "resources/js/lib/midtrans.js"() {
  }
});

// resources/js/Components/icons.jsx
import React from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var Svg, SearchIcon, CartIcon, MenuIcon, CloseIcon, StarIcon, CheckIcon, TruckIcon, ReturnIcon, ShieldCheckIcon, HeadsetIcon, UserIcon, MailIcon, PhoneIcon, MapPinIcon, AlertIcon, ImageOffIcon, SpinnerIcon, InstagramIcon, FacebookIcon, TikTokIcon, WhatsAppIcon, LeafIcon, ScissorsIcon, GridIcon, BoxIcon, LayersIcon, ArchiveIcon, GearIcon, LogOutIcon, TrashIcon, CopyIcon, TRUST_ICONS, SOCIAL_ICONS;
var init_icons = __esm({
  "resources/js/Components/icons.jsx"() {
    Svg = ({ size = 20, className = "", children, filled = false, ...rest }) => /* @__PURE__ */ jsx(
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
    SearchIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "7" }),
      /* @__PURE__ */ jsx("path", { d: "m20.5 20.5-3.9-3.9" })
    ] });
    CartIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M3 4h2.2l2.1 10.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" }),
      /* @__PURE__ */ jsx("circle", { cx: "10", cy: "20", r: "1.2" }),
      /* @__PURE__ */ jsx("circle", { cx: "17.5", cy: "20", r: "1.2" })
    ] });
    MenuIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M4 7h16M4 12h16M4 17h16" }) });
    CloseIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6 6 18" }) });
    StarIcon = ({ filled = false, ...props }) => /* @__PURE__ */ jsx(Svg, { filled, ...props, children: /* @__PURE__ */ jsx("path", { d: "M12 3.6l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8L12 3.6z" }) });
    CheckIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "m5 12.5 4.5 4.5L19 7" }) });
    TruckIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M2.5 7.5h10v8h-10z" }),
      /* @__PURE__ */ jsx("path", { d: "M12.5 10.5h4l3 3v2h-7z" }),
      /* @__PURE__ */ jsx("circle", { cx: "6", cy: "18", r: "1.6" }),
      /* @__PURE__ */ jsx("circle", { cx: "16.5", cy: "18", r: "1.6" })
    ] });
    ReturnIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M4 9h9a5 5 0 0 1 0 10H8" }),
      /* @__PURE__ */ jsx("path", { d: "m7.5 5.5-3.5 3.5 3.5 3.5" })
    ] });
    ShieldCheckIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M12 3.5l7 2.5v5.4c0 4-3 7.2-7 8.6-4-1.4-7-4.6-7-8.6V6l7-2.5z" }),
      /* @__PURE__ */ jsx("path", { d: "m8.8 12 2.2 2.2 4.2-4.2" })
    ] });
    HeadsetIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" }),
      /* @__PURE__ */ jsx("path", { d: "M4.5 13h2.2v5H5.6A1.6 1.6 0 0 1 4 16.4V13z" }),
      /* @__PURE__ */ jsx("path", { d: "M19.5 13h-2.2v5h1.1a1.6 1.6 0 0 0 1.6-1.6V13z" }),
      /* @__PURE__ */ jsx("path", { d: "M17.3 18v.6a2.4 2.4 0 0 1-2.4 2.4H12" })
    ] });
    UserIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "8.5", r: "3.5" }),
      /* @__PURE__ */ jsx("path", { d: "M4.5 20a7.5 7.5 0 0 1 15 0" })
    ] });
    MailIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("rect", { x: "3", y: "5.5", width: "18", height: "13", rx: "2" }),
      /* @__PURE__ */ jsx("path", { d: "m4 7 8 6 8-6" })
    ] });
    PhoneIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" }) });
    MapPinIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" }),
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "2.6" })
    ] });
    AlertIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M12 4.5 21 20H3L12 4.5z" }),
      /* @__PURE__ */ jsx("path", { d: "M12 10v4" }),
      /* @__PURE__ */ jsx("path", { d: "M12 17h.01" })
    ] });
    ImageOffIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M4 5.5h16v13H4z" }),
      /* @__PURE__ */ jsx("path", { d: "m4 15 4.5-4.5 4 4 3-3 4.5 4.5" }),
      /* @__PURE__ */ jsx("path", { d: "M3 3l18 18" })
    ] });
    SpinnerIcon = ({ size = 16, className = "" }) => /* @__PURE__ */ jsxs(
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
    InstagramIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("rect", { x: "3.5", y: "3.5", width: "17", height: "17", rx: "5" }),
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "4" }),
      /* @__PURE__ */ jsx("path", { d: "M17 7h.01" })
    ] });
    FacebookIcon = (props) => /* @__PURE__ */ jsx(Svg, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M14.5 8.5h2.5V5h-2.5a4 4 0 0 0-4 4v2H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9.5a1 1 0 0 1 1-1z" }) });
    TikTokIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" }),
      /* @__PURE__ */ jsx("path", { d: "M14 4c.5 2.4 2.2 3.9 4.5 4" })
    ] });
    WhatsAppIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M20 11.7A8 8 0 0 1 8.3 19L4 20l1-4.2A8 8 0 1 1 20 11.7z" }),
      /* @__PURE__ */ jsx("path", { d: "M9 9.5c.6 2.2 2.3 3.9 4.5 4.5" })
    ] });
    LeafIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M20 4c-8 0-13 3.5-13 9.5A5.5 5.5 0 0 0 12.5 19C18.5 19 20 12 20 4z" }),
      /* @__PURE__ */ jsx("path", { d: "M4 21c1.5-5 5-8.5 9-10.5" })
    ] });
    ScissorsIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("circle", { cx: "6", cy: "6", r: "2.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "6", cy: "18", r: "2.5" }),
      /* @__PURE__ */ jsx("path", { d: "M8.2 7.6 20 18M8.2 16.4 20 6" })
    ] });
    GridIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("rect", { x: "3.5", y: "3.5", width: "7", height: "7", rx: "1.5" }),
      /* @__PURE__ */ jsx("rect", { x: "13.5", y: "3.5", width: "7", height: "7", rx: "1.5" }),
      /* @__PURE__ */ jsx("rect", { x: "3.5", y: "13.5", width: "7", height: "7", rx: "1.5" }),
      /* @__PURE__ */ jsx("rect", { x: "13.5", y: "13.5", width: "7", height: "7", rx: "1.5" })
    ] });
    BoxIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M20.5 7.8v8.4a1.5 1.5 0 0 1-.8 1.3l-7 3.7a1.5 1.5 0 0 1-1.4 0l-7-3.7a1.5 1.5 0 0 1-.8-1.3V7.8" }),
      /* @__PURE__ */ jsx("path", { d: "m3.9 7.1 7.4-3.8a1.5 1.5 0 0 1 1.4 0l7.4 3.8-8.1 4.2Z" }),
      /* @__PURE__ */ jsx("path", { d: "M12 11.3V20" })
    ] });
    LayersIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "m12 3.5 8 4-8 4-8-4Z" }),
      /* @__PURE__ */ jsx("path", { d: "m4 12 8 4 8-4" }),
      /* @__PURE__ */ jsx("path", { d: "m4 16.5 8 4 8-4" })
    ] });
    ArchiveIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("rect", { x: "3.5", y: "4", width: "17", height: "4", rx: "1" }),
      /* @__PURE__ */ jsx("path", { d: "M5 8v10.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V8" }),
      /* @__PURE__ */ jsx("path", { d: "M10 12h4" })
    ] });
    GearIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" }),
      /* @__PURE__ */ jsx("path", { d: "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" })
    ] });
    LogOutIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M15 4.5h3A1.5 1.5 0 0 1 19.5 6v12a1.5 1.5 0 0 1-1.5 1.5h-3" }),
      /* @__PURE__ */ jsx("path", { d: "M10 8 6 12l4 4" }),
      /* @__PURE__ */ jsx("path", { d: "M6 12h9" })
    ] });
    TrashIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("path", { d: "M4 7h16" }),
      /* @__PURE__ */ jsx("path", { d: "M10 11v6" }),
      /* @__PURE__ */ jsx("path", { d: "M14 11v6" }),
      /* @__PURE__ */ jsx("path", { d: "M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" }),
      /* @__PURE__ */ jsx("path", { d: "M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" })
    ] });
    CopyIcon = (props) => /* @__PURE__ */ jsxs(Svg, { ...props, children: [
      /* @__PURE__ */ jsx("rect", { x: "9", y: "9", width: "11", height: "11", rx: "2" }),
      /* @__PURE__ */ jsx("path", { d: "M15 6.5V5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15h1" })
    ] });
    TRUST_ICONS = {
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
    SOCIAL_ICONS = {
      instagram: InstagramIcon,
      facebook: FacebookIcon,
      tiktok: TikTokIcon,
      whatsapp: WhatsAppIcon
    };
  }
});

// resources/js/Components/Button.jsx
import React2 from "react";
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
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
  const content = loading ? /* @__PURE__ */ jsxs2(Fragment, { children: [
    /* @__PURE__ */ jsx2(SpinnerIcon, { size: 16 }),
    /* @__PURE__ */ jsx2("span", { children: "Memproses\u2026" })
  ] }) : /* @__PURE__ */ jsxs2(Fragment, { children: [
    icon,
    /* @__PURE__ */ jsx2("span", { children })
  ] });
  if (as === "a") {
    return /* @__PURE__ */ jsx2("a", { href, className: classes, ...rest, children: content });
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ jsx2(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest, children: content });
  }
  return /* @__PURE__ */ jsx2(
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
var VARIANTS, SIZES;
var init_Button = __esm({
  "resources/js/Components/Button.jsx"() {
    init_stub_inertia_t_321bf03c();
    init_format();
    init_icons();
    VARIANTS = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      danger: "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-sm text-label font-semibold leading-none bg-danger text-white transition-colors duration-hover hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed",
      link: "inline-flex items-center gap-2 text-label text-brand underline underline-offset-4 rounded-sm"
    };
    SIZES = {
      md: "",
      sm: "h-10 px-4"
    };
  }
});

// resources/js/Components/Countdown.jsx
var Countdown_exports = {};
__export(Countdown_exports, {
  default: () => Countdown
});
import React3, { useEffect, useRef, useState } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function remainingMs(expiresAt) {
  if (!expiresAt) return null;
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return null;
  return target - Date.now();
}
function Countdown({ expiresAt = null, onExpire = null, className = "", label = "Sisa waktu" }) {
  const [ms, setMs] = useState(() => remainingMs(expiresAt));
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  useEffect(() => {
    firedRef.current = false;
    setMs(remainingMs(expiresAt));
    if (!expiresAt) return void 0;
    const timer = window.setInterval(() => {
      const next = remainingMs(expiresAt);
      setMs(next);
      if (next !== null && next <= 0) {
        window.clearInterval(timer);
        if (!firedRef.current) {
          firedRef.current = true;
          if (typeof onExpireRef.current === "function") onExpireRef.current();
        }
      }
    }, 1e3);
    return () => window.clearInterval(timer);
  }, [expiresAt]);
  if (ms === null) return null;
  const expired = ms <= 0;
  const soon = !expired && ms <= 3 * 60 * 1e3;
  const totalSeconds = Math.floor(ms / 1e3);
  const text2 = `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
  return /* @__PURE__ */ jsxs3(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1.5 text-meta font-mono",
        expired ? "text-danger-strong" : soon ? "text-danger animate-pulse motion-reduce:animate-none" : "text-ink-soft",
        className
      ),
      role: "timer",
      "aria-live": "off",
      children: [
        /* @__PURE__ */ jsx3("span", { className: "sr-only", children: expired ? "Waktu pembayaran habis" : `${label} ${text2}` }),
        /* @__PURE__ */ jsx3("span", { "aria-hidden": "true", children: expired ? "Kedaluwarsa" : text2 })
      ]
    }
  );
}
var pad;
var init_Countdown = __esm({
  "resources/js/Components/Countdown.jsx"() {
    init_format();
    pad = (value) => String(Math.max(0, value)).padStart(2, "0");
  }
});

// resources/js/Components/InlineNotice.jsx
import React4 from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function InlineNotice({
  tone = "info",
  title = null,
  children = null,
  onDismiss = null,
  className = ""
}) {
  const Icon = ICONS[tone] ?? ICONS.info;
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn("flex items-start gap-3 rounded-md p-4", TONES[tone] ?? TONES.info, className),
      children: [
        /* @__PURE__ */ jsx4("span", { className: cn("mt-0.5 shrink-0", ICON_TONES[tone] ?? ICON_TONES.info), "aria-hidden": "true", children: /* @__PURE__ */ jsx4(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs4("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx4("p", { className: "text-label", children: title }),
          children && /* @__PURE__ */ jsx4("div", { className: "text-meta text-ink-soft", children })
        ] }),
        onDismiss && /* @__PURE__ */ jsx4(
          "button",
          {
            type: "button",
            onClick: onDismiss,
            "aria-label": "Tutup pesan",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60",
            children: /* @__PURE__ */ jsx4(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}
var TONES, ICONS, ICON_TONES;
var init_InlineNotice = __esm({
  "resources/js/Components/InlineNotice.jsx"() {
    init_format();
    init_icons();
    TONES = {
      info: "bg-brand-100 text-ink",
      success: "bg-success/10 text-ink",
      warning: "bg-warning/10 text-ink",
      error: "bg-red-50 border border-danger text-ink"
    };
    ICONS = {
      info: SearchIcon,
      success: CheckIcon,
      warning: AlertIcon,
      error: AlertIcon
    };
    ICON_TONES = {
      info: "text-brand",
      success: "text-success-strong",
      warning: "text-warning-strong",
      error: "text-danger"
    };
  }
});

// resources/js/Components/Spinner.jsx
import React5 from "react";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function Spinner({ size = 16, label = "Memuat", className = "" }) {
  const px = SIZES2[size] ?? 16;
  return /* @__PURE__ */ jsxs5(
    "svg",
    {
      className: cn("animate-spin text-current", className),
      width: px,
      height: px,
      viewBox: "0 0 24 24",
      fill: "none",
      role: "img",
      "aria-label": label,
      children: [
        /* @__PURE__ */ jsx5("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "1.5", opacity: "0.25" }),
        /* @__PURE__ */ jsx5("path", { d: "M21 12a9 9 0 0 0-9-9", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ]
    }
  );
}
var SIZES2;
var init_Spinner = __esm({
  "resources/js/Components/Spinner.jsx"() {
    init_format();
    SIZES2 = { 16: 16, 20: 20, 24: 24 };
  }
});

// resources/js/lib/qr.js
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
  const text2 = String(value ?? "");
  const bytes = Array.from(new TextEncoder().encode(text2));
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
var EC_LEVEL_BITS, RS_BLOCKS, ALIGN, EXP, LOG, gfMul, lengthBits, MASKS;
var init_qr = __esm({
  "resources/js/lib/qr.js"() {
    EC_LEVEL_BITS = 1;
    RS_BLOCKS = {
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
    ALIGN = {
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
    EXP = new Uint8Array(512);
    LOG = new Uint8Array(256);
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
    gfMul = (a, b) => a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
    lengthBits = (version) => version < 10 ? 8 : 16;
    MASKS = [
      (r, c) => (r + c) % 2 === 0,
      (r) => r % 2 === 0,
      (r, c) => c % 3 === 0,
      (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
      (r, c) => r * c % 2 + r * c % 3 === 0,
      (r, c) => (r * c % 2 + r * c % 3) % 2 === 0,
      (r, c) => ((r + c) % 2 + r * c % 3) % 2 === 0
    ];
  }
});

// resources/js/Components/QrCode.jsx
import React6, { useMemo } from "react";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
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
    return /* @__PURE__ */ jsx6(
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
  const path2 = qrPath(matrix);
  return /* @__PURE__ */ jsxs6(
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
        /* @__PURE__ */ jsx6("rect", { width: total, height: total, fill: "#ffffff" }),
        /* @__PURE__ */ jsx6("path", { d: path2, fill: "#111827" })
      ]
    }
  );
}
var init_QrCode = __esm({
  "resources/js/Components/QrCode.jsx"() {
    init_qr();
  }
});

// resources/js/Components/QrisPanel.jsx
var QrisPanel_exports = {};
__export(QrisPanel_exports, {
  default: () => QrisPanel
});
import React7, { useState as useState2 } from "react";
import { Fragment as Fragment2, jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function QrisPanel({
  status = "pending",
  qrString = null,
  qrUrl = null,
  orderCode = null,
  total = null,
  expiresAt = null,
  paidAt = null,
  reason = null,
  midtrans = null,
  galat = null,
  onCheck = null,
  onExpire = null,
  successHref = null,
  newOrderHref = "/produk",
  className = ""
}) {
  const [copied, setCopied] = useState2(false);
  const [qrFailed, setQrFailed] = useState2(false);
  const busy = status === "checking";
  const code = orderCode ?? "-";
  const amount = rupiah(total) ?? "-";
  const hasQr = Boolean(qrString) || Boolean(qrUrl) && !qrFailed;
  const mode = midtransMode(midtrans);
  const galatText = typeof galat === "string" && galat.trim() !== "" ? galat : null;
  const copy = async () => {
    if (!orderCode) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(orderCode);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2e3);
      }
    } catch {
      setCopied(false);
    }
  };
  if (status === "paid") {
    return /* @__PURE__ */ jsxs7(
      "section",
      {
        className: cn("card p-6 text-center", className),
        "aria-live": "polite",
        "aria-label": "Status pembayaran QRIS",
        children: [
          /* @__PURE__ */ jsx7("span", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success-strong", "aria-hidden": "true", children: /* @__PURE__ */ jsx7(CheckIcon, { size: 32 }) }),
          /* @__PURE__ */ jsx7("h2", { className: "mt-4 text-h2 text-ink", children: "Pembayaran diterima" }),
          /* @__PURE__ */ jsxs7("p", { className: "mt-2 text-body text-ink-soft", children: [
            "Pesanan ",
            /* @__PURE__ */ jsx7("span", { className: "font-mono", children: code }),
            " sudah dibayar",
            paidAt ? ` pada ${formatDateTime(paidAt)}` : "",
            "."
          ] }),
          /* @__PURE__ */ jsx7("p", { className: "mt-3 text-[20px] font-bold leading-none text-ink", children: amount }),
          successHref && /* @__PURE__ */ jsx7("div", { className: "mt-5", children: /* @__PURE__ */ jsx7(Button, { href: successHref, fullWidth: true, children: "Lihat Pesanan" }) })
        ]
      }
    );
  }
  if (status === "expired") {
    return /* @__PURE__ */ jsxs7(
      "section",
      {
        className: cn("card bg-surface p-6 text-center", className),
        "aria-live": "polite",
        "aria-label": "Status pembayaran QRIS",
        children: [
          /* @__PURE__ */ jsx7("span", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500", "aria-hidden": "true", children: /* @__PURE__ */ jsx7(AlertIcon, { size: 32 }) }),
          /* @__PURE__ */ jsx7("h2", { className: "mt-4 text-h2 text-ink", children: "Pembayaran tidak selesai" }),
          /* @__PURE__ */ jsx7("p", { className: "mt-2 text-body text-ink-soft", children: EXPIRED_MESSAGES[reason] ?? EXPIRED_MESSAGES.expire }),
          /* @__PURE__ */ jsxs7("p", { className: "mt-4 text-meta text-slate-600", children: [
            "Kode pesanan ",
            /* @__PURE__ */ jsx7("span", { className: "font-mono text-slate-600", children: code }),
            " \xB7 ",
            amount
          ] }),
          /* @__PURE__ */ jsx7("div", { className: "mt-5", children: /* @__PURE__ */ jsx7(Button, { href: newOrderHref, fullWidth: true, children: "Buat Pesanan Baru" }) })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs7("section", { className: cn("card p-6", className), "aria-label": "Pembayaran QRIS", children: [
    /* @__PURE__ */ jsx7("h2", { className: "text-center text-h2 text-ink", children: "Selesaikan Pembayaran" }),
    (status === "pending" || status === "error") && expiresAt && /* @__PURE__ */ jsx7("div", { className: "mt-2 text-center", children: /* @__PURE__ */ jsx7(Countdown, { expiresAt, onExpire, label: "Sisa waktu pembayaran" }) }),
    status === "checking" && /* @__PURE__ */ jsxs7("p", { className: "mt-2 flex items-center justify-center gap-2 text-meta text-slate-500", children: [
      /* @__PURE__ */ jsx7(Spinner, { label: "Memeriksa status pembayaran", className: "text-brand" }),
      "Memeriksa status pembayaran\u2026"
    ] }),
    galatText && /* @__PURE__ */ jsx7(InlineNotice, { tone: "error", title: "Pembayaran QRIS bermasalah", className: "mt-5", children: /* @__PURE__ */ jsx7("p", { children: galatText }) }),
    mode.uji && /* @__PURE__ */ jsxs7(InlineNotice, { tone: "warning", title: "Mode uji", className: "mt-5", children: [
      /* @__PURE__ */ jsx7("p", { children: mode.alasan ?? "Mode uji aktif: tagihan QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer." }),
      mode.langkah.length > 0 ? /* @__PURE__ */ jsxs7(Fragment2, { children: [
        /* @__PURE__ */ jsx7("p", { className: "mt-2 font-semibold text-ink", children: "Langkah perbaikan untuk pemilik:" }),
        /* @__PURE__ */ jsx7("ol", { className: "mt-1 list-decimal pl-4", children: mode.langkah.map((langkah, index) => /* @__PURE__ */ jsx7("li", { children: langkah }, index)) })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx7("div", { className: "mt-5 flex justify-center", children: /* @__PURE__ */ jsx7("div", { className: "rounded-lg border border-line bg-white p-4", children: qrString ? /* @__PURE__ */ jsx7(QrCode, { value: qrString, size: 240, label: `Kode QR pembayaran ${code}` }) : qrUrl && !qrFailed ? /* @__PURE__ */ jsx7(
      "img",
      {
        src: qrUrl,
        alt: `Kode QR pembayaran ${code}`,
        width: "240",
        height: "240",
        className: "h-[240px] w-[240px] object-contain",
        onError: () => setQrFailed(true)
      }
    ) : /* @__PURE__ */ jsxs7("div", { className: "flex h-[240px] w-[240px] flex-col items-center justify-center gap-2 text-slate-300", children: [
      /* @__PURE__ */ jsx7(ImageOffIcon, { size: 40 }),
      /* @__PURE__ */ jsx7("span", { className: "text-meta text-slate-500", children: "Kode QR belum tersedia" })
    ] }) }) }),
    /* @__PURE__ */ jsx7("p", { className: "mt-5 text-center text-[20px] font-bold leading-none text-ink", children: amount }),
    /* @__PURE__ */ jsxs7("p", { className: "mt-2 text-center text-meta text-slate-500", children: [
      "Kode pesanan ",
      /* @__PURE__ */ jsx7("span", { className: "font-mono text-slate-500", children: code })
    ] }),
    status === "error" && /* @__PURE__ */ jsxs7(InlineNotice, { tone: "error", className: "mt-4", children: [
      "Gagal memeriksa status pembayaran. Periksa koneksi lalu coba lagi",
      hasQr ? " \u2014 pembayaran yang sudah kamu lakukan tetap tercatat." : "."
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "mt-5 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsx7(
        Button,
        {
          variant: "primary",
          fullWidth: true,
          loading: busy,
          disabled: busy,
          onClick: onCheck ?? void 0,
          children: status === "error" ? "Coba lagi" : "Cek Status"
        }
      ),
      /* @__PURE__ */ jsxs7(Button, { variant: "secondary", fullWidth: true, onClick: copy, disabled: !orderCode, children: [
        /* @__PURE__ */ jsx7(CopyIcon, { size: 18 }),
        copied ? "Tersalin" : "Salin Kode"
      ] })
    ] }),
    copied && /* @__PURE__ */ jsx7("p", { role: "status", className: "mt-2 text-center text-meta text-success-strong", children: "Kode pesanan disalin." })
  ] });
}
var EXPIRED_MESSAGES;
var init_QrisPanel = __esm({
  "resources/js/Components/QrisPanel.jsx"() {
    init_format();
    init_midtrans();
    init_Button();
    init_Countdown();
    init_InlineNotice();
    init_Spinner();
    init_QrCode();
    init_icons();
    EXPIRED_MESSAGES = {
      expire: "Waktu pembayaran habis dan pesanan dibatalkan. Stok sudah dikembalikan ke toko.",
      deny: "Pembayaran ditolak. Pesanan dibatalkan dan stok sudah dikembalikan ke toko.",
      cancel: "Pembayaran dibatalkan. Pesanan dibatalkan dan stok sudah dikembalikan ke toko."
    };
  }
});

// resources/js/Components/Announcement.jsx
import React8 from "react";
import { jsx as jsx8 } from "react/jsx-runtime";
function Announcement({ text: text2 = null, href = null }) {
  if (!text2) return null;
  const content = /* @__PURE__ */ jsx8("span", { className: "text-meta text-white", children: text2 });
  return /* @__PURE__ */ jsx8("div", { className: "flex h-9 items-center justify-center bg-brand-700 px-4 text-center", children: href ? /* @__PURE__ */ jsx8(Link, { href, className: "underline-offset-4 hover:underline", children: content }) : content });
}
var init_Announcement = __esm({
  "resources/js/Components/Announcement.jsx"() {
    init_stub_inertia_t_321bf03c();
  }
});

// resources/js/Components/Footer.jsx
import React9 from "react";
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx9("footer", { className: "bg-footer pb-8 pt-section text-white/75", children: /* @__PURE__ */ jsxs8("div", { className: "container", children: [
    /* @__PURE__ */ jsxs8("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-gutterLg", children: [
      /* @__PURE__ */ jsxs8("div", { className: "md:col-span-1", children: [
        /* @__PURE__ */ jsx9("p", { className: "font-display text-h2 uppercase text-white", children: storeName }),
        about && /* @__PURE__ */ jsx9("p", { className: "mt-3 max-w-xs text-meta text-white/75", children: about }),
        socialItems.length > 0 && /* @__PURE__ */ jsx9("ul", { className: "mt-4 flex items-center gap-3", children: socialItems.map((item) => {
          const Icon = SOCIAL_ICONS[String(item.name).toLowerCase()];
          if (!Icon) return null;
          return /* @__PURE__ */ jsx9("li", { children: /* @__PURE__ */ jsx9(
            "a",
            {
              href: item.href,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": item.label ?? item.name,
              className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors duration-hover hover:border-white/50 hover:text-white",
              children: /* @__PURE__ */ jsx9(Icon, { size: 20 })
            }
          ) }, `${item.name}-${item.href}`);
        }) })
      ] }),
      columns.map((column) => /* @__PURE__ */ jsxs8("div", { children: [
        /* @__PURE__ */ jsx9("p", { className: "text-badge uppercase text-white", children: column.title }),
        /* @__PURE__ */ jsx9("ul", { className: "mt-3 space-y-2", children: column.items.map((item) => /* @__PURE__ */ jsx9("li", { children: item.href?.startsWith("http") ? /* @__PURE__ */ jsx9(
          "a",
          {
            href: item.href,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-meta text-white/75 hover:text-white hover:underline",
            children: item.label
          }
        ) : /* @__PURE__ */ jsx9(
          Link,
          {
            href: item.href ?? "#",
            className: "text-meta text-white/75 hover:text-white hover:underline",
            children: item.label
          }
        ) }, `${column.title}-${item.label}`)) })
      ] }, column.title)),
      contactRows.length > 0 && /* @__PURE__ */ jsxs8("div", { children: [
        /* @__PURE__ */ jsx9("p", { className: "text-badge uppercase text-white", children: "Hubungi Kami" }),
        /* @__PURE__ */ jsx9("ul", { className: "mt-3 space-y-2", children: contactRows.map((row) => /* @__PURE__ */ jsxs8("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx9("span", { className: "mt-0.5 shrink-0 text-white/60", children: /* @__PURE__ */ jsx9(row.icon, { size: 20 }) }),
          row.href ? /* @__PURE__ */ jsx9(
            "a",
            {
              href: row.href,
              className: "text-meta text-white/75 hover:text-white hover:underline",
              children: row.text
            }
          ) : /* @__PURE__ */ jsx9("span", { className: "text-meta text-white/75", children: row.text })
        ] }, row.text)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx9("div", { className: "mt-10 border-t border-white/15 pt-6", children: /* @__PURE__ */ jsx9("p", { className: "text-meta text-white/60", children: `\xA9 ${year} ${storeName}. Semua hak dilindungi.` }) })
  ] }) });
}
var init_Footer = __esm({
  "resources/js/Components/Footer.jsx"() {
    init_stub_inertia_t_321bf03c();
    init_icons();
  }
});

// resources/js/lib/hooks.js
import { useCallback, useEffect as useEffect2, useRef as useRef2, useState as useState3 } from "react";
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState3(false);
  useEffect2(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
function useDocumentVisible() {
  const [visible, setVisible] = useState3(
    typeof document === "undefined" ? true : document.visibilityState !== "hidden"
  );
  useEffect2(() => {
    const update = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}
function useLoadingTimeout(loading, timeoutMs = 1e4) {
  const [timedOut, setTimedOut] = useState3(false);
  useEffect2(() => {
    if (!loading) {
      setTimedOut(false);
      return void 0;
    }
    const id = window.setTimeout(() => setTimedOut(true), timeoutMs);
    return () => window.clearTimeout(id);
  }, [loading, timeoutMs]);
  return timedOut;
}
function useBodyScrollLock(active) {
  useEffect2(() => {
    if (!active) return void 0;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
function useFocusTrap(ref, active) {
  const previouslyFocused = useRef2(null);
  const focusFirst = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const targets = node.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (targets.length > 0) targets[0].focus();
    else node.focus();
  }, [ref]);
  useEffect2(() => {
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
var init_hooks = __esm({
  "resources/js/lib/hooks.js"() {
  }
});

// resources/js/Components/IconButton.jsx
import React10 from "react";
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
function IconButton({ label, badge = null, children, className = "", type = "button", ...rest }) {
  return /* @__PURE__ */ jsxs9(
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
        badge !== null && badge !== void 0 && badge !== "" && /* @__PURE__ */ jsx10("span", { className: "absolute right-1 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-badge text-ink", children: badge })
      ]
    }
  );
}
var init_IconButton = __esm({
  "resources/js/Components/IconButton.jsx"() {
    init_format();
  }
});

// resources/js/Components/Header.jsx
import React11 from "react";
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
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
  const wordmark = logoUrl ? /* @__PURE__ */ jsx11("img", { src: logoUrl, alt: storeName, className: "h-8 w-auto", loading: "eager" }) : /* @__PURE__ */ jsx11("span", { className: "font-display text-h2 uppercase tracking-[0.02em] text-brand", children: storeName });
  return /* @__PURE__ */ jsx11(
    "header",
    {
      className: cn(
        "sticky top-0 z-header border-b bg-white",
        scrolled ? "border-line backdrop-blur-sm" : "border-transparent"
      ),
      children: /* @__PURE__ */ jsxs10("div", { className: "container flex h-headerMobile items-center justify-between gap-4 md:h-header", children: [
        /* @__PURE__ */ jsx11("div", { className: "flex items-center gap-2 md:hidden", children: /* @__PURE__ */ jsx11(IconButton, { label: "Buka menu", onClick: onOpenDrawer, className: "-ml-2", children: /* @__PURE__ */ jsx11(MenuIcon, { size: 20 }) }) }),
        /* @__PURE__ */ jsx11(Link, { href: "/", className: "flex items-center md:mr-6", "aria-label": `${storeName} \u2014 beranda`, children: wordmark }),
        /* @__PURE__ */ jsx11("nav", { className: "hidden flex-1 items-center gap-1 md:flex", "aria-label": "Navigasi utama", children: nav.map((item) => /* @__PURE__ */ jsx11(
          Link,
          {
            href: item.href,
            className: "px-3.5 py-3 text-meta text-ink hover:underline hover:decoration-accent-500 hover:decoration-2 hover:underline-offset-4",
            children: item.label
          },
          item.href ?? item.label
        )) }),
        /* @__PURE__ */ jsxs10("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx11(
            Link,
            {
              href: searchHref,
              "aria-label": "Cari produk",
              title: "Cari produk",
              className: "hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex",
              children: /* @__PURE__ */ jsx11(SearchIcon, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsx11(
            IconButton,
            {
              label: `Keranjang${count > 0 ? `, ${count} item` : ""}`,
              badge: count > 0 ? count : null,
              onClick: () => router.visit(cartHref),
              children: /* @__PURE__ */ jsx11(CartIcon, { size: 20 })
            }
          ),
          user ? /* @__PURE__ */ jsxs10("div", { className: "hidden items-center gap-2 md:flex", children: [
            /* @__PURE__ */ jsx11("span", { className: "max-w-[120px] truncate text-meta text-ink", children: user.name ?? user.email ?? "Akun" }),
            /* @__PURE__ */ jsx11(
              "button",
              {
                type: "button",
                onClick: () => router.post("/logout"),
                className: "text-meta text-brand underline underline-offset-4",
                children: "Keluar"
              }
            )
          ] }) : /* @__PURE__ */ jsx11(
            Link,
            {
              href: loginHref,
              "aria-label": "Masuk",
              title: "Masuk",
              className: "hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex",
              children: /* @__PURE__ */ jsx11(UserIcon, { size: 20 })
            }
          )
        ] })
      ] })
    }
  );
}
var init_Header = __esm({
  "resources/js/Components/Header.jsx"() {
    init_stub_inertia_t_321bf03c();
    init_format();
    init_hooks();
    init_IconButton();
    init_icons();
  }
});

// resources/js/Components/NavDrawer.jsx
import React12, { useEffect as useEffect3, useRef as useRef3 } from "react";
import { jsx as jsx12, jsxs as jsxs11 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs11("div", { className: "fixed inset-0 z-drawer", children: [
    /* @__PURE__ */ jsx12(
      "button",
      {
        type: "button",
        "aria-label": "Tutup menu",
        onClick: onClose,
        className: "absolute inset-0 h-full w-full cursor-default bg-black/50"
      }
    ),
    /* @__PURE__ */ jsxs11(
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
          /* @__PURE__ */ jsxs11("div", { className: "flex h-header items-center justify-between border-b border-line px-4", children: [
            /* @__PURE__ */ jsx12("span", { className: "text-badge uppercase text-slate-500", children: title }),
            /* @__PURE__ */ jsx12(
              "button",
              {
                type: "button",
                onClick: onClose,
                "aria-label": "Tutup menu",
                className: "inline-flex h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface",
                children: /* @__PURE__ */ jsx12(CloseIcon, { size: 20 })
              }
            )
          ] }),
          /* @__PURE__ */ jsx12("nav", { className: "flex-1 overflow-y-auto", "aria-label": "Navigasi utama", children: /* @__PURE__ */ jsx12("ul", { children: nav.map((item) => /* @__PURE__ */ jsx12("li", { children: /* @__PURE__ */ jsx12(
            Link,
            {
              href: item.href,
              onClick: onClose,
              className: "flex h-drawerItem items-center border-b border-line px-4 text-label text-ink transition-colors duration-hover hover:bg-surface",
              children: item.label
            }
          ) }, item.href ?? item.label)) }) }),
          footer && /* @__PURE__ */ jsx12("div", { className: "border-t border-line p-4", children: footer })
        ]
      }
    )
  ] });
}
var init_NavDrawer = __esm({
  "resources/js/Components/NavDrawer.jsx"() {
    init_stub_inertia_t_321bf03c();
    init_format();
    init_hooks();
    init_icons();
  }
});

// resources/js/Layouts/PublicLayout.jsx
import React13, { useState as useState4 } from "react";
import { jsx as jsx13, jsxs as jsxs12 } from "react/jsx-runtime";
function PublicLayout({ settings = {}, cartCount = null, user = null, children }) {
  const [drawerOpen, setDrawerOpen] = useState4(false);
  const page = usePage();
  const storeName = settings?.store_name ?? "Toko Kulot";
  const rawNav = settings?.header_nav;
  const nav = Array.isArray(rawNav) && rawNav.length > 0 ? rawNav.filter((item) => item && item.label && hrefOf(item)).map((item) => ({ label: item.label, href: hrefOf(item) })) : DEFAULT_NAV;
  const announcement = settings?.landing_sections?.announcement ?? null;
  const announcementText = announcement?.text ?? settings?.announcement_text ?? null;
  const announcementHref = announcement ? hrefOf(announcement) : settings?.announcement_href ?? null;
  const currentUser = user ?? page?.props?.auth?.user ?? null;
  const count = toCount(page?.props?.cart?.count) ?? toCount(cartCount) ?? toCount(settings?.cart_count) ?? 0;
  return /* @__PURE__ */ jsxs12("div", { className: "flex min-h-screen flex-col bg-white text-ink", children: [
    /* @__PURE__ */ jsx13(
      "a",
      {
        href: "#konten-utama",
        className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white",
        children: "Lewati ke konten utama"
      }
    ),
    /* @__PURE__ */ jsx13(Announcement, { text: announcementText, href: announcementHref }),
    /* @__PURE__ */ jsx13(
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
    /* @__PURE__ */ jsx13(
      NavDrawer,
      {
        open: drawerOpen,
        nav,
        onClose: () => setDrawerOpen(false),
        title: "Menu",
        footer: currentUser ? /* @__PURE__ */ jsx13("p", { className: "text-meta text-ink-soft", children: `Masuk sebagai ${currentUser.name ?? currentUser.email ?? "Akun"}` }) : /* @__PURE__ */ jsx13(Link, { href: "/login", className: "btn-primary w-full justify-center", children: "Masuk" })
      }
    ),
    /* @__PURE__ */ jsx13("main", { id: "konten-utama", className: "flex-1", children }),
    /* @__PURE__ */ jsx13(
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
var DEFAULT_NAV, hrefOf, toCount;
var init_PublicLayout = __esm({
  "resources/js/Layouts/PublicLayout.jsx"() {
    init_stub_inertia_t_321bf03c();
    init_Announcement();
    init_Footer();
    init_Header();
    init_NavDrawer();
    DEFAULT_NAV = [
      { label: "Beranda", href: "/" },
      { label: "Produk", href: "/produk" },
      { label: "Kontak", href: "/kontak-kami" }
    ];
    hrefOf = (item) => item?.url ?? item?.href ?? null;
    toCount = (value) => {
      if (value === null || value === void 0 || value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
    };
  }
});

// resources/js/Components/Breadcrumb.jsx
import React14 from "react";
import { jsx as jsx14, jsxs as jsxs13 } from "react/jsx-runtime";
function Breadcrumb({ items = [], className = "" }) {
  const list = (Array.isArray(items) ? items : []).filter((item) => item && item.label);
  if (list.length === 0) return null;
  const first = list[0];
  const last = list[list.length - 1];
  const middle = list.slice(1, -1);
  const renderItem = (item, isLast) => isLast || !item.href ? /* @__PURE__ */ jsx14("span", { className: "text-ink", "aria-current": "page", children: item.label }) : /* @__PURE__ */ jsx14(Link, { href: item.href, className: "transition-colors duration-hover hover:text-ink", children: item.label });
  return /* @__PURE__ */ jsx14("nav", { "aria-label": "Breadcrumb", className: cn("h-12", className), children: /* @__PURE__ */ jsxs13("ol", { className: "flex h-full items-center gap-2 text-meta text-slate-600", children: [
    /* @__PURE__ */ jsx14("li", { className: "flex items-center gap-2", children: renderItem(first, list.length === 1) }),
    list.length > 1 && /* @__PURE__ */ jsx14("li", { className: "flex items-center gap-2", "aria-hidden": "true", children: /* @__PURE__ */ jsx14("span", { children: "/" }) }),
    middle.length > 0 && /* @__PURE__ */ jsx14("li", { className: "flex items-center gap-2 sm:hidden", "aria-hidden": "true", children: /* @__PURE__ */ jsx14("span", { children: "..." }) }),
    list.length > 1 && /* @__PURE__ */ jsx14("li", { className: "flex items-center gap-2", children: renderItem(last, true) })
  ] }) });
}
var init_Breadcrumb = __esm({
  "resources/js/Components/Breadcrumb.jsx"() {
    init_stub_inertia_t_321bf03c();
    init_format();
  }
});

// resources/js/Pages/Public/CheckoutPay.jsx
var CheckoutPay_exports = {};
__export(CheckoutPay_exports, {
  default: () => CheckoutPay
});
import React15, { useCallback as useCallback2, useEffect as useEffect4, useRef as useRef4, useState as useState5 } from "react";
import { jsx as jsx15, jsxs as jsxs14 } from "react/jsx-runtime";
function CheckoutPay({ pesanan = null, pembayaran = null, midtrans = null, flash = null }) {
  const orderId = pesanan?.id ?? null;
  const [status, setStatus] = useState5(() => STATUS_MAP[pembayaran?.status] ?? "pending");
  const [paidAt, setPaidAt] = useState5(pembayaran?.paid_at ?? null);
  const [expiresAt, setExpiresAt] = useState5(pembayaran?.expires_at ?? null);
  const [localExpired, setLocalExpired] = useState5(false);
  const [checking, setChecking] = useState5(false);
  const inFlight = useRef4(false);
  const visible = useDocumentVisible();
  const stalled = useLoadingTimeout(checking, 1e4);
  const effectiveStatus = status === "pending" && localExpired ? "expired" : status;
  const amount = rupiah(pesanan?.total ?? pembayaran?.gross_amount ?? null) ?? "-";
  const items = Array.isArray(pesanan?.items) ? pesanan.items : [];
  const readStatus = useCallback2(
    async (auto = false) => {
      if (!orderId || inFlight.current) return;
      inFlight.current = true;
      if (!auto) setChecking(true);
      try {
        const response = await fetch(`/checkout/${orderId}/status`, {
          headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
          credentials: "same-origin"
        });
        if (!response.ok) throw new Error(`status ${response.status}`);
        const data = await response.json();
        const next = STATUS_MAP[data?.status] ?? "pending";
        setStatus(next);
        setPaidAt(data?.paid_at ?? null);
        if (data?.expires_at) setExpiresAt(data.expires_at);
        if (next !== "pending") {
          setLocalExpired(false);
          setChecking(false);
        }
      } catch {
        setStatus("error");
        setChecking(false);
      } finally {
        inFlight.current = false;
      }
    },
    [orderId]
  );
  useEffect4(() => {
    if (stalled) setStatus("error");
  }, [stalled]);
  useEffect4(() => {
    if (effectiveStatus !== "pending" || !visible) return void 0;
    const timer = window.setInterval(() => readStatus(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [effectiveStatus, visible, readStatus]);
  const check = () => {
    if (inFlight.current) return;
    setStatus("checking");
    setChecking(true);
    readStatus(false);
  };
  return /* @__PURE__ */ jsxs14(PublicLayout, { children: [
    /* @__PURE__ */ jsx15(Head, { title: "Pembayaran" }),
    /* @__PURE__ */ jsxs14("div", { className: "container py-4", children: [
      /* @__PURE__ */ jsx15(
        Breadcrumb,
        {
          items: [
            { label: "Beranda", href: "/" },
            { label: "Checkout", href: "/checkout" },
            { label: "Pembayaran" }
          ]
        }
      ),
      /* @__PURE__ */ jsxs14("div", { className: "mx-auto max-w-qris", children: [
        /* @__PURE__ */ jsxs14("header", { className: "mt-2 text-center", children: [
          /* @__PURE__ */ jsx15("h1", { className: "text-h1 text-ink", children: "Pembayaran QRIS" }),
          pesanan?.code && /* @__PURE__ */ jsxs14("p", { className: "mt-1 text-body text-ink-soft", children: [
            "Pesanan ",
            /* @__PURE__ */ jsx15("span", { className: "font-mono", children: pesanan.code })
          ] })
        ] }),
        flash?.success && /* @__PURE__ */ jsx15(InlineNotice, { tone: "success", className: "mt-4", children: /* @__PURE__ */ jsx15("p", { children: flash.success }) }),
        flash?.error && /* @__PURE__ */ jsx15(InlineNotice, { tone: "error", className: "mt-4", children: /* @__PURE__ */ jsx15("p", { children: flash.error }) }),
        /* @__PURE__ */ jsx15(
          QrisPanel,
          {
            className: "mt-6",
            status: effectiveStatus,
            qrString: pembayaran?.qr_string ?? null,
            qrUrl: pembayaran?.qris_url ?? null,
            orderCode: pesanan?.code ?? null,
            total: pesanan?.total ?? pembayaran?.gross_amount ?? null,
            expiresAt,
            paidAt,
            reason: pembayaran?.status ?? null,
            midtrans,
            galat: pembayaran?.galat ?? null,
            onCheck: check,
            onExpire: () => setLocalExpired(true),
            successHref: orderId ? `/checkout/${orderId}/selesai` : null
          }
        ),
        /* @__PURE__ */ jsxs14("ol", { className: "mt-6 flex list-decimal flex-col gap-3 pl-5 text-body text-ink-soft", children: [
          /* @__PURE__ */ jsx15("li", { children: "Buka aplikasi e-wallet atau m-banking yang mendukung QRIS." }),
          /* @__PURE__ */ jsxs14("li", { children: [
            "Pindai kode QR di atas, lalu periksa nama toko dan total ",
            /* @__PURE__ */ jsx15("strong", { className: "font-semibold text-ink", children: amount }),
            "."
          ] }),
          /* @__PURE__ */ jsx15("li", { children: "Selesaikan pembayaran. Status di halaman ini diperbarui otomatis setiap 5 detik." })
        ] }),
        /* @__PURE__ */ jsxs14("section", { className: "card mt-6 p-6", "aria-labelledby": "judul-rincian", children: [
          /* @__PURE__ */ jsx15("h2", { id: "judul-rincian", className: "text-h3 text-ink", children: "Rincian Pesanan" }),
          /* @__PURE__ */ jsx15("ul", { className: "mt-4 flex flex-col gap-3", children: items.map((item) => /* @__PURE__ */ jsxs14("li", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs14("span", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx15("span", { className: "block text-body text-ink", children: item.name ?? "Produk" }),
              /* @__PURE__ */ jsxs14("span", { className: "block text-meta text-slate-500", children: [
                item.variant_label ? `${item.variant_label} \xB7 ` : "",
                formatNumber(item.qty),
                " \xD7 ",
                rupiah(item.unit_price) ?? "-"
              ] })
            ] }),
            /* @__PURE__ */ jsx15("span", { className: "shrink-0 text-body text-ink", children: rupiah(item.line_total) ?? "-" })
          ] }, item.id ?? item.product_id)) }),
          /* @__PURE__ */ jsx15("div", { className: "mt-5 border-t border-line pt-4", children: /* @__PURE__ */ jsxs14("dl", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsxs14("div", { className: "flex items-baseline justify-between gap-4", children: [
              /* @__PURE__ */ jsx15("dt", { className: "text-body text-ink-soft", children: "Subtotal" }),
              /* @__PURE__ */ jsx15("dd", { className: "text-body text-ink", children: rupiah(pesanan?.subtotal) ?? "-" })
            ] }),
            /* @__PURE__ */ jsxs14("div", { className: "flex items-baseline justify-between gap-4", children: [
              /* @__PURE__ */ jsx15("dt", { className: "text-body text-ink-soft", children: "Ongkir" }),
              /* @__PURE__ */ jsx15("dd", { className: "text-body text-ink", children: rupiah(pesanan?.shipping_cost) ?? "-" })
            ] }),
            /* @__PURE__ */ jsxs14("div", { className: "flex items-baseline justify-between gap-4", children: [
              /* @__PURE__ */ jsx15("dt", { className: "text-body font-bold text-ink", children: "Total" }),
              /* @__PURE__ */ jsx15("dd", { className: "text-[20px] font-bold leading-none text-ink", children: rupiah(pesanan?.total) ?? "-" })
            ] })
          ] }) })
        ] }),
        pesanan?.customer_name && /* @__PURE__ */ jsxs14("section", { className: "card mt-6 p-6", "aria-labelledby": "judul-kirim", children: [
          /* @__PURE__ */ jsx15("h2", { id: "judul-kirim", className: "text-h3 text-ink", children: "Dikirim ke" }),
          /* @__PURE__ */ jsx15("p", { className: "mt-3 text-body text-ink", children: pesanan.customer_name }),
          /* @__PURE__ */ jsx15("p", { className: "mt-1 text-meta text-slate-500", children: pesanan.customer_phone ?? "-" }),
          /* @__PURE__ */ jsxs14("p", { className: "mt-3 text-body text-ink-soft", children: [
            pesanan.customer_address ?? "-",
            pesanan.customer_city ? `, ${pesanan.customer_city}` : "",
            pesanan.customer_postal_code ? ` ${pesanan.customer_postal_code}` : ""
          ] }),
          pesanan.note && /* @__PURE__ */ jsxs14("p", { className: "mt-3 text-meta text-slate-500", children: [
            "Catatan: ",
            pesanan.note
          ] })
        ] })
      ] })
    ] })
  ] });
}
var STATUS_MAP, POLL_MS;
var init_CheckoutPay = __esm({
  "resources/js/Pages/Public/CheckoutPay.jsx"() {
    init_stub_inertia_t_321bf03c();
    init_PublicLayout();
    init_Breadcrumb();
    init_InlineNotice();
    init_QrisPanel();
    init_format();
    init_hooks();
    STATUS_MAP = {
      pending: "pending",
      settlement: "paid",
      expire: "expired",
      deny: "expired",
      cancel: "expired"
    };
    POLL_MS = 5e3;
  }
});

// resources/js/Layouts/AdminLayout.jsx
import React16, { useEffect as useEffect5, useRef as useRef5, useState as useState6 } from "react";
import { jsx as jsx16, jsxs as jsxs15 } from "react/jsx-runtime";
function AdminLayout({ auth = null, nav = ADMIN_NAV, title = null, children }) {
  const page = usePage();
  const url = page?.url ?? "";
  const [drawerOpen, setDrawerOpen] = useState6(false);
  const [menuOpen, setMenuOpen] = useState6(false);
  const drawerRef = useRef5(null);
  const menuRef = useRef5(null);
  useBodyScrollLock(drawerOpen);
  useFocusTrap(drawerRef, drawerOpen);
  useEffect5(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [url]);
  useEffect5(() => {
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
  const navList = (onNavigate = null) => /* @__PURE__ */ jsx16("ul", { className: "flex flex-1 flex-col gap-1 p-3", children: items.map((item) => {
    const Icon = item.icon ?? GridIcon;
    const active = isActive(url, item.href);
    return /* @__PURE__ */ jsx16("li", { children: /* @__PURE__ */ jsxs15(
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
          /* @__PURE__ */ jsx16(Icon, { size: 18 }),
          item.label
        ]
      }
    ) }, item.key ?? item.href);
  }) });
  return /* @__PURE__ */ jsxs15("div", { className: "min-h-screen bg-surface", children: [
    title && /* @__PURE__ */ jsx16(Head, { title }),
    /* @__PURE__ */ jsxs15("aside", { className: "fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col bg-brand-700 lg:flex", children: [
      /* @__PURE__ */ jsx16("div", { className: "flex h-topbar items-center px-4 text-white", children: /* @__PURE__ */ jsx16(Link, { href: "/admin", className: "text-label font-semibold uppercase tracking-wide", children: "Daster Kulot" }) }),
      /* @__PURE__ */ jsx16("nav", { "aria-label": "Navigasi admin", className: "flex flex-1 flex-col overflow-y-auto", children: navList() })
    ] }),
    drawerOpen && /* @__PURE__ */ jsxs15("div", { className: "fixed inset-0 z-drawer lg:hidden", children: [
      /* @__PURE__ */ jsx16(
        "button",
        {
          type: "button",
          "aria-label": "Tutup menu",
          onClick: () => setDrawerOpen(false),
          className: "absolute inset-0 h-full w-full bg-ink/40"
        }
      ),
      /* @__PURE__ */ jsxs15(
        "div",
        {
          ref: drawerRef,
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Navigasi admin",
          className: "animate-drawer-in absolute inset-y-0 left-0 flex w-drawer max-w-[85%] flex-col bg-brand-700",
          children: [
            /* @__PURE__ */ jsxs15("div", { className: "flex h-topbar items-center justify-between px-4 text-white", children: [
              /* @__PURE__ */ jsx16("span", { className: "text-label font-semibold uppercase tracking-wide", children: "Daster Kulot" }),
              /* @__PURE__ */ jsx16(
                "button",
                {
                  type: "button",
                  onClick: () => setDrawerOpen(false),
                  "aria-label": "Tutup menu",
                  className: "flex h-touch w-touch items-center justify-center rounded-md text-white/80 transition-colors duration-hover hover:bg-white/10 hover:text-white",
                  children: /* @__PURE__ */ jsx16(CloseIcon, { size: 20 })
                }
              )
            ] }),
            /* @__PURE__ */ jsx16("nav", { "aria-label": "Navigasi admin", className: "flex flex-1 flex-col overflow-y-auto", children: navList(() => setDrawerOpen(false)) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs15("div", { className: "lg:pl-sidebar", children: [
      /* @__PURE__ */ jsxs15("header", { className: "sticky top-0 z-20 flex h-topbar items-center justify-between gap-3 border-b border-line bg-white px-4 lg:px-6", children: [
        /* @__PURE__ */ jsx16(
          "button",
          {
            type: "button",
            onClick: () => setDrawerOpen(true),
            "aria-label": "Buka menu",
            "aria-expanded": drawerOpen,
            className: "flex h-touch w-touch items-center justify-center rounded-md text-ink transition-colors duration-hover hover:bg-surface lg:hidden",
            children: /* @__PURE__ */ jsx16(MenuIcon, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsx16("p", { className: "hidden text-label font-semibold text-ink lg:block", children: "Panel Admin" }),
        /* @__PURE__ */ jsxs15("div", { className: "relative", ref: menuRef, children: [
          /* @__PURE__ */ jsxs15(
            "button",
            {
              type: "button",
              onClick: () => setMenuOpen((open) => !open),
              "aria-haspopup": "menu",
              "aria-expanded": menuOpen,
              className: "flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-hover hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              children: [
                /* @__PURE__ */ jsx16(
                  "span",
                  {
                    "aria-hidden": "true",
                    className: "flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-label font-semibold text-brand",
                    children: initial
                  }
                ),
                /* @__PURE__ */ jsx16("span", { className: "hidden max-w-[160px] truncate text-meta text-ink sm:block", children: userName })
              ]
            }
          ),
          menuOpen && /* @__PURE__ */ jsxs15(
            "div",
            {
              role: "menu",
              className: "absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white shadow-raised",
              children: [
                /* @__PURE__ */ jsxs15("div", { className: "border-b border-line px-4 py-3", children: [
                  /* @__PURE__ */ jsx16("p", { className: "truncate text-label font-semibold text-ink", children: userName }),
                  userEmail && /* @__PURE__ */ jsx16("p", { className: "truncate text-meta text-slate-500", children: userEmail })
                ] }),
                /* @__PURE__ */ jsxs15(
                  "button",
                  {
                    type: "button",
                    role: "menuitem",
                    onClick: logout,
                    className: "flex w-full items-center gap-2 px-4 py-3 text-left text-label text-ink transition-colors duration-hover hover:bg-surface",
                    children: [
                      /* @__PURE__ */ jsx16(LogOutIcon, { size: 16 }),
                      "Keluar"
                    ]
                  }
                )
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx16("main", { className: "mx-auto w-full max-w-[1200px] px-4 py-6 lg:px-6", children })
    ] })
  ] });
}
var ADMIN_NAV, isActive;
var init_AdminLayout = __esm({
  "resources/js/Layouts/AdminLayout.jsx"() {
    init_stub_inertia_t_321bf03c();
    init_format();
    init_hooks();
    init_icons();
    ADMIN_NAV = [
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
    isActive = (url, href) => {
      if (!url || !href) return false;
      if (href === "/admin") return url === "/admin" || url === "/admin/";
      return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
    };
  }
});

// resources/js/Components/PageHeader.jsx
import React17 from "react";
import { jsx as jsx17, jsxs as jsxs16 } from "react/jsx-runtime";
function PageHeader({ title = "", breadcrumb = [], actions = null, description = null, className = "" }) {
  return /* @__PURE__ */ jsxs16("header", { className: cn("flex flex-col gap-3", className), children: [
    breadcrumb.length > 0 && /* @__PURE__ */ jsx17(Breadcrumb, { items: breadcrumb }),
    /* @__PURE__ */ jsxs16("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs16("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx17("h1", { className: "text-h1 font-bold text-ink", children: title }),
        description && /* @__PURE__ */ jsx17("p", { className: "mt-1 text-meta text-slate-600", children: description })
      ] }),
      actions && /* @__PURE__ */ jsx17("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center", children: actions })
    ] })
  ] });
}
var init_PageHeader = __esm({
  "resources/js/Components/PageHeader.jsx"() {
    init_format();
    init_Breadcrumb();
  }
});

// resources/js/Components/Field.jsx
import React18 from "react";
import { jsx as jsx18, jsxs as jsxs17 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs17("div", { className: cn("flex flex-col", className), children: [
    label && /* @__PURE__ */ jsxs17("label", { htmlFor, className: "mb-1.5 block text-meta font-semibold text-ink", children: [
      label,
      required && /* @__PURE__ */ jsx18("span", { className: "text-danger", "aria-hidden": "true", children: " *" })
    ] }),
    children,
    hint && !error && /* @__PURE__ */ jsx18("p", { id: hintId, className: "mt-1.5 text-meta text-slate-500", children: hint }),
    error && /* @__PURE__ */ jsx18("p", { id: errorId, className: "mt-1.5 text-meta text-danger-strong", role: "alert", children: error })
  ] });
}
var init_Field = __esm({
  "resources/js/Components/Field.jsx"() {
    init_format();
  }
});

// resources/js/Components/Input.jsx
import React19 from "react";
import { jsx as jsx19 } from "react/jsx-runtime";
function Input({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx19(
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
var BASE;
var init_Input = __esm({
  "resources/js/Components/Input.jsx"() {
    init_format();
    BASE = "w-full h-field rounded-md border border-line bg-white px-3.5 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
  }
});

// resources/js/Components/Select.jsx
import React20 from "react";
import { jsx as jsx20, jsxs as jsxs18 } from "react/jsx-runtime";
function Select({ error = null, className = "", id = null, children, ...rest }) {
  return /* @__PURE__ */ jsxs18("span", { className: "relative block", children: [
    /* @__PURE__ */ jsx20(
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
    /* @__PURE__ */ jsx20(
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
        children: /* @__PURE__ */ jsx20("path", { d: "M6 9l6 6 6-6" })
      }
    )
  ] });
}
var BASE2;
var init_Select = __esm({
  "resources/js/Components/Select.jsx"() {
    init_format();
    BASE2 = "w-full h-field appearance-none rounded-md border border-line bg-white pl-3.5 pr-10 text-body text-ink transition-colors duration-hover focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
  }
});

// resources/js/Components/Textarea.jsx
import React21 from "react";
import { jsx as jsx21 } from "react/jsx-runtime";
function Textarea({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ jsx21(
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
var BASE3;
var init_Textarea = __esm({
  "resources/js/Components/Textarea.jsx"() {
    init_format();
    BASE3 = "w-full min-h-[120px] resize-y rounded-md border border-line bg-white px-3.5 py-3 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
  }
});

// resources/js/Components/Modal.jsx
import React22, { useEffect as useEffect6, useRef as useRef6 } from "react";
import { jsx as jsx22, jsxs as jsxs19 } from "react/jsx-runtime";
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
  const panelRef = useRef6(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);
  useEffect6(() => {
    if (!open) return void 0;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsx22(
    "div",
    {
      className: "fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose?.();
      },
      children: /* @__PURE__ */ jsxs19(
        "div",
        {
          ref: panelRef,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": title ? "modal-title" : void 0,
          tabIndex: -1,
          className: cn(
            "w-full rounded-xl bg-white p-6 shadow-raised animate-modal-in",
            SIZES3[size] ?? SIZES3.md
          ),
          children: [
            /* @__PURE__ */ jsxs19("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs19("div", { className: "min-w-0", children: [
                title && /* @__PURE__ */ jsx22("h2", { id: "modal-title", className: "text-h3 text-ink", children: title }),
                description && /* @__PURE__ */ jsx22("p", { className: "mt-1 text-meta text-ink-soft", children: description })
              ] }),
              onClose && /* @__PURE__ */ jsx22(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  "aria-label": closeLabel,
                  className: "-mr-2 -mt-1 inline-flex h-touch w-touch items-center justify-center rounded-md text-ink-soft transition-colors duration-hover hover:bg-surface",
                  children: /* @__PURE__ */ jsx22(CloseIcon, { size: 20 })
                }
              )
            ] }),
            children && /* @__PURE__ */ jsx22("div", { className: "mt-4 text-body text-ink", children }),
            footer && /* @__PURE__ */ jsx22("div", { className: "mt-6 flex flex-wrap justify-end gap-3", children: footer })
          ]
        }
      )
    }
  );
}
var SIZES3;
var init_Modal = __esm({
  "resources/js/Components/Modal.jsx"() {
    init_format();
    init_hooks();
    init_icons();
    SIZES3 = {
      md: "max-w-modal",
      lg: "max-w-modalLg"
    };
  }
});

// resources/js/Components/Toast.jsx
import React23, { useEffect as useEffect7 } from "react";
import { jsx as jsx23, jsxs as jsxs20 } from "react/jsx-runtime";
function Toast({
  tone = "info",
  title = null,
  message = null,
  duration = 4e3,
  onClose = null
}) {
  const config = TONES2[tone] ?? TONES2.info;
  const Icon = config.icon;
  useEffect7(() => {
    if (!duration || !onClose) return void 0;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [duration, onClose]);
  return /* @__PURE__ */ jsxs20(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn(
        "pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-md border border-line border-l-[3px] bg-white p-4 shadow-raised animate-fade-up",
        config.bar
      ),
      children: [
        /* @__PURE__ */ jsx23("span", { className: cn("mt-0.5 shrink-0", config.color), "aria-hidden": "true", children: /* @__PURE__ */ jsx23(Icon, { size: 20 }) }),
        /* @__PURE__ */ jsxs20("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx23("p", { className: "text-label text-ink", children: title }),
          message && /* @__PURE__ */ jsx23("p", { className: "text-meta text-ink-soft", children: message })
        ] }),
        onClose && /* @__PURE__ */ jsx23(
          "button",
          {
            type: "button",
            onClick: onClose,
            "aria-label": "Tutup notifikasi",
            className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-surface",
            children: /* @__PURE__ */ jsx23(CloseIcon, { size: 16 })
          }
        )
      ]
    }
  );
}
var TONES2;
var init_Toast = __esm({
  "resources/js/Components/Toast.jsx"() {
    init_format();
    init_icons();
    TONES2 = {
      info: { bar: "border-l-brand", icon: SearchIcon, color: "text-brand" },
      success: { bar: "border-l-success", icon: CheckIcon, color: "text-success-strong" },
      warning: { bar: "border-l-warning", icon: AlertIcon, color: "text-warning-strong" },
      error: { bar: "border-l-danger", icon: AlertIcon, color: "text-danger" }
    };
  }
});

// resources/js/Components/StatusBadge.jsx
import React24 from "react";
import { jsx as jsx24 } from "react/jsx-runtime";
function StatusBadge({ status = null, label = null, className = "" }) {
  const key = typeof status === "string" ? status.trim().toLowerCase() : "";
  const tone = TONES3[key] ?? null;
  const text2 = label ?? tone?.label ?? (key === "" ? "-" : status);
  return /* @__PURE__ */ jsx24(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase",
        CLASSES[tone?.token ?? "neutral"],
        className
      ),
      children: text2
    }
  );
}
var TONES3, CLASSES;
var init_StatusBadge = __esm({
  "resources/js/Components/StatusBadge.jsx"() {
    init_format();
    TONES3 = {
      pending: { token: "warning", label: "Menunggu" },
      dibayar: { token: "brand", label: "Dibayar" },
      diproses: { token: "brand", label: "Diproses" },
      dikirim: { token: "brand", label: "Dikirim" },
      selesai: { token: "success", label: "Selesai" },
      batal: { token: "danger", label: "Batal" }
    };
    CLASSES = {
      brand: "bg-brand/10 text-brand",
      warning: "bg-warning/10 text-warning-strong",
      success: "bg-success/10 text-success-strong",
      danger: "bg-danger/10 text-danger-strong",
      neutral: "bg-slate-200/60 text-slate-600"
    };
  }
});

// resources/js/Components/EmptyState.jsx
import React25 from "react";
import { jsx as jsx25, jsxs as jsxs21 } from "react/jsx-runtime";
function EmptyState({
  title = "Belum ada data",
  description = null,
  actionLabel = null,
  actionHref = null,
  onAction = null,
  icon = null,
  className = ""
}) {
  return /* @__PURE__ */ jsxs21("div", { className: cn("flex flex-col items-center gap-3 py-12 text-center", className), children: [
    /* @__PURE__ */ jsx25("span", { className: "text-slate-300", "aria-hidden": "true", children: icon ?? /* @__PURE__ */ jsx25(ImageOffIcon, { size: 96 }) }),
    /* @__PURE__ */ jsx25("p", { className: "text-h3 text-ink", children: title }),
    description && /* @__PURE__ */ jsx25("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
    actionLabel && onAction && /* @__PURE__ */ jsx25(Button, { variant: "secondary", onClick: onAction, className: "mt-2", children: actionLabel }),
    actionLabel && !onAction && actionHref && /* @__PURE__ */ jsx25(Button, { variant: "secondary", href: actionHref, className: "mt-2", children: actionLabel })
  ] });
}
var init_EmptyState = __esm({
  "resources/js/Components/EmptyState.jsx"() {
    init_format();
    init_Button();
    init_icons();
  }
});

// resources/js/Components/ErrorState.jsx
import React26 from "react";
import { jsx as jsx26, jsxs as jsxs22 } from "react/jsx-runtime";
function ErrorState({
  title = "Gagal memuat data",
  description = "Periksa koneksi Anda lalu coba lagi.",
  onRetry = null,
  supportHref = "/kontak-kami",
  retryLabel = "Coba lagi",
  supportLabel = "Hubungi kami",
  className = ""
}) {
  return /* @__PURE__ */ jsxs22(
    "div",
    {
      role: "alert",
      className: cn("flex flex-col items-center gap-3 py-12 text-center", className),
      children: [
        /* @__PURE__ */ jsx26("span", { className: "text-danger", "aria-hidden": "true", children: /* @__PURE__ */ jsx26(AlertIcon, { size: 48 }) }),
        /* @__PURE__ */ jsx26("p", { className: "text-h3 text-ink", children: title }),
        description && /* @__PURE__ */ jsx26("p", { className: "max-w-sm text-meta text-slate-600", children: description }),
        /* @__PURE__ */ jsxs22("div", { className: "mt-2 flex flex-wrap items-center justify-center gap-3", children: [
          onRetry && /* @__PURE__ */ jsx26(Button, { variant: "primary", onClick: onRetry, children: retryLabel }),
          supportHref && /* @__PURE__ */ jsx26(Button, { variant: "secondary", href: supportHref, children: supportLabel })
        ] })
      ]
    }
  );
}
var init_ErrorState = __esm({
  "resources/js/Components/ErrorState.jsx"() {
    init_format();
    init_Button();
    init_icons();
  }
});

// resources/js/Components/Skeleton.jsx
import React27 from "react";
import { jsx as jsx27 } from "react/jsx-runtime";
function Skeleton({ variant = "text", count = 1, className = "" }) {
  return Array.from({ length: count }).map((_, index) => /* @__PURE__ */ jsx27(
    "div",
    {
      "aria-hidden": "true",
      className: cn("skeleton", SHAPES[variant] ?? SHAPES.text, className)
    },
    index
  ));
}
var SHAPES;
var init_Skeleton = __esm({
  "resources/js/Components/Skeleton.jsx"() {
    init_format();
    SHAPES = {
      text: "h-3 w-full",
      title: "h-6 w-2/3",
      card: "aspect-square w-full",
      row: "h-tableRow w-full",
      circle: "h-10 w-10 rounded-full"
    };
  }
});

// resources/js/Components/DataTable.jsx
import React28 from "react";
import { jsx as jsx28, jsxs as jsxs23 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx28("div", { className: cn("overflow-hidden rounded-lg border border-line bg-white", className), children: error ? /* @__PURE__ */ jsx28(
    ErrorState,
    {
      title: "Gagal memuat data",
      description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
      onRetry,
      supportHref: null
    }
  ) : loading ? /* @__PURE__ */ jsxs23("div", { className: "flex flex-col", "aria-busy": "true", children: [
    /* @__PURE__ */ jsx28("div", { className: "h-tableHead w-full border-b border-line bg-surface", "aria-hidden": "true" }),
    Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsx28("div", { className: "flex items-center gap-4 border-b border-line px-4 last:border-b-0", children: /* @__PURE__ */ jsx28(Skeleton, { variant: "row" }) }, index))
  ] }) : !hasRows ? /* @__PURE__ */ jsx28(
    EmptyState,
    {
      title: emptyTitle,
      description: emptyDescription,
      actionLabel: emptyActionLabel,
      actionHref: emptyActionHref
    }
  ) : /* @__PURE__ */ jsx28("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs23("table", { className: "w-full border-collapse text-meta", children: [
    caption && /* @__PURE__ */ jsx28("caption", { className: "sr-only", children: caption }),
    /* @__PURE__ */ jsx28("thead", { children: /* @__PURE__ */ jsx28("tr", { className: "bg-surface", children: columns.map((column) => {
      const isSorted = sort && sort.key === column.key;
      const sortable = Boolean(onSort && column.sortable !== false);
      return /* @__PURE__ */ jsx28(
        "th",
        {
          scope: "col",
          "aria-sort": isSorted ? sortState(column) : void 0,
          className: cn(
            "h-tableHead whitespace-nowrap border-b border-line px-4 text-label uppercase text-slate-600",
            cellAlign(column)
          ),
          children: sortable ? /* @__PURE__ */ jsxs23(
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
                /* @__PURE__ */ jsx28("span", { "aria-hidden": "true", children: isSorted ? sort.dir === "desc" ? "\u2193" : "\u2191" : "\u2195" })
              ]
            }
          ) : column.header
        },
        column.key
      );
    }) }) }),
    /* @__PURE__ */ jsx28("tbody", { children: list.map((row, index) => {
      const clickable = typeof onRowClick === "function";
      return /* @__PURE__ */ jsx28(
        "tr",
        {
          className: cn(
            "h-tableRow border-b border-line last:border-b-0",
            clickable && "cursor-pointer transition-colors duration-hover hover:bg-surface focus-within:bg-surface"
          ),
          onClick: clickable ? () => onRowClick(row, index) : void 0,
          children: columns.map((column) => /* @__PURE__ */ jsx28(
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
var init_DataTable = __esm({
  "resources/js/Components/DataTable.jsx"() {
    init_format();
    init_EmptyState();
    init_ErrorState();
    init_Skeleton();
  }
});

// resources/js/Pages/Admin/Settings/Index.jsx
var Index_exports = {};
__export(Index_exports, {
  default: () => SettingsIndex
});
import React29, { useEffect as useEffect8, useMemo as useMemo2, useState as useState7 } from "react";
import { jsx as jsx29, jsxs as jsxs24 } from "react/jsx-runtime";
function useToastFromFlash(flash) {
  const [toast, setToast] = useState7(null);
  const success = flash && typeof flash.success === "string" ? flash.success : null;
  const error = flash && typeof flash.error === "string" ? flash.error : null;
  useEffect8(() => {
    if (success) setToast({ tone: "success", message: success });
    else if (error) setToast({ tone: "error", message: error });
  }, [success, error]);
  const dismiss = () => setToast(null);
  return [toast, dismiss];
}
function TabNav({ active, onSelect }) {
  return /* @__PURE__ */ jsx29("div", { className: "border-b border-line", children: /* @__PURE__ */ jsx29(
    "div",
    {
      role: "tablist",
      "aria-label": "Tab pengaturan",
      className: "flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      children: TABS.map((item) => {
        const isActive2 = item.key === active;
        return /* @__PURE__ */ jsx29(
          "button",
          {
            type: "button",
            role: "tab",
            id: `tab-${item.key}`,
            "aria-selected": isActive2,
            "aria-controls": `panel-${item.key}`,
            tabIndex: isActive2 ? 0 : -1,
            onClick: () => onSelect(item.key),
            className: cn(
              "flex h-11 shrink-0 items-center whitespace-nowrap px-4 text-label transition-colors duration-150",
              isActive2 ? "border-b-2 border-brand text-brand" : "text-slate-600 hover:text-ink"
            ),
            children: item.label
          },
          item.key
        );
      })
    }
  ) });
}
function SectionCard({ title = null, description = null, children }) {
  return /* @__PURE__ */ jsxs24("section", { className: "card p-6", children: [
    title ? /* @__PURE__ */ jsxs24("header", { className: "mb-4", children: [
      /* @__PURE__ */ jsx29("h2", { className: "text-h3 text-ink", children: title }),
      description ? /* @__PURE__ */ jsx29("p", { className: "mt-1 text-meta text-slate-500", children: description }) : null
    ] }) : null,
    /* @__PURE__ */ jsx29("div", { className: "flex flex-col gap-4", children })
  ] });
}
function StickySave({ dirty, processing, resetLabel = null, onReset = null, saveLabel = "Simpan" }) {
  return /* @__PURE__ */ jsx29("div", { className: "sticky bottom-0 z-10 -mx-4 mt-6 border-t border-line bg-white px-4 py-3 lg:-mx-6 lg:px-6", children: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsx29("p", { className: "text-meta text-slate-500", "aria-live": "polite", children: dirty ? "Perubahan belum disimpan." : "Tidak ada perubahan." }),
    /* @__PURE__ */ jsxs24("div", { className: "flex items-center gap-2", children: [
      dirty && onReset && resetLabel ? /* @__PURE__ */ jsx29(Button, { variant: "secondary", onClick: onReset, disabled: processing, children: resetLabel }) : null,
      /* @__PURE__ */ jsx29(Button, { type: "submit", loading: processing, disabled: !dirty || processing, children: saveLabel })
    ] })
  ] }) });
}
function Thumb({ src, size = 48, className = "" }) {
  const [failed, setFailed] = useState7(false);
  useEffect8(() => {
    setFailed(false);
  }, [src]);
  const style = { width: `${size}px`, height: `${size}px` };
  if (!src || failed) {
    return /* @__PURE__ */ jsx29(
      "span",
      {
        style,
        className: cn("flex shrink-0 items-center justify-center rounded-md border border-line bg-surface text-slate-400", className),
        children: /* @__PURE__ */ jsx29(ImageOffIcon, { size: 18 })
      }
    );
  }
  return /* @__PURE__ */ jsx29(
    "img",
    {
      src,
      alt: "",
      style,
      loading: "lazy",
      onError: () => setFailed(true),
      className: cn("shrink-0 rounded-md border border-line object-cover", className)
    }
  );
}
function ImageField({
  id,
  label,
  hint = null,
  required = false,
  accept,
  maxKb,
  extensions,
  file = null,
  currentPath = null,
  error = null,
  message,
  onSelect
}) {
  const [objectUrl, setObjectUrl] = useState7(null);
  useEffect8(() => {
    if (!file) {
      setObjectUrl(null);
      return void 0;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : void 0;
  const sizeLabel = maxKb >= 1024 ? `${Math.round(maxKb / 1024)} MB` : `${maxKb} KB`;
  return /* @__PURE__ */ jsx29(Field, { label, htmlFor: id, required, hint, error, children: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4", children: [
    /* @__PURE__ */ jsx29(Thumb, { src: objectUrl || currentPath || null, size: 112, className: "rounded-lg" }),
    /* @__PURE__ */ jsxs24("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
      /* @__PURE__ */ jsx29(
        "input",
        {
          id,
          type: "file",
          accept,
          "aria-describedby": describedBy,
          "aria-invalid": error ? "true" : void 0,
          onChange: (event) => {
            const picked = event.target.files && event.target.files[0] ? event.target.files[0] : null;
            onSelect(picked);
            event.target.value = "";
          },
          className: cn(
            "field h-auto cursor-pointer py-2 text-meta file:mr-3 file:rounded-sm file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-meta file:font-semibold file:text-ink hover:file:bg-slate-200",
            error && "field-error"
          )
        }
      ),
      /* @__PURE__ */ jsxs24("p", { className: "text-meta text-slate-500", children: [
        message,
        " Maksimal ",
        sizeLabel,
        "."
      ] }),
      file ? /* @__PURE__ */ jsxs24("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx29("span", { className: "truncate text-meta text-ink-soft", children: file.name }),
        /* @__PURE__ */ jsx29(Button, { variant: "ghost", size: "sm", onClick: () => onSelect(null), children: "Batalkan pilihan" })
      ] }) : null
    ] })
  ] }) });
}
function ArrayRow({ children, onRemove, removeLabel }) {
  return /* @__PURE__ */ jsx29("div", { className: "rounded-lg border border-line p-3", children: /* @__PURE__ */ jsxs24("div", { className: "flex items-start gap-2", children: [
    /* @__PURE__ */ jsx29("div", { className: "grid min-w-0 flex-1 gap-3 sm:grid-cols-2", children }),
    /* @__PURE__ */ jsx29(IconButton, { label: removeLabel, onClick: onRemove, className: "text-danger", children: /* @__PURE__ */ jsx29(TrashIcon, { size: 18 }) })
  ] }) });
}
function StatusCell({ active }) {
  return /* @__PURE__ */ jsxs24("span", { className: "inline-flex items-center gap-2 text-meta text-ink", children: [
    /* @__PURE__ */ jsx29(
      "span",
      {
        "aria-hidden": "true",
        className: cn("h-2 w-2 rounded-full", active ? "bg-success" : "bg-slate-300")
      }
    ),
    active ? "Aktif" : "Nonaktif"
  ] });
}
function ConfirmDialog({ open, title, description, confirmLabel, processing, onConfirm, onCancel }) {
  return /* @__PURE__ */ jsx29(
    Modal,
    {
      open,
      title,
      description,
      onClose: processing ? () => {
      } : onCancel,
      size: "md",
      footer: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-2 sm:flex-row sm:justify-end", children: [
        /* @__PURE__ */ jsx29(Button, { variant: "secondary", onClick: onCancel, disabled: processing, children: "Batal" }),
        /* @__PURE__ */ jsx29(Button, { variant: "danger", onClick: onConfirm, loading: processing, children: confirmLabel })
      ] }),
      children: /* @__PURE__ */ jsx29("p", { className: "text-body text-ink-soft", children: "Tindakan ini tidak bisa dibatalkan." })
    }
  );
}
function SettingsIndex({ auth = null, pengaturan = null, carousels = [], faqs = [], flash = null, midtrans = null }) {
  const [tab, setTab] = useState7(() => readTabFromUrl());
  const [pendingTab, setPendingTab] = useState7(null);
  const [reloading, setReloading] = useState7(false);
  const [toast, dismissToast] = useToastFromFlash(flash);
  const [actionError, setActionError] = useState7(null);
  const [logoError, setLogoError] = useState7(null);
  const [faviconError, setFaviconError] = useState7(null);
  const [footerLinksError, setFooterLinksError] = useState7(null);
  const [carouselEditing, setCarouselEditing] = useState7(null);
  const [carouselOpen, setCarouselOpen] = useState7(false);
  const [carouselImageError, setCarouselImageError] = useState7(null);
  const [carouselPendingDelete, setCarouselPendingDelete] = useState7(null);
  const [faqEditing, setFaqEditing] = useState7(null);
  const [faqOpen, setFaqOpen] = useState7(false);
  const [faqPendingDelete, setFaqPendingDelete] = useState7(null);
  const [deleting, setDeleting] = useState7(false);
  const groups = useMemo2(() => {
    const source = asObject(pengaturan);
    return {
      umum: asObject(source.umum),
      header: asObject(source.header),
      footer: asObject(source.footer),
      kontak: asObject(source.kontak),
      seo: asObject(source.seo),
      pembayaran: asObject(source.pembayaran),
      landing: asObject(source.landing)
    };
  }, [pengaturan]);
  const hero = useMemo2(() => asObject(groups.landing.landing_hero), [groups]);
  const sections = useMemo2(() => asObject(groups.landing.landing_sections), [groups]);
  const footerLinksMode = useMemo2(() => readFooterLinksMode(groups.footer.footer_links), [groups]);
  const sectionKeys = useMemo2(
    () => ({
      announcement: Object.keys(asObject(sections.announcement)).length > 0,
      trust_strip: Array.isArray(sections.trust_strip),
      featured: Object.keys(asObject(sections.featured)).length > 0,
      promo: Object.keys(asObject(sections.promo)).length > 0,
      why_us: Object.keys(asObject(sections.why_us)).length > 0,
      newsletter: Object.keys(asObject(sections.newsletter)).length > 0
    }),
    [sections]
  );
  const settingsForm = useForm({
    store_name: text(groups.umum.store_name),
    store_tagline: text(groups.umum.store_tagline),
    store_logo: null,
    store_favicon: null,
    hapus_store_logo: false,
    header_nav: asList(groups.header.header_nav).map((item) => ({
      label: text(asObject(item).label),
      url: text(asObject(item).url)
    })),
    footer_about: text(groups.footer.footer_about),
    footer_links: footerLinksMode === "flat" ? asList(groups.footer.footer_links).map((item) => ({
      label: text(asObject(item).label),
      url: text(asObject(item).url)
    })) : asList(groups.footer.footer_links).map((column) => ({
      title: text(asObject(column).title),
      items: asList(asObject(column).items).map((item) => ({
        label: text(asObject(item).label),
        url: text(asObject(item).url)
      }))
    })),
    footer_social: asList(groups.footer.footer_social).map((item) => {
      const entry = asObject(item);
      const platform = text(entry.platform) || text(entry.name);
      return {
        platform: SOCIAL_PLATFORMS.includes(platform) ? platform : SOCIAL_PLATFORMS[0],
        label: text(entry.label),
        url: text(entry.url) || text(entry.href)
      };
    }),
    contact_email: text(groups.kontak.contact_email),
    contact_phone: text(groups.kontak.contact_phone),
    contact_whatsapp: text(groups.kontak.contact_whatsapp),
    contact_address: text(groups.kontak.contact_address),
    contact_map_embed: text(groups.kontak.contact_map_embed),
    seo_default_title: text(groups.seo.seo_default_title),
    seo_default_description: text(groups.seo.seo_default_description),
    shipping_cost_default: text(groups.pembayaran.shipping_cost_default),
    midtrans_client_key: text(groups.pembayaran.midtrans_client_key),
    midtrans_is_production: Boolean(groups.pembayaran.midtrans_is_production)
  });
  const landingForm = useForm({
    landing_hero: {
      title: text(hero.title),
      subtitle: text(hero.subtitle),
      cta_label: text(hero.cta_label),
      cta_url: text(hero.cta_url),
      image: text(hero.image)
    },
    announcement: {
      text: text(asObject(sections.announcement).text),
      url: text(asObject(sections.announcement).url),
      is_active: Boolean(asObject(sections.announcement).is_active)
    },
    trust_strip: asList(sections.trust_strip).map((item) => ({
      icon: text(asObject(item).icon),
      title: text(asObject(item).title),
      subtitle: text(asObject(item).subtitle)
    })),
    featured: {
      title: text(asObject(sections.featured).title),
      subtitle: text(asObject(sections.featured).subtitle),
      limit: text(asObject(sections.featured).limit)
    },
    promo: {
      title: text(asObject(sections.promo).title),
      subtitle: text(asObject(sections.promo).subtitle),
      cta_label: text(asObject(sections.promo).cta_label),
      cta_url: text(asObject(sections.promo).cta_url),
      image: text(asObject(sections.promo).image),
      is_active: Boolean(asObject(sections.promo).is_active)
    },
    why_us_title: text(asObject(sections.why_us).title),
    why_us_items: asList(asObject(sections.why_us).items).map((item) => ({
      title: text(asObject(item).title),
      body: text(asObject(item).body)
    })),
    newsletter: {
      title: text(asObject(sections.newsletter).title),
      subtitle: text(asObject(sections.newsletter).subtitle),
      button_text: text(asObject(sections.newsletter).button_text)
    }
  });
  const carouselForm = useForm({
    title: "",
    subtitle: "",
    image: null,
    link: "",
    button_text: "",
    sort_order: "0",
    is_active: true
  });
  const faqForm = useForm({
    question: "",
    answer: "",
    sort_order: "0",
    is_active: true
  });
  const carouselRows = asList(carousels);
  const faqRows = asList(faqs);
  const anyDirty = settingsForm.isDirty || landingForm.isDirty || carouselForm.isDirty || faqForm.isDirty;
  const applyTab = (next) => {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      window.history.replaceState(window.history.state, "", url.toString());
    }
  };
  const requestTab = (next) => {
    if (next === tab) return;
    if (anyDirty) {
      setPendingTab(next);
      return;
    }
    applyTab(next);
  };
  const discardAndSwitch = () => {
    settingsForm.reset();
    landingForm.reset();
    carouselForm.reset();
    faqForm.reset();
    setLogoError(null);
    setFaviconError(null);
    setFooterLinksError(null);
    setCarouselImageError(null);
    setCarouselOpen(false);
    setCarouselEditing(null);
    setFaqOpen(false);
    setFaqEditing(null);
    const next = pendingTab;
    setPendingTab(null);
    if (next) applyTab(next);
  };
  const reload = () => {
    setReloading(true);
    setActionError(null);
    router.reload({ preserveScroll: true, onFinish: () => setReloading(false) });
  };
  const setField = (key, value) => settingsForm.setData(key, value);
  const setRows = (key, rows) => settingsForm.setData(key, rows);
  const addRow = (key, row, max) => {
    const rows = asList(settingsForm.data[key]);
    if (rows.length >= max) return;
    setRows(key, [...rows, row]);
  };
  const updateRow = (key, index, field, value) => setRows(
    key,
    asList(settingsForm.data[key]).map(
      (row, position) => position === index ? { ...asObject(row), [field]: value } : row
    )
  );
  const removeRow = (key, index) => setRows(key, asList(settingsForm.data[key]).filter((_, position) => position !== index));
  const updateColumn = (columnIndex, next) => setRows(
    "footer_links",
    asList(settingsForm.data.footer_links).map((column, position) => position === columnIndex ? next : column)
  );
  const buildFooterLinksPayload = () => {
    const rows = asList(settingsForm.data.footer_links);
    if (footerLinksMode === "flat") {
      return cleanRows(rows, ["label", "url"]).map((row) => ({
        label: trimmed(row.label),
        url: trimmed(row.url)
      }));
    }
    return cleanRows(rows, ["title", "items"]).map((column) => {
      const items = cleanRows(asObject(column).items, ["label", "url"]).map((item) => ({
        label: trimmed(asObject(item).label),
        url: trimmed(asObject(item).url)
      }));
      const title = trimmed(asObject(column).title);
      return {
        title,
        items,
        label: title,
        url: items[0]?.url || "/"
      };
    });
  };
  const footerColumnNeedsTitle = () => {
    if (footerLinksMode === "flat") return false;
    return cleanRows(asList(settingsForm.data.footer_links), ["items"]).some(
      (column) => asList(asObject(column).items).some((item) => trimmed(asObject(item).url) !== "") && trimmed(asObject(column).title) === ""
    );
  };
  const submitSettings = (tabKey, event) => {
    event.preventDefault();
    if (tabKey === "footer" && footerColumnNeedsTitle()) {
      setFooterLinksError("Judul kolom wajib diisi.");
      return;
    }
    setFooterLinksError(null);
    const keys = TAB_KEYS[tabKey] ?? [];
    const needsMultipart = tabKey === "umum";
    settingsForm.transform((data) => {
      const payload = {};
      keys.forEach((key) => {
        if (key === "store_logo" || key === "store_favicon") {
          if (isFileValue(data[key])) payload[key] = data[key];
          return;
        }
        if (key === "hapus_store_logo") {
          if (data[key]) payload[key] = 1;
          return;
        }
        if (key === "midtrans_is_production") {
          payload[key] = data[key] ? 1 : 0;
          return;
        }
        if (key === "shipping_cost_default") {
          payload[key] = clampInt(data[key], 0, 1e6, 0);
          return;
        }
        if (key === "header_nav") {
          payload[key] = cleanRows(data.header_nav, ["label", "url"]).map((row) => ({
            label: trimmed(row.label),
            url: trimmed(row.url)
          }));
          return;
        }
        if (key === "footer_links") {
          payload[key] = buildFooterLinksPayload();
          return;
        }
        if (key === "footer_social") {
          payload[key] = cleanRows(data.footer_social, ["label", "url"]).map((row) => {
            const entry = asObject(row);
            return {
              platform: SOCIAL_PLATFORMS.includes(text(entry.platform)) ? text(entry.platform) : SOCIAL_PLATFORMS[0],
              label: trimmed(entry.label),
              url: trimmed(entry.url)
            };
          });
          return;
        }
        payload[key] = orNull(data[key]);
      });
      return payload;
    });
    const options = {
      preserveScroll: true,
      onFinish: () => settingsForm.transform((data) => data)
    };
    if (needsMultipart) {
      settingsForm.transform((data) => {
        const payload = {};
        keys.forEach((key) => {
          if (key === "store_logo" || key === "store_favicon") {
            if (isFileValue(data[key])) payload[key] = data[key];
            return;
          }
          if (key === "hapus_store_logo") {
            if (data[key]) payload[key] = 1;
            return;
          }
          payload[key] = orNull(data[key]);
        });
        return { ...payload, _method: "PUT" };
      });
      settingsForm.post(SETTINGS_URL, { ...options, forceFormData: true });
      return;
    }
    settingsForm.put(SETTINGS_URL, options);
  };
  const removeLogo = () => {
    setActionError(null);
    settingsForm.transform(() => ({ hapus_store_logo: 1, _method: "PUT" }));
    settingsForm.post(SETTINGS_URL, {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => settingsForm.transform((data) => data)
    });
  };
  const submitLanding = (event) => {
    event.preventDefault();
    const data = landingForm.data;
    landingForm.transform(() => {
      const payload = { landing_hero: {}, landing_sections: {} };
      payload.landing_hero = {
        title: trimmed(data.landing_hero.title),
        subtitle: orNull(data.landing_hero.subtitle),
        cta_label: orNull(data.landing_hero.cta_label),
        cta_url: orNull(data.landing_hero.cta_url),
        image: orNull(data.landing_hero.image)
      };
      if (sectionKeys.announcement) {
        payload.landing_sections.announcement = {
          text: orNull(data.announcement.text),
          url: orNull(data.announcement.url),
          is_active: data.announcement.is_active ? 1 : 0
        };
      }
      if (sectionKeys.trust_strip) {
        payload.landing_sections.trust_strip = asList(data.trust_strip).filter((row) => trimmed(asObject(row).title) !== "").map((row) => {
          const entry = asObject(row);
          return {
            icon: orNull(entry.icon),
            title: trimmed(entry.title),
            subtitle: orNull(entry.subtitle)
          };
        });
      }
      if (sectionKeys.featured) {
        payload.landing_sections.featured = {
          title: orNull(data.featured.title),
          subtitle: orNull(data.featured.subtitle),
          limit: clampInt(data.featured.limit, 1, 12, 8)
        };
      }
      if (sectionKeys.promo) {
        payload.landing_sections.promo = {
          title: orNull(data.promo.title),
          subtitle: orNull(data.promo.subtitle),
          cta_label: orNull(data.promo.cta_label),
          cta_url: orNull(data.promo.cta_url),
          image: orNull(data.promo.image),
          is_active: data.promo.is_active ? 1 : 0
        };
      }
      if (sectionKeys.why_us) {
        payload.landing_sections.why_us = {
          title: orNull(data.why_us_title),
          items: asList(data.why_us_items).filter((row) => trimmed(asObject(row).title) !== "" && trimmed(asObject(row).body) !== "").map((row) => {
            const entry = asObject(row);
            return { title: trimmed(entry.title), body: trimmed(entry.body) };
          })
        };
      }
      if (sectionKeys.newsletter) {
        payload.landing_sections.newsletter = {
          title: orNull(data.newsletter.title),
          subtitle: orNull(data.newsletter.subtitle),
          button_text: orNull(data.newsletter.button_text)
        };
      }
      return payload;
    });
    landingForm.put(LANDING_URL, {
      preserveScroll: true,
      onFinish: () => landingForm.transform((data2) => data2)
    });
  };
  const openCarouselCreate = () => {
    carouselForm.reset();
    carouselForm.clearErrors();
    setCarouselImageError(null);
    setCarouselEditing(null);
    setCarouselOpen(true);
  };
  const openCarouselEdit = (row) => {
    carouselForm.clearErrors();
    setCarouselImageError(null);
    carouselForm.setData({
      title: text(row.title),
      subtitle: text(row.subtitle),
      image: null,
      link: text(row.link),
      button_text: text(row.button_text),
      sort_order: text(row.sort_order ?? "0"),
      is_active: Boolean(row.is_active)
    });
    setCarouselEditing(row);
    setCarouselOpen(true);
  };
  const closeCarousel = () => {
    setCarouselOpen(false);
    setCarouselEditing(null);
    setCarouselImageError(null);
  };
  const submitCarousel = (event) => {
    event.preventDefault();
    const editing = carouselEditing;
    if (!editing && !isFileValue(carouselForm.data.image)) {
      setCarouselImageError("Gambar carousel wajib diunggah.");
      return;
    }
    setCarouselImageError(null);
    carouselForm.transform((data) => {
      const payload = {
        title: trimmed(data.title),
        subtitle: orNull(data.subtitle),
        link: orNull(data.link),
        button_text: orNull(data.button_text),
        sort_order: clampInt(data.sort_order, 0, 999, 0),
        is_active: data.is_active ? 1 : 0
      };
      if (isFileValue(data.image)) payload.image = data.image;
      if (editing) payload._method = "PUT";
      return payload;
    });
    carouselForm.post(editing ? `${CAROUSEL_URL}/${editing.id}` : CAROUSEL_URL, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => closeCarousel(),
      onFinish: () => carouselForm.transform((data) => data)
    });
  };
  const openFaqCreate = () => {
    faqForm.reset();
    faqForm.clearErrors();
    setFaqEditing(null);
    setFaqOpen(true);
  };
  const openFaqEdit = (row) => {
    faqForm.clearErrors();
    faqForm.setData({
      question: text(row.question),
      answer: text(row.answer),
      sort_order: text(row.sort_order ?? "0"),
      is_active: Boolean(row.is_active)
    });
    setFaqEditing(row);
    setFaqOpen(true);
  };
  const closeFaq = () => {
    setFaqOpen(false);
    setFaqEditing(null);
  };
  const submitFaq = (event) => {
    event.preventDefault();
    const editing = faqEditing;
    faqForm.transform((data) => {
      const payload = {
        question: trimmed(data.question),
        answer: trimmed(data.answer),
        sort_order: clampInt(data.sort_order, 0, 999, 0),
        is_active: data.is_active ? 1 : 0
      };
      if (editing) payload._method = "PUT";
      return payload;
    });
    faqForm.post(editing ? `${FAQ_URL}/${editing.id}` : FAQ_URL, {
      preserveScroll: true,
      onSuccess: () => closeFaq(),
      onFinish: () => faqForm.transform((data) => data)
    });
  };
  const confirmDelete = () => {
    const target = carouselPendingDelete ? { url: `${CAROUSEL_URL}/${carouselPendingDelete.id}` } : faqPendingDelete ? { url: `${FAQ_URL}/${faqPendingDelete.id}` } : null;
    if (!target) return;
    setDeleting(true);
    setActionError(null);
    router.delete(target.url, {
      preserveScroll: true,
      onError: (errors) => {
        const first = Object.values(errors)[0];
        setActionError(typeof first === "string" ? first : "Data gagal dihapus. Coba lagi.");
      },
      onFinish: () => {
        setDeleting(false);
        setCarouselPendingDelete(null);
        setFaqPendingDelete(null);
      }
    });
  };
  const carouselColumns = [
    {
      key: "image",
      header: "Gambar",
      render: (row) => /* @__PURE__ */ jsx29(Thumb, { src: text(row.image) || null, size: 48 })
    },
    {
      key: "title",
      header: "Judul",
      render: (row) => /* @__PURE__ */ jsx29("span", { className: "block max-w-[240px] truncate font-semibold text-ink", children: text(row.title) || "-" })
    },
    {
      key: "link",
      header: "Tautan",
      render: (row) => /* @__PURE__ */ jsx29("span", { className: "block max-w-[200px] truncate text-meta text-ink-soft", children: text(row.link) || "-" })
    },
    {
      key: "sort_order",
      header: "Urutan",
      render: (row) => /* @__PURE__ */ jsx29("span", { className: "text-meta", children: text(row.sort_order ?? 0) })
    },
    {
      key: "is_active",
      header: "Status",
      render: (row) => /* @__PURE__ */ jsx29(StatusCell, { active: Boolean(row.is_active) })
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "right",
      render: (row) => /* @__PURE__ */ jsxs24("div", { className: "flex items-center justify-end gap-2", children: [
        /* @__PURE__ */ jsx29(Button, { variant: "secondary", size: "sm", onClick: () => openCarouselEdit(row), children: "Ubah" }),
        /* @__PURE__ */ jsx29(Button, { variant: "danger", size: "sm", onClick: () => setCarouselPendingDelete(row), children: "Hapus" })
      ] })
    }
  ];
  const faqColumns = [
    {
      key: "question",
      header: "Pertanyaan",
      render: (row) => /* @__PURE__ */ jsx29("span", { className: "block max-w-[320px] truncate font-semibold text-ink", children: text(row.question) || "-" })
    },
    {
      key: "answer",
      header: "Jawaban",
      render: (row) => /* @__PURE__ */ jsx29("span", { className: "block max-w-[360px] truncate text-meta text-ink-soft", children: text(row.answer) || "-" })
    },
    {
      key: "sort_order",
      header: "Urutan",
      render: (row) => /* @__PURE__ */ jsx29("span", { className: "text-meta", children: text(row.sort_order ?? 0) })
    },
    {
      key: "is_active",
      header: "Status",
      render: (row) => /* @__PURE__ */ jsx29(StatusCell, { active: Boolean(row.is_active) })
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "right",
      render: (row) => /* @__PURE__ */ jsxs24("div", { className: "flex items-center justify-end gap-2", children: [
        /* @__PURE__ */ jsx29(Button, { variant: "secondary", size: "sm", onClick: () => openFaqEdit(row), children: "Ubah" }),
        /* @__PURE__ */ jsx29(Button, { variant: "danger", size: "sm", onClick: () => setFaqPendingDelete(row), children: "Hapus" })
      ] })
    }
  ];
  const renderUmum = () => /* @__PURE__ */ jsxs24("form", { onSubmit: (event) => submitSettings("umum", event), noValidate: false, children: [
    /* @__PURE__ */ jsxs24(SectionCard, { title: "Identitas toko", description: "Dipakai di header, footer, dan metadata halaman.", children: [
      /* @__PURE__ */ jsx29(Field, { label: "Nama toko", htmlFor: "store_name", required: true, error: settingsForm.errors.store_name, children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "store_name",
          name: "store_name",
          maxLength: 100,
          value: settingsForm.data.store_name,
          error: settingsForm.errors.store_name,
          onChange: (event) => setField("store_name", event.target.value)
        }
      ) }),
      /* @__PURE__ */ jsx29(Field, { label: "Tagline toko", htmlFor: "store_tagline", hint: "Muncul di bawah nama toko.", error: settingsForm.errors.store_tagline, children: /* @__PURE__ */ jsx29(
        Textarea,
        {
          id: "store_tagline",
          name: "store_tagline",
          rows: 2,
          maxLength: 150,
          value: settingsForm.data.store_tagline,
          error: settingsForm.errors.store_tagline,
          onChange: (event) => setField("store_tagline", event.target.value)
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs24(SectionCard, { title: "Logo dan favicon", children: [
      /* @__PURE__ */ jsx29(
        ImageField,
        {
          id: "store_logo",
          label: "Logo toko",
          hint: "Rasio 1:1, tampil di header dan struk.",
          message: `Logo harus gambar ${IMAGE_TYPE_LABEL}.`,
          accept: LOGO_ACCEPT,
          extensions: LOGO_EXTENSIONS,
          maxKb: 2048,
          file: isFileValue(settingsForm.data.store_logo) ? settingsForm.data.store_logo : null,
          currentPath: text(groups.umum.store_logo) || null,
          error: logoError || settingsForm.errors.store_logo,
          onSelect: (file) => {
            const message = checkUpload(file, {
              maxKb: 2048,
              extensions: LOGO_EXTENSIONS,
              message: `Logo harus gambar ${IMAGE_TYPE_LABEL} maksimal 2 MB.`
            });
            setLogoError(message);
            setField("store_logo", message ? null : file);
          }
        }
      ),
      text(groups.umum.store_logo) && !isFileValue(settingsForm.data.store_logo) ? /* @__PURE__ */ jsx29(Button, { variant: "secondary", onClick: () => settingsForm.setData("hapus_store_logo", true), disabled: settingsForm.processing, children: "Hapus logo" }) : null,
      settingsForm.data.hapus_store_logo ? /* @__PURE__ */ jsx29(InlineNotice, { tone: "warning", title: "Logo akan dihapus saat kamu menyimpan." }) : null,
      /* @__PURE__ */ jsx29(
        ImageField,
        {
          id: "store_favicon",
          label: "Favicon toko",
          hint: "Ikon kecil di tab browser.",
          message: "Favicon harus gambar maksimal 512 KB.",
          accept: FAVICON_ACCEPT,
          extensions: FAVICON_EXTENSIONS,
          maxKb: 512,
          file: isFileValue(settingsForm.data.store_favicon) ? settingsForm.data.store_favicon : null,
          currentPath: text(groups.umum.store_favicon) || null,
          error: faviconError || settingsForm.errors.store_favicon,
          onSelect: (file) => {
            const message = checkUpload(file, {
              maxKb: 512,
              extensions: FAVICON_EXTENSIONS,
              message: "Favicon harus gambar maksimal 512 KB."
            });
            setFaviconError(message);
            setField("store_favicon", message ? null : file);
          }
        }
      )
    ] }),
    settingsForm.errors.hapus_store_logo ? /* @__PURE__ */ jsx29(InlineNotice, { tone: "error", title: settingsForm.errors.hapus_store_logo }) : null,
    /* @__PURE__ */ jsx29(
      StickySave,
      {
        dirty: settingsForm.isDirty,
        processing: settingsForm.processing,
        resetLabel: "Batalkan perubahan",
        onReset: () => {
          settingsForm.reset();
          setLogoError(null);
          setFaviconError(null);
        }
      }
    )
  ] });
  const renderHeroSection = () => /* @__PURE__ */ jsxs24(SectionCard, { title: "Hero", description: "Bagian paling atas halaman beranda.", children: [
    /* @__PURE__ */ jsx29(Field, { label: "Judul hero", htmlFor: "landing_hero_title", required: true, error: landingForm.errors["landing_hero.title"], children: /* @__PURE__ */ jsx29(
      Input,
      {
        id: "landing_hero_title",
        maxLength: 150,
        value: landingForm.data.landing_hero.title,
        error: landingForm.errors["landing_hero.title"],
        onChange: (event) => landingForm.setData("landing_hero", { ...landingForm.data.landing_hero, title: event.target.value })
      }
    ) }),
    /* @__PURE__ */ jsx29(Field, { label: "Subjudul hero", htmlFor: "landing_hero_subtitle", error: landingForm.errors["landing_hero.subtitle"], children: /* @__PURE__ */ jsx29(
      Textarea,
      {
        id: "landing_hero_subtitle",
        rows: 2,
        maxLength: 255,
        value: landingForm.data.landing_hero.subtitle,
        error: landingForm.errors["landing_hero.subtitle"],
        onChange: (event) => landingForm.setData("landing_hero", { ...landingForm.data.landing_hero, subtitle: event.target.value })
      }
    ) }),
    /* @__PURE__ */ jsxs24("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsx29(Field, { label: "Label tombol", htmlFor: "landing_hero_cta_label", error: landingForm.errors["landing_hero.cta_label"], children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "landing_hero_cta_label",
          maxLength: 60,
          value: landingForm.data.landing_hero.cta_label,
          error: landingForm.errors["landing_hero.cta_label"],
          onChange: (event) => landingForm.setData("landing_hero", { ...landingForm.data.landing_hero, cta_label: event.target.value })
        }
      ) }),
      /* @__PURE__ */ jsx29(Field, { label: "Tautan tombol", htmlFor: "landing_hero_cta_url", error: landingForm.errors["landing_hero.cta_url"], children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "landing_hero_cta_url",
          maxLength: 255,
          placeholder: "/produk",
          value: landingForm.data.landing_hero.cta_url,
          error: landingForm.errors["landing_hero.cta_url"],
          onChange: (event) => landingForm.setData("landing_hero", { ...landingForm.data.landing_hero, cta_url: event.target.value })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx29(
      Field,
      {
        label: "Gambar hero",
        htmlFor: "landing_hero_image",
        hint: "Path berkas di penyimpanan, contoh /storage/landing/hero.webp.",
        error: landingForm.errors["landing_hero.image"],
        children: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [
          /* @__PURE__ */ jsx29(Thumb, { src: text(landingForm.data.landing_hero.image) || null, size: 112, className: "rounded-lg" }),
          /* @__PURE__ */ jsx29(
            Input,
            {
              id: "landing_hero_image",
              maxLength: 255,
              value: landingForm.data.landing_hero.image,
              error: landingForm.errors["landing_hero.image"],
              onChange: (event) => landingForm.setData("landing_hero", { ...landingForm.data.landing_hero, image: event.target.value })
            }
          )
        ] })
      }
    )
  ] });
  const renderLanding = () => /* @__PURE__ */ jsxs24("form", { onSubmit: submitLanding, children: [
    renderHeroSection(),
    sectionKeys.announcement ? /* @__PURE__ */ jsxs24(SectionCard, { title: "Pengumuman", description: "Bar tipis di atas hero.", children: [
      /* @__PURE__ */ jsx29(Field, { label: "Teks pengumuman", htmlFor: "announcement_text", error: landingForm.errors["landing_sections.announcement.text"], children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "announcement_text",
          maxLength: 255,
          value: landingForm.data.announcement.text,
          error: landingForm.errors["landing_sections.announcement.text"],
          onChange: (event) => landingForm.setData("announcement", { ...landingForm.data.announcement, text: event.target.value })
        }
      ) }),
      /* @__PURE__ */ jsxs24("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx29(Field, { label: "Tautan pengumuman", htmlFor: "announcement_url", error: landingForm.errors["landing_sections.announcement.url"], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "announcement_url",
            maxLength: 255,
            value: landingForm.data.announcement.url,
            error: landingForm.errors["landing_sections.announcement.url"],
            onChange: (event) => landingForm.setData("announcement", { ...landingForm.data.announcement, url: event.target.value })
          }
        ) }),
        /* @__PURE__ */ jsx29(Field, { label: "Status pengumuman", htmlFor: "announcement_active", error: landingForm.errors["landing_sections.announcement.is_active"], children: /* @__PURE__ */ jsxs24(
          Select,
          {
            id: "announcement_active",
            value: landingForm.data.announcement.is_active ? "1" : "0",
            error: landingForm.errors["landing_sections.announcement.is_active"],
            onChange: (event) => landingForm.setData("announcement", {
              ...landingForm.data.announcement,
              is_active: event.target.value === "1"
            }),
            children: [
              /* @__PURE__ */ jsx29("option", { value: "1", children: "Tampil" }),
              /* @__PURE__ */ jsx29("option", { value: "0", children: "Disembunyikan" })
            ]
          }
        ) })
      ] })
    ] }) : null,
    sectionKeys.trust_strip ? /* @__PURE__ */ jsxs24(SectionCard, { title: "Keunggulan", description: `Maksimal ${MAX_TRUST} item.`, children: [
      /* @__PURE__ */ jsx29("div", { className: "flex flex-col gap-3", children: asList(landingForm.data.trust_strip).map((row, index) => /* @__PURE__ */ jsxs24(
        ArrayRow,
        {
          removeLabel: `Hapus keunggulan ke-${index + 1}`,
          onRemove: () => landingForm.setData(
            "trust_strip",
            asList(landingForm.data.trust_strip).filter((_, position) => position !== index)
          ),
          children: [
            /* @__PURE__ */ jsx29(Field, { label: "Ikon", htmlFor: fieldId("trust_icon", index), error: landingForm.errors[`landing_sections.trust_strip.${index}.icon`], children: /* @__PURE__ */ jsxs24(
              Select,
              {
                id: fieldId("trust_icon", index),
                value: row.icon,
                error: landingForm.errors[`landing_sections.trust_strip.${index}.icon`],
                onChange: (event) => landingForm.setData(
                  "trust_strip",
                  asList(landingForm.data.trust_strip).map(
                    (item, position) => position === index ? { ...item, icon: event.target.value } : item
                  )
                ),
                children: [
                  /* @__PURE__ */ jsx29("option", { value: "", children: "Tanpa ikon" }),
                  TRUST_ICON_KEYS.map((key) => /* @__PURE__ */ jsx29("option", { value: key, children: key }, key))
                ]
              }
            ) }),
            /* @__PURE__ */ jsx29(Field, { label: "Judul", htmlFor: fieldId("trust_title", index), error: landingForm.errors[`landing_sections.trust_strip.${index}.title`], children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: fieldId("trust_title", index),
                maxLength: 80,
                value: row.title,
                error: landingForm.errors[`landing_sections.trust_strip.${index}.title`],
                onChange: (event) => landingForm.setData(
                  "trust_strip",
                  asList(landingForm.data.trust_strip).map(
                    (item, position) => position === index ? { ...item, title: event.target.value } : item
                  )
                )
              }
            ) }),
            /* @__PURE__ */ jsx29(Field, { label: "Keterangan", htmlFor: fieldId("trust_subtitle", index), error: landingForm.errors[`landing_sections.trust_strip.${index}.subtitle`], children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: fieldId("trust_subtitle", index),
                maxLength: 120,
                value: row.subtitle,
                error: landingForm.errors[`landing_sections.trust_strip.${index}.subtitle`],
                onChange: (event) => landingForm.setData(
                  "trust_strip",
                  asList(landingForm.data.trust_strip).map(
                    (item, position) => position === index ? { ...item, subtitle: event.target.value } : item
                  )
                )
              }
            ) })
          ]
        },
        `trust-${index}`
      )) }),
      /* @__PURE__ */ jsx29("div", { children: /* @__PURE__ */ jsx29(
        Button,
        {
          variant: "secondary",
          onClick: () => landingForm.setData("trust_strip", [
            ...asList(landingForm.data.trust_strip),
            { icon: TRUST_ICON_KEYS[0] ?? "", title: "", subtitle: "" }
          ]),
          disabled: asList(landingForm.data.trust_strip).length >= MAX_TRUST,
          children: "Tambah keunggulan"
        }
      ) })
    ] }) : null,
    sectionKeys.featured ? /* @__PURE__ */ jsxs24(SectionCard, { title: "Produk unggulan", children: [
      /* @__PURE__ */ jsxs24("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx29(Field, { label: "Judul bagian", htmlFor: "featured_title", error: landingForm.errors["landing_sections.featured.title"], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "featured_title",
            maxLength: 80,
            value: landingForm.data.featured.title,
            error: landingForm.errors["landing_sections.featured.title"],
            onChange: (event) => landingForm.setData("featured", { ...landingForm.data.featured, title: event.target.value })
          }
        ) }),
        /* @__PURE__ */ jsx29(Field, { label: "Subjudul bagian", htmlFor: "featured_subtitle", error: landingForm.errors["landing_sections.featured.subtitle"], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "featured_subtitle",
            maxLength: 120,
            value: landingForm.data.featured.subtitle,
            error: landingForm.errors["landing_sections.featured.subtitle"],
            onChange: (event) => landingForm.setData("featured", { ...landingForm.data.featured, subtitle: event.target.value })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx29(Field, { label: "Jumlah produk", htmlFor: "featured_limit", hint: "Antara 1 sampai 12.", error: landingForm.errors["landing_sections.featured.limit"], children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "featured_limit",
          type: "number",
          min: 1,
          max: 12,
          className: "max-w-[160px]",
          value: landingForm.data.featured.limit,
          error: landingForm.errors["landing_sections.featured.limit"],
          onChange: (event) => landingForm.setData("featured", { ...landingForm.data.featured, limit: event.target.value })
        }
      ) })
    ] }) : null,
    sectionKeys.promo ? /* @__PURE__ */ jsxs24(SectionCard, { title: "Promo", children: [
      /* @__PURE__ */ jsxs24("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx29(Field, { label: "Judul promo", htmlFor: "promo_title", error: landingForm.errors["landing_sections.promo.title"], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "promo_title",
            maxLength: 80,
            value: landingForm.data.promo.title,
            error: landingForm.errors["landing_sections.promo.title"],
            onChange: (event) => landingForm.setData("promo", { ...landingForm.data.promo, title: event.target.value })
          }
        ) }),
        /* @__PURE__ */ jsx29(Field, { label: "Subjudul promo", htmlFor: "promo_subtitle", error: landingForm.errors["landing_sections.promo.subtitle"], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "promo_subtitle",
            maxLength: 120,
            value: landingForm.data.promo.subtitle,
            error: landingForm.errors["landing_sections.promo.subtitle"],
            onChange: (event) => landingForm.setData("promo", { ...landingForm.data.promo, subtitle: event.target.value })
          }
        ) }),
        /* @__PURE__ */ jsx29(Field, { label: "Label tombol", htmlFor: "promo_cta_label", error: landingForm.errors["landing_sections.promo.cta_label"], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "promo_cta_label",
            maxLength: 60,
            value: landingForm.data.promo.cta_label,
            error: landingForm.errors["landing_sections.promo.cta_label"],
            onChange: (event) => landingForm.setData("promo", { ...landingForm.data.promo, cta_label: event.target.value })
          }
        ) }),
        /* @__PURE__ */ jsx29(Field, { label: "Tautan tombol", htmlFor: "promo_cta_url", error: landingForm.errors["landing_sections.promo.cta_url"], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "promo_cta_url",
            maxLength: 255,
            value: landingForm.data.promo.cta_url,
            error: landingForm.errors["landing_sections.promo.cta_url"],
            onChange: (event) => landingForm.setData("promo", { ...landingForm.data.promo, cta_url: event.target.value })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx29(
        Field,
        {
          label: "Gambar promo",
          htmlFor: "promo_image",
          hint: "Path berkas di penyimpanan, contoh /storage/landing/promo.webp.",
          error: landingForm.errors["landing_sections.promo.image"],
          children: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [
            /* @__PURE__ */ jsx29(Thumb, { src: text(landingForm.data.promo.image) || null, size: 112, className: "rounded-lg" }),
            /* @__PURE__ */ jsx29(
              Input,
              {
                id: "promo_image",
                maxLength: 255,
                value: landingForm.data.promo.image,
                error: landingForm.errors["landing_sections.promo.image"],
                onChange: (event) => landingForm.setData("promo", { ...landingForm.data.promo, image: event.target.value })
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ jsx29(Field, { label: "Status promo", htmlFor: "promo_active", error: landingForm.errors["landing_sections.promo.is_active"], children: /* @__PURE__ */ jsxs24(
        Select,
        {
          id: "promo_active",
          className: "max-w-[240px]",
          value: landingForm.data.promo.is_active ? "1" : "0",
          error: landingForm.errors["landing_sections.promo.is_active"],
          onChange: (event) => landingForm.setData("promo", { ...landingForm.data.promo, is_active: event.target.value === "1" }),
          children: [
            /* @__PURE__ */ jsx29("option", { value: "1", children: "Tampil" }),
            /* @__PURE__ */ jsx29("option", { value: "0", children: "Disembunyikan" })
          ]
        }
      ) })
    ] }) : null,
    sectionKeys.why_us ? /* @__PURE__ */ jsxs24(SectionCard, { title: "Kenapa beli di sini", description: `Maksimal ${MAX_WHY_US} item.`, children: [
      /* @__PURE__ */ jsx29(Field, { label: "Judul bagian", htmlFor: "why_us_title", error: landingForm.errors["landing_sections.why_us.title"], children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "why_us_title",
          maxLength: 80,
          value: landingForm.data.why_us_title,
          error: landingForm.errors["landing_sections.why_us.title"],
          onChange: (event) => landingForm.setData("why_us_title", event.target.value)
        }
      ) }),
      /* @__PURE__ */ jsx29("div", { className: "flex flex-col gap-3", children: asList(landingForm.data.why_us_items).map((row, index) => /* @__PURE__ */ jsxs24(
        ArrayRow,
        {
          removeLabel: `Hapus alasan ke-${index + 1}`,
          onRemove: () => landingForm.setData(
            "why_us_items",
            asList(landingForm.data.why_us_items).filter((_, position) => position !== index)
          ),
          children: [
            /* @__PURE__ */ jsx29(Field, { label: "Judul", htmlFor: fieldId("why_title", index), error: landingForm.errors[`landing_sections.why_us.items.${index}.title`], children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: fieldId("why_title", index),
                maxLength: 80,
                value: row.title,
                error: landingForm.errors[`landing_sections.why_us.items.${index}.title`],
                onChange: (event) => landingForm.setData(
                  "why_us_items",
                  asList(landingForm.data.why_us_items).map(
                    (item, position) => position === index ? { ...item, title: event.target.value } : item
                  )
                )
              }
            ) }),
            /* @__PURE__ */ jsx29(Field, { label: "Penjelasan", htmlFor: fieldId("why_body", index), error: landingForm.errors[`landing_sections.why_us.items.${index}.body`], children: /* @__PURE__ */ jsx29(
              Textarea,
              {
                id: fieldId("why_body", index),
                rows: 2,
                maxLength: 255,
                value: row.body,
                error: landingForm.errors[`landing_sections.why_us.items.${index}.body`],
                onChange: (event) => landingForm.setData(
                  "why_us_items",
                  asList(landingForm.data.why_us_items).map(
                    (item, position) => position === index ? { ...item, body: event.target.value } : item
                  )
                )
              }
            ) })
          ]
        },
        `why-${index}`
      )) }),
      /* @__PURE__ */ jsx29("div", { children: /* @__PURE__ */ jsx29(
        Button,
        {
          variant: "secondary",
          onClick: () => landingForm.setData("why_us_items", [
            ...asList(landingForm.data.why_us_items),
            { title: "", body: "" }
          ]),
          disabled: asList(landingForm.data.why_us_items).length >= MAX_WHY_US,
          children: "Tambah alasan"
        }
      ) })
    ] }) : null,
    sectionKeys.newsletter ? /* @__PURE__ */ jsxs24(SectionCard, { title: "Newsletter", children: [
      /* @__PURE__ */ jsxs24("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx29(Field, { label: "Judul", htmlFor: "newsletter_title", error: landingForm.errors["landing_sections.newsletter.title"], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "newsletter_title",
            maxLength: 80,
            value: landingForm.data.newsletter.title,
            error: landingForm.errors["landing_sections.newsletter.title"],
            onChange: (event) => landingForm.setData("newsletter", { ...landingForm.data.newsletter, title: event.target.value })
          }
        ) }),
        /* @__PURE__ */ jsx29(Field, { label: "Subjudul", htmlFor: "newsletter_subtitle", error: landingForm.errors["landing_sections.newsletter.subtitle"], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "newsletter_subtitle",
            maxLength: 120,
            value: landingForm.data.newsletter.subtitle,
            error: landingForm.errors["landing_sections.newsletter.subtitle"],
            onChange: (event) => landingForm.setData("newsletter", { ...landingForm.data.newsletter, subtitle: event.target.value })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx29(Field, { label: "Teks tombol", htmlFor: "newsletter_button_text", error: landingForm.errors["landing_sections.newsletter.button_text"], children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "newsletter_button_text",
          maxLength: 40,
          className: "max-w-[240px]",
          value: landingForm.data.newsletter.button_text,
          error: landingForm.errors["landing_sections.newsletter.button_text"],
          onChange: (event) => landingForm.setData("newsletter", { ...landingForm.data.newsletter, button_text: event.target.value })
        }
      ) })
    ] }) : null,
    /* @__PURE__ */ jsx29(
      StickySave,
      {
        dirty: landingForm.isDirty,
        processing: landingForm.processing,
        resetLabel: "Batalkan perubahan",
        onReset: () => landingForm.reset(),
        saveLabel: "Simpan konten landing"
      }
    )
  ] });
  const renderCarousel = () => /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsx29("p", { className: "text-meta text-slate-600", children: "Carousel tampil di bagian atas beranda, urut dari angka terkecil." }),
      /* @__PURE__ */ jsx29(Button, { onClick: openCarouselCreate, children: "Tambah carousel" })
    ] }),
    actionError ? /* @__PURE__ */ jsx29(InlineNotice, { tone: "error", title: actionError, onDismiss: () => setActionError(null) }) : null,
    /* @__PURE__ */ jsx29(
      DataTable,
      {
        caption: "Daftar carousel",
        columns: carouselColumns,
        rows: carouselRows,
        loading: reloading,
        error: null,
        onRetry: reload,
        emptyTitle: "Belum ada carousel",
        emptyDescription: "Tambahkan carousel untuk menampilkan banner di beranda."
      }
    )
  ] });
  const renderFaq = () => /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsx29("p", { className: "text-meta text-slate-600", children: "FAQ tampil di bagian FAQ beranda, urut dari angka terkecil." }),
      /* @__PURE__ */ jsx29(Button, { onClick: openFaqCreate, children: "Tambah FAQ" })
    ] }),
    actionError ? /* @__PURE__ */ jsx29(InlineNotice, { tone: "error", title: actionError, onDismiss: () => setActionError(null) }) : null,
    /* @__PURE__ */ jsx29(
      DataTable,
      {
        caption: "Daftar FAQ",
        columns: faqColumns,
        rows: faqRows,
        loading: reloading,
        error: null,
        onRetry: reload,
        emptyTitle: "Belum ada FAQ",
        emptyDescription: "Tambahkan pertanyaan yang sering ditanyakan pembeli."
      }
    )
  ] });
  const renderHeader = () => /* @__PURE__ */ jsxs24("form", { onSubmit: (event) => submitSettings("header", event), children: [
    /* @__PURE__ */ jsxs24(SectionCard, { title: "Menu navigasi", description: `Maksimal ${MAX_NAV} item, tampil di header toko.`, children: [
      /* @__PURE__ */ jsx29("div", { className: "flex flex-col gap-3", children: asList(settingsForm.data.header_nav).map((row, index) => /* @__PURE__ */ jsxs24(ArrayRow, { removeLabel: `Hapus menu ke-${index + 1}`, onRemove: () => removeRow("header_nav", index), children: [
        /* @__PURE__ */ jsx29(
          Field,
          {
            label: "Label",
            htmlFor: fieldId("nav_label", index),
            required: true,
            error: settingsForm.errors[`header_nav.${index}.label`],
            children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: fieldId("nav_label", index),
                maxLength: 40,
                value: row.label,
                error: settingsForm.errors[`header_nav.${index}.label`],
                onChange: (event) => updateRow("header_nav", index, "label", event.target.value)
              }
            )
          }
        ),
        /* @__PURE__ */ jsx29(Field, { label: "URL", htmlFor: fieldId("nav_url", index), required: true, error: settingsForm.errors[`header_nav.${index}.url`], children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: fieldId("nav_url", index),
            maxLength: 255,
            placeholder: "/produk",
            value: row.url,
            error: settingsForm.errors[`header_nav.${index}.url`],
            onChange: (event) => updateRow("header_nav", index, "url", event.target.value)
          }
        ) })
      ] }, `nav-${index}`)) }),
      asList(settingsForm.data.header_nav).length === 0 ? /* @__PURE__ */ jsx29("p", { className: "text-meta text-slate-500", children: "Belum ada menu." }) : null,
      /* @__PURE__ */ jsx29("div", { children: /* @__PURE__ */ jsx29(
        Button,
        {
          variant: "secondary",
          disabled: asList(settingsForm.data.header_nav).length >= MAX_NAV,
          onClick: () => addRow("header_nav", { label: "", url: "" }, MAX_NAV),
          children: "Tambah menu"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx29(
      StickySave,
      {
        dirty: settingsForm.isDirty,
        processing: settingsForm.processing,
        resetLabel: "Batalkan perubahan",
        onReset: () => settingsForm.reset()
      }
    )
  ] });
  const renderFooter = () => /* @__PURE__ */ jsxs24("form", { onSubmit: (event) => submitSettings("footer", event), children: [
    /* @__PURE__ */ jsx29(SectionCard, { title: "Tentang toko", children: /* @__PURE__ */ jsx29(Field, { label: "Tentang toko (footer)", htmlFor: "footer_about", error: settingsForm.errors.footer_about, children: /* @__PURE__ */ jsx29(
      Textarea,
      {
        id: "footer_about",
        rows: 3,
        maxLength: 500,
        value: settingsForm.data.footer_about,
        error: settingsForm.errors.footer_about,
        onChange: (event) => setField("footer_about", event.target.value)
      }
    ) }) }),
    /* @__PURE__ */ jsxs24(
      SectionCard,
      {
        title: "Tautan footer",
        description: footerLinksMode === "nested" ? `Maksimal ${MAX_LINKS} kolom tautan.` : `Maksimal ${MAX_LINKS} tautan.`,
        children: [
          settingsForm.errors.footer_links ? /* @__PURE__ */ jsx29(InlineNotice, { tone: "error", title: settingsForm.errors.footer_links }) : null,
          footerLinksError ? /* @__PURE__ */ jsx29(InlineNotice, { tone: "error", title: footerLinksError }) : null,
          footerLinksMode === "flat" ? /* @__PURE__ */ jsx29("div", { className: "flex flex-col gap-3", children: asList(settingsForm.data.footer_links).map((row, index) => /* @__PURE__ */ jsxs24(ArrayRow, { removeLabel: `Hapus tautan ke-${index + 1}`, onRemove: () => removeRow("footer_links", index), children: [
            /* @__PURE__ */ jsx29(Field, { label: "Label", htmlFor: fieldId("link_label", index), required: true, error: settingsForm.errors[`footer_links.${index}.label`], children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: fieldId("link_label", index),
                maxLength: 40,
                value: row.label,
                error: settingsForm.errors[`footer_links.${index}.label`],
                onChange: (event) => updateRow("footer_links", index, "label", event.target.value)
              }
            ) }),
            /* @__PURE__ */ jsx29(Field, { label: "URL", htmlFor: fieldId("link_url", index), required: true, error: settingsForm.errors[`footer_links.${index}.url`], children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: fieldId("link_url", index),
                maxLength: 255,
                placeholder: "/kontak-kami",
                value: row.url,
                error: settingsForm.errors[`footer_links.${index}.url`],
                onChange: (event) => updateRow("footer_links", index, "url", event.target.value)
              }
            ) })
          ] }, `link-${index}`)) }) : /* @__PURE__ */ jsx29("div", { className: "flex flex-col gap-4", children: asList(settingsForm.data.footer_links).map((column, columnIndex) => /* @__PURE__ */ jsxs24("div", { className: "rounded-lg border border-line p-3", children: [
            /* @__PURE__ */ jsxs24("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx29(
                Field,
                {
                  label: "Judul kolom",
                  htmlFor: fieldId("column_title", columnIndex),
                  required: true,
                  className: "min-w-0 flex-1",
                  error: settingsForm.errors[`footer_links.${columnIndex}.label`],
                  children: /* @__PURE__ */ jsx29(
                    Input,
                    {
                      id: fieldId("column_title", columnIndex),
                      maxLength: 40,
                      value: column.title,
                      error: settingsForm.errors[`footer_links.${columnIndex}.label`],
                      onChange: (event) => updateColumn(columnIndex, { ...column, title: event.target.value })
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx29(
                IconButton,
                {
                  label: `Hapus kolom ke-${columnIndex + 1}`,
                  className: "mt-6 text-danger",
                  onClick: () => setRows(
                    "footer_links",
                    asList(settingsForm.data.footer_links).filter((_, position) => position !== columnIndex)
                  ),
                  children: /* @__PURE__ */ jsx29(TrashIcon, { size: 18 })
                }
              )
            ] }),
            /* @__PURE__ */ jsx29("div", { className: "mt-3 flex flex-col gap-3", children: asList(column.items).map((item, itemIndex) => /* @__PURE__ */ jsxs24(
              ArrayRow,
              {
                removeLabel: `Hapus tautan ke-${itemIndex + 1} pada kolom ${columnIndex + 1}`,
                onRemove: () => updateColumn(columnIndex, {
                  ...column,
                  items: asList(column.items).filter((_, position) => position !== itemIndex)
                }),
                children: [
                  /* @__PURE__ */ jsx29(
                    Field,
                    {
                      label: "Label",
                      htmlFor: fieldId(`column_${columnIndex}_label`, itemIndex),
                      required: true,
                      error: settingsForm.errors[`footer_links.${columnIndex}.items.${itemIndex}.label`],
                      children: /* @__PURE__ */ jsx29(
                        Input,
                        {
                          id: fieldId(`column_${columnIndex}_label`, itemIndex),
                          maxLength: 40,
                          value: item.label,
                          error: settingsForm.errors[`footer_links.${columnIndex}.items.${itemIndex}.label`],
                          onChange: (event) => updateColumn(columnIndex, {
                            ...column,
                            items: asList(column.items).map(
                              (link, position) => position === itemIndex ? { ...link, label: event.target.value } : link
                            )
                          })
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx29(
                    Field,
                    {
                      label: "URL",
                      htmlFor: fieldId(`column_${columnIndex}_url`, itemIndex),
                      required: true,
                      error: settingsForm.errors[`footer_links.${columnIndex}.items.${itemIndex}.url`],
                      children: /* @__PURE__ */ jsx29(
                        Input,
                        {
                          id: fieldId(`column_${columnIndex}_url`, itemIndex),
                          maxLength: 255,
                          value: item.url,
                          error: settingsForm.errors[`footer_links.${columnIndex}.items.${itemIndex}.url`],
                          onChange: (event) => updateColumn(columnIndex, {
                            ...column,
                            items: asList(column.items).map(
                              (link, position) => position === itemIndex ? { ...link, url: event.target.value } : link
                            )
                          })
                        }
                      )
                    }
                  )
                ]
              },
              `column-${columnIndex}-item-${itemIndex}`
            )) }),
            /* @__PURE__ */ jsx29("div", { className: "mt-3", children: /* @__PURE__ */ jsx29(
              Button,
              {
                variant: "secondary",
                size: "sm",
                onClick: () => updateColumn(columnIndex, {
                  ...column,
                  items: [...asList(column.items), { label: "", url: "" }]
                }),
                children: "Tambah tautan"
              }
            ) })
          ] }, `column-${columnIndex}`)) }),
          /* @__PURE__ */ jsx29("div", { children: /* @__PURE__ */ jsx29(
            Button,
            {
              variant: "secondary",
              disabled: asList(settingsForm.data.footer_links).length >= MAX_LINKS,
              onClick: () => addRow("footer_links", footerLinksMode === "flat" ? { label: "", url: "" } : { title: "", items: [{ label: "", url: "" }] }, MAX_LINKS),
              children: footerLinksMode === "flat" ? "Tambah tautan" : "Tambah kolom"
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs24(SectionCard, { title: "Media sosial", description: `Maksimal ${MAX_SOCIAL} akun.`, children: [
      /* @__PURE__ */ jsx29("div", { className: "flex flex-col gap-3", children: asList(settingsForm.data.footer_social).map((row, index) => {
        const Icon = SOCIAL_ICONS[text(row.platform).toLowerCase()] ?? null;
        return /* @__PURE__ */ jsxs24(ArrayRow, { removeLabel: `Hapus media sosial ke-${index + 1}`, onRemove: () => removeRow("footer_social", index), children: [
          /* @__PURE__ */ jsx29(Field, { label: "Platform", htmlFor: fieldId("social_platform", index), error: settingsForm.errors[`footer_social.${index}.platform`], children: /* @__PURE__ */ jsxs24("div", { className: "flex items-center gap-2", children: [
            Icon ? /* @__PURE__ */ jsx29("span", { className: "flex h-field w-field shrink-0 items-center justify-center rounded-md border border-line bg-surface text-ink-soft", children: /* @__PURE__ */ jsx29(Icon, { size: 18 }) }) : null,
            /* @__PURE__ */ jsx29(
              Select,
              {
                id: fieldId("social_platform", index),
                value: row.platform,
                error: settingsForm.errors[`footer_social.${index}.platform`],
                onChange: (event) => updateRow("footer_social", index, "platform", event.target.value),
                children: SOCIAL_PLATFORMS.map((platform) => /* @__PURE__ */ jsx29("option", { value: platform, children: platform }, platform))
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx29(Field, { label: "Nama", htmlFor: fieldId("social_label", index), required: true, error: settingsForm.errors[`footer_social.${index}.label`], children: /* @__PURE__ */ jsx29(
            Input,
            {
              id: fieldId("social_label", index),
              maxLength: 40,
              value: row.label,
              error: settingsForm.errors[`footer_social.${index}.label`],
              onChange: (event) => updateRow("footer_social", index, "label", event.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx29(Field, { label: "URL", htmlFor: fieldId("social_url", index), required: true, error: settingsForm.errors[`footer_social.${index}.url`], children: /* @__PURE__ */ jsx29(
            Input,
            {
              id: fieldId("social_url", index),
              maxLength: 255,
              placeholder: "https://",
              value: row.url,
              error: settingsForm.errors[`footer_social.${index}.url`],
              onChange: (event) => updateRow("footer_social", index, "url", event.target.value)
            }
          ) })
        ] }, `social-${index}`);
      }) }),
      /* @__PURE__ */ jsx29("div", { children: /* @__PURE__ */ jsx29(
        Button,
        {
          variant: "secondary",
          disabled: asList(settingsForm.data.footer_social).length >= MAX_SOCIAL,
          onClick: () => addRow("footer_social", { platform: SOCIAL_PLATFORMS[0], label: "", url: "" }, MAX_SOCIAL),
          children: "Tambah media sosial"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx29(
      StickySave,
      {
        dirty: settingsForm.isDirty,
        processing: settingsForm.processing,
        resetLabel: "Batalkan perubahan",
        onReset: () => {
          settingsForm.reset();
          setFooterLinksError(null);
        }
      }
    )
  ] });
  const renderKontak = () => /* @__PURE__ */ jsxs24("form", { onSubmit: (event) => submitSettings("kontak", event), children: [
    /* @__PURE__ */ jsxs24(SectionCard, { title: "Kontak toko", children: [
      /* @__PURE__ */ jsx29(Field, { label: "Email kontak", htmlFor: "contact_email", error: settingsForm.errors.contact_email, children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "contact_email",
          type: "email",
          maxLength: 150,
          value: settingsForm.data.contact_email,
          error: settingsForm.errors.contact_email,
          onChange: (event) => setField("contact_email", event.target.value)
        }
      ) }),
      /* @__PURE__ */ jsxs24("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx29(Field, { label: "Nomor telepon", htmlFor: "contact_phone", error: settingsForm.errors.contact_phone, children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "contact_phone",
            maxLength: 30,
            value: settingsForm.data.contact_phone,
            error: settingsForm.errors.contact_phone,
            onChange: (event) => setField("contact_phone", event.target.value)
          }
        ) }),
        /* @__PURE__ */ jsx29(Field, { label: "Nomor WhatsApp", htmlFor: "contact_whatsapp", error: settingsForm.errors.contact_whatsapp, children: /* @__PURE__ */ jsx29(
          Input,
          {
            id: "contact_whatsapp",
            maxLength: 30,
            value: settingsForm.data.contact_whatsapp,
            error: settingsForm.errors.contact_whatsapp,
            onChange: (event) => setField("contact_whatsapp", event.target.value)
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx29(Field, { label: "Alamat toko", htmlFor: "contact_address", error: settingsForm.errors.contact_address, children: /* @__PURE__ */ jsx29(
        Textarea,
        {
          id: "contact_address",
          rows: 3,
          maxLength: 500,
          value: settingsForm.data.contact_address,
          error: settingsForm.errors.contact_address,
          onChange: (event) => setField("contact_address", event.target.value)
        }
      ) }),
      /* @__PURE__ */ jsx29(Field, { label: "URL peta (embed)", htmlFor: "contact_map_embed", error: settingsForm.errors.contact_map_embed, children: /* @__PURE__ */ jsx29(
        Textarea,
        {
          id: "contact_map_embed",
          rows: 3,
          maxLength: 1e3,
          value: settingsForm.data.contact_map_embed,
          error: settingsForm.errors.contact_map_embed,
          onChange: (event) => setField("contact_map_embed", event.target.value)
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx29(
      StickySave,
      {
        dirty: settingsForm.isDirty,
        processing: settingsForm.processing,
        resetLabel: "Batalkan perubahan",
        onReset: () => settingsForm.reset()
      }
    )
  ] });
  const renderSeo = () => /* @__PURE__ */ jsxs24("form", { onSubmit: (event) => submitSettings("seo", event), children: [
    /* @__PURE__ */ jsxs24(SectionCard, { title: "SEO default", description: "Dipakai bila halaman tidak punya judul sendiri.", children: [
      /* @__PURE__ */ jsx29(Field, { label: "Judul SEO default", htmlFor: "seo_default_title", error: settingsForm.errors.seo_default_title, children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "seo_default_title",
          maxLength: 150,
          value: settingsForm.data.seo_default_title,
          error: settingsForm.errors.seo_default_title,
          onChange: (event) => setField("seo_default_title", event.target.value)
        }
      ) }),
      /* @__PURE__ */ jsx29(Field, { label: "Deskripsi SEO default", htmlFor: "seo_default_description", error: settingsForm.errors.seo_default_description, children: /* @__PURE__ */ jsx29(
        Textarea,
        {
          id: "seo_default_description",
          rows: 3,
          maxLength: 300,
          value: settingsForm.data.seo_default_description,
          error: settingsForm.errors.seo_default_description,
          onChange: (event) => setField("seo_default_description", event.target.value)
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx29(
      StickySave,
      {
        dirty: settingsForm.isDirty,
        processing: settingsForm.processing,
        resetLabel: "Batalkan perubahan",
        onReset: () => settingsForm.reset()
      }
    )
  ] });
  const renderPembayaran = () => {
    const shipping = Number.parseInt(settingsForm.data.shipping_cost_default, 10);
    const shippingHint = Number.isNaN(shipping) ? "Angka rupiah, contoh 20000." : `Tampil sebagai ${rupiah(shipping)}.`;
    const mode = midtransMode(midtrans);
    return /* @__PURE__ */ jsxs24("form", { onSubmit: (event) => submitSettings("pembayaran", event), children: [
      /* @__PURE__ */ jsx29(SectionCard, { title: "Pengiriman", children: /* @__PURE__ */ jsx29(Field, { label: "Ongkos kirim default (rupiah)", htmlFor: "shipping_cost_default", hint: shippingHint, error: settingsForm.errors.shipping_cost_default, children: /* @__PURE__ */ jsx29(
        Input,
        {
          id: "shipping_cost_default",
          type: "number",
          min: 0,
          max: 1e6,
          className: "max-w-[240px]",
          value: settingsForm.data.shipping_cost_default,
          error: settingsForm.errors.shipping_cost_default,
          onChange: (event) => setField("shipping_cost_default", event.target.value)
        }
      ) }) }),
      /* @__PURE__ */ jsxs24(SectionCard, { title: "Midtrans", description: mode.catatan, children: [
        mode.diketahui ? /* @__PURE__ */ jsxs24("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-2", children: [
          /* @__PURE__ */ jsx29(StatusBadge, { status: mode.uji ? "pending" : null, label: mode.uji ? "Mode uji" : "Mode asli" }),
          mode.sumberKredensial ? /* @__PURE__ */ jsxs24("span", { className: "text-meta text-slate-500", children: [
            "Kredensial dibaca dari ",
            mode.sumberKredensial,
            "."
          ] }) : null
        ] }) : null,
        mode.uji ? /* @__PURE__ */ jsxs24(InlineNotice, { tone: "warning", title: "Pembayaran sedang dalam mode uji", children: [
          /* @__PURE__ */ jsx29("p", { children: mode.alasan ?? "QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer." }),
          mode.langkah.length > 0 ? /* @__PURE__ */ jsx29("ol", { className: "mt-2 list-decimal pl-4", children: mode.langkah.map((langkah, index) => /* @__PURE__ */ jsx29("li", { children: langkah }, index)) }) : null
        ] }) : null,
        /* @__PURE__ */ jsx29(
          Field,
          {
            label: "Midtrans client key (diisi pemilik)",
            htmlFor: "midtrans_client_key",
            hint: "Catatan saja: nilai ini tidak dibaca jalur pembayaran QRIS (lihat keterangan di atas).",
            error: settingsForm.errors.midtrans_client_key,
            children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: "midtrans_client_key",
                maxLength: 100,
                value: settingsForm.data.midtrans_client_key,
                error: settingsForm.errors.midtrans_client_key,
                onChange: (event) => setField("midtrans_client_key", event.target.value)
              }
            )
          }
        ),
        /* @__PURE__ */ jsx29(
          Field,
          {
            label: "Midtrans mode produksi (0/1)",
            htmlFor: "midtrans_is_production",
            hint: "Catatan saja: nilai ini tidak dibaca jalur pembayaran QRIS (lihat keterangan di atas).",
            error: settingsForm.errors.midtrans_is_production,
            children: /* @__PURE__ */ jsxs24(
              Select,
              {
                id: "midtrans_is_production",
                className: "max-w-[240px]",
                value: settingsForm.data.midtrans_is_production ? "1" : "0",
                error: settingsForm.errors.midtrans_is_production,
                onChange: (event) => setField("midtrans_is_production", event.target.value === "1"),
                children: [
                  /* @__PURE__ */ jsx29("option", { value: "0", children: "Mode sandbox" }),
                  /* @__PURE__ */ jsx29("option", { value: "1", children: "Mode produksi" })
                ]
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsx29(
        StickySave,
        {
          dirty: settingsForm.isDirty,
          processing: settingsForm.processing,
          resetLabel: "Batalkan perubahan",
          onReset: () => settingsForm.reset()
        }
      )
    ] });
  };
  const renderPanel = () => {
    if (reloading) {
      return /* @__PURE__ */ jsxs24("div", { className: "card p-6", "aria-busy": "true", children: [
        /* @__PURE__ */ jsx29(Skeleton, { variant: "title" }),
        /* @__PURE__ */ jsxs24("div", { className: "mt-4 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsx29(Skeleton, { variant: "text" }),
          /* @__PURE__ */ jsx29(Skeleton, { variant: "text" }),
          /* @__PURE__ */ jsx29(Skeleton, { variant: "text" })
        ] })
      ] });
    }
    switch (tab) {
      case "landing":
        return renderLanding();
      case "carousel":
        return renderCarousel();
      case "faq":
        return renderFaq();
      case "header":
        return renderHeader();
      case "footer":
        return renderFooter();
      case "kontak":
        return renderKontak();
      case "seo":
        return renderSeo();
      case "pembayaran":
        return renderPembayaran();
      default:
        return renderUmum();
    }
  };
  if (!pengaturan) {
    return /* @__PURE__ */ jsxs24(AdminLayout, { auth, nav: NAV_AKTIF, title: "Pengaturan", children: [
      /* @__PURE__ */ jsx29(PageHeader, { title: "Pengaturan", breadcrumb: BREADCRUMB }),
      /* @__PURE__ */ jsx29(
        ErrorState,
        {
          title: "Pengaturan gagal dimuat",
          description: "Data pengaturan belum tersedia. Coba muat ulang halaman.",
          onRetry: reload
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs24(AdminLayout, { auth, nav: NAV_AKTIF, title: "Pengaturan", children: [
    /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx29(PageHeader, { title: "Pengaturan", breadcrumb: BREADCRUMB }),
      flash && (flash.success || flash.error) ? null : null,
      /* @__PURE__ */ jsx29(TabNav, { active: tab, onSelect: requestTab }),
      /* @__PURE__ */ jsx29("div", { id: `panel-${tab}`, role: "tabpanel", "aria-labelledby": `tab-${tab}`, className: "focus:outline-none", tabIndex: -1, children: /* @__PURE__ */ jsx29("div", { className: "flex flex-col gap-4", children: renderPanel() }) }),
      asList(carousels).length === 0 && !reloading && tab === "umum" ? /* @__PURE__ */ jsx29(
        EmptyState,
        {
          title: "Belum ada carousel",
          description: "Tambahkan carousel dari tab Carousel agar beranda punya banner.",
          actionLabel: "Buka tab Carousel",
          onAction: () => requestTab("carousel")
        }
      ) : null
    ] }),
    /* @__PURE__ */ jsx29(
      Modal,
      {
        open: carouselOpen,
        title: carouselEditing ? "Ubah carousel" : "Tambah carousel",
        description: "Konten ini tampil di bagian atas beranda.",
        onClose: closeCarousel,
        size: "lg",
        footer: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-2 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsx29(Button, { variant: "secondary", onClick: closeCarousel, disabled: carouselForm.processing, children: "Batal" }),
          /* @__PURE__ */ jsx29(Button, { type: "submit", onClick: submitCarousel, loading: carouselForm.processing, children: carouselEditing ? "Simpan perubahan" : "Simpan carousel" })
        ] }),
        children: /* @__PURE__ */ jsxs24("form", { onSubmit: submitCarousel, className: "flex flex-col gap-4", id: "form-carousel", children: [
          /* @__PURE__ */ jsx29(Field, { label: "Judul carousel", htmlFor: "carousel_title", required: true, error: carouselForm.errors.title, children: /* @__PURE__ */ jsx29(
            Input,
            {
              id: "carousel_title",
              maxLength: 150,
              value: carouselForm.data.title,
              error: carouselForm.errors.title,
              onChange: (event) => carouselForm.setData("title", event.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx29(Field, { label: "Subjudul", htmlFor: "carousel_subtitle", error: carouselForm.errors.subtitle, children: /* @__PURE__ */ jsx29(
            Input,
            {
              id: "carousel_subtitle",
              maxLength: 255,
              value: carouselForm.data.subtitle,
              error: carouselForm.errors.subtitle,
              onChange: (event) => carouselForm.setData("subtitle", event.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx29(
            ImageField,
            {
              id: "carousel_image",
              label: "Gambar carousel",
              required: !carouselEditing,
              hint: "Rasio 1:1.",
              message: "Gambar carousel harus JPG, PNG, atau WebP.",
              accept: LOGO_ACCEPT,
              extensions: LOGO_EXTENSIONS,
              maxKb: 2048,
              file: isFileValue(carouselForm.data.image) ? carouselForm.data.image : null,
              currentPath: carouselEditing ? text(carouselEditing.image) || null : null,
              error: carouselImageError || carouselForm.errors.image,
              onSelect: (file) => {
                const message = checkUpload(file, {
                  maxKb: 2048,
                  extensions: LOGO_EXTENSIONS,
                  message: "Gambar carousel harus JPG, PNG, atau WebP maksimal 2 MB."
                });
                setCarouselImageError(message);
                carouselForm.setData("image", message ? null : file);
              }
            }
          ),
          /* @__PURE__ */ jsxs24("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx29(Field, { label: "Tautan", htmlFor: "carousel_link", error: carouselForm.errors.link, children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: "carousel_link",
                maxLength: 255,
                placeholder: "/produk",
                value: carouselForm.data.link,
                error: carouselForm.errors.link,
                onChange: (event) => carouselForm.setData("link", event.target.value)
              }
            ) }),
            /* @__PURE__ */ jsx29(Field, { label: "Teks tombol", htmlFor: "carousel_button_text", error: carouselForm.errors.button_text, children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: "carousel_button_text",
                maxLength: 60,
                value: carouselForm.data.button_text,
                error: carouselForm.errors.button_text,
                onChange: (event) => carouselForm.setData("button_text", event.target.value)
              }
            ) }),
            /* @__PURE__ */ jsx29(Field, { label: "Urutan", htmlFor: "carousel_sort_order", hint: "0 sampai 999.", error: carouselForm.errors.sort_order, children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: "carousel_sort_order",
                type: "number",
                min: 0,
                max: 999,
                value: carouselForm.data.sort_order,
                error: carouselForm.errors.sort_order,
                onChange: (event) => carouselForm.setData("sort_order", event.target.value)
              }
            ) }),
            /* @__PURE__ */ jsx29(Field, { label: "Status", htmlFor: "carousel_is_active", error: carouselForm.errors.is_active, children: /* @__PURE__ */ jsxs24(
              Select,
              {
                id: "carousel_is_active",
                value: carouselForm.data.is_active ? "1" : "0",
                error: carouselForm.errors.is_active,
                onChange: (event) => carouselForm.setData("is_active", event.target.value === "1"),
                children: [
                  /* @__PURE__ */ jsx29("option", { value: "1", children: "Aktif" }),
                  /* @__PURE__ */ jsx29("option", { value: "0", children: "Nonaktif" })
                ]
              }
            ) })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx29(
      Modal,
      {
        open: faqOpen,
        title: faqEditing ? "Ubah FAQ" : "Tambah FAQ",
        description: "Pertanyaan ini tampil di bagian FAQ beranda.",
        onClose: closeFaq,
        size: "lg",
        footer: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-2 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsx29(Button, { variant: "secondary", onClick: closeFaq, disabled: faqForm.processing, children: "Batal" }),
          /* @__PURE__ */ jsx29(Button, { type: "submit", onClick: submitFaq, loading: faqForm.processing, children: faqEditing ? "Simpan perubahan" : "Simpan FAQ" })
        ] }),
        children: /* @__PURE__ */ jsxs24("form", { onSubmit: submitFaq, className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsx29(Field, { label: "Pertanyaan", htmlFor: "faq_question", required: true, error: faqForm.errors.question, children: /* @__PURE__ */ jsx29(
            Input,
            {
              id: "faq_question",
              maxLength: 255,
              value: faqForm.data.question,
              error: faqForm.errors.question,
              onChange: (event) => faqForm.setData("question", event.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx29(Field, { label: "Jawaban", htmlFor: "faq_answer", required: true, error: faqForm.errors.answer, children: /* @__PURE__ */ jsx29(
            Textarea,
            {
              id: "faq_answer",
              rows: 6,
              maxLength: 2e3,
              value: faqForm.data.answer,
              error: faqForm.errors.answer,
              onChange: (event) => faqForm.setData("answer", event.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxs24("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx29(Field, { label: "Urutan", htmlFor: "faq_sort_order", hint: "0 sampai 999.", error: faqForm.errors.sort_order, children: /* @__PURE__ */ jsx29(
              Input,
              {
                id: "faq_sort_order",
                type: "number",
                min: 0,
                max: 999,
                value: faqForm.data.sort_order,
                error: faqForm.errors.sort_order,
                onChange: (event) => faqForm.setData("sort_order", event.target.value)
              }
            ) }),
            /* @__PURE__ */ jsx29(Field, { label: "Status", htmlFor: "faq_is_active", error: faqForm.errors.is_active, children: /* @__PURE__ */ jsxs24(
              Select,
              {
                id: "faq_is_active",
                value: faqForm.data.is_active ? "1" : "0",
                error: faqForm.errors.is_active,
                onChange: (event) => faqForm.setData("is_active", event.target.value === "1"),
                children: [
                  /* @__PURE__ */ jsx29("option", { value: "1", children: "Aktif" }),
                  /* @__PURE__ */ jsx29("option", { value: "0", children: "Nonaktif" })
                ]
              }
            ) })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx29(
      ConfirmDialog,
      {
        open: Boolean(carouselPendingDelete) || Boolean(faqPendingDelete),
        title: "Hapus data?",
        description: carouselPendingDelete ? `Carousel "${text(carouselPendingDelete.title)}" akan dihapus.` : faqPendingDelete ? `FAQ "${text(faqPendingDelete.question)}" akan dihapus.` : null,
        confirmLabel: "Hapus",
        processing: deleting,
        onConfirm: confirmDelete,
        onCancel: () => {
          if (deleting) return;
          setCarouselPendingDelete(null);
          setFaqPendingDelete(null);
        }
      }
    ),
    /* @__PURE__ */ jsx29(
      Modal,
      {
        open: Boolean(pendingTab),
        title: "Perubahan belum disimpan",
        description: "Perubahan pada tab ini akan hilang bila kamu pindah tab.",
        onClose: () => setPendingTab(null),
        size: "md",
        footer: /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-2 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsx29(Button, { variant: "secondary", onClick: () => setPendingTab(null), children: "Tetap di sini" }),
          /* @__PURE__ */ jsx29(Button, { variant: "danger", onClick: discardAndSwitch, children: "Buang perubahan" })
        ] }),
        children: /* @__PURE__ */ jsx29("p", { className: "text-body text-ink-soft", children: "Simpan dulu bila perubahan masih dibutuhkan." })
      }
    ),
    toast ? /* @__PURE__ */ jsx29("div", { className: "pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]", children: /* @__PURE__ */ jsx29(Toast, { tone: toast.tone, message: toast.message, onClose: dismissToast }) }) : null
  ] });
}
var SETTINGS_URL, LANDING_URL, CAROUSEL_URL, FAQ_URL, BREADCRUMB, TABS, TAB_KEYS, MAX_NAV, MAX_SOCIAL, MAX_LINKS, MAX_TRUST, MAX_WHY_US, IMAGE_TYPE_LABEL, LOGO_ACCEPT, FAVICON_ACCEPT, LOGO_EXTENSIONS, FAVICON_EXTENSIONS, SOCIAL_PLATFORMS, TRUST_ICON_KEYS, NAV_AKTIF, fieldId, text, asList, asObject, isFileValue, trimmed, orNull, clampInt, cleanRows, readTabFromUrl, checkUpload, readFooterLinksMode;
var init_Index = __esm({
  "resources/js/Pages/Admin/Settings/Index.jsx"() {
    init_stub_inertia_t_321bf03c();
    init_AdminLayout();
    init_PageHeader();
    init_Field();
    init_Input();
    init_Select();
    init_Textarea();
    init_Button();
    init_Modal();
    init_Toast();
    init_InlineNotice();
    init_StatusBadge();
    init_midtrans();
    init_EmptyState();
    init_ErrorState();
    init_DataTable();
    init_IconButton();
    init_Skeleton();
    init_icons();
    init_format();
    SETTINGS_URL = "/admin/pengaturan";
    LANDING_URL = "/admin/pengaturan/landing";
    CAROUSEL_URL = "/admin/pengaturan/carousel";
    FAQ_URL = "/admin/pengaturan/faq";
    BREADCRUMB = [{ label: "Dashboard", href: "/admin" }, { label: "Pengaturan" }];
    TABS = [
      { key: "umum", label: "Umum" },
      { key: "landing", label: "Landing" },
      { key: "carousel", label: "Carousel" },
      { key: "faq", label: "FAQ" },
      { key: "header", label: "Header" },
      { key: "footer", label: "Footer" },
      { key: "kontak", label: "Kontak" },
      { key: "seo", label: "SEO" },
      { key: "pembayaran", label: "Pembayaran" }
    ];
    TAB_KEYS = {
      umum: ["store_name", "store_tagline", "store_logo", "store_favicon", "hapus_store_logo"],
      header: ["header_nav"],
      footer: ["footer_about", "footer_links", "footer_social"],
      kontak: ["contact_email", "contact_phone", "contact_whatsapp", "contact_address", "contact_map_embed"],
      seo: ["seo_default_title", "seo_default_description"],
      pembayaran: ["shipping_cost_default", "midtrans_client_key", "midtrans_is_production"]
    };
    MAX_NAV = 8;
    MAX_SOCIAL = 8;
    MAX_LINKS = 8;
    MAX_TRUST = 6;
    MAX_WHY_US = 6;
    IMAGE_TYPE_LABEL = "JPG, PNG, atau WebP";
    LOGO_ACCEPT = "image/jpeg,image/png,image/webp";
    FAVICON_ACCEPT = "image/jpeg,image/png,image/webp,image/x-icon,image/vnd.microsoft.icon,.ico";
    LOGO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
    FAVICON_EXTENSIONS = [...LOGO_EXTENSIONS, ".ico"];
    SOCIAL_PLATFORMS = Array.from(/* @__PURE__ */ new Set([...Object.keys(SOCIAL_ICONS), "shopee"]));
    TRUST_ICON_KEYS = Object.keys(TRUST_ICONS);
    NAV_AKTIF = ADMIN_NAV.map(
      (item) => item.key === "penilaian" || item.key === "pengaturan" ? { ...item, disabled: false } : item
    );
    fieldId = (prefix, index) => `${prefix}-${index}`;
    text = (value) => value === null || value === void 0 ? "" : String(value);
    asList = (value) => Array.isArray(value) ? value : [];
    asObject = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
    isFileValue = (value) => typeof File !== "undefined" && value instanceof File;
    trimmed = (value) => text(value).trim();
    orNull = (value) => {
      const clean = trimmed(value);
      return clean === "" ? null : clean;
    };
    clampInt = (value, min, max, fallback) => {
      const parsed = Number.parseInt(text(value).replace(/[^0-9-]/g, ""), 10);
      if (Number.isNaN(parsed)) return fallback;
      return Math.min(Math.max(parsed, min), max);
    };
    cleanRows = (rows, keys) => asList(rows).filter((row) => keys.some((key) => trimmed(asObject(row)[key]) !== ""));
    readTabFromUrl = () => {
      if (typeof window === "undefined") return TABS[0].key;
      const requested = new URLSearchParams(window.location.search).get("tab");
      return TABS.some((item) => item.key === requested) ? requested : TABS[0].key;
    };
    checkUpload = (file, { maxKb, message, extensions }) => {
      if (!file) return null;
      const extension = `.${text(file.name).split(".").pop()}`.toLowerCase();
      const type = text(file.type).toLowerCase();
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"].concat(
        extensions.includes(".ico") ? ["image/x-icon", "image/vnd.microsoft.icon"] : []
      );
      if (!allowedTypes.includes(type) && !extensions.includes(extension)) return message;
      if (Number(file.size) > maxKb * 1024) {
        return `Ukuran berkas maksimal ${maxKb >= 1024 ? `${Math.round(maxKb / 1024)} MB` : `${maxKb} KB`}.`;
      }
      return null;
    };
    readFooterLinksMode = (raw) => {
      const value = asList(raw);
      if (value.length === 0) return "nested";
      return value.every((entry) => Array.isArray(asObject(entry).items)) ? "nested" : "flat";
    };
  }
});

// tmp/uji-ssr-midtrans-t_e60e7733.mjs
import fs from "node:fs";
import path from "node:path";
import React30 from "react";
import { renderToStaticMarkup } from "react-dom/server";
var ALASAN_UJI = "MODE UJI aktif karena MIDTRANS_FAKE=true di .env: QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer.";
var LANGKAH_UJI = [
  "Ubah MIDTRANS_FAKE=false pada berkas .env.",
  "Isi MIDTRANS_CLIENT_KEY dan MIDTRANS_SERVER_KEY dari dashboard Midtrans.",
  "Jalankan php artisan config:clear, lalu muat ulang halaman pembayaran."
];
var CATATAN_ADMIN = "Kredensial efektif dibaca dari .env (MIDTRANS_*); kolom Midtrans pada tab Pembayaran admin belum dipakai jalur pembayaran ini.";
var GALAT_BAYAR = "Permintaan ke Midtrans gagal (HTTP 500) \u2014 periksa <b>server key</b> dan koneksi keluar server.";
globalThis.window = {
  location: {
    pathname: "/admin/pengaturan",
    search: "?tab=pembayaran",
    href: "http://127.0.0.1:8000/admin/pengaturan?tab=pembayaran"
  },
  addEventListener() {
  },
  removeEventListener() {
  },
  scrollTo() {
  }
};
var { bersihkan: bersihkan2, kendali: kendali2 } = await Promise.resolve().then(() => (init_stub_inertia_t_321bf03c(), stub_inertia_t_321bf03c_exports));
var QrisPanel2 = (await Promise.resolve().then(() => (init_QrisPanel(), QrisPanel_exports))).default;
var Countdown2 = (await Promise.resolve().then(() => (init_Countdown(), Countdown_exports))).default;
var CheckoutPay2 = (await Promise.resolve().then(() => (init_CheckoutPay(), CheckoutPay_exports))).default;
var SettingsIndex2 = (await Promise.resolve().then(() => (init_Index(), Index_exports))).default;
var { midtransMode: midtransMode2 } = await Promise.resolve().then(() => (init_midtrans(), midtrans_exports));
var AKAR = process.cwd();
var hasil = [];
var bukti = [];
var uji = (nama, fn) => {
  try {
    const catatan = fn();
    hasil.push({ status: "OK", nama });
    bukti.push(`[OK]    ${nama}${catatan ? ` \u2014 ${catatan}` : ""}`);
  } catch (galat) {
    hasil.push({ status: "GAGAL", nama, pesan: galat.message });
    bukti.push(`[GAGAL] ${nama} \u2014 ${galat.message}`);
  }
};
var harus = (kondisi, pesan) => {
  if (!kondisi) throw new Error(pesan);
};
var teks = (markup) => String(markup ?? "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/\s+/g, " ").trim();
var POTONGAN_KOTOR = ["undefined", "NaN", "[object Object]", "lorem ipsum", "[Grafik Placeholder]", "TODO:", "FIXME"];
var kotor = (markup) => POTONGAN_KOTOR.filter((potongan) => String(markup).includes(potongan));
var render = (Komponen, props = {}) => {
  bersihkan2();
  return renderToStaticMarkup(React30.createElement(Komponen, props));
};
var MODE_UJI = {
  client_key: null,
  is_production: false,
  fake: true,
  mode: "uji",
  alasan_kode: "fake_aktif",
  alasan: ALASAN_UJI,
  langkah_perbaikan: LANGKAH_UJI,
  server_key_terisi: false,
  sumber_kredensial: ".env (MIDTRANS_*)",
  catatan: CATATAN_ADMIN
};
var MODE_ASLI = {
  client_key: "SB-Mid-client-CONTOH",
  is_production: false,
  fake: false,
  mode: "asli",
  alasan_kode: null,
  alasan: null,
  langkah_perbaikan: [],
  server_key_terisi: true,
  sumber_kredensial: ".env (MIDTRANS_*)",
  catatan: CATATAN_ADMIN
};
var menitKeDepan = (menit, detikTambahan = 0) => new Date(Date.now() + menit * 6e4 + detikTambahan * 1e3).toISOString();
var PESANAN = { id: 91, code: "INV-2026-0091", total: "149000", status: "pending" };
var PEMBAYARAN = {
  status: "pending",
  qr_string: "00020101021226610014ID.CO.QRIS.WWW01189360091400000000000215",
  qris_url: null,
  gross_amount: "149000",
  expires_at: menitKeDepan(4, 30),
  paid_at: null,
  galat: null
};
var PENGATURAN = {
  umum: {},
  header: {},
  footer: {},
  kontak: {},
  seo: {},
  pembayaran: { shipping_cost_default: "20000", midtrans_client_key: "", midtrans_is_production: false }
};
uji("A1 midtransMode: mode uji lengkap", () => {
  const mode = midtransMode2(MODE_UJI);
  harus(mode.uji === true, "uji harus true");
  harus(mode.alasan === ALASAN_UJI, "alasan harus diteruskan apa adanya");
  harus(mode.langkah.length === 3, `langkah harus 3, dapat ${mode.langkah.length}`);
  harus(mode.catatan === CATATAN_ADMIN, "catatan harus diteruskan");
  return "uji=true, alasan & 3 langkah terisi";
});
uji("A2 midtransMode: mode asli menihilkan alasan/langkah", () => {
  const mode = midtransMode2(MODE_ASLI);
  harus(mode.uji === false, "uji harus false");
  harus(mode.alasan === null && mode.langkah.length === 0, "alasan/langkah harus kosong di mode asli");
  return "alasan=null, langkah=[]";
});
uji('A3 midtransMode: fake sebagai string "true" tetap terbaca uji', () => {
  const mode = midtransMode2({ ...MODE_UJI, mode: void 0, fake: "true" });
  harus(mode.uji === true, 'fake="true" harus terbaca uji');
  return 'fake="true" \u2192 uji=true';
});
uji("A4 midtransMode: prop null / bukan objek tidak melempar", () => {
  const a = midtransMode2(null);
  const b = midtransMode2("bukan-objek");
  harus(a.uji === false && b.uji === false, "keduanya harus false");
  harus(a.alasan === null && b.catatan === null, "teks harus null");
  harus(a.diketahui === false && b.diketahui === false, "mode tidak boleh dianggap diketahui");
  return "null & string \u2192 uji=false, diketahui=false tanpa galat";
});
uji('A5 midtransMode: alasan kosong/spasi jadi null (anti "undefined" di layar)', () => {
  const mode = midtransMode2({ ...MODE_UJI, alasan: "   ", langkah_perbaikan: [null, "", "ok"] });
  harus(mode.alasan === null, "alasan spasi harus null");
  harus(mode.langkah.length === 1, `langkah tak sah harus tersaring, dapat ${mode.langkah.length}`);
  return "alasan=null, langkah tersaring \u2192 1";
});
uji("A6 midtransMode: `diketahui` hanya true bila server benar-benar menyebut mode", () => {
  const kosong = midtransMode2({});
  const asli = midtransMode2({ fake: false });
  const ujiKode = midtransMode2({ mode: "uji" });
  const asing = midtransMode2({ mode: "sandbox" });
  harus(kosong.diketahui === false, "objek kosong tidak diketahui");
  harus(asli.diketahui === true && asli.uji === false, "fake=false \u2192 diketahui, mode asli");
  harus(ujiKode.diketahui === true && ujiKode.uji === true, "mode=uji \u2192 diketahui + uji");
  harus(asing.diketahui === false, "mode asing tidak dianggap diketahui");
  return "{} & mode asing \u2192 diketahui=false; fake=false & mode=uji \u2192 true";
});
uji("B1 Countdown: 5 menit \u2192 warna normal `text-ink-soft`, tanpa denyut", () => {
  const markup = render(Countdown2, { expiresAt: menitKeDepan(5) });
  harus(markup.includes("text-ink-soft"), "harus text-ink-soft");
  harus(!markup.includes("text-danger") && !markup.includes("animate-pulse"), "tidak boleh danger/pulse");
  return "text-ink-soft";
});
uji("B2 Countdown: 2 menit 58 detik \u2192 `text-danger` + `animate-pulse` + `motion-reduce:animate-none`", () => {
  const markup = render(Countdown2, { expiresAt: menitKeDepan(2, 58) });
  harus(markup.includes("text-danger "), "harus text-danger");
  harus(markup.includes("animate-pulse"), "harus animate-pulse");
  harus(markup.includes("motion-reduce:animate-none"), "harus hormati prefers-reduced-motion");
  harus(teks(markup).includes("02:5"), `sisa waktu harus terlihat, dapat ${teks(markup)}`);
  return "text-danger + animate-pulse + motion-reduce:animate-none, sisa 02:5x";
});
uji("B3 Countdown: 3 menit 2 detik \u2192 masih normal (ambang kurang dari 3 menit)", () => {
  const markup = render(Countdown2, { expiresAt: menitKeDepan(3, 2) });
  harus(markup.includes("text-ink-soft"), "harus masih normal");
  harus(!markup.includes("animate-pulse"), "belum boleh denyut");
  return "text-ink-soft di 03:0x";
});
uji("B4 Countdown: lewat waktu \u2192 `Kedaluwarsa` + `text-danger-strong`", () => {
  const markup = render(Countdown2, { expiresAt: new Date(Date.now() - 5e3).toISOString() });
  harus(teks(markup).includes("Kedaluwarsa"), "harus menampilkan Kedaluwarsa");
  harus(markup.includes("text-danger-strong"), "harus text-danger-strong");
  harus(!markup.includes("animate-pulse"), "denyut harus berhenti");
  return "Kedaluwarsa + text-danger-strong";
});
uji("B5 Countdown: waktu sisa terbaca screen reader (bukan hanya label)", () => {
  const markup = render(Countdown2, { expiresAt: menitKeDepan(2, 58) });
  harus(/Sisa waktu( pembayaran)? 02:5\d/.test(teks(markup)), `sr-only harus memuat sisa waktu, dapat ${teks(markup)}`);
  return "sr-only memuat sisa waktu (02:5x)";
});
uji("B6 Countdown: `expires_at` null / tidak sah \u2192 tidak dirender, tanpa NaN", () => {
  const a = render(Countdown2, { expiresAt: null });
  const b = render(Countdown2, { expiresAt: "bukan-tanggal" });
  harus(a === "" && b === "", `dua-duanya harus kosong, dapat "${a}" / "${b}"`);
  return "'' untuk null & 'bukan-tanggal'";
});
uji('C1 QrisPanel pending + mode uji: penanda "Mode uji" + alasan + langkah perbaikan di atas QR', () => {
  const markup = render(QrisPanel2, { status: "pending", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_UJI });
  const isi = teks(markup);
  harus(isi.includes("Mode uji"), "penanda Mode uji harus ada");
  harus(isi.includes(ALASAN_UJI), "alasan server harus tampil apa adanya");
  harus(isi.includes("Langkah perbaikan untuk pemilik:"), "label langkah perbaikan harus ada (kartu F2 butir a)");
  harus(markup.includes("<ol"), "langkah perbaikan harus berupa daftar bernomor");
  LANGKAH_UJI.forEach((langkah) => harus(isi.includes(langkah), `langkah "${langkah}" harus tampil apa adanya`));
  harus(markup.includes("<svg"), "kode QR tetap dirender");
  harus(/0[0-4]:[0-5]\d/.test(isi), `hitung mundur harus tampil, dapat ${isi}`);
  harus(isi.indexOf(ALASAN_UJI) < isi.indexOf("Kode pesanan"), "penanda harus di atas kode QR");
  return "penanda + alasan + 3 langkah tampil di atas QR, hitung mundur tetap ada";
});
uji("C2 QrisPanel pending + mode asli: tanpa penanda apa pun", () => {
  const markup = render(QrisPanel2, { status: "pending", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_ASLI });
  harus(!teks(markup).includes("Mode uji"), "penanda tidak boleh dirender saat fake=false");
  return 'tidak ada teks "Mode uji"';
});
uji("C3 QrisPanel tanpa prop midtrans: tidak melempar & tanpa penanda", () => {
  const markup = render(QrisPanel2, { status: "pending", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at });
  harus(!teks(markup).includes("Mode uji"), "tanpa prop tidak ada penanda");
  harus(kotor(markup).length === 0, `tidak boleh ada penanda kotor: ${kotor(markup).join(", ")}`);
  return "render normal, 0 penanda kotor";
});
uji("C4 QrisPanel state error + asli: hitung mundur tetap jalan (design \xA74.4)", () => {
  const markup = render(QrisPanel2, { status: "error", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_ASLI });
  const isi = teks(markup);
  harus(/0[0-4]:[0-5]\d/.test(isi), `hitung mundur harus tampil di state error, dapat ${isi}`);
  harus(isi.includes("Gagal memeriksa status pembayaran"), "pesan galat harus tetap ada");
  harus(isi.includes("Coba lagi"), "tombol Coba lagi harus tetap ada");
  return "hitung mundur + pesan galat + Coba lagi";
});
uji("C5 QrisPanel state error + mode uji: penanda tetap tampil (QR belum hilang)", () => {
  const markup = render(QrisPanel2, { status: "error", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_UJI });
  harus(teks(markup).includes("Mode uji"), "penanda harus tetap tampil");
  return "penanda Mode uji tampil";
});
uji("C6 QrisPanel checking + mode uji: penanda tampil, spinner ada", () => {
  const markup = render(QrisPanel2, { status: "checking", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_UJI });
  const isi = teks(markup);
  harus(isi.includes("Mode uji"), "penanda harus tampil");
  harus(isi.includes("Memeriksa status pembayaran"), "teks memeriksa harus ada");
  harus(markup.includes("animate-spin"), "spinner harus ada");
  return "penanda + spinner";
});
uji("C7 QrisPanel paid/expired: penanda tidak muncul (QR sudah tidak ditampilkan)", () => {
  const paid = render(QrisPanel2, { status: "paid", orderCode: PESANAN.code, total: PESANAN.total, paidAt: menitKeDepan(1), midtrans: MODE_UJI, successHref: "/checkout/91/selesai" });
  const expired = render(QrisPanel2, { status: "expired", orderCode: PESANAN.code, total: PESANAN.total, reason: "expire", midtrans: MODE_UJI });
  harus(teks(paid).includes("Pembayaran diterima") && !teks(paid).includes("Mode uji"), "paid: tanpa penanda");
  harus(teks(expired).includes("Pembayaran tidak selesai") && !teks(expired).includes("Mode uji"), "expired: tanpa penanda");
  return "paid & expired bersih dari penanda";
});
uji('C8 QrisPanel mode uji tanpa `alasan` (bentuk menyimpang): pakai kalimat cadangan, tanpa "undefined"', () => {
  const markup = render(QrisPanel2, { status: "pending", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: { ...MODE_UJI, alasan: null } });
  const isi = teks(markup);
  harus(isi.includes("Mode uji"), "penanda harus tetap ada");
  harus(isi.includes("tidak bisa ditransfer"), "kalimat cadangan harus muncul");
  harus(!isi.includes("undefined"), "tidak boleh ada undefined");
  return "kalimat cadangan tampil, tanpa undefined";
});
uji('C9 QrisPanel: angka dari server sebagai string tetap diformat, nilai kosong jadi "-"', () => {
  const markup = render(QrisPanel2, { status: "pending", orderCode: null, total: null, qrString: null, midtrans: MODE_ASLI });
  const isi = teks(markup);
  harus(isi.includes("Kode pesanan -"), `kode kosong harus "-", dapat ${isi}`);
  harus(!isi.includes("Rp") || !isi.includes("NaN"), "tanpa NaN");
  harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(", ")}`);
  return 'kode "-", 0 penanda kotor';
});
uji('C10 QrisPanel: langkah_perbaikan kosong / berisi nilai tak sah \u2192 tanpa daftar, tanpa "undefined"', () => {
  const kosong = render(QrisPanel2, { status: "pending", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, midtrans: { ...MODE_UJI, langkah_perbaikan: [] } });
  const aneh = render(QrisPanel2, { status: "pending", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, midtrans: { ...MODE_UJI, langkah_perbaikan: [null, "   ", 7] } });
  harus(teks(kosong).includes("Mode uji") && !kosong.includes("<ol") && !teks(kosong).includes("Langkah perbaikan"), "langkah kosong: penanda tetap ada tanpa daftar");
  harus(teks(aneh).includes("Mode uji") && !aneh.includes("<ol"), "langkah tak sah: tanpa daftar");
  harus(teks(aneh).includes("Langkah perbaikan") === false, "label langkah tidak boleh tampil tanpa isi sah");
  harus(kotor(aneh).length === 0, `penanda kotor: ${kotor(aneh).join(", ")}`);
  return 'langkah [] & [null, "   ", 7] \u2192 tanpa <ol>, tanpa undefined';
});
uji("C11 QrisPanel: `pembayaran.galat` (kontrak \xA77.7) tampil apa adanya di atas QR, teks di-escape", () => {
  const markup = render(QrisPanel2, { status: "pending", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, galat: GALAT_BAYAR, midtrans: MODE_UJI });
  const isi = teks(markup);
  harus(isi.includes("Pembayaran QRIS bermasalah"), "judul galat harus ada");
  harus(isi.includes(GALAT_BAYAR), "teks galat server harus tampil apa adanya");
  harus(markup.includes("&lt;b&gt;server key&lt;/b&gt;") && !markup.includes("<b>server key</b>"), "teks galat harus di-escape, bukan HTML");
  harus(isi.includes("Mode uji"), "penanda mode uji tetap tampil");
  harus(isi.indexOf("Permintaan ke Midtrans gagal") < isi.indexOf("Mode uji"), "galat ditampilkan di atas penanda mode uji");
  return "galat apa adanya (ter-escape) di atas penanda mode uji";
});
uji("C12 QrisPanel: `galat` null / kosong / bukan teks \u2192 tidak ada notice galat", () => {
  const samaran = [null, "", "   ", 0, {}, []].map((nilai) => teks(render(QrisPanel2, { status: "pending", qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, galat: nilai, midtrans: MODE_ASLI })));
  samaran.forEach((isi, index) => harus(!isi.includes("Pembayaran QRIS bermasalah"), `nilai ke-${index} tidak boleh memunculkan galat`));
  return "6 bentuk kosong \u2192 0 notice galat";
});
uji("D1 CheckoutPay: prop `midtrans` diteruskan ke QrisPanel", () => {
  const markup = render(CheckoutPay2, { pesanan: PESANAN, pembayaran: PEMBAYARAN, midtrans: MODE_UJI });
  const isi = teks(markup);
  harus(isi.includes("Selesaikan Pembayaran"), "panel QRIS harus dirender");
  harus(isi.includes("Mode uji") && isi.includes(ALASAN_UJI), "penanda + alasan harus terlihat pembeli");
  harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(", ")}`);
  return "penanda + alasan tampil di halaman bayar";
});
uji("D2 CheckoutPay: tanpa prop `midtrans` tetap render, tanpa penanda", () => {
  const markup = render(CheckoutPay2, { pesanan: PESANAN, pembayaran: PEMBAYARAN });
  harus(teks(markup).includes("Selesaikan Pembayaran"), "halaman harus tetap render");
  harus(!teks(markup).includes("Mode uji"), "tanpa prop tidak ada penanda");
  harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(", ")}`);
  return "render normal, 0 penanda kotor";
});
uji("D3 CheckoutPay: mode asli tidak memunculkan penanda meski prop lengkap", () => {
  const markup = render(CheckoutPay2, { pesanan: PESANAN, pembayaran: PEMBAYARAN, midtrans: MODE_ASLI });
  harus(!teks(markup).includes("Mode uji"), "penanda tidak boleh muncul di mode asli");
  return "bersih";
});
uji("D4 CheckoutPay: `pembayaran.galat` diteruskan ke QrisPanel (kontrak \xA77.7)", () => {
  const markup = render(CheckoutPay2, { pesanan: PESANAN, pembayaran: { ...PEMBAYARAN, galat: GALAT_BAYAR }, midtrans: MODE_UJI });
  const isi = teks(markup);
  harus(isi.includes("Selesaikan Pembayaran"), "panel QRIS harus dirender");
  harus(isi.includes(GALAT_BAYAR), "teks galat server harus tampil apa adanya");
  return "galat server tampil di halaman bayar";
});
uji("D5 CheckoutPay: `pembayaran.galat` null \u2192 tanpa notice galat", () => {
  const markup = render(CheckoutPay2, { pesanan: PESANAN, pembayaran: PEMBAYARAN, midtrans: MODE_ASLI });
  const isi = teks(markup);
  harus(!isi.includes("Pembayaran QRIS bermasalah"), "tanpa galat tidak ada notice galat");
  harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(", ")}`);
  return "0 notice galat, 0 penanda kotor";
});
var adminProps = (midtrans, tab) => {
  globalThis.window.location.search = tab ? `?tab=${tab}` : "";
  return { auth: { user: { name: "Pemilik" } }, pengaturan: PENGATURAN, carousels: [], faqs: [], flash: null, midtrans };
};
uji("E1 tab Pembayaran + mode uji: badge, alasan, 3 langkah, sumber kredensial, catatan", () => {
  const markup = render(SettingsIndex2, adminProps(MODE_UJI, "pembayaran"));
  const isi = teks(markup);
  harus(isi.includes("Mode uji"), "badge Mode uji harus ada");
  harus(isi.includes(ALASAN_UJI), "alasan server harus tampil");
  LANGKAH_UJI.forEach((langkah) => harus(isi.includes(langkah), `langkah harus tampil: ${langkah}`));
  harus(isi.includes("Kredensial dibaca dari .env (MIDTRANS_*)"), "sumber kredensial harus tampil");
  harus(isi.includes(CATATAN_ADMIN), "catatan server (kolom belum dipakai) harus tampil");
  harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(", ")}`);
  return "badge + alasan + 3 langkah + sumber kredensial + catatan";
});
uji("E2 tab Pembayaran + mode asli: badge netral, tanpa notice mode uji", () => {
  const markup = render(SettingsIndex2, adminProps(MODE_ASLI, "pembayaran"));
  const isi = teks(markup);
  harus(isi.includes("Mode asli"), "badge Mode asli harus ada");
  harus(!isi.includes("Mode uji"), "notice mode uji tidak boleh dirender");
  harus(!isi.includes(LANGKAH_UJI[0]), "langkah perbaikan tidak perlu di mode asli");
  harus(isi.includes(CATATAN_ADMIN), "catatan server tetap tampil");
  return 'badge "Mode asli", 0 notice';
});
uji("E3 tab Pembayaran: hint kolom tidak lagi menyesatkan (D11)", () => {
  const markup = render(SettingsIndex2, adminProps(MODE_UJI, "pembayaran"));
  const isi = teks(markup);
  harus(!isi.includes("Client key hanya dipakai untuk memuat halaman pembayaran"), "hint lama harus hilang");
  harus(isi.includes("Catatan saja: nilai ini tidak dibaca jalur pembayaran QRIS"), "hint catatan harus ada");
  harus(isi.includes("Midtrans mode produksi (0/1)"), "label lama dipertahankan (menunggu keputusan pemilik P3)");
  return "hint lama hilang, hint catatan muncul 2x, label dipertahankan";
});
uji("E4 tab Pembayaran tanpa prop midtrans: baris status tidak dirender (tidak menebak mode)", () => {
  const markup = render(SettingsIndex2, adminProps(null, "pembayaran"));
  const isi = teks(markup);
  harus(isi.includes("Midtrans client key"), "blok Midtrans harus tetap ada");
  harus(!isi.includes("Mode uji") && !isi.includes("Mode asli"), "tanpa prop tidak ada baris mode");
  harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(", ")}`);
  return "blok tetap ada, 0 klaim mode";
});
uji('E4b tab Pembayaran dengan mode tak dikenal (mode="sandbox"): tidak mengklaim apa pun', () => {
  const markup = render(SettingsIndex2, adminProps({ ...MODE_UJI, mode: "sandbox", fake: void 0 }, "pembayaran"));
  const isi = teks(markup);
  harus(!isi.includes("Mode uji") && !isi.includes("Mode asli"), "mode asing tidak boleh diklaim");
  harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(", ")}`);
  return "0 klaim mode untuk bentuk tak dikenal";
});
uji('E5 tab Pembayaran + bentuk menyimpang (alasan/langkah hilang): fallback, tanpa "undefined"', () => {
  const markup = render(SettingsIndex2, adminProps({ ...MODE_UJI, alasan: null, langkah_perbaikan: null, catatan: null, sumber_kredensial: null }, "pembayaran"));
  const isi = teks(markup);
  harus(isi.includes("Mode uji"), "badge tetap ada");
  harus(isi.includes("QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer"), "kalimat cadangan tampil");
  harus(!isi.includes("undefined") && !isi.includes("NaN"), "tanpa undefined/NaN");
  return "fallback tampil, 0 undefined";
});
uji("E6 penanda hanya di tab Pembayaran (tab lain tidak terpengaruh)", () => {
  const markup = render(SettingsIndex2, adminProps(MODE_UJI, null));
  const isi = teks(markup);
  harus(!isi.includes("Mode uji"), "tab bawaan (Umum) tidak boleh memuat penanda pembayaran");
  harus(!isi.includes("Midtrans client key"), "form Pembayaran tidak dirender di tab lain");
  return "tab Umum bersih dari blok Midtrans";
});
globalThis.window.location.search = "?tab=pembayaran";
var gagal = hasil.filter((baris) => baris.status === "GAGAL");
var laporan = [
  "Bukti verifikasi frontend \u2014 kartu t_e60e7733 (F2: penanda mode uji + hitung mundur)",
  `Waktu: ${(/* @__PURE__ */ new Date()).toISOString()}`,
  `Cara: esbuild (bundle harness uji SSR) + node, stub @inertiajs/react; SSR murni tanpa server pengembangan.`,
  `Hasil: ${hasil.length - gagal.length}/${hasil.length} uji OK${gagal.length ? `, ${gagal.length} GAGAL` : ""}`,
  "",
  ...bukti,
  ""
];
if (gagal.length) {
  laporan.push("Rincian kegagalan:");
  gagal.forEach((baris) => laporan.push(`- ${baris.nama}: ${baris.pesan}`));
  laporan.push("");
}
var tujuan = path.join(AKAR, "docs", "bukti-frontend-t_e60e7733.txt");
fs.writeFileSync(tujuan, laporan.join("\n"), "utf8");
console.log(laporan.join("\n"));
console.log(`laporan lengkap: ${tujuan}`);
process.exit(gagal.length ? 1 : 0);
