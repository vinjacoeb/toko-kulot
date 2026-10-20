"""Cek bundel hasil build: identifier Kapital yang dipakai sebagai komponen JSX
(argumen pertama jsx/jsxs/createElement) tetapi tidak diimpor dan tidak didefinisikan
di chunk itu -> kandidat ReferenceError "X is not defined".

Jalankan dari root repo setelah `npm run build`:

    python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build
"""
import os
import re
import sys

ASSETS = sys.argv[1] if len(sys.argv) > 1 else 'public/build/assets'

DEF_PATTERNS = [
    re.compile(r'\bfunction\s+([A-Za-z_$][\w$]*)'),
    re.compile(r'\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)'),
    re.compile(r'\bclass\s+([A-Za-z_$][\w$]*)'),
]
JSX_USE = re.compile(r'\b(?:jsx|jsxs|createElement)\s*\(\s*([A-Z][A-Za-z0-9_$]*)')
IMPORT_BLOCK = re.compile(r'import\s*(?:\{([^}]*)\}|([A-Za-z_$][\w$]*))?\s*from\s*"([^"]+)"')

problems = []
files = sorted(f for f in os.listdir(ASSETS) if f.endswith('.js'))
for fn in files:
    src = open(os.path.join(ASSETS, fn), encoding='utf-8', errors='replace').read()

    imported = set()
    for m in IMPORT_BLOCK.finditer(src):
        if m.group(2):
            imported.add(m.group(2))
        if m.group(1):
            for part in m.group(1).split(','):
                part = part.strip()
                if not part:
                    continue
                alias = part.split(' as ')[-1].strip()
                if alias:
                    imported.add(alias)

    defined = set(imported)
    for pat in DEF_PATTERNS:
        defined.update(pat.findall(src))

    used = set(JSX_USE.findall(src))
    free = sorted(u for u in used if u not in defined)
    if free:
        problems.append((fn, sorted(imported), free))

print(f'chunk .js diperiksa: {len(files)}')
if not problems:
    print('OK: tidak ada identifier komponen JSX tanpa import/definisi di bundel.')
for fn, imported, free in problems:
    print(f'{fn} -> FREE: {", ".join(free)}  (import: {", ".join(imported)})')
