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

    /**
     * Tulis favicon cadangan `public/favicon.ico` (ICO 32×32 berisi PNG) bila
     * berkas belum ada atau masih 0 byte. Berkas milik pemilik tidak ditimpa.
     * Dipakai `SettingSeeder` sebagai fallback sebelum admin mengunggah favicon.
     */
    protected function seedFaviconIco(string $relativePath = 'favicon.ico'): string
    {
        if (! extension_loaded('gd')) {
            throw new RuntimeException(
                'Ekstensi GD wajib aktif untuk membuat favicon seed (public/favicon.ico).'
            );
        }

        $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
        $absolute = public_path($relativePath);
        $url = '/'.$relativePath;

        if (is_file($absolute) && filesize($absolute) > 0) {
            return $url;
        }

        $directory = dirname($absolute);

        if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
            throw new RuntimeException("Tidak bisa membuat folder favicon seed: {$directory}");
        }

        $size = 32;
        $image = imagecreatetruecolor($size, $size);

        if ($image === false) {
            throw new RuntimeException('Gagal membuat kanvas favicon seed.');
        }

        $background = $this->allocateHex($image, '#1F3D2B');
        $accent = $this->allocateHex($image, '#F5B301');
        $white = $this->allocateHex($image, '#FFFFFF');

        imagefilledrectangle($image, 0, 0, $size, $size, $background);
        imagefilledrectangle($image, 0, $size - 4, $size, $size, $accent);

        $font = 5;
        $text = 'TK';
        $textX = (int) round(($size - imagefontwidth($font) * strlen($text)) / 2);
        $textY = (int) round(($size - imagefontheight($font)) / 2);
        imagestring($image, $font, $textX, $textY, $text, $white);

        ob_start();
        $encoded = imagepng($image, null, 9);
        $png = ob_get_clean();

        imagedestroy($image);

        if ($encoded === false || ! is_string($png) || $png === '') {
            throw new RuntimeException("Gagal meng-encode favicon seed: {$absolute}");
        }

        // Struktur ICO: ICONDIR (6 byte) + ICONDIRENTRY (16 byte) + data PNG.
        $icon = pack('vvv', 0, 1, 1)
            .pack('CCCCvvVV', $size, $size, 0, 0, 1, 32, strlen($png), 22)
            .$png;

        if (file_put_contents($absolute, $icon) === false) {
            throw new RuntimeException("Gagal menulis favicon seed: {$absolute}");
        }

        return $url;
    }
}
