# Traceability v1.4

Sumber: kartu `t_b6a1ee89`, `docs/PRD-v1.4.md`.

| Fitur | Prioritas | Kartu | Verifikasi |
|---|---|---|---|
| F11 ongkir website = dasar Biteship (berat/asalan/log) | P0 | B1 `t_3a264fac` | test fitur + log; tarif nyata belum dicek (butuh key) |
| F12 hapus ubah status manual (rute + controller + model) | P0 | B3 `t_fc5b4ce1` | rute 405/404, test webhook |
| F12 hapus UI ubah status admin | P0 | F2 `t_0412c9c4` | `npm run build`, grep, browser belum diuji |
| F13 `shipping_events` + props pembeli + auto-selesai | P0 | B2 `t_f51f8c36` | test append/dedupe/cap/props/auto-selesai |
| F13 timeline + riwayat pengiriman di halaman pembeli | P0 | F1 `t_2ecd08cb` | build + browser belum diuji |
| F14 token webhook dari `.env` | P0 | — (sudah v1.3) | tidak dapat dicek techlead; milik pemilik |
| Regresi v1.3 (pembayaran, resi, webhook) | P0 | QA `t_74f3f512` | suite + bukti di `docs/qa-v1.4.md` |
| Keputusan rilis v1.4 | — | Review `t_f57a3723` | `docs/review-v1.4.md` |

Urutan dependensi: B3 → F2; B1 → B2 → F1; QA setelah B1+B2+B3+F1+F2; Review setelah QA.

