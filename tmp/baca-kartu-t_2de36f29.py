"""Baca satu kartu dari board (read-only) — berkas bantu sesi, bukan bagian aplikasi."""
import os
import sqlite3
import sys

db = os.environ.get("HERMES_KANBAN_DB") or os.path.expanduser("~/.hermes/kanban.db")
db = db.replace("\\", "/")
conn = sqlite3.connect("file:" + db + "?mode=ro", uri=True)
conn.row_factory = sqlite3.Row

kartu = sys.argv[1] if len(sys.argv) > 1 else "2de36f29"
row = conn.execute("select * from tasks where id like ?", ("%" + kartu + "%",)).fetchone()

if row is None:
    print("KARTU TIDAK DITEMUKAN")
    raise SystemExit(0)

keys = row.keys()
for k in ("id", "title", "status", "assignee", "workspace_kind", "workspace_path", "parents", "created_by", "created_at"):
    if k in keys:
        print(f"{k.upper()}: {row[k]}")
print("--- BODY ---")
print(row["body"] if "body" in keys else "(tidak ada body)")

print("--- KOMENTAR ---")
try:
    komentar = conn.execute(
        "select author, body, created_at from comments where task_id = ? order by created_at", (row["id"],)
    ).fetchall()
    if not komentar:
        print("(belum ada komentar)")
    for k in komentar:
        print(f"[{k['created_at']}] {k['author']}: {k['body']}")
except sqlite3.Error as e:
    print("(tabel komentar tidak terbaca:", e, ")")

print("--- ANAK / ORANG TUA ---")
try:
    edges = conn.execute("select parent_id, child_id from task_edges where parent_id = ? or child_id = ?", (row["id"], row["id"])).fetchall()
    for e in edges:
        print(f"parent={e['parent_id']} child={e['child_id']}")
except sqlite3.Error as e:
    print("(tabel edge tidak terbaca:", e, ")")
