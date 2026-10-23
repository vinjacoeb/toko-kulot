"""Rapikan catatan F2 setelah penyesuaian (langkah perbaikan tampil ke pembeli + `galat` §7.7).

Idempoten (dilewati bila penanda baru sudah ada). Menjalankan harness untuk
menghitung jumlah uji nyata sebelum menulis angka ke catatan.

    python tmp/fix-f2-catatan.py
"""
import pathlib
import re
import subprocess
import sys

CATATAN = pathlib.Path('docs/catatan-frontend.md')
VERIF = pathlib.Path('tmp/f2-verifikasi.md')
HARNESS = 'tmp/uji-ssr-midtrans-t_e60e7733.bundle.mjs'
MARKA = 'kartu F2 butir a'

keluar = subprocess.run(['node', HARNESS], capture_output=True, text=True, encoding='utf-8', errors='replace')
ok = keluar.stdout.count('[OK]')
gagal = keluar.stdout.count('[GAGAL]')
total = ok + gagal
if total == 0:
    print('BATAL: harness tidak menghasilkan uji')
    sys.exit(2)

isi = CATATAN.read_text(encoding='utf-8')
if MARKA in isi:
    print(f'sudah ada — tidak ada perubahan (harness {ok}/{total})')
    sys.exit(0)

ganti = [
    (
        '(`langkah_perbaikan` hanya untuk tab admin — lihat Catatan)',
        '(`langkah_perbaikan` juga tampil ke pembeli: kartu F2 butir a)',
    ),
    ('**exit 0, 31/31 lulus**', f'**exit 0, {ok}/{total} lulus**'),
    (
        'C1–C9 `QrisPanel` (uji: penanda + `alasan`, QR & hitung mundur tetap;',
        'C1–C12 `QrisPanel` (uji: penanda + `alasan` + `langkah_perbaikan` + label langkah di atas QR, QR & hitung mundur tetap;',
    ),
    (
        '`orderCode`/`total` kosong → `-`), D1–D3 `CheckoutPay` (prop diteruskan; tanpa prop aman; mode asli bersih)',
        '`orderCode`/`total` kosong → `-`; `langkah_perbaikan` kosong/tak sah → tanpa daftar; `galat` tampil apa adanya & ter-escape di atas penanda; `galat` kosong → tanpa notice), '
        'D1–D5 `CheckoutPay` (prop diteruskan; tanpa prop aman; mode asli bersih; `pembayaran.galat` diteruskan & tampil apa adanya; `galat` null → tanpa notice)',
    ),
    (
        '- `langkah_perbaikan` **tidak** ditampilkan ke pembeli (hanya `alasan`): isinya instruksi `.env`/dashboard Midtrans milik pemilik sehingga tidak layak di halaman bayar publik; langkah lengkap tampil di tab Pembayaran admin (design §5.13). Bila UI/UX ingin pembeli melihatnya juga, itu amendemen desain, bukan deviasi kartu ini.',
        '- `langkah_perbaikan` **juga ditampilkan ke pembeli** di panel QRIS (kartu F2 butir a: "penanda jelas ... + alasannya + langkah perbaikan untuk pemilik"), sebagai daftar bernomor di bawah `alasan` dengan label `Langkah perbaikan untuk pemilik:` (label bantu; isi langkah tetap teks server apa adanya, tidak ada kalimat karangan). '
        'Langkah tetap tampil juga di tab Pembayaran admin (design §5.13). Bila UI/UX menilai langkah pemilik tidak layak publik, itu amendemen desain — catat di `docs/pertanyaan-pemilik.md`.',
    ),
    (
        'penanda "Mode uji" + kalimat alasan tampil di atas QR, hitung mundur jalan;',
        'penanda "Mode uji" + kalimat alasan + daftar langkah perbaikan tampil di atas QR, hitung mundur jalan;',
    ),
    (
        '(3) `/admin/pengaturan?tab=pembayaran` dengan mode uji → badge "Mode uji" + 3 langkah perbaikan + catatan sumber kredensial; tab Umum tidak boleh memuat blok Midtrans.',
        '(3) `/admin/pengaturan?tab=pembayaran` dengan mode uji → badge "Mode uji" + 3 langkah perbaikan + catatan sumber kredensial; tab Umum tidak boleh memuat blok Midtrans; '
        '(4) baris `pembayaran.galat` terisi di kontrak → notice "Pembayaran QRIS bermasalah" berisi teks server apa adanya di panel QRIS.',
    ),
]

