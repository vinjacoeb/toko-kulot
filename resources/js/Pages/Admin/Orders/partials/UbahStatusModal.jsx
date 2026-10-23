import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../../../Components/Modal';
import Button from '../../../../Components/Button';
import Field from '../../../../Components/Field';
import Select from '../../../../Components/Select';
import Textarea from '../../../../Components/Textarea';
import InlineNotice from '../../../../Components/InlineNotice';

/**
 * Dialog konfirmasi ubah status — kontrak §12.18 (PATCH /admin/pesanan/{order}/status).
 * Body: `status` (wajib, harus salah satu `status_berikut`) + `note` (opsional, maks 255 karakter).
 * Galat validasi server tampil per kolom lewat `form.errors` (mis. transisi tidak sah).
 */

const batasCatatan = 255;

export default function UbahStatusModal({
    open = false,
    pesanan = null,
    statusBerikut = [],
    onClose = () => {},
}) {
    const pilihan = Array.isArray(statusBerikut) ? statusBerikut : [];
    const id = pesanan?.id ?? null;
    const [galatLokal, setGalatLokal] = useState(null);
    const form = useForm({ status: '', note: '' });

    useEffect(() => {
        if (open) {
            form.clearErrors();
            form.setData({ status: '', note: '' });
            setGalatLokal(null);
        }
        // Sengaja hanya bergantung pada `open`: reset sekali per pembukaan dialog.
    }, [open]);

    if (id === null) return null;

    const terpilih = pilihan.find((item) => item?.value === form.data.status) ?? null;
    const jadiBatal = form.data.status === 'batal';
    const jadiDibayar = form.data.status === 'dibayar' && !pesanan?.paid_at;
    const galatLain = Object.entries(form.errors).filter(
        ([kunci]) => kunci !== 'status' && kunci !== 'note',
    );

    const kirim = () => {
        if (form.data.status === '') {
            setGalatLokal('Status pesanan wajib dipilih.');
            return;
        }

        setGalatLokal(null);
        form.patch(`/admin/pesanan/${id}/status`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal
            open={open}
            title="Ubah status pesanan"
            onClose={() => {
                if (!form.processing) onClose();
            }}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={form.processing}>
                        Batal
                    </Button>
                    <Button variant="primary" onClick={kirim} loading={form.processing}>
                        Simpan status
                    </Button>
                </>
            }
        >
            <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    kirim();
                }}
            >
                <p className="text-body text-slate-600">
                    Status saat ini{' '}
                    <span className="font-semibold text-ink">
                        {pesanan?.status_label ? String(pesanan.status_label) : '-'}
                    </span>
                    . Pilih status baru lalu simpan.
                </p>

                <Field
                    label="Status baru"
                    htmlFor="status-pesanan"
                    required
                    hint="Hanya status lanjutan yang sah yang bisa dipilih."
                    error={galatLokal ?? form.errors.status ?? null}
                >
                    <Select
                        id="status-pesanan"
                        value={form.data.status}
                        onChange={(event) => form.setData('status', event.target.value)}
                        error={galatLokal ?? form.errors.status ?? null}
                    >
                        <option value="">Pilih status</option>
                        {pilihan.map((item, index) => (
                            <option key={`${item?.value ?? 'status'}-${index}`} value={item?.value ?? ''}>
                                {item?.label ?? item?.value ?? '-'}
                            </option>
                        ))}
                    </Select>
                </Field>

                {terpilih && terpilih.value !== '' && (
                    <InlineNotice tone="info" title="Status yang dipilih">
                        Pesanan akan menjadi{' '}
                        <span className="font-semibold text-ink">
                            {String(terpilih.label ?? terpilih.value)}
                        </span>
                        .
                    </InlineNotice>
                )}

                {jadiBatal && (
                    <InlineNotice tone="warning" title="Membatalkan mengembalikan stok">
                        Status batal mengembalikan stok setiap item pesanan ini (satu pergerakan stok
                        masuk per varian).
                    </InlineNotice>
                )}

                {jadiDibayar && (
                    <InlineNotice tone="info" title="Waktu pembayaran diisi otomatis">
                        Waktu pembayaran akan diisi sekarang karena pesanan ini belum punya waktu
                        pembayaran.
                    </InlineNotice>
                )}

                <Field
                    label="Catatan"
                    htmlFor="catatan-status"
                    hint={`Opsional, maksimal ${batasCatatan} karakter.`}
                    error={form.errors.note ?? null}
                >
                    <Textarea
                        id="catatan-status"
                        rows={3}
                        maxLength={batasCatatan}
                        value={form.data.note}
                        onChange={(event) => form.setData('note', event.target.value)}
                        error={form.errors.note ?? null}
                    />
                </Field>

                {galatLain.length > 0 && (
                    <InlineNotice tone="error" title="Perubahan gagal disimpan">
                        <ul className="list-inside list-disc">
                            {galatLain.map(([kunci, pesan]) => (
                                <li key={kunci}>{String(pesan)}</li>
                            ))}
                        </ul>
                    </InlineNotice>
                )}
            </form>
        </Modal>
    );
}
