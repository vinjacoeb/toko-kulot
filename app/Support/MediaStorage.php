<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Penyimpanan berkas gambar unggahan admin (PRD §11: jpg/png/webp, maks 2 MB).
 *
 * Nama berkas selalu dibuat server, path yang disimpan berbentuk `/storage/<folder>/<nama>`
 * sehingga frontend bisa memakainya langsung sebagai `src`.
 */
final class MediaStorage
{
    public const PREFIX = '/storage/';

    /**
     * Simpan unggahan ke disk `public` dan kembalikan path publiknya.
     */
    public static function store(UploadedFile $file, string $directory): string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === '') {
            $extension = strtolower((string) $file->extension()) ?: 'jpg';
        }

        $name = Str::random(32).'.'.$extension;

        Storage::disk('public')->putFileAs($directory, $file, $name);

        return self::PREFIX.$directory.'/'.$name;
    }

    /**
     * Hapus berkas lama bila path-nya memang berkas unggahan (`/storage/...`).
     * Path aset bawaan repo dibiarkan.
     */
    public static function delete(?string $path): void
    {
        if ($path === null || ! str_starts_with($path, self::PREFIX)) {
            return;
        }

        $relative = Str::after($path, self::PREFIX);

        if ($relative === '') {
            return;
        }

        Storage::disk('public')->delete($relative);
    }
}
