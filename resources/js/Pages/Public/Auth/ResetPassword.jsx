import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Button';
import Field from '@/Components/Field';
import InlineNotice from '@/Components/InlineNotice';
import Input from '@/Components/Input';

/**
 * `/reset-password/{token}` — kontrak props §6.7/§6.8, design §5.5.
 * URL literal (`POST /reset-password`, tautan minta ulang `/forgot-password`):
 * PRD §15.2 melarang Ziggy/`route()`.
 * `errors.email` berasal dari token/akun (bukan dari isian) sehingga ditampilkan
 * sebagai galat global di atas form + tautan minta tautan baru (design §5.5).
 */
export default function ResetPassword({ token = '', email = '', settings = null, flash = null }) {
  const { data, setData, post, processing, errors } = useForm({
    token: token,
    email: email,
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    if (processing) return;
    post('/reset-password');
  };

  return (
    <AuthLayout title="Reset Kata Sandi" heading="Reset Kata Sandi" settings={settings}>
      {flash?.success && (
        <InlineNotice tone="success" className="mb-4">
          <p>{flash.success}</p>
        </InlineNotice>
      )}

      {errors.email && (
        <InlineNotice tone="error" className="mb-4">
          <p>{errors.email}</p>
          <p className="mt-1">
            <Link href="/forgot-password" className="underline underline-offset-4">
              Minta tautan reset baru
            </Link>
          </p>
        </InlineNotice>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <input type="hidden" name="token" value={data.token} />

        <Field label="Email" htmlFor="reset-email">
          <Input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            value={data.email}
            readOnly
            className="bg-surface text-ink-soft"
          />
        </Field>

        <Field label="Kata Sandi Baru" htmlFor="reset-password" required error={errors.password}>
          <Input
            id="reset-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            error={errors.password}
          />
        </Field>

        <Field
          label="Konfirmasi Kata Sandi Baru"
          htmlFor="reset-password-confirmation"
          required
          error={errors.password_confirmation}
        >
          <Input
            id="reset-password-confirmation"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            error={errors.password_confirmation}
          />
        </Field>

        <Button type="submit" fullWidth loading={processing}>
          Reset Kata Sandi
        </Button>
      </form>
    </AuthLayout>
  );
}
