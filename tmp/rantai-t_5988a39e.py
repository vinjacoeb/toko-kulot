"""Cetak rantai kartu t_5988a39e naik ke atas (read-only)."""

import os
import sqlite3

DB = os.environ.get("HERMES_KANBAN_DB", os.path.expanduser("~/.hermes/kanban.db"))
con = sqlite3.connect("file:" + DB + "?mode=ro", uri=True)
cur = con.cursor()
cur.execute("SELECT id, title, assignee, status FROM tasks")
kartu = {tid: (judul, penanggung, status) for tid, judul, penanggung, status in cur.fetchall()}

anak = "t_5988a39e"
jejak = []
for _ in range(8):
    cur.execute("SELECT parent_id FROM task_links WHERE child_id=?", (anak,))
    baris = cur.fetchall()
    if not baris:
        break
    orangtua = baris[0][0]
    info = kartu.get(orangtua, ("?", "?", "?"))
    jejak.append(f"{orangtua}  [{info[2]}] {info[1][:70]} ({info[1] and info[2]} / {info[0][:60]})")
    anak = orangtua

print("rantai ke atas:")
for baris in jejak:
    print("  ", baris)

print("\nkartu techlead aktif/terkait rantai:")
for tid, (judul, penanggung, status) in sorted(kartu.items()):
    if penanggung == "techlead" and status not in ("done", "archived"):
        print(f"  {tid} [{status}] {judul[:70]}")
