<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ListProps;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use App\Support\MediaStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kategori admin (PRD §5.2, kontrak props §12.8–§12.11).
 *
 * Tidak ada halaman tambah/ubah tersendiri: form kategori dikerjakan inline pada
 * halaman daftar, jadi controller ini hanya punya index + tulisan redirect.
 */
class CategoryController extends Controller
{
    use ListProps;

    public function index(Request $request): Response
    {
        $filter = [
            'q' => $this->teks($request->query('q')),
            'status' => $this->pilihan($request->query('status'), ['aktif', 'nonaktif'], 'semua'),
        ];

        $query = Category::query()->withCount('products');

        if ($filter['q'] !== null) {
            $like = '%'.$filter['q'].'%';
            $query->where(fn ($where) => $where
                ->where('name', 'like', $like)
                ->orWhere('slug', 'like', $like));
        }

        if ($filter['status'] === 'aktif') {
            $query->where('is_active', true);
        } elseif ($filter['status'] === 'nonaktif') {
            $query->where('is_active', false);
        }

        $kategori = $query
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Categories/Index', [
            'kategori' => [
                'data' => collect($kategori->items())->map(fn (Category $row) => $this->row($row))->all(),
                'links' => $kategori->linkCollection()->all(),
                'meta' => $this->meta($kategori),
            ],
            'filter' => $filter,
            'ringkasan' => [
                'total' => Category::query()->count(),
                'aktif' => Category::query()->where('is_active', true)->count(),
                'nonaktif' => Category::query()->where('is_active', false)->count(),
            ],
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $image = $request->file('image');

        Category::query()->create([
            'name' => trim((string) $data['name']),
            'slug' => $this->uniqueSlug((string) ($data['slug'] ?? ''), (string) $data['name'], null),
            'description' => $this->teks($data['description'] ?? null),
            'image' => $image === null ? null : MediaStorage::store($image, 'kategori'),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'is_active' => $this->flag($data['is_active'] ?? null, true),
        ]);

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Kategori disimpan.');
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();
        $image = $request->file('image');
        $imageLama = $category->image;

        $category->forceFill([
            'name' => trim((string) $data['name']),
            'slug' => $this->uniqueSlug((string) ($data['slug'] ?? ''), (string) $data['name'], $category),
            'description' => $this->teks($data['description'] ?? null),
            'image' => $image === null ? $imageLama : MediaStorage::store($image, 'kategori'),
            'sort_order' => (int) ($data['sort_order'] ?? $category->sort_order),
            'is_active' => $this->flag($data['is_active'] ?? null, (bool) $category->is_active),
        ])->save();

        if ($image !== null && $imageLama !== null) {
            MediaStorage::delete($imageLama);
        }

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Kategori diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $jumlahProduk = $category->products()->count();

        if ($jumlahProduk > 0) {
            throw ValidationException::withMessages([
                'kategori' => sprintf(
                    'Kategori masih dipakai %d produk — pindahkan atau hapus produknya dulu.',
                    $jumlahProduk,
                ),
            ]);
        }

        MediaStorage::delete($category->image);
        $category->delete();

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Kategori dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $category->image,
            'sort_order' => (int) $category->sort_order,
            'is_active' => (bool) $category->is_active,
            'product_count' => (int) ($category->products_count ?? 0),
            'created_at' => $category->created_at?->toIso8601String(),
            'updated_at' => $category->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Slug dari input atau dari nama; ditambah akhiran angka bila sudah dipakai.
     */
    private function uniqueSlug(string $slug, string $name, ?Category $category): string
    {
        $base = Str::slug($slug !== '' ? $slug : $name);

        if ($base === '') {
            throw ValidationException::withMessages([
                'slug' => 'Slug tidak bisa dibuat dari nama kategori — isi slug manual.',
            ]);
        }

        $candidate = $base;
        $suffix = 2;

        while (Category::query()
            ->where('slug', $candidate)
            ->when($category, fn ($query) => $query->whereKeyNot($category->id))
            ->exists()) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
