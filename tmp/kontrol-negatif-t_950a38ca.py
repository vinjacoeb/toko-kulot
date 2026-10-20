"""Kontrol negatif kartu t_950a38ca.

Mengembalikan sementara tiga blok dashboard (stok kritis, pesanan terbaru,
ulasan terbaru) ke perilaku lama — empty state saat prop `error` halaman terisi —
supaya terbukti assert baru di `tmp/verify-dashboard-cta.mjs` benar-benar
menangkap gejala kartu, bukan lolos karena assert lemah.

Pakai (dari root repo, selalu lewat `tmp/bukti-t_950a38ca.sh` yang menyimpan
salinan + memverifikasi hash saat memulihkan):
    python tmp/kontrol-negatif-t_950a38ca.py
"""
import pathlib
import sys

REPO = pathlib.Path(__file__).resolve().parents[1]
TARGET = REPO / "resources" / "js" / "Pages" / "Admin" / "Dashboard.jsx"

REVERTS = [
    (
        """                        {error ? (
                            <ErrorState
                                description={typeof error === 'string' ? error : 'Periksa koneksi Anda lalu coba lagi.'}
                                onRetry={reload}
                                supportHref={null}
                                className="py-6"
                            />
                        ) : stockRows.length === 0 ? (""",
        """                        {stockRows.length === 0 ? (""",
    ),
    (
        """                        loading={loading}
                        error={error}
                        onRetry={reload}
                        emptyTitle="Belum ada pesanan\"""",
        """                        loading={loading}
                        emptyTitle="Belum ada pesanan\"""",
    ),
    (
        """                    {error ? (
                        <div className="rounded-lg border border-line bg-white">
                            <ErrorState
                                description={typeof error === 'string' ? error : 'Periksa koneksi Anda lalu coba lagi.'}
                                onRetry={reload}
                                supportHref={null}
                                className="py-8"
                            />
                        </div>
                    ) : reviewRows.length === 0 ? (""",
        """                    {reviewRows.length === 0 ? (""",
    ),
]


def main():
    src = TARGET.read_text(encoding="utf-8")

    for new, old in REVERTS:
        if src.count(new) != 1:
            sys.exit(f"GAGAL: potongan tidak ditemukan / tidak unik -> {new.splitlines()[0].strip()}")

        src = src.replace(new, old)

    TARGET.write_text(src, encoding="utf-8")
    print("kontrol negatif terpasang: tiga blok kembali ke empty state saat prop error terisi")


if __name__ == "__main__":
    main()
