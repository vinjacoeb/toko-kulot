<?php

/**
 * Biteship (PRD v1.1 D2). Kunci dibaca dari `.env` pemilik; kolom admin hanya
 * menyimpan asal kirim & layanan aktif. Kunci kosong = mode uji (tarif datar).
 */
return [
    'key' => env('BITESHIP_API_KEY'),

    /**
     * Token bersama webhook Biteship (PRD-v1.3 §2.1): dikirim dashboard Biteship
     * sebagai `?token=...` atau header apa pun (v1.5 B2 — yang menentukan hanya
     * nilainya). Kosong = mode uji lokal (request diterima, dicatat di log).
     */
    'webhook_token' => env('BITESHIP_WEBHOOK_TOKEN'),

    'base_url' => 'https://api.biteship.com',

    /** Batas waktu tiap panggilan HTTP (detik). */
    'timeout' => 8,

    /** Create order (resi otomatis) lebih lambat dari katalog/tarif. */
    'timeout_order' => 15,
];
