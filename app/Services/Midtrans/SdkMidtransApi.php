<?php

namespace App\Services\Midtrans;

use App\Exceptions\CheckoutException;
use JsonSerializable;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Transaction;

/**
 * Implementasi produksi `MidtransApi`: memanggil SDK resmi `midtrans/midtrans-php`.
 *
 * Semua kegagalan SDK (jaringan, kredensial, respons non-2xx) diterjemahkan jadi
 * `CheckoutException` dengan pesan siap tampil ke pembeli, sehingga controller
 * tidak pernah membocorkan pesan teknis Midtrans.
 *
 * Bentuk respons: SDK mengembalikan `stdClass` bersarang — `ApiRequestor` memakai
 * `json_decode()` tanpa `true` (`vendor/midtrans/midtrans-php/Midtrans/ApiRequestor.php:159`),
 * jadi `actions[]` berisi objek. Kontrak seam (`MidtransApi:14-27`) menjanjikan array
 * bersarang, maka setiap respons dinormalkan **rekursif** di sini (kartu `t_3bfe3165`,
 * `docs/review-2.md` §6 G1). Tanpa normalisasi, `MidtransService::qrUrl()` membaca
 * `$action['name']` dari `stdClass` dan halaman bayar 500.
 */
class SdkMidtransApi implements MidtransApi
{
    /**
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    public function charge(array $params): array
    {
        $this->boot();

        try {
            return $this->normalizeResponse($this->requestCharge($params));
        } catch (\Throwable $exception) {
            throw new CheckoutException('Gagal membuat pembayaran. Coba lagi.', 0, $exception);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function status(string $orderId): array
    {
        $this->boot();

        try {
            return $this->normalizeResponse($this->requestStatus($orderId));
        } catch (\Throwable $exception) {
            throw new CheckoutException('Gagal memeriksa status pembayaran. Coba lagi.', 0, $exception);
        }
    }

    /**
     * Panggilan SDK mentah untuk Core API charge — satu-satunya titik yang
     * menyentuh jaringan.
     *
     * Dipisah (protected) supaya test bisa meniru bentuk respons SDK apa adanya
     * (stdClass bersarang) tanpa memanggil Midtrans.
     *
     * @param  array<string, mixed>  $params
     */
    protected function requestCharge(array $params): mixed
    {
        return CoreApi::charge($params);
    }

    /**
     * Panggilan SDK mentah untuk `status` (lihat catatan `requestCharge()`).
     */
    protected function requestStatus(string $orderId): mixed
    {
        return Transaction::status($orderId);
    }

    /**
     * Respons SDK → array bersarang (kontrak seam `MidtransApi`).
     *
     * @return array<string, mixed>
     */
    private function normalizeResponse(mixed $response): array
    {
        $normalized = $this->normalizeValue($response);

        return is_array($normalized) ? $normalized : [];
    }

    /**
     * Normalkan satu nilai secara rekursif: objek (stdClass) → array, array tetap
     * array dengan nilai di dalamnya ikut dinormalkan, skalar diteruskan.
     */
    private function normalizeValue(mixed $value): mixed
    {
        if ($value instanceof JsonSerializable) {
            return $this->normalizeValue($value->jsonSerialize());
        }

        if (is_object($value)) {
            $value = get_object_vars($value);
        }

        if (! is_array($value)) {
            return $value;
        }

        $normalized = [];

        foreach ($value as $key => $item) {
            $normalized[$key] = $this->normalizeValue($item);
        }

        return $normalized;
    }

    /**
     * Kredensial SDK selalu dari `.env` lewat `config/midtrans.php` (kontrak §7.5
     * `sumber_kredensial`); server key tidak pernah dikirim ke browser.
     */
    private function boot(): void
    {
        Config::$serverKey = (string) config('midtrans.server_key');
        Config::$isProduction = (bool) config('midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }
}
