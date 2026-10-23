## F2 — penanda mode uji (halaman bayar + tab Pembayaran admin) + hitung mundur ikut `pembayaran.expires_at` (kartu t_e60e7733, 21 Okt 2026)

Rencana (ringkas):
1. Baca ulang kontrak §7.5/§7.7/§10.7 (bentuk baku `midtrans`), design §4.4/§4.21/§4.23/§5.8/§5.13 + baris deviasi D9–D11 (§11.3), `docs/review.md` F-2.
2. Helper kecil `resources/js/lib/midtrans.js` (`midtransMode`) — normalisasi prop `midtrans` di satu tempat, dipakai dua pemakai.
3. `QrisPanel`: prop `midtrans`; notice `InlineNotice` `warning` "Mode uji" + `alasan` + `langkah_perbaikan` di atas QR; hitung mundur juga tampil pada state `error` (design §4.4).
4. `Countdown`: normal `text-ink-soft`, < 3 menit `text-danger` + `animate-pulse` (+ `motion-reduce:animate-none`), format MM:SS `font-mono text-meta` (design §4.21/D10).
5. `CheckoutPay`: terima prop `midtrans` dan teruskan ke `QrisPanel`.
6. `Admin/Settings/Index.jsx`: terima prop `midtrans`; kartu "Midtrans" dapat baris status (`StatusBadge`) + notice mode uji; dua hint kolom catatan diperjelas (D11).
7. Verifikasi: harness SSR (matriks mode × state), sapu kotor, `npm run build`, sapu regresi impor/bundel; bukti di `docs/bukti-frontend-t_e60e7733.txt`.

Validasi tiga arah (sebelum coding):
- Kartu/PRD vs desain: D9 (`docs/design.md:865`) sudah punya baris deviasi untuk penanda "Mode uji" — komponen yang diizinkan hanya `InlineNotice` `warning`/`error` (§4.23) dan/atau `StatusBadge` tone `warning` (§4.21), tanpa token/kelas/warna baru, dan **tidak dirender saat `fake=false`**. D10: hitung mundur 5 menit = amendemen durasi saja, bentuk `Countdown` §4.21 tidak berubah. D11: kolom `midtrans_client_key`/`midtrans_is_production` dipertahankan sebagai **catatan** sampai keputusan pemilik (`docs/pertanyaan-pemilik.md` §5 P3). Tidak ada kebutuhan kartu yang tak berlatar desain.
- Desain vs kontrak: props yang dipakai persis bentuk baku §7.5/§7.7/§10.7 (`fake`, `mode`, `alasan`, `langkah_perbaikan`, `catatan`, `sumber_kredensial`; `alasan`/`langkah_perbaikan` `null`/`[]` saat mode `asli`). Nilai dikirim server (`MidtransService::modeInfo()`, dipanggil `CheckoutController.php:58,112` dan `Admin/SettingController.php:49`) — tidak ada kontrak alternatif. `pembayaran.expires_at` (§7.7) sudah dikirim dan sudah dipakai `Countdown`; tidak ada field baru.
- Kelayakan teknis: halaman `Public/CheckoutPay` dan `Admin/Settings/Index` sudah ada dan dirutekan; komponen yang dipakai ulang (`InlineNotice`, `StatusBadge`, `Countdown`, `Field`, `SectionCard` lokal) semua sudah ada; tanpa paket, rute, state library, atau token baru. Titik sisip di `Admin/Settings/Index.jsx` = `renderPembayaran()` (`:1992`) di dalam `SectionCard title="Midtrans"` (`:2013`); tab awal ditentukan query `?tab=` (`:96-98`), jadi harness SSR cukup menyuntik `window.location.search`.

Temuan awal (dasar keputusan):
- Sebelum perubahan, `grep -n midtrans resources/js/Pages/Public/CheckoutPay.jsx resources/js/Components/QrisPanel.jsx` → 0 hasil: prop `midtrans` sudah dikirim server tetapi tidak pernah dipakai UI, sehingga pemilik/pembeli tidak bisa membedakan QR uji dari QR nyata (inti F-2).
- `Countdown` (§4.21) sebelumnya selalu `text-ink`, tidak pernah `text-danger`/`animate-pulse`; ambang < 3 menit belum ada — deviasi desain yang ditutup kartu ini (D10 menegaskan ambang tetap sah pada durasi 5 menit).
- `QrisPanel` sebelumnya hanya merender hitung mundur saat `status === 'pending'`; design §4.4 menuntut hitung mundur **tetap jalan** pada state `error`. Perbaikan kecil ikut kartu ini (satu kondisi) supaya hitung mundur konsisten §4.4/§5.8.
- Hint kolom `midtrans_client_key` berbunyi "Client key hanya dipakai untuk memuat halaman pembayaran." — menyesatkan (nilainya tidak dibaca jalur bayar, D11). Diganti kalimat catatan; label kolom **tidak** diubah karena penyempurnaan/penghapusan label menunggu keputusan pemilik P3 (kartu uiux lanjutan).
- Keputusan tampilan mode `asli` di tab admin: badge netral "Mode asli" (status mode efektif wajib terlihat, §10.7) — yang **tidak** dirender saat `fake=false` adalah penanda mode uji (`InlineNotice`/badge `warning`), sesuai batas D9. Diputuskan di sini karena D9 melarang penanda peringatan, bukan baris status mode.
- Penanda sengaja hanya di dalam `QrisPanel` cabang QR (state `pending`/`checking`/`error`), bukan di panel `paid`/`expired`: pada dua state itu QR sudah tidak ditampilkan lagi, sehingga penanda mode uji hanya jadi derau. Pembeli melihat penanda tepat di atas kode QR.
