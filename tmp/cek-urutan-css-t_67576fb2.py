# Cek urutan kelas di CSS terkompilasi (kartu t_67576fb2).
# Override tone halaman pesan/ulasan mengandalkan urutan: kelas override harus MENANG
# atas kelas dasar StatusBadge bila specificity sama (tanpa tailwind-merge, lihat docs/catatan-frontend.md).
# Jalankan: python tmp/cek-urutan-css-t_67576fb2.py
import glob
import io
import os
import sys

files = sorted(glob.glob('public/build/assets/*.css'), key=os.path.getsize, reverse=True)
if not files:
    print('TIDAK ADA CSS terkompilasi — jalankan npm run build dulu')
    sys.exit(1)

path = files[0]
css = io.open(path, encoding='utf-8').read()
print(f'CSS: {path} ({len(css)} byte)')

KLAS = {
    'bg-slate-200/60': r'.bg-slate-200\/60',
    'bg-success/10': r'.bg-success\/10',
    'bg-warning/10': r'.bg-warning\/10',
    'bg-danger/10': r'.bg-danger\/10',
    'bg-brand/10': r'.bg-brand\/10',
    'bg-sale-500': r'.bg-sale-500{',
    'bg-accent-500': r'.bg-accent-500{',
    'text-slate-600': r'.text-slate-600{',
    'text-success-strong': r'.text-success-strong{',
    'text-warning-strong': r'.text-warning-strong{',
    'text-danger-strong': r'.text-danger-strong{',
    'text-ink': r'.text-ink{',
    'text-white': r'.text-white{',
}


def pos(sel):
    return css.find(sel)


gagal = 0
print('\n-- offset kelas --')
for nama, sel in KLAS.items():
    p = pos(sel)
    status = 'ADA' if p != -1 else 'TIDAK ADA'
    if p == -1:
        gagal += 1
    print(f'  {nama:<22} {status:<10} {p}')

print('\n-- urutan yang dipakai halaman (kelas belakangan menang) --')
PASANGAN = [
    ('text-success-strong', 'text-slate-600'),
    ('text-warning-strong', 'text-slate-600'),
    ('bg-success/10', 'bg-slate-200/60'),
    ('bg-warning/10', 'bg-slate-200/60'),
]
for menang, kalah in PASANGAN:
    a, b = pos(KLAS[menang]), pos(KLAS[kalah])
    if a == -1 or b == -1:
        gagal += 1
        print(f'  {menang} vs {kalah}: kelas tidak ditemukan')
        continue
    verdict = 'MENANG' if a > b else 'KALAH'
    if a <= b:
        gagal += 1
    print(f'  {menang} ({a}) vs {kalah} ({b}) -> {verdict}')

print('\n-- bentuk tint sale lama harus sudah tidak ada --')
for sel in (r'.bg-sale-500\/10', r'.text-sale-500{'):
    p = pos(sel)
    print(f'  {sel:<22} {"MASIH ADA" if p != -1 else "tidak ada"} {p if p != -1 else ""}')

print('\nHASIL:', 'GAGAL — periksa di atas' if gagal else 'semua kelas terkompilasi & urutan override aman')
sys.exit(1 if gagal else 0)
