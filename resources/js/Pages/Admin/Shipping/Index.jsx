import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Field from '../../../Components/Field';
import Input from '../../../Components/Input';
import Textarea from '../../../Components/Textarea';
import Button from '../../../Components/Button';
import InlineNotice from '../../../Components/InlineNotice';
import EmptyState from '../../../Components/EmptyState';
import StatusBadge from '../../../Components/StatusBadge';
import SearchInput from '../../../Components/SearchInput';
import Toast from '../../../Components/Toast';
import { TruckIcon } from '../../../Components/icons';
import { cn, formatNumber, toList, toObject } from '../../../lib/format';

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const asBool = (value, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (value === 1 || value === '1' || value === 'true') return true;
    if (value === 0 || value === '0' || value === 'false') return false;
    return fallback;
};

const asNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const courierKey = (row) => `${asText(row.courier_code)}:${asText(row.service_code)}`;

const toRows = (daftar) =>
    toList(daftar).map((item, index) => {
        const row = toObject(item);
        return {
            uid: `saved-${index}`,
            courier_code: asText(row.courier_code),
            courier_name: asText(row.courier_name) || asText(row.courier_code),
            service_code: asText(row.service_code),
            service_name: asText(row.service_name) || asText(row.service_code),
            label: asText(row.label),
            is_regular: asBool(row.is_regular),
            is_active: asBool(row.is_active),
        };
    });

function SectionCard({ title = null, description = null, children, className = '' }) {
    return (
        <section className={cn('card p-6', className)}>
            {title ? (
                <header className="mb-4">
                    <h2 className="text-h3 text-ink">{title}</h2>
                    {description ? <p className="mt-1 text-meta text-slate-500">{description}</p> : null}
                </header>
            ) : null}
            <div className="flex flex-col gap-4">{children}</div>
        </section>
    );
}

function StickySave({ dirty, processing, onReset }) {
    return (
        <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-line bg-white px-4 py-3 lg:-mx-6 lg:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-meta text-slate-500" aria-live="polite">
                    {dirty ? 'Perubahan belum disimpan.' : 'Tidak ada perubahan.'}
                </p>
                <div className="flex items-center gap-2">
                    {dirty ? (
                        <Button variant="secondary" onClick={onReset} disabled={processing}>
                            Batalkan perubahan
                        </Button>
                    ) : null}
                    <Button
                        id="shipping-save"
                        type="submit"
                        loading={processing}
                        disabled={!dirty || processing}
                    >
                        Simpan ekspedisi
                    </Button>
                </div>
            </div>
        </div>
    );
}

/** Input rupiah: angka mentah saat fokus, ribuan saat blur (design-v1.1 §8.3). */
function MoneyInput({ id, value, onChange, error = null, disabled = false, max = 100000000 }) {
    const [focused, setFocused] = useState(false);
    const number = value === '' || value === null || value === undefined ? '' : asNumber(value, 0);
    const display = focused || number === '' ? asText(number) : formatNumber(number);

    return (
        <div className="relative">
            <span
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body text-slate-500"
                aria-hidden="true"
            >
                Rp
            </span>
            <Input
                id={id}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="pl-10"
                value={display}
                disabled={disabled}
                error={error}
                maxLength={12}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, '').slice(0, 9);
                    const next = digits === '' ? '' : Math.min(Number(digits), max);
                    onChange(next);
                }}
            />
        </div>
    );
}

function CheckboxCell({ id, checked, onChange, label, disabled = false }) {
    return (
        <label htmlFor={id} className="flex h-11 w-11 cursor-pointer items-center justify-center">
            <input
                id={id}
                type="checkbox"
                className="h-5 w-5 rounded-sm border-line accent-brand"
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked)}
            />
            <span className="sr-only">{label}</span>
        </label>
    );
}

