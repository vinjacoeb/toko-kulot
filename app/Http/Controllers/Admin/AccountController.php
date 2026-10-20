<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ListProps;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAccountRequest;
use App\Http\Requests\Admin\UpdateAccountRequest;
use App\Models\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Akun admin (PRD §5.2, kontrak props §12.19–§12.22).
 *
 * Penjaga terakhir: tidak boleh menghapus/menonaktifkan akun sendiri, dan harus
 * selalu tersisa minimal satu owner aktif.
 */
class AccountController extends Controller
{
    use ListProps;

    /** @var list<string> */
    private const ROLES = ['owner', 'admin', 'staff'];

    public function index(Request $request): Response
    {
        $filter = [
            'q' => $this->teks($request->query('q')),
            'role' => $this->pilihan($request->query('role'), self::ROLES, 'semua'),
            'status' => $this->pilihan($request->query('status'), ['aktif', 'nonaktif'], 'semua'),
        ];

        $query = Admin::query();

        if ($filter['q'] !== null) {
            $like = '%'.$filter['q'].'%';
            $query->where(fn ($where) => $where
                ->where('name', 'like', $like)
                ->orWhere('email', 'like', $like));
        }

        if ($filter['role'] !== 'semua') {
            $query->where('role', $filter['role']);
        }

        if ($filter['status'] === 'aktif') {
            $query->where('is_active', true);
        } elseif ($filter['status'] === 'nonaktif') {
            $query->where('is_active', false);
        }

        $akun = $query
            ->orderByRaw("case role when 'owner' then 0 when 'admin' then 1 else 2 end")
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $me = $request->user('admin');

        return Inertia::render('Admin/Accounts/Index', [
            'akun' => [
                'data' => collect($akun->items())
                    ->map(fn (Admin $row) => $this->row($row, $me?->id))
                    ->all(),
                'links' => $akun->linkCollection()->all(),
                'meta' => $this->meta($akun),
            ],
            'filter' => $filter,
            'ringkasan' => [
                'total' => Admin::query()->count(),
                'owner' => Admin::query()->where('role', 'owner')->count(),
                'admin' => Admin::query()->where('role', 'admin')->count(),
                'staff' => Admin::query()->where('role', 'staff')->count(),
                'aktif' => Admin::query()->where('is_active', true)->count(),
            ],
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Admin::query()->create([
            'name' => trim((string) $data['name']),
            'email' => strtolower(trim((string) $data['email'])),
            'password' => (string) $data['password'],
            'role' => (string) $data['role'],
            'is_active' => $this->flag($data['is_active'] ?? null, true),
        ]);

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', 'Akun admin disimpan.');
    }

    public function update(UpdateAccountRequest $request, Admin $admin): RedirectResponse
    {
        $data = $request->validated();
        $me = $request->user('admin');
        $role = (string) $data['role'];
        $aktif = $this->flag($data['is_active'] ?? null, (bool) $admin->is_active);

        if ($me !== null && $me->id === $admin->id && $role !== $admin->role) {
            throw ValidationException::withMessages([
                'role' => 'Tidak bisa mengubah role akun sendiri.',
            ]);
        }

        if ($me !== null && $me->id === $admin->id && ! $aktif) {
            throw ValidationException::withMessages([
                'is_active' => 'Tidak bisa menonaktifkan akun sendiri.',
            ]);
        }

        $ownerHilang = $admin->role === 'owner'
            && (bool) $admin->is_active
            && ($role !== 'owner' || ! $aktif);

        if ($ownerHilang && ! $this->adaOwnerAktifLain($admin->id)) {
            throw ValidationException::withMessages([
                'role' => 'Minimal satu owner aktif harus ada.',
            ]);
        }

        $attributes = [
            'name' => trim((string) $data['name']),
            'email' => strtolower(trim((string) $data['email'])),
            'role' => $role,
            'is_active' => $aktif,
        ];

        if (isset($data['password']) && (string) $data['password'] !== '') {
            $attributes['password'] = (string) $data['password'];
        }

        $admin->forceFill($attributes)->save();

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', 'Akun admin diperbarui.');
    }

    public function destroy(Request $request, Admin $admin): RedirectResponse
    {
        $me = $request->user('admin');

        if ($me !== null && $me->id === $admin->id) {
            throw ValidationException::withMessages([
                'akun' => 'Tidak bisa menghapus akun sendiri.',
            ]);
        }

        if ($admin->role === 'owner'
            && (bool) $admin->is_active
            && ! $this->adaOwnerAktifLain($admin->id)) {
            throw ValidationException::withMessages([
                'akun' => 'Minimal satu owner aktif harus ada.',
            ]);
        }

        $admin->delete();

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', 'Akun admin dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Admin $admin, ?int $viewerId): array
    {
        return [
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => $admin->role,
            'is_active' => (bool) $admin->is_active,
            'is_self' => $viewerId !== null && $viewerId === $admin->id,
            'created_at' => $admin->created_at?->toIso8601String(),
        ];
    }

    private function adaOwnerAktifLain(int $adminId): bool
    {
        return Admin::query()
            ->where('role', 'owner')
            ->where('is_active', true)
            ->whereKeyNot($adminId)
            ->exists();
    }
}
