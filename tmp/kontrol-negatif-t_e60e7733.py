"""Kontrol negatif kartu t_e60e7733: sabotase sementara lalu pulihkan.

Tujuan: membuktikan harness benar-benar menangkap hilangnya penanda mode uji
dan hilangnya ambang warna hitung mundur (bukan lulus palsu).

Jalankan dari root repo:
    python tmp/kontrol-negatif-t_e60e7733.py
"""
import hashlib
import pathlib
import subprocess
import sys

AKAR = pathlib.Path('.').resolve()
ESBUILD = AKAR / 'node_modules/@esbuild/win32-x64/esbuild.exe'
HARNESS = 'tmp/uji-ssr-midtrans-t_e60e7733.mjs'
BUNDEL = 'tmp/uji-ssr-midtrans-t_e60e7733.bundle.mjs'
STUB = './tmp/stub-inertia-t_321bf03c.mjs'

SASARAN = [
    (
        'A — penanda mode uji tidak lagi dirender',
        pathlib.Path('resources/js/lib/midtrans.js'),
        "const uji = mode === 'uji' || flag === true || flag === 'true' || flag === 1;",
        'const uji = false;',
        'C1',
    ),
    (
        'B — ambang warna hitung mundur dihapus',
        pathlib.Path('resources/js/Components/Countdown.jsx'),
        'const soon = !expired && ms <= 3 * 60 * 1000;',
        'const soon = false;',
        'B2',
    ),
]


def md5(path):
    return hashlib.md5(path.read_bytes()).hexdigest()


def bangun_dan_jalankan():
    build = subprocess.run(
        [str(ESBUILD), HARNESS, '--bundle', '--platform=node', '--format=esm', '--jsx=automatic',
         '--packages=external', f'--outfile={BUNDEL}', f'--alias:@inertiajs/react={STUB}'],
        capture_output=True, text=True,
    )
    if build.returncode != 0:
        return 2, '', build.stderr[-800:]
    jalan = subprocess.run(['node', BUNDEL], capture_output=True, text=True)

    return jalan.returncode, jalan.stdout, jalan.stderr


baris_laporan = []
gagal = 0
for nama, berkas, cari, ganti, uji_kunci in SASARAN:
    asli = berkas.read_text(encoding='utf-8')
    md5_awal = md5(berkas)
    jumlah = asli.count(cari)
    if jumlah != 1:
        print(f'BATAL {nama}: pola ditemukan {jumlah}x (harus 1)')
        gagal += 1
        continue

    berhasil_pulih = False
    try:
        berkas.write_text(asli.replace(cari, ganti), encoding='utf-8', newline='')
        kode, keluaran, galat = bangun_dan_jalankan()
        baris_gagal = [b for b in keluaran.splitlines() if b.startswith('[GAGAL]')]
        kena = any(uji_kunci in b for b in baris_gagal)
        status = 'OK' if (kode == 1 and kena) else 'TIDAK SEPERTI DIHARAPKAN'
        if status != 'OK':
            gagal += 1
        baris_laporan.append(
            f'{status} kontrol negatif {nama}: exit {kode}, {len(baris_gagal)} uji gagal'
            + (f', termasuk {uji_kunci}' if kena else f', TIDAK termasuk {uji_kunci}')
        )
        if baris_gagal:
            baris_laporan.append('    uji yang gagal: ' + '; '.join(b.replace('[GAGAL] ', '') for b in baris_gagal))
        if galat:
            baris_laporan.append(f'    stderr: {galat.strip()[:300]}')
    finally:
        berkas.write_bytes(bytes(asli, 'utf-8'))
        berhasil_pulih = md5(berkas) == md5_awal
        baris_laporan.append(
            f'    pulih: md5 {"sama" if berhasil_pulih else "BERBEDA"} ({md5_awal}), '
            f'pola sabotase tersisa {berkas.read_text(encoding="utf-8").count(ganti)}'
        )
    if not berhasil_pulih:
        gagal += 1

kode, keluaran, galat = bangun_dan_jalankan()
ringkas = [b for b in keluaran.splitlines() if b.startswith('Hasil:')]
baris_laporan.append(f'ulang setelah pulih: exit {kode}, {ringkas[0] if ringkas else keluaran.strip()[-200:]}')
if kode != 0:
    gagal += 1

teks = '\n'.join(baris_laporan)
print(teks)
tujuan = AKAR / 'docs' / 'bukti-frontend-t_e60e7733.txt'
MARKA = '\n\nKontrol negatif (sabotase sementara, pulih di tempat):\n'
isi = tujuan.read_text(encoding='utf-8')
dasar = isi.split(MARKA)[0].rstrip('\n')
tujuan.write_text(
    dasar + MARKA + '\n'.join(f'- {b}' for b in baris_laporan) + '\n',
    encoding='utf-8',
)
print(f'\ndiperbarui {tujuan}')
sys.exit(1 if gagal else 0)
