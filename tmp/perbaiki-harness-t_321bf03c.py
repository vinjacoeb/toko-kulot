"""Perbaiki ekspektasi harness aksi stok setelah diagnosis (file uji lokal, bukan aplikasi)."""
from pathlib import Path

tmp = Path("tmp")
stub = tmp / "stub-inertia-t_321bf03c.mjs"
uji = tmp / "uji-aksi-stok-t_321bf03c.mjs"


def ganti(teks, lama, baru, label):
    n = teks.count(lama)
    if n != 1:
        raise SystemExit(f"[GAGAL] {label}: ditemukan {n} kali, harus 1")
    print(f"[ok] {label}")
    return teks.replace(lama, baru)


def span(teks, awal, akhir, baru, label):
    i = teks.index(awal)
    j = teks.index(akhir, i)
    print(f"[ok] {label} (buang {teks[i:j].count(chr(10))} baris)")
    return teks[:i] + baru + teks[j:]


# ---------------------------------------------------------------- stub
s = stub.read_text(encoding="utf-8")
s = ganti(
    s,
    """    const bentuk = kendali.formulir[0];
    bentuk.errors = { ...kendali.berikutnya.errors };
    bentuk.processing = Boolean(kendali.berikutnya.processing);""",
    """    const bentuk = kendali.formulir[0];
    // `errors` milik objek form (seperti Inertia asli: berubah saat server menjawab, reset,
    // atau clearErrors). Harness menyuntik galat server lewat kendali.formulir[0].errors.
    bentuk.processing = Boolean(kendali.berikutnya.processing);""",
    "stub: errors bertahan di objek form",
)
s = ganti(
    s,
    """ * useForm tiruan: satu formulir aktif per harness (modal stok satu-satunya pemakai di
 * halaman ini). Data bertahan antar render pass; `errors`/`processing` diambil ulang tiap
 * pass dari `kendali.berikutnya` supaya uji bisa menyuntikkan jawaban server.""",
    """ * useForm tiruan: satu formulir aktif per harness (modal stok satu-satunya pemakai di
 * halaman ini). Data dan errors bertahan antar render pass; `processing` dibaca ulang tiap
 * pass dari `kendali.berikutnya.processsing` supaya uji bisa menyuntikkan jawaban server.""",
    "stub: komentar useForm",
)
stub.write_text(s, encoding="utf-8")

# ---------------------------------------------------------------- harness
u = uji.read_text(encoding="utf-8")

u = ganti(
    u,
    "import Field from '../resources/js/Components/Field.jsx';",
    "import DataTable from '../resources/js/Components/DataTable.jsx';\nimport Field from '../resources/js/Components/Field.jsx';",
    "harness: impor DataTable",
)

u = span(
    u,
    "    // Tombol bersihkan mengosongkan isian;",
    "});\n\nuji('A4",
    """    // Tombol bersihkan: isian langsung kosong, nilai kosong menyusul lewat debounce.
    const kotak = renderPohon(SearchInput, { value: 'batik', onChange: (nilai) => dipanggil.push(nilai) });
    sama(cari(kotak, (el) => el.type === 'input').props.value, 'batik', 'isian tidak menampilkan nilai terkirim');

    klik(cari(kotak, (el) => el.props?.['aria-label'] === 'Bersihkan pencarian'));
    const kosong = renderPohon(SearchInput, { value: 'batik', onChange: (nilai) => dipanggil.push(nilai) });
    sama(cari(kosong, (el) => el.type === 'input').props.value, '', 'tombol bersihkan tidak mengosongkan isian');
    harus(dipanggil.length === 1, 'bersihkan memanggil server sebelum debounce selesai');

    majukanWaktu();
    sama(dipanggil, ['batik', ''], 'nilai kosong tidak terkirim setelah debounce');
""",
    "A3: rangkaian tombol bersihkan",
)

u = ganti(
    u,
    "    harus(teksPohon(kini).length > 0, 'pohon kosong saat memuat');",
    "    harus(Array.isArray(kini.props.rows) && kini.props.rows.length === 1, 'baris tidak dipertahankan saat memuat');",
    "A5: baris dipertahankan saat memuat",
)

