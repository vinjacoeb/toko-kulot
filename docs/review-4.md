# Review techlead — laporan bug pemilik 4 (kartu `t_7471aa7e`, 22 Okt 2026)

Verifikasi baca-saja: `storage/logs/laravel.log`, kode `app/Services/MidtransService.php`,
test `tests/Feature/Checkout/QrisAcquirerFallbackTest.php`, dan dokumen Midtrans resmi.
Tidak ada berkas aplikasi, `.env`, database, atau server yang disentuh.

## 1. Ringkasan

Laporan: **masih** muncul `Gagal membuat pembayaran QRIS. Coba lagi.` saat checkout, padahal
kartu `t_2f443b75` sudah selesai.

Log membuktikan perbaikan sebelumnya **aktif** (entri 10:37:51 sudah memuat `qris_acquirer`,
`attempt`, `channel_inactive`), tetapi percobaan pemilik menemukan **dua sebab berlapis**:

1. **Akun Midtrans (produksi) menjawab 402 untuk kanal GoPay QRIS** — ini fakta akun, bukan kode.
2. **Percobaan cadangan `other_qris` mengirim payload tidak sah** → Midtrans menjawab **413
   `Payload format is not supported`**, dan galat 413 itu **menutupi** diagnosis 402 sehingga
   pembeli/pemilik kembali melihat pesan generik.

Artinya: perbaikan putaran 1 benar untuk jalur utama, tetapi desain cadangannya salah dan
menghapus satu-satunya petunjuk yang bisa ditindaklanjuti. Putaran ini (putaran 2 dari batas 2)
memperbaiki cadangan + pesan; aktivasi kanal tetap langkah pemilik.

## 2. Temuan dan bukti

### F1 — Kanal GoPay QRIS belum aktif di akun (penyebab utama, di luar kode)

`storage/logs/laravel.log:6262` (22 Okt 10:37:51, order `TK-20261022-0005`,
`midtrans_order_id` `TK-20261022-0005-67FFF4`):

- `qris_acquirer` = `gopay`, `attempt` = 1, `channel_inactive` = true
- previous: HTTP **402** `Payment channel is not activated.`

Pola sama 9 kali sejak 21 Okt 19:30 (baris 5339-5341, 5793, 6066-6069). Mode aplikasi produksi
(`MIDTRANS_IS_PRODUCTION=true`, bukti probe `docs/review-3.md:80-82`), jadi kanal QRIS harus
diaktifkan di dashboard **produksi**. Tidak ada perubahan kode yang bisa menggantikan aktivasi ini.

### F2 — Acquirer `other_qris` tidak sah di Core API (cacat kode, putaran 2)

`storage/logs/laravel.log:6263` (10:37:52, order dan `order_id` yang sama):

- `qris_acquirer` = `other_qris`, `attempt` = 2, `channel_inactive` = false
- previous: HTTP **413** `Payload format is not supported.`

