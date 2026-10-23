"""Sisipkan blok Verifikasi + Catatan kartu F2 (t_e60e7733) ke docs/catatan-frontend.md.

Idempoten: bila penanda verifikasi F2 sudah ada, tidak menulis apa pun.
Menjaga gaya akhir baris berkas asli (CRLF).

Jalankan dari root repo:
    python tmp/sisip-f2-catatan.py
"""
import pathlib
import sys

BERKAS = pathlib.Path('docs/catatan-frontend.md')
SUMBER_BLOK = pathlib.Path('tmp/f2-verifikasi.md')
MARKA = 'Verifikasi (dijalankan 21 Okt 2026; keluaran mentah ada di `docs/bukti-frontend-t_e60e7733.txt`)'
RENCANA_LAMA = (
    '3. `QrisPanel`: prop `midtrans`; notice `InlineNotice` `warning` "Mode uji" + `alasan` + '
    '`langkah_perbaikan` di atas QR; hitung mundur juga tampil pada state `error` (design §4.4).'
)
RENCANA_BARU = (
    '3. `QrisPanel`: prop `midtrans`; notice `InlineNotice` `warning` "Mode uji" + `alasan` di atas QR '
    '(`langkah_perbaikan` hanya untuk tab admin — lihat Catatan); hitung mundur juga tampil pada state `error` (design §4.4).'
)
JANGKAR = 'Pembeli melihat penanda tepat di atas kode QR.'

isi = BERKAS.read_text(encoding='utf-8')
akhir = '\r\n' if '\r\n' in isi else '\n'

if MARKA in isi:
    print('sudah ada — tidak ada perubahan')
    sys.exit(0)

for pola, nama in ((RENCANA_LAMA, 'rencana butir 3'), (JANGKAR, 'jangkar akhir temuan F2')):
    jumlah = isi.count(pola)
    if jumlah != 1:
        print(f'BATAL: {nama} ditemukan {jumlah}x (harus 1)')
        sys.exit(2)

isi = isi.replace(RENCANA_LAMA, RENCANA_BARU)
blok = SUMBER_BLOK.read_text(encoding='utf-8').strip('\n').replace('\n', akhir)
isi = isi.replace(JANGKAR, JANGKAR + akhir + akhir + blok, 1)

BERKAS.write_text(isi, encoding='utf-8', newline='')
print(f'disisipkan: {BERKAS} (+{len(blok.splitlines())} baris), gaya akhir baris {"CRLF" if akhir == chr(13) + chr(10) else "LF"}')
