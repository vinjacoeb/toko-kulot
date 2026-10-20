#!/usr/bin/env bash
# Bundel konteks #4 untuk kartu t_e5149746: kontrak §12 kategori/akun, design 5.11-5.14, PRD.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks4-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. kontrak-props headings 12.x + 10.x/11.x"
grep -n '^#\{2,4\} ' docs/kontrak-props.md >> "$OUT" 2>&1

sep "B. kontrak-props 1000-1215"
sed -n '1000,1215p' docs/kontrak-props.md >> "$OUT" 2>&1

sep "C. kontrak-props 1216-1400"
sed -n '1216,1400p' docs/kontrak-props.md >> "$OUT" 2>&1

sep "D. design 647-700 (5.11-5.18)"
sed -n '647,700p' docs/design.md >> "$OUT" 2>&1

sep "E. design 734-792 (aturan implementasi + checklist)"
sed -n '734,792p' docs/design.md >> "$OUT" 2>&1

sep "F. PRD headings kategori/akun"
grep -n 'ategori\|Akun\|akun admin\|Kelola' docs/PRD.md | head -60 >> "$OUT" 2>&1

sep "G. CategoryController.php"
cat app/Http/Controllers/Admin/CategoryController.php >> "$OUT" 2>&1

sep "H. AccountController.php"
cat app/Http/Controllers/Admin/AccountController.php >> "$OUT" 2>&1

sep "I. Requests"
cat app/Http/Requests/Admin/StoreCategoryRequest.php >> "$OUT" 2>&1
printf '\n--- Update ---\n' >> "$OUT"
cat app/Http/Requests/Admin/UpdateCategoryRequest.php >> "$OUT" 2>&1
printf '\n--- StoreAccount ---\n' >> "$OUT"
cat app/Http/Requests/Admin/StoreAccountRequest.php >> "$OUT" 2>&1
printf '\n--- UpdateAccount ---\n' >> "$OUT"
cat app/Http/Requests/Admin/UpdateAccountRequest.php >> "$OUT" 2>&1

sep "J. routes kategori + akun"
grep -n 'ategori\|akun' routes/admin.php >> "$OUT" 2>&1

sep "K. Categories/Accounts Index saat ini"
cat resources/js/Pages/Admin/Categories/Index.jsx >> "$OUT" 2>&1
printf '\n--- Accounts ---\n' >> "$OUT"
cat resources/js/Pages/Admin/Accounts/Index.jsx >> "$OUT" 2>&1

sep "L. catatan-frontend.md tail"
tail -40 docs/catatan-frontend.md >> "$OUT" 2>&1

wc -c "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
