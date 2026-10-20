<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\MidtransNotificationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Beranda publik — PRD §5.1 langkah 1, kontrak props docs/kontrak-props.md §8
|--------------------------------------------------------------------------
|
| `settings` tidak dikirim controller: sudah dibagikan HandleInertiaRequests.
|
*/
Route::get('/', [HomeController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| Katalog dan kontak publik — PRD §5.2–§5.4, kontrak props §11 (K11)
|--------------------------------------------------------------------------
|
| Filter dan urutan dibaca dari query string oleh `CatalogService`; nilai tidak
| valid diabaikan (bukan galat). `{slug}` boleh seluruhnya angka: bila tidak ada
| slug yang cocok, `CatalogService` mencoba `products.id` (PRD §14.1 butir 1).
|
*/
Route::get('/produk', [ProductController::class, 'index'])->name('products.index');
Route::get('/produk/{slug}', [ProductController::class, 'show'])
    ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-]*')
    ->name('products.show');

Route::get('/kontak-kami', [ContactController::class, 'index'])->name('contact');

/*
|--------------------------------------------------------------------------
| Autentikasi pembeli — guard `web` (PRD §5.1)
|--------------------------------------------------------------------------
|
| Hanya untuk tamu; pembeli yang sudah masuk diarahkan ke beranda oleh
| middleware `guest` (lihat AppServiceProvider::configureAuthRedirect).
| Kontrak props: docs/kontrak-props.md §6.
|
*/
Route::middleware('guest:web')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');

    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:login')
        ->name('login.store');

    Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])
        ->middleware('throttle:password-email')
        ->name('password.email');

    Route::get('/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
});

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:web')
    ->name('logout');

/*
|--------------------------------------------------------------------------
| Keranjang — PRD §5.1 langkah 2, kontrak props §7.1–§7.4
|--------------------------------------------------------------------------
|
| Terbuka untuk tamu (keranjang sesi) dan pembeli login (keranjang akun).
| Kepemilikan item dicek per objek di controller (cegah IDOR).
|
*/
Route::prefix('keranjang')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/', [CartController::class, 'store'])
        ->middleware('throttle:cart')
        ->name('store');
    Route::patch('/{item}', [CartController::class, 'update'])->name('update');
    Route::delete('/{item}', [CartController::class, 'destroy'])->name('destroy');
});

/*
|--------------------------------------------------------------------------
| Checkout & pembayaran QRIS — PRD §5.1 langkah 3–7, §8, kontrak §7.5–§7.8
|--------------------------------------------------------------------------
|
| PRD §5.1 langkah 3: checkout wajib login, tamu diarahkan ke /login
| dengan intended URL. Akses pesanan dicek per objek di controller.
|
*/
Route::prefix('checkout')->name('checkout.')->middleware('auth:web')->group(function () {
    Route::get('/', [CheckoutController::class, 'index'])->name('index');
    Route::post('/', [CheckoutController::class, 'store'])
        ->middleware('throttle:checkout')
        ->name('store');
    Route::get('/{order}/bayar', [CheckoutController::class, 'pay'])->name('pay');
    Route::get('/{order}/status', [CheckoutController::class, 'status'])
        ->middleware('throttle:checkout-status')
        ->name('status');
    Route::get('/{order}/selesai', [CheckoutController::class, 'success'])->name('success');

    // Ulasan pembeli untuk produk yang dibeli (PRD §7.3, kontrak props §9.1).
    Route::post('/{order}/ulasan', [ReviewController::class, 'store'])
        ->middleware('throttle:review')
        ->name('review');
});

// Webhook Midtrans (server-ke-server, tanpa CSRF — lihat bootstrap/app.php).
Route::post('/midtrans/notification', MidtransNotificationController::class)
    ->name('midtrans.notification');

/*
|--------------------------------------------------------------------------
| Formulir kontak publik — PRD §8, kontrak props §9.2
|--------------------------------------------------------------------------
|
| Halaman `/kontak-kami` sendiri ada di route `contact` (K11) bersama katalog
| `/produk`; di sini hanya aksi kirim pesan. Dibatasi laju per IP (3/menit)
| + honeypot di controller.
|
*/
Route::post('/kontak-kami', [MessageController::class, 'store'])
    ->middleware('throttle:contact')
    ->name('contact.store');
