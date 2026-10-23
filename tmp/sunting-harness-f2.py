"""Dua sisa suntingan harness t_e60e7733: fixture `galat` + uji D4/D5. Idempoten.

    python tmp/sunting-harness-f2.py
"""
import pathlib
import re
import sys

BERKAS = pathlib.Path('tmp/uji-ssr-midtrans-t_e60e7733.mjs')
isi = BERKAS.read_text(encoding='utf-8')
awal = isi

anchor_fixture = "    expires_at: menitKeDepan(4, 30),\n    paid_at: null,\n};"
if 'galat: null,' not in isi:
    if isi.count(anchor_fixture) != 1:
        print('BATAL: jangkar fixture tidak unik'); sys.exit(2)
    isi = isi.replace(anchor_fixture, anchor_fixture.replace('    paid_at: null,\n};', '    paid_at: null,\n    galat: null,\n};'), 1)

blok_d = """uji('D4 CheckoutPay: `pembayaran.galat` diteruskan ke QrisPanel (kontrak §7.7)', () => {
    const markup = render(CheckoutPay, { pesanan: PESANAN, pembayaran: { ...PEMBAYARAN, galat: GALAT_BAYAR }, midtrans: MODE_UJI });
    const isi = teks(markup);
    harus(isi.includes('Selesaikan Pembayaran'), 'panel QRIS harus dirender');
    harus(isi.includes(GALAT_BAYAR), 'teks galat server harus tampil apa adanya');

    return 'galat server tampil di halaman bayar';
});
uji('D5 CheckoutPay: `pembayaran.galat` null → tanpa notice galat', () => {
    const markup = render(CheckoutPay, { pesanan: PESANAN, pembayaran: PEMBAYARAN, midtrans: MODE_ASLI });
    const isi = teks(markup);
    harus(!isi.includes('Pembayaran QRIS bermasalah'), 'tanpa galat tidak ada notice galat');
    harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(', ')}`);

    return '0 notice galat, 0 penanda kotor';
});
"""
if 'D4 CheckoutPay' not in isi:
    batas = re.search(r'^// ── E\.', isi, re.M)
    if not batas:
        print('BATAL: penanda bagian E tidak ditemukan'); sys.exit(2)
    isi = isi[:batas.start()] + blok_d + isi[batas.start():]

if isi != awal:
    BERKAS.write_text(isi, encoding='utf-8')
    print('harness disunting (fixture galat + D4/D5)')
else:
    print('sudah ada — tidak ada perubahan')
