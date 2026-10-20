import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Button from '../../Components/Button';
import Field from '../../Components/Field';
import InlineNotice from '../../Components/InlineNotice';
import Input from '../../Components/Input';

/**
 * `/admin/login` — kontrak props §6.10/§6.11, design §5.9.
 * Kartu `max-w-adminLogin` di atas latar `surface`, tanpa layout publik.
 * State: idle | submitting | error (kredensial salah) | locked (akun nonaktif) | rate-limited (429).
 */
export default function AdminLogin({ status = null }) {
    const { props } = usePage();
    const flash = props?.flash ?? null;
    const settings = props?.settings ?? {};
    const storeName = settings?.store_name ?? 'Toko Kulot';
    const logoUrl = settings?.store_logo ?? settings?.logo_url ?? null;

    const [throttle, setThrottle] = useState(null);

    const form = useForm({ email: '', password: '' });

    const globalError = form.errors?.email ?? null;
    const locked = typeof globalError === 'string' && globalError.includes('dinonaktifkan');

    const submit = (event) => {
        event.preventDefault();
        if (form.processing) return;

        setThrottle(null);
        form.post('/admin/login', {
            onHttpException: (response) => {
                if (response?.status === 429) {
                    setThrottle('Terlalu banyak percobaan masuk. Tunggu sebentar, lalu coba lagi.');
                    return false;
                }

                return undefined;
            },
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
            <Head title="Masuk Panel Admin" />

            <div className="w-full max-w-adminLogin rounded-xl bg-white p-6 shadow-raised sm:p-8">
                <div className="flex flex-col items-center text-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt={storeName} className="h-10 w-auto" />
                    ) : (
                        <span className="text-h3 text-ink">{storeName}</span>
                    )}

                    <h1 className="mt-4 text-h2 text-ink">Masuk Panel Admin</h1>
                </div>

                {flash?.success && (
                    <InlineNotice tone="success" className="mt-5">
                        <p>{flash.success}</p>
                    </InlineNotice>
                )}

                {flash?.error && (
                    <InlineNotice tone="error" className="mt-5">
                        <p>{flash.error}</p>
                    </InlineNotice>
                )}

                {status && (
                    <InlineNotice tone="info" className="mt-5">
                        <p>{status}</p>
                    </InlineNotice>
                )}

                {(throttle || locked) && (
                    <InlineNotice tone={locked ? 'warning' : 'error'} className="mt-5">
                        <p>{throttle ?? 'Akun ini dinonaktifkan. Hubungi owner toko.'}</p>
                    </InlineNotice>
                )}

                <form className="mt-5 flex flex-col gap-4" onSubmit={submit} noValidate>
                    <Field label="Email" htmlFor="email" required error={form.errors?.email ?? null}>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            autoFocus
                            value={form.data.email}
                            error={form.errors?.email ?? null}
                            disabled={form.processing}
                            onChange={(event) => form.setData('email', event.target.value)}
                        />
                    </Field>

                    <Field label="Kata sandi" htmlFor="password" required error={form.errors?.password ?? null}>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={form.data.password}
                            error={form.errors?.password ?? null}
                            disabled={form.processing}
                            onChange={(event) => form.setData('password', event.target.value)}
                        />
                    </Field>

                    <Button type="submit" fullWidth loading={form.processing} disabled={form.processing}>
                        Masuk
                    </Button>
                </form>

                <p className="mt-5 text-center text-meta text-slate-500">Khusus pengelola</p>
            </div>
        </div>
    );
}
