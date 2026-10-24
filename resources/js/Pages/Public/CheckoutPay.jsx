import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Badge from '../../Components/Badge';
import Breadcrumb from '../../Components/Breadcrumb';
import Button from '../../Components/Button';
import InlineNotice from '../../Components/InlineNotice';
import OrderSummary from '../../Components/OrderSummary';
import SalinButton from '../../Components/SalinButton';
import Skeleton from '../../Components/Skeleton';
import Spinner from '../../Components/Spinner';
import StatusBadge from '../../Components/StatusBadge';
import { CheckIcon } from '../../Components/icons';
import { cn, formatDateTime, rupiah } from '../../lib/format';
import { useDocumentVisible } from '../../lib/hooks';

/**
 * Halaman bayar publik — design §6; kontrak §7.7.
 * Tanpa Snap: kanal dipilih di halaman ini, tagihan dibuat setelah POST metode,
 * lalu instruksi dibaca dari `pembayaran.instruksi`. Status dipantau 3 detik
 * sekali selama tab terlihat dan berhenti saat status final/kedaluwarsa.
 */

const STATUS_BAYAR = ['pending', 'settlement', 'expire', 'deny', 'cancel'];

const BADGE_BAYAR = {
    pending: ['pending', 'Menunggu pembayaran'],
    settlement: ['dibayar', 'Dibayar'],
    expire: ['expire', 'Kedaluwarsa'],
    deny: ['batal', 'Gagal'],
    cancel: ['batal', 'Dibatalkan'],
};

const LABEL_GRUP = {
    qris: 'QRIS',
    va: 'Transfer bank',
    bill: 'Mandiri Bill',
    gerai: 'Gerai',
};

// Penanda reload instruksi per tagihan+metode (maks 2 percobaan).
const percobaanMuat = new Map();

function teks(nilai) {
    return typeof nilai === 'string' && nilai.trim() !== '' ? nilai.trim() : null;
}

function statusSah(nilai) {
    return STATUS_BAYAR.includes(nilai) ? nilai : 'pending';
}

function sisaDari(iso) {
    if (!iso) return null;
    const waktu = new Date(iso).getTime();
    if (!Number.isFinite(waktu)) return null;
    return Math.max(0, waktu - Date.now());
}

function formatSisa(ms) {
    if (ms === null) return null;
    const totalDetik = Math.ceil(ms / 1000);
    const menit = Math.floor(totalDetik / 60);
    const detik = totalDetik % 60;
    return `${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`;
}

