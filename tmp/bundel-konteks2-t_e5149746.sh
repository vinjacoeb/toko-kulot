#!/usr/bin/env bash
# Bundel konteks #2 untuk kartu t_e5149746: teks desain + kontrak props komponen.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks2-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. design 235-450 (inventaris komponen 4.0-4.31)"
sed -n '235,450p' docs/design.md >> "$OUT" 2>&1

sep "B. design 450-460 + 628-645 (5.12/5.13) + 699-730 (aturan impl)"
sed -n '450,460p' docs/design.md >> "$OUT" 2>&1
printf '\n--- 5.12/5.13 ---\n' >> "$OUT"
sed -n '628,645p' docs/design.md >> "$OUT" 2>&1
printf '\n--- aturan implementasi ---\n' >> "$OUT"
sed -n '699,730p' docs/design.md >> "$OUT" 2>&1

sep "C. Settings/Index.jsx 211-360 (Thumb/ImageField/ConfirmDialog)"
sed -n '211,360p' resources/js/Pages/Admin/Settings/Index.jsx >> "$OUT" 2>&1

sep "D. Messages/Index.jsx 121-380 (pola halaman daftar)"
sed -n '121,380p' resources/js/Pages/Admin/Messages/Index.jsx >> "$OUT" 2>&1

sep "E. Components/Modal.jsx"
cat resources/js/Components/Modal.jsx >> "$OUT" 2>&1

sep "F. Components/DataTable.jsx"
cat resources/js/Components/DataTable.jsx >> "$OUT" 2>&1

sep "G. Field/Input/Select/Textarea/Button"
cat resources/js/Components/Field.jsx >> "$OUT" 2>&1
printf '\n--- Input ---\n' >> "$OUT"
cat resources/js/Components/Input.jsx >> "$OUT" 2>&1
printf '\n--- Select ---\n' >> "$OUT"
cat resources/js/Components/Select.jsx >> "$OUT" 2>&1
printf '\n--- Textarea ---\n' >> "$OUT"
cat resources/js/Components/Textarea.jsx >> "$OUT" 2>&1
printf '\n--- Button ---\n' >> "$OUT"
cat resources/js/Components/Button.jsx >> "$OUT" 2>&1

sep "H. Pagination/SearchInput/Toast/PageHeader"
cat resources/js/Components/Pagination.jsx >> "$OUT" 2>&1
printf '\n--- SearchInput ---\n' >> "$OUT"
cat resources/js/Components/SearchInput.jsx >> "$OUT" 2>&1
printf '\n--- Toast ---\n' >> "$OUT"
cat resources/js/Components/Toast.jsx >> "$OUT" 2>&1
printf '\n--- PageHeader ---\n' >> "$OUT"
cat resources/js/Components/PageHeader.jsx >> "$OUT" 2>&1

sep "I. EmptyState/ErrorState/InlineNotice/StatusBadge/IconButton/Breadcrumb"
cat resources/js/Components/EmptyState.jsx >> "$OUT" 2>&1
printf '\n--- ErrorState ---\n' >> "$OUT"
cat resources/js/Components/ErrorState.jsx >> "$OUT" 2>&1
printf '\n--- InlineNotice ---\n' >> "$OUT"
cat resources/js/Components/InlineNotice.jsx >> "$OUT" 2>&1
printf '\n--- StatusBadge ---\n' >> "$OUT"
cat resources/js/Components/StatusBadge.jsx >> "$OUT" 2>&1
printf '\n--- IconButton ---\n' >> "$OUT"
cat resources/js/Components/IconButton.jsx >> "$OUT" 2>&1
printf '\n--- Breadcrumb ---\n' >> "$OUT"
cat resources/js/Components/Breadcrumb.jsx >> "$OUT" 2>&1

sep "J. icons exports"
grep -n '^export' resources/js/Components/icons.jsx >> "$OUT" 2>&1

sep "K. lib/format.js"
cat resources/js/lib/format.js >> "$OUT" 2>&1

sep "L. lib/hooks.js"
cat resources/js/lib/hooks.js >> "$OUT" 2>&1

wc -c "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