Penyebab di kode: `app/Services/MidtransService.php:577-581` mengirim
`qris.acquirer = "other_qris"` **plus** `enabled_payments = ["other_qris"]` dalam satu charge
Core API. Menurut dokumentasi resmi
<https://docs.midtrans.com/reference/qris>, Core API `payment_type: "qris"` hanya menerima
acquirer **`gopay`** dan **`airpay shopee`**; `other_qris` adalah metode **Snap**
(`enabled_payments`, <https://docs.midtrans.com/reference/other-qris>), bukan acquirer Core API.
Karena itu Midtrans menolak bentuk payload-nya (413), bukan kanal.

Test yang mengunci perilaku salah ini: `tests/Feature/Checkout/QrisAcquirerFallbackTest.php:181-182`
dan `:236-237` (`assertSame('other_qris', ...['qris']['acquirer'])`).

### F3 — Pesan 402 tertutup galat cadangan (cacat kode, ikut diperbaiki)

`app/Services/MidtransService.php:644-656`: percobaan berhenti pada galat kedua (413,
`channel_inactive = false`), lalu `$failure` = 413 → pesan generik
`Gagal membuat pembayaran QRIS. Coba lagi.` (`:656`). `CHANNEL_INACTIVE_MESSAGE` (`:84`) hanya
dipakai bila kegagalan **terakhir** juga 402 (`:650`). Jadi pesan yang seharusnya berbunyi
"kanal QRIS belum aktif di akun penjual" tidak pernah sampai ke pemilik.

### F4 — Instruksi pemilik menyesatkan (dokumen, sudah diperbaiki di kartu ini)

`docs/langkah-pemilik.md` (versi sebelum kartu ini) langkah 3 menyuruh
`MIDTRANS_QRIS_ACQUIRER=other_qris` bila QRIS GoPay tidak aktif — mengikuti instruksi itu
justru menghasilkan 413 di F2. Bagian itu ditulis ulang hari ini (lihat §6).

## 3. Yang lulus / gagal / belum dicek

| Butir | Status |
|---|---|
| Perbaikan `t_2f443b75` jalur utama: `enabled_payments` tidak dikirim untuk `gopay` (`MidtransService.php:550-583`) | **Lulus** di tingkat kode + test |
| Perbaikan `t_2f443b75` terbukti berjalan di server pemilik | **Lulus** — log 10:37:51 memuat field baru |
| Percobaan cadangan `other_qris` | **Diperbaiki** — `t_56062a5c`; cadangan hanya `gopay`/`airpay shopee`, `QrisAcquirerFallbackTest` 7 passed |
| Pesan siap tampil saat kanal tidak aktif | **Diperbaiki** — `t_56062a5c`; 402 menang atas galat cadangan (mis. 413) |
| Kanal QRIS aktif di akun produksi | **Belum** — kewenangan pemilik (F1); gerbang `t_c9385bf0` |
| Charge QRIS nyata berhasil | **Belum dicek** — butuh akun/kredensial pemilik dan uang nyata |

## 4. Keputusan putaran ini

1. **Satu kartu perbaikan** (putaran 2 dari batas 2) untuk `backenddeveloper`:
   cadangan memakai acquirer yang sah (`gopay` ↔ `airpay shopee`), dan pesan 402 tetap terjaga
   bila cadangan gagal dengan galat lain. Rincian di body kartu.
2. **Satu gerbang pemilik** (`techlead`, parent = kartu perbaikan): aktifkan QRIS di dashboard
   Midtrans produksi, lalu uji **satu** checkout baru dan balas hasilnya. Gate memanggil
   `kanban_block` sampai pemilik menjawab.
3. **Bila setelah putaran 2 checkout masih gagal**, tidak ada kartu perbaikan ketiga: kartu ini
   akan diblok dengan ringkasan bukti + satu pertanyaan ke pemilik (sesuai batas putaran).

Catatan: `other_qris` sebagai **nilai config** (`MIDTRANS_QRIS_ACQUIRER`) tidak dihapus dari
kontrak karena itu nilai Snap lama; backend perlu memetakannya ke acquirer Core API yang sah
(`airpay shopee`) atau menolaknya dengan pesan jelas. Pilihan ada di kartu backend, bukan di sini.

## 5. Risiko

1. **Pendapatan berhenti total** selama kanal QRIS produksi belum aktif — semua checkout gagal
   sebelum QR dibuat. Ini risiko bisnis tertinggi saat ini.
2. **Aktivasi QRIS produksi butuh persetujuan Midtrans** (bisa lewat Activation Team), jadi
   perbaikan kode tidak menjamin checkout langsung berhasil.
3. Pesan galat baru (`CHANNEL_INACTIVE_MESSAGE`) menyebut "hubungi penjual" — pembeli tidak bisa
   berbuat apa pun; pastikan pemilik memantau laporan/WhatsApp selama masa aktivasi.
4. Selama menunggu, pemilik dapat membuktikan alur aplikasi lewat sandbox
   (`MIDTRANS_IS_PRODUCTION=false`) — perubahan `.env` milik pemilik, bukan agent.

## 6. Dokumen yang diperbarui

- `docs/review-4.md` — dokumen ini.
- `docs/langkah-pemilik.md` — bagian "QRIS 402" ditulis ulang: acquirer sah, larangan
  `other_qris`, langkah aktivasi dashboard, dan bukti yang diminta saat melapor.
- `docs/pertanyaan-pemilik.md` — baris **P16** (bukti 10:37 + yang diminta dari pemilik).
- `docs/catatan-techlead.md` — catatan ringkas putaran ini.

Kartu baru: lihat bagian "kartu" pada `kanban_complete` kartu `t_7471aa7e`.

## 7. Status setelah kartu `t_56062a5c` (22 Okt 2026)

- **Selesai:** `app/Services/MidtransService.php:77,89` — `QRIS_ACQUIRERS = gopay, airpay shopee`,
  alias `other_qris` dipetakan ke `airpay shopee`; `enabled_payments` tidak pernah dikirim
  (`:554,558`); `CHANNEL_INACTIVE_MESSAGE` (`:97`) tetap dipakai bila percobaan pertama 402.
  Verifikasi backend: `QrisAcquirerFallbackTest` 7 passed (56 assertion), suite penuh 265 passed.
- **Terbuka:** gerbang pemilik `t_c9385bf0` — aktivasi QRIS di dashboard produksi + **satu**
  checkout baru. Bukti yang diminta: jam kejadian, kode pesanan, teks QR/notice apa adanya.
- Gerbang **tidak** ditutup tanpa bukti layar pemilik. Bila masih gagal: blok + eskalasi, bukan
  kartu perbaikan ketiga (batas putaran 2 dari 2 sudah terpakai).
- Mode sandbox tetap tersedia sebagai bukti alur (`docs/langkah-pemilik.md` bagian G1); itu bukan
  bukti kanal produksi aktif.
