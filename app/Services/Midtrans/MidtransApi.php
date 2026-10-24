<?php

namespace App\Services\Midtrans;

/**
 * Seam tipis ke SDK Midtrans.
 *
 * Dipisah dari `MidtransService` supaya test tidak menyentuh jaringan:
 * implementasi produksi `SdkMidtransApi`, sedangkan test memakai pengganti
 * lokal (lihat `tests/Support/FakeMidtransApi.php`) lewat binding container.
 */
interface MidtransApi
{
    /**
     * Snap `POST /snap/v1/transactions` — semua kanal yang aktif di akun
     * merchant (PRD-v1.1 §2).
     *
     * @param  array<string, mixed>  $params
     * @return array<string, mixed> `token`, `redirect_url`
     */
    public function snap(array $params): array;

    /**
     * `Transaction::status` untuk satu `order_id` (polling halaman bayar).
     *
     * @return array<string, mixed>
     */
    public function status(string $orderId): array;
}
