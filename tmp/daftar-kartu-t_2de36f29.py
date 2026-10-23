"""Daftar kartu board yang relevan (read-only) — berkas bantu sesi, bukan bagian aplikasi."""
import os
import re
import sqlite3
import sys

db = os.environ.get("HERMES_KANBAN_DB") or os.path.expanduser("~/.hermes/kanban.db")
db = db.replace("\\", "/")
conn = sqlite3.connect("file:" + db + "?mode=ro", uri=True)
conn.row_factory = sqlite3.Row

pola = sys.argv[1] if len(sys.argv) > 1 else "boleh|ulasan|review|penilaian|CheckoutSuccess"
baris = conn.execute(
    "select id, title, status, assignee, created_at from tasks order by created_at desc"
).fetchall()

print("== kartu yang cocok dengan /" + pola + "/ ==")
cocok = [r for r in baris if re.search(pola, (r["title"] or ""), re.I)]
for r in cocok:
    print(f"{r['id']}  [{r['status']}/{r['assignee']}]  {r['title']}")

print()
print("== semua kartu belum selesai (todo/ready/running/review/blocked) ==")
for r in baris:
    if r["status"] not in ("done", "archived"):
        print(f"{r['id']}  [{r['status']}/{r['assignee']}]  {r['title']}")
