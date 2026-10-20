// Harness verifikasi render statis halaman Public/Auth (Login, Register,
// ForgotPassword, ResetPassword) terhadap kontrak props §6 dan design §5.5.
// Jalankan: node tmp/verify-auth-render.bundle.mjs  (lihat tmp/build-auth-check.mjs)
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { __reset, __setPageProps, __setFormErrors } from './inertia-stub.jsx';
import Login from '../resources/js/Pages/Public/Auth/Login.jsx';
import Register from '../resources/js/Pages/Public/Auth/Register.jsx';
import ForgotPassword from '../resources/js/Pages/Public/Auth/ForgotPassword.jsx';
import ResetPassword from '../resources/js/Pages/Public/Auth/ResetPassword.jsx';

const results = [];
const check = (label, ok, detail = '') => results.push({ label, ok: !!ok, detail });
const text = (html) =>
    html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#?\w+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

function render(Component, props = {}, pageProps = {}, formErrors = {}) {
    __reset();
    __setPageProps(pageProps);
    __setFormErrors(formErrors);
    return renderToStaticMarkup(React.createElement(Component, props));
}

// Kontrol wajib punya label: setiap input/select/textarea non-hidden harus
// punya id, dan id itu harus dirujuk oleh <label for="...">.
function labelAudit(html) {
    const labelFor = [...html.matchAll(/<label[^>]*for="([^"]+)"/g)].map((m) => m[1]);
    const tags = [...html.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)].map((m) => m[0]);
    const problems = [];
    for (const tag of tags) {
        if (/\stype="hidden"/.test(tag)) continue;
        const id = (tag.match(/\sid="([^"]+)"/) || [])[1];
        if (!id) problems.push(`tanpa id: ${tag.slice(0, 70)}`);
        else if (!labelFor.includes(id)) problems.push(`id ${id} tanpa <label for>`);
    }
    return problems;
}

function describedByPresent(html) {
    const refs = [...html.matchAll(/aria-describedby="([^"]+)"/g)].map((m) => m[1]);
    return refs.filter((r) => !html.includes(`id="${r}"`));
}

// --- kasus 1: Login tanpa flash/status -------------------------------------
{
    const html = render(Login, {}, { flash: { success: null, error: null } });
    const t = text(html);
    check('Login: judul Masuk', t.includes('Masuk'));
    check('Login: label Email / Kata Sandi / Ingat Saya', /Email/.test(t) && /Kata Sandi/.test(t) && /Ingat Saya/.test(t));
    check('Login: tombol submit bertulis Masuk', /<button[^>]*type="submit"/.test(html) && t.includes('Masuk'));
    check('Login: tautan lupa sandi -> /forgot-password', html.includes('href="/forgot-password"'));
    check('Login: tanpa flash/status tidak ada notice', !html.includes('role="status"') && !html.includes('role="alert"'));
    check('Login: label tertaut ke kontrol', labelAudit(html).length === 0, labelAudit(html).join('; '));
    check('Login: tidak ada NaN/undefined', !/NaN|undefined/.test(t), t.slice(0, 120));
}

// --- kasus 2: Login flash.error + errors.email dari server -----------------
{
    const pesan = 'Email atau kata sandi salah.';
    const html = render(
        Login,
        { flash: { success: null, error: pesan } },
        {},
        { email: pesan },
    );
    check('Login: flash.error tampil sebagai alert', html.includes('role="alert"') && text(html).includes(pesan));
    check('Login: input email aria-invalid="true"', /id="login-email"[^>]*aria-invalid="true"/.test(html) || /aria-invalid="true"[^>]*id="login-email"/.test(html));
    check('Login: input email aria-describedby -> login-email-error', /id="login-email-error"/.test(html) && /aria-describedby="login-email-error"/.test(html));
    check('Login: aria-describedby menunjuk elemen yang ada', describedByPresent(html).length === 0, describedByPresent(html).join('; '));
}

// --- kasus 3: Login flash.success + status (kontrak §6.3/§6.4) -------------
{
    const html = render(Login, { status: 'Sesi berakhir, silakan masuk lagi.', flash: { success: 'Kata sandi berhasil diperbarui.', error: null } });
    const t = text(html);
    check('Login: flash.success tampil', t.includes('Kata sandi berhasil diperbarui.') && html.includes('role="status"'));
    check('Login: status prop tampil', t.includes('Sesi berakhir, silakan masuk lagi.'));
}

