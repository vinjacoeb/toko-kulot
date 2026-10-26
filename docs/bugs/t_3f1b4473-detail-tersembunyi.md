# Bug — /admin/pesanan "tidak ada tombol lihat detail"

Kartu: `t_3f1b4473` (techlead). Tanggal: 24 Okt 2026.

## 1. Status: TERKONFIRMASI (sebab = tersembunyi, bukan tidak ada)

Tombol Detail **ada** di kode dan di bundel, tetapi berada di kolom terakhir tabel
sembilan kolom di dalam wadah `overflow-auto` tanpa kolom lengket. Pada lebar laptop
biasa kolom itu berada di luar tepi kanan kartu, jadi pemilik melihat tabel yang
berakhir di "Status pesanan" — seolah tidak ada tombol detail.

## 2. Bukti

| Bukti | Letak |
|---|---|
| Kolom `aksi` merender `<Button variant="link" href={baris.url \|\| /admin/pesanan/{id}>Detail</Button>` | `resources/js/Pages/Admin/Orders/Index.jsx:251-264` (juga ada di `git show HEAD:...:203-213`) |
| Tabel dibungkus `max-h-[70vh] overflow-auto`, tidak ada `sticky` per kolom | `resources/js/Components/DataTable.jsx:88-92` |
| Tombol "Detail" ada di bundel terakhir | `public/build/assets/Index-Dm_ZYE-r.js` (build 24 Okt 19:51; kini build 23:11) |
| `public/hot` → Vite dev `http://[::1]:5173`, jadi pemilik memakai sumber terbaru, bukan bundel beku | `public/hot` |
| Desain: sel aksi tabel admin = `IconButton` 32×32 + tooltip, tanpa aturan lengket | `docs/design.md:335-337` |

Pengukuran lebar (metode: markup tabel identik kelasnya disuntik ke halaman publik
ber-CSS aplikasi, viewport 1262 px, lebar konten admin 1262 − `w-sidebar` 256 − padding 48 = 958 px):

```
wrapper 958px ; tabel 1191px ; lebih 233px
```

Artinya ±233 px tabel keluar dari kartu; kolom Aksi (±70 px + padding) seluruhnya di
luar pandangan. Di layar 1366 px selisihnya tetap ±190 px.

## 3. Keputusan techlead (bukan deviasi desain baru)

Kolom Aksi dibuat **lengket di kanan** (`sticky right-0`) sehingga tombol Detail selalu
terlihat tanpa menggulir horizontal. Alasan: tidak menghapus/ menggabung kolom desain,
tidak menambah komponen atau token, dan tetap benar di lebar berapa pun. Selama ini
tidak ada aturan desain soal kolom lengket, jadi ini keputusan implementasi tabel,
bukan tampilan baru.

## 4. Perbaikan

Kartu `t_3f1b4473` → anak: perbaikan (frontenddeveloper) + verifikasi (qatesting).
Batas: satu masalah = satu kartu perbaikan, maks 2 putaran.

## 5. Belum dicek

Halaman aslinya sebagai admin **belum dilihat langsung di browser** — panel admin butuh
kata sandi dan agent tidak mengetik kata sandi. Angka di §2 berasal dari pengukuran
markup setara, bukan tangkapan layar sesi admin. Verifikasi akhir = kartu QA.
