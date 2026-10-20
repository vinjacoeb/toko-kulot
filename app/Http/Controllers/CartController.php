<?php

namespace App\Http\Controllers;

use App\Exceptions\CheckoutException;
use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Halaman keranjang (PRD §5.1 langkah 2, kontrak props §7.1–§7.4).
 * Guest dan pembeli login sama-sama boleh; kepemilikan item dicek per objek.
 */
class CartController extends Controller
{
    public function index(Request $request, CartService $carts): Response
    {
        return Inertia::render('Public/Cart', [
            'keranjang' => $carts->summary(),
        ]);
    }

    public function store(AddToCartRequest $request, CartService $carts): RedirectResponse
    {
        try {
            $item = $carts->add(
                (int) $request->validated('product_id'),
                $request->validated('variant_id') !== null ? (int) $request->validated('variant_id') : null,
                (int) $request->validated('qty'),
            );
        } catch (CheckoutException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', sprintf(
            '%s (%d) masuk keranjang.',
            $item->product?->name ?? 'Produk',
            (int) $item->qty,
        ));
    }

    public function update(UpdateCartItemRequest $request, CartItem $item, CartService $carts): RedirectResponse
    {
        $carts->ensureOwned($item);

        try {
            $result = $carts->updateQty($item, (int) $request->validated('qty'));
        } catch (CheckoutException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        if ($result['removed']) {
            return back()->with('error', 'Produk dihapus dari keranjang karena stok habis.');
        }

        if ($result['capped']) {
            return back()->with('error', sprintf(
                'Jumlah disesuaikan menjadi %d karena stok tersisa %d.',
                $result['qty'],
                $result['stock'],
            ));
        }

        return back()->with('success', 'Jumlah diperbarui.');
    }

    public function destroy(CartItem $item, CartService $carts): RedirectResponse
    {
        $carts->ensureOwned($item);
        $carts->remove($item);

        return back()->with('success', 'Item dihapus dari keranjang.');
    }
}
