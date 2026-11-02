# Desain v1.6 — ceklis ekspedisi, stok per varian, tab status pesanan

Kartu `t_e191f163` (UI/UX) · 2 Nov 2026 · mengikat frontend `t_0fb421af` dan QA `t_2aea6b13`.
Sumber: kartu `t_e191f163`, `docs/kontrak-props.md` §7.0/§7.5/§7.12/§8.3/§13,
`docs/PRD-v1.4.md`, `docs/design.md` §2/§4, `docs/design-v1.5.md` §2–§3.
**Tidak ada token, warna, ukuran font, ikon, dependency, atau komponen baru.** Semua kelas di bawah
memakai token yang sudah ada di `tailwind.config.js`.

## 0. Aturan bersama

- Teks angka: `rupiah()`, `formatNumber()`; kelas angka `tabular-nums`.
- Status stok memakai teks eksplisit — warna hanya penegas, bukan satu-satunya pembawa makna.
- Nama/label layanan, `etd`, `cost`, `stock`, `status_label` berasal dari server. Frontend tidak
  mengarang layanan, tarif, atau stok cadangan.
- Teks bertanda `[CONTOH]` adalah contoh bentuk kalimat karena data toko belum pasti (nama kurir,
  angka stok, jumlah pesanan); angka/nama asli selalu diisi dari props server. Teks tanpa label
  adalah copy beku — dipakai apa adanya.
- Dua bagian v1.5 **digantikan** oleh dokumen ini dan tidak boleh dipertahankan bersamaan:
  - §1 v1.5 (dropdown `Select` ekspedisi) → §1 di sini (ceklis kartu radio).
  - §4 v1.5 (`Select` filter status) → §3 di sini (tab filter).
  Alasan: pemilik meminta kontrol yang memperlihatkan semua pilihan sekaligus (harga/ETD dan jumlah
  pesanan per status), bukan kontrol yang menyembunyikannya di balik dropdown. §2–§3 v1.5 (ikon dan
  timeline selesai) tetap berlaku.

---

## 1. Ceklis ekspedisi — `Public/Checkout.jsx`, keadaan S2

Menggantikan `Field` + `Select` v1.5 §1. Satu `fieldset` berisi **semua layanan aktif** dari
`semua[]` pada respons cek ongkir §7.12 (bentuk yang sama dengan `opsi[]` + `alasan`); sebelum cek
ongkir, pakai `ringkasan.ekspedisi` dari props awal (`tersedia`/`cost`/`etd` `null`). **Jangan**
memakai `opsi[]` sebagai daftar — `opsi[]` hanya layanan yang punya tarif. `opsi[]` tetap dipakai
untuk lookup saat submit (`cariOpsi`).

### 1.1 Struktur

```jsx
<fieldset className="mt-4" aria-labelledby="judul-pengiriman">
  <legend className="sr-only">Pilih layanan pengiriman</legend>
  {/* per courier_name, urutan server */}
  <div className="flex flex-col gap-4">
    <div>
      <p className="mb-2 text-label text-slate-600">JNE</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className={cn('relative flex min-h-[84px] cursor-pointer items-start gap-3 rounded-md border-2 bg-white p-3.5 transition-colors',
          aktif ? 'border-brand bg-brand-100/40' : 'border-line hover:border-brand',
          !tersedia && 'cursor-not-allowed border-line bg-surface hover:border-line')}>
          <input type="radio" name="shipping_service" value="jne|reg" checked={aktif}
                 disabled={!tersedia} onChange={() => pilihOpsi(o)}
                 className="peer sr-only" />
          <span aria-hidden="true" className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
            aktif ? 'border-brand bg-brand' : 'border-slate-400 bg-white')}>
            {aktif && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body font-semibold text-ink">{o.service_name || o.service_code}</span>
            <span className="mt-0.5 block text-meta text-slate-600">{o.etd || 'Estimasi belum tersedia'}</span>
            {!tersedia && <span className="mt-1 block text-meta text-slate-600">{alasan}</span>}
          </span>
          <span className="shrink-0 text-right">
            {o.gratis ? (
              <>
                <span className="block text-label font-semibold text-success-strong">GRATIS</span>
                <span className="block text-meta text-slate-600 line-through tabular-nums">{rupiah(o.cost)}</span>
              </>
            ) : (
              <span className={cn('block text-body font-semibold tabular-nums', tersedia ? 'text-ink' : 'text-slate-500')}>
                {tersedia ? rupiah(o.cost) : '—'}
              </span>
            )}
          </span>
        </label>
      </div>
    </div>
  </div>
  <p className="mt-3 text-meta text-slate-500">{helperGratis}</p>
</fieldset>
```

