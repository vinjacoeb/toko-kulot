<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Services\BiteshipService;
use Database\Seeders\Concerns\WritesSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * 31 key `settings`: 19 key minimum PRD §6 ditambah `store_favicon`, `footer_copyright`,
 * `landing_gallery` (kartu t_71f1e7a9), 7 key ekspedisi (kartu t_f22c8d46), dan key
 * pendukung lain. Bentuk JSON mengikuti docs/kontrak-props.md §2 sehingga frontend
 * bisa langsung memakainya.
 *
 * Seeder idempoten: memakai `firstOrCreate` supaya nilai yang sudah diubah
 * pemilik lewat panel admin TIDAK ditimpa saat seeder dijalankan ulang. Berkas
 * gambar seed tetap ditulis ulang secara deterministik agar aset yang hilang
 * (mis. hasil `git clean` pada `public/images/seed/`) pulih kembali.
 *
 * Key pembayaran (`midtrans_client_key`) sengaja dikosongkan: nilainya diisi
 * pemilik lewat panel admin, bukan oleh seeder.
 */
class SettingSeeder extends Seeder
{
    use WritesSeedImages;

    public function run(): void
    {
        DB::transaction(function (): void {
            $logo = $this->seedImage('images/seed/logo.png', 240, 64, 'TOKO KULOT');
            $favicon = $this->seedImage('images/seed/favicon.png', 64, 64, 'TK');
            $heroImage = $this->seedImage('images/seed/landing/hero.png', 1600, 900, 'DASTER & KULOT HARIAN');
            $promoImage = $this->seedImage('images/seed/landing/promo-grosir.png', 1600, 900, 'HARGA GROSIR 4 PCS');

            // Galeri contoh (addendum v1.1 §6): placeholder lokal, bukan aset internet.
            $galleryImages = [];

            foreach (range(1, 4) as $index) {
                $galleryImages[] = $this->seedImage("images/seed/landing/galeri-{$index}.png", 1200, 900, "GALERI {$index}");
            }

            // Favicon cadangan untuk root domain (`/favicon.ico`): hanya ditulis
            // bila belum ada atau masih 0 byte, supaya berkas milik pemilik aman.
            $this->seedFaviconIco();

            $settings = [
                [
                    'key' => 'store_name',
                    'value' => 'Toko Kulot',
                    'group' => 'umum',
                    'type' => 'text',
                    'label' => 'Nama toko',
                ],
                [
                    'key' => 'store_logo',
                    'value' => $logo,
                    'group' => 'umum',
                    'type' => 'image',
                    'label' => 'Logo toko',
                ],
                [
                    'key' => 'store_favicon',
                    'value' => $favicon,
                    'group' => 'umum',
                    'type' => 'image',
                    'label' => 'Favicon toko',
                ],
                [
                    'key' => 'store_tagline',
                    'value' => 'Daster & kulot nyaman untuk harian',
                    'group' => 'umum',
                    'type' => 'text',
                    'label' => 'Tagline toko',
                ],
                [
                    'key' => 'header_nav',
                    'value' => $this->json([
                        ['label' => 'Beranda', 'url' => '/'],
                        ['label' => 'Produk', 'url' => '/produk'],
                        ['label' => 'Kontak Kami', 'url' => '/kontak-kami'],
                    ]),
                    'group' => 'header',
                    'type' => 'json',
                    'label' => 'Menu header',
                ],
                [
                    'key' => 'footer_about',
                    'value' => '[CONTOH] Toko Kulot menjual daster dan kulot langsung dari '
                        .'perajin Pekalongan. Melayani pembelian eceran dan grosir.',
                    'group' => 'footer',
                    'type' => 'textarea',
                    'label' => 'Tentang toko (footer)',
                ],
                [
                    'key' => 'footer_copyright',
                    'value' => '',
                    'group' => 'footer',
                    'type' => 'text',
                    'label' => 'Copyright footer (kosong = otomatis)',
                ],
                [
                    'key' => 'footer_links',
                    'value' => $this->json([
                        [
                            'title' => 'Bantuan',
                            'items' => [
                                ['label' => 'FAQ', 'url' => '/#faq'],
                                ['label' => 'Kontak Kami', 'url' => '/kontak-kami'],
                                ['label' => 'Cara Pemesanan', 'url' => '/#cara-pesan'],
                            ],
                        ],
                        [
                            'title' => 'Kategori',
                            'items' => [
                                ['label' => 'Daster', 'url' => '/produk?kategori=daster'],
                                ['label' => 'Kulot', 'url' => '/produk?kategori=kulot'],
                                ['label' => 'Setelan', 'url' => '/produk?kategori=setelan'],
                            ],
                        ],
                    ]),
                    'group' => 'footer',
                    'type' => 'json',
                    'label' => 'Tautan footer',
                ],
                [
                    'key' => 'footer_social',
                    'value' => $this->json([
                        ['platform' => 'instagram', 'label' => 'Instagram', 'url' => 'https://instagram.com/contoh'],
                        ['platform' => 'whatsapp', 'label' => 'WhatsApp', 'url' => 'https://wa.me/6281200000001'],
                    ]),
                    'group' => 'footer',
                    'type' => 'json',
                    'label' => 'Media sosial',
                ],
                [
                    'key' => 'contact_email',
                    'value' => 'halo@tokokulot.test',
                    'group' => 'kontak',
                    'type' => 'text',
                    'label' => 'Email kontak',
                ],
                [
                    'key' => 'contact_phone',
                    'value' => '0812-0000-0001',
                    'group' => 'kontak',
                    'type' => 'text',
                    'label' => 'Nomor telepon',
                ],
                [
                    'key' => 'contact_whatsapp',
                    'value' => '6281200000001',
                    'group' => 'kontak',
                    'type' => 'text',
                    'label' => 'Nomor WhatsApp',
                ],
                [
                    'key' => 'contact_address',
                    'value' => '[CONTOH] Jl. Kauman No. 45, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah 51122',
                    'group' => 'kontak',
                    'type' => 'textarea',
                    'label' => 'Alamat toko',
                ],
                [
                    'key' => 'contact_map_embed',
                    'value' => 'https://maps.google.com/maps?q=Pekalongan&output=embed',
                    'group' => 'kontak',
                    'type' => 'textarea',
                    'label' => 'URL peta (embed)',
                ],
                [
                    'key' => 'landing_hero',
                    'value' => $this->json([
                        'title' => 'Daster & Kulot Nyaman untuk Harian',
                        'subtitle' => 'Bahan rayon adem, jahitan rapi, harga grosir mulai 4 pcs.',
                        'cta_label' => 'Lihat Koleksi',
                        'cta_url' => '/produk',
                        'image' => $heroImage,
                    ]),
                    'group' => 'landing',
                    'type' => 'json',
                    'label' => 'Hero landing',
                ],
                [
                    'key' => 'landing_sections',
                    'value' => $this->json([
                        'announcement' => [
                            'text' => 'Gratis ongkir untuk pembelian di atas Rp300.000',
                            'url' => '/produk',
                            'is_active' => true,
                        ],
                        'trust_strip' => [
                            ['icon' => 'truck', 'title' => 'Dikirim dari Pekalongan', 'subtitle' => 'Dikemas hari yang sama'],
                            ['icon' => 'refresh', 'title' => 'Tukar Ukuran', 'subtitle' => 'Bisa tukar dalam 3 hari'],
                            ['icon' => 'qris', 'title' => 'Bayar QRIS', 'subtitle' => 'Semua e-wallet dan m-banking'],
                            ['icon' => 'chat', 'title' => 'Balas Cepat', 'subtitle' => 'Senin–Sabtu 08.00–17.00'],
                        ],
                        'featured' => [
                            'title' => 'Produk Unggulan',
                            'subtitle' => 'Paling sering dipesan pembeli',
                            'limit' => 8,
                        ],
                        'promo' => [
                            'title' => 'Harga Grosir Mulai 4 Pcs',
                            'subtitle' => 'Cocok untuk reseller dan toko kelontong.',
                            'cta_label' => 'Belanja Grosir',
                            'cta_url' => '/produk',
                            'image' => $promoImage,
                            'is_active' => true,
                        ],
                        'why_us' => [
                            'title' => 'Kenapa Beli di Toko Kulot',
                            'items' => [
                                ['title' => 'Bahan Adem', 'body' => 'Rayon dan katun pilihan, tidak panas dipakai harian.'],
                                ['title' => 'Jahitan Rapi', 'body' => 'Dijahit oleh perajin lokal, dicek satu per satu sebelum dikirim.'],
                                ['title' => 'Harga Grosir', 'body' => 'Harga khusus reseller mulai pembelian 4 pcs.'],
                            ],
                        ],
                        'newsletter' => [
                            'title' => 'Dapat Info Diskon',
                            'subtitle' => 'Gratis ongkir untuk belanja min. Rp300.000 — khusus pengiriman reguler.',
                            'button_text' => 'Hubungi Kami',
                        ],
                    ]),
                    'group' => 'landing',
                    'type' => 'json',
                    'label' => 'Bagian landing page',
                ],
                [
                    'key' => 'landing_gallery',
                    'value' => $this->json([
                        ['image' => $galleryImages[0], 'caption' => '[CONTOH] Detail jahitan rapi', 'alt' => 'Jahitan rapi pada daster rayon'],
                        ['image' => $galleryImages[1], 'caption' => '[CONTOH] Bahan rayon adem', 'alt' => 'Kain rayon adem warna lembut'],
                        ['image' => $galleryImages[2], 'caption' => '[CONTOH] Motif pilihan', 'alt' => 'Ragam motif daster dan kulot'],
                        ['image' => $galleryImages[3], 'caption' => '[CONTOH] Dikemas rapi', 'alt' => 'Paket pesanan dikemas rapi'],
                    ]),
                    'group' => 'landing',
                    'type' => 'json',
                    'label' => 'Galeri landing',
                ],
                [
                    'key' => 'seo_default_title',
                    'value' => 'Toko Kulot — Daster & Kulot Nyaman Harga Grosir',
                    'group' => 'seo',
                    'type' => 'text',
                    'label' => 'Judul SEO default',
                ],
                [
                    'key' => 'seo_default_description',
                    'value' => 'Jual daster dan kulot bahan rayon adem, jahitan rapi, '
                        .'harga eceran dan grosir. Kirim dari Pekalongan ke seluruh Indonesia.',
                    'group' => 'seo',
                    'type' => 'textarea',
                    'label' => 'Deskripsi SEO default',
                ],
                [
                    'key' => 'shipping_cost_default',
                    'value' => '20000',
                    'group' => 'pembayaran',
                    'type' => 'text',
                    'label' => 'Ongkos kirim default (rupiah)',
                ],
                [
                    'key' => 'product_care_note',
                    'value' => '[CONTOH] Cuci dengan air dingin, jemur di tempat teduh, setrika dengan suhu rendah.',
                    'group' => 'produk',
                    'type' => 'textarea',
                    'label' => 'Catatan perawatan produk',
                ],
                [
                    'key' => 'product_shipping_note',
                    'value' => '[CONTOH] Pengiriman setiap hari kerja. Produk dikemas aman dengan plastik tebal.',
                    'group' => 'produk',
                    'type' => 'textarea',
                    'label' => 'Catatan pengiriman produk',
                ],
                [
                    'key' => 'midtrans_client_key',
                    'value' => '',
                    'group' => 'pembayaran',
                    'type' => 'text',
                    'label' => 'Midtrans client key (diisi pemilik)',
                ],
                [
                    'key' => 'midtrans_is_production',
                    'value' => '0',
                    'group' => 'pembayaran',
                    'type' => 'text',
                    'label' => 'Midtrans mode produksi (0/1)',
                ],
                [
                    'key' => 'shipping_origin_name',
                    'value' => '[CONTOH] Toko Kulot Pekalongan',
                    'group' => 'shipping',
                    'type' => 'text',
                    'label' => 'Nama asal pengiriman',
                ],
                [
                    'key' => 'shipping_origin_phone',
                    'value' => '[CONTOH] 0812-0000-0001',
                    'group' => 'shipping',
                    'type' => 'text',
                    'label' => 'Telepon asal pengiriman',
                ],
                [
                    'key' => 'shipping_origin_address',
                    'value' => '[CONTOH] Jl. Kauman No. 45, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah',
                    'group' => 'shipping',
                    'type' => 'textarea',
                    'label' => 'Alamat asal pengiriman',
                ],
                [
                    'key' => 'shipping_origin_postal_code',
                    'value' => '51122',
                    'group' => 'shipping',
                    'type' => 'text',
                    'label' => 'Kode pos asal pengiriman',
                ],
                [
                    // Layanan yang boleh dipilih di checkout (addendum v1.1 §D3).
                    'key' => 'shipping_couriers',
                    'value' => $this->json(BiteshipService::DEFAULT_COURIERS),
                    'group' => 'shipping',
                    'type' => 'json',
                    'label' => 'Layanan kurir aktif',
                ],
                [
                    'key' => 'free_shipping_enabled',
                    'value' => '1',
                    'group' => 'shipping',
                    'type' => 'text',
                    'label' => 'Gratis ongkir aktif (0/1)',
                ],
                [
                    'key' => 'free_shipping_min',
                    'value' => '300000',
                    'group' => 'shipping',
                    'type' => 'text',
                    'label' => 'Minimal belanja gratis ongkir (rupiah)',
                ],
            ];

            foreach ($settings as $setting) {
                Setting::firstOrCreate(['key' => $setting['key']], $setting);
            }

            $this->restoreMissingSeedImages();
            $this->assertSeedComplete(array_column($settings, 'key'));
        });
    }

