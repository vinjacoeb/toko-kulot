# Traceability addendum v1.1 — kartu `t_8b70141c`

Dokumen: `docs/PRD-v1.1.md`. Semua kartu workspace
`C:\Users\LENOVO\Downloads\toko-kulot` (sama dengan kartu induk).

| Butir | Acceptance | Kartu | Assignee | Status |
|---|---|---|---|---|
| D1 Pembayaran semua bank | §2 AC1–AC4 | `t_04da18e0` backend Snap | backenddeveloper | todo |
| D1 UI checkout/bayar | §2 AC1, AC3, AC4 | `t_aea95532` | frontenddeveloper | todo |
| D2 Ongkir Biteship | §3 AC1–AC4 | `t_f22c8d46` backend | backenddeveloper | todo |
| D2 UI cek ongkir/pilih kurir | §3 AC1–AC3 | `t_aea95532` | frontenddeveloper | todo |
| D3 Gratis ongkir | §4 AC1–AC3 | `t_f22c8d46`, `t_aea95532` | backend + frontend | todo |
| D4 Admin ekspedisi | §5 | `t_f22c8d46` (API), `t_011cc18e` (UI) | backend + frontend | todo |
| D5 Landing | §6 AC1, AC3–AC5 | `t_7bca843e` (desain), `t_32a3828e` | uiux + frontend | todo |
| D6 Galeri dari pengaturan | §6 AC1–AC2 | `t_71f1e7a9` (backend), `t_011cc18e` (admin), `t_32a3828e` (tampil) | backend + frontend | todo |
| D7 Copy CTA/newsletter | §6 AC3 | `t_71f1e7a9`, `t_32a3828e` | backend + frontend | todo |
| Uji addendum | §2–§6 | `t_4c147c9f` | qatesting | todo |
| Review akhir | semua | `t_fa7510d1` | techlead | todo |

Prasyarat teknis: `t_7bca843e` (design addendum) tanpa parent selain induk;
`t_71f1e7a9`, `t_04da18e0`, `t_f22c8d46` paralel; frontend menunggu design + backend
terkait; QA menunggu ketiga frontend; review menunggu QA.

Catatan: kartu lama `t_082b15aa` (header tabel sticky) tidak termasuk lingkup addendum ini;
tetap terbuka sampai pemilik memutuskan.
