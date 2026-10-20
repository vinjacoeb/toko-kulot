/**
 * Helper format bersama — kontrak: docs/komponen.md §6.
 * Uang selalu integer rupiah dari server (PRD A13); format hanya di klien.
 */

/** Gabung kelas kondisional tanpa dependensi tambahan. */
export const cn = (...classes) => classes.flat().filter(Boolean).join(' ');

/** Integer rupiah -> "Rp149.000". Nilai kosong/tidak valid -> null (pemanggil menampilkan "-"). */
export const rupiah = (value) => {
    if (value === null || value === undefined || value === '') return null;

    const number = Number(value);
    if (!Number.isFinite(number)) return null;

    return `Rp${Math.round(number).toLocaleString('id-ID')}`;
};

/** Angka biasa -> "1.234". Nilai kosong/tidak valid -> "0". */
export const formatNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number.toLocaleString('id-ID') : '0';
};

/** Tanggal ISO -> "20 Okt 2026". Nilai kosong/tidak valid -> "-". */
export const formatDate = (value) => {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Tanggal ISO -> "20 Okt 2026, 14.05". Nilai kosong/tidak valid -> "-". */
export const formatDateTime = (value) => {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '-';

    return `${date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })}, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * Kolom JSON dari pengaturan admin bisa datang sebagai array atau string JSON.
 * Selalu kembalikan array agar map() aman.
 */
export const toList = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string' && value.trim() !== '') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
};

/** Objek pengaturan bisa datang sebagai string JSON juga. */
export const toObject = (value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;

    if (typeof value === 'string' && value.trim() !== '') {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch {
            return {};
        }
    }

    return {};
};
