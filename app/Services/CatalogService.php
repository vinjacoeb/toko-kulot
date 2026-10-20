<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Support\VariantSize;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Satu-satunya tempat query katalog publik: filter, urutan, paginasi, daftar ukuran,
 * dan produk serupa (docs/kontrak-props.md §11.1–§11.2). Controller tetap tipis.
 *
 * Semua masukan pengguna divalidasi di sini; nilai tidak valid diabaikan (jadi `null`),
 * bukan memicu galat — sesuai kontrak §11.1.
 */
class CatalogService
{
    public const PER_PAGE = 12;

    public const RELATED_LIMIT = 4;

    /** Nilai `urut` yang dikenal (kontrak §11.1). */
    public const SORTS = ['terbaru', 'harga-asc', 'harga-desc', 'terlaris', 'rating'];

    private const MAX_Q = 100;

    private const MAX_SLUG = 100;

    private const MAX_SIZES = 20;

    private const MAX_SIZE_LENGTH = 30;

    /** Pagar atas nilai rupiah dari query string. */
    private const MAX_AMOUNT = 999999999;

    public function __construct(private readonly ProductPresenter $presenter)
    {
    }

    /**
     * Props halaman `/produk` (kontrak §11.1).
     *
     * @return array<string, mixed>
     */
    public function index(Request $request): array
    {
        $filters = $this->filters($request);
        $paginator = $this->products($filters)->paginate(
            self::PER_PAGE,
            ['products.*'],
            'page',
            $filters['page']
        );

        return [
            'products' => [
                'data' => $this->presenter->cards($paginator->items()),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'categories' => $this->categories(),
            'sizes' => $this->sizes(),
            'filters' => array_merge($filters, ['page' => $paginator->currentPage()]),
            'error' => null,
        ];
    }

    /**
     * Props halaman `/produk/{slug}` (kontrak §11.2). `null` bila produk tidak ada
     * atau tidak aktif — pemanggil membalas 404.
     *
     * @return array<string, mixed>|null
     */
    public function show(string $slug): ?array
    {
        $product = $this->find($slug);

        if ($product === null) {
            return null;
        }

        return [
            'product' => $this->presenter->detail($product),
            'related' => $this->presenter->cards($this->related($product)),
            'error' => null,
        ];
    }

    /**
     * Produk aktif dari slug; bila slug seluruhnya angka dan tidak ada slug yang cocok,
     * dicoba sebagai `id` (PRD §14.1 butir 1).
     */
    public function find(string $slug): ?Product
    {
        $slug = trim($slug);

        if ($slug === '') {
            return null;
        }

        $product = $this->presenter->query()
            ->where('products.is_active', true)
            ->where('products.slug', $slug)
            ->first();

        if ($product === null && ctype_digit($slug) && strlen($slug) <= 18) {
            $product = $this->presenter->query()
                ->where('products.is_active', true)
                ->whereKey((int) $slug)
                ->first();
        }

        return $product;
    }

    /**
     * Query string → `filters` ternormalisasi (kontrak §11.1).
     *
     * @return array<string, mixed>
     */
    public function filters(Request $request): array
    {
        $q = $this->text($request->query('q'), self::MAX_Q);
        $kategori = $this->slug($request->query('kategori'));
        $sizes = $this->sizeList($request->query('ukuran'));

        $min = $this->amount($request->query('harga_min'));
        $max = $this->amount($request->query('harga_max'));

        if ($min !== null && $max !== null && $min > $max) {
            [$min, $max] = [$max, $min];
        }

        $urut = $this->text($request->query('urut'), 20);
        $page = (int) $request->query('page', 1);

        return [
            'q' => $q,
            'kategori' => $kategori,
            'ukuran' => $sizes === [] ? null : implode(',', $sizes),
            'harga_min' => $min,
            'harga_max' => $max,
            'urut' => in_array($urut, self::SORTS, true) ? $urut : 'terbaru',
            'page' => $page > 0 ? $page : 1,
        ];
    }

    /**
     * Daftar produk aktif sesuai filter (tanpa paginasi).
     *
     * @param  array<string, mixed>  $filters
     */
    public function products(array $filters): Builder
    {
        $query = $this->presenter->query()->where('products.is_active', true);

        if (($filters['q'] ?? null) !== null) {
            $term = '%'.$this->escapeLike((string) $filters['q']).'%';

            $query->where(function (Builder $inner) use ($term) {
                $inner->where('products.name', 'like', $term)
                    ->orWhere('products.short_description', 'like', $term)
                    ->orWhere('products.sku', 'like', $term);
            });
        }

        if (($filters['kategori'] ?? null) !== null) {
            $kategori = (string) $filters['kategori'];

            $query->whereHas('category', fn (Builder $category) => $category->where('slug', $kategori));
        }

        if (($filters['ukuran'] ?? null) !== null) {
            $wanted = array_map(
                fn (string $size) => strtolower($size),
                explode(',', (string) $filters['ukuran'])
            );

            $query->whereHas('variants', function (Builder $variant) use ($wanted) {
                $variant->where('product_variants.is_active', true)
                    ->whereIn(DB::raw('lower(product_variants.size)'), $wanted);
            });
        }

        if (($filters['harga_min'] ?? null) !== null) {
            $query->where('products.base_price', '>=', $filters['harga_min']);
        }

        if (($filters['harga_max'] ?? null) !== null) {
            $query->where('products.base_price', '<=', $filters['harga_max']);
        }

        return $this->applySort($query, (string) ($filters['urut'] ?? 'terbaru'));
    }

    /**
     * Urutan daftar katalog (kontrak §11.1). `terlaris` memakai jumlah `order_items.qty`
     * pada pesanan yang tidak dibatalkan.
     */
    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'harga-asc' => $query->orderBy('products.base_price')->orderBy('products.id'),
            'harga-desc' => $query->orderByDesc('products.base_price')->orderBy('products.id'),
            'rating' => $query
                ->orderByDesc('products.rating_avg')
                ->orderByDesc('products.rating_count')
                ->orderBy('products.id'),
            'terlaris' => $query
                ->withSum(
                    ['orderItems as sold_qty' => fn (Builder $item) => $item->whereHas(
                        'order',
                        fn (Builder $order) => $order->where('status', '!=', Order::STATUS_CANCELLED)
                    )],
                    'qty'
                )
                ->orderByDesc('sold_qty')
                ->orderBy('products.id'),
            default => $query->orderByDesc('products.created_at')->orderByDesc('products.id'),
        };
    }

    /**
     * Kategori aktif yang punya minimal satu produk aktif, bentuk kontrak §8.2.
     *
     * @return array<int, array<string, mixed>>
     */
    public function categories(): array
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
     * Ukuran varian aktif dari produk aktif, urut ukuran baku (kontrak §11.1).
     *
     * @return array<int, string>
     */
    public function sizes(): array
    {
        $sizes = DB::table('product_variants')
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->where('product_variants.is_active', true)
            ->where('products.is_active', true)
            ->whereNotNull('product_variants.size')
            ->distinct()
            ->pluck('product_variants.size')
            ->all();

        return VariantSize::sort($sizes);
    }

    /**
     * Produk aktif lain di kategori yang sama, maksimum `RELATED_LIMIT` (kontrak §11.2).
     *
     * @return Collection<int, Product>
     */
    private function related(Product $product): Collection
    {
        if ($product->category_id === null) {
            return new Collection();
        }

        return $this->presenter->query()
            ->where('products.is_active', true)
            ->where('products.category_id', $product->category_id)
            ->whereKeyNot($product->getKey())
            ->orderByDesc('products.rating_avg')
            ->orderBy('products.id')
            ->limit(self::RELATED_LIMIT)
            ->get();
    }

    private function text(mixed $value, int $max): ?string
    {
        if (! is_string($value) && ! is_numeric($value)) {
            return null;
        }

        $value = trim((string) preg_replace('/[\x00-\x1F\x7F]/u', ' ', (string) $value));

        if ($value === '') {
            return null;
        }

        return mb_strlen($value) > $max ? mb_substr($value, 0, $max) : $value;
    }

    private function slug(mixed $value): ?string
    {
        $value = $this->text($value, self::MAX_SLUG);

        if ($value === null) {
            return null;
        }

        $value = strtolower($value);

        return preg_match('/^[a-z0-9-]+$/', $value) === 1 ? $value : null;
    }

    /**
     * @return array<int, string>
     */
    private function sizeList(mixed $value): array
    {
        $raw = [];

        if (is_array($value)) {
            $raw = $value;
        } elseif (is_string($value) || is_numeric($value)) {
            $raw = explode(',', (string) $value);
        }

        $sizes = [];

        foreach ($raw as $item) {
            $size = $this->text($item, self::MAX_SIZE_LENGTH);

            if ($size === null) {
                continue;
            }

            $sizes[$size] = $size;

            if (count($sizes) >= self::MAX_SIZES) {
                break;
            }
        }

        return VariantSize::sort(array_values($sizes));
    }

    private function amount(mixed $value): ?int
    {
        if ($value === null || $value === '' || is_array($value) || ! is_numeric($value)) {
            return null;
        }

        $number = (int) $value;

        if ($number < 0) {
            return null;
        }

        return min($number, self::MAX_AMOUNT);
    }

    private function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }
}
