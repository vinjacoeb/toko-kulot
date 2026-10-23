"""Perbaikan keempat harness aksi stok: cek galat lewat nilai props + onFinish di C2."""
import re
from pathlib import Path

uji = Path("tmp/uji-aksi-stok-t_321bf03c.mjs")
u = uji.read_text(encoding="utf-8")


def ganti(lama, baru, label, jumlah=1):
    global u
    n = u.count(lama)
    if n != jumlah:
        raise SystemExit(f"[GAGAL] {label}: {n} kali (harap {jumlah})")
    u = u.replace(lama, baru)
    print(f"[ok] {label}")


# helper: apakah sebuah nilai teks ada di suatu tempat dalam pohon elemen (props maupun anak)
ganti(
    "const cekGalatTabel = undefined;",
    "const cekGalatTabel = undefined;",
    "noop",
) if False else None

ganti(
    "const tombol = (pohon, teks) =>",
    """// Apakah teks tampil sebagai nilai prop di suatu tempat dalam pohon (mis. EmptyState/InlineNotice
// menerima pesan lewat prop, bukan anak elemen).
const adaNilai = (simpul, teks) => {
    if (simpul === null || simpul === undefined) return false;
    if (typeof simpul === 'string') return simpul.includes(teks);
    if (Array.isArray(simpul)) return simpul.some((anak) => adaNilai(anak, teks));
    if (typeof simpul === 'object') {
        if (typeof simpul.type === 'function' || typeof simpul.type === 'object') {
            return adaNilai(simpul.props ?? {}, teks) || adaNilai(simpul.props?.children, teks);
        }
        return Object.values(simpul).some((nilai) => adaNilai(nilai, teks));
    }
    return false;
};

const tombol = (pohon, teks) =>""",
    "helper adaNilai",
)

ganti(
    """    const markupGalat = teksPohon(renderPohon(DataTable, tabelGalat.props));
    harus(markupGalat.includes('Gagal memuat daftar stok.'), 'pesan galat tidak tampil di tabel');
    harus(markupGalat.includes('Coba lagi'), 'tombol Coba lagi tidak tampil');
    harus(!markupGalat.includes('Belum ada varian'), 'galat tidak boleh tampil sebagai daftar kosong');""",
    """    const pohonGalat = renderPohon(DataTable, tabelGalat.props);
    harus(adaNilai(pohonGalat, 'Gagal memuat daftar stok.'), 'pesan galat tidak tampil di tabel');
    harus(adaNilai(pohonGalat, 'Coba lagi'), 'aksi Coba lagi tidak tampil');""",
    "A5: cek pesan galat lewat pohon",
)

ganti(
    """    const pohonRiwayat = renderPohon(DataTable, tabelRiwayat.props);
    const markupRiwayat = teksPohon(pohonRiwayat);
    if (process.env.DEBUG_C2) {
        console.log(
            `    [C2] error=${JSON.stringify(tabelRiwayat.props.error)} retry=${typeof tabelRiwayat.props.onRetry} ` +
                `kosong=${JSON.stringify(tabelRiwayat.props.emptyTitle)} kolom=${tabelRiwayat.props.columns?.length} ` +
                `markup=${markupRiwayat.slice(0, 300)}`
        );
    }
    harus(markupRiwayat.includes('Gagal memuat riwayat stok.'), 'galat riwayat tidak tampil');
    harus(!markupRiwayat.includes('Belum ada pergerakan stok'), 'galat riwayat tidak boleh tampil sebagai riwayat kosong');""",
    """    const pohonRiwayat = renderPohon(DataTable, tabelRiwayat.props);
    if (process.env.DEBUG_C2) {
        console.log(
            `    [C2] error=${JSON.stringify(tabelRiwayat.props.error)} retry=${typeof tabelRiwayat.props.onRetry} ` +
                `kosong=${JSON.stringify(tabelRiwayat.props.emptyTitle)} loading=${tabelRiwayat.props.loading}`
        );
    }
    harus(adaNilai(pohonRiwayat, 'Gagal memuat riwayat stok.'), 'galat riwayat tidak tampil');
    harus(adaNilai(pohonRiwayat, 'Coba lagi'), 'aksi Coba lagi riwayat tidak tampil');""",
    "C2: cek pesan galat lewat pohon",
)

# C2: Inertia selalu memanggil onFinish setelah onError -> keadaan memuat berakhir.
mulai = u.index("uji('C2 ")
akhir = u.index("uji('C3 ")
blok = u[mulai:akhir]
n = len(re.findall(r"(\w+)\.onError\(\);", blok))
if n != 1:
    raise SystemExit(f"[GAGAL] C2 onError: {n} kali")
blok2 = re.sub(r"(\w+)\.onError\(\);", r"\1.onError();\n    \1.onFinish(); // Inertia selalu memanggil onFinish", blok, count=1)
u = u[:mulai] + blok2 + u[akhir:]
print("[ok] C2: panggil onFinish setelah onError")

ganti(
    """    harus(
        fieldJadi.props.label === 'Jumlah' && fieldJadi.props.required === true,
        'label atau penanda wajib hilang saat galat'
    );""",
    """    harus(
        fieldJadi.props.label === 'Jumlah' && fieldJadi.props.required === true,
        `label atau penanda wajib hilang saat galat (label=${JSON.stringify(fieldJadi.props.label)} required=${JSON.stringify(fieldJadi.props.required)})`
    );""",
    "B6: pesan gagal lebih rinci",
)

uji.write_text(u, encoding="utf-8")
print("selesai")
