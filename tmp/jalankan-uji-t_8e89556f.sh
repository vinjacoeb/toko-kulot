#!/usr/bin/env bash
# Harness uji kartu F8 t_8e89556f (tombol "Sinkronkan status pembayaran" di /admin/pesanan/{order}).
# Menjalankan seluruh verifikasi dan menyimpan keluaran mentah ke tmp/log-bukti-t_8e89556f/
# supaya docs/bukti-frontend-t_8e89556f.txt dapat dibangun dari keluaran nyata (bukan salinan tangan).
set -u
cd "$(dirname "$0")/.." || exit 1

ESB=./node_modules/@esbuild/win32-x64/esbuild.exe
LOG=tmp/log-bukti-t_8e89556f
F_PARTIAL=resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx
F_SHOW=resources/js/Pages/Admin/Orders/Show.jsx
rm -rf "$LOG"; mkdir -p "$LOG"

bundle_aksi() {
  $ESB tmp/uji-aksi-sinkron-t_8e89556f.mjs --bundle --platform=node --format=esm --jsx=automatic \
    --packages=external --outfile=tmp/uji-aksi-sinkron-t_8e89556f.bundle.mjs \
    --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \
    --alias:react=./tmp/shim-react-t_321bf03c.mjs \
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs > "$LOG/00-esbuild-aksi.txt" 2>&1
}

bundle_regresi() {
  $ESB tmp/uji-ssr-pesanan-t_018b2723.mjs --bundle --platform=node --format=esm --jsx=automatic \
    --packages=external --outfile=tmp/uji-ssr-pesanan-t_018b2723.bundle.mjs \
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs > "$LOG/00b-esbuild-regresi.txt" 2>&1
}

md5_info() { md5sum "$F_PARTIAL" "$F_SHOW" | awk '{print $1}'; }

