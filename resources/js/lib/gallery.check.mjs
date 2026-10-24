/**
 * Cek cepat tanpa framework: `node resources/js/lib/gallery.check.mjs`
 * Menjaga aturan kontrak §2 dan design-v1.1 §4.3 (buang entri tanpa gambar,
 * maksimum 8, alt kosong tetap dekoratif, caption kosong = null).
 */
import assert from 'node:assert/strict';
import { normalizeGallery } from './gallery.js';

assert.deepEqual(normalizeGallery(null), [], 'null → galeri kosong');
assert.deepEqual(normalizeGallery({}), [], 'bukan array → galeri kosong');

const input = [
    { image: '  a.jpg ', caption: '  ', alt: '  ' },
    { image: '', caption: 'dibuang' },
    { caption: 'tanpa gambar' },
    null,
    { image: 'b.jpg', caption: 'Bahan rayon', alt: 'Daster rayon' },
];
const out = normalizeGallery(input);
assert.equal(out.length, 2, 'hanya entri bergambar');
assert.deepEqual(out[0], { image: 'a.jpg', caption: null, alt: '' }, 'trim + caption kosong null');
assert.deepEqual(out[1], { image: 'b.jpg', caption: 'Bahan rayon', alt: 'Daster rayon' });

const many = Array.from({ length: 12 }, (_, i) => ({ image: `${i}.jpg` }));
assert.equal(normalizeGallery(many).length, 8, 'maksimum 8 (kontrak §2)');

console.log('gallery.check: ok');
