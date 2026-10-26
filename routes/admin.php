<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CarouselController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ShippingController;
use App\Http\Controllers\Admin\StockController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rute Panel Admin (PRD §5.2)
|--------------------------------------------------------------------------
|
| Berkas ini dimuat oleh bootstrap/app.php dengan:
|   prefix : /admin
|   name   : admin.
|   middleware : web
|
| Rute admin wajib memakai middleware `admin` (guard `admin`, tabel `admins`)
| kecuali rute login/logout admin.
|
*/

// Tamu: halaman masuk admin. Admin yang sudah masuk diarahkan ke dashboard.
Route::middleware('guest:admin')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:admin-login')
        ->name('login.store');
});

// Terlindungi: middleware `admin` (guard admin + akun aktif).
Route::middleware('admin')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Pesan masuk dari formulir kontak (kontrak props §10.1–§10.3).
    Route::get('/pesan-masuk', [MessageController::class, 'index'])->name('messages.index');
    Route::patch('/pesan-masuk/{message}/baca', [MessageController::class, 'read'])
        ->middleware('throttle:admin-write')
        ->name('messages.read');
    Route::post('/pesan-masuk/{message}/balas', [MessageController::class, 'reply'])
        ->middleware('throttle:admin-write')
        ->name('messages.reply');

    // Moderasi penilaian produk (kontrak props §10.4–§10.6).
    Route::get('/penilaian', [ReviewController::class, 'index'])->name('reviews.index');
    Route::post('/penilaian/{review}/balas', [ReviewController::class, 'reply'])
        ->middleware('throttle:admin-write')
        ->name('reviews.reply');
    Route::patch('/penilaian/{review}/tampil', [ReviewController::class, 'visibility'])
        ->middleware('throttle:admin-write')
        ->name('reviews.visibility');

    // Pengaturan situs + konten landing (kontrak props §10.7–§10.9).
    Route::get('/pengaturan', [SettingController::class, 'index'])->name('settings.index');
    Route::put('/pengaturan', [SettingController::class, 'update'])
        ->middleware('throttle:admin-write')
        ->name('settings.update');
    Route::put('/pengaturan/landing', [SettingController::class, 'landing'])
        ->middleware('throttle:admin-write')
        ->name('settings.landing');

    // Carousel beranda (kontrak props §10.10).
    Route::post('/pengaturan/carousel', [CarouselController::class, 'store'])
        ->middleware('throttle:admin-write')
        ->name('carousels.store');
    Route::put('/pengaturan/carousel/{carousel}', [CarouselController::class, 'update'])
        ->middleware('throttle:admin-write')
        ->name('carousels.update');
    Route::delete('/pengaturan/carousel/{carousel}', [CarouselController::class, 'destroy'])
        ->middleware('throttle:admin-write')
        ->name('carousels.destroy');

    // FAQ beranda (kontrak props §10.11).
    Route::post('/pengaturan/faq', [FaqController::class, 'store'])
        ->middleware('throttle:admin-write')
        ->name('faqs.store');
    Route::put('/pengaturan/faq/{faq}', [FaqController::class, 'update'])
        ->middleware('throttle:admin-write')
        ->name('faqs.update');
    Route::delete('/pengaturan/faq/{faq}', [FaqController::class, 'destroy'])
        ->middleware('throttle:admin-write')
        ->name('faqs.destroy');

    // Ekspedisi: asal kirim, tarif uji, gratis ongkir, daftar kurir (§10.13).
    Route::get('/ekspedisi', [ShippingController::class, 'index'])->name('shipping.index');
    Route::put('/ekspedisi', [ShippingController::class, 'update'])
        ->middleware('throttle:admin-write')
        ->name('shipping.update');

    // Produk + varian + galeri (kontrak props §12.1–§12.7).
    Route::get('/produk', [ProductController::class, 'index'])->name('products.index');
    Route::get('/produk/tambah', [ProductController::class, 'create'])->name('products.create');
    Route::post('/produk', [ProductController::class, 'store'])
        ->middleware('throttle:admin-write')
        ->name('products.store');
    Route::get('/produk/{product}/ubah', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/produk/{product}', [ProductController::class, 'update'])
        ->middleware('throttle:admin-write')
        ->name('products.update');
    Route::delete('/produk/{product}', [ProductController::class, 'destroy'])
        ->middleware('throttle:admin-write')
        ->name('products.destroy');
    Route::get('/produk/{product}', [ProductController::class, 'show'])->name('products.show');

    // Kategori (kontrak props §12.8–§12.11).
    Route::get('/kategori', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/kategori', [CategoryController::class, 'store'])
        ->middleware('throttle:admin-write')
        ->name('categories.store');
    Route::put('/kategori/{category}', [CategoryController::class, 'update'])
        ->middleware('throttle:admin-write')
        ->name('categories.update');
    Route::delete('/kategori/{category}', [CategoryController::class, 'destroy'])
        ->middleware('throttle:admin-write')
        ->name('categories.destroy');

    // Stok varian + riwayat pergerakan (kontrak props §12.12–§12.15).
    Route::get('/stok', [StockController::class, 'index'])->name('stocks.index');
    Route::get('/stok/riwayat', [StockController::class, 'history'])->name('stocks.history');
    Route::post('/stok/{variant}/masuk', [StockController::class, 'in'])
        ->middleware('throttle:admin-write')
        ->name('stocks.in');
    Route::post('/stok/{variant}/keluar', [StockController::class, 'out'])
        ->middleware('throttle:admin-write')
        ->name('stocks.out');

    // Pesanan (kontrak props §12.16–§12.17, §12.18a, §12.24).
    Route::get('/pesanan', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/pesanan/{order}', [OrderController::class, 'show'])->name('orders.show');
    // Ubah status manual dihapus di v1.4: status hanya dari Midtrans + webhook Biteship (PRD-v1.4 §3).
    // Nomor resi manual (PRD A15, kontrak props §12.18a).
    Route::patch('/pesanan/{order}/resi', [OrderController::class, 'resi'])
        ->middleware('throttle:admin-write')
        ->name('orders.resi');
    // Resi otomatis Biteship (PRD-v1.2 §8, kontrak props §12.25).
    Route::post('/pesanan/{order}/resi', [OrderController::class, 'resiOtomatis'])
        ->middleware('throttle:admin-write')
        ->name('orders.resi-otomatis');
    // Sinkronkan status pembayaran dari Midtrans (kontrak props §12.24).
    Route::patch('/pesanan/{order}/sinkron-pembayaran', [OrderController::class, 'syncPayment'])
        ->middleware('throttle:admin-write')
        ->name('orders.sinkron-pembayaran');

    // Akun admin (kontrak props §12.19–§12.22).
    Route::get('/akun', [AccountController::class, 'index'])->name('accounts.index');
    Route::post('/akun', [AccountController::class, 'store'])
        ->middleware('throttle:admin-write')
        ->name('accounts.store');
    Route::put('/akun/{admin}', [AccountController::class, 'update'])
        ->middleware('throttle:admin-write')
        ->name('accounts.update');
    Route::delete('/akun/{admin}', [AccountController::class, 'destroy'])
        ->middleware('throttle:admin-write')
        ->name('accounts.destroy');
});
