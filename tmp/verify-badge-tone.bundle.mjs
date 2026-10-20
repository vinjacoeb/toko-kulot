// tmp/verify-badge-tone.mjs
import React4 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// resources/js/Components/StatusBadge.jsx
import React from "react";

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");
var rupiah = (value) => {
  if (value === null || value === void 0 || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `Rp${Math.round(number).toLocaleString("id-ID")}`;
};

// resources/js/Components/StatusBadge.jsx
var TONES = {
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
  const tone = TONES[key] ?? null;
  const text = label ?? tone?.label ?? (key === "" ? "-" : status);
  return /* @__PURE__ */ React.createElement(
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

// resources/js/Components/Badge.jsx
import React2 from "react";
var CLASSES2 = {
  brand: "bg-brand/10 text-brand",
  accent: "bg-accent-500 text-ink",
  sale: "bg-sale-500 text-white",
  success: "bg-success/10 text-success-strong",
  warning: "bg-warning/10 text-warning-strong",
  danger: "bg-danger/10 text-danger-strong"
};
function Badge({ tone = "brand", children, className = "" }) {
  return /* @__PURE__ */ React2.createElement(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase",
        CLASSES2[tone] ?? CLASSES2.brand,
        className
      )
    },
    children
  );
}

// resources/js/Components/PriceBlock.jsx
import React3 from "react";
function PriceBlock({ price, comparePrice = null, size = "lg", className = "" }) {
  const value = Number(price ?? 0);
  const compare = comparePrice === null || comparePrice === void 0 ? null : Number(comparePrice);
  const hasCompare = compare !== null && Number.isFinite(compare) && compare > value && value > 0;
  const discount = hasCompare ? Math.round((compare - value) / compare * 100) : 0;
  return /* @__PURE__ */ React3.createElement("div", { className: cn("flex flex-wrap items-baseline gap-2", className) }, /* @__PURE__ */ React3.createElement("span", { className: cn("font-bold text-ink", size === "lg" ? "text-[24px] leading-8" : "text-[15px]") }, rupiah(value)), hasCompare && /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("span", { className: "text-meta text-slate-500 line-through" }, rupiah(compare)), /* @__PURE__ */ React3.createElement("span", { className: "rounded-sm bg-sale-500 px-1.5 py-0.5 text-badge font-semibold text-white" }, "-" + discount + "%")));
}

