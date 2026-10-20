<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Carousel;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * Kontrol akses seluruh rute `admin.*` (PRD §5.2, kontrak §6.14) — K15.
 *
 * Daftar rute dibaca dari router, bukan ditulis tangan, sehingga rute admin baru
 * otomatis ikut diuji tanpa perlu memperbarui test ini.
 */
class AdminRouteAccessTest extends TestCase
{
    use RefreshDatabase;

    private const RUTE_PUBLIK = ['admin.login', 'admin.login.store'];

    /**
     * @return list<array{name: string, method: string, uri: string}>
     */
    private function ruteAdmin(): array
    {
        $kasus = [];

        foreach (Route::getRoutes() as $route) {
            $name = (string) $route->getName();

            if (! str_starts_with($name, 'admin.') || in_array($name, self::RUTE_PUBLIK, true)) {
                continue;
            }

            $metode = collect($route->methods())
                ->reject(fn (string $m) => in_array($m, ['HEAD', 'OPTIONS'], true))
                ->first();

            // Placeholder ({message}, {carousel}) diganti id data uji supaya route-model binding tidak 404 sebelum middleware dievaluasi.
            $uri = (string) preg_replace_callback(
                '/\{([^}]+)\}/',
                fn (array $cocok): string => (string) ($this->idParameterRute()[$cocok[1]] ?? 1),
                '/'.ltrim($route->uri(), '/')
            );

            $kasus[] = ['name' => $name, 'method' => (string) $metode, 'uri' => $uri];
        }

        return $kasus;
    }

    private function diarahkanKeLogin(TestResponse $respons): bool
    {
        return in_array($respons->getStatusCode(), [301, 302, 303, 307, 308], true)
            && str_contains((string) $respons->headers->get('Location'), '/admin/login');
    }

    /** @var array<string, int>|null */
    private ?array $idParameter = null;

    /**
     * Data uji per parameter route (route-model binding) agar permintaan tidak
     * berhenti di 404 sebelum middleware admin dievaluasi.
     *
     * @return array<string, int>
     */
    private function idParameterRute(): array
    {
        if ($this->idParameter !== null) {
            return $this->idParameter;
        }

        $pembeli = User::factory()->create();
        $kategori = Category::create([
            'name' => '[CONTOH] Kategori Uji',
            'slug' => 'contoh-kategori-uji',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $produk = Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Produk Uji',
            'slug' => 'contoh-produk-uji',
            'sku' => 'CONTOH-UJI',
            'base_price' => 89000,
            'is_active' => true,
        ]);
        $varian = ProductVariant::create([
            'product_id' => $produk->id,
            'size' => 'M',
            'sku' => 'CONTOH-UJI-M',
            'stock' => 5,
            'is_active' => true,
        ]);
        $petugas = Admin::factory()->create();
        $pesanan = Order::create([
            'code' => 'CONTOH-UJI-1',
            'status' => 'menunggu',
            'total' => 89000,
            'customer_name' => '[CONTOH] Pembeli',
            'customer_phone' => '0800000000',
            'shipping_address' => 'Jalan Uji No. 1',
            'city' => 'Bandung',
        ]);
        $pesan = ContactMessage::create([
            'name' => '[CONTOH] Pengirim',
            'email' => 'contoh@example.test',
            'subject' => '[CONTOH] Subjek',
            'message' => 'Isi pesan uji.',
        ]);
        $carousel = Carousel::create(['title' => '[CONTOH] Carousel', 'image' => 'carousel/uji.jpg']);
        $faq = Faq::create(['question' => '[CONTOH] Pertanyaan?', 'answer' => 'Jawaban uji.']);
        $penilaian = Review::create([
            'order_id' => $pesanan->id,
            'product_id' => $produk->id,
            'user_id' => $pembeli->id,
            'rating' => 5,
        ]);

        return $this->idParameter = [
            'variant' => $varian->id,
            'admin' => $petugas->id,
            'message' => $pesan->id,
            'carousel' => $carousel->id,
            'faq' => $faq->id,
            'review' => $penilaian->id,
        ];
    }

    public function test_tamu_diarahkan_ke_login_admin(): void
    {
        $pelanggaran = [];

        foreach ($this->ruteAdmin() as $rute) {
            $respons = $this->json($rute['method'], $rute['uri']);

            if (! $this->diarahkanKeLogin($respons)) {
                $pelanggaran[] = sprintf('%s [%s %s] → %d', $rute['name'], $rute['method'], $rute['uri'], $respons->getStatusCode());
            }
        }

        $this->assertSame([], $pelanggaran, "Rute admin yang tidak mengarahkan tamu ke login:\n".implode("\n", $pelanggaran));
    }

    public function test_pembeli_tidak_bisa_menembus_panel_admin(): void
    {
        $pembeli = User::factory()->create();
        $pelanggaran = [];

        foreach ($this->ruteAdmin() as $rute) {
            $respons = $this->actingAs($pembeli, 'web')->json($rute['method'], $rute['uri']);

            if (! $this->diarahkanKeLogin($respons)) {
                $pelanggaran[] = sprintf('%s [%s %s] → %d', $rute['name'], $rute['method'], $rute['uri'], $respons->getStatusCode());
            }
        }

        $this->assertSame([], $pelanggaran, "Rute admin yang bisa ditembus pembeli:\n".implode("\n", $pelanggaran));
    }

    public function test_terdapat_rute_admin_yang_diuji(): void
    {
        $this->assertNotEmpty($this->ruteAdmin(), 'Tidak ada rute admin terdaftar selain login.');
    }

    public function test_admin_aktif_dapat_membuka_seluruh_rute_get_admin(): void
    {
        $admin = Admin::factory()->create();
        $pelanggaran = [];

        foreach ($this->ruteAdmin() as $rute) {
            if ($rute['method'] !== 'GET') {
                continue;
            }

            $respons = $this->actingAs($admin, 'admin')->get($rute['uri']);
            $status = $respons->getStatusCode();

            // 404 = middleware lolos tapi data uji tidak ada; redirect non-login = controller mengalihkan. Keduanya bukan pelanggaran akses.
            $diterima = $status === 200
                || $status === 404
                || ($respons->isRedirect() && ! $this->diarahkanKeLogin($respons));

            if (! $diterima) {
                $pelanggaran[] = sprintf('%s [GET %s] → %d', $rute['name'], $rute['uri'], $status);
            }
        }

        $this->assertSame([], $pelanggaran, "Rute admin yang gagal dibuka admin aktif:\n".implode("\n", $pelanggaran));
    }

    public function test_form_login_admin_tampil_untuk_tamu(): void
    {
        $this->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Login', false));
    }

    public function test_form_login_admin_untuk_admin_yang_sudah_masuk(): void
    {
        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'admin')
            ->get('/admin/login')
            ->assertRedirect('/admin');
    }
}
