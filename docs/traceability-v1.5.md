# Traceability v1.5 — permintaan pemilik → kartu

Kartu induk: `t_51b30cf7` (techlead). Dokumen: `docs/ringkasan-v1.5.md`.

| # | Permintaan pemilik | Kartu | Bukti selesai |
|---|---|---|---|
| 1 | Opsi ekspedisi checkout sesuai `/admin/ekspedisi` | B1 `t_6dcc1818`, F1 `t_6831e8b1` | test `services()` + `npm run build`; hanya layanan `is_active` yang tampil |
| 2 | Dropdown pilihan ekspedisi (mis. anteraja/jne) | U1 `t_b8fbee66`, F1 `t_6831e8b1` | `docs/design-v1.5.md` §1; `Select` + `optgroup` di `Checkout.jsx` |
| 3 | Status Biteship tidak masuk ke `/history` & `/admin/pesanan` | B2 `t_b8bc14f7` | test header kustom lolos; 403 di log berhenti; uji webhook nyata = pemilik |
| 4 | Timeline pakai ikon, bukan titik | U1 `t_b8fbee66`, F2 `t_85a16600` | `docs/design-v1.5.md` §2; `TimelinePesanan.jsx` + build |
| 5 | Timeline di `/checkout/{order}/selesai` | B3 `t_8216e843`, U1 `t_b8fbee66`, F2 `t_85a16600` | test payload `timeline`; bagian timeline di `CheckoutSuccess.jsx` |
| 6 | Filter riwayat sesuai `order.status` | B3 `t_8216e843`, U1 `t_b8fbee66`, F2 `t_85a16600` | test `?status=`; Select filter + paginasi membawa status |

Verifikasi menyeluruh: QA `t_31b212fb` → `docs/qa-v1.5.md`. Review akhir: `t_671897e5` →
`docs/review-v1.5.md`. Keputusan rilis tetap di pemilik.

## Urutan dependensi

U1 `t_b8fbee66`, B1 `t_6dcc1818`, B2 `t_b8bc14f7` → B3 `t_8216e843` (setelah B1) →
F1 `t_6831e8b1` (U1+B1), F2 `t_85a16600` (U1+B3) → QA `t_31b212fb` → Review `t_671897e5`.
