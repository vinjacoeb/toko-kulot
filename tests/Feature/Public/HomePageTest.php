<?php

namespace Tests\Feature\Public;

use App\Models\Carousel;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Beranda publik `/` — PRD §5.1 baris `home`, kontrak props §8, design §3.3 — K15.
 *
 * Halaman dirender server (tanpa fetch klien), sehingga seluruh props harus
 * lengkap pada respons pertama; state kosong harus tampil tanpa galat.
 */
class HomePageTest extends TestCase
{
    use RefreshDatabase;

    private function produk(Category $kategori, string $slug, array $attributes = []): Product
    {
        return Product::create(array_merge([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] '.str_replace('-', ' ', $slug),
            'slug' => $slug,
            'sku' => 'CONTOH-'.strtoupper(substr(md5($slug), 0, 6)),
            'base_price' => 89000,
            'is_active' => true,
        ], $attributes));
    }

    public function test_beranda_tampil_dengan_props_kontrak(): void
    {
        Carousel::create(['title' => '[CONTOH] Promo', 'image' => 'carousel/promo.jpg', 'sort_order' => 1, 'is_active' => true]);
        Carousel::create(['title' => '[CONTOH] Draf', 'image' => 'carousel/draf.jpg', 'sort_order' => 2, 'is_active' => false]);

        $daster = Category::create(['name' => '[CONTOH] Daster', 'slug' => 'contoh-daster', 'sort_order' => 1, 'is_active' => true]);
        Category::create(['name' => '[CONTOH] Kosong', 'slug' => 'contoh-kosong', 'sort_order' => 2, 'is_active' => true]);

        $unggulan = $this->produk($daster, 'daster-unggulan', ['is_featured' => true, 'rating_avg' => 4.5, 'rating_count' => 10]);
        $this->produk($daster, 'daster-biasa', ['is_featured' => false]);
        $this->produk($daster, 'daster-tidak-aktif', ['is_featured' => true, 'is_active' => false]);

        Faq::create(['question' => '[CONTOH] Bagaimana cara pesan?', 'answer' => 'Lewat keranjang.', 'sort_order' => 1, 'is_active' => true]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->has('carousels', 1)
                ->where('carousels.0.title', '[CONTOH] Promo')
                ->has('categories', 1)
                ->where('categories.0.slug', 'contoh-daster')
                ->where('categories.0.url', '/produk?kategori=contoh-daster')
                ->where('categories.0.product_count', 2)
                ->has('featured', 1)
                ->where('featured.0.slug', $unggulan->slug)
                ->has('faqs', 1)
                ->where('faqs.0.question', '[CONTOH] Bagaimana cara pesan?')
            );
    }

    public function test_beranda_tanpa_data_tetap_200_dengan_daftar_kosong(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->has('carousels', 0)
                ->has('categories', 0)
                ->has('featured', 0)
                ->has('faqs', 0)
            );
    }

    public function test_faq_beranda_dibatasi_enam_pertanyaan(): void
    {
        foreach (range(1, 8) as $i) {
            Faq::create([
                'question' => "[CONTOH] Pertanyaan {$i}",
                'answer' => 'Jawaban.',
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->has('faqs', 6)
                ->where('faqs.0.question', '[CONTOH] Pertanyaan 1')
            );
    }

    public function test_jumlah_produk_unggulan_mengikuti_pengaturan(): void
    {
        $kategori = Category::create(['name' => '[CONTOH] Daster', 'slug' => 'contoh-daster', 'is_active' => true]);

        foreach (range(1, 5) as $i) {
            $this->produk($kategori, "daster-{$i}", ['is_featured' => true]);
        }

        Setting::create([
            'key' => 'landing_sections',
            'value' => json_encode(['featured' => ['limit' => 3]]),
            'group' => 'landing',
            'type' => 'json',
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->has('featured', 3)
            );
    }

    public function test_batas_produk_unggulan_dijepit_antara_satu_dan_dua_puluh_empat(): void
    {
        $kategori = Category::create(['name' => '[CONTOH] Daster', 'slug' => 'contoh-daster', 'is_active' => true]);

        foreach (range(1, 3) as $i) {
            $this->produk($kategori, "daster-{$i}", ['is_featured' => true]);
        }

        Setting::create([
            'key' => 'landing_sections',
            'value' => json_encode(['featured' => ['limit' => 0]]),
            'group' => 'landing',
            'type' => 'json',
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->has('featured', 1)
            );

        Setting::query()->where('key', 'landing_sections')->update([
            'value' => json_encode(['featured' => ['limit' => 999]]),
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->has('featured', 3)
            );
    }

    public function test_beranda_memuat_props_bersama(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->has('auth')
                ->has('flash')
                ->has('settings')
            );
    }
}
