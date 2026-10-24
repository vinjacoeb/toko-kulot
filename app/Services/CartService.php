<?php

namespace App\Services;

use App\Exceptions\CheckoutException;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

/**
 * Keranjang pembeli (PRD §5.1 langkah 2).
 *
 * - Guest memakai `carts.session_id`; pembeli login memakai `carts.user_id`.
 * - Keranjang guest diadopsi (atau digabung) saat pembeli login.
 * - `unit_price` dihitung ulang setiap qty berubah agar harga grosir
 *   (PRD §7.1, A3) langsung berlaku.
 * - Prop global `cart.count` disinkronkan ke sesi setiap perubahan.
 */
class CartService
{
    public const SESSION_COUNT = 'cart_count';

    public const MAX_QTY = 99;

    private const LIFETIME_DAYS = 30;

    private ?Cart $resolved = null;

    private bool $resolvedLoaded = false;

    public function __construct(private readonly BiteshipService $biteship) {}

    /**
     * Keranjang aktif. `$create = true` membuat baris baru bila belum ada.
     */
    public function currentCart(bool $create = false): ?Cart
    {
        if ($this->resolvedLoaded) {
            return $this->resolved;
        }

        $this->resolved = $this->resolve($create);
        $this->resolvedLoaded = true;

        return $this->resolved;
    }

    /**
     * Tambah produk ke keranjang; item dengan produk+varian sama digabung.
     */
    public function add(int $productId, ?int $variantId, int $qty): CartItem
    {
        if ($qty < 1 || $qty > self::MAX_QTY) {
            throw new CheckoutException('Jumlah tidak valid.');
        }

        $product = Product::query()->active()->find($productId);

        if (! $product) {
            throw new CheckoutException('Produk tidak tersedia.');
        }

        $variant = $this->resolveVariant($product, $variantId);

        $cart = $this->currentCart(true);

        if (! $cart) {
            throw new CheckoutException('Keranjang tidak tersedia.');
        }

        $existing = $this->findItem($cart, $product->id, $variant?->id);
        $newQty = (int) ($existing?->qty ?? 0) + $qty;

        $this->guardStock($variant, $newQty);

        if ($existing) {
            $existing->forceFill([
                'qty' => $newQty,
                'unit_price' => $this->unitPrice($product, $variant, $newQty),
            ])->save();

            $item = $existing;
        } else {
            $item = $cart->items()->create([
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'qty' => $newQty,
                'unit_price' => $this->unitPrice($product, $variant, $newQty),
            ]);
        }

        $this->touch($cart);

        return $item->refresh();
    }

    /**
     * Ubah qty sebuah item. Bila stok menipis, qty disesuaikan (design §5.6).
     *
     * @return array{removed: bool, qty: int, capped: bool, stock: int}
     */
    public function updateQty(CartItem $item, int $qty): array
    {
        if ($qty < 1 || $qty > self::MAX_QTY) {
            throw new CheckoutException('Jumlah tidak valid.');
        }

        $product = $item->product;

        if (! $product || ! $product->is_active) {
            $cart = $item->cart;
            $item->delete();
            $this->touch($cart);

            throw new CheckoutException('Produk tidak tersedia lagi dan dihapus dari keranjang.');
        }

        $variant = $item->variant;
        $capped = false;
        $stock = $variant ? (int) $variant->stock : 0;

        if ($variant) {
            if ($stock <= 0) {
                $cart = $item->cart;
                $item->delete();
                $this->touch($cart);

                return ['removed' => true, 'qty' => 0, 'capped' => false, 'stock' => 0];
            }

            if ($qty > $stock) {
                $qty = $stock;
                $capped = true;
            }
        }

        $item->forceFill([
            'qty' => $qty,
            'unit_price' => $this->unitPrice($product, $variant, $qty),
        ])->save();

        $this->touch($item->cart);

        return ['removed' => false, 'qty' => $qty, 'capped' => $capped, 'stock' => $stock];
    }

    public function remove(CartItem $item): void
    {
        $cart = $item->cart;
        $item->delete();
        $this->touch($cart);
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
        $this->touch($cart);
    }

