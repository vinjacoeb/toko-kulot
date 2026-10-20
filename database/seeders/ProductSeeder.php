<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use Database\Seeders\Concerns\SyncsVariantStock;
use Database\Seeders\Concerns\WritesSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * 12 produk contoh (PRD §16: minimal 12, maksimal 24) beserta gambar, varian,
 * dan pergerakan stok awal. Stok tidak pernah diisi langsung: nilai
 * `product_variants.stock` selalu hasil hitung dari `stock_movements`.
 *
 * Data sengaja deterministik (tanpa fake()/acak) supaya seed berulang menghasilkan
 * baris yang sama (R13). SKU varian = "{sku produk}-{ukuran}-{3 huruf warna}".
 */
class ProductSeeder extends Seeder
{
    use SyncsVariantStock;
    use WritesSeedImages;

    /**
     * @var array<int, array{
     *     slug: string, name: string, sku: string, category: string,
     *     base_price: int, compare_price?: int|null, wholesale_price: int, min_wholesale_qty: int,
     *     weight_gram: int, is_featured: bool, stock: int,
     *     sizes: array<int, string>, colors: array<int, string>,
     *     short_description: string, description: string
     * }>
     */
    private const PRODUCTS = [
        [
            'slug' => 'daster-batik-pekalongan-lengan-pendek',
            'name' => 'Daster Batik Pekalongan Lengan Pendek',
            'sku' => 'DSR-BTK-PKL',
            'category' => 'daster',
            'base_price' => 89000,
            'compare_price' => 109000,
            'wholesale_price' => 78000,
            'min_wholesale_qty' => 6,
            'weight_gram' => 250,
            'is_featured' => true,
            'stock' => 24,
            'sizes' => ['M', 'L', 'XL'],
            'colors' => ['Cokelat', 'Navy'],
            'short_description' => 'Daster batik cap motif klasik, bahan rayon adem untuk harian.',
            'description' => '[CONTOH] Daster batik cap Pekalongan dengan bahan rayon viscose. '
                .'Jahitan rapi di bagian lengan dan bawah, tidak menerawang. '
                .'Tersedia harga grosir mulai 6 pcs untuk reseller.',
        ],
        [
            'slug' => 'daster-santorini-katun-jumbo',
            'name' => 'Daster Santorini Katun Jumbo',
            'sku' => 'DSR-SNT-JMB',
            'category' => 'daster',
            'base_price' => 99000,
            'compare_price' => 125000,
            'wholesale_price' => 87000,
            'min_wholesale_qty' => 6,
            'weight_gram' => 260,
            'is_featured' => true,
            'stock' => 18,
            'sizes' => ['L', 'XL'],
            'colors' => ['Biru Muda'],
            'short_description' => 'Motif santorini, potongan jumbo, nyaman untuk ibu menyusui.',
            'description' => '[CONTOH] Daster katun jumbo dengan motif santorini. '
                .'Potongan longgar, panjang sampai mata kaki, cocok untuk harian di rumah.',
        ],
        [
            'slug' => 'daster-busui-friendly-motif-bunga',
            'name' => 'Daster Busui Friendly Motif Bunga',
            'sku' => 'DSR-BSU-BNG',
            'category' => 'daster',
            'base_price' => 109000,
            'wholesale_price' => 96000,
            'min_wholesale_qty' => 6,
            'weight_gram' => 270,
            'is_featured' => false,
            'stock' => 15,
            'sizes' => ['M', 'L', 'XL'],
            'colors' => ['Sage'],
            'short_description' => 'Ada bukaan kancing depan, memudahkan ibu menyusui.',
            'description' => '[CONTOH] Daster dengan bukaan kancing depan yang memudahkan '
                .'ibu menyusui. Bahan rayon lembut, motif bunga kecil.',
        ],
        [
            'slug' => 'daster-kancing-depan-lengan-panjang',
            'name' => 'Daster Kancing Depan Lengan Panjang',
            'sku' => 'DSR-KNC-PJG',
            'category' => 'daster',
            'base_price' => 119000,
            'wholesale_price' => 105000,
            'min_wholesale_qty' => 6,
            'weight_gram' => 290,
            'is_featured' => true,
            'stock' => 12,
            'sizes' => ['M', 'L', 'XL'],
            'colors' => ['Hitam'],
            'short_description' => 'Lengan panjang, kancing penuh depan, tetap adem.',
            'description' => '[CONTOH] Daster lengan panjang dengan kancing penuh di depan. '
                .'Bahan rayon premium, tidak gerah walau lengan panjang.',
        ],
        [
            'slug' => 'daster-maxi-kombinasi-renda',
            'name' => 'Daster Maxi Kombinasi Renda',
            'sku' => 'DSR-MXI-RND',
            'category' => 'daster',
            'base_price' => 129000,
            'wholesale_price' => 114000,
            'min_wholesale_qty' => 6,
            'weight_gram' => 300,
            'is_featured' => false,
            'stock' => 9,
            'sizes' => ['L', 'XL'],
            'colors' => ['Maroon'],
            'short_description' => 'Daster maxi dengan renda di bagian bawah.',
            'description' => '[CONTOH] Daster maxi kombinasi renda di ujung bawah. '
                .'Cocok untuk acara santai di rumah maupun saat menerima tamu.',
        ],
        [
            'slug' => 'kulot-plisket-premium',
            'name' => 'Kulot Plisket Premium',
            'sku' => 'KLT-PLS-PRM',
            'category' => 'kulot',
            'base_price' => 79000,
            'compare_price' => 99000,
            'wholesale_price' => 69000,
            'min_wholesale_qty' => 6,
            'weight_gram' => 210,
            'is_featured' => true,
            'stock' => 30,
            'sizes' => ['M', 'L', 'XL'],
            'colors' => ['Hitam', 'Krem'],
            'short_description' => 'Kulot plisket jatuh, pinggang karet, tidak menerawang.',
            'description' => '[CONTOH] Kulot plisket premium dengan bahan moss crepe. '
                .'Pinggang karet elastis, ada tali serut, panjang sampai mata kaki.',
        ],
        [
            'slug' => 'kulot-jeans-stretch',
            'name' => 'Kulot Jeans Stretch',
            'sku' => 'KLT-JNS-STR',
            'category' => 'kulot',
            'base_price' => 129000,
            'wholesale_price' => 115000,
            'min_wholesale_qty' => 6,
            'weight_gram' => 380,
            'is_featured' => false,
            'stock' => 20,
            'sizes' => ['M', 'L', 'XL'],
            'colors' => ['Navy'],
            'short_description' => 'Bahan jeans stretch, nyaman dipakai seharian.',
            'description' => '[CONTOH] Kulot jeans stretch dengan potongan longgar. '
                .'Ada saku samping dan kancing depan, bahan elastis sehingga tidak sesak.',
        ],
        [
            'slug' => 'kulot-linen-jumbo',
            'name' => 'Kulot Linen Jumbo',
            'sku' => 'KLT-LNN-JMB',
            'category' => 'kulot',
            'base_price' => 109000,
            'wholesale_price' => 97000,
            'min_wholesale_qty' => 6,
            'weight_gram' => 240,
            'is_featured' => false,
            'stock' => 16,
            'sizes' => ['L', 'XL'],
            'colors' => ['Krem'],
            'short_description' => 'Bahan linen adem, ukuran jumbo sampai pinggang 110 cm.',
            'description' => '[CONTOH] Kulot linen jumbo dengan pinggang karet penuh. '
                .'Bahan linen blend yang adem, cocok untuk cuaca panas.',
        ],
        [
            'slug' => 'kulot-karet-pinggang-motif-garis',
            'name' => 'Kulot Karet Pinggang Motif Garis',
            'sku' => 'KLT-KRT-GRS',
            'category' => 'kulot',
            'base_price' => 89000,
            'wholesale_price' => 78000,
            'min_wholesale_qty' => 6,
            'weight_gram' => 220,
            'is_featured' => false,
            'stock' => 3,
            'sizes' => ['M', 'L'],
            'colors' => ['Hitam'],
            'short_description' => 'Motif garis vertikal, membuat tampilan lebih ramping.',
            'description' => '[CONTOH] Kulot motif garis vertikal dengan pinggang karet. '
                .'Sisa stok terbatas karena motif ini tidak diproduksi ulang.',
        ],
        [
            'slug' => 'setelan-kulot-plisket-dan-atasan',
            'name' => 'Setelan Kulot Plisket dan Atasan',
            'sku' => 'STL-PLS-ATS',
            'category' => 'setelan',
            'base_price' => 159000,
            'compare_price' => 189000,
            'wholesale_price' => 142000,
            'min_wholesale_qty' => 4,
            'weight_gram' => 420,
            'is_featured' => true,
            'stock' => 14,
            'sizes' => ['M', 'L', 'XL'],
            'colors' => ['Hitam'],
            'short_description' => 'Satu paket kulot plisket dan atasan lengan panjang.',
            'description' => '[CONTOH] Setelan kulot plisket dengan atasan lengan panjang. '
                .'Bahan satu warna senada, cocok untuk kerja maupun acara santai.',
        ],
        [
            'slug' => 'setelan-daster-kulot-rayon',
            'name' => 'Setelan Daster Kulot Rayon',
            'sku' => 'STL-DSR-KLT',
            'category' => 'setelan',
            'base_price' => 149000,
            'wholesale_price' => 133000,
            'min_wholesale_qty' => 4,
            'weight_gram' => 400,
            'is_featured' => false,
            'stock' => 0,
            'sizes' => ['L', 'XL'],
            'colors' => ['Sage'],
            'short_description' => 'Setelan daster dan kulot rayon, satu motif senada.',
            'description' => '[CONTOH] Setelan daster dan kulot rayon dengan motif senada. '
                .'Stok sedang kosong; dipakai sebagai contoh tampilan produk habis.',
        ],
        [
            'slug' => 'setelan-kulot-linen-lengan-panjang',
            'name' => 'Setelan Kulot Linen Lengan Panjang',
            'sku' => 'STL-LNN-PJG',
            'category' => 'setelan',
            'base_price' => 169000,
            'wholesale_price' => 151000,
            'min_wholesale_qty' => 4,
            'weight_gram' => 440,
            'is_featured' => false,
            'stock' => 11,
            'sizes' => ['L', 'XL'],
            'colors' => ['Krem'],
            'short_description' => 'Setelan linen lengan panjang, adem dan rapi.',
            'description' => '[CONTOH] Setelan kulot linen dengan atasan lengan panjang. '
                .'Bahan adem, jahitan rapi, cocok untuk perjalanan jauh.',
        ],
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            foreach (self::PRODUCTS as $data) {
                $category = Category::where('slug', $data['category'])->first();

                if ($category === null) {
                    throw new RuntimeException(
                        "Kategori '{$data['category']}' belum ada. Jalankan CategorySeeder lebih dulu."
                    );
                }

                $product = Product::updateOrCreate(
                    ['slug' => $data['slug']],
                    [
                        'category_id' => $category->id,
                        'name' => $data['name'],
                        'sku' => $data['sku'],
                        'description' => $data['description'],
                        'short_description' => $data['short_description'],
                        'base_price' => $data['base_price'],
                        'compare_price' => $data['compare_price'] ?? null,
                        'wholesale_price' => $data['wholesale_price'],
                        'min_wholesale_qty' => $data['min_wholesale_qty'],
                        'weight_gram' => $data['weight_gram'],
                        'is_active' => true,
                        'is_featured' => $data['is_featured'],
                    ],
                );

                $this->seedImages($product);
                $this->seedVariants($product, $data);
            }
        });
    }

    private function seedImages(Product $product): void
    {
        for ($index = 1; $index <= 2; $index++) {
            $path = $this->seedImage(
                'images/seed/produk/'.$product->slug.'-'.$index.'.png',
                800,
                800,
                $product->name,
            );

            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'sort_order' => $index - 1],
                [
                    'path' => $path,
                    'alt' => $product->name.' — gambar '.$index,
                    'is_primary' => $index === 1,
                ],
            );
        }
    }

    /**
     * @param  array{sizes: array<int, string>, colors: array<int, string>, stock: int, sku: string}  $data
     */
    private function seedVariants(Product $product, array $data): void
    {
        foreach ($data['sizes'] as $size) {
            foreach ($data['colors'] as $color) {
                $variant = ProductVariant::updateOrCreate(
                    ['sku' => $this->variantSku($data['sku'], $size, $color)],
                    [
                        'product_id' => $product->id,
                        'size' => $size,
                        'color' => $color,
                        'price_delta' => $size === 'XL' ? 5000 : 0,
                        'is_active' => true,
                    ],
                );

                if ($data['stock'] > 0) {
                    StockMovement::updateOrCreate(
                        [
                            'product_variant_id' => $variant->id,
                            'type' => StockMovement::TYPE_IN,
                            'note' => '[CONTOH] stok awal seeder',
                        ],
                        ['qty' => $data['stock'], 'admin_id' => null],
                    );
                }

                $this->syncVariantStock($variant);
            }
        }
    }

    private function variantSku(string $productSku, string $size, string $color): string
    {
        $colorCode = strtoupper(preg_replace('/[^A-Za-z]/', '', $color) ?? '');
        $colorCode = substr($colorCode, 0, 3);

        return $productSku.'-'.$size.'-'.$colorCode;
    }
}
