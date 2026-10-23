"""Konversi jam epoch kartu ke waktu lokal, untuk catatan race build (read-only)."""
import datetime
import os
import sqlite3

DB = os.environ.get("HERMES_KANBAN_DB") or os.path.expanduser("~/.hermes/kanban.db")
koneksi = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
print("jam lokal sekarang:", datetime.datetime.now().strftime("%H:%M:%S"))
for tid in ("t_2de36f29", "t_d1028202"):
    baris = koneksi.execute(
        "SELECT id, started_at, last_heartbeat_at FROM tasks WHERE id = ?", (tid,)
    ).fetchone()
    mulai = datetime.datetime.fromtimestamp(baris[1]).strftime("%H:%M:%S")
    hb = datetime.datetime.fromtimestamp(baris[2]).strftime("%H:%M:%S")
    print(f"{baris[0]}: mulai {mulai}, heartbeat terakhir {hb}")
