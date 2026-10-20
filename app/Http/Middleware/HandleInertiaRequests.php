<?php

namespace App\Http\Middleware;

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
        ]);
    }
}
