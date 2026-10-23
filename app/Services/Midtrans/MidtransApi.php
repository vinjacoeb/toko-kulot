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
     * Core API `charge` (PRD §8, `payment_type = qris`).
     *
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    public function charge(array $params): array;

    /**
     * `Transaction::status` untuk satu `order_id` (polling halaman bayar).
     *
     * @return array<string, mixed>
     */
    public function status(string $orderId): array;
}
