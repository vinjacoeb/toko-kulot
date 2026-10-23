# Bangun docs/bukti-frontend-t_8e89556f.txt dari log mentah tmp/log-bukti-t_8e89556f/.
# Tidak mengubah berkas sumber; hanya membaca log + md5 berkas yang diuji.
import hashlib
import pathlib
import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOG = ROOT / "tmp" / "log-bukti-t_8e89556f"
OUT = ROOT / "docs" / "bukti-frontend-t_8e89556f.txt"

PARTIAL = ROOT / "resources" / "js" / "Pages" / "Admin" / "Orders" / "partials" / "SyncPaymentButton.jsx"
SHOW = ROOT / "resources" / "js" / "Pages" / "Admin" / "Orders" / "Show.jsx"


def md5(path):
    return hashlib.md5(path.read_bytes()).hexdigest()


def baca(nama):
    path = LOG / nama
    if not path.exists():
        return f"[log {nama} tidak ditemukan]"
    return path.read_text(encoding="utf-8", errors="replace").rstrip("\n")


md5_partial = md5(PARTIAL)
md5_show = md5(SHOW)
log_pulih = baca("03-pulih-label.txt") + baca("05-pulih-url.txt") + baca("07-pulih-suppress.txt")
cocok_partial = md5_partial in log_pulih
cocok_show = md5_show in log_pulih

BAGIAN = [
    ("A. Harness interaksi (14 uji) — hasil dasar", "01-aksi.txt"),
    ("B. Kontrol negatif 1: label beku dirusak sementara", "02-sabotase-label.txt"),
    ("C. Pemulihan kontrol negatif 1", "03-pulih-label.txt"),
    ("D. Kontrol negatif 2: URL kontrak dirusak sementara", "04-sabotase-url.txt"),
    ("E. Pemulihan kontrol negatif 2", "05-pulih-url.txt"),
    ("F. Kontrol negatif 3: logika suppress Toast dirusak sementara", "06-sabotase-suppress.txt"),
    ("G. Pemulihan kontrol negatif 3", "07-pulih-suppress.txt"),
    ("H. Harness interaksi dijalankan ulang setelah semua pemulihan", "08-pulih-uji.txt"),
    ("I. npm run build + jejak kelas/teks di bundel", "09-build.txt"),
    ("J. Regresi kartu F5 (modal ubah status + bukti pembayaran)", "10-regresi-f5.txt"),
    ("K. Sapu regresi impor komponen & identifier bebas di bundel", "11-sapu.txt"),
    ("L. Rute backend, kontrak §12.24, D13, U6-1", "12-rute-kontrak.txt"),
    ("M. Berkas tersentuh kartu ini (git status)", "13-git.txt"),
]

bagian = []
for judul, nama in BAGIAN:
    bagian.append(f"\n\n{'=' * 78}\n{judul}\n{'=' * 78}\n{baca(nama)}")


def potongan(path, awal, akhir, label):
    baris = path.read_text(encoding="utf-8").splitlines()
    akhir = min(akhir, len(baris))
    isi = "\n".join(f"{n:>4}| {baris[n - 1]}" for n in range(awal, akhir + 1))
    return f"\n\n--- {label} ({path.name}:{awal}-{akhir}) ---\n{isi}"


kode = (
    "\n\n" + "=" * 78
    + "\nN. Potongan kode + nomor baris (keadaan berkas saat dokumen ini dibuat)\n"
    + "=" * 78
    + potongan(PARTIAL, 1, 200, "partial baru: tombol + notice hasil")
    + potongan(SHOW, 57, 78, "state + efek suppress Toast halaman")
    + potongan(SHOW, 223, 236, 'kartu "Bukti pembayaran": render kondisional tombol')
)

