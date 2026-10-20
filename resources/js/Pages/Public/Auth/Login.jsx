import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Button';
import Field from '@/Components/Field';
import InlineNotice from '@/Components/InlineNotice';
import Input from '@/Components/Input';

/**
 * `/login` — kontrak props §6.3/§6.4, design §5.5.
 * URL literal (`POST /login`, tautan `/forgot-password`): PRD §15.2 melarang Ziggy/`route()`.
 * State: idle | submitting (tombol loading) | error-field | error-global (kredensial salah) | success.
 */
export default function Login({ status = null, settings = null, flash = null }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    if (processing) return;
    post('/login');
  };

  return (
    <AuthLayout title="Masuk" heading="Masuk" settings={settings}>
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
        <Field label="Email" htmlFor="login-email" required error={errors.email}>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            error={errors.email}
          />
        </Field>

        <Field label="Kata Sandi" htmlFor="login-password" required error={errors.password}>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            error={errors.password}
          />
        </Field>

        <div className="flex items-center gap-2">
          <input
            id="login-remember"
            name="remember"
            type="checkbox"
            checked={data.remember}
            onChange={(e) => setData('remember', e.target.checked)}
            className="h-4 w-4 rounded-sm border border-line accent-brand"
          />
          <label htmlFor="login-remember" className="text-meta text-ink">
            Ingat Saya
          </label>
        </div>

        <Button type="submit" fullWidth loading={processing}>
          Masuk
        </Button>
      </form>

      <p className="mt-4 text-meta">
        <Link href="/forgot-password" className="text-brand underline underline-offset-4">
          Lupa kata sandi?
        </Link>
      </p>
    </AuthLayout>
  );
}
