<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Membatasi akses ke panel /admin (PRD §3, §5.2).
 *
 * Hanya akun pada guard `admin` yang aktif yang boleh lewat. Akun yang
 * dinonaktifkan setelah login langsung dikeluarkan pada request berikutnya.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $admin = auth('admin')->user();

        if ($admin === null) {
            return redirect()->guest(route('admin.login'));
        }

        if (! $admin->is_active) {
            auth('admin')->logout();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')
                ->with('error', 'Akun ini dinonaktifkan. Hubungi owner toko.');
        }

        return $next($request);
    }
}
