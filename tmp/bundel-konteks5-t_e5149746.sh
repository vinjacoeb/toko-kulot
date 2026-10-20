#!/usr/bin/env bash
# Bundel konteks #5 untuk kartu t_e5149746: pola halaman + API komponen.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks5-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. icons.jsx exports"
grep -n 'export ' resources/js/Components/icons.jsx >> "$OUT" 2>&1

sep "B. lib/hooks.js"
cat resources/js/lib/hooks.js >> "$OUT" 2>&1

sep "C. lib/format.js"
cat resources/js/lib/format.js >> "$OUT" 2>&1

sep "D. routes/admin.php 95-165"
sed -n '95,165p' routes/admin.php >> "$OUT" 2>&1

sep "E. Pages/Admin/Messages/Index.jsx (penuh)"
cat resources/js/Pages/Admin/Messages/Index.jsx >> "$OUT" 2>&1

sep "F. Settings/Index.jsx 200-380 (Thumb/ImageField/ConfirmDialog)"
sed -n '200,380p' resources/js/Pages/Admin/Settings/Index.jsx >> "$OUT" 2>&1

sep "G. Components/Modal.jsx"
cat resources/js/Components/Modal.jsx >> "$OUT" 2>&1

sep "H. Components/DataTable.jsx"
cat resources/js/Components/DataTable.jsx >> "$OUT" 2>&1

sep "I. Components/Field.jsx + Input.jsx + Select.jsx + Textarea.jsx"
cat resources/js/Components/Field.jsx >> "$OUT" 2>&1
printf '\n--- Input ---\n' >> "$OUT"
cat resources/js/Components/Input.jsx >> "$OUT" 2>&1
printf '\n--- Select ---\n' >> "$OUT"
cat resources/js/Components/Select.jsx >> "$OUT" 2>&1
printf '\n--- Textarea ---\n' >> "$OUT"
cat resources/js/Components/Textarea.jsx >> "$OUT" 2>&1

sep "J. Components/Button.jsx + IconButton.jsx + PageHeader.jsx"
cat resources/js/Components/Button.jsx >> "$OUT" 2>&1
printf '\n--- IconButton ---\n' >> "$OUT"
cat resources/js/Components/IconButton.jsx >> "$OUT" 2>&1
printf '\n--- PageHeader ---\n' >> "$OUT"
cat resources/js/Components/PageHeader.jsx >> "$OUT" 2>&1

sep "K. Components/SearchInput + Pagination + Toast"
cat resources/js/Components/SearchInput.jsx >> "$OUT" 2>&1
printf '\n--- Pagination ---\n' >> "$OUT"
cat resources/js/Components/Pagination.jsx >> "$OUT" 2>&1
printf '\n--- Toast ---\n' >> "$OUT"
cat resources/js/Components/Toast.jsx >> "$OUT" 2>&1

sep "L. Components/EmptyState + ErrorState + StatusBadge + InlineNotice"
cat resources/js/Components/EmptyState.jsx >> "$OUT" 2>&1
printf '\n--- ErrorState ---\n' >> "$OUT"
cat resources/js/Components/ErrorState.jsx >> "$OUT" 2>&1
printf '\n--- StatusBadge ---\n' >> "$OUT"
cat resources/js/Components/StatusBadge.jsx >> "$OUT" 2>&1
printf '\n--- InlineNotice ---\n' >> "$OUT"
cat resources/js/Components/InlineNotice.jsx >> "$OUT" 2>&1

wc -c -l "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
