/**
 * Normalisasi `settings.landing_gallery[]` (kontrak §2): `{image, caption, alt}`,
 * urutan array = urutan tampil, maksimum 8. Entri tanpa `image` dibuang; `alt`
 * kosong dipertahankan sebagai string kosong (dekoratif), bukan disalin dari caption.
 * Dipisah dari komponen agar bisa diperiksa tanpa browser: lihat `gallery.check.mjs`.
 */
export const normalizeGallery = (items) =>
    (Array.isArray(items) ? items : [])
        .filter((item) => item && typeof item.image === 'string' && item.image.trim() !== '')
        .slice(0, 8)
        .map((item) => ({
            image: item.image.trim(),
            caption:
                typeof item.caption === 'string' && item.caption.trim() !== ''
                    ? item.caption.trim()
                    : null,
            alt: typeof item.alt === 'string' ? item.alt.trim() : '',
        }));
