<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Services\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Galeri landing dari tab Landing admin (addendum v1.1 §6, kontrak props §2/§10.9).
 *
 * Fokus: unggah, ganti, hapus (berkas lama tidak yatim), validasi, dan galeri
 * ikut terkirim ke beranda.
 */
class AdminLandingGalleryTest extends TestCase
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

    /**
     * @param  array<int, array<string, mixed>>  $gallery
     * @return array<string, mixed>
     */
    private function payload(array $gallery, bool $present = true, array $extra = []): array
    {
        return array_merge([
            'landing_hero' => ['title' => 'Daster Kulot Terbaru'],
            'landing_sections' => ['announcement' => ['text' => 'Gratis ongkir']],
            'landing_gallery' => $gallery,
            'landing_gallery_present' => $present ? 1 : 0,
        ], $extra);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function storedGallery(): array
    {
        $gallery = $this->settings()->get('landing_gallery');

        return is_array($gallery) ? $gallery : [];
    }

    private function publicPath(string $path): string
    {
        return str_replace('/storage/', '', $path);
    }

    public function test_unggah_galeri_menyimpan_berkas_dan_urutan(): void
    {
        $this->from(route('admin.settings.index'))
            ->put(route('admin.settings.landing'), $this->payload([
                [
                    'image' => UploadedFile::fake()->image('galeri-1.jpg', 800, 600),
                    'caption' => 'Detail jahitan rapi',
                    'alt' => 'Jahitan rapi pada daster rayon',
                ],
                [
                    'image' => UploadedFile::fake()->image('galeri-2.png', 800, 600),
                    'caption' => 'Bahan rayon adem',
                    'alt' => 'Kain rayon warna lembut',
                ],
            ]))
            ->assertRedirect(route('admin.settings.index'))
            ->assertSessionHas('success')
            ->assertSessionHasNoErrors();

        $gallery = $this->storedGallery();

        $this->assertCount(2, $gallery);
        $this->assertSame('Detail jahitan rapi', $gallery[0]['caption']);
        $this->assertSame('Bahan rayon adem', $gallery[1]['caption']);

        foreach ($gallery as $item) {
            $this->assertStringStartsWith('/storage/landing/', $item['image']);
            Storage::disk('public')->assertExists($this->publicPath($item['image']));
        }
    }

    public function test_item_dihapus_dan_diurutkan_ulang_menghapus_berkas_lama(): void
    {
        $this->put(route('admin.settings.landing'), $this->payload([
            ['image' => UploadedFile::fake()->image('a.jpg', 400, 300), 'caption' => 'A'],
            ['image' => UploadedFile::fake()->image('b.jpg', 400, 300), 'caption' => 'B'],
            ['image' => UploadedFile::fake()->image('c.jpg', 400, 300), 'caption' => 'C'],
        ]))->assertSessionHasNoErrors();

        [$a, $b, $c] = $this->storedGallery();

        // Urutkan ulang (C, B) dan hapus A.
        $this->put(route('admin.settings.landing'), $this->payload([
            ['image' => $c['image'], 'caption' => 'C'],
            ['image' => $b['image'], 'caption' => 'B'],
        ]))->assertSessionHasNoErrors();

        $gallery = $this->storedGallery();

        $this->assertSame([$c['image'], $b['image']], array_column($gallery, 'image'));
        Storage::disk('public')->assertMissing($this->publicPath($a['image']));
        Storage::disk('public')->assertExists($this->publicPath($b['image']));
        Storage::disk('public')->assertExists($this->publicPath($c['image']));
    }

    public function test_gambar_diganti_menghapus_berkas_lama(): void
    {
        $this->put(route('admin.settings.landing'), $this->payload([
            ['image' => UploadedFile::fake()->image('lama.jpg', 400, 300), 'caption' => 'Lama'],
        ]))->assertSessionHasNoErrors();

        $old = $this->storedGallery()[0]['image'];

        $this->put(route('admin.settings.landing'), $this->payload([
            ['image' => UploadedFile::fake()->image('baru.jpg', 400, 300), 'caption' => 'Baru'],
        ]))->assertSessionHasNoErrors();

        $new = $this->storedGallery()[0]['image'];

        $this->assertNotSame($old, $new);
        Storage::disk('public')->assertMissing($this->publicPath($old));
        Storage::disk('public')->assertExists($this->publicPath($new));
    }

    public function test_galeri_dikosongkan_dengan_penanda_menghapus_semua_berkas(): void
    {
        $this->put(route('admin.settings.landing'), $this->payload([
            ['image' => UploadedFile::fake()->image('a.jpg', 400, 300)],
            ['image' => UploadedFile::fake()->image('b.jpg', 400, 300)],
        ]))->assertSessionHasNoErrors();

        $paths = array_column($this->storedGallery(), 'image');
        $this->assertCount(2, $paths);

        $this->put(route('admin.settings.landing'), [
            'landing_hero' => ['title' => 'Daster Kulot Terbaru'],
            'landing_sections' => ['announcement' => ['text' => 'Gratis ongkir']],
            'landing_gallery_present' => 1,
        ])->assertSessionHasNoErrors();

        $this->assertSame([], $this->storedGallery());

        foreach ($paths as $path) {
            Storage::disk('public')->assertMissing($this->publicPath($path));
        }
    }

    public function test_form_lama_tanpa_field_galeri_tidak_menghapus_galeri(): void
    {
        $this->put(route('admin.settings.landing'), $this->payload([
            ['image' => UploadedFile::fake()->image('a.jpg', 400, 300)],
        ]))->assertSessionHasNoErrors();

        $path = $this->storedGallery()[0]['image'];

        $this->put(route('admin.settings.landing'), [
            'landing_hero' => ['title' => 'Judul Baru'],
            'landing_sections' => ['announcement' => ['text' => 'Halo']],
        ])->assertSessionHasNoErrors();

        $this->assertSame([$path], array_column($this->storedGallery(), 'image'));
        Storage::disk('public')->assertExists($this->publicPath($path));
    }

    public function test_maksimal_delapan_gambar(): void
    {
        $gallery = [];

        foreach (range(1, 9) as $index) {
            $gallery[] = ['image' => UploadedFile::fake()->image("g{$index}.jpg", 200, 200)];
        }

        $this->put(route('admin.settings.landing'), $this->payload($gallery))
            ->assertSessionHasErrors('landing_gallery');

        $this->assertSame([], $this->storedGallery());
    }

    public function test_berkas_bukan_gambar_dan_lebih_2mb_ditolak(): void
    {
        $this->put(route('admin.settings.landing'), $this->payload([
            ['image' => UploadedFile::fake()->create('galeri.svg', 20, 'image/svg+xml')],
        ]))->assertSessionHasErrors('landing_gallery.0.image');

        $this->put(route('admin.settings.landing'), $this->payload([
            ['image' => UploadedFile::fake()->image('besar.jpg', 800, 800)->size(3000)],
        ]))->assertSessionHasErrors('landing_gallery.0.image');

        $this->assertSame([], $this->storedGallery());
    }

    public function test_caption_dan_alt_terlalu_panjang_ditolak(): void
    {
        $this->put(route('admin.settings.landing'), $this->payload([
            [
                'image' => UploadedFile::fake()->image('a.jpg', 200, 200),
                'caption' => str_repeat('c', 81),
                'alt' => str_repeat('a', 121),
            ],
        ]))->assertSessionHasErrors(['landing_gallery.0.caption', 'landing_gallery.0.alt']);
    }

    public function test_galeri_ikut_terkirim_ke_beranda(): void
    {
        $this->settings()->put('landing_gallery', [
            ['image' => '/storage/landing/contoh-1.jpg', 'caption' => 'Detail jahitan', 'alt' => 'Jahitan rapi'],
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->has('settings.landing_gallery', 1)
                ->where('settings.landing_gallery.0.image', '/storage/landing/contoh-1.jpg')
                ->where('settings.landing_gallery.0.caption', 'Detail jahitan')
            );
    }
}
