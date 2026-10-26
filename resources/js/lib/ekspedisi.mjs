// Logika katalog ekspedisi (design-v1.2 §8.2). Dipakai halaman admin dan check node.
export const kunciLayanan = (row) =>
    `${row?.courier_code === null || row?.courier_code === undefined ? '' : String(row.courier_code)}:` +
    `${row?.service_code === null || row?.service_code === undefined ? '' : String(row.service_code)}`;

const teks = (value) => (value === null || value === undefined ? '' : String(value));

/** Opsi dropdown Kurir: satu baris per `courier_code`, label `{courier_name} ({courier_code})`. */
export const katalogKurir = (daftar) => {
    const peta = new Map();

    (Array.isArray(daftar) ? daftar : []).forEach((item) => {
        const row = item && typeof item === 'object' ? item : {};
        const kode = teks(row.courier_code);
        if (kode === '' || peta.has(kode)) return;
        peta.set(kode, `${teks(row.courier_name) || kode} (${kode})`);
    });

    return [...peta.entries()].map(([value, label]) => ({ value, label }));
};

/** Layanan pada katalog untuk satu `courier_code`; kosong bila kurir belum dipilih. */
export const layananKurir = (daftar, kodeKurir) => {
    if (teks(kodeKurir) === '') return [];
    return (Array.isArray(daftar) ? daftar : []).filter(
        (item) => item && typeof item === 'object' && teks(item.courier_code) === teks(kodeKurir)
    );
};
