<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\MediaStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Penulisan produk dari panel admin: produk + varian + galeri dalam SATU transaksi
 * (kontrak props §12.3, §12.6).
 *
 * Stok varian tidak pernah ditulis di sini — semua perubahan stok lewat StockService
 * supaya riwayat `stock_movements` tetap lengkap.
 */
class ProductAdminService
{
    public function __construct(private readonly StockService $stock) {}

    /**
     * @param  array<string, mixed>  $data  data tervalidasi StoreProductRequest
     * @param  list<UploadedFile>  $images
     */
    public function create(array $data, array $images, ?int $adminId = null): Product
    {
        return DB::transaction(function () use ($data, $images, $adminId): Product {
            $product = Product::query()->create($this->attributes($data));

            $this->storeImages($product, $images, $data['images_alt'] ?? []);
            $this->syncVariants($product, $data['variants'] ?? [], $adminId);

            return $product;
        });
    }

    /**
     * @param  array<string, mixed>  $data  data tervalidasi UpdateProductRequest
     * @param  list<UploadedFile>  $images
     */
    public function update(Product $product, array $data, array $images, ?int $adminId = null): Product
    {
        return DB::transaction(function () use ($product, $data, $images, $adminId): Product {
            $product->forceFill($this->attributes($data, $product))->save();

            $this->deleteImages($product, $data['hapus_images'] ?? []);
            $this->storeImages($product, $images, $data['images_alt'] ?? []);
            $this->setPrimaryImage($product, $data['primary_image_id'] ?? null);
            $this->syncVariants($product, $data['variants'] ?? [], $adminId);

            return $product;
        });
    }