- `nama grup` = `courier_name`, fallback `courier_code`. Urutan grup dan isi = urutan `semua[]`
  (server mengurut `courier_name`, lalu `service_name`); klien tidak menyortir.
- `aktif` = `pilihan.courier_code === o.courier_code && pilihan.service_code === o.service_code`.
- `tersedia` = `o.tersedia === true` (contract: `true` hanya bila punya tarif). `tersedia: null`
  (sebelum kode pos) → `false` untuk kontrol, tetapi **bukan** alasan "tidak tersedia".
- `alasan` = `o.alasan` dari server; fallback `'Tidak tersedia di area anda.'` untuk baris
  `tersedia === false` tanpa alasan.
- Harga gratis: `GRATIS` + harga asli dicoret. Jangan render `Rp0`.
- Kartu terpilih memakai latar `bg-brand-100/40`; teks di atasnya tetap `text-slate-600` (bukan
  `slate-500` — gagal kontras di latar tint, `design.md` §2.1).
- Radio native + `peer sr-only`; cincin fokus pada **label**:
  `peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2`.
- Tidak ada auto-pilih. Setelah kode pos berubah, pilihan direset (`pilihan = null`) dan semua kartu
  unchecked — pembeli memilih sadar, bukan mewarisi tarif alamat lama.

### 1.2 State interaksi kartu

| State | Visual | Perilaku |
|---|---|---|
| default | `border-line bg-white`; radio `border-slate-400 bg-white`; teks `ink`/`slate-600` | klik di mana pun pada kartu memilih |
| hover | `border-brand` (tetap `bg-white`) | hanya `hover:`; tidak mengubah radio |
| focus-visible | label `ring-2 ring-brand ring-offset-2` | radio difokus keyboard, bukan klik mouse |
| selected | `border-brand bg-brand-100/40`; radio `border-brand bg-brand` + titik putih 6 px | `aria-checked` native; hanya satu per grup |
| disabled-unavailable | `border-line bg-surface cursor-not-allowed`; harga `—` `text-slate-500`; alasan `text-slate-600`; radio `border-slate-400` | `input disabled`, tidak masuk urutan Tab, tidak bisa diklik; nama + alasan tetap dibaca screen reader |
| error validasi | kartu **tidak** diwarnai merah; teks error di bawah daftar + `InlineNotice` bila galat server | `aria-invalid="true"` pada radio yang bisa dipilih, fokus ke kartu pertama |

Error validasi muncul bila submit ditolak karena layanan hilang/berubah:
`<p id="galat-ekspedisi" role="alert" className="mt-2 text-meta text-danger-strong">Pilih layanan pengiriman dulu.</p>`
— teks server (`errors.shipping_service`, `errors.shipping_courier`, `errors.shipping_cost`) dipakai apa
adanya bila ada. Fieldset mendapat `aria-describedby="galat-ekspedisi"`. Jangan menandai kartu
`disabled` sebagai error; hanya kartu yang masih bisa dipilih.

### 1.3 Keadaan tarif

| `statusTarif` | Tampilan |
|---|---|
| `menunggu` | Daftar dari `ringkasan.ekspedisi` tampil `disabled`, harga `—`; copy existing "Tarif muncul otomatis setelah alamat dan kode pos terisi." |
| `memuat` | 4 skeleton kartu `h-[84px] animate-pulse rounded-md bg-slate-200` + `role="status"` sr-only "Memuat tarif pengiriman…"; tanpa kartu interaktif |
| `siap` | Ceklis penuh dari `semua[]`; layanan tersedia aktif, sisanya `disabled` + alasan |
| `kosong` | `InlineNotice tone="warning"` "Tidak ada layanan untuk kode pos ini." + tautan `Hubungi penjual`; daftar tetap tampil semua `disabled` dengan alasan dari `semua[].alasan` |
| `galat` / `timeout` | `InlineNotice` + `Coba lagi` existing; daftar dari `semua[]` (fallback `ringkasan.ekspedisi`) tetap tampil semua `disabled` + alasan server / "Tarif belum tersedia." — tidak ada tarif lama yang ditampilkan |
| `galatKonfig` | `InlineNotice` existing; daftar tidak dirender |
| mode uji (`modeFake`) | Ceklis sama; badge `Tarif uji` tetap di `OrderSummary`; submit tanpa pilihan tetap boleh (perilaku existing) |

