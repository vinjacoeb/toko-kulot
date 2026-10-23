import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../../../Components/Modal';
import Field from '../../../../Components/Field';
import Input from '../../../../Components/Input';
import Textarea from '../../../../Components/Textarea';
import Button from '../../../../Components/Button';
import InlineNotice from '../../../../Components/InlineNotice';
import { formatNumber } from '../../../../lib/format';

/**
 * Modal catat stok masuk / keluar untuk satu varian — kontrak props §12.13 (`POST
 * /admin/stok/{variant}/masuk`) dan §12.14 (`POST /admin/stok/{variant}/keluar`).
 *
 * Field form persis rules App\Http\Requests\Admin\StockMovementRequest:
 *   qty  required | integer | min:1 | max:100000
 *   note nullable | string | max:255
 *
 * Galat validasi server (termasuk pesan "Stok tidak cukup — stok saat ini N." dari
 * StockService::decrease) muncul per kolom lewat `form.errors`. `preserveState: true`
 * dipakai supaya modal tetap terbuka saat server menolak, sehingga galatnya terlihat.
 * Sukses: server `back()->with('success')`, modal ditutup, halaman menampilkan Toast.
 */

/** Batas atas `qty` mengikuti StockMovementRequest (max:100000). */
const QTY_MAKS = 100000;

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const asAngka = (value) => {
    const angka = Number(value);

    return Number.isFinite(angka) ? angka : 0;
};

export default function StokAksiModal({ open = false, mode = 'in', baris = null, onClose = null }) {
    const keluar = mode === 'out';
    const form = useForm({ qty: '', note: '' });
    const [galatLokal, setGalatLokal] = useState(null);

    // Setiap kali modal dibuka (atau baris/mode berganti) form dikosongkan lagi supaya
    // isian dan galat dari varian sebelumnya tidak terbawa.
    useEffect(() => {
        if (!open) return;

        form.setData({ qty: '', note: '' });
        form.clearErrors();
        setGalatLokal(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, baris?.id, mode]);

    const idVarian = baris?.id ?? null;
    const namaVarian = `${asText(baris?.product?.name) || 'Produk tanpa nama'} — ${
        asText(baris?.label) || 'varian tanpa label'
    }`;
    const stokSaatIni = formatNumber(asAngka(baris?.stock));

    const url = keluar ? `/admin/stok/${idVarian}/keluar` : `/admin/stok/${idVarian}/masuk`;

    const galatQty = galatLokal ?? form.errors.qty ?? null;
    const galatNote = form.errors.note ?? null;
    const galatLain = Object.entries(form.errors ?? {}).filter(
        ([kunci, pesan]) => !['qty', 'note'].includes(kunci) && Boolean(pesan)
    );

    const kirim = (event) => {
        if (event) event.preventDefault();

        if (form.processing || idVarian === null) return;

        const mentah = asText(form.data.qty).trim();
        const jumlah = Number(mentah);

        // Pemeriksaan ringan di klien; aturan resmi tetap milik server (StockMovementRequest).
        if (mentah === '') {
            setGalatLokal('Jumlah wajib diisi.');

            return;
        }

        if (!Number.isInteger(jumlah) || jumlah < 1) {
            setGalatLokal('Jumlah minimal 1.');

            return;
        }

        if (jumlah > QTY_MAKS) {
            setGalatLokal(`Jumlah maksimal ${formatNumber(QTY_MAKS)}.`);

            return;
        }

        setGalatLokal(null);

        form.post(url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => onClose?.(),
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={keluar ? 'Catat stok keluar' : 'Catat stok masuk'}
            description={
                baris === null ? '' : `${namaVarian} · stok tercatat saat ini ${stokSaatIni}`
            }
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={form.processing}>
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        form="form-stok-aksi"
                        loading={form.processing}
                        disabled={baris === null}
                    >
                        {keluar ? 'Simpan stok keluar' : 'Simpan stok masuk'}
                    </Button>
                </>
            }
        >
            <form id="form-stok-aksi" className="flex flex-col gap-4" onSubmit={kirim} noValidate>
                {galatLain.length > 0 && (
                    <InlineNotice tone="error" title="Perubahan stok gagal disimpan">
                        {galatLain.map(([kunci, pesan]) => (
                            <p key={kunci}>{asText(pesan)}</p>
                        ))}
                    </InlineNotice>
                )}

                <Field
                    label="Jumlah"
                    htmlFor="stok-aksi-qty"
                    required
                    hint={
                        keluar
                            ? `Stok tercatat saat ini ${stokSaatIni}. Server menolak jumlah yang melebihi stok tersedia.`
                            : 'Jumlah ditambahkan ke stok varian ini dan tercatat di riwayat.'
                    }
                    error={galatQty}
                >
                    <Input
                        id="stok-aksi-qty"
                        name="qty"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={QTY_MAKS}
                        step={1}
                        autoComplete="off"
                        value={form.data.qty}
                        error={galatQty}
                        onChange={(event) => {
                            setGalatLokal(null);
                            form.clearErrors('qty');
                            form.setData('qty', event.target.value);
                        }}
                        placeholder="mis. 10"
                    />
                </Field>

                <Field
                    label="Catatan (opsional)"
                    htmlFor="stok-aksi-note"
                    hint="Maksimal 255 karakter. Catatan tampil di riwayat pergerakan."
                    error={galatNote}
                >
                    <Textarea
                        id="stok-aksi-note"
                        name="note"
                        rows={3}
                        maxLength={255}
                        value={form.data.note}
                        error={galatNote}
                        onChange={(event) => {
                            form.clearErrors('note');
                            form.setData('note', event.target.value);
                        }}
                        placeholder={
                            keluar ? 'mis. barang rusak saat pengemasan' : 'mis. kiriman dari supplier'
                        }
                    />
                </Field>
            </form>
        </Modal>
    );
}
