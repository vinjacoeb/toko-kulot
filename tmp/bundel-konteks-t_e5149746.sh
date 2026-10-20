#!/usr/bin/env bash
# Bundel konteks untuk kartu t_e5149746 (Kategori + Akun admin).
# Hanya membaca; keluaran ke tmp/bundel-konteks-t_e5149746.txt
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel-konteks-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. design.md headings"
grep -n '^#\{2,4\} ' docs/design.md >> "$OUT" 2>&1

sep "B. kontrak-props 1050-1215"
sed -n '1050,1215p' docs/kontrak-props.md >> "$OUT" 2>&1

sep "C. kontrak-props 1300-1365"
sed -n '1300,1365p' docs/kontrak-props.md >> "$OUT" 2>&1

sep "D. ListProps.php"
cat app/Http/Controllers/Admin/Concerns/ListProps.php >> "$OUT" 2>&1

sep "E. CategoryController.php"
cat app/Http/Controllers/Admin/CategoryController.php >> "$OUT" 2>&1

sep "F. AccountController.php"
cat app/Http/Controllers/Admin/AccountController.php >> "$OUT" 2>&1

sep "G1. StoreCategoryRequest.php"
cat app/Http/Requests/Admin/StoreCategoryRequest.php >> "$OUT" 2>&1

sep "G2. UpdateCategoryRequest.php"
cat app/Http/Requests/Admin/UpdateCategoryRequest.php >> "$OUT" 2>&1

sep "G3. StoreAccountRequest.php"
cat app/Http/Requests/Admin/StoreAccountRequest.php >> "$OUT" 2>&1

sep "G4. UpdateAccountRequest.php"
cat app/Http/Requests/Admin/UpdateAccountRequest.php >> "$OUT" 2>&1

sep "H. MediaStorage.php"
cat app/Support/MediaStorage.php >> "$OUT" 2>&1

sep "I. Settings helpers"
grep -n 'function \|^const \|^    const ' resources/js/Pages/Admin/Settings/Index.jsx | head -90 >> "$OUT" 2>&1

sep "J. Messages helpers"
grep -n 'function \|^const \|^    const ' resources/js/Pages/Admin/Messages/Index.jsx | head -70 >> "$OUT" 2>&1

sep "K. AdminLayout 1-130"
sed -n '1,130p' resources/js/Layouts/AdminLayout.jsx >> "$OUT" 2>&1

sep "L. flash helper grep"
grep -rn 'flash' resources/js/lib resources/js/Components resources/js/Layouts | head -30 >> "$OUT" 2>&1

sep "M. Skeleton.jsx"
cat resources/js/Components/Skeleton.jsx >> "$OUT" 2>&1

sep "N. Messages 1-70"
sed -n '1,70p' resources/js/Pages/Admin/Messages/Index.jsx >> "$OUT" 2>&1

sep "O. Messages 380-546"
sed -n '380,546p' resources/js/Pages/Admin/Messages/Index.jsx >> "$OUT" 2>&1

sep "P. Categories + Accounts placeholder saat ini"
cat resources/js/Pages/Admin/Categories/Index.jsx >> "$OUT" 2>&1
printf '\n---\n' >> "$OUT"
cat resources/js/Pages/Admin/Accounts/Index.jsx >> "$OUT" 2>&1

sep "Q. routes/admin.php (kategori + akun)"
grep -n 'kategori\|akun' routes/admin.php >> "$OUT" 2>&1

wc -c "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