    /**
     * Pastikan item milik keranjang aktif (cegah IDOR).
     */
    public function ensureOwned(CartItem $item): void
    {
        $cart = $this->currentCart();

        if (! $cart || (int) $item->cart_id !== (int) $cart->id) {
            abort(404);
        }
    }

    /**
     * Ringkasan keranjang untuk props halaman (kontrak §7.0).
     *
     * @return array<string, mixed>
     */
    public function summary(?Cart $cart = null): array
    {
        $cart ??= $this->currentCart();
        $items = [];
        $subtotal = 0;
        $weight = 0;

        if ($cart) {
            $rows = $cart->items()
                ->with(['product.images', 'variant'])
                ->orderBy('id')
                ->get();

            foreach ($rows as $row) {
                $product = $row->product;

                if (! $product) {
                    continue;
                }

                $variant = $row->variant;
                $qty = (int) $row->qty;
                $unitPrice = $this->unitPrice($product, $variant, $qty);
                $lineTotal = $unitPrice * $qty;
                $subtotal += $lineTotal;
                $weight += $this->unitWeight($product) * $qty;

                $items[] = [
                    'id' => (int) $row->id,
                    'product_id' => (int) $row->product_id,
                    'variant_id' => $row->product_variant_id !== null ? (int) $row->product_variant_id : null,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'variant_label' => $this->variantLabel($variant),
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                    'stock' => $variant ? (int) $variant->stock : 0,
                    'image' => $this->primaryImage($product),
                    'is_active' => (bool) $product->is_active && ($variant ? (bool) $variant->is_active : true),
                ];
            }
        }

        // Ongkir final baru diketahui setelah kode pos diisi (mode API), jadi
        // `shipping_cost` null dan frontend menampilkan "Dihitung saat checkout".
        $shippingCost = $this->biteship->isFake() ? $this->biteship->fakeRate() : null;
        $free = $this->biteship->freeShipping();
        $count = array_sum(array_column($items, 'qty'));

        session([self::SESSION_COUNT => (int) $count]);

        return [
            'items' => $items,
            'count' => (int) $count,
            'subtotal' => (int) $subtotal,
            'shipping_cost' => $shippingCost,
            'total' => (int) $subtotal + (int) ($shippingCost ?? 0),
            'is_empty' => $items === [],
            'shipping' => [
                'mode' => $this->biteship->mode(),
                'dihitung_saat_checkout' => $shippingCost === null,
                'tarif_uji' => $shippingCost,
                'gratis_aktif' => $free['aktif'],
                'gratis_min' => $free['min'],
                'berat_gram' => (int) $weight,
            ],
        ];
    }

    /**
     * Baris kiriman untuk Biteship (§7.12): harga & berat per unit.
     *
     * @return list<array{name: string, value: int, quantity: int, weight: int}>
     */
    public function shippingItems(?Cart $cart = null): array
    {
        $cart ??= $this->currentCart();

        if (! $cart) {
            return [];
        }

        $items = [];

        foreach ($cart->items()->with(['product', 'variant'])->orderBy('id')->get() as $row) {
            $product = $row->product;
            $qty = (int) $row->qty;

            if (! $product || $qty < 1) {
                continue;
            }

            $items[] = [
                'name' => $product->name,
                'value' => $this->unitPrice($product, $row->variant, $qty),
                'quantity' => $qty,
                'weight' => $this->unitWeight($product),
            ];
        }

        return $items;
    }

    /**
     * Berat per unit; produk tanpa berat dianggap 500 gram (PRD v1.1 A19).
     */
    private function unitWeight(Product $product): int
    {
        return max(500, (int) $product->weight_gram);
    }

    public function count(): int
    {
        $cart = $this->currentCart();

        return $cart ? (int) $cart->items()->sum('qty') : 0;
    }

    public function variantLabel(?ProductVariant $variant): ?string
    {
        if (! $variant) {
            return null;
        }

        $parts = array_filter([$variant->size, $variant->color], fn ($value) => filled($value));

        return $parts === [] ? null : implode(' / ', $parts);
    }

    public function unitPrice(Product $product, ?ProductVariant $variant, int $qty): int
    {
        $delta = $variant ? (int) $variant->price_delta : 0;

        return max(0, (int) $product->priceForQty($qty) + $delta);
    }

