"""Bangun docs/bukti-frontend-t_d1028202.txt dari log mentah tmp/log-bukti-t_d1028202/.

Tujuan: berkas bukti hanya berisi keluaran nyata perintah (tidak ada salinan tangan).
Jalankan: python tmp/bangun-bukti-t_d1028202.py
"""
import glob
import os

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG = os.path.join(AKAR, "tmp", "log-bukti-t_d1028202")
TUJUAN = os.path.join(AKAR, "docs", "bukti-frontend-t_d1028202.txt")

KEPALA = """BUKTI FRONTEND — kartu t_d1028202 (F5b: isian nomor resi aktif di /admin/pesanan/{order})
Tanggal kerja: 21 Okt 2026 (UTC+7). Workspace: C:\\Users\\LENOVO\\Downloads\\toko-kulot (dir)
Lingkup: 2 berkas kode diubah (resources/js/Pages/Admin/Orders/partials/InfoResi.jsx,
resources/js/Pages/Admin/Orders/Show.jsx) + dokumen kerja (docs/catatan-frontend.md, berkas ini).
Tidak ada berkas backend, rute, migrasi, seeder, .env, package.json, tailwind.config.js,
resources/js/Components/**, resources/views/**, atau dokumen acuan yang disentuh oleh kartu ini.
Skrip pengumpul bukti: tmp/jalankan-uji-t_d1028202.sh (menulis tmp/log-bukti-t_d1028202/*.txt);
berkas ini dibangun dari log tersebut lewat tmp/bangun-bukti-t_d1028202.py — jadi semua keluaran
di bawah adalah salinan apa adanya, bukan tulis tangan.

Ringkas hasil (semua dijalankan pada 21 Okt 2026):
  A. Harness SSR/statik tmp/uji-ssr-resi-t_d1028202.mjs ................ exit 0, 11/11 lulus
  B. Harness interaksi tmp/uji-aksi-resi-t_d1028202.mjs ................ exit 0, 7/7 lulus
  C. Kontrol negatif A (label beku dirusak) ........................... exit 1, 9/11 (R1, R9 gagal)
  D. Kontrol negatif B (URL simpan dirusak) ........................... exit 1, 3/7 (B1-B4 gagal)
  E. Ulang setelah dipulihkan ......................................... SSR exit 0, AKSI exit 0
  F. Regresi harness kartu F5 (S6 & H7 diperbarui) .................... exit 0, 26 uji / 0 gagal
  G. npm run build ..................................................... exit 0 ("✓ built in 14.07s")
  L. Kode kartu ini ada di bundel rilis public/build/assets/InfoResi-DX6_iCnZ.js
Kode komponen tidak diubah di resources/js/Components/**; label "Memproses…" disediakan
Button.jsx:51 (design §4.1) dan kartu ini hanya mengirim prop `loading`.
"""

URUTAN = [
    ("1) Berkas yang diubah & fakta kode", "15-berkas.txt"),
    ("2) Harness SSR/statik (kasus positif)", "01-ssr.txt"),
    ("3) Harness interaksi (kontrak pemanggilan router)", "02-aksi.txt"),
    ("4) Kontrol negatif A — label beku dirusak sementara", "03-ssr-sabotase.txt"),
    ("5) Pemulihan setelah kontrol negatif A", "04-pulih.txt"),
    ("6) Kontrol negatif B — URL simpan dirusak sementara", "05-aksi-sabotase.txt"),
    ("7) Pemulihan setelah kontrol negatif B", "06-pulih.txt"),
    ("8) Uji ulang setelah pemulihan", "07-pulih-uji.txt"),
    ("9) Regresi harness kartu F5 (uji S6 & H7 diperbarui oleh kartu ini)", "08-f5.txt"),
    ("10) npm run build", "09-build.txt"),
    ("11) Bukti kode masuk bundel rilis", "14-bundel.txt"),
    ("12) Rute & kontrak backend yang dipakai (tanpa endpoint karangan)", "10-rute.txt"),
    ("13) Teks beku D12 / keputusan A15 vs implementasi", "11-teks-beku.txt"),
    ("14) Sapu regresi impor komponen & bundel", "12-sapu.txt"),
    ("15) git status berkas yang disentuh kartu ini", "13-git.txt"),
    ("16) Bukti berkas lain (Components/kontrak/design) bukan keluaran kartu ini", "16-berkas-lain.txt"),
]


