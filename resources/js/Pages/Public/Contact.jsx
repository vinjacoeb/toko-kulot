import React, { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Breadcrumb from '../../Components/Breadcrumb';
import Button from '../../Components/Button';
import Field from '../../Components/Field';
import InlineNotice from '../../Components/InlineNotice';
import Input from '../../Components/Input';
import Textarea from '../../Components/Textarea';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '', website: '' };

const digitsOnly = (value) => String(value || '').replace(/[^0-9]/g, '');

/** `0812-0000-0001` → `6281200000001` agar tautan wa.me valid. */
const waNumber = (value) => {
    const digits = digitsOnly(value);
    if (!digits) return null;
    if (digits.startsWith('62')) return digits;
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    return digits;
};

/**
 * Halaman `/kontak-kami` — docs/design.md §5.4.
 * Info toko dari `settings` (kontrak §2): contact_address, contact_phone, contact_whatsapp,
 * contact_email, contact_map_embed. Tidak ada nilai karangan bila kosong.
 */
export default function Contact({ settings = null, cartCount = 0, user = null, flash = null }) {
    const { data, setData, post, processing, errors, reset } = useForm(EMPTY);
    const [clientErrors, setClientErrors] = useState({});
    const [mapBroken, setMapBroken] = useState(false);

    const contact = useMemo(
        () => ({
            address: settings?.contact_address ?? null,
            phone: settings?.contact_phone ?? null,
            whatsapp: settings?.contact_whatsapp ?? settings?.contact_phone ?? null,
            email: settings?.contact_email ?? null,
            mapEmbed: settings?.contact_map_embed ?? null,
        }),
        [settings]
    );

    const waDisplay = contact.whatsapp || contact.phone || null;
    const waHref = waDisplay ? waNumber(waDisplay) : null;

    const validate = () => {
        const next = {};
        if (!data.name.trim()) next.name = 'Nama wajib diisi.';
        if (!data.email.trim()) next.email = 'Email wajib diisi.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) next.email = 'Email tidak valid.';
        if (!data.subject.trim()) next.subject = 'Subjek wajib diisi.';
        if (!data.message.trim()) next.message = 'Pesan wajib diisi.';
        setClientErrors(next);
        return Object.keys(next).length === 0;
    };

    const submit = (event) => {
        event.preventDefault();
        if (processing) return;
        if (!validate()) return;
        post('/kontak-kami', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setClientErrors({});
            },
        });
    };

    const fieldError = (key) => clientErrors[key] ?? errors?.[key] ?? null;
    const disabled = processing;

    return (
        <PublicLayout settings={settings} cartCount={cartCount} user={user}>
            <Head title="Kontak Kami" />

            <div className="container py-4">
                <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Kontak Kami' }]} />

                <header className="mt-2">
                    <h1 className="text-h1 text-ink">Kontak Kami</h1>
                    <p className="mt-1 text-body text-ink-soft">
                        Kirim pesan lewat formulir di bawah, atau hubungi kami langsung lewat WhatsApp atau email.
                    </p>
                </header>

                <div className="mt-6 grid gap-8 lg:grid-cols-[52fr_48fr] lg:gap-12">
                    <section aria-labelledby="form-kontak">
                        <h2 id="form-kontak" className="text-h3 text-ink">
                            Formulir Pesan
                        </h2>

                        {flash?.success && (
                            <InlineNotice tone="success" className="mt-3">
                                <p>{flash.success}</p>
                            </InlineNotice>
                        )}

                        {(errors?.error || flash?.error) && (
                            <InlineNotice tone="error" className="mt-3">
                                <p>{errors?.error ?? flash?.error}</p>
                            </InlineNotice>
                        )}

                        <form onSubmit={submit} className="mt-4 flex flex-col gap-4" noValidate>
                            <Field label="Nama" htmlFor="name" required error={fieldError('name')}>
                                <Input
                                    id="name"
                                    name="name"
                                    autoComplete="name"
                                    maxLength={100}
                                    value={data.name}
                                    error={fieldError('name')}
                                    disabled={disabled}
                                    onChange={(event) => setData('name', event.target.value)}
                                />
                            </Field>

                            <Field label="Email" htmlFor="email" required error={fieldError('email')}>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    maxLength={150}
                                    value={data.email}
                                    error={fieldError('email')}
                                    disabled={disabled}
                                    onChange={(event) => setData('email', event.target.value)}
                                />
                            </Field>

                            <Field label="No. WhatsApp" htmlFor="phone" hint="Opsional" error={fieldError('phone')}>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    maxLength={30}
                                    value={data.phone}
                                    error={fieldError('phone')}
                                    disabled={disabled}
                                    onChange={(event) => setData('phone', event.target.value)}
                                />
                            </Field>

                            <Field label="Subjek" htmlFor="subject" required error={fieldError('subject')}>
                                <Input
                                    id="subject"
                                    name="subject"
                                    maxLength={150}
                                    value={data.subject}
                                    error={fieldError('subject')}
                                    disabled={disabled}
                                    onChange={(event) => setData('subject', event.target.value)}
                                />
                            </Field>

                            <Field label="Pesan" htmlFor="message" required error={fieldError('message')}>
                                <Textarea
                                    id="message"
                                    name="message"
                                    maxLength={2000}
                                    value={data.message}
                                    error={fieldError('message')}
                                    disabled={disabled}
                                    onChange={(event) => setData('message', event.target.value)}
                                />
                            </Field>

                            {/* Honeypot (kontrak §9.2): harus kosong; disembunyikan dari pengguna & pembaca layar. */}
                            <div aria-hidden="true" className="hidden">
                                <label htmlFor="website">Website</label>
                                <input
                                    id="website"
                                    name="website"
                                    type="text"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={data.website}
                                    onChange={(event) => setData('website', event.target.value)}
                                />
                            </div>

                            <Button type="submit" variant="primary" loading={processing} className="self-start">
                                Kirim Pesan
                            </Button>
                        </form>
                    </section>

                    <section aria-labelledby="info-toko" className="rounded-md border border-line bg-white p-4 md:p-6">
                        <h2 id="info-toko" className="text-h3 text-ink">
                            Info Toko
                        </h2>

                        <dl className="mt-3 space-y-3 text-body">
                            <div>
                                <dt className="text-meta font-semibold text-ink">Alamat</dt>
                                <dd className="whitespace-pre-line text-ink-soft">{contact.address || 'Belum tersedia'}</dd>
                            </div>
                            <div>
                                <dt className="text-meta font-semibold text-ink">WhatsApp</dt>
                                <dd className="text-ink-soft">
                                    {waDisplay ? (
                                        waHref ? (
                                            <a
                                                href={'https://wa.me/' + waHref}
                                                className="text-brand underline underline-offset-4"
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                {waDisplay}
                                            </a>
                                        ) : (
                                            waDisplay
                                        )
                                    ) : (
                                        'Belum tersedia'
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-meta font-semibold text-ink">Email</dt>
                                <dd className="text-ink-soft">
                                    {contact.email ? (
                                        <a href={'mailto:' + contact.email} className="text-brand underline underline-offset-4">
                                            {contact.email}
                                        </a>
                                    ) : (
                                        'Belum tersedia'
                                    )}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-4">
                            {contact.mapEmbed && !mapBroken ? (
                                <iframe
                                    src={contact.mapEmbed}
                                    title="Peta lokasi toko"
                                    loading="lazy"
                                    onError={() => setMapBroken(true)}
                                    className="h-map w-full rounded-md border border-line"
                                />
                            ) : (
                                <div className="flex h-map w-full items-center justify-center rounded-md border border-line bg-surface p-4 text-center text-meta text-slate-600">
                                    {mapBroken ? 'Peta gagal dimuat. Gunakan alamat di atas.' : 'Peta belum tersedia.'}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
