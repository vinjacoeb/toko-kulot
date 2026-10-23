import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import Button from '../../../../Components/Button';
import Field from '../../../../Components/Field';
import Input from '../../../../Components/Input';

/**
 * Isian nomor resi manual — PRD A15 (`docs/PRD.md:375`), kontrak §12.17 + §12.18a,
 * design §5.12 + deviasi D12 (`docs/design.md:869`), keputusan `docs/keputusan-a15-resi.md` §1.
 *
 * Alur: `PATCH /admin/pesanan/{order}/resi` (`admin.orders.resi`) dengan satu field
 * `tracking_number`; kosong berarti menghapus nomor resi (§12.18a). Sukses dan galat
 * mengikuti jawaban server — `flash.success` ditampilkan layout admin, galat validasi
 * `errors.tracking_number` tampil di bawah input. Tidak ada toast atau state halaman baru.
 *
 * Isian di klien hanya alat bantu: server tetap satu-satunya yang menyimpan nomor resi.
 */
const BATAS_RESI = 60;
const ID_INPUT = 'resi-pesanan';

const asText = (nilai) => (nilai === null || nilai === undefined ? '' : String(nilai));

export default function InfoResi({ pesanan = null }) {
    const id = pesanan?.id ?? null;
    // Baris status membaca nilai TERSIMPAN dari server (§12.17 `pesanan.tracking_number`),
    // bukan yang sedang diketik.
    const tersimpan = asText(pesanan?.tracking_number);
    const galat = usePage().props.errors?.tracking_number ?? null;

    const [nilai, setNilai] = useState(tersimpan);
    const [proses, setProses] = useState(false);

    // Props server berubah setelah simpan/pindah pesanan: isian mengikuti nilai terbaru.
    useEffect(() => {
        setNilai(asText(pesanan?.tracking_number));
    }, [pesanan?.id, pesanan?.tracking_number]);

    if (id === null) {
        return null;
    }

    const kirim = (event) => {
        event.preventDefault();

        if (proses) {
            return;
        }

        router.patch(
            `/admin/pesanan/${id}/resi`,
            { tracking_number: nilai },
            {
                preserveScroll: true,
                onStart: () => setProses(true),
                onFinish: () => setProses(false),
            },
        );
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={kirim} noValidate>
            <Field
                label="Nomor resi"
                htmlFor={ID_INPUT}
                hint="Isi nomor resi dari ekspedisi setelah paket dikirim. Kosongkan untuk menghapus."
                error={galat}
            >
                <Input
                    id={ID_INPUT}
                    name="tracking_number"
                    type="text"
                    maxLength={BATAS_RESI}
                    autoComplete="off"
                    value={nilai}
                    error={galat}
                    onChange={(event) => setNilai(event.target.value)}
                />
            </Field>

            <p className="text-meta text-slate-500">
                {tersimpan === '' ? 'Belum ada nomor resi.' : `Tersimpan: ${tersimpan}`}
            </p>

            <div>
                <Button variant="primary" type="submit" loading={proses}>
                    Simpan resi
                </Button>
            </div>
        </form>
    );
}
