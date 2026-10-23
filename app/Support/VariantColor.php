<?php

namespace App\Support;

/**
 * Peta nama warna varian → hex untuk swatch publik (kontrak props §8.3
 * `variants[].color_hex`).
 *
 * Warna disimpan sebagai nama di `product_variants.color` (PRD §6 tidak memuat
 * kolom hex), jadi nilai siap pakai diturunkan di server: frontend tidak perlu
 * menebak nama warna dan tidak ada kolom baru di luar `docs/db.md`.
 *
 * Aturan pencocokan:
 * 1. `#RGB` / `#RRGGBB` diteruskan sebagai `#RRGGBB` huruf besar (jalan keluar
 *    untuk warna khusus tanpa mengubah skema).
 * 2. Nama dinormalisasi (huruf kecil, tanda baca → spasi), lalu dicocokkan persis.
 * 3. Bila tidak persis, dicari kata kunci terpanjang yang muncul sebagai kata utuh
 *    ("Biru Dongker" menang atas "Biru"; "Merah Marun" → marun).
 * 4. Tidak dikenal → `null`; frontend menampilkan lingkaran netral + label nama,
 *    bukan warna karangan.
 */
final class VariantColor
{
    /**
     * Nama warna baku (huruf kecil) → `#RRGGBB`.
     *
     * @var array<string, string>
     */
    public const PALETTE = [
        'hitam' => '#111827',
        'putih' => '#FFFFFF',
        'putih tulang' => '#F7F3EA',
        'krem' => '#EFE3CB',
        'cream' => '#EFE3CB',
        'beige' => '#D9C7A7',
        'nude' => '#E3C6B5',
        'abu abu' => '#9CA3AF',
        'abu' => '#9CA3AF',
        'grey' => '#9CA3AF',
        'gray' => '#9CA3AF',
        'silver' => '#C0C0C0',
        'merah' => '#DC2626',
        'merah bata' => '#B91C1C',
        'marun' => '#7F1D1D',
        'maroon' => '#7F1D1D',
        'pink' => '#F472B6',
        'dusty pink' => '#D8A7B1',
        'salem' => '#F08080',
        'salmon' => '#FA8072',
        'fuchsia' => '#D946EF',
        'magenta' => '#D946EF',
        'ungu' => '#7C3AED',
        'lavender' => '#C4B5FD',
        'biru' => '#2563EB',
        'biru muda' => '#93C5FD',
        'biru dongker' => '#1E3A8A',
        'navy' => '#1E3A8A',
        'tosca' => '#14B8A6',
        'toska' => '#14B8A6',
        'hijau' => '#16A34A',
        'hijau muda' => '#86EFAC',
        'sage' => '#A3B18A',
        'olive' => '#6B7B3A',
        'army' => '#4B5320',
        'kuning' => '#FACC15',
        'mustard' => '#D4A017',
        'emas' => '#D4AF37',
        'gold' => '#D4AF37',
        'oranye' => '#F97316',
        'orange' => '#F97316',
        'cokelat' => '#92400E',
        'coklat' => '#92400E',
        'brown' => '#92400E',
        'milo' => '#6B4226',
        'kopi' => '#6F4E37',
        'peach' => '#FFCBA4',
        'coral' => '#FF7F50',
    ];

    /**
     * Hex `#RRGGBB` untuk nama warna; `null` bila kosong atau tidak dikenal.
     */
    public static function hex(?string $color): ?string
    {
        $raw = trim((string) $color);

        if ($raw === '') {
            return null;
        }

        if (preg_match('/^#([0-9a-f]{3}|[0-9a-f]{6})$/i', $raw, $cocok) === 1) {
            $hex = strtoupper($cocok[1]);

            if (strlen($hex) === 3) {
                $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
            }

            return '#'.$hex;
        }

        $nama = self::normalisasi($raw);

        if ($nama === '') {
            return null;
        }

        if (isset(self::PALETTE[$nama])) {
            return self::PALETTE[$nama];
        }

        foreach (self::kunciTerpanjang() as $kunci) {
            $pola = '/(?<![a-z0-9])'.preg_quote($kunci, '/').'(?![a-z0-9])/';

            if (preg_match($pola, $nama) === 1) {
                return self::PALETTE[$kunci];
            }
        }

        return null;
    }

    /**
     * Kunci peta diurut panjang turun lalu abjad, supaya kata kunci spesifik
     * ("biru dongker") menang atas kata kunci umum ("biru").
     *
     * @return array<int, string>
     */
    private static function kunciTerpanjang(): array
    {
        static $kunci = null;

        if ($kunci === null) {
            $kunci = array_keys(self::PALETTE);
            usort($kunci, fn (string $a, string $b): int => (strlen($b) <=> strlen($a)) ?: strcmp($a, $b));
        }

        return $kunci;
    }

    private static function normalisasi(string $color): string
    {
        $color = strtolower(trim($color));
        $color = preg_replace('/[^a-z0-9]+/', ' ', $color) ?? '';

        return trim(preg_replace('/\s+/', ' ', $color) ?? '');
    }
}
