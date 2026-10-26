<?php

namespace App\Http\Controllers;

use App\Services\BiteshipWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Webhook Biteship (PRD-v1.3 §2.1). Publik, tanpa CSRF (lihat bootstrap/app.php),
 * throttle 120/menit per IP. Selalu membalas JSON, tidak pernah 500:
 * 200 probe instalasi (body kosong), 403 token salah, 422 body bukan JSON,
 * 200 untuk sisanya (termasuk event/order tak dikenal agar Biteship tidak
 * mengulang tanpa henti).
 *
 * v1.5 B2: nilai token diterima dari `?token=` atau header mana pun (dashboard
 * Biteship bebas memilih nama header). Log hanya memuat nama header, tidak
 * pernah nilainya.
 */
class BiteshipWebhookController extends Controller
{
    public function __invoke(Request $request, BiteshipWebhookService $webhook): JsonResponse
    {
        // Probe instalasi dashboard Biteship (PRD-v1.3 §2.1): POST/GET tanpa token,
        // body kosong. Dibalas "ok" SEBELUM cek token; tidak memproses apa pun.
        if (trim($request->getContent()) === '') {
            Log::info('Webhook Biteship: probe instalasi dijawab ok', [
                'method' => $request->method(),
                'ip' => $request->ip(),
            ]);

            return response()->json(['status' => 'ok', 'success' => true]);
        }

        [$token, $sumber] = $this->tokenMasuk($request);

        if (! $webhook->tokenValid($token, $request->ip())) {
            Log::warning('Webhook Biteship ditolak: token tidak valid', [
                'ip' => $request->ip(),
                'header' => array_keys($request->headers->all()),
                'query_token' => $request->query('token') !== null,
            ]);

            return response()->json(['message' => 'invalid token'], 403);
        }

        if ($sumber !== null) {
            Log::info('Webhook Biteship diterima: token cocok', [
                'ip' => $request->ip(),
                'sumber' => $sumber,
            ]);
        }

        $payload = json_decode($request->getContent(), true);

        if (! is_array($payload)) {
            Log::warning('Webhook Biteship ditolak: body bukan JSON', [
                'ip' => $request->ip(),
            ]);

            return response()->json(['message' => 'invalid payload'], 422);
        }

        $webhook->handle($payload, $request->ip());

        return response()->json(['message' => 'ok']);
    }

    /**
     * Nilai token yang cocok beserta sumbernya (`query`, atau nama header).
     *
     * Header apa pun diterima; perbandingan waktu-konstan dan hanya nama header
     * yang boleh masuk log. Bila token `.env` kosong (mode uji lokal), nilai apa
     * pun diteruskan dan `BiteshipWebhookService::tokenValid()` yang menerima.
     *
     * @return array{0: string|null, 1: string|null}
     */
    private function tokenMasuk(Request $request): array
    {
        $kandidat = [];

        $query = $request->query('token');

        if (is_string($query)) {
            $kandidat['query'] = $query;
        }

        foreach ($request->headers->all() as $nama => $nilai) {
            if (isset($nilai[0]) && is_string($nilai[0])) {
                $kandidat[$nama] = $nilai[0];
            }
        }

        $expected = trim((string) config('biteship.webhook_token'));

        if ($expected !== '') {
            foreach ($kandidat as $sumber => $nilai) {
                if (hash_equals($expected, trim($nilai))) {
                    return [$nilai, $sumber];
                }
            }
        }

        return [$kandidat === [] ? null : reset($kandidat), null];
    }
}
