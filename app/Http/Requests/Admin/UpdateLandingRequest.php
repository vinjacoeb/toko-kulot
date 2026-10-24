<?php

namespace App\Http\Requests\Admin;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

/**
 * Simpan konten landing page (kontrak §10.9).
 *
 * Struktur mengikuti `database/seeders/SettingSeeder.php`; controller membuang
 * sub-key yang tidak dikenal sebelum menyimpan.
 */
class UpdateLandingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'landing_hero' => ['required', 'array'],
            'landing_hero.title' => ['required', 'string', 'max:150'],
            'landing_hero.subtitle' => ['nullable', 'string', 'max:255'],
            'landing_hero.cta_label' => ['nullable', 'string', 'max:60'],
            'landing_hero.cta_url' => ['nullable', 'string', 'max:255'],
            'landing_hero.image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],

            'landing_sections' => ['required', 'array'],

            'landing_sections.announcement' => ['nullable', 'array'],
            'landing_sections.announcement.text' => ['nullable', 'string', 'max:255'],
            'landing_sections.announcement.url' => ['nullable', 'string', 'max:255'],
            'landing_sections.announcement.is_active' => ['nullable', 'boolean'],

            'landing_sections.trust_strip' => ['nullable', 'array', 'max:6'],
            'landing_sections.trust_strip.*.icon' => ['nullable', 'string', 'max:40'],
            'landing_sections.trust_strip.*.title' => ['required_with:landing_sections.trust_strip', 'string', 'max:80'],
            'landing_sections.trust_strip.*.subtitle' => ['nullable', 'string', 'max:120'],

            'landing_sections.featured' => ['nullable', 'array'],
            'landing_sections.featured.title' => ['nullable', 'string', 'max:80'],
            'landing_sections.featured.subtitle' => ['nullable', 'string', 'max:120'],
            'landing_sections.featured.limit' => ['nullable', 'integer', 'between:1,12'],

            'landing_sections.promo' => ['nullable', 'array'],
            'landing_sections.promo.title' => ['nullable', 'string', 'max:80'],
            'landing_sections.promo.subtitle' => ['nullable', 'string', 'max:120'],
            'landing_sections.promo.cta_label' => ['nullable', 'string', 'max:60'],
            'landing_sections.promo.cta_url' => ['nullable', 'string', 'max:255'],
            'landing_sections.promo.image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'landing_sections.promo.is_active' => ['nullable', 'boolean'],

            'landing_sections.why_us' => ['nullable', 'array'],
            'landing_sections.why_us.title' => ['nullable', 'string', 'max:80'],
            'landing_sections.why_us.items' => ['nullable', 'array', 'max:6'],
            'landing_sections.why_us.items.*.title' => ['required_with:landing_sections.why_us.items', 'string', 'max:80'],
            'landing_sections.why_us.items.*.body' => ['required_with:landing_sections.why_us.items', 'string', 'max:255'],

            'landing_sections.newsletter' => ['nullable', 'array'],
            'landing_sections.newsletter.title' => ['nullable', 'string', 'max:80'],
            'landing_sections.newsletter.subtitle' => ['nullable', 'string', 'max:120'],
            'landing_sections.newsletter.button_text' => ['nullable', 'string', 'max:40'],

            // Galeri landing (addendum v1.1 §6): maks 8 gambar, unggahan baru
            // atau path yang sudah tersimpan (dipakai saat urutkan/hapus).
            'landing_gallery' => ['nullable', 'array', 'max:8'],
            'landing_gallery_present' => ['nullable', 'boolean'],
            'landing_gallery.*.image' => ['required', $this->galleryImage()],
            'landing_gallery.*.caption' => ['nullable', 'string', 'max:80'],
            'landing_gallery.*.alt' => ['nullable', 'string', 'max:120'],
        ];
    }

    /**
     * Satu field `image` bisa berisi unggahan baru (multipart) atau path gambar
     * yang sudah ada supaya admin bisa mengurutkan tanpa mengunggah ulang.
     */
    private function galleryImage(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if ($value instanceof UploadedFile) {
                $validator = Validator::make(['image' => $value], [
                    'image' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
                ]);

                if ($validator->fails()) {
                    $fail('Gambar galeri harus JPG, PNG, atau WEBP maksimal 2 MB.');
                }

                return;
            }

            if (! is_string($value) || $value === '' || ! str_starts_with($value, '/')) {
                $fail('Gambar galeri tidak valid.');
            }
        };
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'landing_hero.required' => 'Konten hero wajib diisi.',
            'landing_hero.title.required' => 'Judul hero wajib diisi.',
            'landing_hero.title.max' => 'Judul hero maksimal 150 karakter.',
            'landing_sections.required' => 'Konten landing wajib diisi.',
            'landing_sections.trust_strip.max' => 'Keunggulan maksimal 6 item.',
            'landing_sections.trust_strip.*.title.required_with' => 'Judul keunggulan wajib diisi.',
            'landing_sections.featured.limit.between' => 'Jumlah produk unggulan harus 1 sampai 12.',
            'landing_sections.why_us.items.max' => 'Bagian "kenapa kami" maksimal 6 item.',
            'landing_sections.why_us.items.*.title.required_with' => 'Judul item wajib diisi.',
            'landing_sections.why_us.items.*.body.required_with' => 'Keterangan item wajib diisi.',
            'landing_gallery.max' => 'Galeri landing maksimal 8 gambar.',
            'landing_gallery.*.image.required' => 'Setiap item galeri harus punya gambar.',
            'landing_gallery.*.caption.max' => 'Caption galeri maksimal 80 karakter.',
            'landing_gallery.*.alt.max' => 'Teks alternatif galeri maksimal 120 karakter.',
        ];
    }
}
