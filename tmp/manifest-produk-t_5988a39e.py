"""Peta chunk manifest untuk halaman Admin/Products (read-only)."""

import json

m = json.load(open("public/build/manifest.json", encoding="utf-8"))

for k, v in sorted(m.items()):
    if "Admin/Products" in k:
        print(k, "->", v.get("file"), "| imports:", v.get("imports"))

for nama in ("Index-DB7lFkda.js", "ProdukForm-CGHtUyTE.js"):
    print(nama, "ada:", any("build/assets/" + nama in m[k].get("file", "") for k in m))
