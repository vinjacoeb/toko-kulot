// Cek tabel galat Snap — design-v1.1 §7.5. Jalankan: node resources/js/lib/snap-galat.check.mjs
import assert from 'node:assert/strict';
import { snapGalatState } from './snap-galat.js';

const url = 'https://app.sandbox.midtrans.com/snap/v4/redirection/abc';

// Siap: URL ada, tanpa galat.
assert.equal(snapGalatState({ snapUrl: url }), null);
assert.equal(snapGalatState({ snapUrl: url, galat: '   ' }), null);

// Kanal belum aktif: hanya "Hubungi Penjual", tanpa "Muat Ulang".
const kanal = snapGalatState({ snapUrl: null, galat: 'Pembayaran belum bisa dibuat karena kanal pembayaran belum aktif di akun Midtrans penjual.' });
assert.equal(kanal.judul, 'Metode pembayaran belum aktif');
assert.equal(kanal.muatUlang, false);
assert.equal(kanal.hubungi, true);

// Galat umum: pesan server apa adanya + "Coba muat ulang halaman.", hanya "Muat Ulang".
const umum = snapGalatState({ snapUrl: url, galat: 'Gagal membuat pembayaran. Coba lagi.' });
assert.equal(umum.judul, 'Pembayaran belum bisa dibuka');
assert.equal(umum.body, 'Gagal membuat pembayaran. Coba lagi. Coba muat ulang halaman.');
assert.equal(umum.muatUlang, true);
assert.equal(umum.hubungi, false);

// Tanpa URL dan tanpa galat: dua aksi.
const kosong = snapGalatState({ snapUrl: null, galat: null });
assert.equal(kosong.judul, 'Pembayaran belum siap');
assert.equal(kosong.muatUlang, true);
assert.equal(kosong.hubungi, true);

console.log('snap-galat: 4 kasus §7.5 OK');
