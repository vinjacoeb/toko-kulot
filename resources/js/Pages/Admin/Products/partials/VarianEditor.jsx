import React from 'react';
import Button from '../../../../Components/Button';
import Input from '../../../../Components/Input';
import Select from '../../../../Components/Select';
import { TrashIcon } from '../../../../Components/icons';

/**
 * Editor tabel varian produk (docs/design.md §5.12: "tabel varian ukuran × warna × stok × harga").
 *
 * Baris dikelola di `ProdukForm` (satu `useForm`), komponen ini hanya menggambar tabel
 * dan meneruskan perubahan. Aturan mengikuti kontrak props §12.3/§12.6:
 * `size` wajib dan berasal dari `ukuran_baku`, `color` maks 40, `sku` maks 60,
 * `price_delta` integer, `stock` integer ≥ 0, `is_active` boolean, 1–50 baris.
 * Baris lama yang tidak dikirim akan dihapus/dinonaktifkan server (§12.6), jadi tiap
 * baris punya tombol hapus dengan konfirmasi di induk.
 */
const MAKS_BARIS = 50;

const idSel = (index, field) => `varian-${index}-${field}`;

function PesanGalat({ id, message }) {
    if (!message) return null;

    return (
        <p id={`${id}-error`} className="mt-1.5 text-meta text-danger-strong" role="alert">
            {message}
        </p>
    );
}

export default function VarianEditor({
    baris = [],
    errors = {},
    ukuranBaku = [],
    onChange = null,
    onTambah = null,
    onHapus = null,
    disabled = false,
}) {
    const galatBaris = (index, field) => errors[`variants.${index}.${field}`] ?? null;

    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-body">
                    <caption className="sr-only">Varian produk</caption>
                    <thead>
                        <tr className="h-tableHead border-b border-line bg-surface text-badge uppercase text-slate-600">
                            <th scope="col" className="w-12 px-3 text-left font-semibold">
                                No
                            </th>
                            <th scope="col" className="px-3 text-left font-semibold">
                                Ukuran *
                            </th>
                            <th scope="col" className="px-3 text-left font-semibold">
                                Warna
                            </th>
                            <th scope="col" className="px-3 text-left font-semibold">
                                SKU
                            </th>
                            <th scope="col" className="px-3 text-left font-semibold">
                                Harga tambahan
                            </th>
                            <th scope="col" className="px-3 text-left font-semibold">
                                Stok
                            </th>
                            <th scope="col" className="px-3 text-left font-semibold">
                                Aktif
                            </th>
                            <th scope="col" className="px-3 text-right font-semibold">
                                Aksi
                            </th>
                        </tr>
                    </thead>

                    {baris.map((row, index) => (
                        <tbody key={row.key ?? `varian-${index}`} className="border-b border-line">
                            <tr>
                                <td className="px-3 py-3 align-top text-meta text-slate-600">{index + 1}</td>

                                <td className="w-40 px-3 py-3 align-top">
                                    <Select
                                        id={idSel(index, 'size')}
                                        name={`variants[${index}][size]`}
                                        value={row.size}
                                        disabled={disabled}
                                        error={galatBaris(index, 'size')}
                                        aria-label={`Ukuran varian baris ${index + 1}`}
                                        onChange={(event) => onChange?.(index, 'size', event.target.value)}
                                    >
                                        <option value="">Pilih ukuran</option>
                                        {ukuranBaku.map((ukuran) => (
                                            <option key={ukuran} value={ukuran}>
                                                {ukuran}
                                            </option>
                                        ))}
                                    </Select>
                                    <PesanGalat id={idSel(index, 'size')} message={galatBaris(index, 'size')} />
                                </td>

                                <td className="w-36 px-3 py-3 align-top">
                                    <Input
                                        id={idSel(index, 'color')}
                                        name={`variants[${index}][color]`}
                                        value={row.color}
                                        maxLength={40}
                                        disabled={disabled}
                                        error={galatBaris(index, 'color')}
                                        aria-label={`Warna varian baris ${index + 1}`}
                                        placeholder="Mis. Hitam"
                                        onChange={(event) => onChange?.(index, 'color', event.target.value)}
                                    />
                                    <PesanGalat id={idSel(index, 'color')} message={galatBaris(index, 'color')} />
                                </td>

                                <td className="w-48 px-3 py-3 align-top">
                                    <Input
                                        id={idSel(index, 'sku')}
                                        name={`variants[${index}][sku]`}
                                        value={row.sku}
                                        maxLength={60}
                                        disabled={disabled}
                                        error={galatBaris(index, 'sku')}
                                        aria-label={`SKU varian baris ${index + 1}`}
                                        placeholder="Kosongkan = otomatis"
                                        onChange={(event) => onChange?.(index, 'sku', event.target.value)}
                                    />
                                    <PesanGalat id={idSel(index, 'sku')} message={galatBaris(index, 'sku')} />
                                </td>

                                <td className="w-40 px-3 py-3 align-top">
                                    <Input
                                        id={idSel(index, 'price_delta')}
                                        name={`variants[${index}][price_delta]`}
                                        type="number"
                                        step={1}
                                        inputMode="numeric"
                                        value={row.price_delta}
                                        disabled={disabled}
                                        error={galatBaris(index, 'price_delta')}
                                        aria-label={`Harga tambahan varian baris ${index + 1}`}
                                        placeholder="0"
                                        onChange={(event) => onChange?.(index, 'price_delta', event.target.value)}
                                    />
                                    <PesanGalat
                                        id={idSel(index, 'price_delta')}
                                        message={galatBaris(index, 'price_delta')}
                                    />
                                </td>

                                <td className="w-28 px-3 py-3 align-top">
                                    <Input
                                        id={idSel(index, 'stock')}
                                        name={`variants[${index}][stock]`}
                                        type="number"
                                        min={0}
                                        step={1}
                                        inputMode="numeric"
                                        value={row.stock}
                                        disabled={disabled}
                                        error={galatBaris(index, 'stock')}
                                        aria-label={`Stok varian baris ${index + 1}`}
                                        placeholder="0"
                                        onChange={(event) => onChange?.(index, 'stock', event.target.value)}
                                    />
                                    <PesanGalat id={idSel(index, 'stock')} message={galatBaris(index, 'stock')} />
                                </td>

                                <td className="px-3 py-3 align-top">
                                    <label
                                        htmlFor={idSel(index, 'is_active')}
                                        className="flex items-center gap-2 text-meta text-ink"
                                    >
                                        <input
                                            id={idSel(index, 'is_active')}
                                            name={`variants[${index}][is_active]`}
                                            type="checkbox"
                                            className="h-4 w-4 shrink-0"
                                            checked={row.is_active}
                                            disabled={disabled}
                                            onChange={(event) => onChange?.(index, 'is_active', event.target.checked)}
                                        />
                                        <span className="sr-only">Aktifkan varian baris</span>
                                        <span aria-hidden="true">{row.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                    </label>
                                </td>

                                <td className="px-3 py-3 text-right align-top">
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        disabled={disabled || baris.length <= 1}
                                        aria-label={`Hapus varian baris ${index + 1}`}
                                        onClick={() => onHapus?.(index)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Hapus
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    ))}
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={disabled || baris.length >= MAKS_BARIS}
                    onClick={() => onTambah?.()}
                >
                    Tambah varian
                </Button>
                <p className="text-meta text-slate-500">
                    {baris.length} dari maksimal {MAKS_BARIS} varian. SKU varian dibuat otomatis dari SKU produk,
                    ukuran, dan warna bila dikosongkan.
                </p>
            </div>
        </div>
    );
}
