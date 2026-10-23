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

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");

// tmp/shim-jsx-runtime-t_321bf03c.mjs
import { createRequire as createRequire3 } from "node:module";
var require4 = createRequire3(import.meta.url);
var JR = require4("react/jsx-runtime");
var jsx = JR.jsx;
var jsxs = JR.jsxs;
var Fragment2 = JR.Fragment;

// resources/js/Components/icons.jsx
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
var asText = (nilai) => nilai === null || nilai === void 0 ? "" : String(nilai);
function InfoResi({ pesanan: pesanan2 = null }) {
  const id = pesanan2?.id ?? null;
  const tersimpan = asText(pesanan2?.tracking_number);
  const galat = usePage().props.errors?.tracking_number ?? null;
  const [nilai, setNilai] = useState(tersimpan);
  const [proses, setProses] = useState(false);
  useEffect(() => {
    setNilai(asText(pesanan2?.tracking_number));
  }, [pesanan2?.id, pesanan2?.tracking_number]);
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

// tmp/uji-aksi-resi-t_d1028202.mjs
var hasil = [];
var uji = (nama, fn) => {
  try {
    bersihkanStore();
    bersihkan();
    kendali.halaman.props = {};
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
var cari = (pohon, predikat) => semuaElemen(pohon).find(predikat) ?? null;
var bernama = (nama) => (el) => typeof el.type === "function" && el.type.name === nama;
var host = (tag) => (el) => el.type === tag;
var form = (pohon) => cari(pohon, host("form"));
var isian = (pohon) => cari(pohon, bernama("Input"));
var tombol = (pohon) => cari(pohon, bernama("Button"));
var catatKunjungan = (nama, kunjungan) => console.log(`        ${nama}: ${kunjungan.metode.toUpperCase()} ${kunjungan.url} ${JSON.stringify(kunjungan.data)}`);
var pesanan = (ubah = {}) => ({
  id: 5,
  code: "TK-20261020-0001",
  status: "dikirim",
  tracking_number: "JX1234567890",
  customer: { name: "Siti Aminah" },
  items: [],
  ...ubah
});
uji("B1 kirim resi baru -> PATCH /admin/pesanan/{id}/resi payload tracking_number", () => {
  const props = { pesanan: pesanan() };
  let pohon = renderPohon(InfoResi, props);
  harus(isian(pohon).props.value === "JX1234567890", "nilai awal isian harus dari props");
  isian(pohon).props.onChange({ target: { value: "JX9988776655" } });
  pohon = renderPohon(InfoResi, props);
  harus(isian(pohon).props.value === "JX9988776655", "isian harus mengikuti ketikan");
  form(pohon).props.onSubmit({ preventDefault() {
  } });
  harus(kendali.kunjungan.length === 1, `panggilan router harus 1, dapat ${kendali.kunjungan.length}`);
  const kunjungan = kendali.kunjungan[0];
  catatKunjungan("B1", kunjungan);
  harus(kunjungan.metode === "patch", `metode harus patch, dapat ${kunjungan.metode}`);
  harus(kunjungan.url === "/admin/pesanan/5/resi", `url salah: ${kunjungan.url}`);
  harus(
    kunjungan.data && kunjungan.data.tracking_number === "JX9988776655",
    `payload tracking_number salah: ${JSON.stringify(kunjungan.data)}`
  );
  harus(Object.keys(kunjungan.data).length === 1, "payload hanya boleh berisi tracking_number");
  harus(kunjungan.opsi?.preserveScroll === true, "preserveScroll harus true");
  harus(typeof kunjungan.opsi?.onStart === "function", "onStart hilang");
  harus(typeof kunjungan.opsi?.onFinish === "function", "onFinish hilang");
  harus(tombol(pohon).props.loading === false, "sebelum kirim tombol tidak boleh loading");
});
uji('B2 isian dikosongkan lalu dikirim -> tracking_number "" (hitung sebagai hapus, \xA712.18a)', () => {
  const props = { pesanan: pesanan() };
  let pohon = renderPohon(InfoResi, props);
  isian(pohon).props.onChange({ target: { value: "" } });
  pohon = renderPohon(InfoResi, props);
  form(pohon).props.onSubmit({ preventDefault() {
  } });
  harus(kendali.kunjungan.length === 1, `panggilan router harus 1, dapat ${kendali.kunjungan.length}`);
  const kunjungan = kendali.kunjungan[0];
  catatKunjungan("B2", kunjungan);
  harus(kunjungan.data.tracking_number === "", `payload harus string kosong, dapat ${JSON.stringify(kunjungan.data)}`);
  harus(kunjungan.url === "/admin/pesanan/5/resi", `url salah: ${kunjungan.url}`);
});
uji("B3 kiriman ganda ditahan selama proses, tombol loading, lalu bisa kirim lagi", () => {
  const props = { pesanan: pesanan() };
  let pohon = renderPohon(InfoResi, props);
  form(pohon).props.onSubmit({ preventDefault() {
  } });
  harus(kendali.kunjungan.length === 1, `kiriman pertama harus tercatat, dapat ${kendali.kunjungan.length}`);
  kendali.kunjungan[0].opsi.onStart();
  pohon = renderPohon(InfoResi, props);
  harus(tombol(pohon).props.loading === true, "tombol harus loading selama proses");
  harus(tombol(pohon).props.type === "submit", "tombol harus type submit");
  form(pohon).props.onSubmit({ preventDefault() {
  } });
  harus(kendali.kunjungan.length === 1, `kiriman kedua harus ditahan, dapat ${kendali.kunjungan.length}`);
  kendali.kunjungan[0].opsi.onFinish();
  pohon = renderPohon(InfoResi, props);
  harus(tombol(pohon).props.loading === false, "status loading harus bersih setelah selesai");
  form(pohon).props.onSubmit({ preventDefault() {
  } });
  harus(kendali.kunjungan.length === 2, `setelah selesai kiriman berikutnya jalan, dapat ${kendali.kunjungan.length}`);
  harus(
    kendali.kunjungan.every((k) => k.metode === "patch" && k.url === "/admin/pesanan/5/resi"),
    "semua kiriman harus ke rute resi yang sama"
  );
});
uji("B4 url memakai id pesanan dari props, tanpa rute karangan lain", () => {
  let pohon = renderPohon(InfoResi, { pesanan: pesanan({ id: 42, tracking_number: null }) });
  form(pohon).props.onSubmit({ preventDefault() {
  } });
  const kunjungan = kendali.kunjungan[0];
  catatKunjungan("B4", kunjungan);
  harus(kunjungan.url === "/admin/pesanan/42/resi", `url salah: ${kunjungan.url}`);
  harus(
    kendali.kunjungan.every((k) => /^\/admin\/pesanan\/42\/resi$/.test(k.url)),
    "ada panggilan ke url lain di luar kontrak"
  );
  harus(kunjungan.data.tracking_number === "", "nilai null harus dikirim sebagai string kosong");
});
uji("B5 galat server dibaca dari props halaman dan tidak mengunci form", () => {
  const pesan = "Nomor resi maksimal 60 karakter.";
  const props = { pesanan: pesanan() };
  let pohon = renderPohon(InfoResi, props);
  harus(isian(pohon).props.error === null, "galat tidak boleh muncul sebelum ada kiriman");
  kendali.halaman.props = { errors: { tracking_number: pesan } };
  form(pohon).props.onSubmit({ preventDefault() {
  } });
  kendali.kunjungan[0].opsi.onFinish();
  pohon = renderPohon(InfoResi, props);
  harus(isian(pohon).props.error === pesan, `galat server harus menempel di isian, dapat ${String(isian(pohon).props.error)}`);
  harus(isian(pohon).props.value === "JX1234567890", "nilai isian tetap dari nilai tersimpan server");
  harus(tombol(pohon).props.loading === false, "galat tidak boleh meninggalkan status loading");
  form(pohon).props.onSubmit({ preventDefault() {
  } });
  harus(kendali.kunjungan.length === 2, "setelah galat form harus tetap bisa dikirim ulang");
});
uji("B6 props server berubah -> isian mengikuti nilai tersimpan terbaru", () => {
  let pohon = renderPohon(InfoResi, { pesanan: pesanan({ tracking_number: "JX-A" }) });
  harus(isian(pohon).props.value === "JX-A", "nilai awal salah");
  isian(pohon).props.onChange({ target: { value: "JX-B-ketik" } });
  pohon = renderPohon(InfoResi, { pesanan: pesanan({ tracking_number: "JX-A" }) });
  harus(isian(pohon).props.value === "JX-B-ketik", "ketikan tidak boleh hilang tanpa jawaban server");
  pohon = renderPohon(InfoResi, { pesanan: pesanan({ tracking_number: "JX-C-tersimpan" }) });
  harus(isian(pohon).props.value === "JX-C-tersimpan", "isian harus mengikuti nilai tersimpan terbaru");
  pohon = renderPohon(InfoResi, { pesanan: pesanan({ id: 6, tracking_number: null }) });
  harus(isian(pohon).props.value === "", "pindah pesanan harus mengosongkan isian");
});
uji("B7 kontrol isian sesuai kontrak: name, maxLength, dan tanpa nilai tersembunyi", () => {
  const pohon = renderPohon(InfoResi, { pesanan: pesanan() });
  const kontrol = isian(pohon).props;
  harus(kontrol.name === "tracking_number", `name salah: ${kontrol.name}`);
  harus(kontrol.maxLength === 60, `maxLength salah: ${kontrol.maxLength}`);
  harus(kontrol.type === "text", `type salah: ${kontrol.type}`);
  harus(kontrol.id === "resi-pesanan", `id salah: ${kontrol.id}`);
  harus(kontrol.value === "JX1234567890", "isian harus terkendali dari state");
  harus(typeof kontrol.onChange === "function", "onChange hilang");
  harus(!("defaultValue" in kontrol), "isian tidak boleh tak-terkendali (defaultValue)");
});
var lebar = Math.max(...hasil.map((h2) => h2.nama.length));
hasil.forEach((h2) => console.log(`${h2.status.padEnd(5)} | ${h2.nama.padEnd(lebar)} | ${h2.catatan}`));
var gagal = hasil.filter((h2) => h2.status === "GAGAL").length;
console.log(`
RINGKASAN: ${hasil.length - gagal}/${hasil.length} uji lulus`);
process.exitCode = gagal === 0 ? 0 : 1;