{
  echo "### A. Harness interaksi: tmp/uji-aksi-sinkron-t_8e89556f.mjs"
  echo "\$ md5sum SyncPaymentButton.jsx Show.jsx  (sebelum)"; md5_info
  bundle_aksi && node tmp/uji-aksi-sinkron-t_8e89556f.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/01-aksi.txt" 2>&1

# Kontrol negatif A: label beku dirusak sementara.
cp "$F_PARTIAL" "$TMPDIR/SyncPaymentButton.asli.jsx"
sed -i 's/Sinkronkan status pembayaran/Sinkronkan pembayaran/' "$F_PARTIAL"
{
  echo "### B. Kontrol negatif A (sabotase sementara: label 'Sinkronkan status pembayaran' -> 'Sinkronkan pembayaran')"
  echo "\$ sed -i 's/Sinkronkan status pembayaran/Sinkronkan pembayaran/' $F_PARTIAL"
  bundle_aksi && node tmp/uji-aksi-sinkron-t_8e89556f.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/02-sabotase-label.txt" 2>&1
cp "$TMPDIR/SyncPaymentButton.asli.jsx" "$F_PARTIAL"
echo "sisa_sabotase_label=$(grep -c 'Sinkronkan pembayaran' "$F_PARTIAL" || true)" > "$LOG/03-pulih-label.txt"
echo "md5_setelah_pulih=$(md5sum "$F_PARTIAL" | awk '{print $1}')" >> "$LOG/03-pulih-label.txt"

# Kontrol negatif B: URL rute dirusak sementara.
cp "$F_PARTIAL" "$TMPDIR/SyncPaymentButton.asli2.jsx"
sed -i 's|/sinkron-pembayaran`|/sinkron-pembayaran-tiruan`|' "$F_PARTIAL"
{
  echo "### C. Kontrol negatif B (sabotase sementara: URL simpan -> /sinkron-pembayaran-tiruan)"
  echo "\$ sed -i 's|/sinkron-pembayaran\`|/sinkron-pembayaran-tiruan\`|' $F_PARTIAL"
  bundle_aksi && node tmp/uji-aksi-sinkron-t_8e89556f.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/04-sabotase-url.txt" 2>&1
cp "$TMPDIR/SyncPaymentButton.asli2.jsx" "$F_PARTIAL"
echo "sisa_sabotase_url=$(grep -c 'sinkron-pembayaran-tiruan' "$F_PARTIAL" || true)" > "$LOG/05-pulih-url.txt"
echo "md5_setelah_pulih=$(md5sum "$F_PARTIAL" | awk '{print $1}')" >> "$LOG/05-pulih-url.txt"

# Kontrol negatif C: logika suppress Toast dirusak sementara.
cp "$F_SHOW" "$TMPDIR/Show.asli.jsx"
sed -i 's/pasanganFlash === flashSinkron/false/' "$F_SHOW"
{
  echo "### D. Kontrol negatif C (sabotase sementara: syarat suppress Toast -> false)"
  echo "\$ sed -i 's/pasanganFlash === flashSinkron/false/' $F_SHOW"
  bundle_aksi && node tmp/uji-aksi-sinkron-t_8e89556f.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/06-sabotase-suppress.txt" 2>&1
cp "$TMPDIR/Show.asli.jsx" "$F_SHOW"
echo "sisa_sabotase_suppress=$(grep -c 'pasanganFlash === flashSinkron' "$F_SHOW" || true)" > "$LOG/07-pulih-suppress.txt"
echo "md5_setelah_pulih=$(md5sum "$F_SHOW" | awk '{print $1}')" >> "$LOG/07-pulih-suppress.txt"

{
  echo "### E. Ulang setelah dipulihkan (harus 100% OK lagi)"
  bundle_aksi && node tmp/uji-aksi-sinkron-t_8e89556f.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/08-pulih-uji.txt" 2>&1

{
  echo "### F. npm run build + jejak kelas/teks di bundel"
  npm run build 2>&1 | tail -12
  echo "\$ echo \${PIPESTATUS[0]}  ->  ${PIPESTATUS[0]}"
  echo "\$ grep -c 'min-width:16rem' public/build/assets/*.css"
  grep -c "min-width:16rem" public/build/assets/*.css
  echo "\$ grep -o 'min-w-[^{]*{min-width:16rem}' public/build/assets/*.css | head -3"
  grep -o "min-w-[^{]*{min-width:16rem}" public/build/assets/*.css | head -3
  echo "\$ grep -o 'Sinkronkan status pembayaran' public/build/assets/*.js | head -3"
  grep -o "Sinkronkan status pembayaran" public/build/assets/*.js | head -3
  echo "\$ grep -o 'sinkron-pembayaran' public/build/assets/*.js | head -3"
  grep -o "sinkron-pembayaran" public/build/assets/*.js | head -3
} > "$LOG/09-build.txt" 2>&1

{
  echo "### G. Regresi harness kartu F5 (halaman yang sama): tmp/uji-ssr-pesanan-t_018b2723.mjs"
  bundle_regresi && node tmp/uji-ssr-pesanan-t_018b2723.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/10-regresi-f5.txt" 2>&1

{
  echo "### H. Sapu regresi impor & bundel"
  echo "\$ python tmp/cek-komponen-tanpa-import.py ."; python tmp/cek-komponen-tanpa-import.py . 2>&1 | tail -6
  echo "\$ python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build"; python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build 2>&1 | tail -6
  echo "\$ grep -n 'dangerouslySetInnerHTML\|localStorage\|route(' resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx resources/js/Pages/Admin/Orders/Show.jsx"
  grep -n "dangerouslySetInnerHTML\|localStorage\|route(" resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx resources/js/Pages/Admin/Orders/Show.jsx || echo "(tidak ada)"
} > "$LOG/11-sapu.txt" 2>&1

{
  echo "### I. Rute & kontrak (sisi backend kartu B3 t_c374a29b)"
  echo "\$ grep -n 'sinkron' routes/admin.php"; grep -n "sinkron" routes/admin.php
  echo "\$ grep -n 'function syncPayment' -A 3 app/Http/Controllers/Admin/OrderController.php"; grep -n "function syncPayment" -A 3 app/Http/Controllers/Admin/OrderController.php
  echo "\$ grep -n '12.24' docs/kontrak-props.md | head -3"; grep -n "12.24" docs/kontrak-props.md | head -3
  echo "\$ grep -n 'D13' docs/design.md | head -3"; grep -n "| D13 |" docs/design.md | head -3
  echo "\$ grep -n -i 'U6-1' docs/catatan-uiux.md | head -5"; grep -n -i "U6-1" docs/catatan-uiux.md | head -5
} > "$LOG/12-rute-kontrak.txt" 2>&1

{
  echo "### J. Berkas tersentuh kartu ini"
  echo "\$ git status --short resources/js/Pages/Admin/Orders docs/catatan-frontend.md tmp/"
  git status --short resources/js/Pages/Admin/Orders docs/catatan-frontend.md tmp/ 2>&1 | grep -v "^?? tmp/[a-z0-9._-]*\.bundle\.mjs" | head -25
} > "$LOG/13-git.txt" 2>&1

echo "SELESAI"
ls -1 "$LOG"
