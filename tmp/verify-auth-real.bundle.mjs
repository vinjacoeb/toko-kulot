// tmp/verify-auth-real.mjs
import React12 from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";

// tmp/inertia-stub.jsx
import React from "react";
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
  return /* @__PURE__ */ React.createElement("a", { href: typeof href === "string" ? href : "#", ...rest }, children);
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

// resources/js/Pages/Public/Auth/Login.jsx
import React8 from "react";

// resources/js/Layouts/AuthLayout.jsx
import React3 from "react";

// resources/js/Components/icons.jsx
import React2 from "react";
var Svg = ({ size = 20, className = "", children, filled = false, ...rest }) => /* @__PURE__ */ React2.createElement(
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
var SearchIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("circle", { cx: "11", cy: "11", r: "7" }), /* @__PURE__ */ React2.createElement("path", { d: "m20.5 20.5-3.9-3.9" }));
var CloseIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M6 6l12 12M18 6 6 18" }));
var CheckIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m5 12.5 4.5 4.5L19 7" }));
var TruckIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M2.5 7.5h10v8h-10z" }), /* @__PURE__ */ React2.createElement("path", { d: "M12.5 10.5h4l3 3v2h-7z" }), /* @__PURE__ */ React2.createElement("circle", { cx: "6", cy: "18", r: "1.6" }), /* @__PURE__ */ React2.createElement("circle", { cx: "16.5", cy: "18", r: "1.6" }));
var ReturnIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M4 9h9a5 5 0 0 1 0 10H8" }), /* @__PURE__ */ React2.createElement("path", { d: "m7.5 5.5-3.5 3.5 3.5 3.5" }));
var ShieldCheckIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M12 3.5l7 2.5v5.4c0 4-3 7.2-7 8.6-4-1.4-7-4.6-7-8.6V6l7-2.5z" }), /* @__PURE__ */ React2.createElement("path", { d: "m8.8 12 2.2 2.2 4.2-4.2" }));
var HeadsetIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" }), /* @__PURE__ */ React2.createElement("path", { d: "M4.5 13h2.2v5H5.6A1.6 1.6 0 0 1 4 16.4V13z" }), /* @__PURE__ */ React2.createElement("path", { d: "M19.5 13h-2.2v5h1.1a1.6 1.6 0 0 0 1.6-1.6V13z" }), /* @__PURE__ */ React2.createElement("path", { d: "M17.3 18v.6a2.4 2.4 0 0 1-2.4 2.4H12" }));
var AlertIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M12 4.5 21 20H3L12 4.5z" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 10v4" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 17h.01" }));
var SpinnerIcon = ({ size = 16, className = "" }) => /* @__PURE__ */ React2.createElement(
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
  /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "1.5", opacity: "0.25" }),
  /* @__PURE__ */ React2.createElement("path", { d: "M21 12a9 9 0 0 0-9-9", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
);
var LeafIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M20 4c-8 0-13 3.5-13 9.5A5.5 5.5 0 0 0 12.5 19C18.5 19 20 12 20 4z" }), /* @__PURE__ */ React2.createElement("path", { d: "M4 21c1.5-5 5-8.5 9-10.5" }));
var ScissorsIcon = (props) => /* @__PURE__ */ React2.createElement(Svg, { ...props }, /* @__PURE__ */ React2.createElement("circle", { cx: "6", cy: "6", r: "2.5" }), /* @__PURE__ */ React2.createElement("circle", { cx: "6", cy: "18", r: "2.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M8.2 7.6 20 18M8.2 16.4 20 6" }));
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

// resources/js/Layouts/AuthLayout.jsx
function AuthLayout({ title, heading, lead = null, settings: settings2 = null, children }) {
  const page = usePage();
  const source = settings2 ?? page?.props?.settings ?? null;
  const storeName = source?.store_name ?? "Toko Kulot";
  const tagline = source?.store_tagline ?? source?.tagline ?? null;
  const logoUrl = source?.store_logo ?? source?.logo_url ?? null;
  const bullets = toList(source?.landing_sections?.trust_strip).filter((item) => item && (item.title || item.label)).slice(0, 3).map((item) => ({
    icon: item.icon ?? "check",
    title: item.title ?? item.label,
    subtitle: item.subtitle ?? item.description ?? item.body ?? null
  }));
  return /* @__PURE__ */ React3.createElement("div", { className: "min-h-screen bg-white text-ink lg:grid lg:grid-cols-2" }, /* @__PURE__ */ React3.createElement(Head, { title }), /* @__PURE__ */ React3.createElement(
    "a",
    {
      href: "#konten-utama",
      className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
    },
    "Lewati ke konten utama"
  ), /* @__PURE__ */ React3.createElement("aside", { className: "flex h-[160px] flex-col justify-center gap-3 bg-brand-700 px-6 py-6 text-white lg:h-auto lg:justify-between lg:gap-10 lg:px-12 lg:py-14" }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center gap-3" }, logoUrl && /* @__PURE__ */ React3.createElement("img", { src: logoUrl, alt: "", className: "h-10 w-auto" }), /* @__PURE__ */ React3.createElement("span", { className: "font-display text-h2 uppercase text-white" }, storeName)), tagline && /* @__PURE__ */ React3.createElement("p", { className: "hidden text-body text-white/75 lg:block" }, tagline), bullets.length > 0 && /* @__PURE__ */ React3.createElement("ul", { className: "hidden space-y-5 lg:block" }, bullets.map((item, index) => {
    const Icon = TRUST_ICONS[String(item.icon).toLowerCase()] ?? TRUST_ICONS.check;
    return /* @__PURE__ */ React3.createElement("li", { key: `${item.icon}-${index}`, className: "flex items-start gap-3" }, /* @__PURE__ */ React3.createElement("span", { className: "mt-0.5 shrink-0 text-accent-500", "aria-hidden": "true" }, /* @__PURE__ */ React3.createElement(Icon, { size: 22 })), /* @__PURE__ */ React3.createElement("span", { className: "min-w-0" }, /* @__PURE__ */ React3.createElement("span", { className: "block text-label text-white" }, item.title), item.subtitle && /* @__PURE__ */ React3.createElement("span", { className: "mt-0.5 block text-meta text-white/75" }, item.subtitle)));
  }))), /* @__PURE__ */ React3.createElement("main", { id: "konten-utama", className: "flex items-center justify-center px-4 py-10 lg:px-12 lg:py-16" }, /* @__PURE__ */ React3.createElement("div", { className: "w-full max-w-form" }, /* @__PURE__ */ React3.createElement("h1", { className: "text-h1 text-ink" }, heading), lead && /* @__PURE__ */ React3.createElement("p", { className: "mt-2 text-body text-ink-soft" }, lead), /* @__PURE__ */ React3.createElement("div", { className: "mt-6" }, children))));
}

