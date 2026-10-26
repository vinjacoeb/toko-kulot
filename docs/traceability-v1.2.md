# Traceability — v1.2

Kartu: `t_10766b7f` (permintaan pemilik bagian 2). Acuan: `docs/PRD-v1.2.md`.

| Permintaan (PRD v1.2) | Backend | Frontend | Lain |
|---|---|---|---|
| F1 Midtrans tanpa Snap, 8 kanal | B1 | F2 | UIUX §1, QA 1 |
| F2 Alamat register + ongkir otomatis | B2 | F1 | UIUX §2–3, QA 2–3 |
| F3 Redirect selesai + status otomatis | B1 | F2 | QA 1 |
| F4 Tipografi publik | — | F5 | UIUX §6, QA 7 |
| F5 Ekspedisi dropdown kurir→layanan | B3 (katalog) | F3 | UIUX §4, QA 4 |
| F6 Admin pesanan sesuai Midtrans/Biteship | B4 | F3 | UIUX §4, QA 5 |
| F7 Resi otomatis Biteship | B3 | F3 | UIUX §4, QA 5 |
| F8 Riwayat informatif | B4 | F4 | UIUX §5, QA 6 |

## Peta kartu
| Kode | ID | Judul | Assignee | Parent |
|---|---|---|---|---|
| U1 | t_a05222c7 | Desain v1.2 | uiux | — |
| B1 | t_66e507a3 | Midtrans Core API 8 kanal + selesai | backenddeveloper | — |
| B3 | t_930c56e3 | Resi Biteship + katalog ekspedisi | backenddeveloper | — |
| B2 | t_09738dd5 | Register alamat + prefill | backenddeveloper | B1 |
| B4 | t_f4a75237 | Props admin pesanan & riwayat | backenddeveloper | B1, B3 |
| F2 | t_6c310317 | Halaman bayar sendiri | frontenddeveloper | B1, U1 |
| F1 | t_8febc069 | Checkout otomatis + register | frontenddeveloper | B2, U1 |
| F3 | t_ab9c84fe | Admin pesanan + ekspedisi | frontenddeveloper | B3, B4, U1 |
| F4 | t_220ba320 | Riwayat informatif | frontenddeveloper | B4, U1 |
| F5 | t_51dab180 | Tipografi publik | frontenddeveloper | U1, F1–F4 |
| Q1 | t_56a93c99 | QA v1.2 | qatesting | F1–F5, B4 |
| R1 | t_67affdd0 | Review & Go/No-Go | techlead | Q1 (plus B2 redundan) |

## Definition of Done tingkat rilis
Semua kartu di atas `done`; `docs/qa-v1.2.md` tanpa bug terbuka tingkat tinggi; pemilik sudah
melakukan P1–P4; review Tech Lead merekomendasikan Go.
