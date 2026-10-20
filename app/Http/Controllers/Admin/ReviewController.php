<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReplyReviewRequest;
use App\Http\Requests\Admin\ToggleReviewVisibilityRequest;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Moderasi penilaian produk (PRD §9, kontrak props §10.4–§10.6).
 */
class ReviewController extends Controller
{
    private const PER_PAGE = 15;

    private const VISIBILITIES = ['semua', 'tampil', 'sembunyi'];

    public function __construct(private readonly ReviewService $reviews)
    {
    }

    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $rating = (string) $request->query('rating', 'semua');
        $visibilitas = (string) $request->query('visibilitas', 'semua');

        if (! in_array($rating, ['semua', '1', '2', '3', '4', '5'], true)) {
            $rating = 'semua';
        }

        if (! in_array($visibilitas, self::VISIBILITIES, true)) {
            $visibilitas = 'semua';
        }

        $base = Review::query();

        if ($q !== '') {
            $like = '%'.$q.'%';
            $base->where(function ($sub) use ($like): void {
                $sub->where('comment', 'like', $like)
                    ->orWhere('admin_reply', 'like', $like)
                    ->orWhereHas('product', fn ($product) => $product->where('name', 'like', $like))
                    ->orWhereHas('user', fn ($user) => $user->where('name', 'like', $like));
            });
        }

        if ($rating !== 'semua') {
            $base->where('rating', (int) $rating);
        }

        if ($visibilitas === 'tampil') {
            $base->where('is_visible', true);
        } elseif ($visibilitas === 'sembunyi') {
            $base->where('is_visible', false);
        }

        $aggregate = (clone $base)
            ->selectRaw('COUNT(*) as total, COALESCE(AVG(rating), 0) as average')
            ->first();

        $distribusi = ['1' => 0, '2' => 0, '3' => 0, '4' => 0, '5' => 0];

        foreach ((clone $base)->selectRaw('rating, COUNT(*) as total')->groupBy('rating')->get() as $row) {
            $distribusi[(string) $row->rating] = (int) $row->total;
        }

        $ulasan = (clone $base)
            ->with([
                'product:id,name,slug',
                'user:id,name',
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Review $review): array => [
                'id' => $review->id,
                'product' => $review->product === null ? null : [
                    'id' => $review->product->id,
                    'name' => $review->product->name,
                    'slug' => $review->product->slug,
                ],
                'pembeli' => $review->user?->name,
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
                'admin_reply' => $review->admin_reply,
                'replied_at' => $review->replied_at?->toIso8601String(),
                'is_visible' => (bool) $review->is_visible,
                'created_at' => $review->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Reviews/Index', [
            'ulasan' => $ulasan,
            'filter' => [
                'q' => $q === '' ? null : $q,
                'rating' => $rating,
                'visibilitas' => $visibilitas,
            ],
            'ringkasan' => [
                'rating_avg' => round((float) ($aggregate->average ?? 0), 2),
                'rating_count' => (int) ($aggregate->total ?? 0),
                'distribusi' => $distribusi,
            ],
        ]);
    }

    public function reply(ReplyReviewRequest $request, Review $review): RedirectResponse
    {
        $review->forceFill([
            'admin_reply' => (string) $request->validated('admin_reply'),
            'replied_at' => now(),
        ])->save();

        return back()->with('success', 'Balasan ulasan tersimpan.');
    }

    public function visibility(ToggleReviewVisibilityRequest $request, Review $review): RedirectResponse
    {
        $visible = $request->exists('is_visible')
            ? $request->boolean('is_visible')
            : ! $review->is_visible;

        $review->forceFill(['is_visible' => $visible])->save();

        $this->reviews->recalculateRating((int) $review->product_id);

        return back()->with('success', $visible ? 'Ulasan ditampilkan.' : 'Ulasan disembunyikan.');
    }
}