Alasan per kartu (`alasan`):

| Kondisi | Teks |
|---|---|
| quote sukses, layanan tidak dikembalikan | `Tidak tersedia di area anda` |
| quote mengirim `tersedia: false` dan `alasan` | pakai `o.alasan` dari server |
| `statusTarif = menunggu` | tidak ada baris alasan; cukup harga `—` |
| `statusTarif = kosong` | `Tidak tersedia di area anda` |

### 1.4 Perilaku & microcopy

- `pilihOpsi(o)` existing: isi `shipping_courier`, `shipping_service`, `shipping_cost`
  (`gratis === true` → `0`), hitung ulang total, tampilkan `helperGratis` existing. `o` berasal dari
  baris `semua[]` yang `tersedia`.
- State baru `const [semua, setSemua] = useState([])`:
  - sukses cek ongkir → `setSemua(Array.isArray(data.semua) ? data.semua : [])`;
  - cache per kode pos menyimpan `{ opsi, semua, gratis }`;
  - kode pos berubah / kosong / `galatKonfig` → `setSemua([])` dan `setPilihan(null)`;
  - daftar render = `semua.length > 0 ? semua : (ringkasan?.ekspedisi ?? [])`.
  `opsi` **tidak** dipakai untuk daftar; hanya `cariOpsi()` saat submit.
- Submit tanpa pilihan (mode api): pertahankan `alasanTolak` "Pilih layanan pengiriman dulu." di bawah
  CTA; saat submit ditolak, `gulirKe('judul-pengiriman', { fokus: false })` lalu fokus radio pertama
  yang `tersedia` (`#pilih-layanan-jne-reg` atau `ref` daftar). Jika tidak ada yang tersedia, fokus
  `Coba lagi` / `Hubungi penjual`.
- `role="radiogroup"` tidak ditulis ulang: `fieldset` + `legend` + `input[type=radio]` sudah membawa
  semantik dan panah keyboard native. Satu `name` untuk semua kartu agar panah berpindah lintas grup.
- Live region: `aria-live="polite"` pada ringkasan pilihan di `OrderSummary` (sudah ada) sudah
  mengumumkan harga; tidak perlu pengumuman ganda di sini.

### 1.5 360 px

- Grid 1 kolom < 640 px; kartu penuh ≈ 328 px. Baris atas: radio 16 px + nama layanan (`truncate`) +
  harga; baris kedua: ETD; baris ketiga (bila ada): alasan. Tinggi minimum 84 px mencegah kartu
  "melompat" saat harga/alasan muncul.
- Nama layanan ekstrem dipotong `truncate`; nama lengkap tetap terbaca screen reader karena
  `truncate` hanya visual. Jangan menambah tooltip.
- Tidak ada scroll horizontal di dalam kartu.

---

## 2. Stok per varian — `Public/Products/Show.jsx`

### 2.1 Aturan pemilihan (tidak mengubah perilaku existing)

Chip tetap `VariantChip` (ukuran) dan `ColorSwatch` (warna). **Jangan** mengubah aturan
`ukuranAdaStok`/`warnaAdaStok`/`kombinasiAda` di `Show.jsx` (blok ketersediaan per nilai): logika itu sudah
memperbaiki bug "ukuran & warna tak bisa dipilih" yang dilaporkan pemilik. Stok per kombinasi
ditampilkan lewat §2.3, bukan dengan mengunci chip.

- Chip ukuran `disabled` bila tidak ada varian aktif berstok dengan `size` itu (warna apa pun).
- Swatch warna `disabled` bila tidak ada varian aktif berstok dengan `color` itu (ukuran apa pun).
- Bila nilai yang dipilih tidak punya kombinasi dengan facet lain, perilaku existing
  `pilihUkuran`/`pilihWarna` melepas facet lain (`setColor(null)` / `setSize(null)`). Pertahankan;
  jangan biarkan pasangan mustahil terpilih dan jangan menghapus efek ini.
- Auto-pilih existing: satu nilai bila facet itu tepat satu nilai tersedia. Tambahkan satu penjaga:
  bila size dan color sama-sama auto-pilih tetapi `kombinasiAda(size, color)` false, jangan pilih
  keduanya (biarkan `null`) — mencegah pasangan mustahil terpilih otomatis.