def indent(teks):
    baris = teks.replace("\r\n", "\n").split("\n")
    return [("   " + b) if b.strip() else "" for b in baris]


def main():
    bagian = [KEPALA.rstrip("\n"), ""]

    for judul, nama in URUTAN:
        jalur = os.path.join(LOG, nama)
        bagian.append("=" * 78)
        bagian.append(judul)
        bagian.append("=" * 78)
        if os.path.exists(jalur):
            with open(jalur, encoding="utf-8", errors="replace") as fh:
                bagian.extend(indent(fh.read().rstrip("\n")))
        else:
            bagian.append("   [log %s tidak ada]" % nama)
        bagian.append("")

    # Daftar perintah yang dijalankan (dari skrip pengumpul) — diringkas apa adanya.
    bagian.append("=" * 78)
    bagian.append("17) Perintah yang dijalankan (keluaran mentah ada di tmp/log-bukti-t_d1028202/)")
    bagian.append("=" * 78)
    for baris in [
        "$ bash tmp/jalankan-uji-t_d1028202.sh          # pengumpul seluruh bukti di bawah",
        "$ ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-ssr-resi-t_d1028202.mjs --bundle \\",
        "    --platform=node --format=esm --jsx=automatic --packages=external \\",
        "    --outfile=tmp/uji-ssr-resi-t_d1028202.bundle.mjs \\",
        "    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs",
        "$ node tmp/uji-ssr-resi-t_d1028202.bundle.mjs",
        "$ ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-aksi-resi-t_d1028202.mjs --bundle \\",
        "    --platform=node --format=esm --jsx=automatic --packages=external \\",
        "    --outfile=tmp/uji-aksi-resi-t_d1028202.bundle.mjs \\",
        "    --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \\",
        "    --alias:react=./tmp/shim-react-t_321bf03c.mjs \\",
        "    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs",
        "$ node tmp/uji-aksi-resi-t_d1028202.bundle.mjs",
        "$ npm run build",
        "$ python tmp/cek-komponen-tanpa-import.py .",
        "$ python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build",
    ]:
        bagian.append("   " + baris)
    bagian.append("")
    bagian.append("=" * 78)
    bagian.append("18) Yang belum diuji (butuh browser / sesi admin nyata)")
    bagian.append("=" * 78)
    for baris in [
        "- Tata letak nyata 360/768/1024/1280 px, urutan tab & fokus keyboard, zoom 200%,",
        "  kontras terukur di layar pada kartu \"Pengiriman\".",
        "- Kiriman resi end-to-end dari UI ke DB (butuh sesi admin + CSRF + migrasi kolom",
        "  `orders.tracking_number` yang masih Pending menurut docs/langkah-pemilik.md).",
        "  Harness membuktikan kontrak pemanggilan (URL, payload, preserveScroll) dan tampilan;",
        "  bukan integrasi server.",
        "- Bundel rilis di atas dibangun 19:0x saat kartu frontend lain (F2 t_e60e7733) juga",
        "  menulis resources/js/Components/**; build bersih terakhir sebaiknya diulang setelah",
        "  semua penulis berhenti.",
    ]:
        bagian.append("   " + baris)
    bagian.append("")

    teks = "\n".join(bagian).replace("\n", "\r\n")
    with open(TUJUAN, "w", encoding="utf-8", newline="") as fh:
        fh.write(teks)

    print("ditulis:", TUJUAN)
    print("baris:", teks.count("\r\n"))
    print("byte:", len(teks.encode("utf-8")))


if __name__ == "__main__":
    main()
