# Desain v1.3 — Data webhook Biteship (admin & pembeli)

Kartu `t_92f89ef1` · 25 Okt 2026 · mengikat F1/F2 `t_5a702574` (props) lalu QA.
Sumber key: **`docs/PRD-v1.3.md` §2.6 saja**. Visual/token/komponen: `docs/design-v1.2.md` §2–§4
dan `docs/design.md`. Dokumen ini hanya menambah **keadaan** baru; struktur halaman tidak berubah.

## 0. Aturan untuk keempat tempat

- **Tanpa** token, warna, ukuran, ikon, atau komponen baru. Yang dipakai: `KartuBagian`,
  `InlineNotice` (§4.23), `Badge` (§4.21), `StatusBadge`, `SalinButton` (§4.3), `Button`, dan
  `<details>` native untuk payload (buka/tutup + keyboard gratis, tanpa JS baru).
- Teks status = `shipping.status_label` dari server; klien **tidak** menterjemahkan
  `shipping_status` mentah dan tidak mengarang label.
- Field `null` **tidak** dirender sebagai baris `—` (beda dengan §3.2 resi): baris kosong berarti
  "ada tapi kosong", sedangkan di sini artinya "belum ada data".
- Waktu: `formatDateTime` existing (`resources/js/lib/format.js:38`) → `24 Okt 2026, 14.05`.
  Uang: `rupiah`. Selisih: tanda eksplisit `+` / `-` di depan `rupiah(Math.abs(nilai))`.
- `shipping.tindakan` + `shipping.perlu_tindakan` = **khusus admin**. Pembeli (§3, §4) tidak
  merender keduanya walau ikut terkirim (PRD §2.6 bentuk pembeli).

## 1. Admin detail `/admin/pesanan/{order}` — panel Pengiriman

Berkas: `resources/js/Pages/Admin/Orders/partials/InfoResi.jsx`, di dalam kartu "Pengiriman".
`dl` existing ditambah baris; urutan akhir: Kurir/layanan → **Petugas kurir** → Resi →
Status pengiriman → **Ongkir aktual** → **Selisih ongkir** → **Diperbarui**.

| Baris | Key PRD §2.6 | Render | Bila `null` |
|---|---|---|---|
| Petugas kurir | `driver.name`, `driver.phone` | nama `text-ink`; telepon di bawahnya `text-meta tabular-nums` (teks, bukan `tel:`) | baris tidak dirender (juga bila `name` null) |
| Ongkir aktual | `price_final` | `rupiah(price_final)` | tidak dirender |
| Selisih ongkir | `price_selisih` | `+Rp5.000` [CONTOH] / `-Rp5.000` [CONTOH]; di bawahnya satu baris `text-meta text-slate-600`: `Ongkir aktual berbeda dari ongkir tagihan.` | tidak dirender; nilai `0` juga tidak dirender |
| Diperbarui | `updated_at` | `formatDateTime(updated_at)` | tidak dirender |

Catatan keputusan (F-13-04, `docs/review-v1.3.md`): baris lama **ETD, Berat, Ongkir (tagihan)**
tetap dirender dan tetap memakai label lama; urutan nyata di `InfoResi.jsx`: Kurir/layanan → ETD →
Berat → Ongkir → Petugas kurir → Nomor resi → Status Biteship → Ongkir aktual → Selisih ongkir →
Diperbarui. Label `Nomor resi`/`Status Biteship` tidak diganti. Implementasi ini yang berlaku;
"urutan akhir" di atas dibaca sebagai urutan baris v1.3 saja.

**Peringatan `perlu_tindakan`** — `InlineNotice tone="warning"` di atas `dl` (nada tenang:
warning, bukan `error`/merah menyala; ikon `AlertIcon` sudah bawaan komponen), `title="Perlu
tindakan"`, isi = `shipping.tindakan` apa adanya; bila `tindakan` null → teks beku
`Periksa status pengiriman pesanan ini.` Tanpa tombol tutup, tanpa aksi.

**Payload `webhook_terakhir`** — setelah `dl`:

