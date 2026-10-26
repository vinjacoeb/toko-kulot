# Catatan UIUX — Toko Kulot

Berkas kerja agent **uiux**. Diperbarui per kartu. Kartu aktif: **U7 — desain v1.3 data webhook
Biteship** (`t_92f89ef1`).

---

## U6 — Deviasi desain laporan pemilik putaran 2 (kartu `t_46901364`, 21 Okt 2026)

Sumber tugas: `docs/review-2.md` (kartu techlead `t_caaa8fa4`) butir 5 & 7 — `docs/review-2.md:82`
menetapkan **U6 `t_46901364` (catat deviasi desain) → F9 `t_e3f68f7f` (kode)**. Kartu ini menulis 4 deviasi
desain ke `docs/design.md` §11.3 dan baris riwayat 2.3; **tidak ada kode aplikasi yang diubah**.

Bukti: `docs/review-2.md` §2 butir 5 & 7 · keputusan + nama rute: kartu techlead `t_caaa8fa4` ·
kontrak §12.24 (`docs/kontrak-props.md:1412-1443`, backend kartu `t_c374a29b`) ·
kode: `resources/js/Components/Header.jsx:87-108`, `resources/js/Layouts/PublicLayout.jsx:84-94`,
`resources/js/Pages/Admin/Orders/Show.jsx:204-214`, `resources/js/Pages/Public/Auth/Login.jsx:98-102`, `Register.jsx:141-145`.

### Ringkasan yang ditulis ke design §11.3

| Baris | Isi | Dikerjakan kode di |
|---|---|---|
| **D13** | Tombol sekunder "Sinkronkan status pembayaran" + notice hasil di kartu "Bukti pembayaran" (§5.12) | kartu `t_8e89556f` (F8) |
| **D14** | Tautan teks "Daftar" di header desktop untuk **tamu** (§3.1), di samping ikon Masuk | kartu `t_e3f68f7f` (F9) |
| **D15** | Footer drawer tamu: "Daftar" (`primary`) di atas "Masuk" (`secondary`) (§3.1) | kartu `t_e3f68f7f` (F9) |
| **D16** | Tautan silang Masuk ↔ Daftar di `/login` & `/register` (§5.5) | kartu `t_e3f68f7f` (F9) |

Semua baris memakai **batas: tanpa komponen, token, warna, atau ukuran baru**. Setiap teks beku dipilih
dari pola yang sudah ada di halaman yang sama — tidak ada microcopy karangan.

### Keputusan U6-1 — D13: satu sumber hasil; tombol tidak `disabled` hanya karena "sudah lunas"

- Server (kontrak §12.24) memakai **key flash yang sudah ada** (`flash.success`/`flash.error`; `HandleInertiaRequests`
  hanya memuat dua key itu). Dipetakan apa adanya: pesan "Pembayaran sudah lunas, sinkronisasi tidak perlu
  dijalankan." (hasil `settlement`) datang sebagai **key `success`**, sedangkan dua prasyarat gagal
  (belum ada baris `payments`, mode uji) datang sebagai key `error`.
- Tombol `disabled` **hanya** saat `pesanan.payment` `null` (tidak ada tagihan = tidak ada yang bisa
  disinkronkan; §12.17). Untuk "sudah lunas" tombol tetap aktif dan jawabannya lewat flash: lebih ramah
  keyboard/screen-reader daripada tombol mati tanpa sebab terlihat, dan §4.0 mewajibkan setiap state
  `disabled` punya alasan tampak. Satu-satunya alternatif yang setara (menahan tombol + teks alasan statis)
  menambah microcopy baru dan menyalin logika status ke UI — ditolak.
- **Risiko duplikasi (diputuskan di sini).** `resources/js/Pages/Admin/Orders/Show.jsx:56-63` sudah mengubah
  `flash.success`/`flash.error` menjadi `Toast` §4.8 untuk semua aksi halaman ini. Bila `InlineNotice` di dalam
  kartu juga dirender untuk key yang sama, **satu pesan muncul dua kali**. Keputusan: hasil D13 dirender
  **satu kali** sebagai `InlineNotice` §4.23 di dalam kartu "Bukti pembayaran"; toast halaman di-*suppress*
  untuk aksi ini. Alasan: pesan menempel pada tombol yang ditekan, dan inilah jalur yang diminta kartu F8.
  Langkah F8 yang disarankan: berkas terpisah `resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx`
  yang memakai `useForm({}).patch(url, { preserveScroll: true, onSuccess, onError })` (pola sama dengan
  `partials/InfoResi.jsx`), notice dirender dari hasil form, dan toast halaman ditahan lewat penanda eksplisit
  dari sisi frontend untuk aksi ini.
