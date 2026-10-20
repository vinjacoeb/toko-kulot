#!/usr/bin/env bash
# Kumpulkan bukti mentah kartu t_950a38ca (error per blok pada tiga blok lain
# dashboard admin: stok kritis, pesanan terbaru, ulasan terbaru, design §5.11).
# Jalankan dari root repo: bash tmp/bukti-t_950a38ca.sh
set -u

EVID=docs/bukti-frontend-t_950a38ca.txt
: > "$EVID"

{
    echo "== Bukti frontend — kartu t_950a38ca =="
    echo "Tiga blok dashboard admin (Stok kritis, Pesanan terbaru, Ulasan terbaru) meneruskan"
    echo "state galat halaman + onRetry ke ErrorState, jadi galat tidak lagi menyamar sebagai"
    echo "data kosong (design §5.11 'error per blok'; design §442 judul baku 'Gagal memuat data')."
    echo "Waktu: $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo "Berkas diubah: resources/js/Pages/Admin/Dashboard.jsx, tmp/verify-dashboard-cta.mjs,"
    echo "               tmp/kontrol-negatif-t_950a38ca.py, tmp/bukti-t_950a38ca.sh, docs/catatan-frontend.md"
    echo "sha256 resources/js/Pages/Admin/Dashboard.jsx: $(sha256sum resources/js/Pages/Admin/Dashboard.jsx | cut -d' ' -f1)"
    echo
    echo "== 1. Perubahan pada Dashboard.jsx (tiga blok, tanpa komponen/teks/rute baru) =="
    echo '$ sed -n "177,190p;218,229p;231,243p" resources/js/Pages/Admin/Dashboard.jsx'
    sed -n '177,190p;218,229p;231,243p' resources/js/Pages/Admin/Dashboard.jsx
    echo
    echo "== 2. Komponen yang dipakai ulang (sudah ada, tidak diubah) =="
    echo '$ grep -n "error = null\|onRetry\|Gagal memuat data\|Gagal memuat grafik" resources/js/Components/ErrorState.jsx resources/js/Components/DataTable.jsx resources/js/Components/ChartCard.jsx'
    grep -n "error = null\|onRetry\|Gagal memuat data\|Gagal memuat grafik" \
        resources/js/Components/ErrorState.jsx resources/js/Components/DataTable.jsx resources/js/Components/ChartCard.jsx
    echo
    echo "== 3. Harness render statis (assert baru untuk tiga blok) =="
    echo '$ node tmp/build-dashboard-cta-check.mjs && node tmp/verify-dashboard-cta.bundle.mjs'
    node tmp/build-dashboard-cta-check.mjs 2>&1
    node tmp/verify-dashboard-cta.bundle.mjs 2>&1
    echo "harness_exit=$?"
    echo
    echo "== 4. Kontrol negatif (tiga blok dikembalikan sementara ke empty state) =="
    echo '$ cat docs/bukti-kontrol-negatif-t_950a38ca.txt'
    sed -n '/Kontrol negatif/,$p' docs/bukti-kontrol-negatif-t_950a38ca.txt
    echo
    echo "== 5. Build produksi =="
    echo '$ npm run build'
    npm run build 2>&1
    echo "npm_exit=$?"
    echo
    echo "== 6. Sweep komponen tanpa import + identifier bebas di bundel =="
    echo '$ python tmp/cek-komponen-tanpa-import.py .'
    python tmp/cek-komponen-tanpa-import.py . 2>&1 | tail -6
    echo "sweep1_exit=${PIPESTATUS[0]}"
    echo '$ python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build'
    python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build 2>&1 | tail -6
    echo "sweep2_exit=${PIPESTATUS[0]}"
    echo
    echo "== 7. Berkas yang berubah untuk kartu ini =="
    echo '$ git status --short resources/js/Pages/Admin/Dashboard.jsx tmp/verify-dashboard-cta.mjs tmp/kontrol-negatif-t_950a38ca.py docs/catatan-frontend.md docs/bukti-frontend-t_950a38ca.txt docs/bukti-kontrol-negatif-t_950a38ca.txt'
    git status --short resources/js/Pages/Admin/Dashboard.jsx tmp/verify-dashboard-cta.mjs \
        tmp/kontrol-negatif-t_950a38ca.py docs/catatan-frontend.md \
        docs/bukti-frontend-t_950a38ca.txt docs/bukti-kontrol-negatif-t_950a38ca.txt
    echo
    echo "== 8. Catatan race: Dashboard.jsx juga disentuh kartu lain (kontras token t_90759be9) =="
    echo '$ stat -c "%y %n" resources/js/Pages/Admin/Dashboard.jsx docs/bukti-frontend-t_90759be9.txt'
    stat -c '%y %n' resources/js/Pages/Admin/Dashboard.jsx docs/bukti-frontend-t_90759be9.txt
} >> "$EVID" 2>&1

echo "--- bukti lengkap: $EVID ---"
wc -l "$EVID"
