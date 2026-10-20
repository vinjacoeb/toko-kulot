#!/usr/bin/env bash
# Kumpulkan bukti mentah kartu t_8bca0661 (error per blok grafik dashboard admin, design §5.11).
# Jalankan dari root repo: bash tmp/bukti-t_8bca0661.sh
set -u
EVID=docs/bukti-frontend-t_8bca0661.txt
: > "$EVID"

{
    echo "== Bukti frontend — kartu t_8bca0661 =="
    echo "ChartCard dashboard menerima prop error/onRetry: blok grafik menampilkan galat + 'Coba lagi',"
    echo "bukan empty state 'Belum ada penjualan' + CTA 'Tambah produk' (design §5.11 'error per blok')."
    echo "Waktu: $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo "Berkas diubah: resources/js/Pages/Admin/Dashboard.jsx, tmp/verify-dashboard-cta.mjs, docs/catatan-frontend.md"
    echo
    echo "== 1. Perubahan pada Dashboard.jsx (blok ChartCard) =="
    echo '$ sed -n "161,175p" resources/js/Pages/Admin/Dashboard.jsx'
    sed -n '161,175p' resources/js/Pages/Admin/Dashboard.jsx
    echo
    echo "== 2. ChartCard sudah punya cabang error/onRetry (dipakai, bukan komponen baru) =="
    echo '$ grep -n "error = null\|onRetry\|Gagal memuat grafik" resources/js/Components/ChartCard.jsx'
    grep -n "error = null\|onRetry\|Gagal memuat grafik" resources/js/Components/ChartCard.jsx
    echo
    echo "== 3. Harness render statis (state error per blok) =="
    echo '$ node tmp/build-dashboard-cta-check.mjs && node tmp/verify-dashboard-cta.bundle.mjs'
    node tmp/build-dashboard-cta-check.mjs 2>&1
    node tmp/verify-dashboard-cta.bundle.mjs 2>&1
    echo "harness_exit=$?"
    echo
    echo "== 4. Kontrol negatif: tanpa prop error/onRetry harness GAGAL (dibuktikan 20-10-2026 15:31) =="
    echo '$ cat docs/bukti-kontrol-negatif-t_8bca0661.txt'
    sed -n '/^4\./,$p' docs/bukti-kontrol-negatif-t_8bca0661.txt
    echo
    echo "== 5. Build produksi =="
    echo '$ npm run build'
    npm run build 2>&1
    echo "npm_exit=$?"
    echo
    echo "== 6. Sweep komponen tanpa import + identifier bebas di bundel =="
    echo '$ python tmp/cek-komponen-tanpa-import.py .'
    python tmp/cek-komponen-tanpa-import.py . 2>&1 | tail -6
    echo "sweep1_exit=$?"
    echo '$ python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build'
    python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build 2>&1 | tail -6
    echo "sweep2_exit=$?"
    echo
    echo "== 7. Berkas yang berubah untuk kartu ini =="
    echo '$ git status --short resources/js/Pages/Admin/Dashboard.jsx tmp/verify-dashboard-cta.mjs docs/catatan-frontend.md docs/bukti-frontend-t_8bca0661.txt docs/bukti-kontrol-negatif-t_8bca0661.txt'
    git status --short resources/js/Pages/Admin/Dashboard.jsx tmp/verify-dashboard-cta.mjs docs/catatan-frontend.md docs/bukti-frontend-t_8bca0661.txt docs/bukti-kontrol-negatif-t_8bca0661.txt
} >> "$EVID" 2>&1

echo "--- bukti lengkap: $EVID ---"
wc -l "$EVID"