    /**
     * Pulihkan berkas gambar seed yang hilang/0 byte untuk path yang sudah
     * tersimpan di DB — termasuk path lama yang berbeda dari nilai seeder.
     * Path non-seed (unggahan pemilik di `/storage/...`) tidak disentuh.
     */
    private function restoreMissingSeedImages(): void
    {
        $stored = Setting::query()
            ->whereIn('key', ['store_logo', 'store_favicon', 'landing_hero', 'landing_sections', 'landing_gallery'])
            ->get();

        foreach ($stored as $setting) {
            foreach ($this->seedImagePaths($setting) as $path) {
                $absolute = public_path(ltrim($path, '/'));

                if (is_file($absolute) && filesize($absolute) > 0) {
                    continue;
                }

                [$width, $height] = $this->seedImageDimensions($setting->key);
                $label = strtoupper(str_replace('-', ' ', pathinfo($path, PATHINFO_FILENAME)));

                $this->seedImage(ltrim($path, '/'), $width, $height, $label);
            }
        }
    }

    /**
     * @return array<int, string> path gambar seed milik satu baris setting
     */
    private function seedImagePaths(Setting $setting): array
    {
        if ($setting->type === 'image') {
            return $this->isSeedPath($setting->value) ? [$setting->value] : [];
        }

        if (! in_array($setting->key, ['landing_hero', 'landing_sections', 'landing_gallery'], true)) {
            return [];
        }

        $decoded = json_decode((string) $setting->value, true);

        if (! is_array($decoded)) {
            return [];
        }

        $candidates = match ($setting->key) {
            'landing_hero' => [$decoded['image'] ?? null],
            'landing_sections' => [$decoded['promo']['image'] ?? null],
            // Galeri: tiap item punya `image` sendiri.
            'landing_gallery' => array_map(
                fn ($item): mixed => is_array($item) ? ($item['image'] ?? null) : null,
                $decoded,
            ),
        };

        return array_values(array_filter($candidates, fn ($path) => $this->isSeedPath($path)));
    }

