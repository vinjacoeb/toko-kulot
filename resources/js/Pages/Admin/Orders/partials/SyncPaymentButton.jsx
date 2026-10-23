import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '../../../../Components/Button';
import InlineNotice from '../../../../Components/InlineNotice';

/**
 * Tombol "Sinkronkan status pembayaran" + notice hasil — kartu F8 `t_8e89556f`.
 *
 * Kontrak props §12.24: PATCH `/admin/pesanan/{order}/sinkron-pembayaran`
 * (`admin.orders.sinkron-pembayaran`), tanpa body, jawaban berupa kembali ke halaman asal
 * dengan `flash.success` atau `flash.error`. Tampilan mengikuti keputusan desain D13
 * (`docs/design.md` §11.3) dan keputusan UIUX U6-1 (`docs/catatan-uiux.md`).
 *
 * - §4.1 `Button` varian `secondary`; label beku "Sinkronkan status pembayaran"; saat memproses
 *   `loading` → label "Memproses…" + `disabled` (dikelola `Button`) dan lebar dikunci
 *   (`min-w-[16rem]`) supaya tata letak tidak melompat.
 * - Dirender pemanggil hanya saat `pesanan.payment` tidak `null` (D13).
 * - Tombol tetap aktif saat lunas maupun mode uji: alasan penolakan datang dari server lewat
 *   flash, bukan dari state `disabled` tanpa alasan terlihat (§4.0).
 * - Hasil dirender SATU KALI sebagai §4.23 `InlineNotice` di dalam kartu yang sama; pasangan
 *   flash yang sudah dikonsumsi dilaporkan lewat `onHasilSinkron` supaya halaman menekan
 *   Toast §4.8 untuk pesan yang sama.
 */

const asText = (nilai) => (nilai === null || nilai === undefined ? '' : String(nilai));

export default function SyncPaymentButton({ pesananId = null, onHasilSinkron = null }) {
    const form = useForm({});
    const [hasil, setHasil] = useState(null);

    const id = asText(pesananId).trim();

    // Tanpa id pesanan tidak ada rute sah yang bisa dituju — jangan merender tombol yang pasti gagal.
    if (id === '') {
        return null;
    }

    const sinkronkan = () => {
        if (form.processing) {
            return;
        }

        setHasil(null);

        form.patch(`/admin/pesanan/${encodeURIComponent(id)}/sinkron-pembayaran`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (halaman) => {
                const flashHalaman = halaman?.props?.flash ?? {};
                const sukses = asText(flashHalaman.success);
                const galat = asText(flashHalaman.error);

                if (sukses !== '') {
                    setHasil({ tone: 'success', pesan: sukses });
                } else if (galat !== '') {
                    setHasil({ tone: 'error', pesan: galat });
                }

                if ((sukses !== '' || galat !== '') && onHasilSinkron) {
                    onHasilSinkron(`${sukses}|${galat}`);
                }
            },
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <Button
                    variant="secondary"
                    className="min-w-[16rem]"
                    loading={form.processing}
                    onClick={sinkronkan}
                >
                    Sinkronkan status pembayaran
                </Button>
            </div>

            {hasil !== null && <InlineNotice tone={hasil.tone}>{hasil.pesan}</InlineNotice>}
        </div>
    );
}
