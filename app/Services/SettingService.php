<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Baca-tulis konfigurasi situs (PRD §6 tabel `settings`, §9 tab pengaturan).
 *
 * Satu-satunya pintu untuk mengubah `settings`. Nilai disimpan sebagai teks;
 * key bertipe `json` di-encode/decode di sini, dan beberapa key punya format
 * tambahan (`int`, `bool`) supaya frontend menerima angka/boolean, bukan string.
 */
class SettingService
{
    /** Urutan tab panel admin (PRD §9). */
    public const GROUPS = ['umum', 'landing', 'header', 'footer', 'kontak', 'seo', 'pembayaran'];

    /**
     * Daftar putih key pengaturan (PRD §6) beserta grup dan tipe simpannya.
     * `format` hanya dipakai untuk key yang butuh konversi di luar teks/json.
     *
     * @var array<string, array{group: string, type: string, format?: string}>
     */
    public const DEFINITIONS = [
        'store_name' => ['group' => 'umum', 'type' => 'text'],
        'store_logo' => ['group' => 'umum', 'type' => 'image'],
        'store_favicon' => ['group' => 'umum', 'type' => 'image'],
        'store_tagline' => ['group' => 'umum', 'type' => 'text'],
        'header_nav' => ['group' => 'header', 'type' => 'json'],
        'footer_about' => ['group' => 'footer', 'type' => 'textarea'],
        'footer_copyright' => ['group' => 'footer', 'type' => 'text'],
        'footer_links' => ['group' => 'footer', 'type' => 'json'],
        'footer_social' => ['group' => 'footer', 'type' => 'json'],
        'contact_email' => ['group' => 'kontak', 'type' => 'text'],
        'contact_phone' => ['group' => 'kontak', 'type' => 'text'],
        'contact_whatsapp' => ['group' => 'kontak', 'type' => 'text'],
        'contact_address' => ['group' => 'kontak', 'type' => 'textarea'],
        'contact_map_embed' => ['group' => 'kontak', 'type' => 'textarea'],
        'landing_hero' => ['group' => 'landing', 'type' => 'json'],
        'landing_sections' => ['group' => 'landing', 'type' => 'json'],
        'seo_default_title' => ['group' => 'seo', 'type' => 'text'],
        'seo_default_description' => ['group' => 'seo', 'type' => 'textarea'],
        'shipping_cost_default' => ['group' => 'pembayaran', 'type' => 'text', 'format' => 'int'],
        'midtrans_client_key' => ['group' => 'pembayaran', 'type' => 'text'],
        'midtrans_is_production' => ['group' => 'pembayaran', 'type' => 'text', 'format' => 'bool'],
    ];

    /**
     * Seluruh pengaturan sebagai peta key => nilai yang sudah di-decode.
     *
     * @return array<string, mixed>
     */
    public function all(): array
    {
        $result = [];

        foreach (Setting::query()->get() as $setting) {
            $result[$setting->key] = $this->decode($setting);
        }

        return $result;
    }

    /**
     * Pengaturan dikelompokkan per tab admin, urut sesuai GROUPS dan DEFINITIONS.
     * Key di luar daftar putih tetap ikut dibaca agar tidak hilang diam-diam.
     *
     * @return array<string, array<string, mixed>>
     */
    public function grouped(): array
    {
        $values = $this->all();
        $grouped = [];

        foreach (self::GROUPS as $group) {
            $grouped[$group] = [];
        }

        foreach (self::DEFINITIONS as $key => $definition) {
            $grouped[$definition['group']][$key] = $values[$key] ?? null;
        }

        $unknown = array_diff_key($values, self::DEFINITIONS);

        if ($unknown !== []) {
            $grouped['lainnya'] = $unknown;
        }

        return $grouped;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $setting = Setting::query()->where('key', $key)->first();

        return $setting instanceof Setting ? $this->decode($setting) : $default;
    }

    public function isWritable(string $key): bool
    {
        return array_key_exists($key, self::DEFINITIONS);
    }

    /**
     * Tulis satu key. Nilai `null` dikosongkan.
     */
    public function put(string $key, mixed $value): void
    {
        if (! $this->isWritable($key)) {
            throw new InvalidArgumentException("Key pengaturan tidak dikenal: {$key}");
        }

        $definition = self::DEFINITIONS[$key];

        $setting = Setting::query()->firstOrNew(['key' => $key]);
        $setting->value = $this->encode($key, $value);
        $setting->group = $definition['group'];
        $setting->type = $definition['type'];

        if ($setting->label === null || $setting->label === '') {
            $setting->label = str_replace('_', ' ', ucfirst($key));
        }

        $setting->save();
    }

    /**
     * Tulis beberapa key sekaligus dalam satu transaksi. Key yang tidak ada
     * pada DEFINITIONS ditolak agar tidak ada penulisan liar.
     *
     * @param  array<string, mixed>  $values
     */
    public function putMany(array $values): void
    {
        DB::transaction(function () use ($values): void {
            foreach ($values as $key => $value) {
                $this->put($key, $value);
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function decode(Setting $setting): mixed
    {
        $format = self::DEFINITIONS[$setting->key]['format'] ?? null;
        $value = $setting->value;

        if ($value === null) {
            return null;
        }

        if ($setting->type === 'json') {
            $decoded = json_decode((string) $value, true);

            return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
        }

        return match ($format) {
            'int' => (int) $value,
            'bool' => (bool) (int) $value,
            default => (string) $value === '' ? null : (string) $value,
        };
    }

    private function encode(string $key, mixed $value): ?string
    {
        $format = self::DEFINITIONS[$key]['format'] ?? null;

        if ($value === null) {
            return null;
        }

        if (self::DEFINITIONS[$key]['type'] === 'json') {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return match ($format) {
            'int' => (string) max(0, (int) $value),
            'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            default => (string) $value,
        };
    }
}
