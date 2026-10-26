# Desain v1.5 — dropdown ekspedisi, ikon timeline, timeline selesai, filter riwayat

Kartu `t_b8fbee66` (UI/UX) · 26 Okt 2026 · mengikat F1 `t_6831e8b1` (§1) dan F2 `t_85a16600`
(§2–§4), keduanya `frontenddeveloper`, plus B1 `t_6dcc1818` / B3 `t_8216e843`.
Sumber: `docs/brief-v1.5-uiux.md`, `docs/brief-v1.5-frontend.md` F1/F2, `docs/kontrak-props.md`
§7.9/§7.12/§13, `docs/PRD-v1.4.md` §4. Visual: `docs/design.md` §4, `docs/design-v1.2.md` §5.3
(S1–S6), `docs/design-v1.4.md` §1. Tidak ada token, warna, ikon, gambar, komponen UI, atau dependency
baru.

## 0. Aturan bersama

- Komponen: `Select`, `Field`, `Badge`, `EmptyState`, `InlineNotice`, `Pagination`, `TimelinePesanan`
  (§2); ikon `resources/js/Components/icons.jsx` apa adanya.
- Teks status dari server (`status_label`, `courier_name`, `service_name`, `etd`). Pengecualian tunggal:
  label opsi filter (§4, alasan §6.1).
- `rupiah()`, `formatNumber()`, `waktu()`/`formatDateTime()`, `cn()`. Urutan opsi = urutan server
  (`courier_name` lalu `service_name`, B1 §7.12): klien tidak menyortir, tidak mengarang opsi cadangan,
  tidak auto-pilih.

## 1. Dropdown ekspedisi — `Checkout.jsx:743–816` (keadaan S2)

Radio + kartu + badge per baris diganti **satu** `Field` + `Select` native ber-`optgroup`; tanpa sisa
`type="radio"`, kartu opsi, atau label rupiah per baris. `menunggu`, `SkeletonOpsi` (S1), `kosong`,
`galat`, `timeout`, `galatKonfig` tidak berubah.

```jsx
<Field label="Pilih layanan pengiriman" htmlFor="pilih-layanan" hint={`Tarif untuk kode pos ${kodePosOpsi ?? '-'}`}>
  <Select id="pilih-layanan" aria-describedby="pilih-layanan-hint" value={nilaiOpsi} onChange={(e) => pilihOpsi(cariOpsi(e.target.value))}>
    <option value="" disabled>Pilih layanan pengiriman</option>
    {grup.map(([kode, g]) => (
      <optgroup key={kode} label={g.courier_name}>
        {g.opsi.map((o) => <option key={`${o.courier_code}|${o.service_code}`} value={`${o.courier_code}|${o.service_code}`}>{teksOpsi(o)}</option>)}
      </optgroup>
    ))}
  </Select>
</Field>
```

- `nilaiOpsi` = `` pilihan ? `${pilihan.courier_code}|${pilihan.service_code}` : '' ``; pemisah `|`
  (kartu F1), bukan `:`. `cariOpsi` memecah nilai lalu mencocokkan `courier_code` **dan** `service_code`,
  bukan teks. `grup` = `opsi` dikelompokkan per `courier_code` (urutan kemunculan pertama) menjadi
  `{ courier_name, opsi }`; label grup `courier_name`, fallback `courier_code` bila kosong.
- `pilihOpsi(item)` existing apa adanya (`shipping_courier`/`shipping_service`/`shipping_cost`;
  `gratis === true` → 0).

**Teks opsi** satu baris; nama kurir tidak diulang (sudah label grup):

| Kondisi | `teksOpsi(o)` |
|---|---|
| umum | `` `${o.service_name} · ${o.etd || '—'} · ${rupiah(o.cost) ?? '-'}` `` |
| `o.gratis === true` | `` `${o.service_name} · ${o.etd || '—'} · GRATIS` `` |
| `service_name` kosong | pakai `service_code` di posisi pertama (jangan render ` ·  · `) |

Contoh `[CONTOH]`: `REG · 2-3 hari · Rp18.000`, `YES · 1-1 hari · GRATIS`.

**Ringkasan pilihan** di bawah kontrol, hanya bila `pilihan` ada (pengganti badge per baris):

