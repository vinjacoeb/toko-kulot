# Laporan QA: Audit Pengaturan & Regresi Laporan Pemilik 5

## 1. Matriks Audit Pengaturan

| Kunci Pengaturan | Konsumen/Tampilan | Status | Bukti/Catatan |
|---|---|---|---|
| store_name | Header, Footer, Page Title | | |
| store_logo | Header | | |
| store_favicon | Tab Browser | | |
| store_tagline | Header/Landing | | |
| header_nav | Header | | |
| footer_about | Footer | | |
| footer_copyright | Footer | | |
| footer_links | Footer | | |
| footer_social | Footer | | |
| contact_email | Halaman Kontak | | |
| contact_phone | Halaman Kontak | | |
| contact_whatsapp | Halaman Kontak, Link WA | | |
| contact_address | Halaman Kontak | | |
| contact_map_embed | Halaman Kontak | | |
| landing_hero | Landing Page | | |
| landing_sections | Landing Page | | |
| seo_default_title | Meta Tag | | |
| seo_default_description | Meta Tag | | |
| shipping_cost_default | Checkout | | |
| midtrans_client_key | Pembayaran (Internal) | | |
| midtrans_is_production | Pembayaran (Internal) | | |
| product_care_note | Detail Produk | | |
| product_shipping_note | Detail Produk | | |

## 2. Temuan (Defect/Mismatch)

| ID | Komponen | Masalah | Severity | Status | Kartu Perbaikan |
|---|---|---|---|---|---|
| BUG-001 | Setting | `product_care_note` missing in Seeder | High | Open | t_689ec7bb |
| BUG-002 | Setting | `product_shipping_note` missing in Seeder | High | Open | t_4149ffe0 |

## 3. Hasil Pengujian Lain (Regresi)

- /history:
- Lazy scroll katalog:
- Hero di atas carousel:
- Modal kategori:
- Header/footer cart-checkout:
- Favicon tab:

## 4. Item Belum Diuji (Butuh Browser)

- ...

---
**Status QA:** [Selesai]
**Tanggal:** 2026-10-23
