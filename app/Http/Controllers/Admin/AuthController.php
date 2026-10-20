<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Autentikasi pengelola pada guard `admin` (PRD §5.2).
 * Kontrak props: docs/kontrak-props.md §6.10–§6.12.
 */
class AuthController extends Controller
{
    public function showLogin(Request $request): Response
    {
        return Inertia::render('Admin/Login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function login(AdminLoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'))
            ->with('success', 'Selamat datang di panel admin.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();

        if (Auth::guard('web')->check()) {
            // Peramban juga dipakai pembeli: ganti ID sesi saja, sesi pembeli dipertahankan.
            $request->session()->regenerate();
        } else {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return redirect()->route('admin.login')->with('success', 'Anda sudah keluar dari panel admin.');
    }
}
