# -*- coding: utf-8 -*-
"""Penerapan 29 titik keputusan v2.2 (kartu t_14cad9e2): text-slate-500 -> text-slate-600
untuk teks meta < 24px di atas latar non-putih (aturan docs/design.md §2.1 v2.2, temuan §11.4 T7).

Cara pakai (dari akar repo):
    python docs/qa/terapkan-meta-v22.py --cek     # dry run: laporkan saja
    python docs/qa/terapkan-meta-v22.py           # terapkan
    python docs/qa/sweep-meta-surface.py .        # gate setelahnya (harus exit 0)

Anchor byte-exact disimpan per titik, jadi skrip tetap benar bila nomor baris
bergeser; bila anchor tidak ditemukan (kode sudah diubah orang lain), skrip
berhenti dan melaporkan tanpa menulis apa pun.
"""
import sys
from pathlib import Path

CEK = "--cek" in sys.argv

# (berkas, baris saat kartu ditulis, anchor teks baris tanpa \r\n)
TITIK = [
    ("resources/js/Components/PageHeader.jsx", 18, "{description && <p className=\"mt-1 text-meta text-slate-500\">{description}</p>}"),
    ("resources/js/Components/Breadcrumb.jsx", 31, "<ol className=\"flex h-full items-center gap-2 text-meta text-slate-500\">"),
    ("resources/js/Components/EmptyState.jsx", 25, "{description && <p className=\"max-w-sm text-meta text-slate-500\">{description}</p>}"),
    ("resources/js/Components/ErrorState.jsx", 28, "{description && <p className=\"max-w-sm text-meta text-slate-500\">{description}</p>}"),
    ("resources/js/Components/StarRating.jsx", 48, "<span className=\"text-meta text-slate-500\">({formatNumber(count)})</span>"),
    ("resources/js/Components/DataTable.jsx", 81, "'h-tableHead whitespace-nowrap border-b border-line px-4 text-label uppercase text-slate-500',"),
    ("resources/js/Components/QrisPanel.jsx", 99, "<p className=\"mt-4 text-meta text-slate-500\">"),
    ("resources/js/Components/QrisPanel.jsx", 100, "Kode pesanan <span className=\"font-mono text-slate-500\">{code}</span> · {amount}"),
    ("resources/js/Pages/Public/Contact.jsx", 248, "<div className=\"flex h-map w-full items-center justify-center rounded-md border border-line bg-surface p-4 text-center text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Accounts/Index.jsx", 455, "<p className=\"text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Accounts/Index.jsx", 525, "<p className=\"text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Categories/Index.jsx", 414, "<p className=\"text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Categories/Index.jsx", 469, "<p className=\"text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Categories/Index.jsx", 605, "<p className=\"text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Messages/Index.jsx", 341, "<p className=\"text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Messages/Index.jsx", 406, "<p className=\"text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Messages/Index.jsx", 479, "<p className=\"text-badge uppercase text-slate-500\">Isi pesan</p>"),
    ("resources/js/Pages/Admin/Messages/Index.jsx", 484, "<dt className=\"shrink-0 text-slate-500\">Email</dt>"),
    ("resources/js/Pages/Admin/Messages/Index.jsx", 488, "<dt className=\"shrink-0 text-slate-500\">Telepon</dt>"),
    ("resources/js/Pages/Admin/Messages/Index.jsx", 492, "<dt className=\"shrink-0 text-slate-500\">Diterima</dt>"),
    ("resources/js/Pages/Admin/Messages/Index.jsx", 504, "<p className=\"text-badge uppercase text-slate-500\">Balasan toko</p>"),
    ("resources/js/Pages/Admin/Messages/Index.jsx", 506, "<p className=\"mt-1 text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Reviews/Index.jsx", 263, "<p className=\"text-badge uppercase text-slate-500\">Balasan toko</p>"),
    ("resources/js/Pages/Admin/Reviews/Index.jsx", 265, "<p className=\"mt-1 text-meta text-slate-500\">{formatDateTime(row.replied_at)}</p>"),
    ("resources/js/Pages/Admin/Reviews/Index.jsx", 397, "<p className=\"text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Reviews/Index.jsx", 459, "<span className=\"text-meta text-slate-500\">"),
    ("resources/js/Pages/Admin/Settings/Index.jsx", 163, "isActive ? 'border-b-2 border-brand text-brand' : 'text-slate-500 hover:text-ink'"),
    ("resources/js/Pages/Admin/Settings/Index.jsx", 1551, "<p className=\"text-meta text-slate-500\">Carousel tampil di bagian atas beranda, urut dari angka terkecil.</p>"),
    ("resources/js/Pages/Admin/Settings/Index.jsx", 1573, "<p className=\"text-meta text-slate-500\">FAQ tampil di bagian FAQ beranda, urut dari angka terkecil.</p>"),
]

def main() -> int:
    berkas = {}
    for rel, _b, _a in TITIK:
        berkas.setdefault(rel, None)

    for rel in berkas:
        p = Path(rel)
        if not p.exists():
            print(f"GAGAL: berkas tidak ada: {rel}")
            return 1
        with p.open("r", encoding="utf-8", newline="") as fh:
            berkas[rel] = fh.read().split("\n")

    gagal = []
    diubah = 0
    for rel, b, anchor in TITIK:
        lines = berkas[rel]
        idx = None
        if b - 1 < len(lines) and anchor in lines[b - 1] and "text-slate-500" in lines[b - 1]:
            idx = b - 1
        else:
            kandidat = [i for i, l in enumerate(lines) if anchor in l and "text-slate-500" in l]
            if not kandidat:
                gagal.append(f"{rel}:{b}: anchor/`text-slate-500` tidak ditemukan (mungkin sudah diterapkan?)")
                continue
            if len(kandidat) == 1:
                idx = kandidat[0]
            else:
                jarak = sorted((abs(i - (b - 1)), i) for i in kandidat)
                if len(jarak) > 1 and jarak[0][0] == jarak[1][0]:
                    nomor = [i + 1 for i in kandidat]
                    gagal.append(f"{rel}:{b}: {len(kandidat)} kandidat berjarak sama -> periksa manual {nomor}")
                    continue
                idx = jarak[0][1]
        lines[idx] = lines[idx].replace("text-slate-500", "text-slate-600")
        diubah += 1

    if gagal:
        print("BATAL — tidak ada berkas yang ditulis. Temuan:")
        for g in gagal:
            print("  -", g)
        return 1

    if CEK:
        print(f"DRY RUN: {diubah}/{len(TITIK)} titik siap diubah (text-slate-500 -> text-slate-600). Tidak ada berkas ditulis.")
        return 0

    for rel, lines in berkas.items():
        with Path(rel).open("w", encoding="utf-8", newline="") as fh:
            fh.write("\n".join(lines))
    print(f"OK: {diubah}/{len(TITIK)} titik diterapkan di {len(berkas)} berkas (line ending dipertahankan).")
    print("Langkah berikutnya: python docs/qa/sweep-meta-surface.py .  (harus exit 0, Check A 29/29, Check B kandidat 0)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
