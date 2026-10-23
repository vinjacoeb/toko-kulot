#!/usr/bin/env bash
# Harness uji kartu B2 t_02c3d20c (gate ulasan CheckoutSuccess memakai `ulasan.boleh`).
# Menjalankan seluruh verifikasi dan menyimpan keluaran mentah ke
# tmp/log-bukti-t_02c3d20c/ supaya docs/bukti-frontend-t_02c3d20c.txt
# dibangun dari keluaran nyata (bukan salinan tangan).
set -u
cd "$(dirname "$0")/.." || exit 1

ESB=./node_modules/@esbuild/win32-x64/esbuild.exe
LOG=tmp/log-bukti-t_02c3d20c
F=resources/js/Pages/Public/CheckoutSuccess.jsx
rm -rf "$LOG"; mkdir -p "$LOG"

bundle_b2() {
  $ESB tmp/uji-ssr-gate-boleh-t_02c3d20c.mjs --bundle --platform=node --format=esm --jsx=automatic \
    --packages=external --outfile=tmp/uji-ssr-gate-boleh-t_02c3d20c.bundle.mjs \
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs > "$LOG/00-esbuild-b2.txt" 2>&1
}
bundle_f6_ssr() {
  $ESB tmp/uji-ssr-ulasan-t_2de36f29.mjs --bundle --platform=node --format=esm --jsx=automatic \
    --packages=external --outfile=tmp/uji-ssr-ulasan-t_2de36f29.bundle.mjs \
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs > "$LOG/00-esbuild-f6-ssr.txt" 2>&1
}
bundle_f6_aksi() {
  $ESB tmp/uji-aksi-ulasan-t_2de36f29.mjs --bundle --platform=node --format=esm --jsx=automatic \
    --packages=external --outfile=tmp/uji-aksi-ulasan-t_2de36f29.bundle.mjs \
    --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \
    --alias:react=./tmp/shim-react-t_321bf03c.mjs \
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs > "$LOG/00-esbuild-f6-aksi.txt" 2>&1
}

md5_info() { md5sum "$F" | awk '{print $1}'; }

{
  echo "### A. Harness SSR gate §7.9 (kartu B2): tmp/uji-ssr-gate-boleh-t_02c3d20c.mjs"
  echo "\$ md5sum $F  (sebelum)"; md5_info
  bundle_b2 && node tmp/uji-ssr-gate-boleh-t_02c3d20c.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/01-b2.txt" 2>&1

{
  echo "### B. Regresi harness SSR F6 (uji 3, 7, 12 diperbarui): tmp/uji-ssr-ulasan-t_2de36f29.mjs"
  bundle_f6_ssr && node tmp/uji-ssr-ulasan-t_2de36f29.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/02-f6-ssr.txt" 2>&1

{
  echo "### C. Regresi harness interaksi F6 (uji 7 baru): tmp/uji-aksi-ulasan-t_2de36f29.mjs"
  bundle_f6_aksi && node tmp/uji-aksi-ulasan-t_2de36f29.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/03-f6-aksi.txt" 2>&1

# Kontrol negatif: gate dirusak sementara (boleh dilepas).
cp "$F" "$TMPDIR/CheckoutSuccess.asli.jsx"
sed -i 's/const tampilkanForm = boleh && pending.length > 0;/const tampilkanForm = pending.length > 0;/' "$F"
{
  echo "### D. Kontrol negatif (sabotase sementara: gate -> 'pending.length > 0', boleh dilepas)"
  echo "\$ sed -i 's/const tampilkanForm = boleh && pending.length > 0;/const tampilkanForm = pending.length > 0;/' $F"
  bundle_b2 && node tmp/uji-ssr-gate-boleh-t_02c3d20c.bundle.mjs
  echo "\$ echo \$?  ->  $?"
  echo "--- regresi F6 SSR pada kondisi sabotase:"
  bundle_f6_ssr && node tmp/uji-ssr-ulasan-t_2de36f29.bundle.mjs
  echo "\$ echo \$?  ->  $?"
  echo "--- regresi F6 interaksi pada kondisi sabotase:"
  bundle_f6_aksi && node tmp/uji-aksi-ulasan-t_2de36f29.bundle.mjs
  echo "\$ echo \$?  ->  $?"
} > "$LOG/04-sabotase.txt" 2>&1
cp "$TMPDIR/CheckoutSuccess.asli.jsx" "$F"
echo "sisa_sabotase_gate=$(grep -c 'tampilkanForm = pending.length > 0' "$F" || true)" > "$LOG/05-pulih.txt"
echo "md5_setelah_pulih=$(md5_info)" >> "$LOG/05-pulih.txt"

{
  echo "### E. Ulang setelah dipulihkan"
  bundle_b2 && node tmp/uji-ssr-gate-boleh-t_02c3d20c.bundle.mjs > /dev/null && echo "B2 SSR: exit 0"
  bundle_f6_ssr && node tmp/uji-ssr-ulasan-t_2de36f29.bundle.mjs > /dev/null && echo "F6 SSR: exit 0"
  bundle_f6_aksi && node tmp/uji-aksi-ulasan-t_2de36f29.bundle.mjs > /dev/null && echo "F6 AKSI: exit 0"
  echo "md5_setelah_ulang=$(md5_info)"
} > "$LOG/06-pulih-uji.txt" 2>&1

{
  echo "### F. npm run build"
  npm run build 2>&1 | tail -12
  echo "\$ echo \${PIPESTATUS[0]}  ->  ${PIPESTATUS[0]}"
} > "$LOG/07-build.txt" 2>&1

{
  echo "### G. Kode gate di bundel rilis"
  echo "\$ grep -rl 'Ulasan bisa dikirim setelah pembayaran berhasil' public/build/assets/"
  grep -rl "Ulasan bisa dikirim setelah pembayaran berhasil" public/build/assets/
  echo "\$ grep -rl 'Beri Penilaian' public/build/assets/"
  grep -rl "Beri Penilaian" public/build/assets/
} > "$LOG/08-bundel.txt" 2>&1

{
  echo "### H. Sapu regresi impor & bundel"
  echo "\$ python tmp/cek-komponen-tanpa-import.py ."; python tmp/cek-komponen-tanpa-import.py . 2>&1 | tail -6
  echo "\$ python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build"; python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build 2>&1 | tail -6
} > "$LOG/09-sapu.txt" 2>&1

{
  echo "### I. Gerbang di kode (statis) & kontrak/desain rujukan"
  echo "\$ grep -n 'kontradiksiBoleh' -r resources/js/ || true"; grep -rn "kontradiksiBoleh" resources/js/ || echo "(tidak ada)"
  echo "\$ sed -n '44,60p' $F"; sed -n '44,60p' "$F"
  echo "\$ grep -n 'ulasan.boleh = ' -A 6 docs/kontrak-props.md | head -12"; grep -n "ulasan.boleh = " -A 6 docs/kontrak-props.md | head -12
} > "$LOG/10-statistik.txt" 2>&1

{
  echo "### J. Berkas tersentuh kartu ini"
  echo "\$ git status --short resources/js/Pages/Public/CheckoutSuccess.jsx docs/catatan-frontend.md"
  git status --short resources/js/Pages/Public/CheckoutSuccess.jsx docs/catatan-frontend.md
  echo "\$ git status --short | wc -l"; git status --short | wc -l
} > "$LOG/11-git.txt" 2>&1

echo "SELESAI"
ls -1 "$LOG"
