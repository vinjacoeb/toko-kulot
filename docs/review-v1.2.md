# Review Rilis v1.2 — Toko Daster Kulot

Tanggal: 2026-10-24 19:44 WIB · Reviewer: techlead · Kartu: `t_67affdd0`
Repo: `C:\Users\LENOVO\Downloads\toko-kulot` · HEAD `bfcf456` + working tree (60 berkas, belum commit)
Acuan: `docs/PRD-v1.2.md`, `docs/design-v1.2.md`, `docs/kontrak-props.md`, `docs/qa-v1.2.md`

## 1. Rekomendasi

**GO** untuk kode v1.2, dengan empat syarat operasional yang hanya bisa dijalankan pemilik (§6).
Tidak ada temuan Critical/High yang tersisa pada working tree saat review ini. Gate `shipping.galat`
sudah hijau: techlead menjalankan suite penuh sendiri pukul 19:44 →

```
PHPUnit 11.5.57, PHP 8.3.32, phpunit.xml (sqlite :memory:)
OK (317 tests, 2565 assertions) — 1m30s
```

Sebelum perbaikan B-01, test yang sama di mesin ini gagal persis seperti laporan QA
(`HistoryTest.php:309`, `'Resi otomatis…' is identical to null`); jadi hasil hijau bukan asumsi.
**Keputusan rilis akhir tetap milik pemilik** (PRD v1.2 §10).

## 2. Yang lulus (diverifikasi ulang oleh techlead, bukan hanya dikutip)

| Area | Bukti yang saya periksa sendiri | Status |
|---|---|---|
| F1 Bayar 8 kanal tanpa Snap | `MidtransService::CHANNELS` 8 entri (`app/Services/MidtransService.php:37-46`); `grep -rn "snap(" app/` kosong | Lulus |
| F2 Checkout ongkir otomatis | test `test_ongkir_dari_form_tidak_dipercaya`, prefill profil (QA); suite hijau | Lulus (server) |
| F3 Register alamat | `RegisterRequest.php` wajib address/city/postal_code; pesan design §6.1 (handoff `t_09738dd5`); suite | Lulus |
| F5 Ekspedisi dropdown | `node resources/js/lib/ekspedisi.check.mjs` → `ok` (QA, 19:39); `Shipping/Index.jsx` pakai `kurir.daftar[]` | Lulus |
| F6 Panel pesanan admin | `OrderController::detail` mengirim `payment_method`, `payment_method_label` (`:300-301`), shipping + timeline; `AdminAutoResiTest` hijau | Lulus |
| F8 Riwayat pembeli | B-01 diperbaiki: `HistoryController.php:104-109` menimpa `galat` jadi `null`; kontrak §13 diklarifikasi (`docs/kontrak-props.md:2056,2069`); test `HistoryTest` hijau | Lulus |
| F4 Tipografi publik | `grep "text-\[[0-9]"` di Pages/Public, Components, Layouts → hanya `Components/KpiCard.jsx:50` (admin) | Lulus (publik) |
| Build | `public/build/manifest.json` 19:35, tidak ada `.jsx` yang lebih baru → build QA mencakup kode terkini | Lulus |

## 3. Yang gagal / terbuka

| ID | Prioritas | Kondisi saat review | Tindakan |
|---|---|---|---|
| B-01 `shipping.galat` bocor ke pembeli | P1 | **Selesai di working tree** (belum commit). Suite 317/317 hijau. Panel admin tetap membawa `galat` karena `BiteshipService::shippingInfo()` tidak diubah | Tidak ada kartu baru; kartu `t_6032599a` masih berjalan saat review, handoff-nya yang menutup |
| B-02 label kanal absen di daftar admin | P3 | Masih terbuka. `OrderController::row()` (`:256-277`) tidak mengirim `payment_method_label`; `Admin/Orders/Index.jsx:237-241` hanya badge status bayar | Kartu pengganti dibuat (workspace lama `t_b9fe6ce6` scratch kosong, tidak bisa dipakai) |
| B-03 sisa tipografi admin | P3 | Terbuka dan **diterima**: design §2.6 menetapkan temuan ini P3 di kartu pemilik `t_ab9c84fe` dan bukan penunda rilis | Tidak ada kartu baru |

