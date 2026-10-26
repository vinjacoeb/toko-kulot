# Brief DevOps — v1.3 (akses tunnel & build aset)

Baca `docs/PRD-v1.3.md` §3 dan §4. Kartu D0 hanya jalan setelah kartu B0 (trust proxy) selesai.

## Yang dikerjakan

1. Hentikan `npm run dev` bila berjalan; hapus `public/hot` (berkas penanda Vite dev, bukan
   berkas sumber — jangan di-commit).
2. `npm run build`; pastikan `public/build/manifest.json` segar.
3. Verifikasi lewat tunnel ngrok yang aktif:
   `curl -s https://<tunnel>/ | grep -o 'src="[^"]*"'` → semua `/build/assets/...` tanpa host;
   favicon `https://`; tidak ada `[::1]:5173` di HTML.
4. Bila tunnel mati, jalankan ulang dan catat URL barunya di `docs/catatan-devops.md`
   (URL gratis berubah; jangan menulis token).
5. Tambahkan `BITESHIP_WEBHOOK_TOKEN=` (kosong, dengan komentar singkat) ke `.env.example`;
   jangan menyentuh `.env`.
6. Tulis langkah pemilik (PRD §4) ke `docs/catatan-devops.md`: URL webhook + tiga event +
   `php artisan migrate`, tanpa nilai token.

## Batasan

- Jangan mengubah kode aplikasi; `bootstrap/app.php` milik kartu B0.
- Jangan mencetak/menyalin isi `.env`; jangan menjalankan migrasi.
- Jangan menyalakan server permanen; `npm run build` dan `curl` boleh.

## Definition of Done

- HTML dari tunnel memakai `/build/assets/...`, halaman toko tampil (bukan kosong), tidak ada
  URL `[::1]:5173`.
- `docs/catatan-devops.md` memuat URL tunnel terkini, hasil verifikasi (perintah + keluaran
  ringkas), dan langkah pemilik.
- `.env.example` memuat nama variabel token tanpa nilai.

Block hanya bila tunnel tidak bisa dijalankan (butuh akun/izin pemilik) atau port aplikasi
tidak diketahui; sertakan satu kalimat + bukti.