```jsx
<div className="mt-3" role="status" aria-live="polite">
  <p className="text-body font-semibold text-ink">{`${pilihan.courier_name} ${pilihan.service_name} · ${pilihan.etd ?? '—'}`}</p>
  <p className="mt-1 flex flex-wrap items-center gap-2 text-body">
    <span className={cn('font-semibold tabular-nums', pilihan.gratis ? 'text-success-strong' : 'text-ink')}>{pilihan.gratis ? 'GRATIS' : rupiah(pilihan.cost)}</span>
    {pilihan.is_regular === true && <Badge tone="brand">Reguler</Badge>}
    {pilihan.gratis === true && <Badge tone="success">Gratis Ongkir</Badge>}
  </p>
  {gratisTerpenuhi && pilihan.is_regular !== true && (
    <p className="mt-1 text-meta text-slate-500">Layanan ini tidak termasuk gratis ongkir.</p>
  )}
</div>
```

Harga tetap **teks** (`GRATIS`/`Rp…`); badge hanya penegas. `Gratis ongkir reguler aktif.` dan
`Tambah Rp… lagi…` (`gratisAktif`/`sisaGratis`) tetap di blok yang sama; catatan per layanan yang
sebelumnya menempel di setiap kartu pindah ke ringkasan ini — hanya ada satu layanan terpilih.

| `statusTarif` | Tampilan |
|---|---|
| `menunggu` | copy "Isi kode pos…" existing — tanpa kontrol |
| `memuat` | `SkeletonOpsi` + `Memuat tarif…` — tanpa kontrol (pilihan lama sudah direset) |
| `siap` | `Field` + `Select` + ringkasan pilihan |
| `kosong` / `galat` / `timeout` / `galatKonfig` | copy + `Coba lagi` existing |
| mode uji (`modeFake`) | S2 sama; badge `Tarif uji` tetap di `OrderSummary`; submit boleh tanpa pilihan |

**360 px & aksesibilitas**

- `w-full`, tinggi `h-field` 44 px, label di atas, tanpa `max-w`. Isi 360 px ≈ 328 px; teks opsi wajar
  ≈ 34 karakter `text-body` — muat. Nama layanan ekstrem dipotong native (elipsis), tanpa tooltip:
  diterima, bukan bug.
- `htmlFor="pilih-layanan"` + label eksplisit; placeholder bukan satu-satunya label. Placeholder
  `disabled` → nilai kosong tidak bisa dipilih ulang; membatalkan pilihan = ubah kode pos (reset
  existing). Alasan tolak `Pilih layanan pengiriman dulu.` (`Checkout.jsx:496`) tetap.
- `role="status" aria-live="polite"` mengumumkan layanan + harga; keyboard native; cincin fokus `Select`
  existing. Submit ditolak karena belum memilih: `gulirKe('judul-pengiriman', { fokus: false })`
  (`Checkout.jsx:442`) tetap, lalu fokus `#pilih-layanan`.

## 2. Ikon per node — komponen bersama `TimelinePesanan`

`function Timeline` (`History.jsx:152–209`) dipindah apa adanya ke
`resources/js/Components/TimelinePesanan.jsx`, props tetap `{ status = null, paymentStatus = null,
timeline = null }`; `History.jsx` dan `CheckoutSuccess.jsx` mengimpor dari sana. Struktur `ol`/`li`,
label, waktu, aturan horizontal ≥768 / vertikal <768 tidak berubah — hanya titik 10 px diganti ikon
20 px.

| `node.key` | Label | Ikon | Sumber |
|---|---|---|---|
| `created` | Dibuat | `BoxIcon` | `icons.jsx:225` |
| `paid` | Dibayar | `WalletIcon` | `icons.jsx:264` |
| `shipped` | Dikirim | `TruckIcon` | `icons.jsx:83` |
| `completed` | Selesai | `CheckIcon` | `icons.jsx:77` |
| `batal` / `expire` | Batal / Kedaluwarsa | titik 10 px `bg-danger` | tidak berubah |

```jsx
const IKON = { created: BoxIcon, paid: WalletIcon, shipped: TruckIcon, completed: CheckIcon };
// ganti <span titik> existing:
{bahaya ? (
  <span aria-hidden="true" className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-danger md:mt-0" />
) : (
  <span aria-hidden="true" className={cn('-mt-0.5 shrink-0 md:mt-0', aktif ? 'text-brand' : 'text-slate-300')}>
    {React.createElement(IKON[node.key], { size: 20 })}
  </span>
)}
```

