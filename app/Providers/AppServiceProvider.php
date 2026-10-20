<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureAuthRedirect();
        $this->configureRateLimits();
    }

    /**
     * Tujuan redirect middleware `guest` per tier (PRD §3):
     * admin yang sudah login diarahkan ke panel, pembeli ke beranda.
     */
    private function configureAuthRedirect(): void
    {
        RedirectIfAuthenticated::redirectUsing(function (Request $request) {
            return $request->is('admin', 'admin/*')
                ? route('admin.dashboard')
                : route('home');
        });
    }

    /**
     * PRD §11: batasi percobaan masuk — 5 per menit per kombinasi email + IP.
     * Permintaan tautan reset dibatasi per IP.
     */
    private function configureRateLimits(): void
    {
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)
            ->by(self::throttleKey($request, 'login')));

        RateLimiter::for('admin-login', fn (Request $request) => Limit::perMinute(5)
            ->by(self::throttleKey($request, 'admin-login')));

        RateLimiter::for('password-email', fn (Request $request) => Limit::perMinute(3)
            ->by('password-email|'.$request->ip()));

        // PRD §11: keranjang & checkout dibatasi per sesi + IP agar tidak bisa
        // dibanjiri permintaan (menulis DB: cart_items, orders, stok).
        RateLimiter::for('cart', fn (Request $request) => Limit::perMinute(30)
            ->by('cart|'.$request->session()->getId().'|'.$request->ip()));

        RateLimiter::for('checkout', fn (Request $request) => Limit::perMinute(10)
            ->by('checkout|'.$request->session()->getId().'|'.$request->ip()));

        RateLimiter::for('checkout-status', fn (Request $request) => Limit::perMinute(60)
            ->by('checkout-status|'.$request->session()->getId().'|'.$request->ip()));

        // K9: ulasan dibatasi per pembeli + IP (5 per menit) — menulis DB.
        RateLimiter::for('review', fn (Request $request) => Limit::perMinute(5)
            ->by('review|'.($request->user()?->getAuthIdentifier() ?? 'guest').'|'.$request->ip()));

        // K9: formulir kontak publik, 3 per menit per IP (PRD §8, §11).
        RateLimiter::for('contact', fn (Request $request) => Limit::perMinute(3)
            ->by('contact|'.$request->ip()));

        // K9: aksi tulis panel admin (balas, visibilitas, pengaturan, carousel, FAQ).
        RateLimiter::for('admin-write', fn (Request $request) => Limit::perMinute(60)
            ->by('admin-write|'.($request->user('admin')?->getAuthIdentifier() ?? 'guest').'|'.$request->ip()));
    }

    private static function throttleKey(Request $request, string $prefix): string
    {
        $email = $request->input('email');

        return $prefix.'|'.Str::lower(is_string($email) ? trim($email) : '').'|'.$request->ip();
    }
}
