# Keputusan Techlead — `ulasan.boleh` (kontrak §7.9) vs `CheckoutController::success` — kartu `t_2b031326`, 21 Okt 2026

Titik awal: kartu F6 `t_2de36f29` (halaman `/checkout/{order}/selesai`) melaporkan satu temuan
kontrak. Bukti temuan: `docs/bukti-frontend-t_2de36f29.txt` dan bagian F6 `docs/catatan-frontend.md`.
Techlead tidak menulis kode: kartu ini membekukan definisi, menyunting kontrak, lalu memecah
pekerjaan ke backend, frontend, dan QA.

## 1. Keputusan

**Server diperbaiki ke §7.9. Kontrak tidak dilonggarkan** — "belum mengulas semua produk" tetap
definisi resmi, tetapi diperjelas menjadi operasional dan dibekukan hari ini di
`docs/kontrak-props.md` §7.9 (+ baris status §7.11).

| Hal | Nilai yang dibekukan |
|---|---|
| `ulasan.boleh` | `true` **hanya bila server akan menerima minimal satu kiriman ulasan sekarang** (§9.1): `payment_status = settlement` **dan** `status` ∈ (`dibayar`, `diproses`, `dikirim`, `selesai`) **dan** masih ada minimal satu `product_id` unik pada `pesanan.items` yang belum ada di `reviews` order itu |
| `ulasan.sudah` | Tidak berubah: daftar `product_id` yang sudah diulas, `[]` bila belum ada |
| Sumber aturan "status boleh dinilai" | `ReviewService::isEligible()` (`app/Services/ReviewService.php:39-43`) — controller memakainya, tidak menyalin daftar status |
| Bentuk respons §7.9 | Tidak berubah: `{ pesanan, ulasan: { boleh, sudah } }` |

Alternatif "perjelas §7.9 agar `boleh` = belum ada ulasan sama sekali" **ditolak**: §9.1 masih
menerima ulasan produk sisa (`ReviewService::store`), jadi definisi itu akan membuat props
berbohong tentang kemampuan server, mematikan form penilaian produk sisa di layar, dan tetap
bertabrakan dengan §9.1/PRD §7.3.

## 2. Bukti (baca-saja; tanpa server, tanpa database pemilik, tanpa `.env`)

1. **Penyimpang.** `app/Http/Controllers/CheckoutController.php:173-179` (baris penyimpang **:176**)
   mengirim `'boleh' => $reviewedProductIds === []` → `true` hanya bila belum ada ulasan **sama sekali**.
   Teks kontrak sebelum pembekuan: `docs/kontrak-props.md:526` (kini memuat definisi baru).
2. **Jalur yang benar-benar dilayani server.** §9.1 (`docs/kontrak-props.md:700`, aturan baris 719-720)
   + `ReviewService::isEligible` (:39) + `ReviewController::store` (`app/Http/Controllers/ReviewController.php:26-31`):
   setelah 1 dari 2 produk diulas, kiriman untuk produk kedua **diterima**. Jadi §7.9 benar, server yang sempit.
3. **Test lama tidak menutup kasus ini.** `tests/Feature/Checkout/CheckoutTest.php:349-364` hanya
   menguji pesanan tanpa ulasan (`boleh=true`), sehingga deviasi lolos suite (§7.11 "terverifikasi 21 test").
4. **Kasus `settlement` + status `batal` nyata bisa terjadi.** `Order::nextStatuses()`
   (`app/Models/Order.php:86-107`) selalu menawarkan `batal`, dan perpindahan status lewat
   `OrderService::changeStatusByAdmin` (`app/Services/OrderService.php:211`; dipanggil
   `app/Http/Controllers/Admin/OrderController.php:120-121`) tidak pernah menulis `payment_status`
   (satu-satunya penulisan ada di `OrderService::createFromCart` :55).
   Akibatnya hari ini halaman selesai bisa mengirim `boleh=true` padahal §9.1 menolak ulasan — alasan
   kedua untuk menggabungkan syarat status ke dalam `boleh`.
