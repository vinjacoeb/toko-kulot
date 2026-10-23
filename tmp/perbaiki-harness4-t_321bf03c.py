"""Perbaikan kelima (terakhir) harness aksi stok: cek cabang galat vs daftar kosong + Field qty."""
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
    """    harus(adaNilai(pohonGalat, 'Gagal memuat daftar stok.'), 'pesan galat tidak tampil di tabel');
    harus(adaNilai(pohonGalat, 'Coba lagi'), 'aksi Coba lagi tidak tampil');""",
    """    harus(adaNilai(pohonGalat, 'Gagal memuat daftar stok.'), 'pesan galat tidak tampil di tabel');
    // Cabang galat menang atas daftar kosong: judul daftar kosong tidak dirender.
    // Label tombol Coba lagi milik komponen bersama DataTable (dipakai juga oleh F3/F5).
    harus(!teksPohon(pohonGalat).includes('Belum ada varian'), 'galat tampil sebagai daftar kosong');""",
    "A5: cabang galat bukan daftar kosong",
)

ganti(
    """    harus(adaNilai(pohonRiwayat, 'Gagal memuat riwayat stok.'), 'galat riwayat tidak tampil');
    harus(adaNilai(pohonRiwayat, 'Coba lagi'), 'aksi Coba lagi riwayat tidak tampil');""",
    """    harus(adaNilai(pohonRiwayat, 'Gagal memuat riwayat stok.'), 'galat riwayat tidak tampil');
    // Cabang galat menang atas riwayat kosong: judul riwayat kosong tidak dirender.
    harus(!teksPohon(pohonRiwayat).includes('Belum ada pergerakan stok'), 'galat riwayat tampil sebagai riwayat kosong');""",
    "C2: cabang galat bukan riwayat kosong",
)

ganti(
    """    harus(
        fieldJadi.props.label === 'Jumlah' && fieldJadi.props.required === true,
        `label atau penanda wajib hilang saat galat (label=${JSON.stringify(fieldJadi.props.label)} required=${JSON.stringify(fieldJadi.props.required)})`
    );""",
    """    // `fieldJadi` dari medanDari adalah Input ber-id sama; label dan penanda wajib ada di Field.
    const fieldQty = cariSemua(pohon, bernama('Field')).find((el) => el.props.htmlFor === 'stok-aksi-qty');
    harus(fieldQty !== undefined, 'Field qty tidak dirender');
    harus(
        fieldQty.props.label === 'Jumlah' && fieldQty.props.required === true,
        `label atau penanda wajib hilang saat galat (label=${JSON.stringify(fieldQty.props.label)} required=${JSON.stringify(fieldQty.props.required)})`
    );""",
    "B6: label wajib dari Field, bukan Input",
)

uji.write_text(u, encoding="utf-8")
print("selesai", len(u.splitlines()), "baris")