- **Teks beku + state** ada di baris tabel D13 `docs/design.md:872`: label `Sinkronkan status pembayaran`,
  memproses `Memproses…` (`disabled`, lebar dikunci — pola `Button loading` §4.1), dan `role="alert"` untuk
  tone `error`.

### Keputusan U6-2 — D14/D15: "Daftar" adalah tambahan, bukan penggantian

- Penafsiran techlead (P6 `docs/pertanyaan-pemilik.md` §6) dipakai apa adanya: **hanya tamu** yang mendapat
  pintu Daftar; user yang sudah login tidak ditambahi tombol/menu.
- **Kelas tautan header = pola teks aksi §3.1** (`text-meta text-brand underline underline-offset-4`) — persis
  sama dengan tombol "Keluar" di header yang sama (`Header.jsx:95-100`), karena tautan ini duduk di **grup aksi**
  (deret ikon kanan), bukan di deret menu. Varian ber-`px-3.5 py-3` + hover `decoration-accent-500` (pola tombol
  menu §3.1 baris 199) **ditolak** untuk elemen ini: padding menu menggeser deret ikon kanan dan menambah target
  klik besar di area aksi. Komentar sumber F9 sempat memuat varian menu ini; keputusan akhir = varian aksi
  (tercatat di baris D14 `docs/design.md:873`).
- **Header desktop (§3.1):** `Link` teks, **hanya ≥ md** (`hidden … md:inline-flex`), tepat setelah ikon Masuk,
  **tanpa** padding; ikon `UserIcon` + `aria-label="Masuk"` tidak diubah. Komposisi ikon kanan tetap:
  Search, Cart, Masuk, lalu teks Daftar.
- **Drawer mobile (§3.1):** dua tautan bertumpuk `w-full justify-center` — `Daftar` = `btn-primary`
  (`accent-500` + `text-ink`, 10,11:1), `Masuk` = `btn-secondary` (`border-line` + `text-ink`); urutan Daftar
  di atas, jarak antar tombol lewat `flex flex-col gap-2`. **Tidak ada tombol yang dihapus** dari footer drawer.
- **Aturan yang tidak boleh hilang di F9:** tautan header **tidak** dirender untuk user login (mereka memakai
  nama + "Keluar") dan **tidak** dirender di header mobile (< md) — jalur mobile ditangani drawer; footer
  drawer untuk user login tetap `Masuk sebagai …` (`text-meta text-ink-soft`).

### Keputusan U6-3 — D16: tautan silang memakai pola halaman yang sama

- Baris `text-meta` di bawah form: `Belum punya akun? ` + tautan `Daftar` di `/login`; `Sudah punya akun? ` +
  tautan `Masuk` di `/register`. Kelas tautan `text-brand underline underline-offset-4` (pola "Lupa kata sandi?"
  di halaman yang sama).
- **Latar auth = putih** (`AuthLayout.jsx:37`), bukan `surface` → class meta tetap `slate-500` (4,76:1). Aturan
  v2.2 (`slate-600` untuk meta di atas latar non-putih) **tidak** berlaku di sini; jangan ikut mengganti class
  meta halaman auth.
- Ditempatkan **di luar** `<form>` (setelah `Button` submit) agar tidak ikut alur submit/implicit submit.

### Tabrakan penomoran nomor deviasi lintas kartu (ditemukan 21 Okt 2026, sudah beres)

- Saat kartu ini mulai, fitur D14/D15/D16 **sudah dikodekan lebih dulu** oleh kartu F9 `t_e3f68f7f`, dan seluruh
  komentar sumbernya menyebut **satu nomor yang sama, "deviasi D13", untuk tiga deviasi berbeda** (7 rujukan:
  `Header.jsx` 2, `PublicLayout.jsx` 1, `Login.jsx` 2, `Register.jsx` 2). Nomor D13 sesungguhnya milik tombol
  sinkron pembayaran (F8), jadi rujukan itu salah arah.
- **Status: sudah diperbaiki.** Per pukul 23.26 WIB seluruh 7 rujukan di kode sudah memakai nomor kanonik
  tabel §11.3: `Header.jsx` → **D14**, `PublicLayout.jsx` → **D15**, `Login.jsx` + `Register.jsx` → **D16**;
  `grep -rn "D13" resources/js/` **nol hasil** (D13 kini hanya ada di dokumen, untuk tombol sinkron).
