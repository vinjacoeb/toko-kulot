/**
 * Normalisasi prop `midtrans` (kontrak §7.5/§7.7/§10.7 — bentuk baku dari
 * `MidtransService::modeInfo()`) supaya dua pemakai UI (QrisPanel §4.4 dan tab
 * Pembayaran admin §5.13) memakai pembacaan yang sama.
 *
 * `mode` = "uji" | "asli"; `fake` boolean (server bisa mengirim string bila
 * konfigurasi di-cache). Prop yang tidak dikirim / di luar bentuk baku
 * diredupkan ke keadaan aman: `diketahui=false`, tanpa alasan, tanpa teks —
 * UI tidak menebak mode pembayaran yang tidak diberitahukan server.
 */
export function midtransMode(midtrans = null) {
    const data = midtrans && typeof midtrans === 'object' ? midtrans : {};
    const flag = data.fake;
    const mode = data.mode === 'uji' || data.mode === 'asli' ? data.mode : null;
    const uji = mode === 'uji' || flag === true || flag === 'true' || flag === 1;
    const teks = (nilai) => (typeof nilai === 'string' && nilai.trim() !== '' ? nilai : null);
    const langkah = Array.isArray(data.langkah_perbaikan)
        ? data.langkah_perbaikan.filter((item) => typeof item === 'string' && item.trim() !== '')
        : [];

    return {
        diketahui: mode !== null || typeof flag === 'boolean',
        uji,
        alasan: uji ? teks(data.alasan) : null,
        langkah: uji ? langkah : [],
        catatan: teks(data.catatan),
        sumberKredensial: teks(data.sumber_kredensial),
    };
}
