<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ListProps;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\ProductAdminService;
use App\Support\VariantSize;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Produk admin — daftar, tambah, ubah, hapus (PRD §5.2, kontrak props §12.1–§12.7).
 * Stok varian hanya berubah lewat StockService di dalam ProductAdminService.
 */
class ProductController extends Controller
{
    use ListProps;

    /** Jumlah stok varian aktif, dipakai untuk filter dan urut. */
    private const STOK_AKTIF = '(select coalesce(sum(product_variants.stock), 0) from product_variants'
        .' where product_variants.product_id = products.id and product_variants.is_active = 1)';

    public function __construct(private readonly ProductAdminService $products) {}

    public function index(Request $request): Response
    {
        $filter = [
            'q' => $this->teks($request->query('q')),
            'kategori' => $this->angka($request->query('kategori')),
            'status' => $this->pilihan($request->query('status'), ['aktif', 'nonaktif'], 'semua'),
            'stok' => $this->pilihan($request->query('stok'), ['habis', 'kritis'], 'semua'),
            'urut' => $this->pilihan($request->query('urut'), ['nama', 'harga', 'stok'], 'terbaru'),
        ];

        $query = Product::query()
            ->with([
                'category:id,name,slug',
                'images' => fn ($images) => $images
                    ->orderByDesc('is_primary')
                    ->orderBy('sort_order')
                    ->orderBy('id'),
            ])
            ->withCount('variants as variant_count')
            ->withSum(['variants as stock' => fn ($variants) => $variants->where('is_active', true)], 'stock');

        if ($filter['q'] !== null) {
            $like = '%'.$filter['q'].'%';
            $query->where(fn ($where) => $where
                ->where('name', 'like', $like)
                ->orWhere('sku', 'like', $like));
        }

        if ($filter['kategori'] !== null) {
            $query->where('category_id', $filter['kategori']);
        }

        if ($filter['status'] === 'aktif') {
            $query->where('is_active', true);
        } elseif ($filter['status'] === 'nonaktif') {
            $query->where('is_active', false);
        }

        if ($filter['stok'] === 'habis') {
            $query->whereRaw(self::STOK_AKTIF.' = 0');
        } elseif ($filter['stok'] === 'kritis') {
            $query->whereRaw(self::STOK_AKTIF.' < 5');
        }

        match ($filter['urut']) {
            'nama' => $query->orderBy('name'),
            'harga' => $query->orderBy('base_price')->orderBy('name'),
            'stok' => $query->orderByRaw(self::STOK_AKTIF.' asc')->orderBy('name'),
            default => $query->orderByDesc('created_at')->orderByDesc('id'),
        };

        $produk = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'produk' => [
                'data' => collect($produk->items())->map(fn (Product $product) => $this->row($product))->all(),
                'links' => $produk->linkCollection()->all(),
                'meta' => $this->meta($produk),
            ],
            'filter' => $filter,
            'kategori' => $this->kategoriOptions(),
            'ringkasan' => [
                'total' => Product::query()->count(),
                'aktif' => Product::query()->where('is_active', true)->count(),
                'nonaktif' => Product::query()->where('is_active', false)->count(),
                'stok_kritis' => Product::query()->whereRaw(self::STOK_AKTIF.' < 5')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'kategori' => $this->kategoriOptions(),
            'ukuran_baku' => VariantSize::ORDER,
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->products->create(
            $request->validated(),
            $request->file('images') ?? [],
            $request->user('admin')?->id,
        );

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk disimpan.');
    }

    public function show(Product $product): Response
    {
        $detail = $this->detail($product);

        return Inertia::render('Admin/Products/Show', [
            'produk' => $detail,
            'ukuran_baku' => VariantSize::ORDER,
            'ringkasan' => [
                'varian_total' => count($detail['variants']),
                'stok_total' => $detail['stock'],
                'stok_kritis' => count(array_filter(
                    $detail['variants'],
                    fn (array $variant) => $variant['is_active'] && $variant['stock'] < 5,
                )),
                'terjual' => (int) OrderItem::query()
                    ->where('product_id', $product->id)
                    ->whereHas('order', fn ($order) => $order->where('status', '!=', Order::STATUS_CANCELLED))
                    ->sum('qty'),
            ],
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Admin/Products/Edit', [
            'produk' => $this->detail($product),
            'kategori' => $this->kategoriOptions(),
            'ukuran_baku' => VariantSize::ORDER,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->products->update(
            $product,
            $request->validated(),
            $request->file('images') ?? [],
            $request->user('admin')?->id,
        );

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->orderItems()->exists()) {
            throw ValidationException::withMessages([
                'produk' => sprintf(
                    'Produk "%s" sudah dipakai pesanan — nonaktifkan saja, tidak bisa dihapus.',
                    $product->name,
                ),
            ]);
        }

        $this->products->delete($product);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Product $product): array
    {
        $image = $product->images->first();

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'category' => $product->category === null ? null : [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ],
            'base_price' => (int) $product->base_price,
            'compare_price' => $product->compare_price === null ? null : (int) $product->compare_price,
            'wholesale_price' => $product->wholesale_price === null ? null : (int) $product->wholesale_price,
            'min_wholesale_qty' => (int) $product->min_wholesale_qty,
            'is_active' => (bool) $product->is_active,
            'is_featured' => (bool) $product->is_featured,
            'stock' => (int) ($product->stock ?? 0),
            'variant_count' => (int) ($product->variant_count ?? 0),
            'image' => $image === null ? null : [
                'id' => $image->id,
                'path' => $image->path,
                'alt' => $image->alt,
            ],
            'url' => '/produk/'.$product->slug,
            'created_at' => $product->created_at?->toIso8601String(),
            'updated_at' => $product->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(Product $product): array
    {
        $product->load([
            'category:id,name,slug',
            'images' => fn ($images) => $images
                ->orderByDesc('is_primary')
                ->orderBy('sort_order')
                ->orderBy('id'),
            'variants',
        ]);

        $variants = $product->variants
            ->sortBy(fn ($variant) => [VariantSize::rank($variant->size), (string) $variant->color])
            ->values();

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'category_id' => $product->category_id,
            'category' => $product->category === null ? null : [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ],
            'short_description' => $product->short_description,
            'description' => $product->description,
            'weight_gram' => (int) $product->weight_gram,
            'base_price' => (int) $product->base_price,
            'compare_price' => $product->compare_price === null ? null : (int) $product->compare_price,
            'wholesale_price' => $product->wholesale_price === null ? null : (int) $product->wholesale_price,
            'min_wholesale_qty' => (int) $product->min_wholesale_qty,
            'is_active' => (bool) $product->is_active,
            'is_featured' => (bool) $product->is_featured,
            'stock' => (int) $variants->where('is_active', true)->sum('stock'),
            'variant_count' => $variants->count(),
            'url' => '/produk/'.$product->slug,
            'created_at' => $product->created_at?->toIso8601String(),
            'updated_at' => $product->updated_at?->toIso8601String(),
            'images' => $product->images->map(fn ($image) => [
                'id' => $image->id,
                'path' => $image->path,
                'alt' => $image->alt,
                'is_primary' => (bool) $image->is_primary,
                'sort_order' => (int) $image->sort_order,
            ])->all(),
            'variants' => $variants->map(fn ($variant) => [
                'id' => $variant->id,
                'size' => $variant->size,
                'color' => $variant->color,
                'sku' => $variant->sku,
                'label' => $variant->label(),
                'price_delta' => (int) $variant->price_delta,
                'stock' => (int) $variant->stock,
                'is_active' => (bool) $variant->is_active,
            ])->all(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function kategoriOptions(): array
    {
        return Category::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ])
            ->all();
    }

}
