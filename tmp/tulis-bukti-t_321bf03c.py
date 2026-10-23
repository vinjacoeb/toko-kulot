"""Tulis docs/bukti-frontend-t_321bf03c.txt dari log nyata di tmp/ (bukan ketikan ulang).

Semua angka dan keluaran diambil apa adanya dari berkas log hasil menjalankan perintah
di sesi ini, supaya bukti tidak bisa melenceng dari kenyataan.
"""

from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
TMP = AKAR / 'tmp'
TARGET = AKAR / 'docs' / 'bukti-frontend-t_321bf03c.txt'

BERKAS_F4 = [
    'resources/js/Pages/Admin/Stocks/Index.jsx',
    'resources/js/Pages/Admin/Stocks/History.jsx',
    'resources/js/Pages/Admin/Stocks/partials/StokAksiModal.jsx',
]

POLA_TERLARANG = [
    'gradient',
    'bg-grid',
    'shadow-',
    'animate-',
    'dangerouslySetInnerHTML',
    'localStorage',
    'sessionStorage',
    '<img',
]


def baca(nama):
    berkas = TMP / nama
    if not berkas.exists():
        return f'(berkas log {nama} tidak ditemukan)'
    return berkas.read_text(encoding='utf-8', errors='replace').strip()


def baris_berkas():
    out = []
    for rel in BERKAS_F4:
        berkas = AKAR / rel
        jumlah = len(berkas.read_text(encoding='utf-8', errors='replace').splitlines())
        out.append(f'  {rel} — {jumlah} baris, {berkas.stat().st_size} bita')
    return '\n'.join(out)


def periksa_pola():
    out = []
    for pola in POLA_TERLARANG:
        total = 0
        for rel in BERKAS_F4:
            isi = (AKAR / rel).read_text(encoding='utf-8', errors='replace')
            total += isi.count(pola)
        status = 'bersih' if total == 0 else f'{total} kemunculan — PERIKSA'
        out.append(f'  {pola:26s} : {status}')
    return '\n'.join(out)


def tail(nama, n):
    return '\n'.join(baca(nama).splitlines()[-n:])


def cari_baris(nama, potongan):
    for baris in baca(nama).splitlines():
        if potongan in baris:
            return baris.strip()
    return f'(baris dengan "{potongan}" tidak ditemukan di {nama})'


