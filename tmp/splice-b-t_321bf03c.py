"""Ganti blok B pada harness aksi stok dengan versi baru (file uji lokal, bukan bagian aplikasi)."""
from pathlib import Path

TARGET = Path(__file__).resolve().parent / "uji-aksi-stok-t_321bf03c.mjs"
BARU = (Path(__file__).resolve().parent / "b-baru-t_321bf03c.txt").read_text(encoding="utf-8")

teks = TARGET.read_text(encoding="utf-8")
awal = teks.index("// ========================================================== B. modal aksi stok")
akhir = teks.index("// ======================================================== C. halaman riwayat")

TARGET.write_text(teks[:awal] + BARU + teks[akhir:], encoding="utf-8")
print("blok B diganti; baris baru:", len((teks[:awal] + BARU + teks[akhir:]).splitlines()))
