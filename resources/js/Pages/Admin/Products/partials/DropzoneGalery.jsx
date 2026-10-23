import React, { useRef, useState } from 'react';
import Button from '../../../../Components/Button';
import Input from '../../../../Components/Input';
import { cn } from '../../../../lib/format';

/**
 * Dropzone galeri produk — docs/design.md §4.25 (state `idle` `dragover` `error`).
 *
 * Batas berkas mengikuti kontrak props §12.3/§12.6: `images[]` maks 5 berkas,
 * jpg/jpeg/png/webp, maksimal 2 MB per berkas. Berkas tidak diunggah satu-satu —
 * seluruh form dikirim sekali pada tombol Simpan (POST + `_method=PUT`, §12.6),
 * sehingga tidak ada state `uploading` per berkas; progres unggah tampil pada
 * tombol simpan.
 *
 * Ikon unggah digambar lokal (24px, stroke 1.5) mengikuti gaya
 * `resources/js/Components/icons.jsx` supaya berkas ikon bersama tidak diubah.
 */
const TIPE_DITERIMA = ['image/jpeg', 'image/png', 'image/webp'];
const MAKS_UKURAN = 2 * 1024 * 1024;

const labelUkuran = (byte) => `${(byte / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;

const UnggahIcon = ({ size = 24, className = '' }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <path d="M12 16V4" />
        <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
        <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </svg>
);

export default function DropzoneGalery({
    berkas = [],
    onTambah = null,
    onAlt = null,
    onHapus = null,
    maks = 5,
    disabled = false,
    error = null,
}) {
    const inputRef = useRef(null);
    const [dragover, setDragover] = useState(false);
    const [galatBerkas, setGalatBerkas] = useState([]);

    const sisa = Math.max(0, maks - berkas.length);
    const pesanGalat = galatBerkas.length > 0 ? galatBerkas : error ? [String(error)] : [];
    const adaGalat = pesanGalat.length > 0;

    /** Saring berkas: tipe dan ukuran sesuai kontrak §12.3, sisanya dilaporkan sebagai galat. */
    const terima = (daftar) => {
        if (disabled || typeof onTambah !== 'function') return;

        const ditolak = [];
        const lolos = [];

        Array.from(daftar ?? []).forEach((file) => {
            if (!file) return;

            if (!TIPE_DITERIMA.includes(file.type)) {
                ditolak.push(`${file.name} bukan JPG, PNG, atau WebP.`);

                return;
            }

            if (file.size > MAKS_UKURAN) {
                ditolak.push(`${file.name} lebih dari ${labelUkuran(MAKS_UKURAN)}.`);

                return;
            }

            lolos.push(file);
        });

        const diterima = lolos.slice(0, sisa);

        if (lolos.length > sisa) {
            ditolak.push(`Sisa slot hanya ${sisa} gambar per simpan.`);
        }

        setGalatBerkas(ditolak);

        if (diterima.length > 0) onTambah(diterima);
    };

    const bukaPicker = () => {
        if (!disabled) inputRef.current?.click();
    };

    return (
        <div className="flex flex-col gap-3">
            <input
                ref={inputRef}
                id="produk-galeri-input"
                name="galeri-picker"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={disabled}
                aria-describedby={adaGalat ? 'produk-galeri-error' : 'produk-galeri-hint'}
                aria-invalid={adaGalat ? 'true' : undefined}
                onChange={(event) => {
                    terima(event.target.files);
                    event.target.value = '';
                }}
            />

            <div className="grid grid-cols-2 gap-3">
                {sisa > 0 && (
                    <button
                        type="button"
                        onClick={bukaPicker}
                        disabled={disabled}
                        onDragOver={(event) => {
                            event.preventDefault();
                            if (!disabled) setDragover(true);
                        }}
                        onDragLeave={() => setDragover(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setDragover(false);
                            terima(event.dataTransfer?.files);
                        }}
                        aria-label="Tarik gambar atau klik untuk memilih berkas"
                        className={cn(
                            'flex aspect-square flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed bg-white p-3 text-center transition-colors duration-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45',
                            dragover ? 'border-brand text-brand' : 'border-line text-slate-500',
                            adaGalat && !dragover ? 'border-danger' : null
                        )}
                    >
                        <UnggahIcon size={24} />
                        <span className="text-meta">Tarik gambar atau klik</span>
                        <span className="text-meta text-slate-500">
                            Maks {maks} berkas · JPG/PNG/WebP · 2 MB
                        </span>
                    </button>
                )}

                {berkas.map((item, index) => (
                    <div key={item.key} className="flex flex-col gap-2">
                        <div className="relative">
                            <img
                                src={item.url}
                                alt=""
                                className="aspect-square w-full rounded-md border border-line object-cover"
                            />
                            <Button
                                variant="danger"
                                size="sm"
                                className="absolute right-1 top-1 h-8 w-8 px-0"
                                aria-label={`Hapus gambar baru ${index + 1}`}
                                disabled={disabled}
                                onClick={() => onHapus?.(item.key)}
                            >
                                <span aria-hidden="true">×</span>
                            </Button>
                        </div>

                        <Input
                            id={`produk-galeri-alt-${item.key}`}
                            name={`images_alt[${index}]`}
                            value={item.alt}
                            maxLength={180}
                            disabled={disabled}
                            placeholder="Teks alternatif"
                            aria-label={`Teks alternatif gambar baru ${index + 1}`}
                            onChange={(event) => onAlt?.(item.key, event.target.value)}
                        />
                    </div>
                ))}
            </div>

            <p id="produk-galeri-hint" className="text-meta text-slate-500">
                {berkas.length > 0
                    ? `${berkas.length} gambar baru siap diunggah saat disimpan.`
                    : 'Belum ada gambar baru dipilih.'}
            </p>

            {adaGalat && (
                <ul id="produk-galeri-error" role="alert" className="flex flex-col gap-1">
                    {pesanGalat.map((pesan) => (
                        <li key={pesan} className="text-meta text-danger-strong">
                            {pesan}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
