# Traceability — v1.3 (webhook Biteship & tunnel)

Setiap butir PRD v1.3 dipetakan ke kartu. Kartu induk berisi dependensi; bukti akhir di
`docs/qa-v1.3.md` dan `docs/review-v1.3.md`.

| Butir | Uraian | Kartu |
|---|---|---|
| §2.1 | Route publik `POST /biteship/webhook`, tanpa CSRF, throttle, token, kode balasan | `t_2c6be520` (Backend webhook) |
| §2.2 | Peta tiga event → kolom `orders` | `t_2c6be520` |
| §2.3 | Status pesanan hanya maju; retur/gagal tidak membatalkan | `t_2c6be520` |
| §2.4 | Idempoten, payload terakhir, tanpa tabel baru | `t_2c6be520` |
| §2.5 | Migrasi `shipping_updated_at`, `shipping_webhook_payload`; `db.md` | `t_2c6be520` |
| §2.6 | Props admin detail + daftar | `t_5a702574` → `t_a0a38aeb` |
| §2.6 | Props riwayat pembeli + halaman selesai (`pesanan.shipping`) | `t_5a702574` → `t_e3c1f107` |
| §2.6 | Bentuk tampilan keempat tempat | `t_92f89ef1` |
| §2.7 | Test fitur webhook + props hijau | `t_2c6be520`, `t_5a702574`, `t_f5cacb6b` |
| §3 | Trust proxy loopback → URL aset https | `t_8498103a` |
| §3 | Hapus `public/hot`, `npm run build`, verifikasi tunnel | `t_74deeaef` |
| §3 | Verifikasi akhir di browser | `t_f5cacb6b` (ditandai "belum diuji, butuh browser") |
| §4 | Token, migrate, daftar webhook di dashboard Biteship | Pemilik; langkah di `docs/langkah-pemilik.md` |
| §4 | Uji webhook asli | Pemilik → dicatat di `t_f5cacb6b` sebagai "belum diuji, butuh pemilik" |
| §1, §6 | Rekomendasi Go/No-Go | `t_b20fca2d` |

## Graf

```
t_92f89ef1 (UIUX) ─┐
t_2c6be520 (B1)  ──┼→ t_5a702574 (B2) ─┬→ t_a0a38aeb (F1 admin) ─┐
                   │                   └→ t_e3c1f107 (F2 pembeli) ┼→ t_f5cacb6b (QA) → t_b20fca2d (Review)
t_8498103a (B0) ──→ t_74deeaef (D0) ─────────────────────────────┘
```
