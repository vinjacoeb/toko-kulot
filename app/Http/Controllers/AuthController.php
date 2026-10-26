<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Autentikasi pembeli pada guard `web` (PRD §5.1).
 *
 * Satu controller untuk seluruh fitur: pendaftaran, masuk, lupa sandi, reset sandi, keluar.
 * Kontrak props: docs/kontrak-props.md §6.1–§6.9.
 */
class AuthController extends Controller
{
    public function showRegister(): Response
    {
        return Inertia::render('Public/Auth/Register');
    }

    public function register(RegisterRequest $request): RedirectResponse
    {
        $user = User::query()->create([
            'name' => (string) $request->input('name'),
            'email' => (string) $request->input('email'),
            'phone' => (string) $request->input('phone'),
            'address' => (string) $request->input('address'),
            'city' => (string) $request->input('city'),
            'postal_code' => (string) $request->input('postal_code'),
            'password' => (string) $request->input('password'), // cast `hashed` di model
        ]);

        // PRD §14 A4: tanpa verifikasi email — akun langsung aktif.
        // `forceFill` karena `email_verified_at` sengaja tidak mass-assignable.
        $user->forceFill(['email_verified_at' => now()])->save();

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return redirect()->route('home')->with('success', 'Akun berhasil dibuat. Selamat berbelanja!');
    }

    public function showLogin(Request $request): Response
    {
        return Inertia::render('Public/Auth/Login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function login(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        return redirect()->intended(route('home'))->with('success', 'Berhasil masuk. Selamat berbelanja!');
    }

    public function showForgotPassword(Request $request): Response
    {
        return Inertia::render('Public/Auth/ForgotPassword', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function sendResetLink(ForgotPasswordRequest $request): RedirectResponse
    {
        $status = Password::broker('users')->sendResetLink($request->only('email'));

        // Permintaan kirim ulang terlalu cepat — satu-satunya galat yang ditampilkan.
        if ($status === Password::RESET_THROTTLED) {
            throw ValidationException::withMessages([
                'email' => 'Tunggu 1 menit sebelum meminta tautan baru.',
            ]);
        }

        // Email tidak terdaftar tetap dijawab netral (tidak membocorkan data akun).
        return back()->with('success', 'Jika email terdaftar, tautan reset sudah dikirim.');
    }

    public function showResetPassword(Request $request, string $token): Response
    {
        return Inertia::render('Public/Auth/ResetPassword', [
            'token' => $token,
            'email' => (string) $request->query('email', ''),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): RedirectResponse
    {
        $status = Password::broker('users')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password, // cast `hashed` di model
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => $this->resetErrorMessage($status),
            ]);
        }

        return redirect()->route('login')->with('success', 'Kata sandi berhasil diperbarui. Silakan masuk.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        if (Auth::guard('admin')->check()) {
            // Peramban juga dipakai admin: ganti ID sesi saja, sesi admin dipertahankan.
            $request->session()->regenerate();
        } else {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return redirect()->route('home')->with('success', 'Anda sudah keluar.');
    }

    private function resetErrorMessage(string $status): string
    {
        return match ($status) {
            Password::INVALID_USER => 'Email tidak terdaftar.',
            Password::RESET_THROTTLED => 'Tunggu 1 menit sebelum meminta tautan baru.',
            default => 'Tautan reset tidak valid atau sudah kedaluwarsa.',
        };
    }
}
