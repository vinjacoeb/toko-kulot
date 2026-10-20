<?php

namespace App\Http\Controllers;

use App\Models\Carousel;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Setting;
use App\Services\ProductPresenter;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Beranda publik `/` — PRD §5.1 langkah 1, kontrak props docs/kontrak-props.md §8.
 *
 * Server-rendered: seluruh data dikirim pada respons pertama, tanpa flag
 * `loading`/`error` dan tanpa fetch di klien. `settings` tidak dikirim di sini
 * karena sudah dibagikan `HandleInertiaRequests` (§1).
 */
class HomeController extends Controller
{
    /** Batas FAQ beranda (design §3.3 butir 8). */
    private const FAQ_LIMIT = 6;

    /** Batas produk unggulan bila `settings.landing_sections` belum diisi. */
    private const FEATURED_DEFAULT_LIMIT = 8;

    /** Pagar atas agar salah isi pengaturan tidak membanjiri beranda. */
    private const FEATURED_MAX_LIMIT = 24;

    public function __construct(private readonly ProductPresenter $products)
    {
    }

    public function index(): Response
    {
        return Inertia::render('Public/Home', [
            'carousels' => $this->carousels(),
            'categories' => $this->categories(),
            'featured' => $this->featured(),
            'faqs' => $this->faqs(),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function carousels(): array
    {
        return Carousel::query()
            ->active()
            ->ordered()
            ->get(['id', 'image', 'title', 'subtitle', 'button_text', 'link'])
            ->map(fn (Carousel $carousel) => [
                'id' => (int) $carousel->id,
                'image' => $carousel->image,
                'title' => $carousel->title,
                'subtitle' => $carousel->subtitle,
                'cta_label' => filled($carousel->button_text) ? $carousel->button_text : null,
                'cta_url' => filled($carousel->link) ? $carousel->link : null,
                'is_active' => true,
            ])
            ->all();
    }

    /**
     * Kategori aktif yang punya minimal satu produk aktif. Kategori kosong
     * tidak dikirim karena frontend tidak merendernya (design §3.3 butir 3).
     *
     * @return array<int, array<string, mixed>>
     */
    private function categories(): array
    {
        return Category::query()
            ->active()
            ->ordered()
            ->withCount(['products as product_count' => fn (Builder $query) => $query->where('is_active', true)])
            ->get(['id', 'name', 'slug', 'image'])
            ->filter(fn (Category $category) => (int) $category->product_count > 0)
            ->map(fn (Category $category) => [
                'id' => (int) $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image' => $category->image,
                'url' => '/produk?kategori='.$category->slug,
                'product_count' => (int) $category->product_count,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function featured(): array
    {
        $products = $this->products->query()
            ->active()
            ->featured()
            ->orderByDesc('rating_avg')
            ->orderByDesc('rating_count')
            ->orderBy('id')
            ->limit($this->featuredLimit())
            ->get();

        return $this->products->cards($products);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function faqs(): array
    {
        return Faq::query()
            ->active()
            ->ordered()
            ->limit(self::FAQ_LIMIT)
            ->get(['id', 'question', 'answer'])
            ->map(fn (Faq $faq) => [
                'id' => (int) $faq->id,
                'question' => $faq->question,
                'answer' => $faq->answer,
            ])
            ->all();
    }

    /**
     * Jumlah produk unggulan dari `settings.landing_sections.featured.limit`
     * (kontrak props §2), dijepit 1..FEATURED_MAX_LIMIT.
     */
    private function featuredLimit(): int
    {
        $raw = Setting::query()->where('key', 'landing_sections')->value('value');
        $sections = is_string($raw) ? json_decode($raw, true) : null;
        $limit = is_array($sections) ? data_get($sections, 'featured.limit') : null;
        $limit = is_numeric($limit) ? (int) $limit : self::FEATURED_DEFAULT_LIMIT;

        return max(1, min($limit, self::FEATURED_MAX_LIMIT));
    }
}