// resources/js/Components/Button.jsx
import React4 from "react";
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
  const content = loading ? /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(SpinnerIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Memproses\u2026")) : /* @__PURE__ */ React4.createElement(React4.Fragment, null, icon, /* @__PURE__ */ React4.createElement("span", null, children));
  if (as === "a") {
    return /* @__PURE__ */ React4.createElement("a", { href, className: classes, ...rest }, content);
  }
  if (as === Link || as === "Link" || href) {
    return /* @__PURE__ */ React4.createElement(Link, { href, className: classes, "aria-busy": loading || void 0, ...rest }, content);
  }
  return /* @__PURE__ */ React4.createElement(
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
import React5 from "react";
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
  return /* @__PURE__ */ React5.createElement("div", { className: cn("flex flex-col", className) }, label && /* @__PURE__ */ React5.createElement("label", { htmlFor, className: "mb-1.5 block text-meta font-semibold text-ink" }, label, required && /* @__PURE__ */ React5.createElement("span", { className: "text-danger", "aria-hidden": "true" }, " *")), children, hint && !error && /* @__PURE__ */ React5.createElement("p", { id: hintId, className: "mt-1.5 text-meta text-slate-400" }, hint), error && /* @__PURE__ */ React5.createElement("p", { id: errorId, className: "mt-1.5 text-meta text-danger", role: "alert" }, error));
}

// resources/js/Components/InlineNotice.jsx
import React6 from "react";
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
  success: "text-success",
  warning: "text-warning",
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
  return /* @__PURE__ */ React6.createElement(
    "div",
    {
      role: tone === "error" ? "alert" : "status",
      className: cn("flex items-start gap-3 rounded-md p-4", TONES[tone] ?? TONES.info, className)
    },
    /* @__PURE__ */ React6.createElement("span", { className: cn("mt-0.5 shrink-0", ICON_TONES[tone] ?? ICON_TONES.info), "aria-hidden": "true" }, /* @__PURE__ */ React6.createElement(Icon, { size: 20 })),
    /* @__PURE__ */ React6.createElement("div", { className: "min-w-0 flex-1" }, title && /* @__PURE__ */ React6.createElement("p", { className: "text-label" }, title), children && /* @__PURE__ */ React6.createElement("div", { className: "text-meta text-ink-soft" }, children)),
    onDismiss && /* @__PURE__ */ React6.createElement(
      "button",
      {
        type: "button",
        onClick: onDismiss,
        "aria-label": "Tutup pesan",
        className: "shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60"
      },
      /* @__PURE__ */ React6.createElement(CloseIcon, { size: 16 })
    )
  );
}

