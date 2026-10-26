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
     * Core API charge — satu kanal per panggilan (PRD-v1.2 §2.2).
     *
     * @param  array<string, mixed>  $params
     * @return array<string, mixed> respons charge (`transaction_status`, `va_numbers`,
     *                              `permata_va_number`, `biller_code`, `payment_code`, `actions`, …)
     */
    public function charge(array $params): array;

    /**
     * `Transaction::status` untuk satu `order_id` (polling halaman bayar).
     *
     * @return array<string, mixed>
     */
    public function status(string $orderId): array;
}
