"""Baca papan kanban (read-only) untuk memeriksa kartu yang sudah ada.

Dipakai oleh kartu frontend t_fc2c5b98 sebelum membuat kartu baru, agar tidak
menduplikasi kartu Tech Lead / QA. Mode read-only (uri=True, mode=ro).
"""

import os
import sqlite3
import sys

DB = os.environ.get(
    "HERMES_KANBAN_DB",
    os.path.expanduser("~/.hermes/kanban.db"),
)

if not os.path.exists(DB):
    print("db tidak ada:", DB)
    sys.exit(1)

con = sqlite3.connect("file:" + DB + "?mode=ro", uri=True)
cur = con.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("tables:", [r[0] for r in cur.fetchall()])

# Kolom tabel tasks
cur.execute("PRAGMA table_info(tasks)")
cols = [r[1] for r in cur.fetchall()]
print("kolom tasks:", cols)

select_cols = [c for c in ("id", "title", "assignee", "status", "created_at") if c in cols]
cur.execute(f"SELECT {', '.join(select_cols)} FROM tasks ORDER BY rowid DESC LIMIT 25")
print("--- 25 kartu terbaru ---")
for row in cur.fetchall():
    print(" | ".join(str(v)[:70] for v in row))