u = ganti(
    u,
    """    const tabelGalat = renderPohon(Index, propsIndex());
    const markupGalat = teksPohon(tabelGalat);
    harus(markupGalat.includes('Gagal memuat daftar stok.'), 'pesan galat tidak tampil di halaman');
    harus(markupGalat.includes('Coba lagi'), 'tombol Coba lagi tidak tampil');
    harus(!markupGalat.includes('Belum ada varian'), 'galat tidak boleh tampil sebagai daftar kosong');

    // Coba lagi: kunjungan baru + onStart membersihkan galat.
    const tabelKedua = cari(tabelGalat, bernama('DataTable'));
    tabelKedua.props.onRetry();""",
    """    const tabelGalat = cari(renderPohon(Index, propsIndex()), bernama('DataTable'));
    harus(typeof tabelGalat.props.onRetry === 'function', 'tidak ada aksi Coba lagi saat galat');
    // DataTable tanpa hook: dirender sendiri supaya pesan galat terbukti sampai ke markup.
    const markupGalat = teksPohon(renderPohon(DataTable, tabelGalat.props));
    harus(markupGalat.includes('Gagal memuat daftar stok.'), 'pesan galat tidak tampil di tabel');
    harus(markupGalat.includes('Coba lagi'), 'tombol Coba lagi tidak tampil');
    harus(!markupGalat.includes('Belum ada varian'), 'galat tidak boleh tampil sebagai daftar kosong');

    // Coba lagi: kunjungan baru + onStart membersihkan galat.
    tabelGalat.props.onRetry();""",
    "A5: galat lewat DataTable",
)

u = ganti(
    u,
    "    sama(kunjunganTerakhir().data, { qty: '2' }, 'data keluar salah');",
    "    sama(kunjunganTerakhir().data, { qty: '2', note: '' }, 'data keluar salah');",
    "B3: payload ikut mengirim note kosong",
)

u = ganti(
    u,
    """    kendali.berikutnya.errors = { qty: 'Stok tidak cukup — stok saat ini 1.' };
    const pohon = renderPohon(StokAksiModal, modalProps({ baris: barisIndex({ stock: 1 }) }));
    const pesan = 'Stok tidak cukup — stok saat ini 1.';""",
    """    const pesan = 'Stok tidak cukup — stok saat ini 1.';
    renderPohon(StokAksiModal, modalProps({ baris: barisIndex({ stock: 1 }) }));

    // Jawaban server: Inertia mengisi errors pada objek form, bukan pada props halaman.
    kendali.formulir[0].errors = { qty: pesan };
    const pohon = renderPohon(StokAksiModal, modalProps({ baris: barisIndex({ stock: 1 }) }));""",
    "B6: galat qty lewat objek form",
)

u = ganti(
    u,
    """    kendali.berikutnya.errors = { stok: 'Varian tidak aktif.' };
    const pohonLain = renderPohon(StokAksiModal, modalProps());""",
    """    kendali.formulir[0].errors = { stok: 'Varian tidak aktif.' };
    const pohonLain = renderPohon(StokAksiModal, modalProps());""",
    "B6: galat non-kolom lewat objek form",
)

u = span(
    u,
    "    const halamanGalat = teksPohon(renderPohon(History, propsHistory()));",
    "    harus(kunjunganTerakhir().url === '/admin/stok/riwayat', 'Coba lagi riwayat salah URL');",
    """    const tabelRiwayat = cari(renderPohon(History, propsHistory()), bernama('DataTable'));
    harus(typeof tabelRiwayat.props.onRetry === 'function', 'tidak ada aksi Coba lagi saat galat riwayat');
    const markupRiwayat = teksPohon(renderPohon(DataTable, tabelRiwayat.props));
    harus(markupRiwayat.includes('Gagal memuat riwayat stok.'), 'galat riwayat tidak tampil');
    harus(!markupRiwayat.includes('Belum ada pergerakan stok'), 'galat riwayat tidak boleh tampil sebagai riwayat kosong');

    tabelRiwayat.props.onRetry();
""",
    "C2: galat riwayat lewat DataTable",
)

uji.write_text(u, encoding="utf-8")
print("selesai; baris harness:", len(u.splitlines()))
