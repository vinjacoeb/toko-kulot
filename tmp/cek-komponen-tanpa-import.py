"""Cari pemakaian komponen JSX (tag Kapital) yang tidak punya import/definisi di resources/js.

Kelas bug: <PriceBlock> dipakai tanpa import -> ReferenceError saat runtime dan halaman blank
(kartu t_7cbe34dc). Jalankan dari root repo:

    python tmp/cek-komponen-tanpa-import.py C:/Users/LENOVO/Downloads/toko-kulot

Tempelan `App` di app.jsx adalah false positive: ia parameter destructuring
`setup({ el, App, props })`, bukan komponen tanpa import.
"""
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
SRC = os.path.join(ROOT, 'resources', 'js')

IMPORT_RE = re.compile(
    r'^import\s+(?:(?P<default>[A-Za-z_$][\w$]*)\s*(?:,\s*)?)?'
    r'(?:\{(?P<named>[^}]*)\})?\s*(?:\*\s+as\s+(?P<ns>[A-Za-z_$][\w$]*))?'
    r'\s*(?:from\s+)?[\'"][^\'"]+[\'"];?',
    re.M,
)
TAG_RE = re.compile(r'<([A-Z][A-Za-z0-9_$]*)(?=[\s/>])')
DEF_RE = re.compile(r'(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9_$]*)')
GLOBALS = {'React', 'Fragment'}

problems = []
checked = 0
for dirpath, _dirnames, filenames in os.walk(SRC):
    for fn in sorted(filenames):
        if not fn.endswith(('.jsx', '.js')):
            continue
        path = os.path.join(dirpath, fn)
        text = open(path, encoding='utf-8').read()
        checked += 1

        # buang komentar supaya contoh kode di dokumentasi tidak ikut terbaca
        code = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
        code = re.sub(r'^\s*//.*$', '', code, flags=re.M)

        imported = set()
        for m in IMPORT_RE.finditer(code):
            if m.group('default'):
                imported.add(m.group('default'))
            if m.group('ns'):
                imported.add(m.group('ns'))
            if m.group('named'):
                for part in m.group('named').split(','):
                    part = part.strip()
                    if not part:
                        continue
                    alias = part.split(' as ')[-1].strip()
                    if alias:
                        imported.add(alias)

        defined = set(DEF_RE.findall(code)) | imported | GLOBALS
        used = set(TAG_RE.findall(code))
        missing = sorted(u for u in used if u not in defined)
        if missing:
            problems.append((os.path.relpath(path, ROOT), missing))

print(f'file diperiksa: {checked}')
if not problems:
    print('OK: tidak ada komponen JSX tanpa import/definisi.')
for rel, missing in problems:
    print(f'{rel}: {", ".join(missing)}')