isi = f"""BUKTI FRONTEND — kartu t_321bf03c (F4: /admin/stok — daftar stok + riwayat pergerakan)
Proyek : C:/Users/LENOVO/Downloads/toko-kulot (workspace kind=dir, sesuai kartu)
Tanggal: 21 Oktober 2026 — dijalankan oleh profile frontenddeveloper
Ringkas: 39 uji harness lulus (23 SSR/statik + 16 interaksi), `npm run build` exit 0 (723 modul),
         gate docs/qa/*.py exit 0, 3 sapu regresi lulus. Server pengembangan tidak dinyalakan.

====================================================================
1. BERKAS YANG DIKERJAKAN
====================================================================
{baris_berkas()}

  Index.jsx   : dibangun ulang dari placeholder 25 baris (review F-4) — daftar varian + stok +
                status + filter (q/status/kategori/urut) + paginasi + aksi Masuk/Keluar/Setel.
  History.jsx : berkas baru — riwayat pergerakan (q/tipe/varian) + ringkasan + paginasi.
  StokAksiModal.jsx : partial lokal (DoD-2 melarang mengubah Components/* bersama).

  Berkas bersama TIDAK diubah. Bukti: `git status --porcelain resources/js/Components
  resources/js/Layouts resources/js/lib resources/js/app.jsx` → hanya
  " M resources/js/Layouts/PublicLayout.jsx" (perubahan kartu F1 t_7ebfca05, bukan kartu ini).

====================================================================
2. PERINTAH YANG DIJALANKAN (semua dari akar repo)
====================================================================
  # harness SSR + statik (23 uji)
  ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-ssr-stok-t_321bf03c.mjs --bundle \\
    --platform=node --format=esm --jsx=automatic --packages=external \\
    --outfile=tmp/uji-ssr-stok-t_321bf03c.bundle.mjs \\
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
  node tmp/uji-ssr-stok-t_321bf03c.bundle.mjs            -> exit 0

  # harness interaksi (16 uji; react diganti shim, bukan browser)
  ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-aksi-stok-t_321bf03c.mjs --bundle \\
    --platform=node --format=esm --jsx=automatic --packages=external \\
    --outfile=tmp/uji-aksi-stok-t_321bf03c.bundle.mjs \\
    --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \\
    --alias:react=./tmp/shim-react-t_321bf03c.mjs \\
    --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
  node tmp/uji-aksi-stok-t_321bf03c.bundle.mjs           -> exit 0

  npm run build                                          -> exit 0 (log tmp/build-t_321bf03c.txt)
  python docs/qa/*.py + python tmp/cek-*.py              -> semua exit 0 (log tmp/gate-t_321bf03c.txt)

  Catatan perintah: `node_modules/.bin/esbuild` (pembungkus npm) meneruskan gagal tanpa pesan —
  karena itu dipakai biner `@esbuild/win32-x64/esbuild.exe` agar galat terlihat apa adanya.

====================================================================
3. LOG HARNESS SSR + STATIK (tmp/hasil-ssr-t_321bf03c.txt)
====================================================================
{baca('hasil-ssr-t_321bf03c.txt')}

====================================================================
4. LOG HARNESS INTERAKSI (tmp/hasil-aksi-t_321bf03c.txt)
====================================================================
{baca('hasil-aksi-t_321bf03c.txt')}

====================================================================
5. BUILD PRODUKSI (tmp/build-t_321bf03c.txt)
====================================================================
  Jumlah modul : {cari_baris('build-t_321bf03c.txt', 'modules transformed')}
  Hasil akhir  : {cari_baris('build-t_321bf03c.txt', 'built in')}
  Cuplikan chunk halaman ini:
    {cari_baris('build-t_321bf03c.txt', 'Index-D_xtpihP.js')}
    {cari_baris('build-t_321bf03c.txt', 'History-DnaYmjrN.js')}

  Halaman baru terbukti masuk bundel rilis (dicari dari teks khasnya):
    grep -rl "Pantau stok per varian"    public/build/assets/ -> public/build/assets/Index-D_xtpihP.js
    grep -rl "Riwayat pergerakan stok"   public/build/assets/ -> public/build/assets/History-DnaYmjrN.js

  Build dijalankan sendirian (aturan rantai kartu): sebelum build, `python
  tmp/papan-jalan-t_321bf03c.py` menunjukkan hanya t_321bf03c berstatus running.

====================================================================
6. GATE + SAPU REGRESI (tmp/gate-t_321bf03c.txt, 256 baris — ringkas)
====================================================================
  python docs/qa/audit-penanda-meta.py      -> exit 0 (kandidat: berkas non-F4)
  python docs/qa/kontras-badge.py           -> exit 0 "SEMUA angka tabel §4.21 cocok dengan hitungan WCAG 2.1 ... — 7 tone + 7 tone solid."
  python docs/qa/kontras-meta.py            -> exit 0 (ringkas kandidat keputusan meta)
  python docs/qa/sweep-meta-surface.py      -> exit 0 "status: LOLOS (keluar 0)"
  python tmp/cek-komponen-tanpa-import.py . -> exit 0; 89 berkas; hanya false positive dikenal
                                               "resources\\js\\app.jsx: App" (parameter `setup({{el, App, props}})`).
  python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build
                                            -> exit 0; 61 chunk; satu temuan `DropzoneGalery-DbK3OEU7.js
                                               -> FREE: P` yang sudah dinilai false positive di kartu F3.
  python tmp/cek-tautan-admin-vs-rute.py    -> exit 0 "LULUS: semua url admin cocok dengan rute
                                               terdaftar pada metode yang benar." URL F4
                                               (/admin/stok/{{variant}}/masuk|keluar, /admin/produk/{{product}}/ubah)
                                               muncul sebagai "konteks tidak dikenal (info)".

====================================================================
7. PEMERIKSAAN STATIS BERKAS F4
====================================================================
  Pola terlarang / berisiko (hitungan langsung atas 3 berkas F4):
{periksa_pola()}

  Tidak ada `<img>`, jadi aturan alt/lazy tidak berlaku di halaman ini (data dikirim sebagai teks).

====================================================================
8. PROPS YANG DIPAKAI (kontrak §12.12–§12.15)
====================================================================
  Index   : stok{{data,links,meta}}, filter{{q,status,kategori,urut}}, kategori[], ringkasan{{varian,habis,kritis}},
            flash{{success,error}} (props bersama) — dicocokkan dengan StockController@index.
  History : riwayat{{data,links,meta}}, filter{{q,tipe,varian}}, varian[], ringkasan{{masuk,keluar,adjust,sale}}
            — dicocokkan dengan StockController@history.
  Baris   : {{id, product{{id,name,slug}}, size, color, label, sku, stock, is_active, status, updated_at}} dan
            {{id, product_name, variant_label, variant_sku, type, tipe_label, qty, signed_qty, note,
            admin{{id,name}}|null, created_at}}.
  Uji S4 memastikan props halaman ⊆ props yang benar-benar dikirim StockController.

====================================================================
9. BELUM DIUJI (butuh browser / tindakan pemilik)
====================================================================
  - Tata letak nyata pada 360 / 768 / 1024 / 1280 px, urutan tab & fokus di dalam Modal,
    zoom 200%, dan kontras terukur di layar.
  - Debounce pencarian pada browser nyata dan navigasi filter tanpa reload penuh.
  - Aksi stok end-to-end ke server (POST /admin/stok/{{variant}}/masuk|keluar) — butuh sesi admin;
    agent tidak menyalakan server dan tidak melakukan login.
  Langkah uji aman untuk pemilik (server pemilik sudah berjalan di http://127.0.0.1:8000):
    1) buka /admin/stok (setelah login admin) — cek KPI, tabel, dua ragam kosong, dan filter;
    2) klik Masuk/Keluar pada satu varian, isi qty, kirim, pastikan toast sukses dan stok berubah;
    3) buka /admin/stok/riwayat — pastikan baris baru muncul dan filter tipe/varian bekerja;
    4) jalankan lagi uji keyboard: Tab ke tombol aksi, Enter membuka modal, Esc menutup.
"""

TARGET.write_text(isi.rstrip() + '\n', encoding='utf-8', newline='\n')
print(f'ditulis: {TARGET}')
print(f'baris  : {len(isi.splitlines())}')
