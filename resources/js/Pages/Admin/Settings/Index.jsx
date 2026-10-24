import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout, { ADMIN_NAV } from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Field from '../../../Components/Field';
import Input from '../../../Components/Input';
import Select from '../../../Components/Select';
import Textarea from '../../../Components/Textarea';
import Button from '../../../Components/Button';
import Modal from '../../../Components/Modal';
import Toast from '../../../Components/Toast';
import InlineNotice from '../../../Components/InlineNotice';
import StatusBadge from '../../../Components/StatusBadge';
import { midtransMode } from '../../../lib/midtrans';
import EmptyState from '../../../Components/EmptyState';
import ErrorState from '../../../Components/ErrorState';
import DataTable from '../../../Components/DataTable';
import IconButton from '../../../Components/IconButton';
import Skeleton from '../../../Components/Skeleton';
import { ImageOffIcon, SOCIAL_ICONS, TRUST_ICONS, TrashIcon } from '../../../Components/icons';
import { cn } from '../../../lib/format';

/**
 * Pengaturan toko — docs/design.md §5.13, docs/kontrak-props.md §10.7–§10.11.
 * Sembilan tab: Umum · Landing · Carousel · FAQ · Header · Footer · Kontak · SEO · Pembayaran.
 * Setiap tab memakai form sendiri, tombol "Simpan" sticky di bawah, dan pratinjau gambar 1:1.
 * Semua URL di bawah ini literal dari kontrak (tanpa Ziggy/route()).
 */
const SETTINGS_URL = '/admin/pengaturan';
const LANDING_URL = '/admin/pengaturan/landing';
const CAROUSEL_URL = '/admin/pengaturan/carousel';
const FAQ_URL = '/admin/pengaturan/faq';

const BREADCRUMB = [{ label: 'Dashboard', href: '/admin' }, { label: 'Pengaturan' }];

const TABS = [
    { key: 'umum', label: 'Umum' },
    { key: 'landing', label: 'Landing' },
    { key: 'carousel', label: 'Carousel' },
    { key: 'faq', label: 'FAQ' },
    { key: 'header', label: 'Header' },
    { key: 'footer', label: 'Footer' },
    { key: 'kontak', label: 'Kontak' },
    { key: 'seo', label: 'SEO' },
    { key: 'pembayaran', label: 'Pembayaran' },
];

/** Key yang dikirim per tab ke `PUT /admin/pengaturan` (§10.8). */
const TAB_KEYS = {
    umum: ['store_name', 'store_tagline', 'store_logo', 'store_favicon', 'hapus_store_logo'],
    header: ['header_nav'],
    footer: ['footer_about', 'footer_copyright', 'footer_links', 'footer_social'],
    kontak: ['contact_email', 'contact_phone', 'contact_whatsapp', 'contact_address', 'contact_map_embed'],
    seo: ['seo_default_title', 'seo_default_description'],
    pembayaran: ['midtrans_client_key', 'midtrans_is_production'],
};

const MAX_NAV = 8;
const MAX_SOCIAL = 8;
const MAX_LINKS = 8;
const MAX_TRUST = 6;
const MAX_WHY_US = 6;

const IMAGE_TYPE_LABEL = 'JPG, PNG, atau WebP';
const LOGO_ACCEPT = 'image/jpeg,image/png,image/webp';
const FAVICON_ACCEPT = 'image/jpeg,image/png,image/webp,image/x-icon,image/vnd.microsoft.icon,.ico';
const LOGO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const FAVICON_EXTENSIONS = [...LOGO_EXTENSIONS, '.ico'];

const SOCIAL_PLATFORMS = Array.from(new Set([...Object.keys(SOCIAL_ICONS), 'shopee']));
const TRUST_ICON_KEYS = Object.keys(TRUST_ICONS);

const NAV_AKTIF = ADMIN_NAV.map((item) =>
    item.key === 'penilaian' || item.key === 'pengaturan' ? { ...item, disabled: false } : item
);

const fieldId = (prefix, index) => `${prefix}-${index}`;

const text = (value) => (value === null || value === undefined ? '' : String(value));
const asList = (value) => (Array.isArray(value) ? value : []);
const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});
const isFileValue = (value) => typeof File !== 'undefined' && value instanceof File;
const trimmed = (value) => text(value).trim();
const orNull = (value) => {
    const clean = trimmed(value);
    return clean === '' ? null : clean;
};

const clampInt = (value, min, max, fallback) => {
    const parsed = Number.parseInt(text(value).replace(/[^0-9-]/g, ''), 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
};

const cleanRows = (rows, keys) => asList(rows).filter((row) => keys.some((key) => trimmed(asObject(row)[key]) !== ''));

const readTabFromUrl = () => {
    if (typeof window === 'undefined') return TABS[0].key;
    const requested = new URLSearchParams(window.location.search).get('tab');
    return TABS.some((item) => item.key === requested) ? requested : TABS[0].key;
};

const checkUpload = (file, { maxKb, message, extensions }) => {
    if (!file) return null;
    const extension = `.${text(file.name).split('.').pop()}`.toLowerCase();
    const type = text(file.type).toLowerCase();
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'].concat(
        extensions.includes('.ico') ? ['image/x-icon', 'image/vnd.microsoft.icon'] : []
    );
    if (!allowedTypes.includes(type) && !extensions.includes(extension)) return message;
    if (Number(file.size) > maxKb * 1024) {
        return `Ukuran berkas maksimal ${maxKb >= 1024 ? `${Math.round(maxKb / 1024)} MB` : `${maxKb} KB`}.`;
    }
    return null;
};

/**
 * `footer_links` tersimpan sebagai kolom `{title, items[]}` (kontrak §2, dibaca `Footer.jsx`)
 * sementara tabel validasi §10.8 memakai entri datar `{label, url}`. Halaman ini membaca bentuk
 * yang benar-benar tersimpan dan mengirim balik bentuk yang sama; detail di
 * docs/catatan-frontend-admin.md dan docs/usulan.md.
 */
const readFooterLinksMode = (raw) => {
    const value = asList(raw);
    if (value.length === 0) return 'nested';
    return value.every((entry) => Array.isArray(asObject(entry).items)) ? 'nested' : 'flat';
};

function useToastFromFlash(flash) {
    const [toast, setToast] = useState(null);
    const success = flash && typeof flash.success === 'string' ? flash.success : null;
    const error = flash && typeof flash.error === 'string' ? flash.error : null;

    useEffect(() => {
        if (success) setToast({ tone: 'success', message: success });
        else if (error) setToast({ tone: 'error', message: error });
    }, [success, error]);

    const dismiss = () => setToast(null);
    return [toast, dismiss];
}