    private function resolve(bool $create): ?Cart
    {
        $user = auth('web')->user();
        $guest = $this->guestCart();

        if ($user) {
            $cart = $this->userCart((int) $user->id);

            if ($cart) {
                if ($guest && (int) $guest->id !== (int) $cart->id) {
                    $this->mergeInto($cart, $guest);
                }

                return $cart;
            }

            if ($guest) {
                $guest->forceFill(['user_id' => $user->id, 'session_id' => null])->save();

                return $guest;
            }

            return $create ? $this->createForUser((int) $user->id) : null;
        }

        if ($guest) {
            return $guest;
        }

        return $create ? $this->createForGuest() : null;
    }

    private function guestCart(): ?Cart
    {
        $sessionId = (string) session()->getId();

        if ($sessionId === '') {
            return null;
        }

        return Cart::query()
            ->whereNull('user_id')
            ->where('session_id', $sessionId)
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest('id')
            ->first();
    }

    private function userCart(int $userId): ?Cart
    {
        return Cart::query()
            ->where('user_id', $userId)
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest('id')
            ->first();
    }

    private function createForUser(int $userId): Cart
    {
        return Cart::create([
            'user_id' => $userId,
            'session_id' => null,
            'expires_at' => now()->addDays(self::LIFETIME_DAYS),
        ]);
    }

    private function createForGuest(): Cart
    {
        return Cart::create([
            'user_id' => null,
            'session_id' => (string) session()->getId(),
            'expires_at' => now()->addDays(self::LIFETIME_DAYS),
        ]);
    }

    /**
     * Gabungkan keranjang guest ke keranjang pembeli setelah login.
     */
    private function mergeInto(Cart $target, Cart $guest): void
    {
        DB::transaction(function () use ($target, $guest): void {
            foreach ($guest->items()->get() as $item) {
                $existing = $this->findItem($target, $item->product_id, $item->product_variant_id);

                if ($existing) {
                    $qty = min(self::MAX_QTY, (int) $existing->qty + (int) $item->qty);
                    $product = $existing->product;

                    $existing->forceFill([
                        'qty' => $qty,
                        'unit_price' => $product ? $this->unitPrice($product, $existing->variant, $qty) : (int) $existing->unit_price,
                    ])->save();

                    $item->delete();

                    continue;
                }

                $item->forceFill(['cart_id' => $target->id])->save();
            }

            $guest->delete();
        });
    }

    private function findItem(Cart $cart, ?int $productId, ?int $variantId): ?CartItem
    {
        return $cart->items()
            ->where('product_id', $productId)
            ->where('product_variant_id', $variantId)
            ->first();
    }

    private function resolveVariant(Product $product, ?int $variantId): ?ProductVariant
    {
        $variants = $product->variants()->where('is_active', true);

        if ($variantId !== null) {
            $variant = (clone $variants)->whereKey($variantId)->first();

            if (! $variant) {
                throw new CheckoutException('Pilih ukuran/warna yang tersedia.');
            }

            return $variant;
        }

        if ((clone $variants)->exists()) {
            throw new CheckoutException('Pilih ukuran/warna yang tersedia.');
        }

        return null;
    }

    private function guardStock(?ProductVariant $variant, int $qty): void
    {
        if (! $variant) {
            return;
        }

        $stock = (int) $variant->stock;

        if ($stock < $qty) {
            throw new CheckoutException(sprintf('Stok tersisa %d.', $stock));
        }
    }

    private function touch(?Cart $cart): void
    {
        if (! $cart) {
            session([self::SESSION_COUNT => 0]);

            return;
        }

        $cart->forceFill(['expires_at' => now()->addDays(self::LIFETIME_DAYS)])->save();

        session([self::SESSION_COUNT => (int) $cart->items()->sum('qty')]);
    }

    private function primaryImage(Product $product): ?string
    {
        if (! $product->relationLoaded('images')) {
            $product->load('images');
        }

        $image = $product->images->firstWhere('is_primary', true) ?? $product->images->first();

        return $image?->path;
    }
}
