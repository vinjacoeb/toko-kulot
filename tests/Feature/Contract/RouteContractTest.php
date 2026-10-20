<?php

namespace Tests\Feature\Contract;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Kontrak rute terhadap `docs/PRD.md` §5.1 dan §5.2 — K15 / DoD §15.3.
 *
 * Test ini adalah gerbang traceability: setiap nama rute yang dijanjikan PRD harus
 * benar-benar terdaftar di router. Kegagalan di sini berarti janji dokumen belum
 * punya penyeimbang di kode.
 */
class RouteContractTest extends TestCase
{
    use RefreshDatabase;

    private const PRD_5_1_PUBLIK = [
        'home',
        'products.index',
        'products.show',
        'contact',
        'contact.store',
        'cart.index',
        'cart.store',
        'cart.update',
        'cart.destroy',
        'register',
        'register.store',
        'login',
        'login.store',
        'password.request',
        'password.email',
        'password.reset',
        'password.update',
        'logout',
        'checkout.index',
        'checkout.store',
        'checkout.pay',
        'checkout.status',
        'checkout.success',
        'checkout.review',
        'midtrans.notification',
    ];

    private const PRD_5_2_ADMIN = [
        'admin.login',
        'admin.login.store',
        'admin.logout',
        'admin.dashboard',
        'admin.products.index',
        'admin.products.create',
        'admin.products.store',
        'admin.products.show',
        'admin.products.edit',
        'admin.products.update',
        'admin.products.destroy',
        'admin.categories.index',
        'admin.categories.store',
        'admin.categories.update',
        'admin.categories.destroy',
        'admin.stocks.index',
        'admin.stocks.in',
        'admin.stocks.out',
        'admin.stocks.history',
        'admin.orders.index',
        'admin.orders.show',
        'admin.orders.status',
        'admin.messages.index',
        'admin.messages.read',
        'admin.messages.reply',
        'admin.reviews.index',
        'admin.reviews.reply',
        'admin.reviews.visibility',
        'admin.settings.index',
        'admin.settings.update',
        'admin.settings.landing',
        'admin.carousels.store',
        'admin.carousels.update',
        'admin.carousels.destroy',
        'admin.faqs.store',
        'admin.faqs.update',
        'admin.faqs.destroy',
        'admin.accounts.index',
        'admin.accounts.store',
        'admin.accounts.update',
        'admin.accounts.destroy',
    ];

    /**
     * @param  list<string>  $nama
     * @return list<string>
     */
    private function namaRuteHilang(array $nama): array
    {
        $terdaftar = collect(Route::getRoutes())
            ->map(fn ($route) => (string) $route->getName())
            ->all();

        return array_values(array_filter($nama, fn (string $n) => ! in_array($n, $terdaftar, true)));
    }

    public function test_rute_publik_prd_5_1_terdaftar_semua(): void
    {
        $hilang = $this->namaRuteHilang(self::PRD_5_1_PUBLIK);

        $this->assertSame([], $hilang, "Rute publik PRD §5.1 belum terdaftar:\n".implode("\n", $hilang));
    }

    /**
     * Modul admin yang belum dibangun sama sekali (kartu perbaikan t_70c96acd) sehingga
     * rutenya memang belum terdaftar di routes/admin.php. Selama modul ini belum ada, test
     * di bawah melaporkan Incomplete — bukan gagal — tetapi tetap GAGAL bila ada nama rute
     * PRD §5.2 lain yang hilang di luar daftar ini. Hapus nama dari daftar ini setelah
     * modulnya terdaftar (lihat kartu t_70c96acd).
     */
    private const PRD_5_2_BELUM_DIIMPLEMENTASI = [
        // Kosong sejak K12 (t_ed8bd8e4): 22 rute admin PRD §5.2 sudah terdaftar,
        // jadi tidak ada lagi rute yang boleh dibaselinekan sebagai "belum dibangun".
        // Bila daftar ini diisi lagi, rute yang hilang berubah jadi Incomplete, bukan gagal.
    ];

