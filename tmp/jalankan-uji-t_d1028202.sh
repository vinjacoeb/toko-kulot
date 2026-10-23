#!/usr/bin/env bash
# Harness uji kartu F5b t_d1028202 (isian nomor resi admin).
# Menjalankan seluruh verifikasi dan menyimpan keluaran mentah ke
# tmp/log-bukti-t_d1028202/ supaya docs/bukti-frontend-t_d1028202.txt
# dapat dibangun dari keluaran nyata (bukan salinan tangan).
set -u
cd "$(dirname "$0")/.." || exit 1

ESB=./node_modules/@esbuild/win32-x64/esbuild.exe
LOG=tmp/log-bukti-t_d1028202
F=resources/js/Pages/Admin/Orders/partials/InfoResi.jsx
rm -rf "$LOG"; mkdir -p "$LOG"

bundle_ssr() {
  $ESB tmp/uji-ssr-resi-t_d1028202.mjs --bundle --platform=node --format=esm --jsx=automatic \
    --packages=external --outfile=tmp/uji-ssr-resi-t_d1028202.bundle.mjs \
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs > "$LOG/00-esbuild-ssr.txt" 2>&1
}
bundle_aksi() {
  $ESB tmp/uji-aksi-resi-t_d1028202.mjs --bundle --platform=node --format=esm --jsx=automatic \
    --packages=external --outfile=tmp/uji-aksi-resi-t_d1028202.bundle.mjs \
    --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \
    --alias:react=./tmp/shim-react-t_321bf03c.mjs \
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs > "$LOG/00-esbuild-aksi.txt" 2>&1
}
bundle_f5() {
  $ESB tmp/uji-ssr-pesanan-t_018b2723.mjs --bundle --platform=node --format=esm --jsx=automatic \
    --packages=external --outfile=tmp/uji-ssr-pesanan-t_018b2723.bundle.mjs \
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs > "$LOG/00-esbuild-f5.txt" 2>&1
}

md5_info() { md5sum "$F" | awk '{print $1}'; }

{
  echo "### A. Harness SSR/statik: tmp/uji-ssr-resi-t_d1028202.mjs"
  echo "\$ md5sum InfoResi.jsx  (sebelum)"; md5_info
  bundle_ssr && node tmp/uji-ssr-resi-t_d1028202.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/01-ssr.txt" 2>&1

{
  echo "### B. Harness interaksi: tmp/uji-aksi-resi-t_d1028202.mjs"
  bundle_aksi && node tmp/uji-aksi-resi-t_d1028202.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/02-aksi.txt" 2>&1

# Kontrol negatif A: label beku dirusak sementara.
cp "$F" "$TMPDIR/InfoResi.asli.jsx"
sed -i "s/Nomor resi/Nomor Resi Paket/" "$F"
{
  echo "### C. Kontrol negatif A (sabotase sementara: label 'Nomor resi' -> 'Nomor Resi Paket')"
  echo "\$ sed -i 's/Nomor resi/Nomor Resi Paket/' $F"
  bundle_ssr && node tmp/uji-ssr-resi-t_d1028202.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/03-ssr-sabotase.txt" 2>&1
cp "$TMPDIR/InfoResi.asli.jsx" "$F"
echo "sisa_tiruan=$(grep -c 'Nomor Resi Paket' "$F" || true)" > "$LOG/04-pulih.txt"
echo "md5_setelah_pulih=$(md5_info)" >> "$LOG/04-pulih.txt"

# Kontrol negatif B: URL simpan dirusak sementara.
cp "$F" "$TMPDIR/InfoResi.asli2.jsx"
sed -i 's|`/admin/pesanan/${id}/resi`|`/admin/pesanan/${id}/resi-tiruan`|' "$F"
{
  echo "### D. Kontrol negatif B (sabotase sementara: URL simpan -> /resi-tiruan)"
  echo "\$ sed -i 's|/admin/pesanan/\${id}/resi|/admin/pesanan/\${id}/resi-tiruan|' $F"
  bundle_aksi && node tmp/uji-aksi-resi-t_d1028202.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/05-aksi-sabotase.txt" 2>&1
cp "$TMPDIR/InfoResi.asli2.jsx" "$F"
echo "sisa_tiruan=$(grep -c 'resi-tiruan' "$F" || true)" > "$LOG/06-pulih.txt"
echo "md5_setelah_pulih=$(md5_info)" >> "$LOG/06-pulih.txt"

{
  echo "### E. Ulang setelah dipulihkan"
  bundle_ssr && node tmp/uji-ssr-resi-t_d1028202.bundle.mjs > /dev/null && echo "SSR: exit 0"
  bundle_aksi && node tmp/uji-aksi-resi-t_d1028202.bundle.mjs > /dev/null && echo "AKSI: exit 0"
} > "$LOG/07-pulih-uji.txt" 2>&1

{
  echo "### F. Regresi harness kartu F5 (uji S6 & H7 diperbarui) : tmp/uji-ssr-pesanan-t_018b2723.mjs"
  bundle_f5 && node tmp/uji-ssr-pesanan-t_018b2723.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/08-f5.txt" 2>&1

{
  echo "### G. npm run build"
  npm run build 2>&1 | tail -12
  echo "\$ echo \${PIPESTATUS[0]}  ->  ${PIPESTATUS[0]}"
} > "$LOG/09-build.txt" 2>&1

{
  echo "### H. Rute & kontrak (backend kartu t_b078318d)"
  echo "\$ grep -n 'resi' routes/admin.php"; grep -n "resi" routes/admin.php
  echo "\$ grep -n 'function resi' -A 5 app/Http/Controllers/Admin/OrderController.php"; grep -n "function resi" -A 5 app/Http/Controllers/Admin/OrderController.php
  echo "\$ grep -n 'rules\|messages\|nullable' app/Http/Requests/Admin/UpdateOrderTrackingRequest.php"; grep -n "nullable\|max:60\|Nomor resi" app/Http/Requests/Admin/UpdateOrderTrackingRequest.php
  echo "\$ grep -n 'tracking_number' docs/kontrak-props.md | head -5"; grep -n "tracking_number" docs/kontrak-props.md | head -5
} > "$LOG/10-rute.txt" 2>&1

{
  echo "### I. Teks beku D12 (docs/design.md:687 & 869) vs docs/keputusan-a15-resi.md"
  echo "\$ grep -n 'Nomor resi\|Simpan resi\|ekspedisi\|Memproses' docs/design.md docs/keputusan-a15-resi.md | head -12"
  grep -n "Nomor resi\|Simpan resi\|ekspedisi\|Memproses" docs/design.md docs/keputusan-a15-resi.md | head -12
} > "$LOG/11-teks-beku.txt" 2>&1

{
  echo "### J. Sapu regresi impor & bundel"
  echo "\$ python tmp/cek-komponen-tanpa-import.py ."; python tmp/cek-komponen-tanpa-import.py . 2>&1 | tail -6
  echo "\$ python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build"; python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build 2>&1 | tail -6
} > "$LOG/12-sapu.txt" 2>&1

{
  echo "### K. Berkas tersentuh kartu ini"
  echo "\$ git status --short resources/js/Pages/Admin/Orders/ docs/ tmp/uji-ssr-resi-t_d1028202.mjs tmp/uji-aksi-resi-t_d1028202.mjs"
  git status --short resources/js/Pages/Admin/Orders/ docs/catatan-frontend.md tmp/ 2>&1 | grep -v "^?? tmp/[a-z0-9-]*\.bundle\.mjs" | head -20
} > "$LOG/13-git.txt" 2>&1

echo "SELESAI"
ls -1 "$LOG"
