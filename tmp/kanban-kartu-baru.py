#!/usr/bin/env python
# Read-only: daftar kartu terbaru di papan (untuk memastikan id kartu lanjutan).
import os
import sqlite3
from pathlib import Path

kandidat = []
if os.environ.get("HERMES_KANBAN_DB"):
    kandidat.append(Path(os.environ["HERMES_KANBAN_DB"]))
kandidat += [
    Path(os.environ.get("LOCALAPPDATA", "")) / "hermes" / "kanban" / "boards" / "toko-kulot" / "kanban.db",
    Path(os.environ.get("LOCALAPPDATA", "")) / "hermes" / "kanban.db",
]
db = next((p for p in kandidat if p and p.exists()), None)
print("db:", db)
con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
for row in con.execute(
    "SELECT id, status, assignee, created_at, substr(title,1,80) FROM tasks "
    "ORDER BY created_at DESC LIMIT 12"
):
    print(" | ".join(str(x) for x in row))
