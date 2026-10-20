<?php

namespace App\Http\Controllers;

use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Webhook notifikasi Midtrans (PRD §8). Tanpa CSRF (lihat bootstrap/app.php),
 * diverifikasi dengan `signature_key` SHA-512, idempoten.
 */
class MidtransNotificationController extends Controller
{
    public function __invoke(Request $request, MidtransService $midtrans): JsonResponse
    {
        $payload = $request->all();

        if (! $midtrans->verifySignature($payload)) {
            Log::warning('Notifikasi Midtrans ditolak: signature tidak valid', [
                'order_id' => $payload['order_id'] ?? null,
                'ip' => $request->ip(),
            ]);

            return response()->json(['message' => 'invalid signature'], 403);
        }

        $result = $midtrans->handleNotification($payload);

        if ($result === 'amount mismatch') {
            return response()->json(['message' => 'amount mismatch'], 422);
        }

        return response()->json(['message' => 'ok']);
    }
}