5. **Konsumen props.** Satu-satunya pembaca `ulasan.boleh` adalah `resources/js/Pages/Public/CheckoutSuccess.jsx`
   (`grep -rn "boleh" resources/js`, hasil: hanya berkas itu + baris dokumentasi lain).

## 3. Temuan tambahan T1 — gerbang klien tidak benar-benar memakai `boleh`

`resources/js/Pages/Public/CheckoutSuccess.jsx:53-54`:

```
kontradiksiBoleh = !boleh && syaratDinilai && pending.length > 0
tampilkanForm    = (boleh || kontradiksiBoleh) && syaratDinilai && pending.length > 0
```

Karena `boleh || (!boleh && X)` ≡ `boleh || X`, ekspresi itu setara `syaratDinilai && pending.length > 0`:
nilai `boleh` **tidak berpengaruh sama sekali**. Jadi DoD F6 "gerbang penilaian menghormati
`ulasan.boleh`" belum benar-benar tercapai (tidak berbahaya — gate §9.1 lokal sudah menahan — tetapi
klaim kartu dan komentar di kode sekarang menyesatkan).

Tindakan: kartu `t_02c3d20c` (frontend) menyederhanakan gate menjadi `boleh && pending.length > 0`
**setelah** `t_45344e00` (backend) selesai. Cabang "kontradiksi" dihapus, bukan dipertahankan:
penyebabnya (deviasi server) hilang di `t_45344e00`, dan yang tersisa hanya kode mati yang
menjanjikan perilaku yang tidak lagi benar.

## 4. Sinkronisasi peran (siapa menyesuaikan dan mengapa)

| Peran | Menyesuaikan? | Alasan |
|---|---|---|
| backend | ya — `CheckoutController::success` + test regresi | server penyimpang; §7.0–§7.9 tetap kontrak yang berlaku |
| frontend | ya — gate menyusut ke `boleh` | kontrak §7.9 kini dapat dipercaya; cabang kontradiksi jadi kode mati |
| qatesting | ya — verifikasi props + gate dengan bukti | klaim F6 perlu dikoreksi secara terukur |
| dokumen | kontrak §7.9 + §7.11, oleh techlead di kartu ini | definisi operasional dibekukan supaya tidak ada dua tafsir |

## 5. Kartu lanjutan

| Kartu | Assignee | Parent | Isi |
|---|---|---|---|
| `t_45344e00` (B1) | backenddeveloper | — (dibuat dari `t_2b031326`) | `boleh` = `isEligible` && ada sisa produk; 5 test regresi di `CheckoutTest` |
| `t_02c3d20c` (B2) | frontenddeveloper | `t_45344e00` | gate `tampilkanForm = boleh && pending.length > 0`; hapus cabang kontradiksi |
| `t_4ef6e8bd` (B3) | qatesting | `t_02c3d20c` | verifikasi statis + otomatis §7.9 (props, test, gate) |

Urutan wajib B1 → B2 → B3: perubahan gate sebelum server benar akan menyembunyikan produk yang
masih boleh dinilai. Tidak ada dua kartu paralel pada berkas yang sama.

## 6. Yang tidak diubah

- `docs/PRD.md` tidak disentuh: §7.3 (baris 223-226) dan §5.1 langkah 8 (baris 219) sudah memuat
  aturannya; §7.9 hanya **cara teknis** mengirimkannya.
- Desain (`docs/design.md` §5.8) tidak disentuh: state `review-empty`/`review-submitted` tetap sama,
  hanya pemicunya menjadi konsisten.
- Tanpa rute, kolom, migrasi, atau props baru. `ulasan.sudah` dan bentuk respons tetap.
- Tidak ada pertanyaan untuk pemilik dan tidak ada blokir: keputusan turun dari dokumen acuan.

## 7. Belum dicek (butuh browser)

Kirim ulasan end-to-end dengan sesi pembeli nyata (2 produk, 1 dinilai lalu 1 lagi) — **belum dicek,
butuh browser + CSRF + Midtrans settlement**; tidak ada server dinyalakan di kartu ini. Dijadwalkan
ke kartu `t_4ef6e8bd` sebagai butir "belum diuji, butuh browser".