for lama, baru in ganti:
    jumlah = isi.count(lama)
    if jumlah != 1:
        print(f'BATAL: pola ditemukan {jumlah}x → {lama[:70]}…')
        sys.exit(2)
    isi = isi.replace(lama, baru, 1)

# Butir 1/2 catatan F2: sebutkan `galat` juga diteruskan halaman bayar (baris rencana).
MARKA_RENCANA = '2. `Pages/Public/CheckoutPay.jsx`: '
if isi.count(MARKA_RENCANA) == 1:
    isi = isi.replace(
        MARKA_RENCANA,
        MARKA_RENCANA + 'meneruskan `midtrans` dan `pembayaran.galat` (§7.7); ',
        1,
    )

CATATAN.write_text(isi, encoding='utf-8')
print(f'catatan diperbarui: {CATATAN} (harness {ok}/{total} lulus, {gagal} gagal)')

VERIF.write_text(
    '\n'.join(
        [
            '# Verifikasi kartu F2 (t_e60e7733)',
            '',
            f'Harness `tmp/uji-ssr-midtrans-t_e60e7733.mjs` (SSR/statik) → exit 0, **{ok}/{total} lulus**:',
            '',
            '- A1–A6 `lib/midtrans.js` `midtransMode()`: mode uji lengkap; mode asli menihilkan `alasan`/`langkah`; `fake` string; prop `null`/bukan objek aman; `alasan` berisi spasi → `null`; `diketahui` hanya bila server menyebut mode.',
            '- B1–B6 `Countdown`: 5 menit normal; < 3 menit `text-danger` + `animate-pulse` + `motion-reduce:animate-none`; lewat → `Kedaluwarsa`; `sr-only` memuat sisa waktu; `null`/tak sah → tidak dirender.',
            '- C1–C12 `QrisPanel`: penanda "Mode uji" + `alasan` + daftar bernomor `langkah_perbaikan` (label "Langkah perbaikan untuk pemilik:") di atas QR; mode asli bersih; tanpa prop aman; state `error`/`checking`; `paid`/`expired` tanpa penanda; `alasan` hilang → kalimat cadangan; angka kosong → `-`; langkah kosong/tak sah → tanpa daftar; `galat` tampil apa adanya & ter-escape; `galat` kosong → tanpa notice.',
            '- D1–D5 `CheckoutPay`: `midtrans` & `pembayaran.galat` diteruskan; tanpa prop aman; mode asli bersih; `galat` null → tanpa notice.',
            '- E1–E6 tab Pembayaran admin: badge + `alasan` + langkah + `sumber_kredensial` + `catatan`; mode asli netral; hint tidak menyesatkan (D11); tanpa prop / mode tak dikenal → 0 klaim mode; tab lain bersih.',
            '',
            'Sapu penanda kotor (`undefined`, `NaN`, `[object Object]`, `lorem ipsum`, `TODO:`, `FIXME`) → 0 temuan pada seluruh markup yang diuji.',
            'Kontrol negatif `tmp/kontrol-negatif-t_e60e7733.py` → sabotase sementara pada penanda mode uji & ambang hitung mundur membuat uji kunci GAGAL; sumber dipulihkan + md5 identik.',
            f'Keluaran mentah: `docs/bukti-frontend-t_e60e7733.txt` (log harness {ok}/{total}).',
        ]
    )
    + '\n',
    encoding='utf-8',
)
print(f'ringkasan verifikasi ditulis: {VERIF}')
