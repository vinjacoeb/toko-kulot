#!/usr/bin/env bash
# Harness untuk kartu t_e3f68f7f: pintu "Daftar" tamu + tautan silang Masuk<->Daftar (deviasi D13).
# Skrip uji lokal (bukan bagian aplikasi). Tidak menyalakan dev server dan tidak menyentuh .env.
# Pakai: bash tmp/jalankan-uji-t_e3f68f7f.sh
set -u

cd "$(dirname "$0")/.." || exit 1

echo '== bundel harness =='
node tmp/build-daftar-check-t_e3f68f7f.mjs || exit 1

status=0

echo
echo '== render statis (SSR) header, layout, /login, /register =='
node tmp/uji-ssr-daftar-t_e3f68f7f.bundle.mjs || status=1

echo
echo '== pohon elemen drawer + markup drawer terbuka =='
node tmp/uji-pohon-daftar-t_e3f68f7f.bundle.mjs || status=1

echo
if [ "$status" -eq 0 ]; then
    echo 'HASIL: semua pemeriksaan harness lulus'
else
    echo 'HASIL: ada pemeriksaan yang gagal'
fi
exit "$status"