function TabNav({ active, onSelect }) {
    return (
        <div className="border-b border-line">
            <div
                role="tablist"
                aria-label="Tab pengaturan"
                className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {TABS.map((item) => {
                    const isActive = item.key === active;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            role="tab"
                            id={`tab-${item.key}`}
                            aria-selected={isActive}
                            aria-controls={`panel-${item.key}`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => onSelect(item.key)}
                            className={cn(
                                'flex h-11 shrink-0 items-center whitespace-nowrap px-4 text-label transition-colors duration-150',
                                isActive ? 'border-b-2 border-brand text-brand' : 'text-slate-600 hover:text-ink'
                            )}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function SectionCard({ title = null, description = null, children }) {
    return (
        <section className="card p-6">
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

function StickySave({ dirty, processing, resetLabel = null, onReset = null, saveLabel = 'Simpan' }) {
    return (
        <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-line bg-white px-4 py-3 lg:-mx-6 lg:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-meta text-slate-500" aria-live="polite">
                    {dirty ? 'Perubahan belum disimpan.' : 'Tidak ada perubahan.'}
                </p>
                <div className="flex items-center gap-2">
                    {dirty && onReset && resetLabel ? (
                        <Button variant="secondary" onClick={onReset} disabled={processing}>
                            {resetLabel}
                        </Button>
                    ) : null}
                    <Button type="submit" loading={processing} disabled={!dirty || processing}>
                        {saveLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

/** Thumb galeri: fallback blok netral saat gambar gagal dimuat (design v1.1 §9.4). */
function GalleryThumb({ src, alt, removed }) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (!src || failed) {
        return (
            <span className="flex aspect-portrait w-16 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-slate-400 sm:w-20">
                <ImageOffIcon size={20} />
                <span className="sr-only">Gambar tidak tersedia</span>
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={cn('aspect-portrait w-16 shrink-0 rounded-md object-cover sm:w-20', removed && 'opacity-60')}
            onError={() => setFailed(true)}
        />
    );
}

function GalleryCard({ items = [], onChange, errors = {}, disabled = false }) {
    const fileRef = useRef(null);
    const [uploadErrors, setUploadErrors] = useState([]);
    const [announce, setAnnounce] = useState('');
    const previews = useRef(new Set());
    const active = items.filter((item) => !item.removed);
    const count = active.length;
    const maxed = count >= 8;

    useEffect(
        () => () => {
            previews.current.forEach((src) => URL.revokeObjectURL(src));
        },
        []
    );

    const update = (uid, patch) => {
        onChange(items.map((item) => (item.uid === uid ? { ...item, ...patch } : item)));
    };

    const addFiles = (fileList) => {
        const files = Array.from(fileList ?? []);
        const nextErrors = [];
        const nextItems = [];
        let slots = 8 - count;

        files.forEach((file) => {
            if (slots <= 0) {
                nextErrors.push(`${file.name}: Maksimal 8 gambar.`);
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                nextErrors.push(`${file.name}: Format harus JPG, PNG, atau WebP.`);
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                nextErrors.push(`${file.name}: Ukuran maksimal 2 MB.`);
                return;
            }
            const preview = URL.createObjectURL(file);
            previews.current.add(preview);
            nextItems.push({
                uid: `new-${Date.now()}-${nextItems.length}`,
                image: file,
                caption: '',
                alt: '',
                removed: false,
                preview,
            });
            slots -= 1;
        });

        setUploadErrors(nextErrors);
        if (nextItems.length > 0) {
            onChange([...items, ...nextItems]);
            requestAnimationFrame(() =>
                document.getElementById(`gallery-caption-${nextItems[0].uid}`)?.focus()
            );
        }
        if (fileRef.current) fileRef.current.value = '';
    };

    const replaceFile = (uid, file) => {
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setUploadErrors([`${file.name}: Format harus JPG, PNG, atau WebP.`]);
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setUploadErrors([`${file.name}: Ukuran maksimal 2 MB.`]);
            return;
        }
        const preview = URL.createObjectURL(file);
        previews.current.add(preview);
        setUploadErrors([]);
        update(uid, { image: file, preview, removed: false });
    };

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
        setAnnounce(`Gambar dipindah ke posisi ${target + 1}.`);
        requestAnimationFrame(() => {
            document.getElementById(`gallery-${direction < 0 ? 'up' : 'down'}-${next[target].uid}`)?.focus();
        });
    };

    const remove = (item, index) => {
        update(item.uid, { removed: true });
        setAnnounce(`Gambar ${index + 1} akan dihapus saat simpan.`);
        requestAnimationFrame(() => document.getElementById('gallery-add-bottom')?.focus());
    };

    const undoRemove = (item, index) => {
        update(item.uid, { removed: false });
        setAnnounce(`Gambar ${index + 1} batal dihapus.`);
    };

    const firstError = Object.keys(errors).find((key) => key.startsWith('landing_gallery'));

    return (
        <section className="card p-6">
            <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-h3 text-ink">Galeri landing</h2>
                    <p className="mt-1 text-meta text-slate-500">
                        Tampil di beranda setelah produk unggulan. Maksimal 8 gambar; urutan ini yang tampil.
                    </p>
                </div>
                <StatusBadge status={maxed ? 'selesai' : null} label={`${count}/8`} />
            </header>

            <p className="sr-only" aria-live="polite">
                {announce}
            </p>

            {firstError ? (
                <InlineNotice tone="error" title="Galeri belum tersimpan" className="mb-4">
                    {errors[firstError]}
                </InlineNotice>
            ) : null}
            {uploadErrors.length > 0 ? (
                <InlineNotice tone="error" title="Berkas tidak ditambahkan" className="mb-4">
                    <ul className="list-disc pl-4">
                        {uploadErrors.map((message) => (
                            <li key={message}>{message}</li>
                        ))}
                    </ul>
                </InlineNotice>
            ) : null}

            <div className="flex flex-col gap-3">
                <div>
                    <input
                        ref={fileRef}
                        id="gallery-add"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="sr-only"
                        disabled={disabled || maxed}
                        onChange={(event) => addFiles(event.target.files)}
                    />
                    <label
                        htmlFor="gallery-add"
                        className={cn(
                            'inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-400 px-5 text-label font-semibold text-ink transition-colors duration-hover hover:border-brand hover:text-brand',
                            (disabled || maxed) && 'pointer-events-none opacity-45'
                        )}
                    >
                        Tambah gambar
                    </label>
                    <p className="mt-1.5 text-meta text-slate-500">JPG, PNG, atau WebP; maksimal 2 MB per gambar.</p>
                </div>

                {items.length === 0 ? (
                    <EmptyState
                        title="Belum ada gambar galeri."
                        description="Seksi galeri disembunyikan di beranda sampai ada gambar."
                        actionLabel="Tambah gambar"
                        onAction={() => fileRef.current?.click()}
                    />
                ) : (
                    <ul className="flex flex-col gap-3">
                        {items.map((item, index) => {
                            const src = item.preview || (typeof item.image === 'string' ? item.image : '');
                            const number = String(index + 1).padStart(2, '0');
                            const label = number;
                            const sentIndex = active.indexOf(item);
                            const itemError =
                                errors[`landing_gallery.${sentIndex}.caption`] ??
                                errors[`landing_gallery.${sentIndex}.alt`] ??
                                errors[`landing_gallery.${sentIndex}.image`];

                            return (
                                <li
                                    key={item.uid}
                                    className={cn(
                                        'rounded-md border border-line p-4',
                                        item.removed && 'bg-surface/70 opacity-75'
                                    )}
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <div className="relative shrink-0">
                                            <GalleryThumb src={src} alt={item.alt} removed={item.removed} />
                                            <span className="mt-1 block text-meta text-slate-500">{label}</span>
                                        </div>

                                        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3">
                                            <Field
                                                label={`Caption gambar ${index + 1}`}
                                                htmlFor={`gallery-caption-${item.uid}`}
                                                error={errors[`landing_gallery.${sentIndex}.caption`]}
                                                hint={item.removed ? 'Akan dihapus saat simpan.' : 'Tampil di bawah gambar. Boleh kosong.'}
                                            >
                                                <Input
                                                    id={`gallery-caption-${item.uid}`}
                                                    value={item.caption}
                                                    maxLength={80}
                                                    disabled={disabled || item.removed}
                                                    error={errors[`landing_gallery.${sentIndex}.caption`]}
                                                    onChange={(event) => update(item.uid, { caption: event.target.value })}
                                                />
                                            </Field>
                                            <Field
                                                label={`Alt gambar ${index + 1}`}
                                                htmlFor={`gallery-alt-${item.uid}`}
                                                error={errors[`landing_gallery.${sentIndex}.alt`]}
                                                hint="Deskripsi untuk pembaca layar. Kosongkan bila dekoratif."
                                            >
                                                <Input
                                                    id={`gallery-alt-${item.uid}`}
                                                    value={item.alt}
                                                    maxLength={120}
                                                    disabled={disabled || item.removed}
                                                    error={errors[`landing_gallery.${sentIndex}.alt`]}
                                                    onChange={(event) => update(item.uid, { alt: event.target.value })}
                                                />
                                            </Field>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-meta text-slate-500">
                                                    {item.caption.length}/80 · {item.alt.length}/120
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-start gap-2 sm:flex-col">
                                            <Button
                                                id={`gallery-up-${item.uid}`}
                                                variant="ghost"
                                                size="sm"
                                                disabled={disabled || index === 0 || item.removed}
                                                aria-label={`Naikkan gambar ${index + 1}`}
                                                onClick={() => move(index, -1)}
                                            >
                                                Naik
                                            </Button>
                                            <Button
                                                id={`gallery-down-${item.uid}`}
                                                variant="ghost"
                                                size="sm"
                                                disabled={disabled || index === items.length - 1 || item.removed}
                                                aria-label={`Turunkan gambar ${index + 1}`}
                                                onClick={() => move(index, 1)}
                                            >
                                                Turun
                                            </Button>
                                            {!item.removed ? (
                                                <>
                                                    <label
                                                        className={cn(
                                                            'inline-flex h-10 cursor-pointer items-center justify-center rounded-sm px-4 text-label text-brand underline underline-offset-4 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand',
                                                            disabled && 'pointer-events-none opacity-45'
                                                        )}
                                                    >
                                                        Ganti gambar
                                                        <input
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            className="sr-only"
                                                            disabled={disabled}
                                                            onChange={(event) => replaceFile(item.uid, event.target.files?.[0])}
                                                        />
                                                    </label>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        disabled={disabled}
                                                        aria-label={`Hapus gambar ${index + 1}`}
                                                        onClick={() => remove(item, index)}
                                                    >
                                                        Hapus
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    disabled={disabled}
                                                    onClick={() => undoRemove(item, index)}
                                                >
                                                    Batalkan
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {itemError ? (
                                        <p className="mt-2 text-meta text-danger-strong" role="alert">
                                            {itemError}
                                        </p>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        id="gallery-add-bottom"
                        variant="secondary"
                        disabled={disabled || maxed}
                        onClick={() => fileRef.current?.click()}
                    >
                        Tambah gambar
                    </Button>
                    {maxed ? (
                        <p className="text-meta text-slate-500">Batas 8 gambar tercapai. Hapus salah satu untuk menambah.</p>
                    ) : count > 0 && count < 4 ? (
                        <p className="text-meta text-slate-500">Tambahkan minimal 4 gambar agar komposisi galeri rapi.</p>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

function Thumb({ src, size = 48, className = '' }) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [src]);

    const style = { width: `${size}px`, height: `${size}px` };

    if (!src || failed) {
        return (
            <span
                style={style}
                className={cn('flex shrink-0 items-center justify-center rounded-md border border-line bg-surface text-slate-400', className)}
            >
                <ImageOffIcon size={18} />
            </span>
        );
    }

    return (
        <img
            src={src}
            alt=""
            style={style}
            loading="lazy"
            onError={() => setFailed(true)}
            className={cn('shrink-0 rounded-md border border-line object-cover', className)}
        />
    );
}

function ImageField({
    id,
    label,
    hint = null,
    required = false,
    accept,
    maxKb,
    extensions,
    file = null,
    currentPath = null,
    error = null,
    message,
    onSelect,
}) {
    const [objectUrl, setObjectUrl] = useState(null);

    useEffect(() => {
        if (!file) {
            setObjectUrl(null);
            return undefined;
        }
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
    const sizeLabel = maxKb >= 1024 ? `${Math.round(maxKb / 1024)} MB` : `${maxKb} KB`;

    return (
        <Field label={label} htmlFor={id} required={required} hint={hint} error={error}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <Thumb src={objectUrl || currentPath || null} size={112} className="rounded-lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                        id={id}
                        type="file"
                        accept={accept}
                        aria-describedby={describedBy}
                        aria-invalid={error ? 'true' : undefined}
                        onChange={(event) => {
                            const picked = event.target.files && event.target.files[0] ? event.target.files[0] : null;
                            onSelect(picked);
                            event.target.value = '';
                        }}
                        className={cn(
                            'field h-auto cursor-pointer py-2 text-meta file:mr-3 file:rounded-sm file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-meta file:font-semibold file:text-ink hover:file:bg-slate-200',
                            error && 'field-error'
                        )}
                    />
                    <p className="text-meta text-slate-500">
                        {message} Maksimal {sizeLabel}.
                    </p>
                    {file ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-meta text-ink-soft">{file.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
                                Batalkan pilihan
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </Field>
    );
}

function ArrayRow({ children, onRemove, removeLabel }) {
    return (
        <div className="rounded-lg border border-line p-3">
            <div className="flex items-start gap-2">
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">{children}</div>
                <IconButton label={removeLabel} onClick={onRemove} className="text-danger">
                    <TrashIcon size={18} />
                </IconButton>
            </div>
        </div>
    );
}

function StatusCell({ active }) {
    return (
        <span className="inline-flex items-center gap-2 text-meta text-ink">
            <span
                aria-hidden="true"
                className={cn('h-2 w-2 rounded-full', active ? 'bg-success' : 'bg-slate-300')}
            />
            {active ? 'Aktif' : 'Nonaktif'}
        </span>
    );
}

function ConfirmDialog({ open, title, description, confirmLabel, processing, onConfirm, onCancel }) {
    return (
        <Modal
            open={open}
            title={title}
            description={description}
            onClose={processing ? () => {} : onCancel}
            size="md"
            footer={
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={onCancel} disabled={processing}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={onConfirm} loading={processing}>
                        {confirmLabel}
                    </Button>
                </div>
            }
        >
            <p className="text-body text-ink-soft">Tindakan ini tidak bisa dibatalkan.</p>
        </Modal>
    );
}

export default function SettingsIndex({ auth = null, pengaturan = null, carousels = [], faqs = [], flash = null, midtrans = null }) {
    const [tab, setTab] = useState(() => readTabFromUrl());
    const [pendingTab, setPendingTab] = useState(null);
    const [reloading, setReloading] = useState(false);
    const [toast, dismissToast] = useToastFromFlash(flash);
    const [actionError, setActionError] = useState(null);

    const [logoError, setLogoError] = useState(null);
    const [faviconError, setFaviconError] = useState(null);
    const [footerLinksError, setFooterLinksError] = useState(null);

    const [carouselEditing, setCarouselEditing] = useState(null);
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [carouselImageError, setCarouselImageError] = useState(null);
    const [carouselPendingDelete, setCarouselPendingDelete] = useState(null);
    const [faqEditing, setFaqEditing] = useState(null);
    const [faqOpen, setFaqOpen] = useState(false);
    const [faqPendingDelete, setFaqPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const groups = useMemo(() => {
        const source = asObject(pengaturan);
        return {
            umum: asObject(source.umum),
            header: asObject(source.header),
            footer: asObject(source.footer),
            kontak: asObject(source.kontak),
            seo: asObject(source.seo),
            pembayaran: asObject(source.pembayaran),
            landing: asObject(source.landing),
        };
    }, [pengaturan]);

    const hero = useMemo(() => asObject(groups.landing.landing_hero), [groups]);
    const sections = useMemo(() => asObject(groups.landing.landing_sections), [groups]);
    const footerLinksMode = useMemo(() => readFooterLinksMode(groups.footer.footer_links), [groups]);

    const sectionKeys = useMemo(
        () => ({
            announcement: Object.keys(asObject(sections.announcement)).length > 0,
            trust_strip: Array.isArray(sections.trust_strip),
            featured: Object.keys(asObject(sections.featured)).length > 0,
            promo: Object.keys(asObject(sections.promo)).length > 0,
            why_us: Object.keys(asObject(sections.why_us)).length > 0,
            newsletter: Object.keys(asObject(sections.newsletter)).length > 0,
        }),
        [sections]
    );

    const settingsForm = useForm({
        store_name: text(groups.umum.store_name),
        store_tagline: text(groups.umum.store_tagline),
        store_logo: null,
        store_favicon: null,
        hapus_store_logo: false,
        header_nav: asList(groups.header.header_nav).map((item) => ({
            label: text(asObject(item).label),
            url: text(asObject(item).url),
        })),
        footer_about: text(groups.footer.footer_about),
        footer_copyright: text(groups.footer.footer_copyright),
        footer_links:
            footerLinksMode === 'flat'
                ? asList(groups.footer.footer_links).map((item) => ({
                      label: text(asObject(item).label),
                      url: text(asObject(item).url),
                  }))
                : asList(groups.footer.footer_links).map((column) => ({
                      title: text(asObject(column).title),
                      items: asList(asObject(column).items).map((item) => ({
                          label: text(asObject(item).label),
                          url: text(asObject(item).url),
                      })),
                  })),
        footer_social: asList(groups.footer.footer_social).map((item) => {
            const entry = asObject(item);
            const platform = text(entry.platform) || text(entry.name);
            return {
                platform: SOCIAL_PLATFORMS.includes(platform) ? platform : SOCIAL_PLATFORMS[0],
                label: text(entry.label),
                url: text(entry.url) || text(entry.href),
            };
        }),
        contact_email: text(groups.kontak.contact_email),
        contact_phone: text(groups.kontak.contact_phone),
        contact_whatsapp: text(groups.kontak.contact_whatsapp),
        contact_address: text(groups.kontak.contact_address),
        contact_map_embed: text(groups.kontak.contact_map_embed),
        seo_default_title: text(groups.seo.seo_default_title),
        seo_default_description: text(groups.seo.seo_default_description),
        midtrans_client_key: text(groups.pembayaran.midtrans_client_key),
        midtrans_is_production: Boolean(groups.pembayaran.midtrans_is_production),
    });

    const landingForm = useForm({
        landing_hero: {
            title: text(hero.title),
            subtitle: text(hero.subtitle),
            cta_label: text(hero.cta_label),
            cta_url: text(hero.cta_url),
            image: text(hero.image),
        },
        announcement: {
            text: text(asObject(sections.announcement).text),
            url: text(asObject(sections.announcement).url),
            is_active: Boolean(asObject(sections.announcement).is_active),
        },
        trust_strip: asList(sections.trust_strip).map((item) => ({
            icon: text(asObject(item).icon),
            title: text(asObject(item).title),
            subtitle: text(asObject(item).subtitle),
        })),
        featured: {
            title: text(asObject(sections.featured).title),
            subtitle: text(asObject(sections.featured).subtitle),
            limit: text(asObject(sections.featured).limit),
        },
        promo: {
            title: text(asObject(sections.promo).title),
            subtitle: text(asObject(sections.promo).subtitle),
            cta_label: text(asObject(sections.promo).cta_label),
            cta_url: text(asObject(sections.promo).cta_url),
            image: text(asObject(sections.promo).image),
            is_active: Boolean(asObject(sections.promo).is_active),
        },
        why_us_title: text(asObject(sections.why_us).title),
        why_us_items: asList(asObject(sections.why_us).items).map((item) => ({
            title: text(asObject(item).title),
            body: text(asObject(item).body),
        })),
        newsletter: {
            title: text(asObject(sections.newsletter).title),
            subtitle: text(asObject(sections.newsletter).subtitle),
            button_text: text(asObject(sections.newsletter).button_text),
        },
        landing_gallery: asList(asObject(groups.landing).landing_gallery).map((item, index) => ({
            uid: `saved-${index}`,
            image: text(asObject(item).image),
            caption: text(asObject(item).caption),
            alt: text(asObject(item).alt),
            removed: false,
            preview: '',
        })),
    });

    const carouselForm = useForm({
        title: '',
        subtitle: '',
        image: null,
        link: '',
        button_text: '',
        sort_order: '0',
        is_active: true,
    });

    const faqForm = useForm({
        question: '',
        answer: '',
        sort_order: '0',
        is_active: true,
    });

    const carouselRows = asList(carousels);
    const faqRows = asList(faqs);

    const anyDirty = settingsForm.isDirty || landingForm.isDirty || carouselForm.isDirty || faqForm.isDirty;

    const applyTab = (next) => {
        setTab(next);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', next);
            window.history.replaceState(window.history.state, '', url.toString());
        }
    };

    const requestTab = (next) => {
        if (next === tab) return;
        if (anyDirty) {
            setPendingTab(next);
            return;
        }
        applyTab(next);
    };

    const discardAndSwitch = () => {
        settingsForm.reset();
        landingForm.reset();
        carouselForm.reset();
        faqForm.reset();
        setLogoError(null);
        setFaviconError(null);
        setFooterLinksError(null);
        setCarouselImageError(null);
        setCarouselOpen(false);
        setCarouselEditing(null);
        setFaqOpen(false);
        setFaqEditing(null);
        const next = pendingTab;
        setPendingTab(null);
        if (next) applyTab(next);
    };

    const reload = () => {
        setReloading(true);
        setActionError(null);
        router.reload({ preserveScroll: true, onFinish: () => setReloading(false) });
    };

    const setField = (key, value) => settingsForm.setData(key, value);
    const setRows = (key, rows) => settingsForm.setData(key, rows);
    const addRow = (key, row, max) => {
        const rows = asList(settingsForm.data[key]);
        if (rows.length >= max) return;
        setRows(key, [...rows, row]);
    };
    const updateRow = (key, index, field, value) =>
        setRows(
            key,
            asList(settingsForm.data[key]).map((row, position) =>
                position === index ? { ...asObject(row), [field]: value } : row
            )
        );
    const removeRow = (key, index) =>
        setRows(key, asList(settingsForm.data[key]).filter((_, position) => position !== index));

    const updateColumn = (columnIndex, next) =>
        setRows(
            'footer_links',
            asList(settingsForm.data.footer_links).map((column, position) => (position === columnIndex ? next : column))
        );

    const buildFooterLinksPayload = () => {
        const rows = asList(settingsForm.data.footer_links);
        if (footerLinksMode === 'flat') {
            return cleanRows(rows, ['label', 'url']).map((row) => ({
                label: trimmed(row.label),
                url: trimmed(row.url),
            }));
        }
        return cleanRows(rows, ['title', 'items']).map((column) => {
            const items = cleanRows(asObject(column).items, ['label', 'url']).map((item) => ({
                label: trimmed(asObject(item).label),
                url: trimmed(asObject(item).url),
            }));
            const title = trimmed(asObject(column).title);
            return {
                title,
                items,
                label: title,
                url: items[0]?.url || '/',
            };
        });
    };

    const footerColumnNeedsTitle = () => {
        if (footerLinksMode === 'flat') return false;
        return cleanRows(asList(settingsForm.data.footer_links), ['items']).some(
            (column) => asList(asObject(column).items).some((item) => trimmed(asObject(item).url) !== '') && trimmed(asObject(column).title) === ''
        );
    };

    const submitSettings = (tabKey, event) => {
        event.preventDefault();
        if (tabKey === 'footer' && footerColumnNeedsTitle()) {
            setFooterLinksError('Judul kolom wajib diisi.');
            return;
        }
        setFooterLinksError(null);

        const keys = TAB_KEYS[tabKey] ?? [];
        const needsMultipart = tabKey === 'umum';

        settingsForm.transform((data) => {
            const payload = {};
            keys.forEach((key) => {
                if (key === 'store_logo' || key === 'store_favicon') {
                    if (isFileValue(data[key])) payload[key] = data[key];
                    return;
                }
                if (key === 'hapus_store_logo') {
                    if (data[key]) payload[key] = 1;
                    return;
                }
                if (key === 'midtrans_is_production') {
                    payload[key] = data[key] ? 1 : 0;
                    return;
                }
                if (key === 'header_nav') {
                    payload[key] = cleanRows(data.header_nav, ['label', 'url']).map((row) => ({
                        label: trimmed(row.label),
                        url: trimmed(row.url),
                    }));
                    return;
                }
                if (key === 'footer_links') {
                    payload[key] = buildFooterLinksPayload();
                    return;
                }
                if (key === 'footer_social') {
                    payload[key] = cleanRows(data.footer_social, ['label', 'url']).map((row) => {
                        const entry = asObject(row);
                        return {
                            platform: SOCIAL_PLATFORMS.includes(text(entry.platform)) ? text(entry.platform) : SOCIAL_PLATFORMS[0],
                            label: trimmed(entry.label),
                            url: trimmed(entry.url),
                        };
                    });
                    return;
                }
                payload[key] = orNull(data[key]);
            });
            return payload;
        });

        const options = {
            preserveScroll: true,
            onFinish: () => settingsForm.transform((data) => data),
        };

        if (needsMultipart) {
            // Unggah berkas + PUT: PHP tidak mem-parse multipart pada PUT asli, jadi pakai POST + `_method`
            // (pola yang sama dipakai kontrak §10.10 untuk carousel).
            settingsForm.transform((data) => {
                const payload = {};
                keys.forEach((key) => {
                    if (key === 'store_logo' || key === 'store_favicon') {
                        if (isFileValue(data[key])) payload[key] = data[key];
                        return;
                    }
                    if (key === 'hapus_store_logo') {
                        if (data[key]) payload[key] = 1;
                        return;
                    }
                    payload[key] = orNull(data[key]);
                });
                return { ...payload, _method: 'PUT' };
            });
            settingsForm.post(SETTINGS_URL, { ...options, forceFormData: true });
            return;
        }

        settingsForm.put(SETTINGS_URL, options);
    };

    const removeLogo = () => {
        setActionError(null);
        settingsForm.transform(() => ({ hapus_store_logo: 1, _method: 'PUT' }));
        settingsForm.post(SETTINGS_URL, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => settingsForm.transform((data) => data),
        });
    };

    const submitLanding = (event) => {
        event.preventDefault();
        const data = landingForm.data;

        landingForm.transform(() => {
            const payload = new FormData();
            payload.append('landing_hero[title]', trimmed(data.landing_hero.title));
            payload.append('landing_hero[subtitle]', orNull(data.landing_hero.subtitle) ?? '');
            payload.append('landing_hero[cta_label]', orNull(data.landing_hero.cta_label) ?? '');
            payload.append('landing_hero[cta_url]', orNull(data.landing_hero.cta_url) ?? '');
            if (isFileValue(data.landing_hero.image)) payload.append('landing_hero[image]', data.landing_hero.image);
            else payload.append('landing_hero[image]', orNull(data.landing_hero.image) ?? '');

            if (sectionKeys.announcement) {
                payload.append('landing_sections[announcement][text]', orNull(data.announcement.text) ?? '');
                payload.append('landing_sections[announcement][url]', orNull(data.announcement.url) ?? '');
                payload.append('landing_sections[announcement][is_active]', data.announcement.is_active ? '1' : '0');
            }
            if (sectionKeys.trust_strip) {
                asList(data.trust_strip)
                    .filter((row) => trimmed(asObject(row).title) !== '')
                    .forEach((row, i) => {
                        const entry = asObject(row);
                        payload.append(`landing_sections[trust_strip][${i}][icon]`, orNull(entry.icon) ?? '');
                        payload.append(`landing_sections[trust_strip][${i}][title]`, trimmed(entry.title));
                        payload.append(`landing_sections[trust_strip][${i}][subtitle]`, orNull(entry.subtitle) ?? '');
                    });
            }
            if (sectionKeys.featured) {
                payload.append('landing_sections[featured][title]', orNull(data.featured.title) ?? '');
                payload.append('landing_sections[featured][subtitle]', orNull(data.featured.subtitle) ?? '');
                payload.append('landing_sections[featured][limit]', clampInt(data.featured.limit, 1, 12, 8));
            }
            if (sectionKeys.promo) {
                payload.append('landing_sections[promo][title]', orNull(data.promo.title) ?? '');
                payload.append('landing_sections[promo][subtitle]', orNull(data.promo.subtitle) ?? '');
                payload.append('landing_sections[promo][cta_label]', orNull(data.promo.cta_label) ?? '');
                payload.append('landing_sections[promo][cta_url]', orNull(data.promo.cta_url) ?? '');
                if (isFileValue(data.promo.image)) payload.append('landing_sections[promo][image]', data.promo.image);
                else payload.append('landing_sections[promo][image]', orNull(data.promo.image) ?? '');
                payload.append('landing_sections[promo][is_active]', data.promo.is_active ? '1' : '0');
            }
            if (sectionKeys.why_us) {
                payload.append('landing_sections[why_us][title]', orNull(data.why_us_title) ?? '');
                asList(data.why_us_items)
                    .filter((row) => trimmed(asObject(row).title) !== '' && trimmed(asObject(row).body) !== '')
                    .forEach((row, i) => {
                        const entry = asObject(row);
                        payload.append(`landing_sections[why_us][items][${i}][title]`, trimmed(entry.title));
                        payload.append(`landing_sections[why_us][items][${i}][body]`, trimmed(entry.body));
                    });
            }
            if (sectionKeys.newsletter) {
                payload.append('landing_sections[newsletter][title]', orNull(data.newsletter.title) ?? '');
                payload.append('landing_sections[newsletter][subtitle]', orNull(data.newsletter.subtitle) ?? '');
                payload.append('landing_sections[newsletter][button_text]', orNull(data.newsletter.button_text) ?? '');
            }

            asList(data.landing_gallery)
                .filter((row) => !asObject(row).removed)
                .forEach((row, i) => {
                    const entry = asObject(row);
                    if (isFileValue(entry.image)) {
                        payload.append(`landing_gallery[${i}][image]`, entry.image);
                    } else {
                        payload.append(`landing_gallery[${i}][image]`, text(entry.image));
                    }
                    payload.append(`landing_gallery[${i}][caption]`, text(entry.caption));
                    payload.append(`landing_gallery[${i}][alt]`, text(entry.alt));
                });
            // Penanda wajib: tanpa ini server menganggap form tidak mengelola galeri
            // dan tidak menghapus gambar saat semua item dibuang (kontrak §10.9).
            payload.append('landing_gallery_present', '1');

            payload.append('_method', 'PUT');
            return payload;
        });

        landingForm.post(LANDING_URL, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => landingForm.transform((data) => data),
        });
    };

    const openCarouselCreate = () => {
        carouselForm.reset();
        carouselForm.clearErrors();
        setCarouselImageError(null);
        setCarouselEditing(null);
        setCarouselOpen(true);
    };

    const openCarouselEdit = (row) => {
        carouselForm.clearErrors();
        setCarouselImageError(null);
        carouselForm.setData({
            title: text(row.title),
            subtitle: text(row.subtitle),
            image: null,
            link: text(row.link),
            button_text: text(row.button_text),
            sort_order: text(row.sort_order ?? '0'),
            is_active: Boolean(row.is_active),
        });
        setCarouselEditing(row);
        setCarouselOpen(true);
    };

    const closeCarousel = () => {
        setCarouselOpen(false);
        setCarouselEditing(null);
        setCarouselImageError(null);
    };

    const submitCarousel = (event) => {
        event.preventDefault();
        const editing = carouselEditing;
        if (!editing && !isFileValue(carouselForm.data.image)) {
            setCarouselImageError('Gambar carousel wajib diunggah.');
            return;
        }
        setCarouselImageError(null);

        carouselForm.transform((data) => {
            const payload = {
                title: trimmed(data.title),
                subtitle: orNull(data.subtitle),
                link: orNull(data.link),
                button_text: orNull(data.button_text),
                sort_order: clampInt(data.sort_order, 0, 999, 0),
                is_active: data.is_active ? 1 : 0,
            };
            if (isFileValue(data.image)) payload.image = data.image;
            if (editing) payload._method = 'PUT';
            return payload;
        });

        carouselForm.post(editing ? `${CAROUSEL_URL}/${editing.id}` : CAROUSEL_URL, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => closeCarousel(),
            onFinish: () => carouselForm.transform((data) => data),
        });
    };

    const openFaqCreate = () => {
        faqForm.reset();
        faqForm.clearErrors();
        setFaqEditing(null);
        setFaqOpen(true);
    };

    const openFaqEdit = (row) => {
        faqForm.clearErrors();
        faqForm.setData({
            question: text(row.question),
            answer: text(row.answer),
            sort_order: text(row.sort_order ?? '0'),
            is_active: Boolean(row.is_active),
        });
        setFaqEditing(row);
        setFaqOpen(true);
    };

    const closeFaq = () => {
        setFaqOpen(false);
        setFaqEditing(null);
    };

    const submitFaq = (event) => {
        event.preventDefault();
        const editing = faqEditing;
        faqForm.transform((data) => {
            const payload = {
                question: trimmed(data.question),
                answer: trimmed(data.answer),
                sort_order: clampInt(data.sort_order, 0, 999, 0),
                is_active: data.is_active ? 1 : 0,
            };
            if (editing) payload._method = 'PUT';
            return payload;
        });

        faqForm.post(editing ? `${FAQ_URL}/${editing.id}` : FAQ_URL, {
            preserveScroll: true,
            onSuccess: () => closeFaq(),
            onFinish: () => faqForm.transform((data) => data),
        });
    };

    const confirmDelete = () => {
        const target = carouselPendingDelete ? { url: `${CAROUSEL_URL}/${carouselPendingDelete.id}` } : faqPendingDelete ? { url: `${FAQ_URL}/${faqPendingDelete.id}` } : null;
        if (!target) return;
        setDeleting(true);
        setActionError(null);
        router.delete(target.url, {
            preserveScroll: true,
            onError: (errors) => {
                const first = Object.values(errors)[0];
                setActionError(typeof first === 'string' ? first : 'Data gagal dihapus. Coba lagi.');
            },
            onFinish: () => {
                setDeleting(false);
                setCarouselPendingDelete(null);
                setFaqPendingDelete(null);
            },
        });
    };

    const carouselColumns = [
        {
            key: 'image',
            header: 'Gambar',
            render: (row) => <Thumb src={text(row.image) || null} size={48} />,
        },
        {
            key: 'title',
            header: 'Judul',
            render: (row) => (
                <span className="block max-w-[240px] truncate font-semibold text-ink">
                    {text(row.title) || '-'}
                </span>
            ),
        },
        {
            key: 'link',
            header: 'Tautan',
            render: (row) => (
                <span className="block max-w-[200px] truncate text-meta text-ink-soft">{text(row.link) || '-'}</span>
            ),
        },
        {
            key: 'sort_order',
            header: 'Urutan',
            render: (row) => <span className="text-meta">{text(row.sort_order ?? 0)}</span>,
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (row) => <StatusCell active={Boolean(row.is_active)} />,
        },
        {
            key: 'aksi',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openCarouselEdit(row)}>
                        Ubah
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setCarouselPendingDelete(row)}>
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    const faqColumns = [
        {
            key: 'question',
            header: 'Pertanyaan',
            render: (row) => (
                <span className="block max-w-[320px] truncate font-semibold text-ink">{text(row.question) || '-'}</span>
            ),
        },
        {
            key: 'answer',
            header: 'Jawaban',
            render: (row) => (
                <span className="block max-w-[360px] truncate text-meta text-ink-soft">{text(row.answer) || '-'}</span>
            ),
        },
        {
            key: 'sort_order',
            header: 'Urutan',
            render: (row) => <span className="text-meta">{text(row.sort_order ?? 0)}</span>,
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (row) => <StatusCell active={Boolean(row.is_active)} />,
        },
        {
            key: 'aksi',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openFaqEdit(row)}>
                        Ubah
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setFaqPendingDelete(row)}>
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    const renderUmum = () => (
        <form onSubmit={(event) => submitSettings('umum', event)} noValidate={false}>
            <SectionCard title="Identitas toko" description="Dipakai di header, footer, dan metadata halaman.">
                <Field label="Nama toko" htmlFor="store_name" required error={settingsForm.errors.store_name}>
                    <Input
                        id="store_name"
                        name="store_name"
                        maxLength={100}
                        value={settingsForm.data.store_name}
                        error={settingsForm.errors.store_name}
                        onChange={(event) => setField('store_name', event.target.value)}
                    />
                </Field>
                <Field label="Tagline toko" htmlFor="store_tagline" hint="Muncul di bawah nama toko." error={settingsForm.errors.store_tagline}>
                    <Textarea
                        id="store_tagline"
                        name="store_tagline"
                        rows={2}
                        maxLength={150}
                        value={settingsForm.data.store_tagline}
                        error={settingsForm.errors.store_tagline}
                        onChange={(event) => setField('store_tagline', event.target.value)}
                    />
                </Field>
            </SectionCard>

            <SectionCard title="Logo dan favicon">
                <ImageField
                    id="store_logo"
                    label="Logo toko"
                    hint="Rasio 1:1, tampil di header dan struk."
                    message={`Logo harus gambar ${IMAGE_TYPE_LABEL}.`}
                    accept={LOGO_ACCEPT}
                    extensions={LOGO_EXTENSIONS}
                    maxKb={2048}
                    file={isFileValue(settingsForm.data.store_logo) ? settingsForm.data.store_logo : null}
                    currentPath={text(groups.umum.store_logo) || null}
                    error={logoError || settingsForm.errors.store_logo}
                    onSelect={(file) => {
                        const message = checkUpload(file, {
                            maxKb: 2048,
                            extensions: LOGO_EXTENSIONS,
                            message: `Logo harus gambar ${IMAGE_TYPE_LABEL} maksimal 2 MB.`,
                        });
                        setLogoError(message);
                        setField('store_logo', message ? null : file);
                    }}
                />
                {text(groups.umum.store_logo) && !isFileValue(settingsForm.data.store_logo) ? (
                    <Button variant="secondary" onClick={() => settingsForm.setData('hapus_store_logo', true)} disabled={settingsForm.processing}>
                        Hapus logo
                    </Button>
                ) : null}
                {settingsForm.data.hapus_store_logo ? (
                    <InlineNotice tone="warning" title="Logo akan dihapus saat kamu menyimpan." />
                ) : null}

                <ImageField
                    id="store_favicon"
                    label="Favicon toko"
                    hint="Ikon kecil di tab browser."
                    message="Favicon harus gambar maksimal 512 KB."
                    accept={FAVICON_ACCEPT}
                    extensions={FAVICON_EXTENSIONS}
                    maxKb={512}
                    file={isFileValue(settingsForm.data.store_favicon) ? settingsForm.data.store_favicon : null}
                    currentPath={text(groups.umum.store_favicon) || null}
                    error={faviconError || settingsForm.errors.store_favicon}
                    onSelect={(file) => {
                        const message = checkUpload(file, {
                            maxKb: 512,
                            extensions: FAVICON_EXTENSIONS,
                            message: 'Favicon harus gambar maksimal 512 KB.',
                        });
                        setFaviconError(message);
                        setField('store_favicon', message ? null : file);
                    }}
                />
            </SectionCard>

            {settingsForm.errors.hapus_store_logo ? (
                <InlineNotice tone="error" title={settingsForm.errors.hapus_store_logo} />
            ) : null}

            <StickySave
                dirty={settingsForm.isDirty}
                processing={settingsForm.processing}
                resetLabel="Batalkan perubahan"
                onReset={() => {
                    settingsForm.reset();
                    setLogoError(null);
                    setFaviconError(null);
                }}
            />
        </form>
    );

    const renderHeroSection = () => (
        <SectionCard title="Hero" description="Bagian paling atas halaman beranda.">
            <Field label="Judul hero" htmlFor="landing_hero_title" required error={landingForm.errors['landing_hero.title']}>
                <Input
                    id="landing_hero_title"
                    maxLength={150}
                    value={landingForm.data.landing_hero.title}
                    error={landingForm.errors['landing_hero.title']}
                    onChange={(event) =>
                        landingForm.setData('landing_hero', { ...landingForm.data.landing_hero, title: event.target.value })
                    }
                />
            </Field>
            <Field label="Subjudul hero" htmlFor="landing_hero_subtitle" error={landingForm.errors['landing_hero.subtitle']}>
                <Textarea
                    id="landing_hero_subtitle"
                    rows={2}
                    maxLength={255}
                    value={landingForm.data.landing_hero.subtitle}
                    error={landingForm.errors['landing_hero.subtitle']}
                    onChange={(event) =>
                        landingForm.setData('landing_hero', { ...landingForm.data.landing_hero, subtitle: event.target.value })
                    }
                />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Label tombol" htmlFor="landing_hero_cta_label" error={landingForm.errors['landing_hero.cta_label']}>
                    <Input
                        id="landing_hero_cta_label"
                        maxLength={60}
                        value={landingForm.data.landing_hero.cta_label}
                        error={landingForm.errors['landing_hero.cta_label']}
                        onChange={(event) =>
                            landingForm.setData('landing_hero', { ...landingForm.data.landing_hero, cta_label: event.target.value })
                        }
                    />
                </Field>
                <Field label="Tautan tombol" htmlFor="landing_hero_cta_url" error={landingForm.errors['landing_hero.cta_url']}>
                    <Input
                        id="landing_hero_cta_url"
                        maxLength={255}
                        placeholder="/produk"
                        value={landingForm.data.landing_hero.cta_url}
                        error={landingForm.errors['landing_hero.cta_url']}
                        onChange={(event) =>
                            landingForm.setData('landing_hero', { ...landingForm.data.landing_hero, cta_url: event.target.value })
                        }
                    />
                </Field>
            </div>
            <Field
                label="Gambar hero"
                htmlFor="landing_hero_image"
                accept={LOGO_ACCEPT}
                maxKb={2048}
                extensions={LOGO_EXTENSIONS}
                file={isFileValue(landingForm.data.landing_hero.image) ? landingForm.data.landing_hero.image : null}
                currentPath={text(landingForm.data.landing_hero.image) || null}
                error={landingForm.errors['landing_hero.image']}
                onSelect={(file) => landingForm.setData('landing_hero', { ...landingForm.data.landing_hero, image: file })}
            />
        </SectionCard>
    );

    const renderLanding = () => (
        <form onSubmit={submitLanding}>
            {renderHeroSection()}

            {sectionKeys.announcement ? (
                <SectionCard title="Pengumuman" description="Bar tipis di atas hero.">
                    <Field label="Teks pengumuman" htmlFor="announcement_text" error={landingForm.errors['landing_sections.announcement.text']}>
                        <Input
                            id="announcement_text"
                            maxLength={255}
                            value={landingForm.data.announcement.text}
                            error={landingForm.errors['landing_sections.announcement.text']}
                            onChange={(event) =>
                                landingForm.setData('announcement', { ...landingForm.data.announcement, text: event.target.value })
                            }
                        />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Tautan pengumuman" htmlFor="announcement_url" error={landingForm.errors['landing_sections.announcement.url']}>
                            <Input
                                id="announcement_url"
                                maxLength={255}
                                value={landingForm.data.announcement.url}
                                error={landingForm.errors['landing_sections.announcement.url']}
                                onChange={(event) =>
                                    landingForm.setData('announcement', { ...landingForm.data.announcement, url: event.target.value })
                                }
                            />
                        </Field>
                        <Field label="Status pengumuman" htmlFor="announcement_active" error={landingForm.errors['landing_sections.announcement.is_active']}>
                            <Select
                                id="announcement_active"
                                value={landingForm.data.announcement.is_active ? '1' : '0'}
                                error={landingForm.errors['landing_sections.announcement.is_active']}
                                onChange={(event) =>
                                    landingForm.setData('announcement', {
                                        ...landingForm.data.announcement,
                                        is_active: event.target.value === '1',
                                    })
                                }
                            >
                                <option value="1">Tampil</option>
                                <option value="0">Disembunyikan</option>
                            </Select>
                        </Field>
                    </div>
                </SectionCard>
            ) : null}

            {sectionKeys.trust_strip ? (
                <SectionCard title="Keunggulan" description={`Maksimal ${MAX_TRUST} item.`}>
                    <div className="flex flex-col gap-3">
                        {asList(landingForm.data.trust_strip).map((row, index) => (
                            <ArrayRow
                                key={`trust-${index}`}
                                removeLabel={`Hapus keunggulan ke-${index + 1}`}
                                onRemove={() =>
                                    landingForm.setData(
                                        'trust_strip',
                                        asList(landingForm.data.trust_strip).filter((_, position) => position !== index)
                                    )
                                }
                            >
                                <Field label="Ikon" htmlFor={fieldId('trust_icon', index)} error={landingForm.errors[`landing_sections.trust_strip.${index}.icon`]}>
                                    <Select
                                        id={fieldId('trust_icon', index)}
                                        value={row.icon}
                                        error={landingForm.errors[`landing_sections.trust_strip.${index}.icon`]}
                                        onChange={(event) =>
                                            landingForm.setData(
                                                'trust_strip',
                                                asList(landingForm.data.trust_strip).map((item, position) =>
                                                    position === index ? { ...item, icon: event.target.value } : item
                                                )
                                            )
                                        }
                                    >
                                        <option value="">Tanpa ikon</option>
                                        {TRUST_ICON_KEYS.map((key) => (
                                            <option key={key} value={key}>
                                                {key}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                                <Field label="Judul" htmlFor={fieldId('trust_title', index)} error={landingForm.errors[`landing_sections.trust_strip.${index}.title`]}>
                                    <Input
                                        id={fieldId('trust_title', index)}
                                        maxLength={80}
                                        value={row.title}
                                        error={landingForm.errors[`landing_sections.trust_strip.${index}.title`]}
                                        onChange={(event) =>
                                            landingForm.setData(
                                                'trust_strip',
                                                asList(landingForm.data.trust_strip).map((item, position) =>
                                                    position === index ? { ...item, title: event.target.value } : item
                                                )
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Keterangan" htmlFor={fieldId('trust_subtitle', index)} error={landingForm.errors[`landing_sections.trust_strip.${index}.subtitle`]}>
                                    <Input
                                        id={fieldId('trust_subtitle', index)}
                                        maxLength={120}
                                        value={row.subtitle}
                                        error={landingForm.errors[`landing_sections.trust_strip.${index}.subtitle`]}
                                        onChange={(event) =>
                                            landingForm.setData(
                                                'trust_strip',
                                                asList(landingForm.data.trust_strip).map((item, position) =>
                                                    position === index ? { ...item, subtitle: event.target.value } : item
                                                )
                                            )
                                        }
                                    />
                                </Field>
                            </ArrayRow>
                        ))}
                    </div>
                    <div>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                landingForm.setData('trust_strip', [
                                    ...asList(landingForm.data.trust_strip),
                                    { icon: TRUST_ICON_KEYS[0] ?? '', title: '', subtitle: '' },
                                ])
                            }
                            disabled={asList(landingForm.data.trust_strip).length >= MAX_TRUST}
                        >
                            Tambah keunggulan
                        </Button>
                    </div>
                </SectionCard>
            ) : null}

            {sectionKeys.featured ? (
                <SectionCard title="Produk unggulan">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Judul bagian" htmlFor="featured_title" error={landingForm.errors['landing_sections.featured.title']}>
                            <Input
                                id="featured_title"
                                maxLength={80}
                                value={landingForm.data.featured.title}
                                error={landingForm.errors['landing_sections.featured.title']}
                                onChange={(event) => landingForm.setData('featured', { ...landingForm.data.featured, title: event.target.value })}
                            />
                        </Field>
                        <Field label="Subjudul bagian" htmlFor="featured_subtitle" error={landingForm.errors['landing_sections.featured.subtitle']}>
                            <Input
                                id="featured_subtitle"
                                maxLength={120}
                                value={landingForm.data.featured.subtitle}
                                error={landingForm.errors['landing_sections.featured.subtitle']}
                                onChange={(event) => landingForm.setData('featured', { ...landingForm.data.featured, subtitle: event.target.value })}
                            />
                        </Field>
                    </div>
                    <Field label="Jumlah produk" htmlFor="featured_limit" hint="Antara 1 sampai 12." error={landingForm.errors['landing_sections.featured.limit']}>
                        <Input
                            id="featured_limit"
                            type="number"
                            min={1}
                            max={12}
                            className="max-w-[160px]"
                            value={landingForm.data.featured.limit}
                            error={landingForm.errors['landing_sections.featured.limit']}
                            onChange={(event) => landingForm.setData('featured', { ...landingForm.data.featured, limit: event.target.value })}
                        />
                    </Field>
                </SectionCard>
            ) : null}

            {sectionKeys.promo ? (
                <SectionCard title="Promo">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Judul promo" htmlFor="promo_title" error={landingForm.errors['landing_sections.promo.title']}>
                            <Input
                                id="promo_title"
                                maxLength={80}
                                value={landingForm.data.promo.title}
                                error={landingForm.errors['landing_sections.promo.title']}
                                onChange={(event) => landingForm.setData('promo', { ...landingForm.data.promo, title: event.target.value })}
                            />
                        </Field>
                        <Field label="Subjudul promo" htmlFor="promo_subtitle" error={landingForm.errors['landing_sections.promo.subtitle']}>
                            <Input
                                id="promo_subtitle"
                                maxLength={120}
                                value={landingForm.data.promo.subtitle}
                                error={landingForm.errors['landing_sections.promo.subtitle']}
                                onChange={(event) => landingForm.setData('promo', { ...landingForm.data.promo, subtitle: event.target.value })}
                            />
                        </Field>
                        <Field label="Label tombol" htmlFor="promo_cta_label" error={landingForm.errors['landing_sections.promo.cta_label']}>
                            <Input
                                id="promo_cta_label"
                                maxLength={60}
                                value={landingForm.data.promo.cta_label}
                                error={landingForm.errors['landing_sections.promo.cta_label']}
                                onChange={(event) => landingForm.setData('promo', { ...landingForm.data.promo, cta_label: event.target.value })}
                            />
                        </Field>
                        <Field label="Tautan tombol" htmlFor="promo_cta_url" error={landingForm.errors['landing_sections.promo.cta_url']}>
                            <Input
                                id="promo_cta_url"
                                maxLength={255}
                                value={landingForm.data.promo.cta_url}
                                error={landingForm.errors['landing_sections.promo.cta_url']}
                                onChange={(event) => landingForm.setData('promo', { ...landingForm.data.promo, cta_url: event.target.value })}
                            />
                        </Field>
                    </div>
                    <Field
                        label="Gambar promo"
                        htmlFor="promo_image"
                        accept={LOGO_ACCEPT}
                        maxKb={2048}
                        extensions={LOGO_EXTENSIONS}
                        file={isFileValue(landingForm.data.promo.image) ? landingForm.data.promo.image : null}
                        currentPath={text(landingForm.data.promo.image) || null}
                        error={landingForm.errors['landing_sections.promo.image']}
                        onSelect={(file) => landingForm.setData('promo', { ...landingForm.data.promo, image: file })}
                    />
                    <Field label="Status promo" htmlFor="promo_active" error={landingForm.errors['landing_sections.promo.is_active']}>
                        <Select
                            id="promo_active"
                            className="max-w-[240px]"
                            value={landingForm.data.promo.is_active ? '1' : '0'}
                            error={landingForm.errors['landing_sections.promo.is_active']}
                            onChange={(event) =>
                                landingForm.setData('promo', { ...landingForm.data.promo, is_active: event.target.value === '1' })
                            }
                        >
                            <option value="1">Tampil</option>
                            <option value="0">Disembunyikan</option>
                        </Select>
                    </Field>
                </SectionCard>
            ) : null}

            {sectionKeys.why_us ? (
                <SectionCard title="Kenapa beli di sini" description={`Maksimal ${MAX_WHY_US} item.`}>
                    <Field label="Judul bagian" htmlFor="why_us_title" error={landingForm.errors['landing_sections.why_us.title']}>
                        <Input
                            id="why_us_title"
                            maxLength={80}
                            value={landingForm.data.why_us_title}
                            error={landingForm.errors['landing_sections.why_us.title']}
                            onChange={(event) => landingForm.setData('why_us_title', event.target.value)}
                        />
                    </Field>
                    <div className="flex flex-col gap-3">
                        {asList(landingForm.data.why_us_items).map((row, index) => (
                            <ArrayRow
                                key={`why-${index}`}
                                removeLabel={`Hapus alasan ke-${index + 1}`}
                                onRemove={() =>
                                    landingForm.setData(
                                        'why_us_items',
                                        asList(landingForm.data.why_us_items).filter((_, position) => position !== index)
                                    )
                                }
                            >
                                <Field label="Judul" htmlFor={fieldId('why_title', index)} error={landingForm.errors[`landing_sections.why_us.items.${index}.title`]}>
                                    <Input
                                        id={fieldId('why_title', index)}
                                        maxLength={80}
                                        value={row.title}
                                        error={landingForm.errors[`landing_sections.why_us.items.${index}.title`]}
                                        onChange={(event) =>
                                            landingForm.setData(
                                                'why_us_items',
                                                asList(landingForm.data.why_us_items).map((item, position) =>
                                                    position === index ? { ...item, title: event.target.value } : item
                                                )
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Penjelasan" htmlFor={fieldId('why_body', index)} error={landingForm.errors[`landing_sections.why_us.items.${index}.body`]}>
                                    <Textarea
                                        id={fieldId('why_body', index)}
                                        rows={2}
                                        maxLength={255}
                                        value={row.body}
                                        error={landingForm.errors[`landing_sections.why_us.items.${index}.body`]}
                                        onChange={(event) =>
                                            landingForm.setData(
                                                'why_us_items',
                                                asList(landingForm.data.why_us_items).map((item, position) =>
                                                    position === index ? { ...item, body: event.target.value } : item
                                                )
                                            )
                                        }
                                    />
                                </Field>
                            </ArrayRow>
                        ))}
                    </div>
                    <div>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                landingForm.setData('why_us_items', [
                                    ...asList(landingForm.data.why_us_items),
                                    { title: '', body: '' },
                                ])
                            }
                            disabled={asList(landingForm.data.why_us_items).length >= MAX_WHY_US}
                        >
                            Tambah alasan
                        </Button>
                    </div>
                </SectionCard>
            ) : null}

            {sectionKeys.newsletter ? (
                <SectionCard title="Newsletter">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Judul" htmlFor="newsletter_title" error={landingForm.errors['landing_sections.newsletter.title']}>
                            <Input
                                id="newsletter_title"
                                maxLength={80}
                                value={landingForm.data.newsletter.title}
                                error={landingForm.errors['landing_sections.newsletter.title']}
                                onChange={(event) =>
                                    landingForm.setData('newsletter', { ...landingForm.data.newsletter, title: event.target.value })
                                }
                            />
                        </Field>
                        <Field label="Subjudul" htmlFor="newsletter_subtitle" error={landingForm.errors['landing_sections.newsletter.subtitle']}>
                            <Input
                                id="newsletter_subtitle"
                                maxLength={120}
                                value={landingForm.data.newsletter.subtitle}
                                error={landingForm.errors['landing_sections.newsletter.subtitle']}
                                onChange={(event) =>
                                    landingForm.setData('newsletter', { ...landingForm.data.newsletter, subtitle: event.target.value })
                                }
                            />
                        </Field>
                    </div>
                    <Field label="Teks tombol" htmlFor="newsletter_button_text" error={landingForm.errors['landing_sections.newsletter.button_text']}>
                        <Input
                            id="newsletter_button_text"
                            maxLength={40}
                            className="max-w-[240px]"
                            value={landingForm.data.newsletter.button_text}
                            error={landingForm.errors['landing_sections.newsletter.button_text']}
                            onChange={(event) =>
                                landingForm.setData('newsletter', { ...landingForm.data.newsletter, button_text: event.target.value })
                            }
                        />
                    </Field>
                </SectionCard>
            ) : null}

            <GalleryCard
                items={asList(landingForm.data.landing_gallery)}
                onChange={(items) => landingForm.setData('landing_gallery', items)}
                errors={landingForm.errors}
                disabled={landingForm.processing}
            />

            <StickySave
                dirty={landingForm.isDirty}
                processing={landingForm.processing}
                resetLabel="Batalkan perubahan"
                onReset={() => landingForm.reset()}
                saveLabel="Simpan konten landing"
            />
        </form>
    );

    const renderCarousel = () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-meta text-slate-600">Carousel tampil di bagian atas beranda, urut dari angka terkecil.</p>
                <Button onClick={openCarouselCreate}>Tambah carousel</Button>
            </div>

            {actionError ? <InlineNotice tone="error" title={actionError} onDismiss={() => setActionError(null)} /> : null}

            <DataTable
                caption="Daftar carousel"
                columns={carouselColumns}
                rows={carouselRows}
                loading={reloading}
                error={null}
                onRetry={reload}
                emptyTitle="Belum ada carousel"
                emptyDescription="Tambahkan carousel untuk menampilkan banner di beranda."
            />
        </div>
    );

    const renderFaq = () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-meta text-slate-600">FAQ tampil di bagian FAQ beranda, urut dari angka terkecil.</p>
                <Button onClick={openFaqCreate}>Tambah FAQ</Button>
            </div>

            {actionError ? <InlineNotice tone="error" title={actionError} onDismiss={() => setActionError(null)} /> : null}

            <DataTable
                caption="Daftar FAQ"
                columns={faqColumns}
                rows={faqRows}
                loading={reloading}
                error={null}
                onRetry={reload}
                emptyTitle="Belum ada FAQ"
                emptyDescription="Tambahkan pertanyaan yang sering ditanyakan pembeli."
            />
        </div>
    );

    const renderHeader = () => (
        <form onSubmit={(event) => submitSettings('header', event)}>
            <SectionCard title="Menu navigasi" description={`Maksimal ${MAX_NAV} item, tampil di header toko.`}>
                <div className="flex flex-col gap-3">
                    {asList(settingsForm.data.header_nav).map((row, index) => (
                        <ArrayRow key={`nav-${index}`} removeLabel={`Hapus menu ke-${index + 1}`} onRemove={() => removeRow('header_nav', index)}>
                            <Field
                                label="Label"
                                htmlFor={fieldId('nav_label', index)}
                                required
                                error={settingsForm.errors[`header_nav.${index}.label`]}
                            >
                                <Input
                                    id={fieldId('nav_label', index)}
                                    maxLength={40}
                                    value={row.label}
                                    error={settingsForm.errors[`header_nav.${index}.label`]}
                                    onChange={(event) => updateRow('header_nav', index, 'label', event.target.value)}
                                />
                            </Field>
                            <Field label="URL" htmlFor={fieldId('nav_url', index)} required error={settingsForm.errors[`header_nav.${index}.url`]}>
                                <Input
                                    id={fieldId('nav_url', index)}
                                    maxLength={255}
                                    placeholder="/produk"
                                    value={row.url}
                                    error={settingsForm.errors[`header_nav.${index}.url`]}
                                    onChange={(event) => updateRow('header_nav', index, 'url', event.target.value)}
                                />
                            </Field>
                        </ArrayRow>
                    ))}
                </div>
                {asList(settingsForm.data.header_nav).length === 0 ? (
                    <p className="text-meta text-slate-500">Belum ada menu.</p>
                ) : null}
                <div>
                    <Button
                        variant="secondary"
                        disabled={asList(settingsForm.data.header_nav).length >= MAX_NAV}
                        onClick={() => addRow('header_nav', { label: '', url: '' }, MAX_NAV)}
                    >
                        Tambah menu
                    </Button>
                </div>
            </SectionCard>

            <StickySave
                dirty={settingsForm.isDirty}
                processing={settingsForm.processing}
                resetLabel="Batalkan perubahan"
                onReset={() => settingsForm.reset()}
            />
        </form>
    );

    const renderFooter = () => (
        <form onSubmit={(event) => submitSettings('footer', event)}>
            <SectionCard title="Tentang toko">
                <Field label="Tentang toko (footer)" htmlFor="footer_about" error={settingsForm.errors.footer_about}>
                    <Textarea
                        id="footer_about"
                        rows={3}
                        maxLength={500}
                        value={settingsForm.data.footer_about}
                        error={settingsForm.errors.footer_about}
                        onChange={(event) => setField('footer_about', event.target.value)}
                    />
                </Field>
            </SectionCard>

            <SectionCard
                title="Copyright"
                description="Teks hak cipta di baris paling bawah footer halaman pembeli."
            >
                <Field
                    label="Copyright notice"
                    htmlFor="footer_copyright"
                    hint="Kosongkan agar otomatis menjadi © {tahun} {nama toko}. Placeholder {tahun} dan {toko} diisi otomatis."
                    error={settingsForm.errors.footer_copyright}
                >
                    <Input
                        id="footer_copyright"
                        maxLength={200}
                        placeholder="© {tahun} {toko}. Semua hak dilindungi."
                        value={settingsForm.data.footer_copyright}
                        error={settingsForm.errors.footer_copyright}
                        aria-describedby={
                            settingsForm.errors.footer_copyright
                                ? 'footer_copyright-error'
                                : 'footer_copyright-hint'
                        }
                        onChange={(event) => setField('footer_copyright', event.target.value)}
                    />
                </Field>
            </SectionCard>

            <SectionCard
                title="Tautan footer"
                description={footerLinksMode === 'nested' ? `Maksimal ${MAX_LINKS} kolom tautan.` : `Maksimal ${MAX_LINKS} tautan.`}
            >
                {settingsForm.errors.footer_links ? (
                    <InlineNotice tone="error" title={settingsForm.errors.footer_links} />
                ) : null}
                {footerLinksError ? <InlineNotice tone="error" title={footerLinksError} /> : null}

                {footerLinksMode === 'flat' ? (
                    <div className="flex flex-col gap-3">
                        {asList(settingsForm.data.footer_links).map((row, index) => (
                            <ArrayRow key={`link-${index}`} removeLabel={`Hapus tautan ke-${index + 1}`} onRemove={() => removeRow('footer_links', index)}>
                                <Field label="Label" htmlFor={fieldId('link_label', index)} required error={settingsForm.errors[`footer_links.${index}.label`]}>
                                    <Input
                                        id={fieldId('link_label', index)}
                                        maxLength={40}
                                        value={row.label}
                                        error={settingsForm.errors[`footer_links.${index}.label`]}
                                        onChange={(event) => updateRow('footer_links', index, 'label', event.target.value)}
                                    />
                                </Field>
                                <Field label="URL" htmlFor={fieldId('link_url', index)} required error={settingsForm.errors[`footer_links.${index}.url`]}>
                                    <Input
                                        id={fieldId('link_url', index)}
                                        maxLength={255}
                                        placeholder="/kontak-kami"
                                        value={row.url}
                                        error={settingsForm.errors[`footer_links.${index}.url`]}
                                        onChange={(event) => updateRow('footer_links', index, 'url', event.target.value)}
                                    />
                                </Field>
                            </ArrayRow>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {asList(settingsForm.data.footer_links).map((column, columnIndex) => (
                            <div key={`column-${columnIndex}`} className="rounded-lg border border-line p-3">
                                <div className="flex items-start gap-2">
                                    <Field
                                        label="Judul kolom"
                                        htmlFor={fieldId('column_title', columnIndex)}
                                        required
                                        className="min-w-0 flex-1"
                                        error={settingsForm.errors[`footer_links.${columnIndex}.label`]}
                                    >
                                        <Input
                                            id={fieldId('column_title', columnIndex)}
                                            maxLength={40}
                                            value={column.title}
                                            error={settingsForm.errors[`footer_links.${columnIndex}.label`]}
                                            onChange={(event) => updateColumn(columnIndex, { ...column, title: event.target.value })}
                                        />
                                    </Field>
                                    <IconButton
                                        label={`Hapus kolom ke-${columnIndex + 1}`}
                                        className="mt-6 text-danger"
                                        onClick={() =>
                                            setRows(
                                                'footer_links',
                                                asList(settingsForm.data.footer_links).filter((_, position) => position !== columnIndex)
                                            )
                                        }
                                    >
                                        <TrashIcon size={18} />
                                    </IconButton>
                                </div>

                                <div className="mt-3 flex flex-col gap-3">
                                    {asList(column.items).map((item, itemIndex) => (
                                        <ArrayRow
                                            key={`column-${columnIndex}-item-${itemIndex}`}
                                            removeLabel={`Hapus tautan ke-${itemIndex + 1} pada kolom ${columnIndex + 1}`}
                                            onRemove={() =>
                                                updateColumn(columnIndex, {
                                                    ...column,
                                                    items: asList(column.items).filter((_, position) => position !== itemIndex),
                                                })
                                            }
                                        >
                                            <Field
                                                label="Label"
                                                htmlFor={fieldId(`column_${columnIndex}_label`, itemIndex)}
                                                required
                                                error={settingsForm.errors[`footer_links.${columnIndex}.items.${itemIndex}.label`]}
                                            >
                                                <Input
                                                    id={fieldId(`column_${columnIndex}_label`, itemIndex)}
                                                    maxLength={40}
                                                    value={item.label}
                                                    error={settingsForm.errors[`footer_links.${columnIndex}.items.${itemIndex}.label`]}
                                                    onChange={(event) =>
                                                        updateColumn(columnIndex, {
                                                            ...column,
                                                            items: asList(column.items).map((link, position) =>
                                                                position === itemIndex ? { ...link, label: event.target.value } : link
                                                            ),
                                                        })
                                                    }
                                                />
                                            </Field>
                                            <Field
                                                label="URL"
                                                htmlFor={fieldId(`column_${columnIndex}_url`, itemIndex)}
                                                required
                                                error={settingsForm.errors[`footer_links.${columnIndex}.items.${itemIndex}.url`]}
                                            >
                                                <Input
                                                    id={fieldId(`column_${columnIndex}_url`, itemIndex)}
                                                    maxLength={255}
                                                    value={item.url}
                                                    error={settingsForm.errors[`footer_links.${columnIndex}.items.${itemIndex}.url`]}
                                                    onChange={(event) =>
                                                        updateColumn(columnIndex, {
                                                            ...column,
                                                            items: asList(column.items).map((link, position) =>
                                                                position === itemIndex ? { ...link, url: event.target.value } : link
                                                            ),
                                                        })
                                                    }
                                                />
                                            </Field>
                                        </ArrayRow>
                                    ))}
                                </div>

                                <div className="mt-3">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            updateColumn(columnIndex, {
                                                ...column,
                                                items: [...asList(column.items), { label: '', url: '' }],
                                            })
                                        }
                                    >
                                        Tambah tautan
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <Button
                        variant="secondary"
                        disabled={asList(settingsForm.data.footer_links).length >= MAX_LINKS}
                        onClick={() =>
                            addRow('footer_links', footerLinksMode === 'flat' ? { label: '', url: '' } : { title: '', items: [{ label: '', url: '' }] }, MAX_LINKS)
                        }
                    >
                        {footerLinksMode === 'flat' ? 'Tambah tautan' : 'Tambah kolom'}
                    </Button>
                </div>
            </SectionCard>

            <SectionCard title="Media sosial" description={`Maksimal ${MAX_SOCIAL} akun.`}>
                <div className="flex flex-col gap-3">
                    {asList(settingsForm.data.footer_social).map((row, index) => {
                        const Icon = SOCIAL_ICONS[text(row.platform).toLowerCase()] ?? null;
                        return (
                            <ArrayRow key={`social-${index}`} removeLabel={`Hapus media sosial ke-${index + 1}`} onRemove={() => removeRow('footer_social', index)}>
                                <Field label="Platform" htmlFor={fieldId('social_platform', index)} error={settingsForm.errors[`footer_social.${index}.platform`]}>
                                    <div className="flex items-center gap-2">
                                        {Icon ? (
                                            <span className="flex h-field w-field shrink-0 items-center justify-center rounded-md border border-line bg-surface text-ink-soft">
                                                <Icon size={18} />
                                            </span>
                                        ) : null}
                                        <Select
                                            id={fieldId('social_platform', index)}
                                            value={row.platform}
                                            error={settingsForm.errors[`footer_social.${index}.platform`]}
                                            onChange={(event) => updateRow('footer_social', index, 'platform', event.target.value)}
                                        >
                                            {SOCIAL_PLATFORMS.map((platform) => (
                                                <option key={platform} value={platform}>
                                                    {platform}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </Field>
                                <Field label="Nama" htmlFor={fieldId('social_label', index)} required error={settingsForm.errors[`footer_social.${index}.label`]}>
                                    <Input
                                        id={fieldId('social_label', index)}
                                        maxLength={40}
                                        value={row.label}
                                        error={settingsForm.errors[`footer_social.${index}.label`]}
                                        onChange={(event) => updateRow('footer_social', index, 'label', event.target.value)}
                                    />
                                </Field>
                                <Field label="URL" htmlFor={fieldId('social_url', index)} required error={settingsForm.errors[`footer_social.${index}.url`]}>
                                    <Input
                                        id={fieldId('social_url', index)}
                                        maxLength={255}
                                        placeholder="https://"
                                        value={row.url}
                                        error={settingsForm.errors[`footer_social.${index}.url`]}
                                        onChange={(event) => updateRow('footer_social', index, 'url', event.target.value)}
                                    />
                                </Field>
                            </ArrayRow>
                        );
                    })}
                </div>
                <div>
                    <Button
                        variant="secondary"
                        disabled={asList(settingsForm.data.footer_social).length >= MAX_SOCIAL}
                        onClick={() => addRow('footer_social', { platform: SOCIAL_PLATFORMS[0], label: '', url: '' }, MAX_SOCIAL)}
                    >
                        Tambah media sosial
                    </Button>
                </div>
            </SectionCard>

            <StickySave
                dirty={settingsForm.isDirty}
                processing={settingsForm.processing}
                resetLabel="Batalkan perubahan"
                onReset={() => {
                    settingsForm.reset();
                    setFooterLinksError(null);
                }}
            />
        </form>
    );

    const renderKontak = () => (
        <form onSubmit={(event) => submitSettings('kontak', event)}>
            <SectionCard title="Kontak toko">
                <Field label="Email kontak" htmlFor="contact_email" error={settingsForm.errors.contact_email}>
                    <Input
                        id="contact_email"
                        type="email"
                        maxLength={150}
                        value={settingsForm.data.contact_email}
                        error={settingsForm.errors.contact_email}
                        onChange={(event) => setField('contact_email', event.target.value)}
                    />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nomor telepon" htmlFor="contact_phone" error={settingsForm.errors.contact_phone}>
                        <Input
                            id="contact_phone"
                            maxLength={30}
                            value={settingsForm.data.contact_phone}
                            error={settingsForm.errors.contact_phone}
                            onChange={(event) => setField('contact_phone', event.target.value)}
                        />
                    </Field>
                    <Field label="Nomor WhatsApp" htmlFor="contact_whatsapp" error={settingsForm.errors.contact_whatsapp}>
                        <Input
                            id="contact_whatsapp"
                            maxLength={30}
                            value={settingsForm.data.contact_whatsapp}
                            error={settingsForm.errors.contact_whatsapp}
                            onChange={(event) => setField('contact_whatsapp', event.target.value)}
                        />
                    </Field>
                </div>
                <Field label="Alamat toko" htmlFor="contact_address" error={settingsForm.errors.contact_address}>
                    <Textarea
                        id="contact_address"
                        rows={3}
                        maxLength={500}
                        value={settingsForm.data.contact_address}
                        error={settingsForm.errors.contact_address}
                        onChange={(event) => setField('contact_address', event.target.value)}
                    />
                </Field>
                <Field label="URL peta (embed)" htmlFor="contact_map_embed" error={settingsForm.errors.contact_map_embed}>
                    <Textarea
                        id="contact_map_embed"
                        rows={3}
                        maxLength={1000}
                        value={settingsForm.data.contact_map_embed}
                        error={settingsForm.errors.contact_map_embed}
                        onChange={(event) => setField('contact_map_embed', event.target.value)}
                    />
                </Field>
            </SectionCard>

            <StickySave
                dirty={settingsForm.isDirty}
                processing={settingsForm.processing}
                resetLabel="Batalkan perubahan"
                onReset={() => settingsForm.reset()}
            />
        </form>
    );

    const renderSeo = () => (
        <form onSubmit={(event) => submitSettings('seo', event)}>
            <SectionCard title="SEO default" description="Dipakai bila halaman tidak punya judul sendiri.">
                <Field label="Judul SEO default" htmlFor="seo_default_title" error={settingsForm.errors.seo_default_title}>
                    <Input
                        id="seo_default_title"
                        maxLength={150}
                        value={settingsForm.data.seo_default_title}
                        error={settingsForm.errors.seo_default_title}
                        onChange={(event) => setField('seo_default_title', event.target.value)}
                    />
                </Field>
                <Field label="Deskripsi SEO default" htmlFor="seo_default_description" error={settingsForm.errors.seo_default_description}>
                    <Textarea
                        id="seo_default_description"
                        rows={3}
                        maxLength={300}
                        value={settingsForm.data.seo_default_description}
                        error={settingsForm.errors.seo_default_description}
                        onChange={(event) => setField('seo_default_description', event.target.value)}
                    />
                </Field>
            </SectionCard>

            <StickySave
                dirty={settingsForm.isDirty}
                processing={settingsForm.processing}
                resetLabel="Batalkan perubahan"
                onReset={() => settingsForm.reset()}
            />
        </form>
    );

    const renderPembayaran = () => {
        const mode = midtransMode(midtrans);

        return (
            <form onSubmit={(event) => submitSettings('pembayaran', event)}>
                <SectionCard title="Midtrans" description={mode.catatan}>
                    {mode.diketahui ? (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <StatusBadge status={mode.uji ? 'pending' : null} label={mode.uji ? 'Mode uji' : 'Mode asli'} />
                            {mode.sumberKredensial ? (
                                <span className="text-meta text-slate-500">Kredensial dibaca dari {mode.sumberKredensial}.</span>
                            ) : null}
                        </div>
                    ) : null}

                    {mode.uji ? (
                        <InlineNotice tone="warning" title="Pembayaran sedang dalam mode uji">
                            <p>{mode.alasan ?? 'QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer.'}</p>
                            {mode.langkah.length > 0 ? (
                                <ol className="mt-2 list-decimal pl-4">
                                    {mode.langkah.map((langkah, index) => (
                                        <li key={index}>{langkah}</li>
                                    ))}
                                </ol>
                            ) : null}
                        </InlineNotice>
                    ) : null}

                    <Field
                        label="Midtrans client key (diisi pemilik)"
                        htmlFor="midtrans_client_key"
                        hint="Catatan saja: nilai ini tidak dibaca jalur pembayaran QRIS (lihat keterangan di atas)."
                        error={settingsForm.errors.midtrans_client_key}
                    >
                        <Input
                            id="midtrans_client_key"
                            maxLength={100}
                            value={settingsForm.data.midtrans_client_key}
                            error={settingsForm.errors.midtrans_client_key}
                            onChange={(event) => setField('midtrans_client_key', event.target.value)}
                        />
                    </Field>
                    <Field
                        label="Midtrans mode produksi (0/1)"
                        htmlFor="midtrans_is_production"
                        hint="Catatan saja: nilai ini tidak dibaca jalur pembayaran QRIS (lihat keterangan di atas)."
                        error={settingsForm.errors.midtrans_is_production}
                    >
                        <Select
                            id="midtrans_is_production"
                            className="max-w-[240px]"
                            value={settingsForm.data.midtrans_is_production ? '1' : '0'}
                            error={settingsForm.errors.midtrans_is_production}
                            onChange={(event) => setField('midtrans_is_production', event.target.value === '1')}
                        >
                            <option value="0">Mode sandbox</option>
                            <option value="1">Mode produksi</option>
                        </Select>
                    </Field>
                </SectionCard>

                <StickySave
                    dirty={settingsForm.isDirty}
                    processing={settingsForm.processing}
                    resetLabel="Batalkan perubahan"
                    onReset={() => settingsForm.reset()}
                />
            </form>
        );
    };

    const renderPanel = () => {
        if (reloading) {
            return (
                <div className="card p-6" aria-busy="true">
                    <Skeleton variant="title" />
                    <div className="mt-4 flex flex-col gap-3">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                    </div>
                </div>
            );
        }

        switch (tab) {
            case 'landing':
                return renderLanding();
            case 'carousel':
                return renderCarousel();
            case 'faq':
                return renderFaq();
            case 'header':
                return renderHeader();
            case 'footer':
                return renderFooter();
            case 'kontak':
                return renderKontak();
            case 'seo':
                return renderSeo();
            case 'pembayaran':
                return renderPembayaran();
            default:
                return renderUmum();
        }
    };

    if (!pengaturan) {
        return (
            <AdminLayout auth={auth} nav={NAV_AKTIF} title="Pengaturan">
                <PageHeader title="Pengaturan" breadcrumb={BREADCRUMB} />
                <ErrorState
                    title="Pengaturan gagal dimuat"
                    description="Data pengaturan belum tersedia. Coba muat ulang halaman."
                    onRetry={reload}
                />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout auth={auth} nav={NAV_AKTIF} title="Pengaturan">
            <div className="flex flex-col gap-6">
                <PageHeader title="Pengaturan" breadcrumb={BREADCRUMB} />

                {flash && (flash.success || flash.error) ? null : null}

                <TabNav active={tab} onSelect={requestTab} />

                <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="focus:outline-none" tabIndex={-1}>
                    <div className="flex flex-col gap-4">{renderPanel()}</div>
                </div>

                {asList(carousels).length === 0 && !reloading && tab === 'umum' ? (
                    <EmptyState
                        title="Belum ada carousel"
                        description="Tambahkan carousel dari tab Carousel agar beranda punya banner."
                        actionLabel="Buka tab Carousel"
                        onAction={() => requestTab('carousel')}
                    />
                ) : null}
            </div>

            <Modal
                open={carouselOpen}
                title={carouselEditing ? 'Ubah carousel' : 'Tambah carousel'}
                description="Konten ini tampil di bagian atas beranda."
                onClose={closeCarousel}
                size="lg"
                footer={
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button variant="secondary" onClick={closeCarousel} disabled={carouselForm.processing}>
                            Batal
                        </Button>
                        <Button type="submit" onClick={submitCarousel} loading={carouselForm.processing}>
                            {carouselEditing ? 'Simpan perubahan' : 'Simpan carousel'}
                        </Button>
                    </div>
                }
            >
                <form onSubmit={submitCarousel} className="flex flex-col gap-4" id="form-carousel">
                    <Field label="Judul carousel" htmlFor="carousel_title" required error={carouselForm.errors.title}>
                        <Input
                            id="carousel_title"
                            maxLength={150}
                            value={carouselForm.data.title}
                            error={carouselForm.errors.title}
                            onChange={(event) => carouselForm.setData('title', event.target.value)}
                        />
                    </Field>
                    <Field label="Subjudul" htmlFor="carousel_subtitle" error={carouselForm.errors.subtitle}>
                        <Input
                            id="carousel_subtitle"
                            maxLength={255}
                            value={carouselForm.data.subtitle}
                            error={carouselForm.errors.subtitle}
                            onChange={(event) => carouselForm.setData('subtitle', event.target.value)}
                        />
                    </Field>
                    <ImageField
                        id="carousel_image"
                        label="Gambar carousel"
                        required={!carouselEditing}
                        hint="Rasio 1:1."
                        message="Gambar carousel harus JPG, PNG, atau WebP."
                        accept={LOGO_ACCEPT}
                        extensions={LOGO_EXTENSIONS}
                        maxKb={2048}
                        file={isFileValue(carouselForm.data.image) ? carouselForm.data.image : null}
                        currentPath={carouselEditing ? text(carouselEditing.image) || null : null}
                        error={carouselImageError || carouselForm.errors.image}
                        onSelect={(file) => {
                            const message = checkUpload(file, {
                                maxKb: 2048,
                                extensions: LOGO_EXTENSIONS,
                                message: 'Gambar carousel harus JPG, PNG, atau WebP maksimal 2 MB.',
                            });
                            setCarouselImageError(message);
                            carouselForm.setData('image', message ? null : file);
                        }}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Tautan" htmlFor="carousel_link" error={carouselForm.errors.link}>
                            <Input
                                id="carousel_link"
                                maxLength={255}
                                placeholder="/produk"
                                value={carouselForm.data.link}
                                error={carouselForm.errors.link}
                                onChange={(event) => carouselForm.setData('link', event.target.value)}
                            />
                        </Field>
                        <Field label="Teks tombol" htmlFor="carousel_button_text" error={carouselForm.errors.button_text}>
                            <Input
                                id="carousel_button_text"
                                maxLength={60}
                                value={carouselForm.data.button_text}
                                error={carouselForm.errors.button_text}
                                onChange={(event) => carouselForm.setData('button_text', event.target.value)}
                            />
                        </Field>
                        <Field label="Urutan" htmlFor="carousel_sort_order" hint="0 sampai 999." error={carouselForm.errors.sort_order}>
                            <Input
                                id="carousel_sort_order"
                                type="number"
                                min={0}
                                max={999}
                                value={carouselForm.data.sort_order}
                                error={carouselForm.errors.sort_order}
                                onChange={(event) => carouselForm.setData('sort_order', event.target.value)}
                            />
                        </Field>
                        <Field label="Status" htmlFor="carousel_is_active" error={carouselForm.errors.is_active}>
                            <Select
                                id="carousel_is_active"
                                value={carouselForm.data.is_active ? '1' : '0'}
                                error={carouselForm.errors.is_active}
                                onChange={(event) => carouselForm.setData('is_active', event.target.value === '1')}
                            >
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </Select>
                        </Field>
                    </div>
                </form>
            </Modal>

            <Modal
                open={faqOpen}
                title={faqEditing ? 'Ubah FAQ' : 'Tambah FAQ'}
                description="Pertanyaan ini tampil di bagian FAQ beranda."
                onClose={closeFaq}
                size="lg"
                footer={
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button variant="secondary" onClick={closeFaq} disabled={faqForm.processing}>
                            Batal
                        </Button>
                        <Button type="submit" onClick={submitFaq} loading={faqForm.processing}>
                            {faqEditing ? 'Simpan perubahan' : 'Simpan FAQ'}
                        </Button>
                    </div>
                }
            >
                <form onSubmit={submitFaq} className="flex flex-col gap-4">
                    <Field label="Pertanyaan" htmlFor="faq_question" required error={faqForm.errors.question}>
                        <Input
                            id="faq_question"
                            maxLength={255}
                            value={faqForm.data.question}
                            error={faqForm.errors.question}
                            onChange={(event) => faqForm.setData('question', event.target.value)}
                        />
                    </Field>
                    <Field label="Jawaban" htmlFor="faq_answer" required error={faqForm.errors.answer}>
                        <Textarea
                            id="faq_answer"
                            rows={6}
                            maxLength={2000}
                            value={faqForm.data.answer}
                            error={faqForm.errors.answer}
                            onChange={(event) => faqForm.setData('answer', event.target.value)}
                        />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Urutan" htmlFor="faq_sort_order" hint="0 sampai 999." error={faqForm.errors.sort_order}>
                            <Input
                                id="faq_sort_order"
                                type="number"
                                min={0}
                                max={999}
                                value={faqForm.data.sort_order}
                                error={faqForm.errors.sort_order}
                                onChange={(event) => faqForm.setData('sort_order', event.target.value)}
                            />
                        </Field>
                        <Field label="Status" htmlFor="faq_is_active" error={faqForm.errors.is_active}>
                            <Select
                                id="faq_is_active"
                                value={faqForm.data.is_active ? '1' : '0'}
                                error={faqForm.errors.is_active}
                                onChange={(event) => faqForm.setData('is_active', event.target.value === '1')}
                            >
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </Select>
                        </Field>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(carouselPendingDelete) || Boolean(faqPendingDelete)}
                title="Hapus data?"
                description={
                    carouselPendingDelete
                        ? `Carousel "${text(carouselPendingDelete.title)}" akan dihapus.`
                        : faqPendingDelete
                          ? `FAQ "${text(faqPendingDelete.question)}" akan dihapus.`
                          : null
                }
                confirmLabel="Hapus"
                processing={deleting}
                onConfirm={confirmDelete}
                onCancel={() => {
                    if (deleting) return;
                    setCarouselPendingDelete(null);
                    setFaqPendingDelete(null);
                }}
            />

            <Modal
                open={Boolean(pendingTab)}
                title="Perubahan belum disimpan"
                description="Perubahan pada tab ini akan hilang bila kamu pindah tab."
                onClose={() => setPendingTab(null)}
                size="md"
                footer={
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button variant="secondary" onClick={() => setPendingTab(null)}>
                            Tetap di sini
                        </Button>
                        <Button variant="danger" onClick={discardAndSwitch}>
                            Buang perubahan
                        </Button>
                    </div>
                }
            >
                <p className="text-body text-ink-soft">Simpan dulu bila perubahan masih dibutuhkan.</p>
            </Modal>

            {toast ? (
                <div className="pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]">
                    <Toast tone={toast.tone} message={toast.message} onClose={dismissToast} />
                </div>
            ) : null}
        </AdminLayout>
    );
}
