#!/usr/bin/env bash
# Bundel #8: PRD aturan akun/kategori, nav admin, scripts, tooling tmp.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks8-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. PRD: baris menyebut akun/kategori (dengan nomor)"
grep -n -i -E 'akun|kategori|diri sendiri|owner' docs/PRD.md | sed -n '1,120p' >> "$OUT" 2>&1

sep "B. PRD §9 heading + 40 baris setelahnya"
awk '/^#+.*9\./{print NR": "$0}' docs/PRD.md >> "$OUT" 2>&1
L=$(grep -n -E '^#+.*(9\.|Isi Wajib)' docs/PRD.md | head -3 | cut -d: -f1 | head -1)
if [ -n "${L:-}" ]; then sed -n "${L},$((L+60))p" docs/PRD.md >> "$OUT" 2>&1; fi

sep "C. AdminLayout ADMIN_NAV penuh"
sed -n '/ADMIN_NAV/,/];/p' resources/js/Layouts/AdminLayout.jsx >> "$OUT" 2>&1
grep -n 'export const ADMIN_NAV\|export default function AdminLayout\|nav =\|usePage\|item.disabled\|aria-disabled\|title=' resources/js/Layouts/AdminLayout.jsx | sed -n '1,40p' >> "$OUT" 2>&1

sep "D. package.json lengkap"
cat package.json >> "$OUT" 2>&1

sep "E. tooling tmp"
ls tmp/*.py tmp/*.mjs tmp/*.jsx 2>/dev/null | sed -n '1,80p' >> "$OUT" 2>&1

sep "F. build-admin-messages-check.mjs 1-80"
sed -n '1,80p' tmp/build-admin-messages-check.mjs >> "$OUT" 2>&1

sep "G. cek-tautan-admin-vs-rute.py 1-60"
sed -n '1,60p' tmp/cek-tautan-admin-vs-rute.py >> "$OUT" 2>&1

sep "H. icons.jsx exports"
grep -n 'export function\|export const' resources/js/Components/icons.jsx >> "$OUT" 2>&1

wc -c -l "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
