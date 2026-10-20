#!/usr/bin/env python
# Dump presisi: kontrak §12.7-§12.24 + desain admin untuk t_e5149746 (kategori & akun).
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tmp" / "kontrak-kategori-akun2.txt"

kontrak = (ROOT / "docs" / "kontrak-props.md").read_text(encoding="utf-8").splitlines()
design = (ROOT / "docs" / "design.md").read_text(encoding="utf-8").splitlines()

buf = []

buf.append("=== KONTRAK-PROPS: indeks heading memuat '12.' ===")
for i, line in enumerate(kontrak, 1):
    if "12." in line and len(line.strip()) < 120 and (line.lstrip().startswith("#") or line.lstrip().startswith("**")):
        buf.append(f"{i}: {line}")

buf.append("")
buf.append("=== KONTRAK-PROPS baris 850-1550 ===")
for i in range(850, min(1551, len(kontrak) + 1)):
    buf.append(f"{i}: {kontrak[i - 1]}")

buf.append("")
buf.append("=== DESIGN baris 560-780 ===")
for i in range(560, min(781, len(design) + 1)):
    buf.append(f"{i}: {design[i - 1]}")

OUT.write_text("\n".join(buf), encoding="utf-8")
print("OK", OUT, OUT.stat().st_size)
