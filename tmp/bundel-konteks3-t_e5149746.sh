#!/usr/bin/env bash
# Bundel konteks #3 untuk kartu t_e5149746.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks3-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. design.md level-2/3 headings"
grep -n '^## \|^### ' docs/design.md >> "$OUT" 2>&1

sep "B. design 235-480"
sed -n '235,480p' docs/design.md >> "$OUT" 2>&1

sep "C. Settings/Index.jsx 211-360"
sed -n '211,360p' resources/js/Pages/Admin/Settings/Index.jsx >> "$OUT" 2>&1

sep "D. Messages/Index.jsx 121-380"
sed -n '121,380p' resources/js/Pages/Admin/Messages/Index.jsx >> "$OUT" 2>&1

sep "E. Modal.jsx"
cat resources/js/Components/Modal.jsx >> "$OUT" 2>&1

sep "F. DataTable.jsx"
cat resources/js/Components/DataTable.jsx >> "$OUT" 2>&1

sep "G. Field.jsx + Input.jsx"
cat resources/js/Components/Field.jsx >> "$OUT" 2>&1
printf '\n--- Input ---\n' >> "$OUT"
cat resources/js/Components/Input.jsx >> "$OUT" 2>&1

wc -c "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
