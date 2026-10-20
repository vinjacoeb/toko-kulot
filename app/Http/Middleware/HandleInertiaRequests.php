<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Root template.
     */
    protected $rootView = 'app';

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
            return Setting::query()
                ->get(['key', 'value', 'type'])
                ->mapWithKeys(function (Setting $setting) {
                    $value = $setting->value;

                    if ($setting->type === 'json') {
                        $decoded = json_decode((string) $value, true);
                        $value = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
                    }

                    return [$setting->key => $value];
                })
                ->all();
        } catch (\Throwable) {
            // Tabel belum dimigrasi (mis. saat `php artisan migrate` pertama):
            // halaman tetap boleh dirender dengan nilai bawaan frontend.
            return [];
        }
    }
}
