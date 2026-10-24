<?php

/**
 * Biteship (PRD v1.1 D2). Kunci dibaca dari `.env` pemilik; kolom admin hanya
 * menyimpan asal kirim & layanan aktif. Kunci kosong = mode uji (tarif datar).
 */
return [
    'key' => env('BITESHIP_API_KEY'),

    'base_url' => 'https://api.biteship.com',

    /** Batas waktu tiap panggilan HTTP (detik). */
    'timeout' => 8,
];