- 20 px, tanpa lingkaran latar, tanpa garis penghubung. Aktif `text-brand` (≥13:1 di putih); belum aktif
  `text-slate-300` — dekoratif (`aria-hidden`), makna dibawa label + waktu. Node bahaya tetap titik merah.
- Keadaan: `timeline` null → empat node redup; memuat/galat tetap milik daftar induk (skeleton kartu /
  `InlineNotice` existing) — timeline tidak punya state sendiri. `timeline` parsial (hanya `created_at`)
  → node lain redup, tanpa crash.
- 360 px: ikon sejajar baris pertama label (`-mt-0.5`); ≥768 px di atas label (`md:flex-col`,
  `md:gap-2` existing); tinggi baris naik ~10 px — diterima. Waktu kosong tetap `—`, urutan tetap.

## 3. Timeline di `/checkout/{order}/selesai`

`CheckoutSuccess.jsx`: kartu **"Status pesanan"** tepat sebelum `Ringkasan Pesanan` (baris 192),
setelah flash:

```jsx
{pesanan?.timeline && (
  <section className="card mt-6 p-6" aria-labelledby="judul-status-pesanan">
    <h2 id="judul-status-pesanan" className="text-h3 text-ink">Status pesanan</h2>
    <TimelinePesanan timeline={pesanan.timeline} />
  </section>
)}
```

Urutan final: hero (kode + status bayar) → flash → **Status pesanan** → `Ringkasan Pesanan` (item →
biaya → `Dikirim ke` → `Status pengiriman` + riwayat event) → penilaian → tombol. Pertanyaan pertama
setelah membayar adalah "pesanan saya di mana"; ringkasan uang + barang tetap satu kartu; blok
`Status pengiriman` (design-v1.3 §4) tidak dipindah dan tidak diduplikasi.

- Props hanya `timeline`; tanpa `status`/`paymentStatus` → tanpa node terminal (halaman hanya untuk
  pesanan yang sudah dibayar).
- `pesanan.timeline` null/undefined (mis. sebelum B3) → kartu **tidak dirender**, tanpa fallback dari
  `pesanan.created_at`/`paid_at` (satu sumber, kontrak §7.9). Ini satu-satunya keadaan kosong halaman
  ini; tidak ada request tambahan — galat muat pesanan ditangani alur existing.
- Keadaan: setelah bayar = Dibuat + Dibayar aktif, Dikirim + Selesai redup; `dikirim` = tiga aktif;
  `selesai` = empat aktif; keempat waktu null = empat node redup, tanpa crash.
- 360 px: vertikal, ikon 20 px + label, tanpa gulir horizontal; judul `text-h3` sama dengan
  `Ringkasan Pesanan`.

## 4. Filter status — `/history`

`History.jsx`, tepat setelah `</header>` (baris 515), sebelum notice galat:

```jsx
<div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
  <Field label="Status pesanan" htmlFor="filter-status" className="w-full sm:max-w-[260px]">
    <Select id="filter-status" value={filter?.status ?? 'semua'} onChange={(e) => ubahFilter(e.target.value)}>
      <option value="semua">{`Semua status (${formatNumber(ringkasan?.total ?? 0)})`}</option>
      {URUTAN_STATUS.map((s) => <option key={s} value={s}>{`${LABEL_FILTER[s]} (${formatNumber(ringkasan?.[s] ?? 0)})`}</option>)}
    </Select>
  </Field>
  <p className="text-meta text-slate-500" role="status" aria-live="polite">{teksHasil}</p>
</div>
```

- `URUTAN_STATUS = ['pending', 'dibayar', 'diproses', 'dikirim', 'selesai', 'batal']`;
  `LABEL_FILTER` = `Pending, Dibayar, Diproses, Dikirim, Selesai, Batal` (§6.1). Semua opsi selalu
  tampil walau 0 — angka dari `ringkasan` (seluruh pesanan, tidak ikut filter) sehingga opsi tidak
  berpindah/hilang.