// tmp/verify-badge-tone.mjs
var BASE_PILL = "inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase";
var checks = 0;
var failures = 0;
var ok = (label) => {
  checks += 1;
  console.log(`  ok   ${label}`);
};
var fail = (label, detail) => {
  checks += 1;
  failures += 1;
  console.log(`  FAIL ${label}${detail ? ` -> ${detail}` : ""}`);
};
var assert = (condition, label, detail = null) => condition ? ok(label) : fail(label, detail);
var firstClass = (html) => {
  const match = /class="([^"]*)"/.exec(html);
  return match ? match[1] : "";
};
var textOf = (html) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
var classAttrs = (html) => [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]);
var pillForbidden = (classAttr) => {
  const bad = [];
  if (/\btext-(warning|success|danger)(?![-\w])/.test(classAttr)) bad.push("token state dasar (wajib -strong)");
  if (/\bbg-slate-200/.test(classAttr) && /\btext-slate-500\b/.test(classAttr)) bad.push("teks slate-500 di atas tint 200/60 (wajib slate-600)");
  if (/\bbg-sale-500\/10\b/.test(classAttr) || /\btext-sale-500\b/.test(classAttr)) bad.push("tint sale (wajib solid bg-sale-500 text-white)");
  if (/\bbg-accent(\/|\b)/.test(classAttr) && /\btext-accent\b/.test(classAttr)) bad.push("tint accent (wajib bg-accent-500 text-ink)");
  if (/\bbg-accent-500\b/.test(classAttr) && /\btext-white\b/.test(classAttr)) bad.push("text-white di atas accent (wajib text-ink)");
  return bad;
};
var forbiddenInMarkup = (html) => classAttrs(html).flatMap((c) => pillForbidden(c));
var checkPill = (status, expectedClass, expectedText, extraProps = {}) => {
  const html = renderToStaticMarkup(React4.createElement(StatusBadge, { status, ...extraProps }));
  const token = status === null ? "null" : `"${status}"`;
  assert(firstClass(html) === expectedClass, `StatusBadge status=${token} kelas baku`, firstClass(html));
  assert(textOf(html) === expectedText, `StatusBadge status=${token} label "${expectedText}"`, textOf(html));
  const bad = pillForbidden(firstClass(html));
  assert(bad.length === 0, `StatusBadge status=${token} tanpa bentuk kelas lama/terlarang`, bad.join(", "));
  assert(!/text-white/.test(firstClass(html)), `StatusBadge status=${token} tidak memakai text-white di tint`, firstClass(html));
};
console.log("== StatusBadge \u2014 peta tone \xA74.21 v2.1 ==");
checkPill("pending", `${BASE_PILL} bg-warning/10 text-warning-strong`, "Menunggu");
checkPill("PENDING", `${BASE_PILL} bg-warning/10 text-warning-strong`, "Menunggu");
checkPill("dibayar", `${BASE_PILL} bg-brand/10 text-brand`, "Dibayar");
checkPill("diproses", `${BASE_PILL} bg-brand/10 text-brand`, "Diproses");
checkPill("dikirim", `${BASE_PILL} bg-brand/10 text-brand`, "Dikirim");
checkPill("selesai", `${BASE_PILL} bg-success/10 text-success-strong`, "Selesai");
checkPill("batal", `${BASE_PILL} bg-danger/10 text-danger-strong`, "Batal");
checkPill("Sudah dibaca", `${BASE_PILL} bg-slate-200/60 text-slate-600`, "Sudah dibaca");
checkPill("arsip", `${BASE_PILL} bg-slate-200/60 text-slate-600`, "arsip");
checkPill(null, `${BASE_PILL} bg-slate-200/60 text-slate-600`, "-");
checkPill("batal", `${BASE_PILL} bg-danger/10 text-danger-strong`, "Dibatalkan", { label: "Dibatalkan" });
console.log("== StatusBadge \u2014 override tone per halaman (halaman pesan/ulasan admin) ==");
{
  const html = renderToStaticMarkup(
    React4.createElement(StatusBadge, {
      status: "belum dibaca",
      label: "Belum dibaca",
      className: "bg-warning/10 text-warning-strong"
    })
  );
  const cls = firstClass(html);
  assert(cls.endsWith("bg-warning/10 text-warning-strong"), "override warning halaman pesan terpasang", cls);
  assert(pillForbidden(cls).length === 0, "override warning halaman pesan tanpa token dasar", pillForbidden(cls).join(", "));
}
{
  const html = renderToStaticMarkup(
    React4.createElement(StatusBadge, { status: "sudah dibaca", label: "Sudah dibaca", className: "bg-success/10 text-success-strong" })
  );
  const cls = firstClass(html);
  assert(cls.endsWith("bg-success/10 text-success-strong"), "override success halaman pesan terpasang", cls);
}
{
  const html = renderToStaticMarkup(React4.createElement(StatusBadge, { status: "tampil", label: "Tampil" }));
  const cls = firstClass(html);
  assert(cls.endsWith("bg-slate-200/60 text-slate-600"), "Reviews tanpa override (sembunyi) tetap neutral", cls);
}
console.log("== Badge \u2014 tone \xA74.21 v2.1 (promo/sale) ==");
var checkBadge = (tone, expectedClass, text, props = {}) => {
  const html = renderToStaticMarkup(React4.createElement(Badge, tone === void 0 ? props : { tone, ...props }, text));
  const cls = firstClass(html);
  const label = `Badge tone=${tone === void 0 ? "(default)" : tone}`;
  assert(cls === expectedClass, `${label} kelas baku`, cls);
  assert(textOf(html) === text, `${label} isi "${text}"`, textOf(html));
  assert(pillForbidden(cls).length === 0, `${label} tanpa bentuk kelas lama/terlarang`, pillForbidden(cls).join(", "));
};
checkBadge(void 0, `${BASE_PILL} bg-brand/10 text-brand`, "Baru");
checkBadge("brand", `${BASE_PILL} bg-brand/10 text-brand`, "Baru");
checkBadge("accent", `${BASE_PILL} bg-accent-500 text-ink`, "Promo");
checkBadge("sale", `${BASE_PILL} bg-sale-500 text-white`, "Sale");
checkBadge("success", `${BASE_PILL} bg-success/10 text-success-strong`, "Tersedia");
checkBadge("warning", `${BASE_PILL} bg-warning/10 text-warning-strong`, "Terbatas");
checkBadge("danger", `${BASE_PILL} bg-danger/10 text-danger-strong`, "Habis");
checkBadge("neon", `${BASE_PILL} bg-brand/10 text-brand`, "Tone tak dikenal");
{
  const html = renderToStaticMarkup(React4.createElement(Badge, { tone: "accent" }, "Promo"));
  assert(!/text-white/.test(firstClass(html)), "Badge accent memakai text-ink, bukan text-white", firstClass(html));
}
{
  const html = renderToStaticMarkup(React4.createElement(Badge, { tone: "accent", className: "ml-2" }, "Promo"));
  assert(firstClass(html).endsWith(" bg-accent-500 text-ink ml-2"), "Badge meneruskan className", firstClass(html));
}
console.log("== PriceBlock \u2014 badge diskon solid (T5) ==");
var priceHtml = (props) => renderToStaticMarkup(React4.createElement(PriceBlock, props));
var badgeSpan = (html) => {
  const match = /<span class="([^"]*bg-sale-500[^"]*)">([^<]*)<\/span>/.exec(html);
  return match ? { className: match[1], text: match[2] } : null;
};
{
  const html = priceHtml({ price: 169e3, comparePrice: 219e3 });
  const badge = badgeSpan(html);
  assert(badge !== null, "badge diskon dirender saat comparePrice > price", html);
  assert(badge?.className === "rounded-sm bg-sale-500 px-1.5 py-0.5 text-badge font-semibold text-white", "badge diskon solid bg-sale-500 text-white", badge?.className);
  assert(badge?.text === "-23%", "persentase diskon benar", badge?.text);
  assert(forbiddenInMarkup(html).length === 0, "PriceBlock tanpa tint sale/accent terlarang", forbiddenInMarkup(html).join(", "));
  assert(html.includes("Rp169.000"), "harga jual tampil", html);
  assert(html.includes('class="text-meta text-slate-500 line-through"'), "harga coret tetap text-meta text-slate-500 line-through (\xA711.4 T2, kartu t_90759be9)", html);
}
{
  const html = priceHtml({ price: 169e3, comparePrice: 219e3, size: "sm" });
  assert(badgeSpan(html)?.className === "rounded-sm bg-sale-500 px-1.5 py-0.5 text-badge font-semibold text-white", 'badge diskon solid juga pada size="sm"', badgeSpan(html)?.className);
}
{
  const html = priceHtml({ price: "169000", comparePrice: "219000" });
  assert(badgeSpan(html)?.text === "-23%", "harga string dari server tetap benar", badgeSpan(html)?.text);
}
{
  const html = priceHtml({ price: 169e3, comparePrice: null });
  assert(badgeSpan(html) === null, "tanpa comparePrice tidak ada badge diskon", html);
}
{
  const html = priceHtml({ price: 169e3, comparePrice: 15e4 });
  assert(badgeSpan(html) === null, "comparePrice < price tidak ada badge diskon", html);
}
console.log("== Kontrol negatif \u2014 harness harus menandai markup LAMA sebagai gagal ==");
{
  const cases = [
    ["pil warning lama", `${BASE_PILL} bg-warning/10 text-warning`, /token state dasar/],
    ["pil neutral lama", `${BASE_PILL} bg-slate-200/60 text-slate-500`, /slate-500 di atas tint/],
    ["pil accent lama (text-white)", `${BASE_PILL} bg-accent-500 text-white`, /text-white di atas accent/],
    ["pil accent tint lama", `${BASE_PILL} bg-accent/10 text-accent`, /tint accent/],
    ["badge diskon tint lama", "rounded-sm bg-sale-500/10 px-1.5 py-0.5 text-badge font-semibold text-sale-500", /tint sale/]
  ];
  cases.forEach(([label, cls, re]) => {
    const found = pillForbidden(cls);
    assert(found.some((f) => re.test(f)), `kontrol negatif: ${label} tertangkap`, found.join(", ") || "(tidak tertangkap)");
  });
  const META = "text-meta text-slate-500 line-through";
  assert(pillForbidden(META).length === 0, "kontrol positif: teks meta slate-500 di atas putih TIDAK ditandai", pillForbidden(META).join(", "));
  const SOLID = "rounded-sm bg-sale-500 px-1.5 py-0.5 text-badge font-semibold text-white";
  assert(pillForbidden(SOLID).length === 0, "kontrol positif: badge diskon solid TIDAK ditandai", pillForbidden(SOLID).join(", "));
}
console.log("== Ringkasan ==");
console.log(`  ${checks - failures}/${checks} lulus, ${failures} gagal`);
process.exit(failures === 0 ? 0 : 1);
export {
  forbiddenInMarkup,
  pillForbidden
};
