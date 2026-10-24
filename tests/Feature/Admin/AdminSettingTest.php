<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Carousel;
use App\Models\Faq;
use App\Services\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Panel admin: pengaturan situs, konten landing, carousel, FAQ
 * (kontrak props §10.7–§10.11).
 */
class AdminSettingTest extends TestCase
{
    use RefreshDatabase;

    private Admin $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->admin = Admin::factory()->create();
        $this->actingAs($this->admin, 'admin');
    }

    private function settings(): SettingService
    {
        return $this->app->make(SettingService::class);
    }

    public function test_halaman_pengaturan_menampilkan_tujuh_grup_kontrak(): void
    {
        $this->get(route('admin.settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Settings/Index', false)
                ->has('pengaturan.umum')
                ->has('pengaturan.landing')
                ->has('pengaturan.header')
                ->has('pengaturan.footer')
                ->has('pengaturan.kontak')
                ->has('pengaturan.seo')
                ->has('pengaturan.pembayaran')
                ->has('carousels')
                ->has('faqs')
            );
    }

    public function test_simpan_pengaturan_umum(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.update'), [
                'store_name' => 'Daster Kulot Asli',
                'store_tagline' => 'Adem dan nyaman',
                'contact_email' => 'halo@example.test',
            ])
            ->assertRedirect(route('admin.settings.index'))
            ->assertSessionHas('success');

        $this->assertSame('Daster Kulot Asli', $this->settings()->get('store_name'));
        $this->assertSame('Adem dan nyaman', $this->settings()->get('store_tagline'));
    }

    public function test_key_pengaturan_di_luar_whitelist_diabaikan(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.update'), [
                'store_name' => 'Daster Kulot Asli',
                'is_admin' => '1',
                'evil_key' => 'x',
            ])
            ->assertRedirect(route('admin.settings.index'));

        $this->assertDatabaseMissing('settings', ['key' => 'evil_key']);
        $this->assertDatabaseMissing('settings', ['key' => 'is_admin']);
    }

    public function test_logo_diunggah_menyimpan_path_storage(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.update'), [
                'store_name' => 'Daster Kulot Asli',
                'store_logo' => UploadedFile::fake()->image('logo.png', 200, 200),
            ])
            ->assertRedirect(route('admin.settings.index'));

        $path = (string) $this->settings()->get('store_logo');

        $this->assertStringStartsWith('/storage/settings/', $path);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $path));
    }

    public function test_unggahan_bukan_gambar_ditolak(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.update'), [
                'store_name' => 'Daster Kulot Asli',
                'store_logo' => UploadedFile::fake()->create('logo.svg', 10, 'image/svg+xml'),
            ])
            ->assertSessionHasErrors('store_logo');

        $this->assertNull($this->settings()->get('store_logo'));
    }

    public function test_footer_copyright_dan_favicon_tersimpan(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.update'), [
                'footer_copyright' => '© 2026 Daster Kulot Asli',
                'store_favicon' => UploadedFile::fake()->image('favicon.png', 64, 64),
            ])
            ->assertRedirect(route('admin.settings.index'))
            ->assertSessionHas('success');

        $this->assertSame('© 2026 Daster Kulot Asli', $this->settings()->get('footer_copyright'));

        $favicon = (string) $this->settings()->get('store_favicon');
        $this->assertStringStartsWith('/storage/settings/', $favicon);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $favicon));
    }

    public function test_footer_copyright_lebih_200_karakter_ditolak(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.update'), [
                'footer_copyright' => str_repeat('a', 201),
            ])
            ->assertSessionHasErrors('footer_copyright');

        $this->assertNull($this->settings()->get('footer_copyright'));
    }

    public function test_unggahan_favicon_bukan_gambar_ditolak(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.update'), [
                'store_favicon' => UploadedFile::fake()->create('favicon.svg', 10, 'image/svg+xml'),
            ])
            ->assertSessionHasErrors('store_favicon');

        $this->assertNull($this->settings()->get('store_favicon'));
    }

    public function test_simpan_konten_landing(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.landing'), [
                'landing_hero' => [
                    'title' => 'Daster Kulot Terbaru',
                    'subtitle' => 'Bahan rayon adem',
                    'cta_label' => 'Belanja',
                    'cta_url' => '/produk',
                ],
                'landing_sections' => [
                    'announcement' => ['text' => 'Gratis ongkir Pekalongan', 'is_active' => true],
                    'featured' => ['title' => 'Produk Pilihan', 'limit' => 8],
                    'unknown_section' => ['title' => 'Buang saya'],
                ],
            ])
            ->assertRedirect(route('admin.settings.index'))
            ->assertSessionHas('success');

        $hero = $this->settings()->get('landing_hero');
        $sections = $this->settings()->get('landing_sections');

        $this->assertSame('Daster Kulot Terbaru', $hero['title']);
        $this->assertSame('Gratis ongkir Pekalongan', $sections['announcement']['text']);
        $this->assertArrayNotHasKey('unknown_section', $sections);
    }

    public function test_landing_hero_wajib_judul(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.landing'), [
                'landing_hero' => ['title' => ''],
                'landing_sections' => [],
            ])
            ->assertSessionHasErrors('landing_hero.title');
    }

    public function test_simpan_carousel_dengan_gambar(): void
    {
        $this->from(route('admin.settings.index'))
            ->post(route('admin.carousels.store'), [
                'title' => 'Promo Lebaran',
                'subtitle' => 'Diskon 20%',
                'image' => UploadedFile::fake()->image('banner.jpg', 1200, 400),
                'sort_order' => 2,
            ])
            ->assertRedirect(route('admin.settings.index'))
            ->assertSessionHas('success');

        $carousel = Carousel::query()->firstOrFail();

        $this->assertSame('Promo Lebaran', $carousel->title);
        $this->assertTrue((bool) $carousel->is_active);
        $this->assertStringStartsWith('/storage/carousels/', (string) $carousel->image);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', (string) $carousel->image));
    }

    public function test_carousel_tanpa_gambar_ditolak(): void
    {
        $this->from(route('admin.settings.index'))
            ->post(route('admin.carousels.store'), ['title' => 'Promo'])
            ->assertSessionHasErrors('image');

        $this->assertSame(0, Carousel::query()->count());
    }

    public function test_perbarui_dan_hapus_carousel(): void
    {
        $carousel = Carousel::query()->create([
            'title' => '[CONTOH] Promo',
            'image' => '/storage/carousels/contoh.jpg',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->from(route('admin.settings.index'))
            ->put(route('admin.carousels.update', $carousel), ['title' => 'Promo Baru', 'is_active' => false])
            ->assertRedirect(route('admin.settings.index'));

        $carousel->refresh();
        $this->assertSame('Promo Baru', $carousel->title);
        $this->assertFalse((bool) $carousel->is_active);

        $this->from(route('admin.settings.index'))
            ->delete(route('admin.carousels.destroy', $carousel))
            ->assertRedirect(route('admin.settings.index'));

        $this->assertSame(0, Carousel::query()->count());
    }

    public function test_crud_faq(): void
    {
        $this->from(route('admin.settings.index'))
            ->post(route('admin.faqs.store'), [
                'question' => 'Apakah bisa COD?',
                'answer' => 'Bisa, untuk area Pekalongan.',
                'sort_order' => 1,
            ])
            ->assertRedirect(route('admin.settings.index'))
            ->assertSessionHas('success');

        $faq = Faq::query()->firstOrFail();
        $this->assertTrue((bool) $faq->is_active);

        $this->from(route('admin.settings.index'))
            ->put(route('admin.faqs.update', $faq), ['question' => 'Apakah bisa COD?', 'answer' => 'Bisa semua area.'])
            ->assertRedirect(route('admin.settings.index'));

        $this->assertSame('Bisa semua area.', $faq->refresh()->answer);

        $this->from(route('admin.settings.index'))
            ->delete(route('admin.faqs.destroy', $faq))
            ->assertRedirect(route('admin.settings.index'));

        $this->assertSame(0, Faq::query()->count());
    }

    public function test_faq_wajib_pertanyaan_dan_jawaban(): void
    {
        $this->from(route('admin.settings.index'))
            ->post(route('admin.faqs.store'), ['question' => '', 'answer' => ''])
            ->assertSessionHasErrors(['question', 'answer']);

        $this->assertSame(0, Faq::query()->count());
    }

    public function test_admin_nonaktif_tidak_bisa_menyimpan_pengaturan(): void
    {
        $nonaktif = Admin::factory()->create(['is_active' => false]);

        $this->app['auth']->forgetGuards();
        $this->actingAs($nonaktif, 'admin');

        $this->put(route('admin.settings.update'), ['store_name' => 'Disusupi'])
            ->assertRedirect(route('admin.login'));

        $this->assertNotSame('Disusupi', $this->settings()->get('store_name'));
    }
}
