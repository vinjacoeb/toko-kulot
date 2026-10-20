#!/usr/bin/env python3
"""Gate kontras teks meta di atas latar non-putih — aturan §2.1 v2.2 (kartu QA t_14cad9e2).

Aturan yang ditegakkan
----------------------
Teks meta informatif (kelas < 24px: `text-meta`, `text-label`, `text-badge`) hanya boleh
memakai `text-slate-500` (#64748B) di atas latar **putih** (4,76:1).
Di atas latar lain wajib `text-slate-600` (#475569):

    latar          slate-500   slate-600
    surface        4,40 (gagal)  7,00
    brand-100      3,93 (gagal)  6,26
    chip slate-200/60 @surface  4,08 (gagal)  6,50
    slate-200      3,86 (gagal)  6,15
    putih          4,76 (lolos)  7,58

Ambang teks normal WCAG 2.1 = 4,5:1 (angka lengkap: `docs/qa/kontras-meta.py`).
Pengecualian yang tetap sah: elemen non-teks/`aria-hidden` (ambang 3:1), teks
`disabled`, `placeholder:` di dalam field putih, dan komentar kode.

Pemeriksaan
-----------
A. DAFTAR_KEPUTUSAN — 29 titik yang ditetapkan v2.2 wajib sudah `text-slate-600`.
   Belum selesai / pola hilang  -> GAGAL.
B. Penyapu latar — kemunculan `text-slate-500` yang penanda latar terdekatnya di berkas yang
   sama (<= 12 baris ke atas, penanda bukan elemen daun chip/thumbnail/track)
   `bg-surface` / `bg-brand-100` / `bg-slate-200` -> GAGAL. Penanda yang lebih jauh atau
   berbentuk elemen daun hanya dilaporkan TINJAU (mis. chip avatar di atas teks yang
   sesungguhnya berada di kartu putih).
C. Sisa `text-slate-500` yang latarnya tak terdeteksi (mis. kartu putih/modal yang
   terpisah jauh) -> hanya dilaporkan untuk ditinjau manusia.

Keluar 0 hanya bila A selesai dan B kosong.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

# (path relatif, jumlah titik baris ini, potongan baris apa adanya)
DAFTAR_KEPUTUSAN = [
    (
        "resources/js/Components/PageHeader.jsx",
        1,  # baris [18]
        '{description && <p className="mt-1 text-meta text-slate-500">{description}</p>}',
    ),
    (
        "resources/js/Components/Breadcrumb.jsx",
        1,  # baris [31]
        '<ol className="flex h-full items-center gap-2 text-meta text-slate-500">',
    ),
    (
        "resources/js/Components/EmptyState.jsx",
        1,  # baris [25]
        '{description && <p className="max-w-sm text-meta text-slate-500">{description}</p>}',
    ),
    (
        "resources/js/Components/ErrorState.jsx",
        1,  # baris [28]
        '{description && <p className="max-w-sm text-meta text-slate-500">{description}</p>}',
    ),
    (
        "resources/js/Components/StarRating.jsx",
        1,  # baris [48]
        '<span className="text-meta text-slate-500">({formatNumber(count)})</span>',
    ),
    (
        "resources/js/Components/DataTable.jsx",
        1,  # baris [81]
        "'h-tableHead whitespace-nowrap border-b border-line px-4 text-label uppercase text-slate-500',",
    ),
    (
        "resources/js/Components/QrisPanel.jsx",
        1,  # baris [99]
        '<p className="mt-4 text-meta text-slate-500">',
    ),
    (
        "resources/js/Components/QrisPanel.jsx",
        1,  # baris [100]
        'Kode pesanan <span className="font-mono text-slate-500">{code}</span> · {amount}',
    ),
    (
        "resources/js/Pages/Public/Contact.jsx",
        1,  # baris [248]
        '<div className="flex h-map w-full items-center justify-center rounded-md border border-line bg-surface p-4 text-center text-meta text-slate-500">',
    ),
    (
        "resources/js/Pages/Admin/Accounts/Index.jsx",
        2,  # baris [455, 525]
        '<p className="text-meta text-slate-500">',
    ),
    (
        "resources/js/Pages/Admin/Categories/Index.jsx",
        3,  # baris [414, 469, 605]
        '<p className="text-meta text-slate-500">',
    ),
    (
        "resources/js/Pages/Admin/Messages/Index.jsx",
        2,  # baris [341, 406]
        '<p className="text-meta text-slate-500">',
    ),
    (
        "resources/js/Pages/Admin/Messages/Index.jsx",
        1,  # baris [479]
        '<p className="text-badge uppercase text-slate-500">Isi pesan</p>',
    ),
    (
        "resources/js/Pages/Admin/Messages/Index.jsx",
        1,  # baris [484]
        '<dt className="shrink-0 text-slate-500">Email</dt>',
    ),
    (
        "resources/js/Pages/Admin/Messages/Index.jsx",
        1,  # baris [488]
        '<dt className="shrink-0 text-slate-500">Telepon</dt>',
    ),
    (
        "resources/js/Pages/Admin/Messages/Index.jsx",
        1,  # baris [492]
        '<dt className="shrink-0 text-slate-500">Diterima</dt>',
    ),
    (
        "resources/js/Pages/Admin/Messages/Index.jsx",
        1,  # baris [504]
        '<p className="text-badge uppercase text-slate-500">Balasan toko</p>',
    ),
    (
        "resources/js/Pages/Admin/Messages/Index.jsx",
        1,  # baris [506]
        '<p className="mt-1 text-meta text-slate-500">',
    ),
    (
        "resources/js/Pages/Admin/Reviews/Index.jsx",
        1,  # baris [263]
        '<p className="text-badge uppercase text-slate-500">Balasan toko</p>',
    ),
    (
        "resources/js/Pages/Admin/Reviews/Index.jsx",
        1,  # baris [265]
        '<p className="mt-1 text-meta text-slate-500">{formatDateTime(row.replied_at)}</p>',
    ),
    (
        "resources/js/Pages/Admin/Reviews/Index.jsx",
        1,  # baris [397]
        '<p className="text-meta text-slate-500">',
    ),
    (
        "resources/js/Pages/Admin/Reviews/Index.jsx",
        1,  # baris [459]
        '<span className="text-meta text-slate-500">',
    ),
    (
        "resources/js/Pages/Admin/Settings/Index.jsx",
        1,  # baris [163]
        "isActive ? 'border-b-2 border-brand text-brand' : 'text-slate-500 hover:text-ink'",
    ),
    (
        "resources/js/Pages/Admin/Settings/Index.jsx",
        1,  # baris [1551]
        '<p className="text-meta text-slate-500">Carousel tampil di bagian atas beranda, urut dari angka terkecil.</p>',
    ),
    (
        "resources/js/Pages/Admin/Settings/Index.jsx",
        1,  # baris [1573]
        '<p className="text-meta text-slate-500">FAQ tampil di bagian FAQ beranda, urut dari angka terkecil.</p>',
    ),
]

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
JS = ROOT / "resources" / "js"

LATAR_NON_PUTIH = (
    "bg-surface",
    "bg-brand-100",
    "bg-slate-200",
)
LATAR_PUTIH = ("bg-white", "card")
WINDOW_FATAL = 12   # penanda kontainer nyata dekat (mis. panel `expired` QrisPanel: 11 baris)
WINDOW_TINJAU = 60  # di luar itu penanda biasanya elemen daun/saudara -> tinjau manusia
LEAF_HINT = (
    "rounded-full",
    "overflow-hidden",
    "flex-1",
    "file:bg-surface",
    "object-cover",
    "h-cartThumb",
) + tuple(f"h-{n} w-{n}" for n in (6, 8, 9, 10, 11, 12, 16, 20, 24))
UKURAN_IKON = (
    "h-8 w-8",
    "h-10 w-10",
    "h-11 w-11",
    "h-12 w-12",
    "h-16 w-16",
    "h-touch w-touch",
    "h-6 w-6",
)


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def pola_teks_meta(mentah: str) -> re.Pattern[str]:
    bermeta = mentah.replace("text-slate-500", "@@META@@")
    pola = re.escape(bermeta).replace("@@META@@", "(?:text-slate-500|text-slate-600)")
    return re.compile("^" + norm(pola) + "$")


def label_latar(baris: str) -> str | None:
    """Kembalikan label latar bila baris memuat kelas latar yang relevan."""
    kelas = baris
    for awalan in ("hover:", "focus:", "disabled:", "file:", "active:", "group-hover:"):
        kelas = kelas.replace(awalan, "")
    for nama in LATAR_NON_PUTIH:
        if nama in kelas:
            return nama
    for nama in LATAR_PUTIH:
        if re.search(r"\b" + re.escape(nama) + r"\b", kelas):
            return nama
    return None


TAG_RE = re.compile(r"<(/)?([A-Za-z][\w.]*)?([^<>]*)")


def delta_tag(baris: str) -> int:
    """Perkiraan (opens - closes) tag JSX pada satu baris; self-closing diabaikan."""
    if baris.strip().startswith(("//", "*", "/*")):
        return 0
    delta = 0
    for cocok in TAG_RE.finditer(baris):
        tutup, nama, sisa = cocok.group(1), cocok.group(2), cocok.group(3) or ""
        self_closing = sisa.rstrip().endswith("/")
        if nama is None:
            delta += -1 if tutup else (0 if self_closing else 1)
            continue
        delta += -1 if tutup else (0 if self_closing else 1)
    return delta


def masih_terbuka(baris: list[str], j: int, i: int) -> bool:
    """Perkiraan apakah elemen yang membuka di baris `j` masih terbuka di baris `i`.

    Dipakai agar penanda latar dari elemen **saudara** yang sudah ditutup
    (mis. kotak `bg-surface` unggah ikon) tidak dianggap sebagai induk teks.
    Perkiraan berbasis keseimbangan tag: akurasi cukup untuk berkas JSX proyek ini.
    """
    saldo = 1  # elemen penanda sendiri
    for k in range(j + 1, i + 1):
        saldo += delta_tag(baris[k])
        if saldo <= 0:
            return False
    return True


def periksa_keputusan(gagal: list[str]) -> None:
    print("=== A. DAFTAR_KEPUTUSAN (29 titik v2.2 -> text-slate-600) ===")
    selesai = belum = 0
    hilang: list[str] = []
    for rel, jumlah, mentah in DAFTAR_KEPUTUSAN:
        path = ROOT / rel
        if not path.exists():
            gagal.append(f"berkas hilang: {rel}")
            continue
        pola = pola_teks_meta(mentah)
        baris = [norm(teks) for teks in path.read_text(encoding="utf-8").splitlines()]
        jumlah_600 = sum(1 for teks in baris if pola.match(teks) and "text-slate-600" in teks)
        jumlah_500 = sum(1 for teks in baris if pola.match(teks) and "text-slate-500" in teks)
        if jumlah_500:
            belum += jumlah_500
            selesai += jumlah_600
        elif jumlah_600 == jumlah:
            selesai += jumlah_600
        else:
            hilang.append(f"{rel} :: {mentah[:70]} (600={jumlah_600}, harap {jumlah})")
    print(f"  selesai  : {selesai}")
    print(f"  belum    : {belum}")
    if belum:
        gagal.append(f"{belum} titik keputusan masih text-slate-500")
    for baris in hilang:
        print(f"  TINJAU   : {baris}")
        gagal.append(f"pola keputusan hilang/berubah: {baris}")


def periksa_sapu(gagal: list[str]) -> None:
    print("=== B. Penyapu latar non-putih ===")
    kandidat: list[tuple[str, int, str]] = []
    tinjau: list[tuple[str, int, str]] = []
    aman = 0
    for path in sorted(JS.rglob("*.jsx")):
        rel = path.relative_to(ROOT).as_posix()
        baris = path.read_text(encoding="utf-8").splitlines()
        for i, teks in enumerate(baris):
            if "text-slate-500" not in teks:
                continue
            bersih = teks.strip()
            if bersih.startswith(("*", "//")):
                continue
            if "aria-hidden" in teks or "placeholder:text-slate-500" in teks:
                continue
            if re.search(r"disabled:text-slate-500", teks):
                continue
            punya_teks = any(k in teks for k in ("text-meta", "text-label", "text-badge", "text-body", "text-h"))
            if any(k in teks for k in UKURAN_IKON) and not punya_teks:
                continue
            marker = None
            for j in range(i - 1, max(-1, i - WINDOW_TINJAU) - 1, -1):
                if baris[j].strip().startswith(("*", "//", "/*", "{/*")):
                    continue  # komentar JSDoc/JSX, bukan elemen
                label = label_latar(baris[j])
                if not label:
                    continue
                if any(k in baris[j] for k in LEAF_HINT):
                    continue  # chip/thumbnail/track: bukan kontainer teks
                if i - j > WINDOW_FATAL:
                    continue  # terlalu jauh: kemungkinan saudara yang sudah lewat
                if not masih_terbuka(baris, j, i):
                    continue  # elemen sudah ditutup sebelum baris ini (saudara, bukan induk)
                marker = (j, label)
                break
            if not marker:
                tinjau.append((rel, i + 1, "tidak ada penanda kontainer <= 12 baris di atas"))
                continue
            if marker[1] in LATAR_PUTIH:
                aman += 1
                continue
            kandidat.append((rel, i + 1, f"{marker[1]} @{i - marker[0]} baris di atas (kontainer terbuka)"))
    for rel, lineno, label in kandidat:
        print(f"  GAGAL    : {rel}:{lineno} -> {label}")
    if kandidat:
        gagal.append(f"{len(kandidat)} teks meta text-slate-500 di atas latar non-putih")
    print(f"  kandidat : {len(kandidat)}")
    print(f"  aman     : {aman} (penanda terdekat = putih/kartu)")
    for rel, lineno, label in tinjau:
        print(f"  TINJAU   : {rel}:{lineno} ({label})")
    print(f"  ditinjau : {len(tinjau)}")
    print("=== C. Sisa text-slate-500 (tidak menggagalkan) ===")
    total = sum(
        1 for path in JS.rglob("*.jsx") for teks in path.read_text(encoding="utf-8").splitlines() if "text-slate-500" in teks
    )
    print(f"  total kemunculan text-slate-500 di resources/js: {total}")


def main() -> int:
    print(f"gate kontras meta §2.1 v2.2 — akar: {ROOT}")
    gagal: list[str] = []
    periksa_keputusan(gagal)
    periksa_sapu(gagal)
    print("=== HASIL ===")
    if gagal:
        for pesan in gagal:
            print(f"  GAGAL: {pesan}")
        print("status: GAGAL (keluar 1)")
        return 1
    print("status: LOLOS (keluar 0)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
