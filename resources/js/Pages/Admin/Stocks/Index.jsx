import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import DataTable from '../../../Components/DataTable';
import Pagination from '../../../Components/Pagination';
import SearchInput from '../../../Components/SearchInput';
import Select from '../../../Components/Select';
import Field from '../../../Components/Field';
import Button from '../../../Components/Button';
import Modal from '../../../Components/Modal';
import Toast from '../../../Components/Toast';
import InlineNotice from '../../../Components/InlineNotice';
import Badge from '../../../Components/Badge';
import StatusBadge from '../../../Components/StatusBadge';
import KpiCard from '../../../Components/KpiCard';
import { formatDateTime, formatNumber } from '../../../lib/format';
import StokAksiModal from './partials/StokAksiModal';

/**
 * Stok per varian — PRD bagian stok admin (`/admin/stok`), design §5.12 (pola baku daftar
 * admin: PageHeader → KpiCard → toolbar → DataTable → Pagination),
 * kontrak props §12.12–§12.14.
 *
 * Props server (app/Http/Controllers/Admin/StockController.php@index):
 *   stok      paginator { data, links, meta { current_page, last_page, per_page, total } }
 *   filter    { q: string|null, status: 'semua'|'habis'|'kritis', kategori: int|null,
 *               urut: 'nama'|'stok_terkecil'|'stok_terbesar' }
 *   kategori  [{ id, name, slug }] untuk dropdown filter
 *   ringkasan { varian, habis, kritis }  (kritis = stok 1–4, habis = stok 0)
 *   flash     { success, error } — props bersama (HandleInertiaRequests)
 *
 * Baris = varian: { id, product:{id,name,slug}|null, size, color, label, sku, stock,
 * is_active, status: 'habis'|'kritis'|'aman', updated_at }.
 *
 * Filter/urutan/paginasi dikirim ke server lewat query string (`router.get`); server yang
 * menyaring. Aksi stok memakai URL literal routes/admin.php:
 *   POST /admin/stok/{variant}/masuk   (kontrak §12.13)
 *   POST /admin/stok/{variant}/keluar  (kontrak §12.14)
 * Tidak ada rute "setel stok" (stok absolut) — lihat modal Setel di bawah.
 */

const BREADCRUMB = [{ label: 'Dashboard', href: '/admin' }, { label: 'Stok' }];

/**
 * Ambang kritis PRD bagian stok + kontrak §12.12: stok 0 = habis, 1–4 = kritis, 5+ = aman.
 * Server memakai angka yang sama (StockController).
 */
const BATAS_KRITIS = 5;

const DASAR = { q: '', status: 'semua', kategori: '', urut: 'nama' };

/** Enum `status` filter kontrak §12.12: semua | habis | kritis. */
const STATUS = [
    { value: 'semua', label: 'Semua status' },
    { value: 'habis', label: 'Stok habis' },
    { value: 'kritis', label: 'Stok di bawah 5' },
];

/** Enum `urut` kontrak §12.12: nama | stok_terkecil | stok_terbesar. */
const URUT = [
    { value: 'nama', label: 'Nama produk A–Z' },
    { value: 'stok_terkecil', label: 'Stok terendah' },
    { value: 'stok_terbesar', label: 'Stok tertinggi' },
];

/**
 * Badge status baris (kontrak §12.12). `Badge` dipakai — bukan `StatusBadge` — karena
 * `StatusBadge` hanya memetakan status pesanan dan akan menjatuhkan `habis`/`kritis` ke
 * tone netral; di sini peringatan stok justru harus berwarna (design §2.1: token `warning`
 * untuk teks "Stok kritis"). Tone yang dipakai semuanya kelas baku design §4.21 v2.1.
 */
const BADGE_STATUS = {
    habis: { tone: 'danger', label: 'Habis' },
    kritis: { tone: 'warning', label: 'Kritis' },
    aman: { tone: 'success', label: 'Aman' },
};

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const asAngka = (value) => {
    const angka = Number(value);

    return Number.isFinite(angka) ? angka : 0;
};

