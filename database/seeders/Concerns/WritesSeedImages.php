<?php

namespace Database\Seeders\Concerns;

use RuntimeException;

/**
 * Pembuat gambar placeholder seed (PRD §10: aset sementara lokal di public/images/).
 *
 * Gambar dibuat di mesin sendiri dengan GD — tidak mengunduh aset dari internet.
 * Warna dipilih deterministik dari nama berkas (crc32) sehingga seed berulang
 * menghasilkan berkas yang sama persis.
 */
trait WritesSeedImages
{
    /**
     * Tulis PNG placeholder dan kembalikan URL path absolut untuk kolom gambar
     * (lihat docs/kontrak-props.md §3).
     */
    protected function seedImage(string $relativePath, int $width, int $height, string $label): string
    {
        if (! extension_loaded('gd')) {
            throw new RuntimeException(
                'Ekstensi GD wajib aktif untuk membuat gambar placeholder seed (public/images/seed/).'
            );
        }

        $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
        $absolute = public_path($relativePath);
        $directory = dirname($absolute);

        if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
            throw new RuntimeException("Tidak bisa membuat folder gambar seed: {$directory}");
        }

        $palettes = [
            ['#F7F3EA', '#1F3D2B', '#F5B301'],
            ['#EDE7DC', '#7A3B2E', '#F5B301'],
            ['#F2F4F3', '#264653', '#E9C46A'],
            ['#FBF2E4', '#8A5A24', '#2A9D8F'],
            ['#EEF1F5', '#33415C', '#F5B301'],
            ['#F5EDF0', '#6B2D46', '#E9C46A'],
        ];

        [$backgroundHex, $bandHex, $accentHex] = $palettes[crc32($relativePath) % count($palettes)];

        $image = imagecreatetruecolor($width, $height);
        if ($image === false) {
            throw new RuntimeException('Gagal membuat kanvas gambar seed.');
        }

        $background = $this->allocateHex($image, $backgroundHex);
        $band = $this->allocateHex($image, $bandHex);
        $accent = $this->allocateHex($image, $accentHex);
        $white = $this->allocateHex($image, '#FFFFFF');

        imagefilledrectangle($image, 0, 0, $width, $height, $background);
        imagefilledrectangle($image, 0, (int) round($height * 0.76), $width, $height, $band);
        imagefilledrectangle($image, 0, (int) round($height * 0.76), $width, (int) round($height * 0.76) + max(4, (int) round($height * 0.01)), $accent);

        $font = 5;
        $text = strtoupper(trim($label));
        $maxCharacters = max(4, (int) floor(($width - 32) / imagefontwidth($font)));
        if (strlen($text) > $maxCharacters) {
            $text = substr($text, 0, $maxCharacters);
        }

        $textWidth = imagefontwidth($font) * strlen($text);
        $textX = max(8, (int) round(($width - $textWidth) / 2));
        $textY = (int) round($height * 0.76 + ($height * 0.24 - imagefontheight($font)) / 2);

        imagestring($image, $font, $textX, $textY, $text, $white);

        if (imagepng($image, $absolute, 9) === false) {
            imagedestroy($image);
            throw new RuntimeException("Gagal menulis gambar seed: {$absolute}");
        }

        imagedestroy($image);

        return '/'.$relativePath;
    }

    private function allocateHex(\GdImage $image, string $hex): int
    {
        $hex = ltrim($hex, '#');
        $red = (int) hexdec(substr($hex, 0, 2));
        $green = (int) hexdec(substr($hex, 2, 2));
        $blue = (int) hexdec(substr($hex, 4, 2));

        return (int) imagecolorallocate($image, $red, $green, $blue);
    }
}
