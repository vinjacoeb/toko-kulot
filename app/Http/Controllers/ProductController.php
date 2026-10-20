<?php

namespace App\Http\Controllers;

use App\Services\CatalogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Halaman katalog `/produk` dan detail `/produk/{slug}` (K11).
 * Controller tipis: seluruh query ada di `CatalogService`.
 * Kontrak props: docs/kontrak-props.md §11.1 dan §11.2.
 */
class ProductController extends Controller
{
    /** Pesan 404 halaman detail (teks design §5.2 "Produk tidak ditemukan"). */
    public const NOT_FOUND_MESSAGE = 'Produk tidak ditemukan.';

    public function __construct(private readonly CatalogService $catalog)
    {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Public/Products/Index', $this->catalog->index($request));
    }

    /**
     * Produk tidak ada atau tidak aktif → HTTP 404 dengan halaman yang sama,
     * `product: null`, `related: []`, dan `error` terisi (kontrak §11.2).
     */
    public function show(Request $request, string $slug): HttpResponse
    {
        $props = $this->catalog->show($slug);

        if ($props === null) {
            return Inertia::render('Public/Products/Show', [
                'product' => null,
                'related' => [],
                'error' => self::NOT_FOUND_MESSAGE,
            ])->toResponse($request)->setStatusCode(HttpResponse::HTTP_NOT_FOUND);
        }

        return Inertia::render('Public/Products/Show', $props)->toResponse($request);
    }
}
