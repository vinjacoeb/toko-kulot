<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Order;
use App\Services\ReviewService;
use Illuminate\Http\RedirectResponse;

/**
 * Ulasan pembeli setelah checkout (PRD §7.3, kontrak props §9.1).
 */
class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews)
    {
    }

    public function store(StoreReviewRequest $request, Order $order): RedirectResponse
    {
        $user = $request->user('web');

        // Kepemilikan order dicek per objek: order milik pembeli lain = 404.
        abort_unless($user !== null && (int) $order->user_id === (int) $user->getKey(), 404);

        if (! $this->reviews->isEligible($order)) {
            return redirect()
                ->route('checkout.success', $order)
                ->with('error', 'Ulasan bisa dikirim setelah pembayaran berhasil.');
        }

        $this->reviews->store($order, $user, $request->reviews());

        return redirect()
            ->route('checkout.success', $order)
            ->with('success', 'Terima kasih, penilaian Anda sudah tersimpan.');
    }
}
