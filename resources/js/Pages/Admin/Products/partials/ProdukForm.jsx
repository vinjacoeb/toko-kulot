import React, { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '../../../../Components/Button';
import Field from '../../../../Components/Field';
import Input from '../../../../Components/Input';
import InlineNotice from '../../../../Components/InlineNotice';
import Modal from '../../../../Components/Modal';
import Select from '../../../../Components/Select';
import Textarea from '../../../../Components/Textarea';
import { ImageOffIcon } from '../../../../Components/icons';
import { rupiah } from '../../../../lib/format';
import DropzoneGalery from './DropzoneGalery';
import VarianEditor from './VarianEditor';

/**
 * Form produk bersama untuk `/admin/produk/tambah` dan `/admin/produk/{id}/ubah`
 * (docs/design.md §5.12: halaman terpisah, 2 kolom — kiri data utama + varian,
 * kanan status/kategori/galeri).
 *
 * Kontrak props §12.2–§12.6:
 * - POST `/admin/produk` untuk tambah, POST + `_method=put` untuk ubah (form unggah).
 * - `images[]` maks 5 berkas (JPG/PNG/WebP, 2 MB), `images_alt[]` sejajar indeksnya.
 * - `hapus_images[]` dan `primary_image_id` hanya pada ubah.
 * - Galat validasi server per kolom: `errors.<key>`; galat varian per baris
 *   `errors.variants.<i>.<field>`, galat umum varian di `errors.variants`.
 */
const MAKS_GAMBAR = 5;

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const asAngka = (value) => {
    if (value === null || value === undefined || value === '') return '';

    const angka = Number(value);

    return Number.isFinite(angka) ? String(angka) : '';
};

const asBool = (value) => value === true || value === 1 || value === '1' || value === 'true';

let urutan = 0;
const uid = () => {
    urutan += 1;

    return `baris-${Date.now()}-${urutan}`;
};

const variansAwal = (produk) =>
    (produk?.variants ?? []).map((varian) => ({
        key: `varian-${asText(varian.id) || uid()}`,
        id: varian.id ?? null,
        size: asText(varian.size),
        color: asText(varian.color),
        sku: asText(varian.sku),
        price_delta: asAngka(varian.price_delta ?? 0),
        stock: asAngka(varian.stock ?? 0),
        is_active: asBool(varian.is_active),
    }));

const barisKosong = () => ({
    key: uid(),
    id: null,
    size: '',
    color: '',
    sku: '',
    price_delta: '',
    stock: '',
    is_active: true,
});

const dataAwal = (produk) => ({
    name: asText(produk?.name),
    slug: asText(produk?.slug),
    sku: asText(produk?.sku),
    category_id: asText(produk?.category_id),
    short_description: asText(produk?.short_description),
    description: asText(produk?.description),
    weight_gram: asAngka(produk?.weight_gram),
    base_price: asAngka(produk?.base_price),
    compare_price: asAngka(produk?.compare_price),
    wholesale_price: asAngka(produk?.wholesale_price),
    min_wholesale_qty: asAngka(produk?.min_wholesale_qty),
    is_active: produk ? asBool(produk.is_active) : true,
    is_featured: produk ? asBool(produk.is_featured) : false,
    variants: produk ? variansAwal(produk) : [barisKosong()],
});

function GambarLama({ gambar, hapus, primary, onMintaHapus, onBatalHapus, onPilihPrimary, disabled }) {
    return (
        <li
            className={
                hapus
                    ? 'flex flex-col gap-3 rounded-md border border-danger bg-white p-3'
                    : 'flex flex-col gap-3 rounded-md border border-line bg-white p-3'
            }
        >
            <div className="flex items-start gap-3">
                {asText(gambar.path) === '' ? (
                    <span
                        aria-hidden="true"
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-slate-500"
                    >
                        <ImageOffIcon />
                    </span>
                ) : (
                    <img
                        src={asText(gambar.path)}
                        alt={asText(gambar.alt)}
                        loading="lazy"
                        className="h-16 w-16 shrink-0 rounded-md border border-line object-cover"
                    />
                )}

                <div className="min-w-0 flex-1">
                    <p className="text-meta font-semibold text-ink">
                        {asBool(gambar.is_primary) ? 'Gambar utama' : 'Gambar galeri'}
                    </p>
                    <p className="mt-0.5 break-words text-meta text-slate-500">
                        {asText(gambar.alt) || 'Teks alternatif belum diisi'}
                    </p>
                </div>
            </div>

            {hapus ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-meta text-danger-strong">Ditandai untuk dihapus saat disimpan.</p>
                    <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onBatalHapus(gambar.id)}>
                        Batalkan
                    </Button>
                </div>
            ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor={`gambar-primary-${gambar.id}`} className="flex items-center gap-2 text-meta text-ink">
                        <input
                            id={`gambar-primary-${gambar.id}`}
                            type="radio"
                            name="gambar-primary"
                            className="h-4 w-4 shrink-0"
                            checked={primary}
                            disabled={disabled}
                            onChange={() => onPilihPrimary(gambar.id)}
                        />
                        Jadikan gambar utama
                    </label>
                    <Button variant="danger" size="sm" disabled={disabled} onClick={() => onMintaHapus(gambar)}>
                        Hapus
                    </Button>
                </div>
            )}
        </li>
    );
}

