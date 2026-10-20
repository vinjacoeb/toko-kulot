import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Button';
import Field from '@/Components/Field';
import InlineNotice from '@/Components/InlineNotice';
import Input from '@/Components/Input';

/**
 * `/forgot-password` — kontrak props §6.5/§6.6, design §5.5.
 * URL literal (`POST /forgot-password`, tautan balik `/login`): PRD §15.2 melarang Ziggy/`route()`.
 * Respons server selalu netral → pesan tampil lewat `flash.success` (kontrak §6.6).
 */
export default function ForgotPassword({ status = null, settings = null, flash = null }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
  });

  const submit = (e) => {
    e.preventDefault();
    if (processing) return;
    post('/forgot-password');
  };

  return (
    <AuthLayout title="Lupa Kata Sandi" heading="Lupa Kata Sandi" settings={settings}>
      {flash?.success && (
        <InlineNotice tone="success" className="mb-4">
          <p>{flash.success}</p>
        </InlineNotice>
      )}

      {flash?.error && (
        <InlineNotice tone="error" className="mb-4">
          <p>{flash.error}</p>
        </InlineNotice>
      )}

      {status && (
        <InlineNotice tone="info" className="mb-4">
          <p>{status}</p>
        </InlineNotice>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="forgot-email" required error={errors.email}>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            error={errors.email}
          />
        </Field>

        <Button type="submit" fullWidth loading={processing}>
          Kirim Tautan Reset
        </Button>
      </form>

      <p className="mt-4 text-meta">
        <Link href="/login" className="text-brand underline underline-offset-4">
          Kembali ke halaman masuk
        </Link>
      </p>
    </AuthLayout>
  );
}
