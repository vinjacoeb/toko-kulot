import React from 'react';
import { useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Button';
import Field from '@/Components/Field';
import InlineNotice from '@/Components/InlineNotice';
import Input from '@/Components/Input';

/**
 * `/register` — kontrak props §6.1/§6.2, design §5.5.
 * URL literal `POST /register` (PRD §15.2 melarang Ziggy/`route()`).
 * Field: name, email, phone, password, password_confirmation, terms.
 * State: idle | submitting | error-field | error-global | success (flash dari server).
 */
export default function Register({ settings = null, flash = null }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    terms: false,
  });

  const submit = (e) => {
    e.preventDefault();
    if (processing) return;
    post('/register');
  };

  return (
    <AuthLayout title="Daftar Akun" heading="Daftar Akun" settings={settings}>
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

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Nama" htmlFor="register-name" required error={errors.name}>
          <Input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            error={errors.name}
          />
        </Field>

        <Field label="Email" htmlFor="register-email" required error={errors.email}>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            error={errors.email}
          />
        </Field>

        <Field label="Nomor WhatsApp" htmlFor="register-phone" required error={errors.phone}>
          <Input
            id="register-phone"
            name="phone"
            type="text"
            inputMode="tel"
            autoComplete="tel"
            value={data.phone}
            onChange={(e) => setData('phone', e.target.value)}
            error={errors.phone}
          />
        </Field>

        <Field label="Kata Sandi" htmlFor="register-password" required error={errors.password}>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            error={errors.password}
          />
        </Field>

        <Field
          label="Konfirmasi Kata Sandi"
          htmlFor="register-password-confirmation"
          required
          error={errors.password_confirmation}
        >
          <Input
            id="register-password-confirmation"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            error={errors.password_confirmation}
          />
        </Field>

        <div>
          <div className="flex items-start gap-2">
            <input
              id="register-terms"
              name="terms"
              type="checkbox"
              checked={data.terms}
              onChange={(e) => setData('terms', e.target.checked)}
              aria-invalid={errors.terms ? 'true' : undefined}
              aria-describedby={errors.terms ? 'register-terms-error' : undefined}
              className="mt-0.5 h-4 w-4 rounded-sm border border-line accent-brand"
            />
            <label htmlFor="register-terms" className="text-meta text-ink">
              Saya menyetujui syarat dan ketentuan.
            </label>
          </div>
          {errors.terms && (
            <p id="register-terms-error" role="alert" className="mt-1.5 text-meta text-danger-strong">
              {errors.terms}
            </p>
          )}
        </div>

        <Button type="submit" fullWidth loading={processing}>
          Daftar
        </Button>
      </form>
    </AuthLayout>
  );
}
