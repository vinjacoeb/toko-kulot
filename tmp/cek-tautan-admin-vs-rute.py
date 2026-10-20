#!/usr/bin/env python
# Audit tambahan kartu t_6ee422f2 (QA-007): setiap URL '/admin/...' di resources/js
# harus cocok dengan rute di routes/admin.php, dengan METODE yang benar:
#   href=...                      -> GET (klik tautan)
#   router.<m>( / form.<m>(       -> metode m
# Segmen dinamis ({x} pada rute, ${...} pada template literal) = satu segmen path.
# Konteks yang tidak dikenal hanya dilaporkan sebagai info.
# Jalankan: python tmp/cek-tautan-admin-vs-rute.py
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "resources" / "js"
ROUTES = ROOT / "routes" / "admin.php"

WILD = "\x00"


def ke_pola(path: str):
    """Path rute/tautan -> pola regex; penanda dinamis jadi satu segmen path."""
    tanpa_wild = re.sub(r"(\{[^}]+\}|\$\{[^}]*\})", WILD, path)
    escaped = re.escape(tanpa_wild).replace(re.escape(WILD), "[^/]+")
    return re.compile(escaped + r"\Z")


routes_src = ROUTES.read_text(encoding="utf-8")
pola_rute = []
for method, path in re.findall(r"Route::(get|post|put|patch|delete)\('([^']*)'", routes_src):
    full = "/admin" + (path if path.startswith("/") else "/" + path)
    full = full.rstrip("/") if full != "/admin" else "/admin"
    pola_rute.append((method.upper(), full, ke_pola(full)))

LITERAL = re.compile(r"""['"`](/admin[^'"`\n]*)['"`]""")
KONTEKS = re.compile(
    r"(href\s*[:=]\s*|router\.(get|post|put|patch|delete)\s*\(\s*|form\.(post|put|patch|delete)\s*\(\s*)$"
)

temuan = []
diperiksa = []

for berkas in sorted(SRC.rglob("*.jsx")) + sorted(SRC.rglob("*.js")):
    teks = berkas.read_text(encoding="utf-8")
    for m in LITERAL.finditer(teks):
        url = m.group(1)
        if url.startswith("/admin/login") or url.startswith("/admin/logout"):
            continue
        awal = teks[max(0, m.start() - 60):m.start()]
        ctx = KONTEKS.search(awal)
        if ctx is None:
            metode, asal = None, "tidak dikenal"
        elif ctx.group(1).startswith("href"):
            metode, asal = "GET", "href"
        else:
            mm = ctx.group(2) or ctx.group(3)
            metode, asal = mm.upper(), ("router." if ctx.group(2) else "form.") + mm

        url_bersih = url.split("?")[0].rstrip("/") or "/admin"
        if metode is None:
            cocok = [f"{m2} {p}" for m2, p, pola in pola_rute if pola.match(url_bersih)]
        else:
            cocok = [f"{m2} {p}" for m2, p, pola in pola_rute
                     if m2 == metode and pola.match(url_bersih)]

        rel = str(berkas.relative_to(ROOT)).replace("\\", "/")
        baris = teks[:m.start()].count("\n") + 1
        diperiksa.append((rel, baris, url, metode or "?", asal, cocok))
        if metode is not None and not cocok:
            temuan.append((rel, baris, url, metode, asal))

print(f"url '/admin...' diperiksa: {len(diperiksa)} | rute admin terdaftar: {len(pola_rute)}")

print("\nurl dinamis (${...}) dan rute yang cocok:")
for rel, baris, url, metode, asal, cocok in diperiksa:
    if "${" in url:
        print(f"  - {rel}:{baris} [{metode} via {asal}] {url} -> "
              f"{', '.join(cocok) if cocok else 'TIDAK ADA'}")

print("\nkonteks tidak dikenal (info, tidak dinilai):")
for rel, baris, url, _, _, cocok in diperiksa:
    if _ == "?":
        print(f"  - {rel}:{baris} {url} -> {', '.join(cocok) if cocok else 'TIDAK ADA'}")

print("\nurl tanpa rute pada metode yang benar:")
if temuan:
    for rel, baris, url, metode, asal in temuan:
        print(f"  - {rel}:{baris} [{metode} via {asal}] {url}")
    print("\nGAGAL: ada url admin yang menunjuk rute tidak terdaftar untuk metodenya.")
    sys.exit(1)

print("  (tidak ada)")
print("LULUS: semua url admin cocok dengan rute terdaftar pada metode yang benar.")
