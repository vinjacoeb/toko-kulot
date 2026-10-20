<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Public/Home', [
        'settings' => [
            'store_name' => config('app.name', 'Toko Kulot'),
            'tagline' => 'Daster & Kulot Premium',
        ],
        'featured' => [],
    ]);
})->name('home');
