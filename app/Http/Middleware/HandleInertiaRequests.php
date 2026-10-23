<?php

namespace App\Http\Middleware;

use App\Services\SettingService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Root template.
     */
    protected $rootView = 'app';

    /**
     * Key `settings` yang harus selalu ada di props bersama (kontrak §1,
     * kartu t_101b9145). Nilainya `null` bila belum diisi, supaya frontend
     * selalu menerima kunci yang sama di semua halaman.
     *
     * @var array<int, string>
     */
    private const REQUIRED_PUBLIC_KEYS = ['store_name', 'store_logo', 'store_favicon', 'footer_copyright'];

    /**
     * Key yang hanya catatan panel admin dan tidak boleh masuk props publik
     * (kontrak §1: jalur bayar membaca `.env`, bukan `settings`).
     *
     * @var array<int, string>
     */
    private const ADMIN_ONLY_KEYS = ['midtrans_client_key', 'midtrans_is_production'];

    /**
     * Props yang dibagikan ke semua halaman.
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $admin = $request->user('admin');

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                ] : null,
                'admin' => $admin ? [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => $admin->role ?? null,
                ] : null,
            ],
            'cart' => [
                'count' => (int) ($request->session()->get('cart_count') ?? 0),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'meta' => [
                'description' => null,
            ],
            // Kontrak props §1/§2: seluruh `settings` publik untuk header/footer
            // dan batas seksi beranda. Nilai bertipe `json` di-decode di sini
            // supaya frontend menerima objek, bukan string.
            'settings' => fn () => $this->publicSettings(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function publicSettings(): array
    {
        try {
            $values = app(SettingService::class)->all();
        } catch (\Throwable) {
            // Tabel belum dimigrasi (mis. saat `php artisan migrate` pertama):
            // halaman tetap boleh dirender dengan nilai bawaan frontend.
            $values = [];
        }

        $values = array_diff_key($values, array_flip(self::ADMIN_ONLY_KEYS));

        foreach (self::REQUIRED_PUBLIC_KEYS as $key) {
            // String kosong diperlakukan sama dengan belum diisi agar frontend
            // cukup memeriksa `null` untuk memakai nilai bawaan.
            if (! array_key_exists($key, $values) || $values[$key] === '') {
                $values[$key] = null;
            }
        }

        return $values;
    }
}
