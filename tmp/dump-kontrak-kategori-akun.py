"""Dump kontrak kategori/akun: controller, request, stub, potongan dokumen."""
import io
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def read(path):
    with io.open(os.path.join(ROOT, path), encoding="utf-8", errors="replace") as fh:
        return fh.read()


def section(text, start_marker, end_marker):
    start = text.find(start_marker)
    if start < 0:
        return "(anchor %r tidak ditemukan)" % start_marker
    end = text.find(end_marker, start)
    if end < 0:
        end = len(text)
    return text[start:end]


out = []
out.append("========== CategoryController.php ==========")
out.append(read("app/Http/Controllers/Admin/CategoryController.php"))
out.append("========== AccountController.php ==========")
out.append(read("app/Http/Controllers/Admin/AccountController.php"))
for name in ("StoreCategoryRequest", "UpdateCategoryRequest", "StoreAccountRequest", "UpdateAccountRequest"):
    out.append("========== %s.php ==========" % name)
    out.append(read("app/Http/Requests/Admin/%s.php" % name))
out.append("========== stub Categories/Index.jsx ==========")
out.append(read("resources/js/Pages/Admin/Categories/Index.jsx"))
out.append("========== stub Accounts/Index.jsx ==========")
out.append(read("resources/js/Pages/Admin/Accounts/Index.jsx"))

kontrak = read("docs/kontrak-props.md")
lines = kontrak.splitlines()
anchors = []
for i, line in enumerate(lines, start=1):
    if re.search(r"12\.(8|9|10|11|19|20|21|22|23)\b", line):
        anchors.append(i)
if anchors:
    lo, hi = min(anchors), max(anchors)
    lo = max(1, lo - 3)
    hi = min(len(lines), hi + 90)
    out.append("========== kontrak-props.md baris %d-%d (anchor 12.8-12.23) ==========" % (lo, hi))
    out.extend("%d| %s" % (n, lines[n - 1]) for n in range(lo, hi + 1))
else:
    out.append("========== kontrak-props.md: anchor 12.8/12.19 tidak ketemu ==========")

design = read("docs/design.md")
for d_name, text in (("design.md", design),):
    hits = []
    for i, line in enumerate(text.splitlines(), start=1):
        if re.search(r"\b(ategori|kategori|Akun|akun)\b", line):
            hits.append(i)
    out.append("========== %s: baris yang menyebut kategori/akun (%d) ==========" % (d_name, len(hits)))
    dlines = text.splitlines()
    shown = set()
    printed = 0
    for h in hits[:80]:
        for n in range(max(1, h - 1), min(len(dlines), h + 2) + 1):
            if n in shown or printed > 400:
                continue
            shown.add(n)
            out.append("%d| %s" % (n, dlines[n - 1]))
            printed += 1

payload = "\n".join(out)
path = os.path.join(ROOT, "tmp", "kontrak-kategori-akun.txt")
with io.open(path, "w", encoding="utf-8") as fh:
    fh.write(payload)
print("OK", path, len(payload))
sys.stdout.flush()