const angkaTeks = (value) => (value === null || value === undefined ? '-' : formatNumber(value));

const asBool = (value) => value === true || value === 1 || value === '1';

/** Normalisasi props `filter` dari server; nilai kosong/tak dikenal -> bawaan. */
const keFilter = (sumber) => ({
    q: asText(sumber?.q ?? ''),
    status: sumber?.status ? asText(sumber.status) : DASAR.status,
    kategori:
        sumber?.kategori === null || sumber?.kategori === undefined ? '' : asText(sumber.kategori),
    urut: sumber?.urut ? asText(sumber.urut) : DASAR.urut,
});

export default function Index({
    stok = null,
    filter = null,
    kategori = [],
    ringkasan = null,
    flash = null,
    errors = null,
}) {
    const aktif = keFilter(filter);
    const [memuat, setMemuat] = useState(false);
    const [galat, setGalat] = useState(null);
    const [toast, setToast] = useState(null);
    const [galatTutup, setGalatTutup] = useState(false);
    const [aksi, setAksi] = useState(null); // { mode: 'in'|'out', baris }
    const [setel, setSetel] = useState(null); // baris varian

    // Pesan server (flash) selalu ditampilkan — pola sama dengan Admin/Accounts/Index.jsx.
    useEffect(() => {
        if (flash?.success) {
            setToast({ tone: 'success', title: 'Berhasil', message: String(flash.success) });
        } else if (flash?.error) {
            setToast({ tone: 'error', title: 'Gagal', message: String(flash.error) });
        }
    }, [flash?.success, flash?.error]);

    const daftar = Array.isArray(stok?.data) ? stok.data : [];
    const meta = stok?.meta ?? {};
    const halaman = asAngka(meta.current_page) || 1;
    const halamanAkhir = asAngka(meta.last_page) || 1;
    const total = meta.total === null || meta.total === undefined ? '-' : formatNumber(meta.total);
    const daftarKategori = Array.isArray(kategori) ? kategori.filter(Boolean) : [];

    const adaFilter =
        aktif.q !== DASAR.q ||
        aktif.status !== DASAR.status ||
        aktif.kategori !== DASAR.kategori ||
        aktif.urut !== DASAR.urut;

    const buka = (perubahan, opsi = {}) => {
        const berikut = { ...aktif, ...perubahan };
        const query = {};

        if (berikut.q !== '') query.q = berikut.q;
        if (berikut.kategori !== '') query.kategori = berikut.kategori;
        if (berikut.status !== DASAR.status) query.status = berikut.status;
        if (berikut.urut !== DASAR.urut) query.urut = berikut.urut;
        if (opsi.page && opsi.page > 1) query.page = opsi.page;

        router.get('/admin/stok', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => {
                setMemuat(true);
                setGalat(null);
            },
            onFinish: () => setMemuat(false),
            onError: () => setGalat('Gagal memuat daftar stok. Periksa koneksi lalu coba lagi.'),
        });
    };

    const reset = () => buka({ ...DASAR });

    /** Urutan server hanya `nama`, `stok_terkecil`, `stok_terbesar` (kontrak §12.12). */
    const gantiSort = (key) => {
        if (key === 'produk') {
            buka({ urut: 'nama' });

            return;
        }

        if (key === 'stok') {
            buka({ urut: aktif.urut === 'stok_terbesar' ? 'stok_terkecil' : 'stok_terbesar' });
        }
    };

    const namaBaris = (baris) =>
        `${asText(baris?.product?.name) || 'Produk tanpa nama'} — ${
            asText(baris?.label) || 'varian tanpa label'
        }`;

    /**
     * Props bersama `errors` (HandleInertiaRequests + Inertia Middleware): pesan validasi
     * terakhir dari server. Modal aksi menampilkan galat per kolomnya sendiri; notice ini
     * adalah jaring pengaman supaya galat server tidak pernah hilang tanpa jejak.
     */
    const galatServer = galatTutup
        ? []
        : Object.values(errors ?? {}).filter((pesan) => Boolean(pesan));

    const kolom = [
        {
            key: 'produk',
            header: 'Produk',
            render: (baris) => (
                <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                        {asText(baris?.product?.name) || '-'}
                    </p>
                    <p className="truncate text-meta text-slate-500">
                        {asText(baris?.product?.slug) || '-'}
                    </p>
                </div>
            ),
        },
        {
            key: 'varian',
            header: 'Varian',
            sortable: false,
            render: (baris) => (
                <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                        <span className="truncate">{asText(baris?.label) || '-'}</span>
                        {asBool(baris?.is_active) ? null : (
                            <StatusBadge status="nonaktif" label="Nonaktif" />
                        )}
                    </p>
                    <p className="truncate text-meta text-slate-500">
                        {asText(baris?.sku) || 'Tanpa SKU'}
                    </p>
                </div>
            ),
        },
        {
            key: 'stok',
            header: 'Stok',
            align: 'right',
            render: (baris) => (
                <span className="font-semibold text-ink">{angkaTeks(baris?.stock)}</span>
            ),
        },
        {
            key: 'batas',
            header: 'Batas kritis',
            align: 'right',
            sortable: false,
            render: () => (
                <span className="whitespace-nowrap text-slate-600">{`< ${BATAS_KRITIS}`}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: false,
            render: (baris) => {
                const kunci = asText(baris?.status);
                const lencana = BADGE_STATUS[kunci] ?? null;

                return lencana === null ? (
                    <StatusBadge status={kunci} label={kunci === '' ? '-' : undefined} />
                ) : (
                    <Badge tone={lencana.tone}>{lencana.label}</Badge>
                );
            },
        },
        {
            key: 'diperbarui',
            header: 'Diperbarui',
            sortable: false,
            render: (baris) => (
                <span className="whitespace-nowrap">
                    {asText(baris?.updated_at) === '' ? '-' : formatDateTime(baris.updated_at)}
                </span>
            ),
        },
        {
            key: 'aksi',
            header: 'Aksi',
            align: 'right',
            sortable: false,
            render: (baris) => (
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setAksi({ mode: 'in', baris })}
                        aria-label={`Catat stok masuk untuk ${namaBaris(baris)}`}
                    >
                        Masuk
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setAksi({ mode: 'out', baris })}
                        aria-label={`Catat stok keluar untuk ${namaBaris(baris)}`}
                    >
                        Keluar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSetel(baris)}
                        aria-label={`Setel stok ${namaBaris(baris)}`}
                    >
                        Setel
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Stok">
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Stok"
                    breadcrumb={BREADCRUMB}
                    description="Pantau stok per varian, catat stok masuk/keluar, dan telusuri riwayat pergerakan."
                    actions={
                        <Button variant="secondary" href="/admin/stok/riwayat">
                            Riwayat pergerakan
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <KpiCard
                        label="Total varian"
                        value={angkaTeks(ringkasan?.varian)}
                        href="/admin/stok"
                    />
                    <KpiCard
                        label="Stok habis"
                        value={angkaTeks(ringkasan?.habis)}
                        href="/admin/stok?status=habis"
                    />
                    <KpiCard
                        label="Stok kritis"
                        value={angkaTeks(ringkasan?.kritis)}
                        href="/admin/stok?status=kritis"
                    />
                </div>

                <p className="text-meta text-slate-600">
                    {`Status baris: Habis (stok 0), Kritis (stok 1–${
                        BATAS_KRITIS - 1
                    }), Aman (stok ${BATAS_KRITIS} atau lebih). `}
                    {`Filter "Stok di bawah ${BATAS_KRITIS}" menampilkan stok di bawah ${BATAS_KRITIS}, termasuk yang habis.`}
                </p>

                {galatServer.length > 0 && aksi === null && setel === null && (
                    <InlineNotice
                        tone="error"
                        title="Perubahan stok gagal disimpan"
                        onDismiss={() => setGalatTutup(true)}
                    >
                        {galatServer.map((pesan, index) => (
                            <p key={`galat-${index}`}>{asText(pesan)}</p>
                        ))}
                    </InlineNotice>
                )}

                <div className="flex flex-col gap-4 rounded-lg border border-line bg-white p-4">
                    <SearchInput
                        value={aktif.q}
                        onChange={(nilai) => buka({ q: nilai })}
                        placeholder="Cari nama produk atau SKU varian"
                        label="Cari stok varian"
                        loading={memuat}
                    />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Kategori" htmlFor="filter-kategori">
                            <Select
                                id="filter-kategori"
                                value={aktif.kategori}
                                disabled={memuat}
                                onChange={(event) => buka({ kategori: event.target.value })}
                            >
                                <option value="">Semua kategori</option>
                                {daftarKategori.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {asText(item.name) || '-'}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Status" htmlFor="filter-status">
                            <Select
                                id="filter-status"
                                value={aktif.status}
                                disabled={memuat}
                                onChange={(event) => buka({ status: event.target.value })}
                            >
                                {STATUS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Urutkan" htmlFor="filter-urut">
                            <Select
                                id="filter-urut"
                                value={aktif.urut}
                                disabled={memuat}
                                onChange={(event) => buka({ urut: event.target.value })}
                            >
                                {URUT.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-meta text-slate-500">
                            Menampilkan {formatNumber(daftar.length)} dari {total} varian.
                        </p>
                        {adaFilter && (
                            <Button variant="secondary" size="sm" onClick={reset} disabled={memuat}>
                                Reset filter
                            </Button>
                        )}
                    </div>
                </div>

                <DataTable
                    columns={kolom}
                    rows={daftar}
                    loading={memuat}
                    error={galat}
                    onRetry={() => buka({})}
                    emptyTitle={adaFilter ? 'Tidak ada varian yang cocok' : 'Belum ada varian'}
                    emptyDescription={
                        adaFilter
                            ? 'Ubah kata kunci atau reset filter untuk melihat varian lain.'
                            : 'Tambahkan produk beserta variannya agar stok bisa dicatat di sini.'
                    }
                    emptyActionLabel={adaFilter ? null : 'Tambah produk'}
                    emptyActionHref={adaFilter ? null : '/admin/produk/tambah'}
                    sort={{
                        key: aktif.urut === 'nama' ? 'produk' : 'stok',
                        dir: aktif.urut === 'stok_terbesar' ? 'desc' : 'asc',
                    }}
                    onSort={gantiSort}
                    caption="Daftar stok per varian"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-meta text-slate-600">
                        Halaman {formatNumber(halaman)} dari {formatNumber(halamanAkhir)}
                    </p>
                    <Pagination
                        currentPage={halaman}
                        lastPage={halamanAkhir}
                        onPageChange={(page) => buka({}, { page })}
                    />
                </div>
            </div>

            <StokAksiModal
                open={aksi !== null}
                mode={aksi?.mode ?? 'in'}
                baris={aksi?.baris ?? null}
                onClose={() => setAksi(null)}
            />

            <Modal
                open={setel !== null}
                onClose={() => setSetel(null)}
                title="Setel stok"
                description={setel === null ? '' : namaBaris(setel)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setSetel(null)}>
                            Tutup
                        </Button>
                        <Button
                            variant="primary"
                            href={
                                setel?.product?.id
                                    ? `/admin/produk/${setel.product.id}/ubah`
                                    : '/admin/produk'
                            }
                        >
                            Buka form produk
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col gap-3 text-body text-ink-soft">
                    <p>
                        Setel stok ke angka tertentu dilakukan dari form produk. Server mencatat
                        selisihnya sebagai pergerakan penyesuaian (kontrak props §12.4 dan §12.6),
                        jadi riwayat stok tetap lengkap.
                    </p>
                    <p>
                        Untuk koreksi cepat tanpa membuka produk, pakai tombol Masuk atau Keluar —
                        keduanya tercatat atas nama petugas yang sedang masuk.
                    </p>
                </div>
            </Modal>

            {toast && (
                <div className="pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]">
                    <Toast
                        tone={toast.tone}
                        title={toast.title}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
        </AdminLayout>
    );
}
