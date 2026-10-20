<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ListProps;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StockMovementRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Stok admin — daftar stok per varian, aksi masuk/keluar, riwayat pergerakan
 * (PRD §5.2, §7, kontrak props §12.12–§12.15). Semua perubahan stok lewat StockService.
 */
class StockController extends Controller
{
    use ListProps;

    /** Batas stok kritis (PRD §9): stok < 5 dianggap kritis. */
    private const BATAS_KRITIS = 5;

    public function __construct(private readonly StockService $stock) {}

    public function index(Request $request): Response
    {
        $filter = [
            'q' => $this->teks($request->query('q')),
            'status' => $this->pilihan($request->query('status'), ['habis', 'kritis'], 'semua'),
            'kategori' => $this->angka($request->query('kategori')),
            'urut' => $this->pilihan($request->query('urut'), ['stok_terkecil', 'stok_terbesar'], 'nama'),
        ];

        $query = ProductVariant::query()->with(['product:id,name,slug,category_id']);

        if ($filter['q'] !== null) {
            $like = '%'.$filter['q'].'%';
            $query->where(fn ($where) => $where
                ->where('sku', 'like', $like)
                ->orWhereHas('product', fn ($product) => $product->where('name', 'like', $like)));
        }

        if ($filter['kategori'] !== null) {
            $query->whereHas('product', fn ($product) => $product->where('category_id', $filter['kategori']));
        }

        if ($filter['status'] === 'habis') {
            $query->where('stock', 0);
        } elseif ($filter['status'] === 'kritis') {
            $query->where('stock', '<', self::BATAS_KRITIS);
        }

        match ($filter['urut']) {
            'stok_terkecil' => $query->orderBy('stock')->orderBy('id'),
            'stok_terbesar' => $query->orderByDesc('stock')->orderBy('id'),
            default => $query
                ->orderBy(Product::query()->select('name')->whereColumn('products.id', 'product_variants.product_id'))
                ->orderBy('id'),
        };

        $stok = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Stocks/Index', [
            'stok' => [
                'data' => collect($stok->items())->map(fn (ProductVariant $variant) => $this->row($variant))->all(),
                'links' => $stok->linkCollection()->all(),
                'meta' => $this->meta($stok),
            ],
            'filter' => $filter,
            'kategori' => $this->kategoriOptions(),
            'ringkasan' => [
                'varian' => ProductVariant::query()->count(),
                'habis' => ProductVariant::query()->where('stock', 0)->count(),
                'kritis' => ProductVariant::query()
                    ->where('stock', '>', 0)
                    ->where('stock', '<', self::BATAS_KRITIS)
                    ->count(),
            ],
        ]);
    }

    public function in(StockMovementRequest $request, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validated();

        $this->catat($variant, fn (ProductVariant $locked) => $this->stock->increase(
            $locked,
            (int) $data['qty'],
            $data['note'] ?? null,
            $request->user('admin')?->id,
        ));

        return back()->with('success', 'Stok masuk dicatat.');
    }

    public function out(StockMovementRequest $request, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validated();

        $this->catat($variant, fn (ProductVariant $locked) => $this->stock->decrease(
            $locked,
            (int) $data['qty'],
            $data['note'] ?? null,
            $request->user('admin')?->id,
        ));

        return back()->with('success', 'Stok keluar dicatat.');
    }

    public function history(Request $request): Response
    {
        $filter = [
            'q' => $this->teks($request->query('q')),
            'tipe' => $this->pilihan($request->query('tipe'), ['in', 'out', 'adjust', 'sale'], 'semua'),
            'varian' => $this->angka($request->query('varian')),
        ];

        $query = StockMovement::query()->with([
            'productVariant:id,product_id,size,color,sku',
            'productVariant.product:id,name',
            'admin:id,name',
        ]);

        if ($filter['q'] !== null) {
            $like = '%'.$filter['q'].'%';
            $query->where(fn ($where) => $where
                ->where('note', 'like', $like)
                ->orWhereHas(
                    'productVariant',
                    fn ($variant) => $variant->where('sku', 'like', $like)
                        ->orWhereHas('product', fn ($product) => $product->where('name', 'like', $like)),
                ));
        }

        if ($filter['tipe'] !== 'semua') {
            $query->where('type', $filter['tipe']);
        }

        if ($filter['varian'] !== null) {
            $query->where('product_variant_id', $filter['varian']);
        }

        $riwayat = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $ringkasan = StockMovement::query()
            ->selectRaw('type, count(*) as jumlah')
            ->groupBy('type')
            ->pluck('jumlah', 'type');

        return Inertia::render('Admin/Stocks/History', [
            'riwayat' => [
                'data' => collect($riwayat->items())->map(fn (StockMovement $row) => $this->rowRiwayat($row))->all(),
                'links' => $riwayat->linkCollection()->all(),
                'meta' => $this->meta($riwayat),
            ],
            'filter' => $filter,
            'varian' => $this->varianOptions(),
            'ringkasan' => [
                'masuk' => (int) $ringkasan->get(StockMovement::TYPE_IN, 0),
                'keluar' => (int) $ringkasan->get(StockMovement::TYPE_OUT, 0),
                'adjust' => (int) $ringkasan->get(StockMovement::TYPE_ADJUST, 0),
                'sale' => (int) $ringkasan->get(StockMovement::TYPE_SALE, 0),
            ],
        ]);
    }

    /**
     * Jalankan perubahan stok dalam transaksi dengan kunci baris varian.
     *
     * @param  callable(ProductVariant): mixed  $aksi
     */
    private function catat(ProductVariant $variant, callable $aksi): void
    {
        DB::transaction(function () use ($variant, $aksi): void {
            $locked = ProductVariant::query()->whereKey($variant->id)->lockForUpdate()->firstOrFail();

            $aksi($locked);
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function row(ProductVariant $variant): array
    {
        $stock = (int) $variant->stock;

        return [
            'id' => $variant->id,
            'product' => $variant->product === null ? null : [
                'id' => $variant->product->id,
                'name' => $variant->product->name,
                'slug' => $variant->product->slug,
            ],
            'size' => $variant->size,
            'color' => $variant->color,
            'label' => $variant->label(),
            'sku' => $variant->sku,
            'stock' => $stock,
            'is_active' => (bool) $variant->is_active,
            'status' => $this->statusBaris($stock),
            'updated_at' => $variant->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function rowRiwayat(StockMovement $movement): array
    {
        $variant = $movement->productVariant;

        return [
            'id' => $movement->id,
            'product_name' => $variant?->product?->name,
            'variant_label' => $variant?->label(),
            'variant_sku' => $variant?->sku,
            'type' => $movement->type,
            'tipe_label' => StockMovement::typeLabel($movement->type),
            'qty' => (int) $movement->qty,
            'signed_qty' => $movement->signedQty(),
            'note' => $movement->note,
            'admin' => $movement->admin === null ? null : [
                'id' => $movement->admin->id,
                'name' => $movement->admin->name,
            ],
            'created_at' => $movement->created_at?->toIso8601String(),
        ];
    }

    private function statusBaris(int $stock): string
    {
        if ($stock < 1) {
            return 'habis';
        }

        return $stock < self::BATAS_KRITIS ? 'kritis' : 'aman';
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

    /**
     * Dropdown filter varian, maks 200 baris urut nama produk (kontrak §12.15).
     *
     * @return array<int, array<string, mixed>>
     */
    private function varianOptions(): array
    {
        return ProductVariant::query()
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->orderBy('products.name')
            ->orderBy('product_variants.size')
            ->orderBy('product_variants.id')
            ->limit(200)
            ->get([
                'product_variants.id',
                'product_variants.size',
                'product_variants.color',
                'product_variants.sku',
                'products.name as product_name',
            ])
            ->map(fn (ProductVariant $variant) => [
                'id' => $variant->id,
                'label' => $variant->label(),
                'product_name' => $variant->product_name,
                'sku' => $variant->sku,
            ])
            ->all();
    }
}
