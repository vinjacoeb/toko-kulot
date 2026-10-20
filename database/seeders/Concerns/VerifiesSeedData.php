<?php

namespace Database\Seeders\Concerns;

use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Pemeriksaan akhir seed: jumlah minimum, keunikan, sebaran, dan invarian stok.
 * Gagal keras (RuntimeException) supaya data yang tidak lengkap tidak lolos diam-diam.
 */
trait VerifiesSeedData
{
    protected function verifySeedData(): void
    {
        $problems = [];

        $minimum = [
            'admins' => 2,
            'users' => 2,
            'categories' => 3,
            'products' => 12,
            'product_images' => 24,
            'product_variants' => 36,
            'stock_movements' => 12,
            'carts' => 1,
            'cart_items' => 2,
            'orders' => 3,
            'order_items' => 5,
            'payments' => 3,
            'reviews' => 2,
            'contact_messages' => 3,
            'settings' => 19,
            'carousels' => 3,
            'faqs' => 6,
        ];

        foreach ($minimum as $table => $expected) {
            $actual = (int) DB::table($table)->count();

            if ($actual < $expected) {
                $problems[] = "Tabel {$table}: {$actual} baris, minimal {$expected}.";
            }
        }

        if ((int) DB::table('products')->count() > 24) {
            $problems[] = 'Jumlah produk melebihi batas PRD §16 (maksimal 24).';
        }

        foreach ([
            ['products', 'slug'],
            ['product_variants', 'sku'],
            ['orders', 'code'],
            ['settings', 'key'],
        ] as [$table, $column]) {
            $total = (int) DB::table($table)->count();
            $distinct = (int) DB::table($table)->distinct()->count($column);

            if ($total !== $distinct) {
                $problems[] = "Kolom {$table}.{$column} tidak unik ({$distinct} nilai untuk {$total} baris).";
            }
        }

        $categoriesWithProducts = (int) DB::table('products')->distinct()->count('category_id');
        if ($categoriesWithProducts < 3) {
            $problems[] = 'Tidak semua kategori memiliki produk.';
        }

        if ((int) DB::table('products')->where('is_featured', true)->count() < 1) {
            $problems[] = 'Tidak ada produk unggulan (is_featured).';
        }

        if ((int) DB::table('product_variants')->where('stock', 0)->count() < 1) {
            $problems[] = 'Tidak ada varian stok kosong untuk menguji status "Habis".';
        }

        if ((int) DB::table('product_variants')->whereBetween('stock', [1, 4])->count() < 1) {
            $problems[] = 'Tidak ada varian stok kritis (< 5) untuk dashboard admin.';
        }

        $requiredSettingKeys = [
            'store_name', 'store_logo', 'store_tagline', 'header_nav', 'footer_about',
            'footer_links', 'footer_social', 'contact_email', 'contact_phone',
            'contact_whatsapp', 'contact_address', 'contact_map_embed', 'landing_hero',
            'landing_sections', 'seo_default_title', 'seo_default_description',
            'shipping_cost_default', 'midtrans_client_key', 'midtrans_is_production',
        ];

        $missingKeys = array_diff(
            $requiredSettingKeys,
            DB::table('settings')->pluck('key')->all(),
        );

        if ($missingKeys !== []) {
            $problems[] = 'Key settings hilang: '.implode(', ', $missingKeys).'.';
        }

        foreach (['header_nav', 'footer_links', 'footer_social', 'landing_hero', 'landing_sections'] as $jsonKey) {
            $value = DB::table('settings')->where('key', $jsonKey)->value('value');
            $decoded = $value === null ? null : json_decode((string) $value, true);

            if (! is_array($decoded)) {
                $problems[] = "Setting {$jsonKey} bukan JSON yang valid.";
            }
        }

        $problems = array_merge($problems, $this->stockInvariantProblems());

        if ($problems !== []) {
            throw new RuntimeException("Seed tidak lengkap:\n- ".implode("\n- ", $problems));
        }
    }

    /**
     * @return array<int, string>
     */
    private function stockInvariantProblems(): array
    {
        $rows = DB::table('product_variants')
            ->leftJoin('stock_movements', 'stock_movements.product_variant_id', '=', 'product_variants.id')
            ->groupBy('product_variants.id', 'product_variants.stock', 'product_variants.sku')
            ->selectRaw(
                'product_variants.id as id, product_variants.sku as sku, product_variants.stock as stock,'
                .' COALESCE(SUM(CASE WHEN stock_movements.type = ? THEN stock_movements.qty ELSE 0 END), 0)'
                .' - COALESCE(SUM(CASE WHEN stock_movements.type IN (?, ?) THEN stock_movements.qty ELSE 0 END), 0)'
                .' + COALESCE(SUM(CASE WHEN stock_movements.type = ? THEN stock_movements.qty ELSE 0 END), 0) as computed',
                ['in', 'out', 'sale', 'adjust'],
            )
            ->get();

        $problems = [];

        foreach ($rows as $row) {
            $computed = max(0, (int) $row->computed);

            if ((int) $row->stock !== $computed) {
                $problems[] = "Stok varian {$row->sku} ({$row->stock}) tidak sama dengan jumlah movement ({$computed}).";
            }
        }

        return $problems;
    }
}