// resources/js/Components/Input.jsx
import React7 from "react";
var BASE = "w-full h-field rounded-md border border-line bg-white px-3.5 text-body text-ink transition-colors duration-hover placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface";
function Input({ error = null, className = "", id = null, ...rest }) {
  return /* @__PURE__ */ React7.createElement(
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
function Login({ status = null, settings: settings2 = null, flash = null }) {
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
  return /* @__PURE__ */ React8.createElement(AuthLayout, { title: "Masuk", heading: "Masuk", settings: settings2 }, flash?.success && /* @__PURE__ */ React8.createElement(InlineNotice, { tone: "success", className: "mb-4" }, /* @__PURE__ */ React8.createElement("p", null, flash.success)), flash?.error && /* @__PURE__ */ React8.createElement(InlineNotice, { tone: "error", className: "mb-4" }, /* @__PURE__ */ React8.createElement("p", null, flash.error)), status && /* @__PURE__ */ React8.createElement(InlineNotice, { tone: "info", className: "mb-4" }, /* @__PURE__ */ React8.createElement("p", null, status)), /* @__PURE__ */ React8.createElement("form", { onSubmit: submit, className: "space-y-4", noValidate: true }, /* @__PURE__ */ React8.createElement(Field, { label: "Email", htmlFor: "login-email", required: true, error: errors.email }, /* @__PURE__ */ React8.createElement(
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
  )), /* @__PURE__ */ React8.createElement(Field, { label: "Kata Sandi", htmlFor: "login-password", required: true, error: errors.password }, /* @__PURE__ */ React8.createElement(
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
  )), /* @__PURE__ */ React8.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React8.createElement(
    "input",
    {
      id: "login-remember",
      name: "remember",
      type: "checkbox",
      checked: data.remember,
      onChange: (e) => setData("remember", e.target.checked),
      className: "h-4 w-4 rounded-sm border border-line accent-brand"
    }
  ), /* @__PURE__ */ React8.createElement("label", { htmlFor: "login-remember", className: "text-meta text-ink" }, "Ingat Saya")), /* @__PURE__ */ React8.createElement(Button, { type: "submit", fullWidth: true, loading: processing }, "Masuk")), /* @__PURE__ */ React8.createElement("p", { className: "mt-4 text-meta" }, /* @__PURE__ */ React8.createElement(Link, { href: "/forgot-password", className: "text-brand underline underline-offset-4" }, "Lupa kata sandi?")));
}

// resources/js/Pages/Public/Auth/Register.jsx
import React9 from "react";
function Register({ settings: settings2 = null, flash = null }) {
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
  return /* @__PURE__ */ React9.createElement(AuthLayout, { title: "Daftar Akun", heading: "Daftar Akun", settings: settings2 }, flash?.success && /* @__PURE__ */ React9.createElement(InlineNotice, { tone: "success", className: "mb-4" }, /* @__PURE__ */ React9.createElement("p", null, flash.success)), flash?.error && /* @__PURE__ */ React9.createElement(InlineNotice, { tone: "error", className: "mb-4" }, /* @__PURE__ */ React9.createElement("p", null, flash.error)), /* @__PURE__ */ React9.createElement("form", { onSubmit: submit, className: "space-y-4", noValidate: true }, /* @__PURE__ */ React9.createElement(Field, { label: "Nama", htmlFor: "register-name", required: true, error: errors.name }, /* @__PURE__ */ React9.createElement(
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
  )), /* @__PURE__ */ React9.createElement(Field, { label: "Email", htmlFor: "register-email", required: true, error: errors.email }, /* @__PURE__ */ React9.createElement(
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
  )), /* @__PURE__ */ React9.createElement(Field, { label: "Nomor WhatsApp", htmlFor: "register-phone", required: true, error: errors.phone }, /* @__PURE__ */ React9.createElement(
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
  )), /* @__PURE__ */ React9.createElement(Field, { label: "Kata Sandi", htmlFor: "register-password", required: true, error: errors.password }, /* @__PURE__ */ React9.createElement(
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
  )), /* @__PURE__ */ React9.createElement(
    Field,
    {
      label: "Konfirmasi Kata Sandi",
      htmlFor: "register-password-confirmation",
      required: true,
      error: errors.password_confirmation
    },
    /* @__PURE__ */ React9.createElement(
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
  ), /* @__PURE__ */ React9.createElement("div", null, /* @__PURE__ */ React9.createElement("div", { className: "flex items-start gap-2" }, /* @__PURE__ */ React9.createElement(
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
  ), /* @__PURE__ */ React9.createElement("label", { htmlFor: "register-terms", className: "text-meta text-ink" }, "Saya menyetujui syarat dan ketentuan.")), errors.terms && /* @__PURE__ */ React9.createElement("p", { id: "register-terms-error", role: "alert", className: "mt-1.5 text-meta text-danger" }, errors.terms)), /* @__PURE__ */ React9.createElement(Button, { type: "submit", fullWidth: true, loading: processing }, "Daftar")));
}

// resources/js/Pages/Public/Auth/ForgotPassword.jsx
import React10 from "react";
function ForgotPassword({ status = null, settings: settings2 = null, flash = null }) {
  const { data, setData, post, processing, errors } = useForm({
    email: ""
  });
  const submit = (e) => {
    e.preventDefault();
    if (processing) return;
    post("/forgot-password");
  };
  return /* @__PURE__ */ React10.createElement(AuthLayout, { title: "Lupa Kata Sandi", heading: "Lupa Kata Sandi", settings: settings2 }, flash?.success && /* @__PURE__ */ React10.createElement(InlineNotice, { tone: "success", className: "mb-4" }, /* @__PURE__ */ React10.createElement("p", null, flash.success)), flash?.error && /* @__PURE__ */ React10.createElement(InlineNotice, { tone: "error", className: "mb-4" }, /* @__PURE__ */ React10.createElement("p", null, flash.error)), status && /* @__PURE__ */ React10.createElement(InlineNotice, { tone: "info", className: "mb-4" }, /* @__PURE__ */ React10.createElement("p", null, status)), /* @__PURE__ */ React10.createElement("form", { onSubmit: submit, className: "space-y-4", noValidate: true }, /* @__PURE__ */ React10.createElement(Field, { label: "Email", htmlFor: "forgot-email", required: true, error: errors.email }, /* @__PURE__ */ React10.createElement(
    Input,
    {
      id: "forgot-email",
      name: "email",
      type: "email",
      autoComplete: "email",
      value: data.email,
      onChange: (e) => setData("email", e.target.value),
      error: errors.email
    }
  )), /* @__PURE__ */ React10.createElement(Button, { type: "submit", fullWidth: true, loading: processing }, "Kirim Tautan Reset")), /* @__PURE__ */ React10.createElement("p", { className: "mt-4 text-meta" }, /* @__PURE__ */ React10.createElement(Link, { href: "/login", className: "text-brand underline underline-offset-4" }, "Kembali ke halaman masuk")));
}

// resources/js/Pages/Public/Auth/ResetPassword.jsx
import React11 from "react";
function ResetPassword({ token = "", email = "", settings: settings2 = null, flash = null }) {
  const { data, setData, post, processing, errors } = useForm({
    token,
    email,
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    if (processing) return;
    post("/reset-password");
  };
  return /* @__PURE__ */ React11.createElement(AuthLayout, { title: "Reset Kata Sandi", heading: "Reset Kata Sandi", settings: settings2 }, flash?.success && /* @__PURE__ */ React11.createElement(InlineNotice, { tone: "success", className: "mb-4" }, /* @__PURE__ */ React11.createElement("p", null, flash.success)), errors.email && /* @__PURE__ */ React11.createElement(InlineNotice, { tone: "error", className: "mb-4" }, /* @__PURE__ */ React11.createElement("p", null, errors.email), /* @__PURE__ */ React11.createElement("p", { className: "mt-1" }, /* @__PURE__ */ React11.createElement(Link, { href: "/forgot-password", className: "underline underline-offset-4" }, "Minta tautan reset baru"))), /* @__PURE__ */ React11.createElement("form", { onSubmit: submit, className: "space-y-4", noValidate: true }, /* @__PURE__ */ React11.createElement("input", { type: "hidden", name: "token", value: data.token }), /* @__PURE__ */ React11.createElement(Field, { label: "Email", htmlFor: "reset-email" }, /* @__PURE__ */ React11.createElement(
    Input,
    {
      id: "reset-email",
      name: "email",
      type: "email",
      autoComplete: "email",
      value: data.email,
      readOnly: true,
      className: "bg-surface text-ink-soft"
    }
  )), /* @__PURE__ */ React11.createElement(Field, { label: "Kata Sandi Baru", htmlFor: "reset-password", required: true, error: errors.password }, /* @__PURE__ */ React11.createElement(
    Input,
    {
      id: "reset-password",
      name: "password",
      type: "password",
      autoComplete: "new-password",
      value: data.password,
      onChange: (e) => setData("password", e.target.value),
      error: errors.password
    }
  )), /* @__PURE__ */ React11.createElement(
    Field,
    {
      label: "Konfirmasi Kata Sandi Baru",
      htmlFor: "reset-password-confirmation",
      required: true,
      error: errors.password_confirmation
    },
    /* @__PURE__ */ React11.createElement(
      Input,
      {
        id: "reset-password-confirmation",
        name: "password_confirmation",
        type: "password",
        autoComplete: "new-password",
        value: data.password_confirmation,
        onChange: (e) => setData("password_confirmation", e.target.value),
        error: errors.password_confirmation
      }
    )
  ), /* @__PURE__ */ React11.createElement(Button, { type: "submit", fullWidth: true, loading: processing }, "Reset Kata Sandi")));
}

// tmp/verify-auth-real.mjs
var results = [];
var check = (label, ok, detail = "") => results.push({ label, ok: !!ok, detail });
var text = (html) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#?\w+;/g, " ").replace(/\s+/g, " ").trim();
function render(Component, props = {}, pageProps2 = {}, formErrors2 = {}) {
  __reset();
  __setPageProps(pageProps2);
  __setFormErrors(formErrors2);
  return renderToStaticMarkup(React12.createElement(Component, props));
}
var settings = JSON.parse(fs.readFileSync("tmp/settings-asli.json", "utf8"));
var strip = settings?.landing_sections?.trust_strip ?? [];
var judul = strip.map((i) => i.title ?? i.label).filter(Boolean);
var subjudul = strip.map((i) => i.subtitle ?? i.description).filter(Boolean);
console.log(`settings asli: store_name=${settings.store_name} | trust_strip=${strip.length} item`);
console.log(`judul bullet: ${judul.join(" | ")}`);
for (const [nama, Component] of [
  ["Login", Login],
  ["Register", Register],
  ["ForgotPassword", ForgotPassword],
  ["ResetPassword", ResetPassword]
]) {
  const html = render(Component, {}, { settings, flash: { success: null, error: null } });
  const t = text(html);
  check(`${nama}: nama toko asli tampil di panel brand`, t.includes(settings.store_name));
  check(`${nama}: tagline asli tampil`, !settings.store_tagline || t.includes(settings.store_tagline));
  check(`${nama}: tidak ada NaN/undefined`, !/NaN|undefined|null/.test(t), t.slice(0, 140));
}
{
  const html = render(Login, {}, { settings, flash: { success: null, error: null } });
  const t = text(html);
  const tiga = judul.slice(0, 3);
  check("panel brand: 3 bullet pertama dari trust_strip tampil", tiga.every((j) => t.includes(j)), tiga.join(" | "));
  check("panel brand: subjudul bullet tampil", subjudul.slice(0, 3).every((s) => t.includes(s)));
  check("panel brand: item ke-4 tidak tampil", judul.length < 4 || !t.includes(judul[3]), judul[3] ?? "-");
  check(
    "panel brand: ikon trust_strip dipakai (aria-hidden)",
    strip.slice(0, 3).every((i) => html.includes('aria-hidden="true"'))
  );
}
{
  const html = render(Login, {}, { settings: null, flash: { success: null, error: null } });
  const t = text(html);
  check("tanpa settings: nama bawaan Toko Kulot tampil", t.includes("Toko Kulot"));
  check("tanpa settings: tanpa NaN/undefined", !/NaN|undefined|null/.test(t), t.slice(0, 140));
  check("tanpa settings: tidak ada judul bullet asli", judul.every((j) => !t.includes(j)));
}
{
  const tanpaStrip = { ...settings, landing_sections: { ...settings.landing_sections ?? {}, trust_strip: [] } };
  const html = render(Login, {}, { settings: tanpaStrip, flash: { success: null, error: null } });
  const t = text(html);
  check("trust_strip kosong: panel tetap render nama toko", t.includes(settings.store_name));
  check("trust_strip kosong: tanpa bullet", judul.every((j) => !t.includes(j)));
}
var gagal = 0;
for (const r of results) {
  if (!r.ok) gagal += 1;
  console.log(`${r.ok ? "LULUS" : "GAGAL"}  ${r.label}${r.ok || !r.detail ? "" : "  -> " + r.detail}`);
}
console.log(`
ringkasan: ${results.length} pemeriksaan, gagal ${gagal}`);
process.exit(gagal ? 1 : 0);
