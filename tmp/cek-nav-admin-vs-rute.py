#!/usr/bin/env python
# Cek QA-007 (kartu t_6ee422f2): setiap href di ADMIN_NAV
# (resources/js/Layouts/AdminLayout.jsx) harus punya rute GET terdaftar di
# routes/admin.php. Tautan 404 di sidebar admin tidak boleh lolos lagi.
# Jalankan: python tmp/cek-nav-admin-vs-rute.py
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LAYOUT = ROOT / "resources" / "js" / "Layouts" / "AdminLayout.jsx"
ROUTES = ROOT / "routes" / "admin.php"

layout_src = LAYOUT.read_text(encoding="utf-8")
nav_block = re.search(r"export const ADMIN_NAV = \[(.*?)\n\];", layout_src, re.S)
if not nav_block:
    print("GAGAL: blok ADMIN_NAV tidak ditemukan di", LAYOUT)
    sys.exit(1)

nav = re.findall(r"key:\s*'([^']+)'[^}]*?href:\s*'([^']+)'", nav_block.group(1))
if not nav:
    print("GAGAL: tidak ada item nav terbaca")
    sys.exit(1)

routes_src = ROUTES.read_text(encoding="utf-8")
get_paths = set()
for method, path in re.findall(r"Route::(get|post|put|patch|delete)\('([^']*)'", routes_src):
    full = "/admin" + (path if path.startswith("/") else "/" + path)
    full = full.rstrip("/") if full != "/admin" else "/admin"
    if method == "get":
        get_paths.add(full)

print(f"ADMIN_NAV: {len(nav)} item | rute GET terdaftar di routes/admin.php: {len(get_paths)}")
print(f"{'key':<12} {'href':<22} {'rute GET':<22} status")

missing = []
for key, href in nav:
    ok = href in get_paths
    if not ok:
        missing.append((key, href))
    print(f"{key:<12} {href:<22} {'ada' if ok else 'TIDAK ADA':<22} {'ok' if ok else 'GAGAL'}")

# Item nav yang sudah tidak ada rutenya (kebalikannya) hanya dilaporkan sebagai info.
dipakai = {href for _, href in nav}
info = sorted(p for p in get_paths if p not in dipakai and not p.startswith("/admin/produk/")
              and not p.startswith("/admin/pesanan/") and not p.startswith("/admin/stok/")
              and not p.startswith("/admin/kategori/") and not p.startswith("/admin/akun/")
              and not p.startswith("/admin/penilaian/"))

print("\nRute GET admin di luar item nav (info, tidak dinilai):")
for path in info:
    print("  -", path)

if missing:
    print("\nGAGAL: item nav tanpa rute GET:", ", ".join(f"{k} -> {h}" for k, h in missing))
    sys.exit(1)

print("\nLULUS: semua item ADMIN_NAV punya rute GET terdaftar.")