- Perbaikannya murni **penomoran di komentar sumber** — tidak ada perilaku atau tampilan yang berubah, dan
  komentar sumber tidak dilihat pengguna. Tidak perlu tindakan lanjutan dari F8/F9 karena hal ini.

### Catatan keadaan berkas F9 saat kartu ini ditutup (kode aktif berubah, bukan ranah kartu dokumen)

- Direktori `resources/js/.../Header.jsx` dan `PublicLayout.jsx` berubah **beberapa kali dalam 15 menit terakhir**
  (22:50 → 23:22) saat kartu ini menulis; saya **tidak** menyentuh berkas mana pun di luar `docs/`.
- Karena itu, yang diverifikasi di sini adalah **kesesuaian nomor + niat desain** (teks beku, kelas, aturan
  render), bukan kelayakan rilis kode: verifikasi build (`npm run build`), responsif 360/768/1024/1280, keyboard,
  dan kontras akhir tetap milik F9 dan QA2.


### Asumsi pengujian & hal yang tetap terbuka

1. **A-MVP P6.** Penafsiran techlead dipakai: laporan #7 = pintu **Daftar untuk tamu**. Bila pemilik memaksudkan
   **menu dropdown profil** (U7 `docs/usulan.md` §U7 / P6), U7 tetap terbuka dan **tidak** dikerjakan kartu F9.
2. **U6 `docs/usulan.md`** (tombol paksa status Midtrans mode uji) ditunda techlead; sebagian sudah tertutup D13
   (mode uji → pesan, tanpa tombol tambahan). Sisa usulan U6 tetap tidak dikerjakan.
3. **Prosa §5.12** belum diubah — hanya tabel §11.3 + riwayat yang disentuh, jadi tidak ada nomor bagian bergeser.
   Rincian D13 dibaca lewat baris tabel (mekanisme deviasi yang sama dengan D9-D12).
4. **Tema visual (font/warna/gambar) belum pernah diverifikasi ulang** (§11.2) dan D16 menyentuh halaman auth
   putih — verifikasi kontras akhir ada di tangan QA2, bukan di kartu dokumen ini.

### Verifikasi yang dijalankan

- Patch `docs/design.md` lewat skrip berkas (bukan editor interaktif), lalu diperiksa:
  **4 baris baru** `D13`-`D16` (`docs/design.md:872-875`), masing-masing **4 sel** (`| D… | drift | bukti | status |`),
  **tanpa** `\r`, dan baris riwayat **2.3** masuk setelah 2.2 (`docs/design.md:17`).
- Perintah periksa ulang: `grep -n '^| D1[0-6] ' docs/design.md` dan `awk -F'|' 'NR>=872 && NR<=875 {print NF-2}'
  docs/design.md` (harus `4`), serta `grep -c $'\r' docs/design.md` (harus `0`).
- Rujukan silang di berkas ini diverifikasi baris demi baris: `docs/kontrak-props.md:1412` (= §12.24),
  `docs/design.md:872` (= baris D13), `docs/design.md:878` (= §11.4).
- **Tidak ada** `npm run build`, test, atau tangkapan layar di kartu ini karena nol kode aplikasi diubah.
  Butir matriks §6 yang belum dibuktikan (implementasi, responsif 360/768/1024/1280, keyboard, kontras akhir)
  menjadi lingkup F8/F9 + QA2.

### Serah terima

- **F9 `t_e3f68f7f`** (frontend) sudah punya teks beku + kelas + aturan dari D14/D15/D16 — kodenya sudah ada,
  yang kurang hanya **penomoran komentar** (lihat bagian tabrakan di atas).
  Berkas: `resources/js/Components/Header.jsx`, `resources/js/Layouts/PublicLayout.jsx`,
  `resources/js/Pages/Public/Auth/Login.jsx`, `resources/js/Pages/Public/Auth/Register.jsx`.
- **F8 `t_8e89556f`** memakai D13 + kontrak §12.24; tidak ada kebutuhan teks baru di luar yang tertulis.
- **Catatan untuk techlead (bukan penghalang):** kontrak §12.24 secara fisik tertulis di antara §12.19 dan
  §12.20 (`docs/kontrak-props.md:1412`), dan tabel status §12.23 (`:1480-1487`) belum punya baris untuk §12.24.
  Tidak mengubah perilaku mana pun; usul perbaikan urutan/status adalah pekerjaan dokumen techlead, bukan kartu ini.

---

## U7 — Desain v1.3 data webhook Biteship (kartu `t_92f89ef1`, 25 Okt 2026)