Catatan B-01: perbaikan memilih opsi "null-kan di payload riwayat" (bukan parameter baru di service),
sehingga perilaku admin tidak berubah dan kontrak §13 tetap berbentuk sama. Test tidak dilonggarkan
(mtime `tests/Feature/HistoryTest.php` 18:56, lebih tua dari perbaikan 19:43).

## 4. Belum dicek (jujur: bukan lulus)

| Hal | Alasan |
|---|---|
| Polling status lunas + countdown QRIS/VA di browser | Tidak ada browser automation di sesi ini; QA juga tidak. Butuh Playwright/sesi manual |
| Debounce + `AbortController` ongkir, reset tarif saat kode pos berubah | Butuh browser (DevTools network) |
| Responsif 360/768/1280, keyboard disclosure riwayat | Butuh browser |
| Jalur HTTP 402 "kanal belum aktif" Midtrans | Butuh akun sandbox Midtrans + kunci asli |
| Katalog Biteship mati → fallback `sumber=settings` | Hanya inspeksi `BiteshipService::catalog()`; tidak disimulasikan |
| Status migrasi `orders.biteship_*` + `shipped_at` di DB pemilik | `php artisan` dilarang untuk peran ini; QA live probe 9/9 lolos, jadi kolom tampak sudah ada |
| Lighthouse/LCP | Tidak diukur |

## 5. Sisa bug & risiko

1. B-02 (P3) — admin tidak bisa memilah pesanan per kanal dari daftar. Tidak menghambat alur.
2. B-03 (P3) — 5 berkas admin masih `rupiah(` tanpa `tabular-nums`, `KpiCard.jsx:50` `text-[28px]`,
   `DataTable.jsx:108` `max-w-xl`, `AdminLayout.jsx:130,156` `tracking-wide`. Kosmetik, sudah tercatat.
3. Risiko terbesar rilis ini bukan defect yang diketahui, melainkan **UI yang belum pernah dijalankan
   di browser pada v1.2**: regresi JS tidak tertangkap `npm run build`. Mitigasi: satu putaran manual
   sebelum deploy (§6 butir 3).
4. Saldo Biteship habis (temuan `t_1b711d26`) masih bisa membuat pembeli tidak mendapat ongkir;
   sekarang pesannya spesifik, tetapi tetap kegagalan operasional pemilik.
5. Working tree belum commit (60 berkas). Rilis harus dari commit yang suite-nya hijau, bukan dari
   keadaan working tree yang bergerak (kartu perbaikan lain masih berjalan saat review).

## 6. Syarat operasional (pemilik)

1. `php artisan migrate` untuk `2026_10_24_000003_add_biteship_columns_to_orders_table` (lihat
   `docs/langkah-pemilik.md`, bagian "Migrasi kolom resi otomatis").
2. `MIDTRANS_SERVER_KEY` + `BITESHIP_API_KEY` asli di `.env` (jangan ditempel di kartu/chat); top up
   saldo Biteship bila ongkir nyata mau diuji.
3. Satu putaran uji browser manual: bayar 8 kanal + countdown + polling lunas, checkout debounce
   ongkir, riwayat di 360px, tombol resi otomatis 2×.
4. Commit + tag rilis dari keadaan suite hijau, lalu jalankan suite sekali lagi di commit itu.

## 7. Ketidaksinkronan dokumen

D-01…D-05 dari `docs/qa-v1.2.md` §5 saya terima seluruhnya. Yang perlu ditutup: design §7.3/§14.7
masih menulis `POST /admin/pesanan/{order}/resi-otomatis`, sedangkan rute nyata `/resi`
(`routes/admin.php`). Kode + UI konsisten; yang salah dokumen desain. D-05 (kontrak §13) sudah
ditutup oleh perbaikan B-01.
