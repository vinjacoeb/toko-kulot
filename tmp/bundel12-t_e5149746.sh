#!/usr/bin/env bash
# Bundel #12: ADMIN_NAV, Button varian, Modal size, ikon, pola checkbox, isi stub.
set -u
cd "$(dirname "$0")/.." || exit 1
OUT=tmp/bundel12-t_e5149746.txt
: > "$OUT"
sep() { printf '\n===== %s =====\n' "$1" >> "$OUT"; }

sep "A. ADMIN_NAV"
grep -n -A 30 'ADMIN_NAV' resources/js/Layouts/AdminLayout.jsx | sed -n '1,45p' >> "$OUT" 2>&1

sep "B. Modal SIZES + header"
sed -n '1,50p' resources/js/Components/Modal.jsx >> "$OUT" 2>&1
grep -n -E "SIZES|size ===|max-w-modal" resources/js/Components/Modal.jsx >> "$OUT" 2>&1

sep "C. Button varian + ukuran"
grep -n -E "variant|VARIANT|danger|ghost|secondary|primary" resources/js/Components/Button.jsx | sed -n '1,40p' >> "$OUT" 2>&1

sep "D. ekspor icons.jsx"
grep -n 'export' resources/js/Components/icons.jsx >> "$OUT" 2>&1

sep "E. pola checkbox Settings"
grep -rn 'type="checkbox"' -B 8 -A 12 resources/js/Pages/Admin/Settings/Index.jsx | sed -n '1,90p' >> "$OUT" 2>&1

sep "F. isi stub Categories/Index.jsx"
nl -ba resources/js/Pages/Admin/Categories/Index.jsx >> "$OUT" 2>&1

sep "G. isi stub Accounts/Index.jsx"
nl -ba resources/js/Pages/Admin/Accounts/Index.jsx >> "$OUT" 2>&1

sep "H. css: checkbox/form-check"
ls resources/css 2>&1 >> "$OUT"
grep -rn -E 'checkbox|\.field|\.label|form-check' resources/css 2>&1 | sed -n '1,30p' >> "$OUT"

wc -c -l "$OUT" >> "$OUT" 2>&1
echo "OK $OUT"