Sumber: `docs/brief-v1.3-uiux.md` + `docs/PRD-v1.3.md` §2.6. Keluaran: **`docs/design-v1.3.md`**
(§0 aturan, §1 detail admin, §2 daftar admin, §3 riwayat, §4 halaman selesai, §5 matriks 6 keadaan
× 4 tempat, §6 asumsi). **Nol berkas kode disentuh** — `git status` untuk `resources/`, `app/`,
`routes/` tidak berubah oleh kartu ini (perubahan `app/` yang terlihat milik kartu backend lain).

### Temuan yang perlu diketahui kartu lain

1. **Rute brief salah.** Brief §3 menulis `/akun/pesanan`; aplikasi hanya punya `/history`
   (`routes/web.php:84`, `HistoryController@index`). Desain memakai `/history`; **tidak** ada rute
   baru — rute `/akun/*` memang tidak pernah ada (design-v1.2 §6.2).
2. **Key v1.3 belum ada di kontrak.** `grep -nE 'shipping_updated_at|price_final|price_selisih|perlu_tindakan|webhook_terakhir' docs/kontrak-props.md`
   → **0 hasil**. Key baru mendarat lewat B2 `t_5a702574`; desain merujuk PRD §2.6 dan menetapkan
   perilaku "key absen = keadaan belum ada webhook", jadi F2 tidak menebak nama key.
3. **Badge `Mode uji` bertabrakan nada.** `Index.jsx:168` dan `Show.jsx:144` memakai
   `Badge tone="warning"` untuk `Mode uji`; badge baru `Perlu tindakan` juga warning dan bisa satu
   baris. Aturan desain: `Perlu tindakan` **selalu** membawa `AlertIcon` 14 px, `Mode uji` tidak
   diubah. Di detail, `Perlu tindakan` berupa `InlineNotice`, bukan badge → tidak ada tabrakan.
4. **`DataTable` tidak punya mode kartu 360 px.** Karena itu larangan kolom baru: badge + timestamp
   masuk sel **Kurir / Resi** (`Index.jsx:199-215`, sudah `flex flex-col gap-1`). Jebakan yang
   dicatat untuk F2: early-return `—` di `Index.jsx:199` harus tetap menghormati
   `shipping_perlu_tindakan`.
5. **`tindakan`/`perlu_tindakan` ikut terkirim ke pembeli** (PRD §2.6 bentuk pembeli hanya membuang
   `price_final`, `price_selisih`, `webhook_terakhir`). Desain memutuskan pembeli **tidak**
   merendernya — kalimatnya berorientasi admin (contoh di PRD memakai "ubah status"). QA: jangan
   tandai ini sebagai bug; jangan minta backend membuang key (DoD B2 menyebut bentuk pembeli apa
   adanya).
6. **Format waktu.** Contoh brief `24 Okt 2026 14.05` (tanpa koma) vs helper baku `formatDateTime`
   (`resources/js/lib/format.js:38`) yang menghasilkan koma. Desain memakai helper apa adanya.

### Asumsi

- Halaman bayar `CheckoutPay` tidak berubah (PRD §2.6 menegaskan); tidak ada key baru yang perlu
  dibaca di sana.
- Teks UI baru dibatasi empat kalimat beku (`Lihat payload webhook`, `Belum ada payload webhook.`,
  `Periksa status pengiriman pesanan ini.`, `Resi sedang disiapkan.`); sisanya copy existing
  (`Resi belum tersedia.` di `History.jsx:321`). Semua nilai contoh di dokumen berlabel `[CONTOH]`.

### Verifikasi yang dijalankan

- `wc -l -c docs/design-v1.3.md` — **148 baris / 9.523 bait** (target brief: maks 2 halaman, tabel padat).
- `grep -c 'CONTOH' docs/design-v1.3.md` — nilai contoh selalu berlabel.
- `git status --porcelain` — satu-satunya tambahan dari kartu ini: `docs/design-v1.3.md`.
- **Tidak ada** `npm run build`/test: nol kode aplikasi diubah (sama seperti U6).

### Serah terima

- **F2 frontend** memakai `docs/design-v1.3.md` §1–§4 (aturan render + copy beku). Bila props B2
  belum mendarat, semua tempat tampil sebagai keadaan "belum ada webhook" (§5) — tidak perlu
  menunggu, tapi jangan mengarang key.
- **QA** memakai §5 sebagai matriks uji: 6 keadaan (belum ada webhook, `picked`, `delivered`,
  retur/gagal, selisih ongkir, payload kosong) × 4 tempat.
