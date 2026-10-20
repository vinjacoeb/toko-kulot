// tmp/priceblock-check.mjs
import React2 from "react";
import { renderToStaticMarkup } from "react-dom/server";

// resources/js/Components/PriceBlock.jsx
import React from "react";

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");
var rupiah = (value) => {
  if (value === null || value === void 0 || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `Rp${Math.round(number).toLocaleString("id-ID")}`;
};

// resources/js/Components/PriceBlock.jsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function PriceBlock({ price, comparePrice = null, size = "lg", className = "" }) {
  const value = Number(price ?? 0);
  const compare = comparePrice === null || comparePrice === void 0 ? null : Number(comparePrice);
  const hasCompare = compare !== null && Number.isFinite(compare) && compare > value && value > 0;
  const discount = hasCompare ? Math.round((compare - value) / compare * 100) : 0;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-wrap items-baseline gap-2", className), children: [
    /* @__PURE__ */ jsx("span", { className: cn("font-bold text-ink", size === "lg" ? "text-[24px] leading-8" : "text-[15px]"), children: rupiah(value) }),
    hasCompare && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("span", { className: "text-meta text-slate-400 line-through", children: rupiah(compare) }),
      /* @__PURE__ */ jsx("span", { className: "rounded-sm bg-sale-500/10 px-1.5 py-0.5 text-badge font-semibold text-sale-500", children: "-" + discount + "%" })
    ] })
  ] });
}

// tmp/priceblock-check.mjs
var cases = [
  { label: "compare_price kosong (null)", props: { price: 169e3, comparePrice: null, size: "sm" } },
  { label: "compare_price > harga", props: { price: 169e3, comparePrice: 22e4, size: "sm" } },
  { label: "compare_price < harga (tidak boleh ada badge)", props: { price: 169e3, comparePrice: 15e4, size: "sm" } },
  { label: "harga string dari server", props: { price: "169000", comparePrice: "220000", size: "sm" } },
  { label: "harga kosong", props: { price: null, comparePrice: null, size: "sm" } }
];
var fail = 0;
for (const c of cases) {
  const html = renderToStaticMarkup(React2.createElement(PriceBlock, c.props));
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const hasStrike = html.includes("line-through");
  const hasBadge = /-\d+%/.test(text);
  const hasNaN = /NaN|undefined/.test(text);
  if (hasNaN) fail += 1;
  console.log(`${c.label}: teks="${text}" | coret=${hasStrike} | badge=${hasBadge} | nan=${hasNaN}`);
}
console.log(fail === 0 ? "HASIL: tidak ada NaN/undefined pada semua kasus" : `HASIL: ${fail} kasus mengandung NaN/undefined`);
process.exit(fail === 0 ? 0 : 1);