```jsx
<details>
  <summary className="cursor-pointer text-meta text-brand underline underline-offset-4">Lihat payload webhook</summary>
  <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-slate-50 p-4 font-mono text-meta break-all whitespace-pre-wrap">{JSON.stringify(shipping.webhook_terakhir, null, 2)}</pre>
</details>
```

`webhook_terakhir` null → kontrol **diganti** `<p className="text-meta text-slate-600">Belum ada
payload webhook.</p>` (bukan tombol mati, bukan panel kosong).

Keadaan panel: **belum ada webhook** = hanya Kurir/layanan + Resi existing, tanpa baris baru, tanpa
notice, tanpa kontrol payload. **picked/delivered** = `Diperbarui` + (picked) `driver` terisi.
**retur/gagal** (`cancelled|rejected|returned|disposed|on_hold`) = notice warning + status apa
adanya; pesanan **tidak** berubah status (PRD §2.3), jadi tidak ada tombol tambahan.
**selisih ongkir** = baris Ongkir aktual + Selisih. **payload kosong** = lihat paragraf di atas.

## 2. Admin daftar `/admin/pesanan`

Berkas: `resources/js/Pages/Admin/Orders/Index.jsx`, sel **Kurir / Resi** (`shipping_status`).
Sel itu sudah `flex flex-col items-start gap-1` dan berakhir `StatusBadge`; dua penanda baru
ditambahkan **sebagai anak stack yang sama**, jadi lebar kolom tidak berubah:

1. `shipping_perlu_tindakan === true` → `<Badge tone="warning"><AlertIcon size={14} /> Perlu tindakan</Badge>`.
2. `shipping_updated_at` → `<p className="text-meta text-slate-500">Diperbarui {formatDateTime(...)}</p>`;
   null → tidak dirender.

**Aturan lipat — jangan kolom baru.** `DataTable` tak punya mode kartu; di 360 px tabel bergulir
horizontal (`overflow-auto`) dan kolom Aksi tetap. Jadi badge + timestamp masuk sel Kurir/Resi yang
memang tentang pengiriman; kolom terpisah baru boleh bila daftar punya kartu ringkas mobile (di
luar scope v1.3). **Jebakan:** early-return `—` (`Index.jsx:199`) hanya berlaku bila kurir, resi,
status kosong **dan** `shipping_perlu_tindakan` false.

**Tabrakan badge "Mode uji".** `Mode uji` existing (`Index.jsx:168`, `Show.jsx:144`) juga
`tone="warning"` dan bisa satu baris dengan badge baru. Pembeda: `Perlu tindakan` **selalu**
membawa `AlertIcon` 14 px; `Mode uji` tidak diubah (teks saja). Di detail tidak ada tabrakan —
`Perlu tindakan` di sana berupa `InlineNotice`, bukan badge.

Keadaan daftar: belum ada webhook = sel seperti sekarang; picked = `StatusBadge` + `Diperbarui`;
delivered = idem; retur/gagal = status apa adanya + badge `Perlu tindakan`; selisih ongkir = badge
`Perlu tindakan` (tanpa angka — nominal hanya di detail); payload kosong = n/a (tidak dikirim).

## 3. Riwayat pembeli `/history`

Rute nyata `/history` (`routes/web.php:84`); brief menulis `/akun/pesanan` — lihat catatan.
Berkas: `resources/js/Pages/Public/History.jsx`.

- **Kartu ringkas:** setelah baris `{kurir} · {resi}` existing, tambah `shipping.status_label`
  sebagai teks `text-meta text-ink` (bukan badge: label Biteship bebas, tidak ada peta tone di
  kontrak). Kosong → tidak dirender.
- **Rincian "Pengiriman":** baris `Petugas kurir` (`driver.name`, `driver.phone` `text-meta`) dan
  `Diperbarui` (`updated_at`) ditambahkan; keduanya disembunyikan bila null.
- **Tanpa aksi:** tidak ada tombol ubah status, tanpa `tindakan`/`perlu_tindakan`, tanpa
  `price_final`/`price_selisih`/`webhook_terakhir`, dan **tanpa tautan lacak** (tautan lacak hanya
  di halaman selesai §4 agar satu jalur).