header = f"""BUKTI FRONTEND — kartu t_8e89556f (F8)
Tombol "Sinkronkan status pembayaran" di /admin/pesanan/{{order}}

Tanggal kerja : {datetime.date.today().isoformat()}
Workspace     : {ROOT.as_posix()} (branch master; tanpa commit — R8, sama seperti kartu F1-F5b/F9)
Perintah ulang: bash tmp/jalankan-uji-t_8e89556f.sh
Harness       : tmp/uji-aksi-sinkron-t_8e89556f.mjs (esbuild + shim React + stub @inertiajs/react)

Berkas yang diuji dan md5 saat dokumen ini dibuat:
  resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx  {md5_partial}
  resources/js/Pages/Admin/Orders/Show.jsx                        {md5_show}
Kecocokan dengan md5 "setelah pulih" di log C/E/G:
  SyncPaymentButton.jsx: {'COCOK' if cocok_partial else 'BEDA'}
  Show.jsx            : {'COCOK' if cocok_show else 'BEDA'}

Acuan yang dipakai (bukan karangan):
  docs/kontrak-props.md baris 1412-1443  §12.24 PATCH /admin/pesanan/{{order}}/sinkron-pembayaran
  docs/design.md baris 872               §11.3 D13 (tombol sekunder + notice hasil, teks beku, state loading)
  docs/design.md                         §5.12 kartu "Bukti pembayaran", §4.1 Button, §4.23 InlineNotice,
                                         §4.8 Toast, §4.0 alasan state disabled harus terlihat
  docs/catatan-uiux.md baris 30          U6-1 (satu sumber hasil; toast halaman di-suppress)
  docs/brief-frontend.md                 item F8

Ringkasan hasil (angka diambil dari log di bawah, bukan diketik ulang):
  - Harness interaksi      : 14/14 OK, 0 gagal, exit 0 (bagian A); diulang 14/14 OK setelah pemulihan (bagian H)
  - Kontrol negatif        : 3 sabotase sementara masing-masing menggigit
                             (label 12/14, URL 12/14, suppress 13/14), lalu dipulihkan sampai md5 identik
  - Regresi kartu F5       : 26 uji, 0 gagal (bagian J)
  - Sapu impor/bundel      : hanya temuan lama yang sudah dinilai false positive (bagian K)
  - npm run build          : exit 0; CSS memuat .min-w-\\[16rem\\]{{min-width:16rem}} (bagian I)

Yang diperiksa harness (14 uji di bagian A):
  A1 satu tombol, label beku, varian secondary, lebar dikunci
  A2 klik -> PATCH URL literal §12.24, tanpa body, preserveScroll + preserveState
  A3 state memproses: label "Memproses...", disabled, aria-busy, kelas lebar tetap
  A4 klik ganda saat memproses tidak menembak dua kali
  A5 flash.error -> InlineNotice tone error + pesan server apa adanya
  A6 flash.success -> InlineNotice tone success
  A7 klik berikutnya menghapus notice lama sebelum jawaban baru
  A8 tanpa id pesanan tombol tidak dirender (tidak menembak URL tanpa id)
  A9 higiene teks: tanpa undefined/NaN/[CONTOH]/placeholder di semua state
  B1 Show merender tombol di dalam kartu "Bukti pembayaran" dengan pesanan.id
  B2 payment null/absen -> tombol tidak dirender (D13)
  B3 flash aksi lain tetap menjadi Toast halaman (suppress tidak bocor)
  B4 flash aksi sinkron di-suppress dari Toast setelah dilaporkan partial (U6-1)
  B5 integrasi Show -> klik -> URL kontrak -> pesan server tampil di kartu
"""

footer = """

================================================================================
BATAS BUKTI
================================================================================
- Harness berjalan di Node (esbuild + shim React + stub @inertiajs/react), tanpa browser dan tanpa
  pustaka uji baru. Yang diperiksa: markup elemen (type, label, disabled, aria-busy, kelas), urutan
  state, kontrak pemanggilan Inertia (URL/metode/opsi), dan logika suppress Toast halaman.
- Bukan bukti rendering CSS nyata, tata letak, fokus keyboard, atau kontras terukur.
- Bukan bukti integrasi ke server nyata: rute `admin.orders.sinkron-pembayaran` ada di
  `routes/admin.php:143-145` dan `Admin\\OrderController::syncPayment` ada di berkas backend
  (bagian L), tetapi klik nyata -> PATCH -> flash Midtrans belum dijalankan dari sini.

BELUM DIUJI (butuh browser + server yang dijalankan pemilik)
1. Tata letak 360/768/1024/1280 px pada kartu "Bukti pembayaran" setelah tombol ditambahkan.
2. Fokus keyboard (tombol dapat dijangkau Tab, Enter/Space memicu aksi), zoom 200%, kontras terukur.
3. Perilaku nyata: klik -> label berubah "Memproses..." sesaat -> notice muncul TEPAT SEKALI di kartu
   dan TIDAK muncul sebagai Toast di pojok kanan bawah.

Instruksi aman untuk pemilik (tanpa mengubah .env / database):
1. Jalankan server seperti biasa, masuk sebagai admin.
2. Buka /admin/pesanan/{id} untuk pesanan yang punya tagihan (punya baris payment).
   - Kartu "Bukti pembayaran" harus menampilkan tombol sekunder "Sinkronkan status pembayaran".
   - Klik: label berubah "Memproses..." dengan lebar tombol tidak melompat; hasil muncul satu kali
     sebagai notice di dalam kartu (hijau bila berhasil, merah bila ditolak server).
3. Buka pesanan tanpa tagihan (payment null): tombol TIDAK tampil, kartu hanya berisi pratinjau kosong.
4. Perkecil jendela ke 360 px: tombol tetap terbaca dan tidak memotong kartu.
"""

OUT.write_text(header + kode + "".join(bagian) + footer, encoding="utf-8", newline="\n")
print(f"ditulis: {OUT} ({OUT.stat().st_size} byte)")
print(f"md5 SyncPaymentButton.jsx = {md5_partial}")
print(f"md5 Show.jsx              = {md5_show}")
print(f"cocok dengan log pulih    = partial:{cocok_partial} show:{cocok_show}")