    public function test_rute_admin_inti_prd_5_2_terdaftar_semua(): void
    {
        $hilang = $this->namaRuteHilang(self::PRD_5_2_ADMIN);
        $takTerduga = array_values(array_diff($hilang, self::PRD_5_2_BELUM_DIIMPLEMENTASI));

        $this->assertSame(
            [],
            $takTerduga,
            "Rute admin PRD §5.2 hilang di luar modul yang belum dibangun:\n".implode("\n", $takTerduga),
        );

        if ($hilang !== []) {
            $this->markTestIncomplete(
                sprintf('Belum diuji penuh: %d rute PRD §5.2 belum terdaftar karena modul adminnya belum dibangun (kartu t_70c96acd): %s', count($hilang), implode(', ', $hilang)),
            );
        }
    }

    public function test_metode_http_rute_publik_sesuai_prd(): void
    {
        $harapan = [
            'products.index' => 'GET',
            'products.show' => 'GET',
            'contact' => 'GET',
            'contact.store' => 'POST',
            'cart.index' => 'GET',
            'cart.store' => 'POST',
            'checkout.index' => 'GET',
            'checkout.store' => 'POST',
            'checkout.pay' => 'GET',
            'checkout.status' => 'GET',
            'checkout.success' => 'GET',
            'checkout.review' => 'POST',
            'midtrans.notification' => 'POST',
            'cart.update' => 'PATCH',
            'cart.destroy' => 'DELETE',
            'register.store' => 'POST',
            'login.store' => 'POST',
            'password.update' => 'POST',
            'logout' => 'POST',
        ];

        $keliru = [];

        foreach ($harapan as $name => $method) {
            $route = Route::getRoutes()->getByName($name);

            if ($route === null) {
                $keliru[] = "{$name} belum terdaftar";

                continue;
            }

            if (! in_array($method, $route->methods(), true)) {
                $keliru[] = sprintf('%s seharusnya %s, terdaftar %s', $name, $method, implode('/', $route->methods()));
            }
        }

        $this->assertSame([], $keliru, "Metode rute publik tidak sesuai PRD §5.1:\n".implode("\n", $keliru));
    }

    /**
     * Metode rute admin PRD §5.2. Konflik lama `admin.messages.read` (PRD §5.2 baris 157 PATCH vs
     * kontrak §10.2 POST) sudah diputuskan **PATCH** oleh techlead (kartu keputusan t_54bfee4e) dan
     * rutenya diselaraskan di kartu t_768819a7, jadi test ini tidak lagi butuh cabang Incomplete.
     * Rute yang hilang atau bermetode salah = gagal, bukan Incomplete.
     */
    public function test_metode_http_rute_admin_sesuai_prd(): void
    {
        $harapan = [
            'admin.stocks.in' => 'POST',
            'admin.stocks.out' => 'POST',
            'admin.orders.status' => 'PATCH',
            'admin.messages.read' => 'PATCH',
            'admin.messages.reply' => 'POST',
            'admin.reviews.reply' => 'POST',
            'admin.reviews.visibility' => 'PATCH',
            'admin.settings.update' => 'PUT',
            'admin.settings.landing' => 'PUT',
            'admin.accounts.store' => 'POST',
            'admin.accounts.update' => 'PUT',
            'admin.accounts.destroy' => 'DELETE',
        ];

        $keliru = [];

        foreach ($harapan as $name => $method) {
            $route = Route::getRoutes()->getByName($name);

            if ($route === null) {
                $keliru[] = "{$name} belum terdaftar";

                continue;
            }

            if (! in_array($method, $route->methods(), true)) {
                $keliru[] = sprintf('%s seharusnya %s, terdaftar %s', $name, $method, implode('/', $route->methods()));
            }
        }

        $this->assertSame([], $keliru, "Metode rute admin tidak sesuai PRD §5.2:\n".implode("\n", $keliru));
    }

    public function test_rute_publik_tidak_wajib_login(): void
    {
        $pelanggaran = [];

        foreach (['/', '/produk', '/kontak-kami'] as $uri) {
            $respons = $this->get($uri);

            if ($respons->getStatusCode() !== 200) {
                $pelanggaran[] = sprintf('GET %s → %d', $uri, $respons->getStatusCode());
            }
        }

        $this->assertSame([], $pelanggaran, "Halaman publik tidak boleh terhalang autentikasi:\n".implode("\n", $pelanggaran));
    }
}
