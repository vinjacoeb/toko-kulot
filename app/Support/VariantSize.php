<?php

namespace App\Support;

/**
 * Urutan ukuran varian yang baku untuk tampilan publik (design §5.2, FilterPanel).
 *
 * Dipakai dua tempat: urutan `variants[]` pada kartu/detail produk dan urutan daftar
 * `sizes` pada katalog, supaya filter ukuran tidak tampil acak. Ukuran di luar daftar
 * ini ditaruh paling belakang, urut abjad.
 */
final class VariantSize
{
    /** @var array<int, string> */
    public const ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL', '5XL', 'ALL SIZE'];

    /**
     * Peringkat urut ukuran; ukuran di luar daftar baku dapat peringkat terakhir.
     */
    public static function rank(?string $size): int
    {
        $needle = strtoupper(trim((string) $size));
        $index = array_search($needle, self::ORDER, true);

        return $index === false ? count(self::ORDER) : $index;
    }

    /**
     * @param  array<int, string|null>  $sizes
     * @return array<int, string>
     */
    public static function sort(array $sizes): array
    {
        $clean = [];

        foreach ($sizes as $size) {
            $size = trim((string) $size);

            if ($size !== '') {
                $clean[$size] = $size;
            }
        }

        $clean = array_values($clean);

        usort($clean, fn ($a, $b) => [self::rank($a), strtoupper($a)] <=> [self::rank($b), strtoupper($b)]);

        return $clean;
    }
}
