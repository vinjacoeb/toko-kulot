import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import PageHeader from '../../Components/PageHeader';
import Button from '../../Components/Button';
import Field from '../../Components/Field';
import Input from '../../Components/Input';
import Select from '../../Components/Select';
import KpiCard from '../../Components/KpiCard';
import DataTable from '../../Components/DataTable';
import { ArchiveIcon, CartIcon, ChartIcon, TrendUpIcon, WalletIcon } from '../../Components/icons';
import { formatDate, formatNumber, rupiah, toList, toObject } from '../../lib/format';

/** Laporan penjualan admin — kontrak props §14. */
const OPSI_PERIODE = [
    { value: 'hari-ini', label: 'Hari ini' },
    { value: '7-hari', label: '7 hari terakhir' },
    { value: 'bulan-ini', label: 'Bulan ini' },
    { value: 'kustom', label: 'Kustom' },
];

const KOLOM_TERLARIS = [
    { key: 'nama', header: 'Produk', render: (row) => row?.nama ?? '-' },
    { key: 'qty', header: 'Terjual', align: 'right', render: (row) => formatNumber(row?.qty ?? 0) },
    { key: 'omzet', header: 'Omzet', align: 'right', render: (row) => rupiah(row?.omzet ?? 0) },
];

export default function Laporan({ filter = null, ringkasan = null }) {
    const page = usePage();
    const errors = page.props.errors ?? {};
    const aktif = toObject(filter);
    const angka = toObject(ringkasan);
    const terlaris = toList(angka.produk_terlaris);

    const [periode, setPeriode] = useState(aktif.periode || 'bulan-ini');
    const [dari, setDari] = useState(aktif.dari || '');
    const [sampai, setSampai] = useState(aktif.sampai || '');
    const [memuat, setMemuat] = useState(false);

    const kustom = periode === 'kustom';
    const unduhSiap = !kustom || (dari !== '' && sampai !== '');

    // Tampilkan nilai hasil normalisasi server (periode tak sah → bulan-ini).
    useEffect(() => {
        setPeriode(aktif.periode || 'bulan-ini');
        setDari(aktif.dari || '');
        setSampai(aktif.sampai || '');
    }, [aktif.periode, aktif.dari, aktif.sampai]);

    const kirim = (query) => {
        router.get('/admin/laporan', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setMemuat(true),
            onFinish: () => setMemuat(false),
        });
    };

    const terapkan = (event) => {
        event.preventDefault();
        kirim({ periode, ...(kustom ? { dari, sampai } : {}) });
    };

    const ubahPeriode = (event) => {
        const nilai = event.target.value;
        setPeriode(nilai);
        if (nilai !== 'kustom') kirim({ periode: nilai });
    };

    const parameterUnduh = new URLSearchParams({ periode, ...(kustom ? { dari, sampai } : {}) });
    const galat = errors.periode || errors.dari || errors.sampai || null;

    return (
        <AdminLayout auth={page.props.auth ?? null}>
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Laporan"
                    breadcrumb={[{ label: 'Laporan' }]}
                    description={`Periode ${formatDate(aktif.dari)} – ${formatDate(aktif.sampai)}. Hanya pesanan dibayar sampai selesai yang dihitung omzet.`}
                    actions={
                        unduhSiap ? (
                            <Button as="a" href={`/admin/laporan/unduh?${parameterUnduh.toString()}`} variant="secondary" icon={<ArchiveIcon size={18} />}>
                                Unduh Excel
                            </Button>
                        ) : (
                            <Button variant="secondary" disabled icon={<ArchiveIcon size={18} />}>
                                Unduh Excel
                            </Button>
                        )
                    }
                />

                <form onSubmit={terapkan} className="rounded-lg border border-line bg-white p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="w-full sm:w-52">
                            <Field label="Periode" htmlFor="filter-periode">
                                <Select id="filter-periode" value={periode} disabled={memuat} onChange={ubahPeriode}>
                                    {OPSI_PERIODE.map((opsi) => (
                                        <option key={opsi.value} value={opsi.value}>
                                            {opsi.label}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                        </div>

                        {kustom && (
                            <>
                                <div className="w-full sm:w-44">
                                    <Field label="Dari tanggal" htmlFor="filter-dari" error={errors.dari}>
                                        <Input id="filter-dari" type="date" value={dari} disabled={memuat} error={errors.dari} onChange={(event) => setDari(event.target.value)} />
                                    </Field>
                                </div>
                                <div className="w-full sm:w-44">
                                    <Field label="Sampai tanggal" htmlFor="filter-sampai" error={errors.sampai}>
                                        <Input id="filter-sampai" type="date" value={sampai} disabled={memuat} error={errors.sampai} onChange={(event) => setSampai(event.target.value)} />
                                    </Field>
                                </div>
                            </>
                        )}

                        {kustom && (
                            <Button type="submit" loading={memuat} disabled={!unduhSiap} icon={<ChartIcon size={18} />}>
                                Terapkan
                            </Button>
                        )}
                    </div>

                    {galat && <p className="mt-3 text-meta text-danger">{galat}</p>}
                </form>

                <section aria-label="Ringkasan laporan" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <KpiCard label="Omzet" value={rupiah(angka.omzet ?? 0)} icon={WalletIcon} />
                    <KpiCard label="Pesanan" value={formatNumber(angka.jumlah_pesanan ?? 0)} icon={CartIcon} />
                    <KpiCard label="Rata-rata" value={rupiah(angka.rata_rata ?? 0)} icon={TrendUpIcon} />
                    <KpiCard label="Ongkir" value={rupiah(angka.total_ongkir ?? 0)} />
                    <KpiCard label="Diskon" value={rupiah(angka.total_diskon ?? 0)} />
                </section>

                <section aria-label="Produk terlaris" className="flex flex-col gap-3">
                    <div>
                        <h2 className="text-h3 text-ink">Produk terlaris</h2>
                        <p className="text-meta text-slate-500">Maksimal 5 produk pada periode ini.</p>
                    </div>
                    <DataTable
                        columns={KOLOM_TERLARIS}
                        rows={terlaris}
                        rowKey={(row, index) => row?.nama ?? index}
                        emptyTitle="Belum ada penjualan"
                        emptyDescription="Tidak ada pesanan berstatus omzet pada periode ini."
                    />
                </section>
            </div>
        </AdminLayout>
    );
}
