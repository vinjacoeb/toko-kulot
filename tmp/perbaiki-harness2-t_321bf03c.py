"""Perbaikan ketiga harness aksi stok: onFinish, label Field, dan diagnosis C2."""
from pathlib import Path

uji = Path("tmp/uji-aksi-stok-t_321bf03c.mjs")
u = uji.read_text(encoding="utf-8")


def ganti(lama, baru, label):
    global u
    n = u.count(lama)
    if n != 1:
        raise SystemExit(f"[GAGAL] {label}: {n} kali")
    u = u.replace(lama, baru)
    print(f"[ok] {label}")


ganti(
    """    opsiUrut.onError();
    kini = cari(renderPohon(Index, propsIndex()), bernama('DataTable'));""",
    """    opsiUrut.onError();
    opsiUrut.onFinish(); // Inertia selalu memanggil onFinish setelah onError
    kini = cari(renderPohon(Index, propsIndex()), bernama('DataTable'));""",
    "A5: panggil onFinish setelah onError",
)

ganti(
    "    harus(teksPohon(fieldJadi).includes('Jumlah *'), 'label wajib hilang dari Field');",
    "    harus(\n        fieldJadi.props.label === 'Jumlah' && fieldJadi.props.required === true,\n        'label atau penanda wajib hilang saat galat'\n    );",
    "B6: label wajib tetap tampil saat galat",
)

ganti(
    """    const markupRiwayat = teksPohon(renderPohon(DataTable, tabelRiwayat.props));
    harus(markupRiwayat.includes('Gagal memuat riwayat stok.'), 'galat riwayat tidak tampil');""",
    """    const pohonRiwayat = renderPohon(DataTable, tabelRiwayat.props);
    const markupRiwayat = teksPohon(pohonRiwayat);
    if (process.env.DEBUG_C2) {
        console.log(
            `    [C2] error=${JSON.stringify(tabelRiwayat.props.error)} retry=${typeof tabelRiwayat.props.onRetry} ` +
                `kosong=${JSON.stringify(tabelRiwayat.props.emptyTitle)} kolom=${tabelRiwayat.props.columns?.length} ` +
                `markup=${markupRiwayat.slice(0, 300)}`
        );
    }
    harus(markupRiwayat.includes('Gagal memuat riwayat stok.'), 'galat riwayat tidak tampil');""",
    "C2: diagnosis markup",
)

uji.write_text(u, encoding="utf-8")
print("selesai")
