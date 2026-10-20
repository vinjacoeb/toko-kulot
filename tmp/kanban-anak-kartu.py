#!/usr/bin/env python
# Read-only: anak/orang tua t_6ee422f2 + workspace kartu lanjutan.
import os
import sqlite3
from pathlib import Path

db = Path(os.environ["LOCALAPPDATA"]) / "hermes" / "kanban" / "boards" / "toko-kulot" / "kanban.db"
con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)

print("=== task_links menyangkut t_6ee422f2 ===")
try:
    for row in con.execute(
        "SELECT parent_id, child_id FROM task_links WHERE parent_id=? OR child_id=?",
        ("t_6ee422f2", "t_6ee422f2"),
    ):
        print(row)
except sqlite3.Error as exc:
    print("task_links error:", exc)

print("\n=== kartu lanjutan: kolom workspace ===")
for tid in ("t_b5de72e3", "t_e5149746", "t_099c813c", "t_6ee422f2"):
    for row in con.execute(
        "SELECT id, status, assignee, workspace_kind, workspace_path FROM tasks WHERE id=?",
        (tid,),
    ):
        print(row)