    private function isSeedPath(mixed $path): bool
    {
        if (! is_string($path) || ! str_starts_with($path, '/images/seed/')) {
            return false;
        }

        // `seedImage()` selalu menulis PNG; jangan membuat bytes PNG berkedok
        // ekstensi lain (mis. path lama `.jpg` milik repo).
        return str_ends_with(strtolower((string) parse_url($path, PHP_URL_PATH)), '.png');
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function seedImageDimensions(string $key): array
    {
        return match ($key) {
            'store_favicon' => [64, 64],
            'store_logo' => [240, 64],
            default => [1600, 900],
        };
    }

    /**
     * Pemeriksaan akhir: gagal keras bila jumlah/keunikan key atau berkas aset
     * tidak sesuai, supaya seed yang tidak lengkap tidak lolos diam-diam.
     *
     * @param  array<int, string>  $expectedKeys
     */
    private function assertSeedComplete(array $expectedKeys): void
    {
        $stored = Setting::query()->whereIn('key', $expectedKeys)->get(['key', 'value', 'type']);

        if ($stored->count() !== count($expectedKeys)) {
            $missing = array_diff($expectedKeys, $stored->pluck('key')->all());

            throw new RuntimeException('SettingSeeder tidak lengkap; key hilang: '.implode(', ', $missing));
        }

        $stored->each(function (Setting $setting): void {
            if ($setting->type !== 'json') {
                return;
            }

            json_decode((string) $setting->value, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new RuntimeException("Nilai JSON setting `{$setting->key}` tidak valid.");
            }
        });

        foreach ($stored as $setting) {
            foreach ($this->seedImagePaths($setting) as $path) {
                $absolute = public_path(ltrim($path, '/'));

                if (! is_file($absolute) || filesize($absolute) === 0) {
                    throw new RuntimeException("Berkas seed hilang setelah seeding: {$path}");
                }
            }
        }

        $favicon = public_path('favicon.ico');

        if (! is_file($favicon) || filesize($favicon) === 0) {
            throw new RuntimeException('Favicon cadangan public/favicon.ico gagal ditulis.');
        }
    }

    /**
     * @param  array<int|string, mixed>  $value
     */
    private function json(array $value): string
    {
        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }
}