- **Resi kosong:** `Resi belum tersedia.` — copy existing (`History.jsx:321`), bukan baris hilang.
- **Timeline "Dikirim"** tetap memakai `shipped_at` existing.

Keadaan: belum ada webhook = status kosong tidak dirender, resi `Resi belum tersedia.`; picked =
status + resi + kurir; delivered = idem + `Diperbarui`; retur/gagal = `status_label` apa adanya
(tanpa nada bahaya, tanpa kalimat admin); selisih ongkir & payload kosong = n/a (tidak dikirim).

## 4. Halaman selesai `/checkout/{order}/selesai`

Berkas: `resources/js/Pages/Public/CheckoutSuccess.jsx`. Blok baru **"Status pengiriman"** di bawah
ringkasan pesanan (setelah blok "Dikirim ke"), pola kartu yang sama:

```jsx
<section className="border-t border-line pt-5">
  <h3 className="text-h3 text-ink">Status pengiriman</h3>
  <dl className="mt-3 grid gap-3 sm:grid-cols-2">…</dl>
</section>
```

Baris: **Status** (`status_label` teks; null → `—`) · **Resi** (`SalinButton`; null/`''` → kalimat
beku `Resi sedang disiapkan.`) · **Kurir** (`courier_name · service_name` bentuk existing) ·
**Petugas kurir** (`driver.name`; hidden bila null) · **Diperbarui** (`updated_at`; hidden bila
null) · **Lacak paket**: `Button` secondary (`target="_blank" rel="noopener noreferrer"`) hanya bila
`driver.link` berawalan `http://`/`https://`; selain itu tidak dirender.

Keadaan: belum ada webhook = Status `—`, Resi `Resi sedang disiapkan.`, tanpa tombol lacak;
picked/delivered = status + resi + kurir + `Lacak paket` bila `driver.link` ada; retur/gagal =
`status_label` apa adanya (tanpa `tindakan`); selisih ongkir & payload kosong = n/a (tidak dikirim).

## 5. Matriks keadaan (DoD brief)

| Keadaan | §1 detail admin | §2 daftar admin | §3 riwayat | §4 selesai |
|---|---|---|---|---|
| belum ada webhook | tanpa baris baru/notice/payload | sel seperti sekarang | status kosong, `Resi belum tersedia.` | `—` + `Resi sedang disiapkan.` |
| `picked` | `Diperbarui` + Petugas kurir | `StatusBadge` + `Diperbarui` | status + resi + kurir | status + resi + lacak |
| `delivered` | idem | idem | idem + `Diperbarui` | idem |
| retur/gagal | notice warning + `tindakan` | badge `Perlu tindakan` | status apa adanya | status apa adanya |
| selisih ongkir | Ongkir aktual + Selisih | badge `Perlu tindakan` | n/a | n/a |
| payload kosong | `Belum ada payload webhook.` | n/a | n/a | n/a |

## 6. Asumsi & catatan (bukan penghalang)

1. **Rute.** Brief §3 menulis `/akun/pesanan`; aplikasi hanya punya `/history`
   (`routes/web.php:84`, `HistoryController@index`). Desain memakai `/history`; tidak ada rute baru.
2. **Format waktu.** Brief menulis `24 Okt 2026 14.05` (tanpa koma); helper baku
   `formatDateTime` menghasilkan koma. Dipakai helper apa adanya agar satu format di seluruh app.
3. **Props belum ada.** `docs/kontrak-props.md` §7.9/§12.16/§12.17/§13 belum memuat key v1.3 —
   mendarat di kartu B2 `t_5a702574`. Sebelum itu key absen; perilaku = keadaan "belum ada webhook".
4. **Tidak ada data karangan.** Semua nilai contoh di dokumen ini berlabel `[CONTOH]`; teks UI baru
   hanya empat: `Lihat payload webhook`, `Belum ada payload webhook.`, `Periksa status pengiriman
   pesanan ini.`, `Resi sedang disiapkan.`
5. **`CheckoutPay` tidak disentuh** (PRD §2.6: pengiriman tampil di `success`). Kontras/keyboard
   ikut komponen existing (`text-slate-500` di putih 4,76:1, focus ring browser pada `summary`);
   verifikasi akhir milik QA.
