# -*- coding: utf-8 -*-
"""Audit: untuk SETIAP kemunculan text-slate-500, cari penanda latar TERDEKAT
(hingga 80 baris ke atas) memakai fungsi gate docs/qa/sweep-meta-surface.py.

Keluaran: baris yang penanda terdekatnya BUKAN putih/kartu (kandidat temuan),
plus ringkasan sisanya. Jalankan dari akar repo.
"""
import importlib.util
import sys
from pathlib import Path

sys.argv = ["audit", "."]
spec = importlib.util.spec_from_file_location("gate", "docs/qa/sweep-meta-surface.py")
gate = importlib.util.module_from_spec(spec)
sys.modules["gate"] = gate
spec.loader.exec_module(gate)  # __main__ guard -> main() tidak jalan

JS = Path("resources/js")
PUTIH = gate.LATAR_PUTIH
LEAF = gate.LEAF_HINT

kandidat_putih = 0
daftar_putih = []
daftar_temuan = []
tak_ada_penanda = []
komentar = []  # kemunculan di baris komentar (bukan teks yang dirender)

for path in sorted(JS.rglob("*.jsx")):
    with path.open("r", encoding="utf-8", newline="") as fh:
        lines = [l.rstrip("\r") for l in fh.read().split("\n")]
    rel = path.as_posix()
    for i, teks in enumerate(lines):
        if "text-slate-500" not in teks:
            continue
        if teks.strip().startswith(("*", "//", "/*", "{/*")):
            komentar.append((rel, i + 1))
            continue  # komentar JSDoc/JSX: bukan teks yang dirender
        tanda = None
        for j in range(i - 1, max(-1, i - 81), -1):
            baris = lines[j]
            if baris.strip().startswith(("*", "//", "/*", "{/*")):
                continue  # komentar menyebut kelas, bukan elemen latar
            label = gate.label_latar(baris)
            if label is None:
                continue
            if not gate.masih_terbuka(lines, j, i):
                continue
            berdaun = any(tok in baris for tok in LEAF)
            tanda = (label, i - j, berdaun, baris.strip()[:70])
            break
        if tanda is None:
            tak_ada_penanda.append((rel, i + 1))
            continue
        label, jarak, berdaun, cuplik = tanda
        putih = any(p in label for p in PUTIH)
        if putih:
            kandidat_putih += 1
            daftar_putih.append((rel, i + 1, label, jarak))
        else:
            daftar_temuan.append((rel, i + 1, label, jarak, berdaun, teks.strip()[:80]))

print(f"kemunculan di baris komentar (bukan teks dirender) : {len(komentar)}")
for rel, b in komentar:
    print(f"    komentar {rel}:{b}")
print(f"kemunculan dengan penanda putih/kartu terdekat : {kandidat_putih}")
for rel, b, label, jarak in daftar_putih:
    print(f"    putih {rel}:{b} ({label} @{jarak})")
print(f"kemunculan tanpa penanda apa pun <= 80 baris  : {len(tak_ada_penanda)}")
for rel, b in tak_ada_penanda:
    print(f"    tanpa-penanda {rel}:{b}")
print(f"\nKANDIDAT TEMUAN (penanda non-putih terdekat)  : {len(daftar_temuan)}")
for rel, b, label, jarak, berdaun, cuplik in daftar_temuan:
    tag = "DAUN" if berdaun else "kontainer"
    print(f"  {rel}:{b} | {label} @{jarak} baris ({tag}) | {cuplik}")