- `selectedVariant` tetap dicari dari pasangan `size` + `color`; jika `null` → `needsVariant`.
- Saat varian berganti, `qty` dijepit: `setQty(q => Math.min(q, maxQty))` (jangan biarkan qty lama
  melebihi stok varian baru).
- Produk tanpa varian: tidak ada chip dan tidak ada tabel; perilaku stok/CTA existing.

Microcopy `[CONTOH]` untuk pembaca layar dan baris status lengkap (isi angka dari `stock` server):

| Keadaan | Teks |
|---|---|
| varian terpilih, stok > 0 | `L warna merah masih ada stok (12).` |
| varian terpilih, stok 1–5 | `L warna merah masih ada stok, sisa 3.` |
| varian terpilih, stok 0 | `L warna hijau habis stok.` |
| ukuran tanpa warna | `XL masih ada stok (4).` |
| belum lengkap | `Pilih ukuran dan warna untuk melihat stok.` |
| semua habis | `Semua varian habis stok.` |

Teks di atas dipakai pada `role="status"` (varian terpilih) dan `teksLengkap` tiap baris tabel; label
visual tabel tetap ringkas (`L · Hijau` + `Habis`) agar 12 baris tidak menjadi paragraf.

### 2.2 Baris status stok terpilih

Tepat di bawah grup warna (atau ukuran bila tanpa warna), satu `<p role="status" aria-live="polite">`:

| Kondisi | Teks | Kelas |
|---|---|---|
| belum lengkap | `Pilih ukuran dan warna untuk melihat stok.` | `text-meta text-slate-600` |
| varian stok > 5 | `Stok: tersedia (12)` | `text-meta text-success-strong` |
| varian stok 1–5 | `Stok: sisa 3` | `text-meta text-warning-strong` |
| varian stok 0 | `Stok habis` | `text-meta text-danger-strong` |
| tanpa varian | `Stok: tersedia (24)` / `Stok habis` | existing |

Angka memakai `formatNumber`; `stock` `null`/tidak ada → `Stok: tersedia` tanpa angka.

### 2.3 Tabel ketersediaan semua varian

Dirender bila `variants.length > 1` (produk multi-varian), **selalu terlihat** — bukan accordion,
bukan scroll internal. Ditempatkan setelah baris status, sebelum blok harga grosir.

```jsx
<div className="mt-4 rounded-md border border-line bg-surface p-3">
  <p className="text-label text-slate-600">Ketersediaan stok</p>
  <ul className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
    {variants.map((v) => (
      <li key={v.id} className="flex items-baseline justify-between gap-2 text-meta">
        <span className="min-w-0 truncate text-slate-600">
          {[v.size, v.color].filter(Boolean).join(' · ')}
          <span className="sr-only">{teksLengkap(v)}</span>
        </span>
        <span className={cn('shrink-0 font-semibold tabular-nums', kelasStok(v.stock))}>{labelStok(v.stock)}</span>
      </li>
    ))}
  </ul>
</div>
```

- Urutan = urutan `variants` dari server (ukuran baku → warna → id); jangan menyortir ulang.
- Label baris: `Ukuran · Warna`; bila salah satu kosong, tampilkan yang ada. Jangan render pemisah
  menggantung (` · `).
- `labelStok`: >5 → `Tersedia (12)`; 1–5 → `Sisa 3`; 0 → `Habis`; `null` → `Tersedia`.
- `kelasStok`: `success-strong` / `warning-strong` / `danger-strong` / `slate-600`.
- `teksLengkap(v)` untuk screen reader: `Ukuran L warna hijau, stok 3.` atau `... stok habis.` —
  karena label visual dipotong `truncate`.
- Semua kombinasi dirender; untuk katalog saat ini jumlahnya kecil. Bila kelak > 20 varian,
  tambahkan `<details>` — **bukan** sekarang, agar tidak ada state tersembunyi yang tidak diminta.
- Baris tabel **tidak** ikut menyorot varian terpilih (menghindari dua sumber fokus). Sorotan tetap
  di chip.

### 2.4 CTA & keadaan habis

- `disabled` CTA existing (`needsVariant || soldOut || submitting`); tambahkan alasan terlihat:
  - `needsVariant` → `Pilih ukuran dan warna yang tersedia dulu.` (`text-warning-strong`, existing);
  - varian terpilih stok 0 → tombol berubah `Stok Habis` + tombol sekunder `Hubungi Kami`, sama
    seperti keadaan `soldOut` existing;
  - varian terpilih stok 1–5 → tidak ada badge tambahan; cukup baris status `Sisa n`.
