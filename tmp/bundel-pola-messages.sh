#!/usr/bin/env bash
# Bundel #11: pola halaman Messages (acuan), token z-index, ekor catatan frontend.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/pola-messages-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. Messages/Index.jsx dengan nomor baris"
nl -ba resources/js/Pages/Admin/Messages/Index.jsx >> "$OUT" 2>&1

sep "B. tailwind zIndex"
grep -n -A 25 'zIndex' tailwind.config.js >> "$OUT" 2>&1

sep "C. tailwind shadows/modal/badge util yang mungkin dipakai"
grep -n -E 'maxWidth|modal|toast|checkbox|accent' tailwind.config.js | sed -n '1,40p' >> "$OUT" 2>&1

sep "D. Pages/Admin isi"
ls -R resources/js/Pages/Admin >> "$OUT" 2>&1

sep "E. ekor docs/catatan-frontend.md"
tail -60 docs/catatan-frontend.md >> "$OUT" 2>&1

wc -c -l "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
