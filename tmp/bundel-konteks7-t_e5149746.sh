#!/usr/bin/env bash
# Bundel konteks #7: API komponen persis + pola halaman + rute kategori/akun.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks7-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

for c in DataTable Modal Pagination Toast FilterPanel SearchInput Field Input Select Textarea Button StatusBadge EmptyState PageHeader; do
  sep "Components/$c.jsx"
  if [ -f "resources/js/Components/$c.jsx" ]; then cat "resources/js/Components/$c.jsx" >> "$OUT"; else echo "(tidak ada)" >> "$OUT"; fi
done

sep "lib/format.js"
cat resources/js/lib/format.js >> "$OUT" 2>&1

sep "routes/admin.php 95-200"
sed -n '95,200p' routes/admin.php >> "$OUT" 2>&1

sep "Settings/Index.jsx 200-380 (ConfirmDialog)"
sed -n '200,380p' resources/js/Pages/Admin/Settings/Index.jsx >> "$OUT" 2>&1

sep "Messages/Index.jsx 1-260"
sed -n '1,260p' resources/js/Pages/Admin/Messages/Index.jsx >> "$OUT" 2>&1

sep "Messages/Index.jsx 261-560"
sed -n '261,560p' resources/js/Pages/Admin/Messages/Index.jsx >> "$OUT" 2>&1

sep "Reviews/Index.jsx 1-140 (pola filter+toast)"
sed -n '1,140p' resources/js/Pages/Admin/Reviews/Index.jsx >> "$OUT" 2>&1

wc -c -l "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