- `QtyStepper` `max = maxQty` (stok varian), `disabled` saat habis.
- Chip `disabled` memakai gaya existing `VariantChip`/`ColorSwatch`; jangan menurunkan opasitas
  seluruh grup (kontras label turun). Alasan ketidaktersediaan dibaca dari tabel + status.

### 2.5 360 px

- Grup chip sudah `flex-wrap`; tidak ada perubahan.
- Tabel 1 kolom < 640 px, 2 kolom ≥ 640 px. Label kiri `truncate`, status kanan `shrink-0`; tidak ada
  scroll horizontal. Tinggi baris ≈ 22 px; 12 varian ≈ 264 px — wajar di PDP.
- Baris status dan tabel memakai `text-meta` (≥ 13 px) dan kontras ≥ 4,5:1 di `surface`
  (`slate-600` 7,00:1; `success-strong` 6,59:1; `warning-strong` 6,55:1; `danger-strong` 7,68:1).

---

## 3. Tab filter status — `Public/History.jsx`

Menggantikan `Field` + `Select` v1.5 §4. Tab berada tepat setelah `<header>` (judul "Riwayat
Pesanan"), sebelum notice galat. Sumber kebenaran tetap URL `?status=`; tidak ada state filter lokal.

### 3.1 Daftar tab

```jsx
const TAB_STATUS = [
  { nilai: 'semua', label: 'Semua' },
  ...URUTAN_STATUS.map((s) => ({ nilai: s, label: LABEL_FILTER[s] })),
];
```

Urutan: `Semua, Pending, Dibayar, Diproses, Dikirim, Selesai, Batal`. Hitungan selalu dari
`ringkasan` global (bukan hasil filter): `ringkasan.total` untuk Semua, `ringkasan[status]` untuk
lainnya; `0` tetap tampil.

```jsx
<div className="-mx-4 mt-5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
  <div role="tablist" aria-label="Filter status pesanan" className="flex min-w-max gap-1 border-b border-line">
    {TAB_STATUS.map((t, i) => {
      const aktif = nilaiAktif === t.nilai;
      const jumlah = t.nilai === 'semua' ? ringkasan?.total : ringkasan?.[t.nilai];
      return (
        <button key={t.nilai} type="button" role="tab" id={`tab-status-${t.nilai}`}
          aria-selected={aktif} aria-controls="panel-pesanan" tabIndex={aktif ? 0 : -1}
          ref={(el) => (tabRefs.current[i] = el)}
          onClick={() => ubahFilter(t.nilai)}
          onKeyDown={(e) => pindahTab(e, i)}
          className={cn('flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-label transition-colors',
            aktif ? 'border-brand text-brand' : 'border-transparent text-slate-600 hover:text-ink')}>
          {t.label}
          <span className="text-meta font-normal tabular-nums">({formatNumber(jumlah ?? 0)})</span>
        </button>
      );
    })}
  </div>
</div>
```

- `nilaiAktif = filter?.status ?? 'semua'`. `filter` absen atau `ringkasan.total === 0` → **seluruh
  tab tidak dirender** (keadaan kosong total existing dipertahankan).
- Tab tidak `disabled` saat memuat. Inertia membatalkan visit lama; fokus tidak hilang.
- `role="tabpanel"` membungkus notice galat + daftar pesanan + pagination:
  `<div id="panel-pesanan" role="tabpanel" aria-labelledby={`tab-status-${nilaiAktif}`} tabIndex={0} aria-busy={memuat}>`.
  Semua tab menunjuk panel yang sama karena ini filter server, bukan panel konten berbeda.
- Indikator aktif: border bawah 2 px `brand` + teks `brand`; nonaktif `slate-600`. Jangan memakai pil
  latar penuh — terlalu berat untuk 7 tab dan menggeser tinggi baris.

### 3.2 Aksi & keyboard

- `ubahFilter(nilai)` existing dipertahankan: `router.get('/history', nilai === 'semua' ? {} : { status: nilai },
  { preserveState: true, preserveScroll: true, onStart/onFinish → memuat })`; selalu halaman 1.
- Pagination `muat(halaman)` tetap mengirim `status` aktif.
- Keyboard (manual activation, sesuai pola tab WAI-ARIA):
  - `ArrowRight`/`ArrowLeft`: pindah fokus ke tab berikutnya/sebelumnya, melingkar; `Home`/`End` ke
    tab pertama/terakhir. Fokus saja — belum mengubah filter.
  - `Enter`/`Space`: aktifkan tab yang difokus (native `button`).
  - `tabIndex` roving: hanya tab aktif yang `0`; setelah panah, pindahkan fokus programatik.
  - Fokus dipertahankan setelah respons Inertia karena `key` tab stabil; jangan memindahkan fokus ke
    panel.
- Back/forward browser dan refresh memulihkan tab dari `filter.status`; tidak ada `useState` untuk
  filter.

### 3.3 Hasil, memuat, kosong

- Ganti `teksHasil` yang terlihat dengan live region sr-only agar tidak menduplikasi angka di tab:
  `<p className="sr-only" role="status" aria-live="polite">{teksHasil}</p>`.
  `teksHasil`: `Menampilkan 3 pesanan berstatus Dikirim.` / `Menampilkan semua 12 pesanan.` /
  `Tidak ada pesanan berstatus Dikirim.`
- `memuat`: panel `aria-busy="true"`, 3 skeleton kartu existing; tab tetap terlihat dan bisa diklik.
- Kosong karena filter: `EmptyState` di dalam panel,
  `title={`Tidak ada pesanan berstatus ${LABEL_FILTER[status]}.`}`
  `description="Coba status lain, atau tampilkan semua pesanan."`
  `actionLabel="Tampilkan semua pesanan"` → `ubahFilter('semua')`.
  Untuk tab `Semua`, pakai copy total existing `Belum ada pesanan.` + `Mulai belanja`.
- Galat: `InlineNotice` + `Coba lagi` existing, tetap di dalam panel; tab aktif tidak berubah.
- Pagination tetap di bawah panel dan tidak ikut ter-reset saat tab diklik selain ke halaman 1.

### 3.4 360 px

- Tujuh tab ≈ 600–650 px → scroll horizontal satu baris, tinggi 44 px. `-mx-4 px-4` membuat tab bisa
  digeser sampai tepi layar; `scroll-px-4` agar tab pertama tidak menempel saat digeser.
- Tidak ada wrap, tidak ada ellipsis, tidak ada dropdown "lainnya". Tab yang terpotong di tepi sudah
  menjadi affordance scroll; jangan menambah tombol panah.
- Hitungan `(12)` ikut tab; jangan memisahkan angka ke baris kedua.
- Target sentuh 44 px (`h-11`), sesuai minimum.

---

## 4. Ringkasan biaya — `Components/OrderSummary.jsx`

Dipakai checkout dan halaman selesai. Tambah props opsional (aditif, nilai lama tetap sah):
`discount = null`, `shippingOriginal = null`, `shippingCovered = null`.

| Baris | Tampilan |
|---|---|
| Subtotal | `rupiah(subtotal)` |
| Diskon | hanya bila `discount > 0`: `−Rp10.000`, `text-success-strong`; label `Diskon` |
| Ongkir — belum dihitung | `Dihitung saat checkout` (`text-meta text-slate-600`), bukan `—` |
| Ongkir — berbayar | `rupiah(shipping)` |
| Ongkir — gratis | `GRATIS` (`text-success-strong`) + harga asli `line-through text-slate-600` + baris kecil `Ditanggung toko: Rp18.000` (`text-meta text-success-strong`) |
| Total | `rupiah(total)`, `text-h3` existing |

- Total = `subtotal − diskon + ongkir`; saat belum memilih layanan, pakai `ringkasan.total` server.
- `shippingCovered` = `max(0, shippingOriginal − shipping)`; jangan menampilkan baris bila 0.
- Tanda minus diskon memakai `−` (U+2212), bukan hyphen.
- Angka `tabular-nums`; `aria-live="polite"` hanya pada nilai ongkir dan total (existing).
- Untuk pembaca layar, bungkus tampilan gratis dengan `aria-hidden="true"` dan sediakan satu
  `sr-only`: `Ongkir Rp18.000 ditanggung toko.` — agar coretan + GRATIS + baris tanggungan tidak
  dibaca sebagai tiga angka terpisah.
- Kartu tetap `card p-6`; di 360 px label dan nilai muat satu baris (`Ditanggung toko:` ≈ 100 px).

---

## 5. Matriks keadaan

| Keadaan | §1 ekspedisi | §2 stok varian | §3 tab status | §4 ringkasan |
|---|---|---|---|---|
| normal | ceklis, satu terpilih | chip + status + tabel | tab aktif + hitungan | subtotal/ongkir/total |
| memuat | 4 skeleton | n/a (satu render) | skeleton daftar, tab aktif | ongkir `Dihitung saat checkout` |
| kosong | notice + semua kartu disabled | tabel semua `Habis`, CTA mati | `EmptyState` per tab | total = subtotal |
| galat | notice + `Coba lagi`, daftar `disabled` | n/a | notice + `Coba lagi` | tetap nilai terakhir |
| props null | `semua[]` & `ringkasan.ekspedisi` absen → tidak ada ceklis | `variants` `[]` → tanpa chip/tabel | `filter` absen → tanpa tab | `shipping` null → `Dihitung saat checkout` |
| 360 px | 1 kolom kartu | tabel 1 kolom | tab scroll horizontal | label/nilai satu baris |

## 6. Aksesibilitas & verifikasi

- Kontras: `slate-600` di `surface` 7,00:1, di `brand-100` 6,26:1; `success-strong` 6,59:1;
  `warning-strong` 6,55:1; `danger-strong` 7,68:1 (di atas `surface`; di `brand-100` berturut-turut
  5,89:1 / 5,85:1 / 6,86:1) — semua ≥ 4,5:1. `slate-500` hanya
  untuk teks di atas putih (harga coret di kartu putih, helper di kartu putih).
- Target sentuh: kartu ekspedisi ≥ 84 px; tab `h-11` 44 px; chip existing ≥ 44 px.
- Fokus: radio kartu lewat `peer-focus-visible` pada label; tab lewat `:focus-visible` global
  (`outline-none ring-2 ring-brand ring-offset-2`). Jangan `outline-none` tanpa pengganti.
- Status stok tidak mengandalkan warna: teks `Habis`/`Sisa`/`Tersedia` selalu ada.
- Tab: `role=tablist/tab/tabpanel`, `aria-selected`, `aria-controls`, roving `tabIndex`, panah +
  Home/End; Enter/Space aktivasi. Panel `tabIndex=0` agar bisa dibaca keyboard.
- Radio: `fieldset`/`legend`, satu `name`, `disabled` untuk yang tidak tersedia; alasan tertulis.
- Verifikasi wajib sebelum tutup kartu frontend: `npm run build`; cek 360 px (DevTools) untuk ceklis,
  tabel varian, dan tab; cek keyboard tab (panah, Home/End, Enter) dan radio (panah, Space); cek
  `aria-busy` saat memuat.

## 7. Handoff

- **Frontend `t_0fb421af`:** ikuti §1–§4; jangan mengubah backend. Kontrak `ringkasan` §7.5 dan
  `opsi` §7.12 (tambahan `ekspedisi`, `semua[]`, `tersedia`/`alasan`) masih **DRAFT** di
  `docs/kontrak-props.md` (kartu backend `t_36a48cac`) — cek dulu key-nya benar-benar ada di props
  sebelum merender ceklis. Bila `semua[]`/`ringkasan.ekspedisi` belum mendarat: **jangan** menyusun
  daftar dari `opsi[]` (itu hanya layanan bertarif, ceklis jadi bohong) dan jangan mengarang
  layanan/tarif — pertahankan dropdown existing sampai backend mengirim key barunya.
- **Backend `t_36a48cac`:** pertahankan `ringkasan.ekspedisi` (props awal) dan `semua[]` (respons cek
  ongkir) memuat **semua** layanan aktif walau `tersedia: null`/`false`; `opsi[]` hanya layanan yang
  punya tarif; `ringkasan.diskon` = 0 dan `ongkir_ditanggung_toko` dihitung dari
  `ongkir_asli − ongkir`.
- **QA `t_2aea6b13`:** uji kasus (a) kode pos dengan satu layanan tidak tersedia → kartu tampil
  disabled + alasan, bukan hilang; (b) gratis ongkir → harga asli tercoret + `Ditanggung toko`;
  (c) kombinasi ukuran×warna tanpa stok tidak bisa dipilih dan CTA tetap mati; (d) tab Batal kosong →
  `EmptyState` + reset; (e) keyboard tab dan radio.
- Catatan: `docs/design-v1.5.md` §1 dan §4 kini **superseded** oleh dokumen ini; §2–§3 tetap.
