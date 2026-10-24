<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateLandingRequest;
use App\Http\Requests\Admin\UpdateSettingRequest;
use App\Models\Carousel;
use App\Models\Faq;
use App\Services\MidtransService;
use App\Services\SettingService;
use App\Support\MediaStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pengaturan situs, carousel beranda, dan FAQ (PRD §6, §9; kontrak props §10.7–§10.9).
 */
class SettingController extends Controller
{
    /** Sub-key landing yang boleh disimpan, per bagian. */
    private const SECTION_KEYS = [
        'announcement' => ['text', 'url', 'is_active'],
        'trust_strip' => ['icon', 'title', 'subtitle'],
        'featured' => ['title', 'subtitle', 'limit'],
        'promo' => ['title', 'subtitle', 'cta_label', 'cta_url', 'image', 'is_active'],
        'why_us' => ['title', 'items'],
        'newsletter' => ['title', 'subtitle', 'button_text'],
    ];

    private const WHY_US_ITEM_KEYS = ['title', 'body'];

    /** Key unggahan gambar pada tab umum. */
    private const IMAGE_KEYS = ['store_logo', 'store_favicon'];

    public function __construct(
        private readonly SettingService $settings,
        private readonly MidtransService $midtrans,
    ) {
    }

    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'pengaturan' => $this->settings->grouped(),
            // Membuat tab Pembayaran bisa menjelaskan kenapa QRIS tidak bisa
            // ditransfer dan apa yang pemilik harus ubah (kontrak §10.7).
            'midtrans' => $this->midtrans->modeInfo(),
            'carousels' => Carousel::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Carousel $carousel): array => [
                    'id' => $carousel->id,
                    'title' => $carousel->title,
                    'subtitle' => $carousel->subtitle,
                    'image' => $carousel->image,
                    'link' => $carousel->link,
                    'button_text' => $carousel->button_text,
                    'sort_order' => (int) $carousel->sort_order,
                    'is_active' => (bool) $carousel->is_active,
                ])
                ->all(),
            'faqs' => Faq::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Faq $faq): array => [
                    'id' => $faq->id,
                    'question' => $faq->question,
                    'answer' => $faq->answer,
                    'sort_order' => (int) $faq->sort_order,
                    'is_active' => (bool) $faq->is_active,
                ])
                ->all(),
        ]);
    }

    public function update(UpdateSettingRequest $request): RedirectResponse
    {
        $values = $request->settingValues();

        if ($values !== []) {
            $this->settings->putMany($values);
        }

        foreach (self::IMAGE_KEYS as $key) {
            if (! $request->hasFile($key)) {
                continue;
            }

            $old = $this->settings->get($key);
            $path = MediaStorage::store($request->file($key), 'settings');

            $this->settings->put($key, $path);
            MediaStorage::delete(is_string($old) ? $old : null);
        }

        if ($request->wantsLogoRemoval()) {
            $old = $this->settings->get('store_logo');

            MediaStorage::delete(is_string($old) ? $old : null);
            $this->settings->put('store_logo', null);
        }

        return back()->with('success', 'Pengaturan disimpan.');
    }

    public function landing(UpdateLandingRequest $request): RedirectResponse
    {
        $hero = $this->onlyKeys((array) $request->input('landing_hero'), ['title', 'subtitle', 'cta_label', 'cta_url', 'image']);
        $sections = $this->knownSections((array) $request->input('landing_sections'));
        $gallery = $this->galleryFromRequest($request);
        $oldPaths = $gallery !== null ? $this->galleryPaths($this->settings->get('landing_gallery')) : [];

        if ($request->hasFile('landing_hero.image')) {
            $old = $this->settings->get('landing_hero.image');
            $hero['image'] = MediaStorage::store($request->file('landing_hero.image'), 'landing');
            MediaStorage::delete(is_string($old) ? $old : null);
        }

        if ($request->hasFile('landing_sections.promo.image')) {
            $old = $this->settings->get('landing_sections.promo.image');
            $sections['promo']['image'] = MediaStorage::store($request->file('landing_sections.promo.image'), 'landing');
            MediaStorage::delete(is_string($old) ? $old : null);
        }

        $values = [
            'landing_hero' => $hero,
            'landing_sections' => $sections,
        ];

        if ($gallery !== null) {
            $values['landing_gallery'] = $gallery['items'];
        }

        $this->settings->putMany($values);

        // Berkas galeri yang tidak lagi dipakai (item dihapus atau gambarnya
        // diganti) dihapus dari disk supaya tidak menumpuk yatim.
        if ($gallery !== null) {
            foreach (array_diff($oldPaths, $gallery['paths']) as $path) {
                MediaStorage::delete($path);
            }
        }

        return back()->with('success', 'Konten landing disimpan.');
    }

    /**
     * Galeri dari request, atau `null` bila form tidak mengelola galeri
     * (form lama tanpa field ini tidak boleh menghapus data).
     *
     * @return array{items: array<int, array{image: string, caption: ?string, alt: ?string}>, paths: array<int, string>}|null
     */
    private function galleryFromRequest(UpdateLandingRequest $request): ?array
    {
        $present = $request->boolean('landing_gallery_present')
            || $request->exists('landing_gallery')
            || $request->hasFile('landing_gallery');

        if (! $present) {
            return null;
        }

        $items = [];
        $paths = [];

        foreach ((array) ($request->all()['landing_gallery'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }

            $path = $item['image'] ?? null;

            if ($path instanceof UploadedFile) {
                $path = MediaStorage::store($path, 'landing');
            }

            if (! is_string($path) || $path === '') {
                continue;
            }

            $items[] = [
                'image' => $path,
                'caption' => $this->cleanText($item['caption'] ?? null),
                'alt' => $this->cleanText($item['alt'] ?? null),
            ];
            $paths[] = $path;
        }

        return ['items' => $items, 'paths' => $paths];
    }

    /**
     * @return array<int, string>
     */
    private function galleryPaths(mixed $gallery): array
    {
        $paths = [];

        foreach (is_array($gallery) ? $gallery : [] as $item) {
            if (is_array($item) && is_string($item['image'] ?? null)) {
                $paths[] = $item['image'];
            }
        }

        return $paths;
    }

    private function cleanText(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }

    /**
     * @param  array<string, mixed>  $values
     * @param  array<int, string>  $allowed
     * @return array<string, mixed>
     */
    private function onlyKeys(array $values, array $allowed): array
    {
        return array_intersect_key($values, array_flip($allowed));
    }

    /**
     * Buang sub-key yang tidak dikenal agar `landing_sections` tetap bersih.
     *
     * @param  array<string, mixed>  $sections
     * @return array<string, mixed>
     */
    private function knownSections(array $sections): array
    {
        $result = [];

        foreach (self::SECTION_KEYS as $section => $keys) {
            if (! array_key_exists($section, $sections)) {
                continue;
            }

            $value = $sections[$section];

            if ($section === 'trust_strip') {
                $items = [];

                foreach (is_array($value) ? $value : [] as $item) {
                    if (is_array($item)) {
                        $items[] = $this->onlyKeys($item, $keys);
                    }
                }

                $result[$section] = $items;

                continue;
            }

            if ($section === 'why_us') {
                $block = is_array($value) ? $this->onlyKeys($value, $keys) : [];

                if (isset($block['items']) && is_array($block['items'])) {
                    $block['items'] = array_values(array_map(
                        fn ($item): array => is_array($item) ? $this->onlyKeys($item, self::WHY_US_ITEM_KEYS) : [],
                        $block['items'],
                    ));
                }

                $result[$section] = $block;

                continue;
            }

            $block = is_array($value) ? $this->onlyKeys($value, $keys) : [];

            if (array_key_exists('is_active', $block)) {
                $block['is_active'] = filter_var($block['is_active'], FILTER_VALIDATE_BOOLEAN);
            }

            if (array_key_exists('limit', $block)) {
                $block['limit'] = (int) $block['limit'];
            }

            $result[$section] = $block;
        }

        return $result;
    }
}
