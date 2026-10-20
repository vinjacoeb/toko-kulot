#!/usr/bin/env bash
# Bundel #9: props signature DataTable/Modal/Pagination/Toast/InlineNotice + stub + git status.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks9-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. DataTable signature + EmptyState pakai"
sed -n '/export default function DataTable/,/^) {/p' resources/js/Components/DataTable.jsx >> "$OUT" 2>&1
grep -n 'emptyAction\|EmptyState\|aria-busy\|<table\|onRetry\|error' resources/js/Components/DataTable.jsx | sed -n '1,30p' >> "$OUT" 2>&1

sep "B. Modal signature"
sed -n '/export default function Modal/,/^) {/p' resources/js/Components/Modal.jsx >> "$OUT" 2>&1
grep -n 'SIZES\|size ===\|max-w-' resources/js/Components/Modal.jsx | sed -n '1,20p' >> "$OUT" 2>&1

sep "C. Pagination signature"
sed -n '/export default function Pagination/,/^) {/p' resources/js/Components/Pagination.jsx >> "$OUT" 2>&1

sep "D. Toast signature"
sed -n '/export default function Toast/,/^) {/p' resources/js/Components/Toast.jsx >> "$OUT" 2>&1

sep "E. InlineNotice signature"
sed -n '/export default function InlineNotice/,/^) {/p' resources/js/Components/InlineNotice.jsx >> "$OUT" 2>&1

sep "F. inertia-stub-messages.jsx"
cat tmp/inertia-stub-messages.jsx >> "$OUT" 2>&1

sep "G. admin-messages-harness.jsx"
cat tmp/admin-messages-harness.jsx >> "$OUT" 2>&1

sep "H. git status dua berkas + log"
git status --porcelain resources/js/Pages/Admin/Categories/Index.jsx resources/js/Pages/Admin/Accounts/Index.jsx >> "$OUT" 2>&1
git log --oneline -3 -- resources/js/Pages/Admin/Categories/Index.jsx resources/js/Pages/Admin/Accounts/Index.jsx >> "$OUT" 2>&1
git status --porcelain | head -20 >> "$OUT" 2>&1

wc -c -l "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
