// Check mandiri: node resources/js/lib/ekspedisi.check.mjs
import assert from 'node:assert/strict';
import { katalogKurir, kunciLayanan, layananKurir } from './ekspedisi.mjs';

const daftar = [
    { courier_code: 'jne', courier_name: 'JNE', service_code: 'reg', service_name: 'REG', etd: '2-3 hari' },
    { courier_code: 'jne', courier_name: 'JNE', service_code: 'yes', service_name: 'YES', etd: null },
    { courier_code: 'sicepat', courier_name: null, service_code: 'best', service_name: 'BEST' },
    { courier_code: '', courier_name: 'Kosong', service_code: 'x' },
];

assert.deepEqual(katalogKurir(daftar), [
    { value: 'jne', label: 'JNE (jne)' },
    { value: 'sicepat', label: 'sicepat (sicepat)' },
]);

assert.deepEqual(
    layananKurir(daftar, 'jne').map(kunciLayanan),
    ['jne:reg', 'jne:yes']
);
assert.deepEqual(layananKurir(daftar, ''), []);
assert.deepEqual(layananKurir(null, 'jne'), []);
assert.deepEqual(katalogKurir(undefined), []);

// Duplikat: kunci yang sama dari katalog dan baris tersimpan harus bentrok.
assert.equal(kunciLayanan({ courier_code: 'jne', service_code: 'reg' }), 'jne:reg');
assert.equal(kunciLayanan({}), ':');
assert.equal(kunciLayanan(null), ':');

// Kasus angka/boolean dari server tidak boleh jadi "undefined" pada kunci.
assert.equal(kunciLayanan({ courier_code: 0, service_code: false }), '0:false');

console.log('ekspedisi.check.mjs: ok');
