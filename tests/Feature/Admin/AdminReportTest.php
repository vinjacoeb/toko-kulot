<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

/**
 * Laporan admin `/admin/laporan` + unduhan Excel — kontrak props §14.
 */
class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    private function order(string $kode, string $status, int $total, int $ongkir = 0, ?string $waktu = null): Order
    {
        $order = Order::create([
            'code' => $kode,
            'status' => $status,
            'subtotal' => $total - $ongkir,
            'shipping_cost' => $ongkir,
            'shipping_cost_original' => $ongkir,
            'discount' => 0,
            'total' => $total,
            'customer_name' => '[CONTOH] Pembeli '.$kode,
            'customer_phone' => '0800000000',
            'shipping_address' => 'Jalan Uji No. 1',
            'city' => 'Bandung',
        ]);

        if ($waktu !== null) {
            $order->forceFill(['created_at' => Carbon::parse($waktu)])->saveQuietly();
        }

        return $order;
    }

    private function item(Order $order, string $nama, int $qty, int $harga): void
    {
        OrderItem::create([
            'order_id' => $order->id,
            'product_name' => $nama,
            'variant_label' => 'M / Hitam',
            'qty' => $qty,
            'unit_price' => $harga,
            'line_total' => $qty * $harga,
        ]);
    }

    private function admin(): Admin
    {
        return Admin::factory()->create();
    }

    public function test_omzet_hanya_dari_pesanan_berstatus_revenue(): void
    {
        $bulanIni = Carbon::today()->format('Y-m-05 10:00:00');
        $bulanLalu = Carbon::today()->subMonthNoOverflow()->format('Y-m-05 10:00:00');

        $dibayar = $this->order('INV-001', Order::STATUS_PAID, 120000, 20000, $bulanIni);
        $this->item($dibayar, '[CONTOH] Daster A', 2, 50000);
        $this->order('INV-002', Order::STATUS_PENDING, 50000, 0, $bulanIni);
        $this->order('INV-003', Order::STATUS_CANCELLED, 70000, 0, $bulanIni);
        $this->order('INV-004', Order::STATUS_COMPLETED, 90000, 0, $bulanLalu);

        $this->actingAs($this->admin(), 'admin')
            ->get('/admin/laporan?periode=bulan-ini')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Laporan')
                ->where('filter.periode', 'bulan-ini')
                ->where('ringkasan.omzet', 120000)
                ->where('ringkasan.jumlah_pesanan', 1)
                ->where('ringkasan.rata_rata', 120000)
                ->where('ringkasan.total_ongkir', 20000)
                ->has('ringkasan.produk_terlaris', 1)
                ->where('ringkasan.produk_terlaris.0.nama', '[CONTOH] Daster A')
                ->where('ringkasan.produk_terlaris.0.qty', 2));
    }

    public function test_filter_kustom_dan_periode_asing(): void
    {
        $this->order('INV-005', Order::STATUS_PAID, 100000, 0, '2026-01-10 09:00:00');

        $this->actingAs($this->admin(), 'admin')
            ->get('/admin/laporan?periode=kustom&dari=2026-01-01&sampai=2026-01-31')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filter.periode', 'kustom')
                ->where('filter.dari', '2026-01-01')
                ->where('filter.sampai', '2026-01-31')
                ->where('ringkasan.omzet', 100000));

        $this->actingAs($this->admin(), 'admin')
            ->get('/admin/laporan?periode=ngawur&dari=2026-13-99')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('filter.periode', 'bulan-ini'));
    }

    public function test_unduh_menghasilkan_empat_sheet(): void
    {
        if (! class_exists(\ZipArchive::class)) {
            $this->markTestSkipped('ext-zip belum aktif di php.ini — lihat docs/langkah-pemilik.md v1.6.');
        }

        $order = $this->order('INV-006', Order::STATUS_PAID, 150000, 25000, Carbon::today()->format('Y-m-d 08:00:00'));
        $this->item($order, '[CONTOH] Daster B', 3, 40000);
        $this->order('INV-007', Order::STATUS_PENDING, 60000, 0, Carbon::today()->format('Y-m-d 09:00:00'));

        $response = $this->actingAs($this->admin(), 'admin')
            ->get('/admin/laporan/unduh?periode=bulan-ini');

        $response->assertOk();
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $path = $response->baseResponse->getFile()->getPathname();
        $spreadsheet = IOFactory::load($path);

        $this->assertSame(['Ringkasan', 'Pesanan', 'Detail Item', 'Stok'], $spreadsheet->getSheetNames());
        $ringkasan = $spreadsheet->getSheetByName('Ringkasan');
        $this->assertSame('Laporan Penjualan Toko Daster Kulot', $ringkasan->getCell('A1')->getValue());

        // Regresi QA-2 v1.7: writer membuang baris [], jadi gaya harus ikut baris nyata.
        $this->assertSame('Ringkasan', $ringkasan->getCell('A3')->getValue());
        $this->assertSame('Nilai', $ringkasan->getCell('B3')->getValue());
        $this->assertSame('Produk terlaris', $ringkasan->getCell('A9')->getValue());
        $this->assertSame('Qty', $ringkasan->getCell('B9')->getValue());
        $this->assertSame('Omzet', $ringkasan->getCell('C9')->getValue());
        $this->assertSame(10, $ringkasan->getHighestRow());
        $this->assertSame('A4', $ringkasan->getFreezePane());
        $this->assertSame(22.0, $ringkasan->getRowDimension(3)->getRowHeight());
        $this->assertSame('FF1F2A5E', $ringkasan->getStyle('A3')->getFill()->getStartColor()->getARGB());
        $this->assertSame('FF1F2A5E', $ringkasan->getStyle('C9')->getFill()->getStartColor()->getARGB());
        $this->assertSame('"Rp" #,##0', $ringkasan->getStyle('B4')->getNumberFormat()->getFormatCode());
        $this->assertSame('#,##0', $ringkasan->getStyle('B5')->getNumberFormat()->getFormatCode());
        $this->assertSame('"Rp" #,##0', $ringkasan->getStyle('B6')->getNumberFormat()->getFormatCode());
        $this->assertSame('"Rp" #,##0', $ringkasan->getStyle('B8')->getNumberFormat()->getFormatCode());
        $this->assertSame('General', $ringkasan->getStyle('B9')->getNumberFormat()->getFormatCode());
        $this->assertSame('FFF6F6F4', $ringkasan->getStyle('A10')->getFill()->getStartColor()->getARGB());
        $this->assertSame('#,##0', $ringkasan->getStyle('B10')->getNumberFormat()->getFormatCode());
        $this->assertSame('"Rp" #,##0', $ringkasan->getStyle('C10')->getNumberFormat()->getFormatCode());
        $pesanan = $spreadsheet->getSheetByName('Pesanan');
        $this->assertSame(3, $pesanan->getHighestRow());
        $this->assertSame('INV-006', $pesanan->getCell('A2')->getValue());
        $this->assertSame('INV-007', $pesanan->getCell('A3')->getValue());
    }

    public function test_unduh_periode_kustom_tanpa_tanggal_ditolak(): void
    {
        $this->actingAs($this->admin(), 'admin')
            ->from('/admin/laporan')
            ->get('/admin/laporan/unduh?periode=kustom')
            ->assertRedirect('/admin/laporan')
            ->assertSessionHasErrors(['dari', 'sampai']);
    }

    public function test_admin_biasa_tidak_bisa_akses_tanpa_login(): void
    {
        $this->get('/admin/laporan')->assertRedirect('/admin/login');
    }
}
