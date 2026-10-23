"""Daftar kartu board (read-only) — dipakai untuk memastikan tidak membuat duplikat.
Filter opsional lewat argumen: kata kunci pada assignee/title/body."""
import os
import sqlite3
import sys

DB = os.environ.get("HERMES_KANBAN_DB") or os.path.expanduser("~/.hermes/kanban.db")
kata = (sys.argv[1] if len(sys.argv) > 1 else "").lower()

koneksi = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
koneksi.row_factory = sqlite3.Row
kolom = {r[1] for r in koneksi.execute("PRAGMA table_info(tasks)")}
print("kolom tasks:", ", ".join(sorted(kolom)))

sql = "SELECT id, status, assignee, title FROM tasks"
if kata:
    sql += " WHERE lower(coalesce(assignee,'')) LIKE ? OR lower(title) LIKE ?"
    baris = koneksi.execute(sql, (f"%{kata}%", f"%{kata}%")).fetchall()
else:
    baris = koneksi.execute(sql).fetchall()

for r in sorted(baris, key=lambda r: (r["status"], r["id"])):
    print(f'{r["id"]}  [{r["status"]}/{r["assignee"]}]  {r["title"]}')
print(f"total: {len(baris)}")
