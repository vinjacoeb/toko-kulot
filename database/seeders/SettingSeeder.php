<?php

namespace Database\Seeders;

use App\Models\Setting;
use Database\Seeders\Concerns\WritesSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * 19 key `settings` minimum sesuai PRD §6. Bentuk JSON mengikuti
 * docs/kontrak-props.md §2 sehingga frontend bisa langsung memakainya.
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
            $heroImage = $this->seedImage('images/seed/landing/hero.png', 1600, 900, 'DASTER & KULOT HARIAN');
            $promoImage = $this->seedImage('images/seed/landing/promo-grosir.png', 1600, 900, 'HARGA GROSIR 4 PCS');

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
                            'subtitle' => 'Tinggalkan email Anda untuk kabar koleksi baru.',
                            'button_text' => 'Kirim',
                        ],
                    ]),
                    'group' => 'landing',
                    'type' => 'json',
                    'label' => 'Bagian landing page',
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
            ];

            foreach ($settings as $setting) {
                Setting::updateOrCreate(['key' => $setting['key']], $setting);
            }
        });
    }

    /**
     * @param  array<int|string, mixed>  $value
     */
    private function json(array $value): string
    {
        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }
}
