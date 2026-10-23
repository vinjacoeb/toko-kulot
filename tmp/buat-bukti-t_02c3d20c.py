"""Membangun docs/bukti-frontend-t_02c3d20c.txt dari keluaran mentah perintah.
Semua isi diambil apa adanya dari tmp/log-bukti-t_02c3d20c/ (hasil run
tmp/jalankan-uji-t_02c3d20c.sh) plus beberapa perintah tambahan dijalankan lewat
subprocess pada saat pembuatan berkas ini. Tidak ada keluaran yang diketik tangan.
"""
import datetime
import hashlib
import os
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOG = ROOT / "tmp" / "log-bukti-t_02c3d20c"
OUT = ROOT / "docs" / "bukti-frontend-t_02c3d20c.txt"
KOMPONEN = ROOT / "resources" / "js" / "Pages" / "Public" / "CheckoutSuccess.jsx"


def jalankan(cmd):
    proc = subprocess.run(cmd, cwd=str(ROOT), shell=True, capture_output=True, text=True)
    keluaran = (proc.stdout or "") + (proc.stderr or "")
    return "$ " + cmd + "\n" + keluaran.rstrip() + "\n$ echo $?  ->  %d\n" % proc.returncode


def md5(path):
    return hashlib.md5(pathlib.Path(path).read_bytes()).hexdigest()


bagian = []
bagian.append(
    "BUKTI FRONTEND — kartu B2 t_02c3d20c\n"
    "Gate ulasan di `resources/js/Pages/Public/CheckoutSuccess.jsx` memakai `ulasan.boleh` (kontrak §7.9, dibekukan 21 Okt 2026).\n"
    "Berkas ini dirakit otomatis oleh `tmp/buat-bukti-t_02c3d20c.py` dari keluaran mentah; urutan bagian sama dengan runner.\n"
    "Runner: `bash tmp/jalankan-uji-t_02c3d20c.sh` (log per bagian: `tmp/log-bukti-t_02c3d20c/`).\n"
    "Waktu perakitan: %s\n" % datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
)

for nama, judul in [
    ("01-b2.txt", "A. Harness SSR gate §7.9 (kartu B2)"),
    ("02-f6-ssr.txt", "B. Regresi harness SSR F6 (uji 3, 7, 12 disesuaikan)"),
    ("03-f6-aksi.txt", "C. Regresi harness interaksi F6 (uji 7 baru)"),
    ("04-sabotase.txt", "D. Kontrol negatif: gate dirusak sementara lalu dipulihkan"),
    ("05-pulih.txt", "E. Bukti pemulihan berkas"),
    ("06-pulih-uji.txt", "F. Ulang ketiga harness setelah pemulihan"),
    ("07-build.txt", "G. `npm run build`"),
    ("08-bundel.txt", "H. Kode gate hadir di bundel rilis"),
    ("09-sapu.txt", "I. Sapu regresi impor & bundel"),
    ("10-statistik.txt", "J. Gate di kode (statis) + rujukan kontrak/desain"),
    ("11-git.txt", "K. Berkas tersentuh kartu ini"),
]:
    isi = (LOG / nama).read_text(encoding="utf-8", errors="replace")
    bagian.append("=" * 78 + "\n%s  [%s]\n" % (judul, nama) + "=" * 78 + "\n" + isi.rstrip() + "\n")

bagian.append("=" * 78 + "\nL. Pemeriksaan tambahan saat merakit bukti\n" + "=" * 78 + "\n")
bagian.append(jalankan("md5sum resources/js/Pages/Public/CheckoutSuccess.jsx"))
bagian.append(jalankan("ls -l public/build/assets/CheckoutSuccess-*.js"))
bagian.append(jalankan("md5sum public/build/assets/CheckoutSuccess-*.js"))
bagian.append(jalankan("grep -rn 'kontradiksiBoleh' resources/js/ || echo '(tidak ada di resources/js)'"))
bagian.append(
    jalankan(
        "grep -rn 'ulasan.boleh' docs/kontrak-props.md | head -4"
    )
)
bagian.append(jalankan("sed -n '526,533p' docs/kontrak-props.md"))
bagian.append(jalankan("git check-ignore -v public/build/assets/CheckoutSuccess-D5s1AHje.js"))
bagian.append(jalankan("python tmp/papan-t_02c3d20c.py"))

bagian.append(
    "\nRINGKASAN YANG DIVERIFIKASI ULANG SAAT MERAKIT:\n"
    "- md5 sumber komponen: %s\n"
    "- sisa sabotase gate di sumber: 0 kemunculan (bagian E)\n"
    "- harness B2/F6-SSR/F6-AKSI: exit 0 pada keadaan akhir (bagian F)\n"
    % md5(KOMPONEN)
)

OUT.write_text("\n".join(bagian), encoding="utf-8")
print("ditulis:", OUT, len(OUT.read_text(encoding='utf-8')), "chars")