    /**
     * Hapus produk beserta berkas galerinya. Varian ikut terhapus lewat CASCADE —
     * pemanggil (controller) yang memastikan produk belum dipakai pesanan.
     */
    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product): void {
            foreach ($product->images()->pluck('path') as $path) {
                MediaStorage::delete(is_string($path) ? $path : null);
            }

            $product->delete();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data, ?Product $product = null): array
    {
        return [
            'category_id' => (int) $data['category_id'],
            'name' => trim((string) $data['name']),
            'slug' => $this->uniqueSlug((string) ($data['slug'] ?? ''), (string) $data['name'], $product),
            'sku' => trim((string) $data['sku']),
            'description' => $this->text($data['description'] ?? null),
            'short_description' => $this->text($data['short_description'] ?? null),
            'base_price' => (int) $data['base_price'],
            'compare_price' => $this->integer($data['compare_price'] ?? null),
            'wholesale_price' => $this->integer($data['wholesale_price'] ?? null),
            'min_wholesale_qty' => (int) ($data['min_wholesale_qty'] ?? 0),
            'weight_gram' => (int) ($data['weight_gram'] ?? 0),
            'is_active' => $this->flag($data, 'is_active', $product?->is_active ?? true),
            'is_featured' => $this->flag($data, 'is_featured', $product?->is_featured ?? false),
        ];
    }

    /**
     * Slug dari input atau dari nama; ditambah akhiran angka bila sudah dipakai.
     */
    private function uniqueSlug(string $slug, string $name, ?Product $product): string
    {
        $base = Str::slug($slug !== '' ? $slug : $name);

        if ($base === '') {
            throw ValidationException::withMessages([
                'slug' => 'Slug tidak bisa dibuat dari nama produk — isi slug manual.',
            ]);
        }

        $candidate = $base;
        $suffix = 2;

        while (Product::query()
            ->where('slug', $candidate)
            ->when($product, fn ($query) => $query->whereKeyNot($product->id))
            ->exists()) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    /**
     * Selaraskan varian dengan kiriman form: baris ber-`id` diperbarui, baris tanpa
     * `id` dibuat, varian lama yang hilang dihapus (atau dinonaktifkan bila sudah
     * dipakai pesanan / punya riwayat stok).
     *
     * @param  list<array<string, mixed>>  $rows
     */
    private function syncVariants(Product $product, array $rows, ?int $adminId): void
    {
        $existing = $product->variants()->get()->keyBy('id');
        $kept = [];
        $seenSkus = [];

        foreach (array_values($rows) as $index => $row) {
            $variant = isset($row['id']) && $row['id'] !== null
                ? $existing->get((int) $row['id'])
                : null;

            if (isset($row['id']) && $row['id'] !== null && ! $variant) {
                throw ValidationException::withMessages([
                    'variants' => sprintf('Varian baris %d bukan milik produk ini.', $index + 1),
                ]);
            }

            $sku = trim((string) ($row['sku'] ?? ''));

            if ($sku === '') {
                $sku = $this->variantSku($product, $row, $seenSkus, $variant);
            }

            if (in_array($sku, $seenSkus, true)) {
                throw ValidationException::withMessages([
                    'variants' => 'SKU varian tidak boleh ganda di satu produk: '.$sku.'.',
                ]);
            }

            if (ProductVariant::query()
                ->where('sku', $sku)
                ->when($variant, fn ($query) => $query->whereKeyNot($variant->id))
                ->exists()) {
                throw ValidationException::withMessages([
                    'variants' => 'SKU varian '.$sku.' sudah dipakai varian lain.',
                ]);
            }

            $seenSkus[] = $sku;

            $attributes = [
                'size' => $this->text($row['size'] ?? null),
                'color' => $this->text($row['color'] ?? null),
                'sku' => $sku,
                'price_delta' => (int) ($row['price_delta'] ?? 0),
                'is_active' => $this->flag($row, 'is_active', $variant?->is_active ?? true),
            ];

            $target = isset($row['stock']) && $row['stock'] !== null && $row['stock'] !== ''
                ? (int) $row['stock']
                : null;

            if ($variant) {
                $variant->forceFill($attributes)->save();
                $kept[] = $variant->id;

                if ($target !== null) {
                    $this->stock->adjustTo(
                        $variant->fresh(),
                        $target,
                        'Penyesuaian stok dari form produk',
                        $adminId,
                    );
                }

                continue;
            }

            $variant = $product->variants()->create($attributes + ['stock' => 0]);
            $kept[] = $variant->id;

            if ($target !== null && $target > 0) {
                $this->stock->increase($variant, $target, 'Stok awal varian', $adminId);
            }
        }

        foreach ($existing as $id => $variant) {
            if (in_array($id, $kept, true)) {
                continue;
            }

            if ($variant->orderItems()->exists() || $variant->stockMovements()->exists()) {
                $variant->forceFill(['is_active' => false])->save();

                continue;
            }

            $variant->delete();
        }
    }

    /**
     * SKU varian otomatis `{sku-produk}-{ukuran}-{warna}` (kontrak §12.3), dijaga unik.
     *
     * @param  list<string>  $seen
     * @param  array<string, mixed>  $row
     */
    private function variantSku(Product $product, array $row, array $seen, ?ProductVariant $variant): string
    {
        $parts = array_filter([
            trim((string) $product->sku),
            $this->skuPart($row['size'] ?? null),
            $this->skuPart($row['color'] ?? null),
        ], fn (string $part) => $part !== '');

        $base = implode('-', $parts);
        $candidate = $base;
        $suffix = 2;

        while (in_array($candidate, $seen, true)
            || ProductVariant::query()
                ->where('sku', $candidate)
                ->when($variant, fn ($query) => $query->whereKeyNot($variant->id))
                ->exists()) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    private function skuPart(mixed $value): string
    {
        $text = trim((string) $value);

        return $text === '' ? '' : Str::upper(Str::slug($text));
    }

    /**
     * @param  list<UploadedFile>  $files
     * @param  array<int, mixed>  $alts
     */
    private function storeImages(Product $product, array $files, array $alts): void
    {
        $files = array_values(array_filter($files));

        if ($files === []) {
            return;
        }

        $sort = (int) $product->images()->max('sort_order');
        $hasPrimary = $product->images()->where('is_primary', true)->exists();

        foreach ($files as $index => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $alt = trim((string) ($alts[$index] ?? ''));
            $sort++;

            $product->images()->create([
                'path' => MediaStorage::store($file, 'produk'),
                'alt' => $alt !== '' ? $alt : $product->name,
                'sort_order' => $sort,
                'is_primary' => ! $hasPrimary,
            ]);

            $hasPrimary = true;
        }
    }

    /**
     * @param  array<int, mixed>  $ids
     */
    private function deleteImages(Product $product, array $ids): void
    {
        $ids = array_values(array_filter(array_map(
            fn (mixed $id) => is_numeric($id) ? (int) $id : null,
            $ids,
        )));

        if ($ids === []) {
            return;
        }

        foreach ($product->images()->whereIn('id', $ids)->get() as $image) {
            MediaStorage::delete($image->path);
            $image->delete();
        }

        if (! $product->images()->where('is_primary', true)->exists()) {
            $next = $product->images()->orderBy('sort_order')->orderBy('id')->first();

            if ($next) {
                $next->forceFill(['is_primary' => true])->save();
            }
        }
    }

    private function setPrimaryImage(Product $product, mixed $imageId): void
    {
        if ($imageId === null || $imageId === '') {
            return;
        }

        $image = $product->images()->whereKey((int) $imageId)->first();

        if (! $image) {
            throw ValidationException::withMessages([
                'primary_image_id' => 'Gambar utama harus salah satu gambar produk ini.',
            ]);
        }

        $product->images()->whereKeyNot($image->id)->update(['is_primary' => false]);
        $image->forceFill(['is_primary' => true])->save();
    }

    private function text(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $text = trim((string) $value);

        return $text === '' ? null : $text;
    }

    private function integer(mixed $value): ?int
    {
        return $value === null || $value === '' ? null : (int) $value;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function flag(array $data, string $key, bool $default): bool
    {
        if (! array_key_exists($key, $data) || $data[$key] === null) {
            return $default;
        }

        return filter_var($data[$key], FILTER_VALIDATE_BOOLEAN);
    }
}
