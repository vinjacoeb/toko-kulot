"""Cek jam mulai kartu running + jejak waktu build, untuk memastikan tidak ada race build (read-only)."""
import os
import sqlite3

DB = os.environ.get("HERMES_KANBAN_DB") or os.path.expanduser("~/.hermes/kanban.db")
koneksi = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
koneksi.row_factory = sqlite3.Row
for baris in koneksi.execute(
    "SELECT id, assignee, status, started_at, last_heartbeat_at, workspace_kind, workspace_path "
    "FROM tasks WHERE status IN ('running','review') ORDER BY started_at"
):
    print(dict(baris))
print("--- kartu F6 saya ---")
for baris in koneksi.execute(
    "SELECT id, status, started_at, last_heartbeat_at, workspace_kind, workspace_path, branch_name "
    "FROM tasks WHERE id = 't_2de36f29'"
):
    print(dict(baris))
