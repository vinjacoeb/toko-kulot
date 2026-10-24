/**
 * Tabel galat panel Snap — design-v1.1 §7.5.
 * `galat` server adalah sumber utama; `snap_redirect_url` kosong tanpa galat = panel
 * "Pembayaran belum siap". Kembalikan `null` bila tombol Snap boleh aktif.
 */
export function snapGalatState({ snapUrl = null, galat = null } = {}) {
    const pesan = typeof galat === 'string' && galat.trim() !== '' ? galat.trim() : null;

    if (pesan) {
        if (/kanal pembayaran belum aktif|payment channel is not activated/i.test(pesan)) {
            return {
                judul: 'Metode pembayaran belum aktif',
                body: 'Penjual perlu mengaktifkan kanal pembayaran di akun Midtrans. Hubungi penjual bila perlu.',
                muatUlang: false,
                hubungi: true,
            };
        }

        return {
            judul: 'Pembayaran belum bisa dibuka',
            body: `${pesan} Coba muat ulang halaman.`,
            muatUlang: true,
            hubungi: false,
        };
    }

    if (snapUrl) return null;

    return {
        judul: 'Pembayaran belum siap',
        body: 'Tautan pembayaran belum tersedia. Coba muat ulang atau hubungi penjual.',
        muatUlang: true,
        hubungi: true,
    };
}