export default function CheckoutPay({ pesanan = null, pembayaran = null, flash = null }) {
    const orderId = pesanan?.id ?? null;
    const metode = pembayaran?.metode ?? null;
    const instruksi = pembayaran?.instruksi ?? null;
    const kanal = Array.isArray(pembayaran?.kanal) ? pembayaran.kanal : [];
    const status = statusSah(pembayaran?.status ?? pesanan?.payment_status);
    const badge = BADGE_BAYAR[status] ?? BADGE_BAYAR.pending;
    const fake = pembayaran?.fake === true;
    const total = rupiah(pembayaran?.gross_amount ?? pesanan?.total ?? null) ?? '-';
    const kode = pesanan?.code ?? '-';
    const diskon = Number(pesanan?.discount ?? 0);
    const galatServer = teks(pembayaran?.galat);
    const flashError = teks(flash?.error);
    const flashSuccess = teks(flash?.success);

    const [pilihUlang, setPilihUlang] = useState(false);
    const [memilih, setMemilih] = useState(false);
    const [pilihanKirim, setPilihanKirim] = useState(null);
    const [galatLokal, setGalatLokal] = useState(null);
    const [statusLokal, setStatusLokal] = useState(status);
    const [paidAt, setPaidAt] = useState(pembayaran?.paid_at ?? null);
    const [expiresAt, setExpiresAt] = useState(pembayaran?.expires_at ?? null);
    const [sisa, setSisa] = useState(() => sisaDari(pembayaran?.expires_at));
    const [gagalPoll, setGagalPoll] = useState(0);
    const [memeriksa, setMemeriksa] = useState(false);
    const [konfirmasiLewat, setKonfirmasiLewat] = useState(false);
    const [batalPindah, setBatalPindah] = useState(false);
    const [qrGagal, setQrGagal] = useState(false);
    const [simulasi, setSimulasi] = useState(false);
    const [konfirmasiSimulasi, setKonfirmasiSimulasi] = useState(false);
    const [instruksiGagal, setInstruksiGagal] = useState(false);

    const berubah = useRef(false);
    const permintaan = useRef(null);
    const judulRef = useRef(null);
    const pemilihRef = useRef(null);
    const metodeLalu = useRef(metode?.id ?? null);
    const instruksiLalu = useRef(instruksi?.jenis ?? null);
    const terlihat = useDocumentVisible();
    const terlihatLalu = useRef(terlihat);

    const galatAksi = galatServer ?? flashError ?? galatLokal;

    useEffect(() => {
        setStatusLokal(status);
        setPaidAt(pembayaran?.paid_at ?? null);
        setExpiresAt(pembayaran?.expires_at ?? null);
        setSisa(sisaDari(pembayaran?.expires_at));
        setKonfirmasiLewat(false);
        setPilihUlang(false);
        berubah.current = false;
    }, [status, pembayaran?.paid_at, pembayaran?.expires_at]);

    useEffect(() => {
        if (!expiresAt) {
            setSisa(null);
            return undefined;
        }
        const detak = () => setSisa(sisaDari(expiresAt));
        detak();
        const id = window.setInterval(detak, 1000);
        return () => window.clearInterval(id);
    }, [expiresAt]);

    useEffect(() => {
        setQrGagal(false);
    }, [instruksi?.qr_url]);

    useEffect(() => {
        setInstruksiGagal(false);
        setKonfirmasiSimulasi(false);
    }, [orderId, metode?.id, instruksi?.jenis]);

    useEffect(() => {
        if (instruksi && orderId) percobaanMuat.delete(`${orderId}:${metode?.id ?? ''}`);
    }, [instruksi, orderId, metode?.id]);

    const kedaluwarsa = statusLokal === 'expire' || (statusLokal === 'pending' && sisa !== null && sisa <= 0);
    const finalGagal = statusLokal === 'deny' || statusLokal === 'cancel';
    const perluInstruksi = Boolean(metode) && !instruksi && statusLokal === 'pending' && !pilihUlang && !kedaluwarsa;

    let panel = 'pemilih';
    if (statusLokal === 'settlement') panel = 'lunas';
    else if (kedaluwarsa) panel = 'kedaluwarsa';
    else if (pilihUlang) panel = 'pemilih';
    else if (finalGagal) panel = 'gagal';
    else if (!metode) panel = 'pemilih';
    else if (!instruksi) panel = 'menyiapkan';
    else panel = 'instruksi';

    const pengumuman =
        panel === 'menyiapkan'
            ? 'Menyiapkan instruksi pembayaran.'
            : panel === 'kedaluwarsa'
              ? 'Tagihan kedaluwarsa.'
              : panel === 'lunas'
                ? 'Pembayaran diterima.'
                : panel === 'gagal'
                  ? 'Pembayaran gagal atau dibatalkan.'
                  : gagalPoll >= 3
                    ? 'Status belum diperbarui.'
                    : '';

    const cekStatus = useCallback(async () => {
        if (!orderId || berubah.current || permintaan.current) return;
        const kontrol = new AbortController();
        permintaan.current = kontrol;
        try {
            const res = await fetch(`/checkout/${orderId}/status`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
                signal: kontrol.signal,
            });
            if (!res.ok) throw new Error('status');
            const data = await res.json();
            const baru = statusSah(data?.status);
            setGagalPoll(0);
            if (data?.paid_at) setPaidAt(data.paid_at);
            if (data?.expires_at) setExpiresAt(data.expires_at);
            if (baru !== statusLokal) {
                berubah.current = true;
                if (baru === 'settlement') {
                    setStatusLokal('settlement');
                    setPaidAt(data?.paid_at ?? paidAt);
                    window.setTimeout(() => {
                        berubah.current = false;
                    }, 10000);
                } else {
                    router.reload({
                        preserveScroll: true,
                        preserveState: false,
                        onFinish: () =>
                            window.setTimeout(() => {
                                berubah.current = false;
                            }, 10000),
                    });
                }
            }
        } catch (error) {
            if (error?.name !== 'AbortError') setGagalPoll((n) => n + 1);
        } finally {
            if (permintaan.current === kontrol) permintaan.current = null;
        }
    }, [orderId, statusLokal, paidAt]);

    useEffect(() => {
        if (!orderId || !metode || statusLokal !== 'pending' || !terlihat || kedaluwarsa) return undefined;
        const id = window.setInterval(() => cekStatus(), 3000);
        return () => window.clearInterval(id);
    }, [orderId, metode, statusLokal, terlihat, kedaluwarsa, cekStatus]);

    useEffect(() => {
        const kembali = terlihat && !terlihatLalu.current;
        terlihatLalu.current = terlihat;
        if (kembali && orderId && metode && statusLokal === 'pending' && !kedaluwarsa) cekStatus();
    }, [terlihat, orderId, metode, statusLokal, kedaluwarsa, cekStatus]);

    useEffect(() => {
        if (!(statusLokal === 'pending' && sisa === 0 && expiresAt)) return undefined;
        const id = window.setTimeout(() => setKonfirmasiLewat(true), 30000);
        cekStatus();
        return () => window.clearTimeout(id);
    }, [statusLokal, sisa, expiresAt, cekStatus]);

    useEffect(() => {
        const jenisSekarang = instruksi?.jenis ?? null;
        const baruPilih = Boolean(metode?.id) && metode.id !== metodeLalu.current;
        const baruSiap = Boolean(jenisSekarang) && jenisSekarang !== instruksiLalu.current;
        if (baruPilih || baruSiap) judulRef.current?.focus();
        metodeLalu.current = metode?.id ?? null;
        instruksiLalu.current = jenisSekarang;
    }, [metode?.id, instruksi?.jenis]);

    useEffect(() => {
        if (pilihUlang) pemilihRef.current?.focus();
    }, [pilihUlang]);

    useEffect(() => {
        if (!orderId || !perluInstruksi) return undefined;
        const kunci = `${orderId}:${metode?.id ?? ''}`;
        const sudah = percobaanMuat.get(kunci) ?? 0;
        if (sudah >= 2) {
            setInstruksiGagal(true);
            return undefined;
        }
        const id = window.setTimeout(
            () => {
                percobaanMuat.set(kunci, sudah + 1);
                router.reload({ preserveScroll: true });
            },
            sudah === 0 ? 1000 : 3000,
        );
        return () => window.clearTimeout(id);
    }, [orderId, perluInstruksi, metode?.id]);

    useEffect(() => {
        if (panel !== 'lunas' || !terlihat || batalPindah || !orderId) return undefined;
        const id = window.setTimeout(() => router.visit(`/checkout/${orderId}/selesai`), 5000);
        return () => window.clearTimeout(id);
    }, [panel, terlihat, batalPindah, orderId]);

    useEffect(
        () => () => {
            permintaan.current?.abort();
            permintaan.current = null;
        },
        [],
    );

    const pilihKanal = (id) => {
        if (!orderId || memilih || statusLokal !== 'pending' || typeof id !== 'string') return;
        setMemilih(true);
        setPilihanKirim(id);
        setGalatLokal(null);
        router.post(
            `/checkout/${orderId}/bayar/metode`,
            { metode: id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPilihUlang(false);
                    setPilihanKirim(null);
                },
                onError: (errors) => setGalatLokal(teks(errors?.metode) ?? 'Gagal membuat pembayaran. Coba lagi.'),
                onFinish: () => {
                    setMemilih(false);
                    setPilihanKirim(null);
                },
            },
        );
    };

    const cekManual = async () => {
        if (memeriksa) return;
        setMemeriksa(true);
        berubah.current = false;
        try {
            await cekStatus();
        } finally {
            setMemeriksa(false);
        }
    };

    const tandaiLunas = () => {
        if (!orderId || simulasi) return;
        setSimulasi(true);
        setGalatLokal(null);
        router.post(`/checkout/${orderId}/simulasi-bayar`, {}, {
            preserveScroll: true,
            onSuccess: () => setKonfirmasiSimulasi(false),
            onError: (errors) => setGalatLokal(teks(errors?.metode) ?? 'Gagal menandai lunas. Coba lagi.'),
            onFinish: () => setSimulasi(false),
        });
    };

    const grupKanal = [];
    const petaGrup = new Map();
    kanal.forEach((item) => {
        if (!item?.id) return;
        const grup = item.grup ?? '';
        if (!petaGrup.has(grup)) {
            petaGrup.set(grup, []);
            grupKanal.push(grup);
        }
        petaGrup.get(grup).push(item);
    });

    const nomorVa = String(instruksi?.nomor_va ?? '').replace(/\s+/g, '');
    const vaTampil = nomorVa.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ') || '-';
    const qrString = String(instruksi?.qr_string ?? '').trim();
    const biller = instruksi?.biller_code ?? '-';
    const billKey = instruksi?.bill_key ?? '-';
    const kodeBayar = instruksi?.payment_code ?? '-';
    const gerai = instruksi?.store ?? '-';

    const baris = (label, nilai, kelas = '') => (
        <div className={cn('flex items-baseline justify-between gap-4', kelas)}>
            <dt className="text-body text-ink-soft">{label}</dt>
            <dd className="text-right text-body text-ink tabular-nums">{nilai ?? '-'}</dd>
        </div>
    );

    const renderPemilih = () => (
        <section className="card p-6" aria-labelledby="pilih-metode">
            <fieldset
                ref={pemilihRef}
                tabIndex={-1}
                disabled={memilih}
                aria-busy={memilih || undefined}
                aria-describedby="pilih-metode-helper"
                className="min-w-0 border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
                <legend id="pilih-metode" className="text-h3 text-ink">
                    Pilih metode pembayaran
                </legend>
                <p id="pilih-metode-helper" className="mt-2 text-meta text-ink-soft">
                    Tagihan dibuat setelah kamu memilih kanal.
                </p>

                {grupKanal.length === 0 ? (
                    <InlineNotice tone="warning" className="mt-5">
                        Metode pembayaran belum tersedia. Muat ulang halaman lalu coba lagi.
                    </InlineNotice>
                ) : (
                    <div className="mt-5 flex flex-col gap-5">
                        {grupKanal.map((grup) => (
                            <div key={grup || 'lain'}>
                                {grup ? (
                                    <p className="mb-2 text-badge uppercase text-ink-soft">
                                        {LABEL_GRUP[grup] ?? grup}
                                    </p>
                                ) : null}
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    {petaGrup.get(grup).map((item) => {
                                        const terpilih = (pilihanKirim ?? metode?.id ?? null) === item.id;
                                        return (
                                            <label
                                                key={item.id}
                                                className={cn(
                                                    'flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2',
                                                    terpilih ? 'border-brand bg-brand-100/40' : 'border-line hover:bg-surface',
                                                    memilih && !terpilih && 'cursor-not-allowed opacity-60',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="metode"
                                                    value={item.id}
                                                    checked={terpilih}
                                                    onChange={() => pilihKanal(item.id)}
                                                    disabled={memilih}
                                                    className="sr-only"
                                                />
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                                        terpilih ? 'border-brand bg-brand text-white' : 'border-line bg-white',
                                                    )}
                                                >
                                                    {terpilih ? <CheckIcon size={14} /> : null}
                                                </span>
                                                <span className="min-w-0 flex-1 text-body text-ink">{item.label ?? item.id}</span>
                                                {terpilih && memilih ? <Spinner size={16} label="Memilih metode" /> : null}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </fieldset>
        </section>
    );

    const renderMenyiapkan = () => (
        <section className="card p-6" aria-busy="true">
            <h2 id="selesaikan" ref={judulRef} tabIndex={-1} className="text-h3 text-ink">
                Menyiapkan instruksi pembayaran…
            </h2>
            {instruksiGagal ? (
                <InlineNotice tone="warning" title="Instruksi belum tersedia." className="mt-5">
                    <p>Kanal sudah dipilih, tetapi instruksi belum diterima.</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => router.reload({ preserveScroll: true })}
                    >
                        Muat ulang
                    </Button>
                </InlineNotice>
            ) : (
                <div className="mt-5 flex flex-col gap-3" aria-hidden="true">
                    <Skeleton variant="title" />
                    <Skeleton count={3} />
                    <Skeleton variant="row" />
                </div>
            )}
        </section>
    );

    const renderInstruksi = () => {
        const bank = instruksi?.bank ?? '-';
        const jenis = instruksi?.jenis;

        return (
            <section className="card p-6" aria-labelledby="selesaikan">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 id="selesaikan" ref={judulRef} tabIndex={-1} className="text-h3 text-ink">
                            Selesaikan pembayaran
                        </h2>
                        <p className="mt-2 text-meta text-ink-soft">
                            Metode: {metode?.label ?? '-'}
                            {statusLokal === 'pending' ? (
                                <>
                                    {' · '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPilihUlang(true);
                                            setGalatLokal(null);
                                        }}
                                        className="min-h-touch underline underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                                    >
                                        Ganti metode
                                    </button>
                                </>
                            ) : null}
                        </p>
                    </div>
                    {sisa !== null ? (
                        <span
                            className={cn(
                                'inline-flex min-h-8 items-center rounded-full px-3 text-meta font-semibold tabular-nums',
                                sisa <= 300000 ? 'bg-warning/10 text-warning-strong' : 'bg-surface text-ink',
                            )}
                        >
                            {sisa > 0 ? formatSisa(sisa) : 'Waktu habis'}
                        </span>
                    ) : null}
                </div>

                <div className="mt-5 border-t border-line pt-5">
                    <p className="text-meta text-ink-soft">Total pembayaran</p>
                    <p className="mt-1 text-h2 font-bold tabular-nums whitespace-nowrap text-ink">{total}</p>
                </div>

                {jenis === 'va' ? (
                    <>
                        <dl className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
                            {baris('Bank', bank)}
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-body text-ink-soft">Nomor Virtual Account</dt>
                                <dd className="min-w-0 text-right">
                                    <SalinButton
                                        value={nomorVa}
                                        ariaLabel={`Salin nomor virtual account ${bank}`}
                                        className="justify-end"
                                        valueClassName="font-mono tabular-nums"
                                    >
                                        {vaTampil}
                                    </SalinButton>
                                </dd>
                            </div>
                            {baris('Total', <span className="whitespace-nowrap">{total}</span>)}
                        </dl>
                        <ol className="mt-5 list-decimal space-y-2 pl-5 text-body text-ink-soft">
                            <li>Buka aplikasi m-banking {bank}.</li>
                            <li>Pilih Transfer → Virtual Account.</li>
                            <li>
                                Masukkan nomor <span className="font-mono tabular-nums text-ink">{vaTampil}</span> dan
                                nominal <span className="font-semibold tabular-nums text-ink">{total}</span>.
                            </li>
                            <li>Selesaikan transaksi; status berubah otomatis.</li>
                        </ol>
                        <p className="mt-4 text-meta text-ink-soft">Nominal harus sama persis agar pembayaran dikenali.</p>
                    </>
                ) : null}

                {jenis === 'qris' ? (
                    <>
                        {instruksi?.qr_url && !qrGagal ? (
                            <img
                                src={instruksi.qr_url}
                                alt={`Kode QRIS pembayaran ${kode}`}
                                width="240"
                                height="240"
                                loading="eager"
                                onError={() => setQrGagal(true)}
                                className="mx-auto mt-5 h-qr w-qr object-contain"
                            />
                        ) : (
                            <div className="mt-5 rounded-lg border border-line bg-white p-4">
                                <SalinButton
                                    value={qrString}
                                    ariaLabel="Salin kode QRIS"
                                    className="flex-col items-start"
                                    valueClassName="w-full break-all font-mono text-meta text-ink"
                                >
                                    {qrString || '-'}
                                </SalinButton>
                                <p className="mt-2 text-meta text-ink-soft">
                                    {instruksi?.qr_url
                                        ? 'Kode QR gagal dimuat. Gunakan kode teks ini.'
                                        : 'Mode uji: kode QR tidak tersedia, gunakan kode teks ini.'}
                                </p>
                            </div>
                        )}
                        <dl className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
                            {baris('Total', <span className="whitespace-nowrap">{total}</span>)}
                            {baris('Berlaku sampai', formatDateTime(expiresAt) ?? '-')}
                        </dl>
                        <ol className="mt-5 list-decimal space-y-2 pl-5 text-body text-ink-soft">
                            <li>Buka aplikasi pembayaran yang mendukung QRIS (GoPay, OVO, DANA, m-banking).</li>
                            <li>Pindai kode QR.</li>
                            <li>Periksa nama toko dan nominal.</li>
                            <li>Selesaikan pembayaran.</li>
                        </ol>
                        <p className="mt-4 text-meta text-ink-soft">Jangan bagikan kode QR ini kepada siapa pun.</p>
                    </>
                ) : null}

                {jenis === 'bill' ? (
                    <>
                        <dl className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-body text-ink-soft">Biller Code</dt>
                                <dd className="min-w-0 text-right">
                                    <SalinButton
                                        value={String(biller)}
                                        ariaLabel="Salin Biller Code"
                                        className="justify-end"
                                        valueClassName="font-mono tabular-nums"
                                    >
                                        {biller}
                                    </SalinButton>
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-body text-ink-soft">Bill Key</dt>
                                <dd className="min-w-0 text-right">
                                    <SalinButton
                                        value={String(billKey)}
                                        ariaLabel="Salin Bill Key"
                                        className="justify-end"
                                        valueClassName="font-mono tabular-nums"
                                    >
                                        {billKey}
                                    </SalinButton>
                                </dd>
                            </div>
                            {baris('Total', <span className="whitespace-nowrap">{total}</span>)}
                        </dl>
                        <ol className="mt-5 list-decimal space-y-2 pl-5 text-body text-ink-soft">
                            <li>Buka Mandiri Online / ATM Mandiri.</li>
                            <li>Pilih Bayar → Multipayment.</li>
                            <li>Masukkan kode perusahaan {biller}.</li>
                            <li>Masukkan Bill Key {billKey} dan nominal {total}.</li>
                        </ol>
                    </>
                ) : null}

                {jenis === 'gerai' ? (
                    <>
                        <div className="mt-5 border-t border-line pt-5">
                            <p className="text-meta text-ink-soft">Kode pembayaran</p>
                            <SalinButton
                                value={String(kodeBayar)}
                                ariaLabel="Salin kode pembayaran"
                                className="mt-1 flex-col items-center"
                                valueClassName="text-h2 font-mono font-bold tabular-nums text-ink"
                            >
                                {kodeBayar}
                            </SalinButton>
                        </div>
                        <dl className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
                            {baris('Gerai', gerai)}
                            {baris('Total', <span className="whitespace-nowrap">{total}</span>)}
                        </dl>
                        <ol className="mt-5 list-decimal space-y-2 pl-5 text-body text-ink-soft">
                            <li>Datang ke kasir {gerai}.</li>
                            <li>Sebutkan pembayaran untuk Toko Kulot.</li>
                            <li>Berikan kode {kodeBayar} dan bayar {total}.</li>
                        </ol>
                        <p className="mt-4 text-meta text-ink-soft">Kode ini khusus untuk pesanan {kode}.</p>
                    </>
                ) : null}

                {!['va', 'qris', 'bill', 'gerai'].includes(jenis) ? (
                    <InlineNotice tone="error" className="mt-5">
                        Instruksi pembayaran tidak dikenali. Pilih metode lain.
                    </InlineNotice>
                ) : null}

                {gagalPoll >= 3 ? (
                    <div className="mt-5 border-t border-line pt-4">
                        <p className="text-meta text-ink-soft">Status belum diperbarui. Periksa lagi.</p>
                        <Button variant="secondary" size="sm" className="mt-2" loading={memeriksa} onClick={cekManual}>
                            Cek status
                        </Button>
                    </div>
                ) : null}
            </section>
        );
    };

    return (
        <PublicLayout>
            <Head title="Pembayaran" />

            <div className="container py-8 lg:py-section">
                <Breadcrumb
                    className="mb-5"
                    items={[
                        { label: 'Beranda', href: '/' },
                        { label: 'Keranjang', href: '/keranjang' },
                        { label: 'Pembayaran' },
                    ]}
                />

                <p className="sr-only" aria-live="polite">
                    {pengumuman}
                </p>

                <header>
                    <h1 className="text-h1 text-ink">Pembayaran</h1>
                    <p className="mt-2 font-mono text-meta tabular-nums text-ink-soft">{kode}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge status={pesanan?.status} />
                        <StatusBadge status={badge[0]} label={badge[1]} />
                        {fake ? <Badge tone="warning">Mode uji</Badge> : null}
                    </div>
                    {statusLokal === 'pending' && expiresAt ? (
                        <p className="mt-2 text-meta text-ink-soft">Bayar sebelum {formatDateTime(expiresAt)}</p>
                    ) : null}
                </header>

                <div className="mt-6 lg:hidden">
                    <p className="text-meta text-ink-soft">Total pembayaran</p>
                    <p className="mt-1 text-h2 font-bold tabular-nums whitespace-nowrap text-ink">{total}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
                    <div className="flex flex-col gap-5 lg:col-span-7">
                        {flashSuccess ? <InlineNotice tone="success">{flashSuccess}</InlineNotice> : null}
                        {galatAksi ? <InlineNotice tone="error">{galatAksi}</InlineNotice> : null}

                        {panel === 'pemilih' ? renderPemilih() : null}
                        {panel === 'menyiapkan' ? renderMenyiapkan() : null}
                        {panel === 'instruksi' ? renderInstruksi() : null}

                        {panel === 'kedaluwarsa' ? (
                            <section className="card p-6" aria-labelledby="kedaluwarsa">
                                <h2 id="kedaluwarsa" className="text-h3 text-ink">
                                    Tagihan kedaluwarsa. Buat pesanan baru untuk melanjutkan.
                                </h2>
                                {konfirmasiLewat && statusLokal === 'pending' ? (
                                    <p className="mt-2 text-meta text-ink-soft">Menunggu konfirmasi kedaluwarsa.</p>
                                ) : null}
                                <div className="mt-5">
                                    <Button href="/keranjang">Kembali ke keranjang</Button>
                                </div>
                            </section>
                        ) : null}

                        {panel === 'lunas' ? (
                            <section className="card border border-success/30 bg-success/10 p-6" aria-labelledby="lunas">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-success-strong">
                                    <CheckIcon size={24} />
                                </span>
                                <h2 id="lunas" className="mt-4 text-h3 text-ink">
                                    Pembayaran diterima
                                </h2>
                                <dl className="mt-4 flex flex-col gap-2 text-body">
                                    {baris('Dibayar', formatDateTime(paidAt) ?? '-')}
                                    {baris('Metode', metode?.label ?? '-')}
                                    {baris('Total', <span className="whitespace-nowrap font-bold">{total}</span>)}
                                </dl>
                                <div className="mt-5">
                                    <Button href={`/checkout/${orderId}/selesai`}>Lihat pesanan</Button>
                                </div>
                                {!batalPindah ? (
                                    <p className="mt-4 text-meta text-ink-soft">
                                        Pindah ke halaman pesanan dalam 5 detik.{' '}
                                        <button
                                            type="button"
                                            onClick={() => setBatalPindah(true)}
                                            className="min-h-touch underline underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                                        >
                                            Tetap di halaman ini
                                        </button>
                                    </p>
                                ) : null}
                            </section>
                        ) : null}

                        {panel === 'gagal' ? (
                            <section className="card border border-danger/30 p-6" aria-labelledby="gagal">
                                <h2 id="gagal" className="text-h3 text-ink">
                                    Pembayaran gagal atau dibatalkan.
                                </h2>
                                <div className="mt-5">
                                    <Button
                                        onClick={() => {
                                            setPilihUlang(true);
                                            setGalatLokal(null);
                                        }}
                                    >
                                        Coba lagi
                                    </Button>
                                </div>
                            </section>
                        ) : null}

                        {fake && metode && statusLokal === 'pending' && !kedaluwarsa ? (
                            <section className="card p-6" aria-labelledby="mode-uji">
                                <InlineNotice tone="warning">
                                    Tagihan ini dibuat tanpa Midtrans (mode uji).
                                </InlineNotice>
                                <h2 id="mode-uji" className="sr-only">
                                    Simulasi pembayaran
                                </h2>
                                {konfirmasiSimulasi ? (
                                    <div className="mt-4">
                                        <p className="text-body text-ink">Konfirmasi: tandai tagihan ini lunas?</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button loading={simulasi} onClick={tandaiLunas}>
                                                Tandai lunas (mode uji)
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                disabled={simulasi}
                                                onClick={() => setKonfirmasiSimulasi(false)}
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button variant="secondary" className="mt-4" onClick={() => setKonfirmasiSimulasi(true)}>
                                        Tandai lunas (mode uji)
                                    </Button>
                                )}
                            </section>
                        ) : null}
                    </div>

                    <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:col-span-5">
                        <OrderSummary
                            subtotal={pesanan?.subtotal}
                            shipping={pesanan?.shipping_cost}
                            total={pesanan?.total ?? pembayaran?.gross_amount}
                            helper={diskon > 0 ? `Termasuk diskon −${rupiah(diskon)}.` : null}
                        />

                        <section className="card p-6" aria-labelledby="alamat">
                            <h2 id="alamat" className="text-h3 text-ink">
                                Alamat pengiriman
                            </h2>
                            <address className="mt-3 not-italic text-body text-ink-soft">
                                <span className="block font-semibold text-ink">{pesanan?.customer_name ?? '-'}</span>
                                <span className="mt-1 block tabular-nums">{pesanan?.customer_phone ?? '-'}</span>
                                <span className="mt-2 block whitespace-pre-line">{pesanan?.customer_address ?? '-'}</span>
                                <span className="block">
                                    {[pesanan?.customer_city, pesanan?.customer_postal_code].filter(Boolean).join(', ') || '-'}
                                </span>
                            </address>
                        </section>
                    </aside>
                </div>
            </div>
        </PublicLayout>
    );
}