export default function ProdukForm({ produk = null, kategori = [], ukuran_baku = [] }) {
    const ubah = produk !== null;

    const form = useForm({ ...dataAwal(produk) });

    const [berkas, setBerkas] = useState([]);
    const [hapusIds, setHapusIds] = useState([]);
    const [primaryId, setPrimaryId] = useState(() => {
        const utama = (produk?.images ?? []).find((gambar) => asBool(gambar.is_primary));

        return utama ? utama.id : null;
    });
    const [konfirmasiGambar, setKonfirmasiGambar] = useState(null);

    const gambarLama = useMemo(() => (produk?.images ?? []).filter(Boolean), [produk]);
    const gambarTersisa = gambarLama.filter((gambar) => !hapusIds.includes(gambar.id));
    const galatGambar = [
        form.errors.images,
        form.errors['images.0'],
        form.errors.hapus_images,
        form.errors.primary_image_id,
    ]
        .filter(Boolean)
        .map((pesan) => asText(pesan));

    const ditangani = new Set([
        'name',
        'slug',
        'sku',
        'category_id',
        'short_description',
        'description',
        'weight_gram',
        'base_price',
        'compare_price',
        'wholesale_price',
        'min_wholesale_qty',
        'is_active',
        'is_featured',
        'images',
        'images.0',
        'hapus_images',
        'primary_image_id',
    ]);

    const galatLain = Object.entries(form.errors).filter(
        ([kunci]) => !ditangani.has(kunci) && kunci !== 'variants' && !kunci.startsWith('variants.')
    );

    const adaGalat = Object.keys(form.errors).length > 0;

    const tambahBerkas = (daftar) => {
        setBerkas((sebelumnya) => [
            ...sebelumnya,
            ...daftar.map((file) => ({ key: uid(), file, url: URL.createObjectURL(file), alt: '' })),
        ]);
    };

    const hapusBerkas = (key) => {
        setBerkas((sebelumnya) => {
            const baris = sebelumnya.find((item) => item.key === key);
            if (baris) URL.revokeObjectURL(baris.url);

            return sebelumnya.filter((item) => item.key !== key);
        });
    };

    const ubahAlt = (key, nilai) => {
        setBerkas((sebelumnya) =>
            sebelumnya.map((item) => (item.key === key ? { ...item, alt: nilai } : item))
        );
    };

    const mintaHapusGambar = (gambar) => setKonfirmasiGambar(gambar);

    const konfirmasiHapusGambar = () => {
        if (konfirmasiGambar === null) return;

        setHapusIds((sebelumnya) => [...sebelumnya, konfirmasiGambar.id]);

        if (primaryId === konfirmasiGambar.id) setPrimaryId(null);

        setKonfirmasiGambar(null);
    };

    const batalHapusGambar = (id) => setHapusIds((sebelumnya) => sebelumnya.filter((nilai) => nilai !== id));

    const ubahVarian = (index, field, nilai) => {
        form.setData(
            'variants',
            form.data.variants.map((baris, urutanBaris) =>
                urutanBaris === index ? { ...baris, [field]: nilai } : baris
            )
        );
    };

    const tambahVarian = () => {
        form.setData('variants', [...form.data.variants, barisKosong()]);
    };

    const hapusVarian = (index) => {
        form.setData(
            'variants',
            form.data.variants.filter((_, urutanBaris) => urutanBaris !== index)
        );
    };

    const kirim = (event) => {
        event.preventDefault();

        if (form.processing) return;

        form.transform((data) => {
            const muatan = {
                ...data,
                images: berkas.map((item) => item.file),
                images_alt: berkas.map((item) => item.alt),
                variants: data.variants.map((baris) => {
                    const { key, ...sisa } = baris;
                    const hasil = {
                        ...sisa,
                        size: asText(sisa.size),
                        color: asText(sisa.color).trim(),
                        sku: asText(sisa.sku).trim(),
                        price_delta: sisa.price_delta === '' ? 0 : sisa.price_delta,
                        stock: sisa.stock === '' ? 0 : sisa.stock,
                    };

                    if (hasil.id === null || hasil.id === '') delete hasil.id;

                    return hasil;
                }),
            };

            if (!ubah) {
                delete muatan.hapus_images;
                delete muatan.primary_image_id;

                return muatan;
            }

            return {
                ...muatan,
                _method: 'put',
                hapus_images: hapusIds,
                primary_image_id: primaryId === null ? '' : primaryId,
            };
        });

        form.post(ubah ? `/admin/produk/${produk.id}` : '/admin/produk', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const previewHarga = rupiah(form.data.base_price);

    return (
        <form onSubmit={kirim} noValidate className="flex flex-col gap-6">
            {adaGalat && (
                <InlineNotice tone="error" title="Isian belum bisa disimpan">
                    <p>
                        Sebagian data belum benar. Periksa kolom yang ditandai merah, lalu simpan lagi. Data yang sudah
                        diisi tidak hilang.
                    </p>
                    {galatLain.length > 0 && (
                        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
                            {galatLain.map(([kunci, pesan]) => (
                                <li key={kunci}>{asText(pesan)}</li>
                            ))}
                        </ul>
                    )}
                </InlineNotice>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="flex flex-col gap-6">
                    <section className="flex flex-col gap-5 rounded-lg border border-line bg-white p-6">
                        <h2 className="text-h3 font-semibold text-ink">Informasi produk</h2>

                        <Field
                            label="Nama produk"
                            htmlFor="produk-name"
                            required
                            error={form.errors.name ?? null}
                        >
                            <Input
                                id="produk-name"
                                name="name"
                                value={form.data.name}
                                maxLength={180}
                                disabled={form.processing}
                                error={form.errors.name ?? null}
                                onChange={(event) => form.setData('name', event.target.value)}
                            />
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Slug"
                                htmlFor="produk-slug"
                                hint="Kosongkan untuk dibuat otomatis dari nama."
                                error={form.errors.slug ?? null}
                            >
                                <Input
                                    id="produk-slug"
                                    name="slug"
                                    value={form.data.slug}
                                    maxLength={200}
                                    disabled={form.processing}
                                    error={form.errors.slug ?? null}
                                    onChange={(event) => form.setData('slug', event.target.value)}
                                />
                            </Field>

                            <Field label="SKU produk" htmlFor="produk-sku" required error={form.errors.sku ?? null}>
                                <Input
                                    id="produk-sku"
                                    name="sku"
                                    value={form.data.sku}
                                    maxLength={60}
                                    disabled={form.processing}
                                    error={form.errors.sku ?? null}
                                    onChange={(event) => form.setData('sku', event.target.value)}
                                />
                            </Field>
                        </div>

                        <Field
                            label="Deskripsi singkat"
                            htmlFor="produk-deskripsi-singkat"
                            hint="Maksimal 255 karakter, tampil di kartu produk katalog."
                            error={form.errors.short_description ?? null}
                        >
                            <Input
                                id="produk-deskripsi-singkat"
                                name="short_description"
                                value={form.data.short_description}
                                maxLength={255}
                                disabled={form.processing}
                                error={form.errors.short_description ?? null}
                                onChange={(event) => form.setData('short_description', event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Deskripsi"
                            htmlFor="produk-deskripsi"
                            hint="Maksimal 5000 karakter, tampil di halaman detail produk."
                            error={form.errors.description ?? null}
                        >
                            <Textarea
                                id="produk-deskripsi"
                                name="description"
                                rows={6}
                                maxLength={5000}
                                value={form.data.description}
                                disabled={form.processing}
                                error={form.errors.description ?? null}
                                onChange={(event) => form.setData('description', event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Berat (gram)"
                            htmlFor="produk-berat"
                            hint="Opsional, dipakai untuk perhitungan ongkir."
                            error={form.errors.weight_gram ?? null}
                        >
                            <Input
                                id="produk-berat"
                                name="weight_gram"
                                type="number"
                                min={0}
                                max={100000}
                                step={1}
                                inputMode="numeric"
                                value={form.data.weight_gram}
                                disabled={form.processing}
                                error={form.errors.weight_gram ?? null}
                                onChange={(event) => form.setData('weight_gram', event.target.value)}
                            />
                        </Field>
                    </section>

                    <section className="flex flex-col gap-5 rounded-lg border border-line bg-white p-6">
                        <h2 className="text-h3 font-semibold text-ink">Harga</h2>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Harga jual"
                                htmlFor="produk-harga"
                                required
                                hint={
                                    previewHarga ? `Tampil di katalog sebagai ${previewHarga}.` : 'Rupiah, tanpa titik.'
                                }
                                error={form.errors.base_price ?? null}
                            >
                                <Input
                                    id="produk-harga"
                                    name="base_price"
                                    type="number"
                                    min={0}
                                    step={1}
                                    inputMode="numeric"
                                    value={form.data.base_price}
                                    disabled={form.processing}
                                    error={form.errors.base_price ?? null}
                                    onChange={(event) => form.setData('base_price', event.target.value)}
                                />
                            </Field>

                            <Field
                                label="Harga coret"
                                htmlFor="produk-harga-coret"
                                hint="Opsional, harus lebih besar dari harga jual."
                                error={form.errors.compare_price ?? null}
                            >
                                <Input
                                    id="produk-harga-coret"
                                    name="compare_price"
                                    type="number"
                                    min={0}
                                    step={1}
                                    inputMode="numeric"
                                    value={form.data.compare_price}
                                    disabled={form.processing}
                                    error={form.errors.compare_price ?? null}
                                    onChange={(event) => form.setData('compare_price', event.target.value)}
                                />
                            </Field>

                            <Field
                                label="Harga grosir"
                                htmlFor="produk-harga-grosir"
                                hint="Opsional, harus lebih kecil dari harga jual."
                                error={form.errors.wholesale_price ?? null}
                            >
                                <Input
                                    id="produk-harga-grosir"
                                    name="wholesale_price"
                                    type="number"
                                    min={0}
                                    step={1}
                                    inputMode="numeric"
                                    value={form.data.wholesale_price}
                                    disabled={form.processing}
                                    error={form.errors.wholesale_price ?? null}
                                    onChange={(event) => form.setData('wholesale_price', event.target.value)}
                                />
                            </Field>

                            <Field
                                label="Minimal qty grosir"
                                htmlFor="produk-min-grosir"
                                hint="Wajib diisi bila harga grosir diisi."
                                error={form.errors.min_wholesale_qty ?? null}
                            >
                                <Input
                                    id="produk-min-grosir"
                                    name="min_wholesale_qty"
                                    type="number"
                                    min={1}
                                    step={1}
                                    inputMode="numeric"
                                    value={form.data.min_wholesale_qty}
                                    disabled={form.processing}
                                    error={form.errors.min_wholesale_qty ?? null}
                                    onChange={(event) => form.setData('min_wholesale_qty', event.target.value)}
                                />
                            </Field>
                        </div>
                    </section>

                    <section className="flex flex-col gap-5 rounded-lg border border-line bg-white p-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-h3 font-semibold text-ink">Varian</h2>
                            <p className="text-meta text-slate-500">
                                Minimal 1 varian. Stok dan harga tambahan per ukuran atau warna.
                            </p>
                        </div>

                        {form.errors.variants && (
                            <InlineNotice tone="error" title="Varian belum benar">
                                <p>{asText(form.errors.variants)}</p>
                            </InlineNotice>
                        )}

                        <VarianEditor
                            baris={form.data.variants}
                            errors={form.errors}
                            ukuranBaku={ukuran_baku}
                            disabled={form.processing}
                            onChange={ubahVarian}
                            onTambah={tambahVarian}
                            onHapus={hapusVarian}
                        />
                    </section>
                </div>

                <div className="flex flex-col gap-6">
                    <section className="flex flex-col gap-5 rounded-lg border border-line bg-white p-6">
                        <h2 className="text-h3 font-semibold text-ink">Status &amp; kategori</h2>

                        <Field label="Kategori" htmlFor="produk-kategori" required error={form.errors.category_id ?? null}>
                            <Select
                                id="produk-kategori"
                                name="category_id"
                                value={form.data.category_id}
                                disabled={form.processing}
                                error={form.errors.category_id ?? null}
                                onChange={(event) => form.setData('category_id', event.target.value)}
                            >
                                <option value="">Pilih kategori</option>
                                {kategori.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {asText(item.name)}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="produk-aktif" className="flex items-start gap-3">
                                    <input
                                        id="produk-aktif"
                                        name="is_active"
                                        type="checkbox"
                                        className="mt-0.5 h-4 w-4 shrink-0"
                                        checked={asBool(form.data.is_active)}
                                        disabled={form.processing}
                                        aria-describedby={
                                            form.errors.is_active ? 'produk-aktif-error' : 'produk-aktif-hint'
                                        }
                                        onChange={(event) => form.setData('is_active', event.target.checked)}
                                    />
                                    <span className="text-body text-ink">
                                        Tampilkan produk di katalog
                                        <span
                                            id="produk-aktif-hint"
                                            className="mt-0.5 block text-meta text-slate-500"
                                        >
                                            Produk nonaktif tidak tampil di halaman publik.
                                        </span>
                                    </span>
                                </label>
                                {form.errors.is_active && (
                                    <p id="produk-aktif-error" className="mt-1.5 text-meta text-danger-strong" role="alert">
                                        {form.errors.is_active}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="produk-unggulan" className="flex items-start gap-3">
                                    <input
                                        id="produk-unggulan"
                                        name="is_featured"
                                        type="checkbox"
                                        className="mt-0.5 h-4 w-4 shrink-0"
                                        checked={asBool(form.data.is_featured)}
                                        disabled={form.processing}
                                        aria-describedby={
                                            form.errors.is_featured ? 'produk-unggulan-error' : 'produk-unggulan-hint'
                                        }
                                        onChange={(event) => form.setData('is_featured', event.target.checked)}
                                    />
                                    <span className="text-body text-ink">
                                        Tandai produk unggulan
                                        <span
                                            id="produk-unggulan-hint"
                                            className="mt-0.5 block text-meta text-slate-500"
                                        >
                                            Produk unggulan tampil di bagian produk unggulan landing page.
                                        </span>
                                    </span>
                                </label>
                                {form.errors.is_featured && (
                                    <p
                                        id="produk-unggulan-error"
                                        className="mt-1.5 text-meta text-danger-strong"
                                        role="alert"
                                    >
                                        {form.errors.is_featured}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-5 rounded-lg border border-line bg-white p-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-h3 font-semibold text-ink">Galeri</h2>
                            <p className="text-meta text-slate-500">
                                Maksimal {MAKS_GAMBAR} gambar per simpan · 2 MB per berkas.
                            </p>
                        </div>

                        {ubah && gambarLama.length > 0 && (
                            <ul className="flex flex-col gap-3">
                                {gambarLama.map((gambar) => (
                                    <GambarLama
                                        key={gambar.id}
                                        gambar={gambar}
                                        hapus={hapusIds.includes(gambar.id)}
                                        primary={primaryId === gambar.id}
                                        disabled={form.processing}
                                        onMintaHapus={mintaHapusGambar}
                                        onBatalHapus={batalHapusGambar}
                                        onPilihPrimary={setPrimaryId}
                                    />
                                ))}
                            </ul>
                        )}

                        {ubah && gambarTersisa.length === 0 && (
                            <p className="text-meta text-slate-500">
                                Tidak ada gambar lama tersisa. Unggah gambar baru agar produk punya foto.
                            </p>
                        )}

                        <DropzoneGalery
                            berkas={berkas}
                            maks={MAKS_GAMBAR}
                            disabled={form.processing}
                            error={galatGambar.length > 0 ? galatGambar.join(' ') : null}
                            onTambah={tambahBerkas}
                            onAlt={ubahAlt}
                            onHapus={hapusBerkas}
                        />
                    </section>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
                <Button variant="secondary" href="/admin/produk" disabled={form.processing}>
                    Batal
                </Button>
                <Button type="submit" variant="primary" loading={form.processing} disabled={form.processing}>
                    Simpan produk
                </Button>
            </div>

            <Modal
                open={konfirmasiGambar !== null}
                onClose={() => setKonfirmasiGambar(null)}
                title="Hapus gambar ini?"
                description={
                    konfirmasiGambar
                        ? `Gambar ${asText(konfirmasiGambar.alt) || 'tanpa teks alternatif'} akan dihapus saat produk disimpan.`
                        : ''
                }
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setKonfirmasiGambar(null)}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={konfirmasiHapusGambar}>
                            Tandai hapus
                        </Button>
                    </>
                }
            >
                <p className="text-body text-ink-soft">
                    Berkas gambar dihapus permanen dari server saat produk disimpan. Tindakan ini tidak bisa dibatalkan.
                </p>
            </Modal>
        </form>
    );
}