export default function ShippingIndex({ auth = null, pengaturan = null, kurir = null, flash = null }) {
    const setting = toObject(pengaturan);
    const courier = toObject(kurir);
    const daftar = toList(courier.daftar);
    const initialRows = useMemo(() => toRows(daftar), [daftar]);

    const form = useForm({
        shipping_origin_name: asText(setting.shipping_origin_name),
        shipping_origin_phone: asText(setting.shipping_origin_phone),
        shipping_origin_address: asText(setting.shipping_origin_address),
        shipping_origin_postal_code: asText(setting.shipping_origin_postal_code),
        free_shipping_enabled: asBool(setting.free_shipping_enabled, true),
        free_shipping_min: asNumber(setting.free_shipping_min, 300000),
        shipping_cost_default: asNumber(setting.shipping_cost_default, 20000),
        couriers: initialRows,
    });

    const [search, setSearch] = useState('');
    const [manualOpen, setManualOpen] = useState(false);
    const [manual, setManual] = useState({ code: '', label: '', regular: true, active: true });
    const [manualErrors, setManualErrors] = useState({});
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash && typeof flash.success === 'string' && flash.success !== '') {
            setToast({ tone: 'success', message: flash.success });
        } else if (flash && typeof flash.error === 'string' && flash.error !== '') {
            setToast({ tone: 'error', message: flash.error });
        }
    }, [flash?.success, flash?.error]);

    const rows = toList(form.data.couriers);
    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (keyword === '') return rows;
        return rows.filter((row) =>
            [row.courier_name, row.courier_code, row.service_name, row.service_code, row.label]
                .join(' ')
                .toLowerCase()
                .includes(keyword)
        );
    }, [rows, search]);

    const activeRegular = rows.filter((row) => row.is_regular && row.is_active).length;
    const activeCount = rows.filter((row) => row.is_active).length;
    const mode = asText(courier.mode) === 'api' ? 'api' : 'fake';
    const keyTerisi = asBool(courier.key_terisi);
    const sumber = asText(courier.sumber);
    const galat = asText(courier.galat);

    const err = (key) => form.errors[key];
    const courierRowError = (index) =>
        form.errors[`couriers.${index}.is_active`] ??
        form.errors[`couriers.${index}.is_regular`] ??
        form.errors[`couriers.${index}.label`] ??
        form.errors[`couriers.${index}.courier_code`] ??
        form.errors[`couriers.${index}.service_code`];
    const setCourier = (index, patch) => {
        const next = rows.map((row, position) => (position === index ? { ...row, ...patch } : row));
        form.setData('couriers', next);
    };

    const addManual = () => {
        const code = manual.code.trim();
        const parts = code.split(':');
        const nextErrors = {};

        if (
            parts.length !== 2 ||
            parts[0].trim() === '' ||
            parts[1].trim() === '' ||
            /\s/.test(code) ||
            parts[0].length > 40 ||
            parts[1].length > 60
        ) {
            nextErrors.code = 'Format kode harus kurir:layanan, tanpa spasi.';
        } else if (rows.some((row) => courierKey(row).toLowerCase() === code.toLowerCase())) {
            nextErrors.code = 'Layanan sudah ada.';
        }
        if (manual.label.trim().length > 80) {
            nextErrors.label = 'Label layanan maksimal 80 karakter.';
        }
        setManualErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const [courierCode, serviceCode] = parts.map((part) => part.trim());
        const label = manual.label.trim();
        form.setData('couriers', [
            ...rows,
            {
                uid: `manual-${Date.now()}`,
                courier_code: courierCode,
                courier_name: courierCode,
                service_code: serviceCode,
                service_name: serviceCode,
                label: label === '' ? `${courierCode} ${serviceCode}`.toUpperCase() : label,
                is_regular: manual.regular,
                is_active: manual.active,
            },
        ]);
        setManual({ code: '', label: '', regular: true, active: true });
        setManualOpen(false);
    };

    const submit = (event) => {
        event.preventDefault();
        form.put('/admin/ekspedisi', {
            preserveScroll: true,
            onSuccess: () => {
                document.getElementById('shipping-save')?.focus();
            },
            onError: () => {
                const fields = Array.from(document.querySelectorAll('[aria-invalid="true"]'));
                const visible = fields.find((el) => el.offsetParent !== null);
                visible?.focus();
            },
        });
    };

    const reset = () => {
        form.reset();
        setManualErrors({});
        setManualOpen(false);
    };

    return (
        <AdminLayout auth={auth} title="Ekspedisi">
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Ekspedisi"
                    description="Atur asal kirim, layanan kurir, dan gratis ongkir."
                    breadcrumb={[{ label: 'Dashboard', href: '/admin' }, { label: 'Ekspedisi' }]}
                />

                <section className="card p-6" aria-live="polite">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <div className="flex items-center gap-3">
                            {mode === 'api' ? (
                                <StatusBadge status="selesai" label="API Biteship" />
                            ) : (
                                <StatusBadge status="pending" label="Tarif uji" />
                            )}
                            <span className="text-meta text-slate-600">
                                {keyTerisi ? 'Kunci Biteship terisi' : 'Kunci Biteship kosong'}
                            </span>
                        </div>
                        <p className="text-meta text-slate-500">
                            {sumber === 'settings'
                                ? 'Daftar dari pengaturan tersimpan; API belum tersedia.'
                                : 'Daftar layanan diambil dari Biteship.'}
                        </p>
                    </div>
                    {galat !== '' ? (
                        <InlineNotice tone="warning" title={galat} className="mt-4">
                            Data lama tetap bisa disimpan.
                        </InlineNotice>
                    ) : null}
                </section>

                <form onSubmit={submit} noValidate className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <SectionCard
                            title="Asal pengiriman"
                            description="Dipakai sebagai titik asal perhitungan ongkir Biteship."
                            className="lg:col-span-7"
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field
                                    label="Nama pengirim"
                                    htmlFor="shipping-origin-name"
                                    required
                                    error={err('shipping_origin_name')}
                                >
                                    <Input
                                        id="shipping-origin-name"
                                        value={form.data.shipping_origin_name}
                                        maxLength={100}
                                        disabled={form.processing}
                                        error={err('shipping_origin_name')}
                                        placeholder="Toko Kulot"
                                        onChange={(event) =>
                                            form.setData('shipping_origin_name', event.target.value)
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Nomor telepon pengirim"
                                    htmlFor="shipping-origin-phone"
                                    required
                                    error={err('shipping_origin_phone')}
                                >
                                    <Input
                                        id="shipping-origin-phone"
                                        type="tel"
                                        inputMode="tel"
                                        value={form.data.shipping_origin_phone}
                                        maxLength={30}
                                        disabled={form.processing}
                                        error={err('shipping_origin_phone')}
                                        onChange={(event) =>
                                            form.setData('shipping_origin_phone', event.target.value)
                                        }
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Alamat asal"
                                htmlFor="shipping-origin-address"
                                required
                                error={err('shipping_origin_address')}
                            >
                                <Textarea
                                    id="shipping-origin-address"
                                    value={form.data.shipping_origin_address}
                                    maxLength={500}
                                    disabled={form.processing}
                                    error={err('shipping_origin_address')}
                                    onChange={(event) =>
                                        form.setData('shipping_origin_address', event.target.value)
                                    }
                                />
                            </Field>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <Field
                                    label="Kode pos asal"
                                    htmlFor="shipping-origin-postal-code"
                                    required
                                    error={err('shipping_origin_postal_code')}
                                >
                                    <Input
                                        id="shipping-origin-postal-code"
                                        inputMode="numeric"
                                        value={form.data.shipping_origin_postal_code}
                                        maxLength={5}
                                        disabled={form.processing}
                                        error={err('shipping_origin_postal_code')}
                                        onChange={(event) =>
                                            form.setData(
                                                'shipping_origin_postal_code',
                                                event.target.value.replace(/\D/g, '').slice(0, 5)
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Tarif uji"
                                    htmlFor="shipping-cost-default"
                                    error={err('shipping_cost_default')}
                                    hint="Dipakai saat mode tarif uji atau API Biteship gagal."
                                    className="sm:col-span-2"
                                >
                                    <MoneyInput
                                        id="shipping-cost-default"
                                        value={form.data.shipping_cost_default}
                                        max={10000000}
                                        disabled={form.processing}
                                        error={err('shipping_cost_default')}
                                        onChange={(value) => form.setData('shipping_cost_default', value)}
                                    />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard title="Gratis ongkir" className="lg:col-span-5">
                            <label htmlFor="free-shipping-enabled" className="flex items-start gap-3">
                                <input
                                    id="free-shipping-enabled"
                                    type="checkbox"
                                    className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border-line accent-brand"
                                    checked={form.data.free_shipping_enabled}
                                    disabled={form.processing}
                                    onChange={(event) =>
                                        form.setData('free_shipping_enabled', event.target.checked)
                                    }
                                />
                                <span className="text-body text-ink">Aktifkan gratis ongkir</span>
                            </label>
                            {err('free_shipping_enabled') ? (
                                <p className="text-meta text-danger-strong" role="alert">
                                    {err('free_shipping_enabled')}
                                </p>
                            ) : null}

                            <Field
                                label="Minimal belanja"
                                htmlFor="free-shipping-min"
                                error={err('free_shipping_min')}
                                hint={
                                    form.data.free_shipping_enabled
                                        ? 'Dihitung dari subtotal sebelum ongkir.'
                                        : 'Gratis ongkir tidak aktif.'
                                }
                            >
                                <MoneyInput
                                    id="free-shipping-min"
                                    value={form.data.free_shipping_min}
                                    disabled={form.processing || !form.data.free_shipping_enabled}
                                    error={err('free_shipping_min')}
                                    onChange={(value) => form.setData('free_shipping_min', value)}
                                />
                            </Field>
                            <p className="text-meta text-slate-500">
                                Hanya untuk layanan reguler.
                            </p>

                            {form.data.free_shipping_enabled && asNumber(form.data.free_shipping_min, 0) === 0 ? (
                                <InlineNotice tone="warning">
                                    Semua pesanan dengan layanan reguler akan gratis ongkir.
                                </InlineNotice>
                            ) : null}
                            {form.data.free_shipping_enabled && activeRegular === 0 ? (
                                <InlineNotice tone="warning">
                                    Tidak ada layanan reguler aktif; gratis ongkir tidak akan pernah berlaku.
                                </InlineNotice>
                            ) : null}
                            {activeCount === 0 ? (
                                <InlineNotice tone="warning">
                                    Tidak ada layanan aktif; checkout akan menolak pengiriman.
                                </InlineNotice>
                            ) : null}
                        </SectionCard>
                    </div>

                    <SectionCard
                        title="Layanan kurir"
                        description={`${rows.length} layanan · ${activeCount} aktif`}
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder="Cari kurir atau layanan"
                                label="Cari kurir atau layanan"
                                className="sm:max-w-xs"
                            />
                            <Button
                                variant="secondary"
                                onClick={() => setManualOpen((open) => !open)}
                                aria-expanded={manualOpen}
                                disabled={form.processing}
                            >
                                Tambah kode manual
                            </Button>
                        </div>

                        {err('couriers') ? (
                            <p className="text-meta text-danger-strong" role="alert">
                                {err('couriers')}
                            </p>
                        ) : null}

                        {rows.length === 0 ? (
                            <EmptyState
                                icon={<TruckIcon size={72} />}
                                title="Belum ada layanan kurir."
                                description="Tambahkan kode layanan manual, lalu simpan."
                            />
                        ) : filteredRows.length === 0 ? (
                            <p className="py-8 text-center text-body text-slate-600">
                                Tidak ada layanan yang cocok.
                            </p>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full min-w-[720px] border-collapse text-left">
                                        <caption className="sr-only">Daftar layanan kurir</caption>
                                        <thead className="sticky top-0 z-10 bg-white">
                                            <tr className="border-b border-line text-meta text-slate-500">
                                                <th scope="col" className="py-3 pr-2 font-semibold">
                                                    Aktif
                                                </th>
                                                <th scope="col" className="px-2 py-3 font-semibold">
                                                    Kurir
                                                </th>
                                                <th scope="col" className="px-2 py-3 font-semibold">
                                                    Layanan
                                                </th>
                                                <th scope="col" className="px-2 py-3 font-semibold">
                                                    Label
                                                </th>
                                                <th scope="col" className="px-2 py-3 font-semibold">
                                                    Reguler
                                                </th>
                                                <th scope="col" className="py-3 pl-2 font-semibold">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRows.map((row) => {
                                                const index = rows.indexOf(row);
                                                const key = `${courierKey(row)}-${index}`;
                                                return (
                                                    <tr key={key} className="border-b border-line/70">
                                                        <td className="py-1 pr-2">
                                                            <CheckboxCell
                                                                id={`courier-${index}-active`}
                                                                checked={row.is_active}
                                                                disabled={form.processing}
                                                                label={`Aktifkan ${row.label || `${row.courier_name} ${row.service_name}`}`}
                                                                onChange={(checked) =>
                                                                    setCourier(index, { is_active: checked })
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <p className="text-body text-ink">{row.courier_name}</p>
                                                            <p className="text-meta text-slate-500">
                                                                {row.courier_code}
                                                            </p>
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <p className="text-body text-ink">{row.service_name}</p>
                                                            <p className="text-meta text-slate-500">
                                                                {row.service_code}
                                                            </p>
                                                        </td>
                                                        <td className="px-2 py-2 text-body text-ink">
                                                            {row.label || '-'}
                                                        </td>
                                                        <td className="px-2 py-1">
                                                            <CheckboxCell
                                                                id={`courier-${index}-regular`}
                                                                checked={row.is_regular}
                                                                disabled={form.processing}
                                                                label={`Reguler ${row.label || `${row.courier_name} ${row.service_name}`}`}
                                                                onChange={(checked) =>
                                                                    setCourier(index, { is_regular: checked })
                                                                }
                                                            />
                                                        </td>
                                                        <td className="py-2 pl-2">
                                                            <StatusBadge
                                                                status={row.is_active ? 'selesai' : null}
                                                                label={row.is_active ? 'Aktif' : 'Nonaktif'}
                                                            />
                                                            {courierRowError(index) ? (
                                                                <p
                                                                    className="mt-1 text-meta text-danger-strong"
                                                                    role="alert"
                                                                >
                                                                    {courierRowError(index)}
                                                                </p>
                                                            ) : null}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <ul className="flex flex-col gap-3 lg:hidden">
                                    {filteredRows.map((row) => {
                                        const index = rows.indexOf(row);
                                        const key = `mobile-${courierKey(row)}-${index}`;
                                        return (
                                            <li key={key} className="rounded-md border border-line p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-body text-ink">{row.courier_name}</p>
                                                        <p className="text-meta text-slate-500">
                                                            {row.courier_code} · {row.service_name} ({row.service_code})
                                                        </p>
                                                        <p className="mt-1 text-body text-ink">{row.label || '-'}</p>
                                                    </div>
                                                    <StatusBadge
                                                        status={row.is_active ? 'selesai' : null}
                                                        label={row.is_active ? 'Aktif' : 'Nonaktif'}
                                                    />
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-4">
                                                    <label
                                                        htmlFor={`courier-mobile-${index}-active`}
                                                        className="flex min-h-touch items-center gap-2 text-meta text-ink"
                                                    >
                                                        <input
                                                            id={`courier-mobile-${index}-active`}
                                                            type="checkbox"
                                                            className="h-5 w-5 rounded-sm border-line accent-brand"
                                                            checked={row.is_active}
                                                            disabled={form.processing}
                                                            onChange={(event) =>
                                                                setCourier(index, { is_active: event.target.checked })
                                                            }
                                                        />
                                                        Aktif
                                                    </label>
                                                    <label
                                                        htmlFor={`courier-mobile-${index}-regular`}
                                                        className="flex min-h-touch items-center gap-2 text-meta text-ink"
                                                    >
                                                        <input
                                                            id={`courier-mobile-${index}-regular`}
                                                            type="checkbox"
                                                            className="h-5 w-5 rounded-sm border-line accent-brand"
                                                            checked={row.is_regular}
                                                            disabled={form.processing}
                                                            onChange={(event) =>
                                                                setCourier(index, { is_regular: event.target.checked })
                                                            }
                                                        />
                                                        Reguler
                                                    </label>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}

                        {manualOpen ? (
                            <div className="rounded-md border border-line bg-surface/60 p-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Kode layanan"
                                        htmlFor="manual-code"
                                        required
                                        error={manualErrors.code ?? err('couriers')}
                                        hint="Format courier_code:service_code, contoh jne:reg."
                                    >
                                        <Input
                                            id="manual-code"
                                            value={manual.code}
                                            placeholder="jne:reg"
                                            maxLength={101}
                                            error={manualErrors.code}
                                            onChange={(event) => {
                                                setManual({ ...manual, code: event.target.value });
                                                setManualErrors({ ...manualErrors, code: undefined });
                                            }}
                                        />
                                    </Field>
                                    <Field
                                        label="Label"
                                        htmlFor="manual-label"
                                        error={manualErrors.label}
                                        hint="Boleh kosong; kode ditampilkan uppercase."
                                    >
                                        <Input
                                            id="manual-label"
                                            value={manual.label}
                                            maxLength={80}
                                            error={manualErrors.label}
                                            onChange={(event) =>
                                                setManual({ ...manual, label: event.target.value })
                                            }
                                        />
                                    </Field>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-5">
                                    <label
                                        htmlFor="manual-regular"
                                        className="flex min-h-touch items-center gap-2 text-meta text-ink"
                                    >
                                        <input
                                            id="manual-regular"
                                            type="checkbox"
                                            className="h-5 w-5 rounded-sm border-line accent-brand"
                                            checked={manual.regular}
                                            onChange={(event) =>
                                                setManual({ ...manual, regular: event.target.checked })
                                            }
                                        />
                                        Reguler
                                    </label>
                                    <label
                                        htmlFor="manual-active"
                                        className="flex min-h-touch items-center gap-2 text-meta text-ink"
                                    >
                                        <input
                                            id="manual-active"
                                            type="checkbox"
                                            className="h-5 w-5 rounded-sm border-line accent-brand"
                                            checked={manual.active}
                                            onChange={(event) =>
                                                setManual({ ...manual, active: event.target.checked })
                                            }
                                        />
                                        Aktif
                                    </label>
                                </div>
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <Button onClick={addManual}>Tambahkan</Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setManualOpen(false);
                                            setManualErrors({});
                                        }}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        ) : null}

                        <p className="text-meta text-slate-500">
                            Layanan nonaktif tetap tersimpan dan tidak tampil di checkout.
                        </p>
                    </SectionCard>

                    <StickySave dirty={form.isDirty} processing={form.processing} onReset={reset} />
                </form>

                {toast ? (
                    <div className="fixed inset-x-0 bottom-4 z-toast flex justify-center px-4">
                        <Toast tone={toast.tone} message={toast.message} onClose={() => setToast(null)} />
                    </div>
                ) : null}
            </div>
        </AdminLayout>
    );
}
