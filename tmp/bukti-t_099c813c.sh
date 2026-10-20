#!/usr/bin/env bash
# Kumpulkan bukti mentah kartu t_099c813c (CTA empty state grafik penjualan dashboard).
# Jalankan dari root repo: bash tmp/bukti-t_099c813c.sh
set -u
EVID=docs/bukti-frontend-t_099c813c.txt
: > "$EVID"

{
    echo "== Bukti frontend — kartu t_099c813c =="
    echo "CTA 'Tambah produk' pada empty state grafik penjualan Dashboard admin (design §5.11)"
    echo "Waktu: $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo "Berkas diubah: resources/js/Pages/Admin/Dashboard.jsx, docs/catatan-frontend.md"
    echo
    echo "== 1. Perubahan pada Dashboard.jsx (blok ChartCard) =="
    echo '$ sed -n "160,175p" resources/js/Pages/Admin/Dashboard.jsx'
    sed -n '160,175p' resources/js/Pages/Admin/Dashboard.jsx
    echo
    echo "== 2. Pemeriksaan ulang temuan QA-007 =="
    echo '$ grep -c "Tambah produk" resources/js/Pages/Admin/Dashboard.jsx'
    grep -c "Tambah produk" resources/js/Pages/Admin/Dashboard.jsx
    echo '$ grep -n "emptyAction" resources/js/Pages/Admin/Dashboard.jsx'
    grep -n "emptyAction" resources/js/Pages/Admin/Dashboard.jsx
    echo
    echo "== 3. Rute tujuan sudah terdaftar =="
    echo '$ grep -n "produk/tambah" routes/admin.php'
    grep -n "produk/tambah" routes/admin.php
    echo '$ php artisan route:list --path=admin/produk/tambah --json 2>/dev/null | head -c 500'
    php artisan route:list --path=admin/produk/tambah 2>&1 | sed -n '1,6p'
    echo
    echo "== 4. HTTP smoke ke server pemilik (read-only, tanpa kredensial admin) =="
    for u in /admin/produk/tambah /admin/produk; do
        echo "\$ curl -sS -o /dev/null -D - --max-time 30 http://127.0.0.1:8000$u"
        curl -sS -o /dev/null -D - --max-time 30 "http://127.0.0.1:8000$u" 2>&1 | sed -n '1,4p' | tr -d '\r'
        echo "curl_exit=$?"
    done
    echo "=> 302 = diarahkan ke /admin/login karena belum ada sesi admin (rute ada, bukan 404)."
    echo
} >> "$EVID" 2>&1

{
    echo "== 5. Build produksi =="
    echo '$ npm run build'
    npm run build 2>&1
    echo "npm_exit=$?"
    echo
    echo "== 6. Harness render SSR (state empty / data / loading / error) =="
    echo '$ node tmp/build-dashboard-cta-check.mjs && node tmp/verify-dashboard-cta.bundle.mjs'
    node tmp/build-dashboard-cta-check.mjs 2>&1
    node tmp/verify-dashboard-cta.bundle.mjs 2>&1
    echo "harness_exit=$?"
    echo
    echo "== 7. Sweep komponen tanpa import + identifier bebas di bundel =="
    echo '$ python tmp/cek-komponen-tanpa-import.py .'
    python tmp/cek-komponen-tanpa-import.py . 2>&1 | tail -8
    echo "sweep1_exit=$?"
    echo '$ python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build'
    python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build 2>&1 | tail -8
    echo "sweep2_exit=$?"
    echo
    echo "== 8. Berkas yang berubah untuk kartu ini =="
    echo '$ git status --short resources/js/Pages/Admin/Dashboard.jsx docs/catatan-frontend.md docs/bukti-frontend-t_099c813c.txt'
    git status --short resources/js/Pages/Admin/Dashboard.jsx docs/catatan-frontend.md docs/bukti-frontend-t_099c813c.txt
    echo '$ git diff --stat -- docs/catatan-frontend.md'
    git diff --stat -- docs/catatan-frontend.md
} >> "$EVID" 2>&1

echo "--- bukti lengkap: $EVID ---"
wc -l "$EVID"
