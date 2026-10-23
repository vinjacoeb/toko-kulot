# Verifikasi kartu F2 (t_e60e7733)

Harness `tmp/uji-ssr-midtrans-t_e60e7733.mjs` (SSR/statik) → exit 0, **36/36 lulus**:

- A1–A6 `lib/midtrans.js` `midtransMode()`: mode uji lengkap; mode asli menihilkan `alasan`/`langkah`; `fake` string; prop `null`/bukan objek aman; `alasan` berisi spasi → `null`; `diketahui` hanya bila server menyebut mode.
- B1–B6 `Countdown`: 5 menit normal; < 3 menit `text-danger` + `animate-pulse` + `motion-reduce:animate-none`; lewat → `Kedaluwarsa`; `sr-only` memuat sisa waktu; `null`/tak sah → tidak dirender.
- C1–C12 `QrisPanel`: penanda "Mode uji" + `alasan` + daftar bernomor `langkah_perbaikan` (label "Langkah perbaikan untuk pemilik:") di atas QR; mode asli bersih; tanpa prop aman; state `error`/`checking`; `paid`/`expired` tanpa penanda; `alasan` hilang → kalimat cadangan; angka kosong → `-`; langkah kosong/tak sah → tanpa daftar; `galat` tampil apa adanya & ter-escape; `galat` kosong → tanpa notice.
- D1–D5 `CheckoutPay`: `midtrans` & `pembayaran.galat` diteruskan; tanpa prop aman; mode asli bersih; `galat` null → tanpa notice.
- E1–E6 tab Pembayaran admin: badge + `alasan` + langkah + `sumber_kredensial` + `catatan`; mode asli netral; hint tidak menyesatkan (D11); tanpa prop / mode tak dikenal → 0 klaim mode; tab lain bersih.

Sapu penanda kotor (`undefined`, `NaN`, `[object Object]`, `lorem ipsum`, `TODO:`, `FIXME`) → 0 temuan pada seluruh markup yang diuji.
Kontrol negatif `tmp/kontrol-negatif-t_e60e7733.py` → sabotase sementara pada penanda mode uji & ambang hitung mundur membuat uji kunci GAGAL; sumber dipulihkan + md5 identik.
Keluaran mentah: `docs/bukti-frontend-t_e60e7733.txt` (log harness 36/36).