// --- kasus 4: Register, semua galat per kolom -----------------------------
{
    const errs = {
        name: 'Nama wajib diisi.',
        email: 'Email sudah terdaftar.',
        phone: 'Nomor WhatsApp tidak valid.',
        password: 'Kata sandi minimal 8 karakter.',
        terms: 'Syarat dan ketentuan wajib disetujui.',
    };
    const html = render(Register, {}, {}, errs);
    const t = text(html);
    check('Register: judul Daftar Akun', t.includes('Daftar Akun'));
    for (const [k, pesan] of Object.entries(errs)) {
        check(`Register: galat ${k} tampil apa adanya`, t.includes(pesan));
    }
    check('Register: id galat per kolom ada', ['register-name-error', 'register-email-error', 'register-phone-error', 'register-password-error', 'register-terms-error'].every((id) => html.includes(`id="${id}"`)));
    check('Register: aria-describedby menunjuk elemen yang ada', describedByPresent(html).length === 0, describedByPresent(html).join('; '));
    check('Register: label tertaut ke kontrol', labelAudit(html).length === 0, labelAudit(html).join('; '));
    check('Register: checkbox syarat ada (kontrak §6.1 terms)', /type="checkbox"/.test(html) && /id="register-terms"/.test(html));
}

// --- kasus 5: ForgotPassword, status + flash, tautan balik ----------------
{
    const html = render(ForgotPassword, { status: 'Tautan reset sudah dikirim ke email Anda.' });
    const t = text(html);
    check('ForgotPassword: tombol Kirim Tautan Reset', t.includes('Kirim Tautan Reset'));
    check('ForgotPassword: status prop tampil', t.includes('Tautan reset sudah dikirim ke email Anda.'));
    check('ForgotPassword: tautan balik -> /login', html.includes('href="/login"'));
    check('ForgotPassword: label tertaut ke kontrol', labelAudit(html).length === 0, labelAudit(html).join('; '));

    const htmlFlash = render(ForgotPassword, { flash: { success: 'Tautan reset sudah dikirim.', error: null } });
    check('ForgotPassword: flash.success tampil', text(htmlFlash).includes('Tautan reset sudah dikirim.'));
}

// --- kasus 6: ResetPassword, token palsu -> galat global + tautan minta ulang
{
    const pesan = 'Tautan reset tidak valid atau sudah kedaluwarsa.';
    const html = render(ResetPassword, { token: 'token-uji', email: 'pembeli@contoh.test' }, {}, { email: pesan });
    const t = text(html);
    check('ResetPassword: galat token sebagai alert global', html.includes('role="alert"') && t.includes(pesan));
    check('ResetPassword: tautan minta ulang -> /forgot-password', html.includes('href="/forgot-password"') && t.includes('Minta tautan reset baru'));
    check('ResetPassword: token dibawa di input hidden', /type="hidden"[^>]*value="token-uji"/.test(html));
    check('ResetPassword: email dari props tampil', html.includes('value="pembeli@contoh.test"'));
    check('ResetPassword: label tertaut ke kontrol', labelAudit(html).length === 0, labelAudit(html).join('; '));
}

// --- kasus 7: ResetPassword tanpa props (nilai bawaan aman) ---------------
{
    const html = render(ResetPassword);
    const t = text(html);
    check('ResetPassword: tanpa props tidak error', !/Cannot read|undefined/.test(t) && t.includes('Reset Kata Sandi'));
    check('ResetPassword: tanpa galat tidak ada alert', !html.includes('role="alert"'));
}

// --- kasus 8: tidak ada teks placeholder / nilai rusak -------------------
{
    const all = [Login, Register, ForgotPassword, ResetPassword]
        .map((C) => text(render(C)))
        .join(' || ');
    check('Tidak ada [CONTOH]/lorem/NaN/undefined', !/\[CONTOH\]|lorem|NaN|undefined/i.test(all), all.slice(0, 160));
}

// --- kasus 9: layout auth sesuai design §5.5 ------------------------------
{
    const html = render(Login, {}, {});
    check('Layout auth: panel brand bg-brand-700', /class="[^"]*bg-brand-700/.test(html));
    check('Layout auth: panel mobile header 160px', /class="[^"]*h-\[160px\]/.test(html));
    check('Layout auth: form max-w-form 400px', /class="[^"]*max-w-form/.test(html));
    check('Layout auth: main ber-id konten-utama + skip link', html.includes('id="konten-utama"') && html.includes('href="#konten-utama"'));

    const withBollet = render(Login, { settings: { store_name: 'Toko Kulot', store_tagline: 'Daster kulot nyaman.', landing_sections: { trust_strip: [{ icon: 'truck', label: 'Gratis ongkir', description: 'Min. belanja 200rb' }, { icon: 'retur', label: 'Retur 7 hari' }, { icon: 'qris', label: 'QRIS aman' }, { icon: 'support', label: 'CS responsif' }] } } });
    check('Layout auth: maks 3 bullet manfaat dari settings.trust_strip', withBollet.includes('Gratis ongkir') && withBollet.includes('Retur 7 hari') && withBollet.includes('QRIS aman') && !withBollet.includes('CS responsif'));
    check('Layout auth: tagline dari settings tampil', withBollet.includes('Daster kulot nyaman.'));
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'OK  ' : 'GAGAL'} ${r.label}${r.detail ? ` -> ${r.detail}` : ''}`);
console.log(`\nringkasan: ${results.length - failed.length}/${results.length} pemeriksaan lulus`);
process.exit(failed.length === 0 ? 0 : 1);
