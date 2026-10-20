#!/usr/bin/env bash
# Bundel #10: komponen form + filter + status + pola impor halaman admin + stub saat ini.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks10-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. Field.jsx"
cat resources/js/Components/Field.jsx >> "$OUT" 2>&1
sep "B. Input.jsx"
cat resources/js/Components/Input.jsx >> "$OUT" 2>&1
sep "C. Select.jsx"
cat resources/js/Components/Select.jsx >> "$OUT" 2>&1
sep "D. Textarea.jsx"
cat resources/js/Components/Textarea.jsx >> "$OUT" 2>&1
sep "E. Button.jsx"
cat resources/js/Components/Button.jsx >> "$OUT" 2>&1

sep "F. SearchInput.jsx"
cat resources/js/Components/SearchInput.jsx >> "$OUT" 2>&1
sep "G. FilterPanel.jsx"
cat resources/js/Components/FilterPanel.jsx >> "$OUT" 2>&1
sep "H. StatusBadge.jsx"
cat resources/js/Components/StatusBadge.jsx >> "$OUT" 2>&1
sep "I. PageHeader.jsx"
cat resources/js/Components/PageHeader.jsx >> "$OUT" 2>&1
sep "J. EmptyState.jsx"
cat resources/js/Components/EmptyState.jsx >> "$OUT" 2>&1
sep "K. ErrorState.jsx"
cat resources/js/Components/ErrorState.jsx >> "$OUT" 2>&1

sep "L. format.js exports + hooks.js exports"
grep -n '^export' resources/js/lib/format.js resources/js/lib/hooks.js >> "$OUT" 2>&1

sep "M. impor Messages/Reviews/Settings + kategori/akun stub saat ini"
sed -n '1,40p' resources/js/Pages/Admin/Messages/Index.jsx >> "$OUT" 2>&1
echo '--- Reviews ---' >> "$OUT" 2>&1
sed -n '1,40p' resources/js/Pages/Admin/Reviews/Index.jsx >> "$OUT" 2>&1
echo '--- Settings ---' >> "$OUT" 2>&1
sed -n '1,40p' resources/js/Pages/Admin/Settings/Index.jsx >> "$OUT" 2>&1
echo '--- Stub Categories ---' >> "$OUT" 2>&1
cat resources/js/Pages/Admin/Categories/Index.jsx >> "$OUT" 2>&1
echo '--- Stub Accounts ---' >> "$OUT" 2>&1
cat resources/js/Pages/Admin/Accounts/Index.jsx >> "$OUT" 2>&1

wc -c -l "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
