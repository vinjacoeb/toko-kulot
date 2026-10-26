<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Panel admin: prefix /admin, name prefix admin. (PRD §4.2, §5.2)
            Route::middleware('web')
                ->prefix('admin')
                ->name('admin.')
                ->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Tunnel (ngrok) berjalan di loopback dan meneruskan skema asli lewat
        // X-Forwarded-Proto. Percayai hanya loopback agar URL aset memakai https;
        // jangan '*' karena host bersama bisa dipalsukan. (PRD-v1.3 §3)
        $middleware->trustProxies(at: ['127.0.0.1', '::1']);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
        ]);

        // Webhook Midtrans & Biteship dipanggil server-ke-server, tidak punya token CSRF.
        $middleware->validateCsrfTokens(except: [
            'midtrans/notification',
            'biteship/webhook',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // PRD-v1.3 §2.1: webhook Biteship selalu membalas JSON. Permintaan tanpa
        // `Accept: application/json` pun dirender JSON, dan exception internal dibalas
        // pesan generik (tanpa SQL/trace) walau APP_DEBUG terbuka — F-13-02 milik
        // pemilik, jangan diandalkan. Status 500 tetap dikirim agar Biteship mengulang.
        // HttpException (403/404/405/429) dibiarkan dirender bawaan: status & pesan tetap.
        // Temuan T-13-01 (docs/review-v1.3.md §4).
        $webhook = static fn (Request $request): bool => $request->is('biteship/webhook');

        // Handler memakai callback ini sebagai pengganti `expectsJson()`, jadi
        // permintaan JSON milik rute lain harus tetap dihormati (jangan 302).
        $exceptions->shouldRenderJsonWhen(
            static fn (Request $request): bool => $webhook($request) || $request->expectsJson()
        );

        $exceptions->render(function (Throwable $e, Request $request) use ($webhook) {
            // HttpException 4xx (403/404/405/429) tetap dirender bawaan: status & pesan tetap.
            if (! $webhook($request) || ($e instanceof HttpExceptionInterface && $e->getStatusCode() < 500)) {
                return null;
            }

            return response()->json(['message' => 'internal error'], 500);
        });
    })->create();