- Nilai awal **selalu** `filter.status` (`null` → `semua`); tanpa state lokal — URL sumber kebenaran.
- `ubahFilter(nilai)`: `router.get('/history', nilai === 'semua' ? {} : { status: nilai }, {
  preserveState: true, preserveScroll: true, onStart: () => setMemuat(true), onFinish: () => setMemuat(false) })`
  → selalu halaman 1. Pagination: `muat(halaman)` mengirim `{ page: halaman, status: filter?.status }`
  (tanpa `page` bila 1, tanpa `status` bila null) — status ikut pindah halaman, refresh, back/forward.
- `Select` **tidak** `disabled` saat memuat: Inertia membatalkan visit sebelumnya, fokus keyboard tidak
  hilang; daftar tetap skeleton `role="status" aria-busy="true"` existing. Galat → `InlineNotice` +
  `Coba lagi` existing, membawa status aktif.
- `teksHasil`: tanpa filter `` `Menampilkan semua ${n} pesanan.` ``; dengan filter
  `` `Menampilkan ${n} pesanan berstatus ${LABEL_FILTER[status]}.` ``; `n = 0` →
  `` `Tidak ada pesanan berstatus ${LABEL_FILTER[status]}.` `` (`n = orders.meta.total`). Region live
  selalu ada di DOM.
- Kosong karena filter: `EmptyState title="Tidak ada pesanan pada filter ini."
  description="Coba status lain, atau tampilkan semua pesanan." actionLabel="Tampilkan semua pesanan"
  onAction={() => ubahFilter('semua')}`. Kosong total tetap `Belum ada pesanan.` + `Mulai belanja`;
  kontrol filter **tidak** dirender bila `ringkasan.total === 0` atau prop `filter` tidak ada.
- 360 px: kontrol penuh (≈328 px), label di atas, hasil di bawah; ≥640 px kontrol 260 px, hasil rata
  kanan satu baris.

## 5. Matriks keadaan (DoD brief)

| Keadaan | §1 checkout | §2 riwayat | §3 selesai | §4 filter |
|---|---|---|---|---|
| normal | dropdown + ringkasan pilihan | ikon per node | kartu Status pesanan | select + hitungan |
| memuat | skeleton (tanpa kontrol) | skeleton kartu, ikon tetap | n/a (satu render) | skeleton daftar, select aktif |
| kosong | copy + `Coba lagi` | `Belum ada pesanan.` | timeline null → kartu hilang | copy khusus filter + reset |
| galat | `InlineNotice` + `Coba lagi` | `InlineNotice` + `Coba lagi` | n/a | notice sama, status dipertahankan |
| props null | `opsi` kosong → keadaan `kosong` | `timeline` null → 4 node redup | `timeline` null → kartu hilang | `filter` null → kontrol tidak dirender |
| 360 px | select penuh, teks opsi muat | vertikal, ikon 20 px | vertikal, tanpa gulir | kontrol penuh, hasil di bawah |

## 6. Asumsi & catatan untuk kartu lain

1. **Label filter satu-satunya teks non-server.** B3 hanya mengirim `filter: {status}` dan `ringkasan`
   hanya angka; tak ada label status di props. `LABEL_FILTER` (6 string) ditulis di `History.jsx` dan
   **harus sama** dengan `Order::statusLabel` (peta sama sudah ada di `Pages/Admin/Orders/Index.jsx:29–37`).
   Bila kelak server mengirim label, pakai itu — jangan menambah key di luar kontrak sekarang.
2. Pemisah nilai `|`, bukan `:` (kartu F1); bentuk JSON `opsi` tidak berubah.
3. Timeline selesai bergantung B3; sebelum mendarat kartu tidak dirender — jangan menurunkan timeline
   dari `pesanan.created_at`/`paid_at` (dua sumber, rawan beda zona waktu).
4. `filter` absen = kontrol filter tidak dirender, bukan filter kosong yang menyesatkan.
5. `diproses` selalu 0 sejak v1.4 (transisi dihapus); opsi tetap ada agar daftar stabil dan cocok dengan
   `ringkasan` yang selalu memuat 7 kunci.
6. Mode uji tidak berubah: tanpa pilihan pun submit lolos, tarif uji dipakai server.
7. Tanpa `npm run build` di kartu ini (nol kode aplikasi diubah); verifikasi = `wc -l`,
   `grep -c CONTOH`, `git status --porcelain`.
