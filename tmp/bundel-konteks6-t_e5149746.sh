#!/usr/bin/env bash
# Bundel konteks #6 untuk kartu t_e5149746: kontrak §12.x, controller, request, nav, stub.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks6-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. struktur Pages/Admin"
find resources/js/Pages/Admin -name '*.jsx' | sort >> "$OUT" 2>&1

sep "B. kontrak-props 1000-1400"
sed -n '1000,1400p' docs/kontrak-props.md >> "$OUT" 2>&1

sep "C. design 620-700"
sed -n '620,700p' docs/design.md >> "$OUT" 2>&1

sep "D. CategoryController"
cat app/Http/Controllers/Admin/CategoryController.php >> "$OUT" 2>&1

sep "E. AccountController"
cat app/Http/Controllers/Admin/AccountController.php >> "$OUT" 2>&1

sep "F. ListProps"
cat app/Http/Controllers/Admin/Concerns/ListProps.php >> "$OUT" 2>&1

sep "G. Requests"
for f in StoreCategoryRequest UpdateCategoryRequest StoreAccountRequest UpdateAccountRequest; do
  printf '\n--- %s ---\n' "$f" >> "$OUT"
  cat "app/Http/Requests/Admin/$f.php" >> "$OUT" 2>&1
done

sep "H. AdminLayout ADMIN_NAV + props"
grep -n 'ADMIN_NAV' resources/js/Layouts/AdminLayout.jsx >> "$OUT" 2>&1
sed -n '/const ADMIN_NAV/,/^];/p' resources/js/Layouts/AdminLayout.jsx >> "$OUT" 2>&1
grep -n 'export default function AdminLayout' -A 12 resources/js/Layouts/AdminLayout.jsx >> "$OUT" 2>&1

sep "I. stub Categories/Index.jsx"
cat resources/js/Pages/Admin/Categories/Index.jsx >> "$OUT" 2>&1

sep "J. stub Accounts/Index.jsx"
cat resources/js/Pages/Admin/Accounts/Index.jsx >> "$OUT" 2>&1

sep "K. catatan-frontend tail 80"
tail -80 docs/catatan-frontend.md >> "$OUT" 2>&1

sep "L. package.json scripts"
sed -n '1,40p' package.json >> "$OUT" 2>&1

sep "M. routes/admin.php 1-95"
sed -n '1,95p' routes/admin.php >> "$OUT" 2>&1

wc -c -l "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
