#!/usr/bin/env bash
# Kontrol negatif kartu t_950a38ca: buktikan assert baru menangkap gejala kartu.
# Jalankan dari root repo. Mengubah sementara resources/js/Pages/Admin/Dashboard.jsx
# lalu MEMULIHKANNYA dari salinan + memverifikasi sha256 (tidak boleh beda).
#
# CATATAN RACE: berkas Dashboard.jsx juga sedang disentuh kartu lain (kontras
# token, t_90759be9). Jendela perubahan sengaja < 1 detik dan pemulihan
# diverifikasi dengan sha256; salinan diambil tepat sebelum perubahan.
set -u

EVID=docs/bukti-kontrol-negatif-t_950a38ca.txt
TARGET=resources/js/Pages/Admin/Dashboard.jsx
BAK="$TMPDIR/dashboard-t950-kontrol-negatif.bak"

cp "$TARGET" "$BAK"
HASH_SEBELUM=$(sha256sum "$TARGET" | cut -d' ' -f1)
MTIME_SEBELUM=$(stat -c '%y' "$TARGET")

{
    echo "== Kontrol negatif — kartu t_950a38ca =="
    echo "Tiga blok dashboard dikembalikan SEMENTARA ke empty state saat prop error terisi"
    echo "(perilaku yang dilaporkan kartu). Harness harus GAGAL; sesudah itu berkas dipulihkan."
    echo "Waktu: $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo
    echo "sha256 Dashboard.jsx sebelum perubahan : $HASH_SEBELUM"
    echo "mtime Dashboard.jsx sebelum perubahan  : $MTIME_SEBELUM"
    echo "salinan pemulihan                      : $BAK"
    echo
    echo "== 1. Pasang kontrol negatif (tmp/kontrol-negatif-t_950a38ca.py) =="
    echo '$ python tmp/kontrol-negatif-t_950a38ca.py'
    python "C:/Users/LENOVO/Downloads/toko-kulot/tmp/kontrol-negatif-t_950a38ca.py" 2>&1
    echo "revert_exit=$?"
    echo "sha256 saat kontrol negatif terpasang  : $(sha256sum "$TARGET" | cut -d' ' -f1)"
    echo
    echo "== 2. Harness dibangun ulang dari sumber yang direvert lalu dijalankan =="
    echo '$ node tmp/build-dashboard-cta-check.mjs && node tmp/verify-dashboard-cta.bundle.mjs'
    node tmp/build-dashboard-cta-check.mjs 2>&1
    node tmp/verify-dashboard-cta.bundle.mjs 2>&1
    echo "harness_exit=$?"
    echo
    echo "== 3. Pulihkan Dashboard.jsx dari salinan =="
    echo '$ cp "$BAK" resources/js/Pages/Admin/Dashboard.jsx'
    cp "$BAK" "$TARGET"
    HASH_SESUDAH=$(sha256sum "$TARGET" | cut -d' ' -f1)
    echo "sha256 sesudah pemulihan               : $HASH_SESUDAH"
    if [ "$HASH_SEBELUM" = "$HASH_SESUDAH" ]; then
        echo "PEMULIHAN OK: hash identik, tidak ada pekerjaan agent lain yang hilang."
    else
        echo "PEMULIHAN GAGAL: hash berbeda — periksa berkas segera!"
    fi
    echo
    echo "== 4. Harness dibangun ulang dari sumber pulih (kontrol positif) =="
    echo '$ node tmp/build-dashboard-cta-check.mjs && node tmp/verify-dashboard-cta.bundle.mjs'
    node tmp/build-dashboard-cta-check.mjs 2>&1
    node tmp/verify-dashboard-cta.bundle.mjs 2>&1
    echo "harness_exit=$?"
} >> "$EVID" 2>&1

echo "--- bukti kontrol negatif: $EVID ---"
grep -E "HASIL:|harness_exit|PEMULIHAN" "$EVID"
