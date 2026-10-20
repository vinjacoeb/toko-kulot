#!/usr/bin/env python
# Cetak field workspace kartu (read-only) agar kartu turunan memakai workspace yang sama persis.
import os
import sqlite3
from pathlib import Path

db = Path(os.environ["LOCALAPPDATA"]) / "hermes" / "kanban" / "boards" / "toko-kulot" / "kanban.db"
conn = sqlite3.connect(f"file:{db.as_posix()}?mode=ro", uri=True)
conn.row_factory = sqlite3.Row

cols = [r[1] for r in conn.execute("pragma table_info(tasks)")]
print("kolom:", ", ".join(cols))

for tid in ("t_6ee422f2", "t_fc2c5b98"):
    row = conn.execute("select * from tasks where id = ?", (tid,)).fetchone()
    if not row:
        print(f"\n{tid}: tidak ada")
        continue
    print(f"\n{tid}:")
    for key in ("status", "assignee", "workspace_kind", "workspace_path", "branch",
                "completion_contract", "created_at", "updated_at"):
        if key in cols:
            print(f"  {key} = {row[key]!r}")

print("\nlink parent->child:")
for r in conn.execute("select * from task_links"):
    print("  ", dict(r))
