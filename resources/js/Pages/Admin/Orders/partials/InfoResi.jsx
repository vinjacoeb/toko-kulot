import React, { useEffect, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import Badge from '../../../../Components/Badge';
import Button from '../../../../Components/Button';
import Field from '../../../../Components/Field';
import InlineNotice from '../../../../Components/InlineNotice';
import Input from '../../../../Components/Input';
import SalinButton from '../../../../Components/SalinButton';
import StatusBadge from '../../../../Components/StatusBadge';
import { formatDateTime, rupiah } from '../../../../lib/format';

/**
 * Panel pengiriman admin — design-v1.2 §7.3, kontrak props §12.17.
 *
 * - Ringkasan kurir/layanan/ETD/berat/ongkir dari `pesanan.shipping` (selalu ada, field kosong
 *   `null`).
 * - `shipping.galat` terisi = tombol `Buat resi otomatis` tidak boleh tampil; alasannya dari server.
 * - Tombol otomatis `POST /admin/pesanan/{order}/resi` (name `admin.orders.resi-otomatis`, tanpa
 *   body, idempoten di server lewat `biteship_order_id`); klik ganda ditahan `processing`.
 * - Manual `PATCH /admin/pesanan/{order}/resi` (`tracking_number`, maks 60, kosong = hapus).
 * - Galat flash aksi otomatis tampil sebagai notice di panel ini dan dilaporkan lewat
 *   `onHasilAksi` supaya layout tidak menampilkan toast untuk pesan yang sama.
 */

const BATAS_RESI = 60;
const ID_INPUT = 'resi-pesanan';

const asText = (nilai) => (nilai === null || nilai === undefined ? '' : String(nilai));

const isi = (nilai) => (asText(nilai) === '' ? '—' : asText(nilai));

const gram = (nilai) => {
    const angka = Number(nilai);

    return asText(nilai) === '' || !Number.isFinite(angka) ? '—' : `${angka} gram`;
};

// design-v1.3 §1: tanda eksplisit + / - di depan rupiah; nilai 0 / null tidak dirender.
const selisih = (nilai) => {
    if (nilai === null || nilai === undefined || nilai === '') {
        return null;
    }

    const angka = Number(nilai);
    const teks = rupiah(Math.abs(angka));

    if (!Number.isFinite(angka) || angka === 0 || teks === null) {
        return null;
    }

    return `${angka > 0 ? '+' : '-'}${teks}`;
};

const baris = (label, nilai, kunci) => (
    <div
        key={kunci}
        className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0"
    >
        <dt className="text-body text-ink-soft">{label}</dt>
        <dd className="min-w-0 break-words text-right text-body text-ink tabular-nums">{nilai}</dd>
    </div>
);

export default function InfoResi({ pesanan = null, onHasilAksi = null }) {
    const id = pesanan?.id ?? null;
    const shipping = pesanan?.shipping ?? null;
    const tersimpan = asText(shipping?.tracking_number ?? pesanan?.tracking_number);
    const galat = usePage().props.errors?.tracking_number ?? null;

    // design-v1.3 §1 — field kosong tidak dirender sebagai baris "—"; absen berarti "belum ada data".
    const driver = shipping?.driver ?? null;
    const namaDriver = asText(driver?.name);
    const teleponDriver = asText(driver?.phone);
    const ongkirAktual = rupiah(shipping?.price_final);
    const selisihOngkir = selisih(shipping?.price_selisih);
    const diperbarui = asText(shipping?.updated_at);
    const perluTindakan = shipping?.perlu_tindakan === true;
    const tindakan = asText(shipping?.tindakan);
    const payload = shipping?.webhook_terakhir ?? null;

    const otomatis = useForm({});
    const [nilai, setNilai] = useState(tersimpan);
    const [proses, setProses] = useState(false);
    const [hasilOtomatis, setHasilOtomatis] = useState(null);

    useEffect(() => {
        setNilai(asText(shipping?.tracking_number ?? pesanan?.tracking_number));
    }, [pesanan?.id, shipping?.tracking_number, pesanan?.tracking_number]);

    if (id === null) {
        return null;
    }

    const punyaResiOtomatis = asText(shipping?.biteship_order_id) !== '';
    const galatOtomatis = asText(shipping?.galat);
    // Design §7.3: tombol otomatis hanya untuk pesanan berstatus dibayar/dikirim. Guard server
    // tetap ada; klien hanya tidak merender aksi yang pasti ditolak.
    const bolehOtomatis = ['dibayar', 'dikirim'].includes(asText(pesanan?.status));

    const buatOtomatis = () => {
        if (otomatis.processing) {
            return;
        }

        setHasilOtomatis(null);

        otomatis.post(`/admin/pesanan/${encodeURIComponent(id)}/resi`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (halaman) => {
                const flashHalaman = halaman?.props?.flash ?? {};
                const sukses = asText(flashHalaman.success);
                const pesanGalat = asText(flashHalaman.error);

                if (pesanGalat !== '') {
                    setHasilOtomatis(pesanGalat);
                    onHasilAksi?.(`${sukses}|${pesanGalat}`);
                }
            },
        });
    };

    const simpanManual = (event) => {
        event.preventDefault();

        if (proses) {
            return;
        }

        router.patch(
            `/admin/pesanan/${encodeURIComponent(id)}/resi`,
            { tracking_number: nilai },
            {
                preserveScroll: true,
                onStart: () => setProses(true),
                onFinish: () => setProses(false),
            },
        );
    };

    return (
        <div className="flex flex-col gap-5">
            {perluTindakan && (
                <InlineNotice tone="warning" title="Perlu tindakan">
                    {tindakan !== '' ? tindakan : 'Periksa status pengiriman pesanan ini.'}
                </InlineNotice>
            )}

            <dl className="flex flex-col">
                {baris(
                    'Kurir',
                    <>
                        {isi(shipping?.courier_name)}
                        {asText(shipping?.service_name) !== '' && (
                            <span className="text-ink-soft"> · {asText(shipping.service_name)}</span>
                        )}
                    </>,
                    'kurir',
                )}
                {baris('ETD', isi(shipping?.etd), 'etd')}
                {baris('Berat', gram(shipping?.weight_gram), 'berat')}
                {baris('Ongkir', rupiah(shipping?.shipping_cost) ?? '—', 'ongkir')}
                {namaDriver !== '' &&
                    baris(
                        'Petugas kurir',
                        <div className="flex flex-col items-end">
                            <span className="text-ink">{namaDriver}</span>
                            {teleponDriver !== '' && (
                                <span className="text-meta tabular-nums">{teleponDriver}</span>
                            )}
                        </div>,
                        'petugas-kurir',
                    )}
                {baris(
                    'Nomor resi',
                    tersimpan === '' ? (
                        'Belum ada resi.'
                    ) : (
                        <SalinButton
                            value={tersimpan}
                            ariaLabel="Salin nomor resi"
                            className="justify-end"
                            valueClassName="font-mono tabular-nums"
                        >
                            {tersimpan}
                        </SalinButton>
                    ),
                    'resi',
                )}
                {baris(
                    'Status Biteship',
                    asText(shipping?.status_label) === '' ? (
                        'Belum ada status.'
                    ) : (
                        <StatusBadge
                            status={shipping.status}
                            label={asText(shipping.status_label)}
                        />
                    ),
                    'status',
                )}
                {ongkirAktual !== null && baris('Ongkir aktual', ongkirAktual, 'ongkir-aktual')}
                {selisihOngkir !== null &&
                    baris(
                        'Selisih ongkir',
                        <div className="flex flex-col items-end">
                            <span className="text-ink">{selisihOngkir}</span>
                            <span className="text-meta text-slate-600">
                                Ongkir aktual berbeda dari ongkir tagihan.
                            </span>
                        </div>,
                        'selisih-ongkir',
                    )}
                {diperbarui !== '' && baris('Diperbarui', formatDateTime(diperbarui), 'diperbarui')}
            </dl>

            {payload === null ? (
                <p className="text-meta text-slate-600">Belum ada payload webhook.</p>
            ) : (
                <details>
                    <summary className="cursor-pointer text-meta text-brand underline underline-offset-4">
                        Lihat payload webhook
                    </summary>
                    <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-slate-50 p-4 font-mono text-meta break-all whitespace-pre-wrap">
                        {JSON.stringify(payload, null, 2)}
                    </pre>
                </details>
            )}

            {bolehOtomatis && !punyaResiOtomatis && (
                <div>
                    <Button
                        variant="secondary"
                        className="min-w-[16rem]"
                        loading={otomatis.processing}
                        loadingLabel="Membuat resi…"
                        onClick={buatOtomatis}
                    >
                        Buat resi otomatis
                    </Button>
                </div>
            )}

            {punyaResiOtomatis && (
                <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="success">Resi otomatis sudah dibuat.</Badge>
                    <span className="font-mono text-meta text-slate-600 tabular-nums">
                        {asText(shipping.biteship_order_id)}
                    </span>
                </div>
            )}

            {galatOtomatis !== '' && <InlineNotice tone="warning">{galatOtomatis}</InlineNotice>}

            {hasilOtomatis !== null && <InlineNotice tone="error">{hasilOtomatis}</InlineNotice>}

            <form className="flex flex-col gap-4" onSubmit={simpanManual} noValidate>
                <Field
                    label="Nomor resi manual"
                    htmlFor={ID_INPUT}
                    hint="Isi nomor resi dari ekspedisi setelah paket dikirim. Kosongkan untuk menghapus."
                    error={galat}
                >
                    <Input
                        id={ID_INPUT}
                        name="tracking_number"
                        type="text"
                        maxLength={BATAS_RESI}
                        autoComplete="off"
                        value={nilai}
                        error={galat}
                        onChange={(event) => setNilai(event.target.value)}
                    />
                </Field>

                <div>
                    <Button variant="primary" type="submit" loading={proses}>
                        Simpan resi
                    </Button>
                </div>
            </form>
        </div>
    );
}
