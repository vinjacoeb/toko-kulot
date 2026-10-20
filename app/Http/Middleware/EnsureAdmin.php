<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Membatasi akses ke panel /admin.
 * Hanya user yang login pada guard `admin` yang boleh lewat.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth('admin')->check()) {
            return redirect()->guest(route('admin.login'));
        }

        return $next($request);
    }
}
