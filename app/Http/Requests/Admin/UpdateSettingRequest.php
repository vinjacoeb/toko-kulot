<?php

namespace App\Http\Requests\Admin;

use App\Services\SettingService;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Simpan satu tab pengaturan situs (kontrak §10.8).
 *
 * Hanya key yang dikirim yang ditulis, jadi tab lain tidak tersentuh.
 * Key di luar daftar putih SettingService::DEFINITIONS diabaikan controller.
 */
class UpdateSettingRequest extends FormRequest
{
    /** Key berupa berkas unggahan, ditangani terpisah di controller. */
    private const FILE_KEYS = ['store_logo', 'store_favicon'];

    /** Key bantu aksi, bukan nilai pengaturan. */
    private const HELPER_KEYS = ['hapus_store_logo'];

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
            'store_name' => ['sometimes', 'required', 'string', 'max:100'],
            'store_tagline' => ['sometimes', 'nullable', 'string', 'max:150'],
            'store_logo' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'store_favicon' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp,ico', 'max:512'],
            'hapus_store_logo' => ['sometimes', 'boolean'],
            'header_nav' => ['sometimes', 'array', 'max:8'],
            'header_nav.*.label' => ['required_with:header_nav', 'string', 'max:40'],
            'header_nav.*.url' => ['required_with:header_nav', 'string', 'max:255'],
            'footer_about' => ['sometimes', 'nullable', 'string', 'max:500'],
            'footer_links' => ['sometimes', 'array', 'max:8'],
            'footer_links.*.label' => ['required_with:footer_links', 'string', 'max:40'],
            'footer_links.*.url' => ['required_with:footer_links', 'string', 'max:255'],
            'footer_social' => ['sometimes', 'array', 'max:8'],
            'footer_social.*.label' => ['required_with:footer_social', 'string', 'max:40'],
            'footer_social.*.url' => ['required_with:footer_social', 'string', 'max:255'],
            'contact_email' => ['sometimes', 'nullable', 'string', 'email', 'max:150'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'contact_whatsapp' => ['sometimes', 'nullable', 'string', 'max:30'],
            'contact_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'contact_map_embed' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'seo_default_title' => ['sometimes', 'nullable', 'string', 'max:150'],
            'seo_default_description' => ['sometimes', 'nullable', 'string', 'max:300'],
            'shipping_cost_default' => ['sometimes', 'required', 'integer', 'min:0', 'max:1000000'],
            'midtrans_client_key' => ['sometimes', 'nullable', 'string', 'max:100'],
            'midtrans_is_production' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'store_name.required' => 'Nama toko wajib diisi.',
            'store_name.max' => 'Nama toko maksimal 100 karakter.',
            'store_tagline.max' => 'Tagline maksimal 150 karakter.',
            'store_logo.image' => 'Logo harus gambar JPG, PNG, atau WebP maksimal 2 MB.',
            'store_logo.mimes' => 'Logo harus gambar JPG, PNG, atau WebP maksimal 2 MB.',
            'store_logo.max' => 'Logo harus gambar JPG, PNG, atau WebP maksimal 2 MB.',
            'store_favicon.image' => 'Favicon harus gambar maksimal 512 KB.',
            'store_favicon.mimes' => 'Favicon harus gambar maksimal 512 KB.',
            'store_favicon.max' => 'Favicon harus gambar maksimal 512 KB.',
            'header_nav.max' => 'Menu navigasi maksimal 8 item.',
            'header_nav.*.label.required_with' => 'Label menu navigasi wajib diisi.',
            'header_nav.*.url.required_with' => 'Tautan menu navigasi wajib diisi.',
            'footer_links.max' => 'Tautan footer maksimal 8 item.',
            'footer_links.*.label.required_with' => 'Label tautan footer wajib diisi.',
            'footer_links.*.url.required_with' => 'Tautan footer wajib diisi.',
            'footer_social.max' => 'Media sosial maksimal 8 item.',
            'footer_social.*.label.required_with' => 'Nama media sosial wajib diisi.',
            'footer_social.*.url.required_with' => 'Tautan media sosial wajib diisi.',
            'contact_email.email' => 'Email kontak tidak valid.',
            'contact_email.max' => 'Email kontak maksimal 150 karakter.',
            'contact_phone.max' => 'Nomor telepon maksimal 30 karakter.',
            'contact_whatsapp.max' => 'Nomor WhatsApp maksimal 30 karakter.',
            'contact_address.max' => 'Alamat maksimal 500 karakter.',
            'contact_map_embed.max' => 'Kode peta maksimal 1000 karakter.',
            'seo_default_title.max' => 'Judul SEO maksimal 150 karakter.',
            'seo_default_description.max' => 'Deskripsi SEO maksimal 300 karakter.',
            'shipping_cost_default.required' => 'Ongkir wajib diisi.',
            'shipping_cost_default.integer' => 'Ongkir harus angka 0 atau lebih.',
            'shipping_cost_default.min' => 'Ongkir harus angka 0 atau lebih.',
            'shipping_cost_default.max' => 'Ongkir terlalu besar.',
            'midtrans_client_key.max' => 'Client key maksimal 100 karakter.',
        ];
    }

    /**
     * Nilai teks/json yang boleh ditulis, hanya untuk key yang benar-benar dikirim.
     *
     * @return array<string, mixed>
     */
    public function settingValues(): array
    {
        $values = [];

        foreach (array_keys(SettingService::DEFINITIONS) as $key) {
            if (in_array($key, self::FILE_KEYS, true) || in_array($key, self::HELPER_KEYS, true)) {
                continue;
            }

            if (! $this->exists($key)) {
                continue;
            }

            $values[$key] = $this->input($key);
        }

        return $values;
    }

    public function wantsLogoRemoval(): bool
    {
        return $this->exists('hapus_store_logo') && $this->boolean('hapus_store_logo');
    }
}
