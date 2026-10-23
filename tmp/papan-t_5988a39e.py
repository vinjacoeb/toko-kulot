"""Papan kanban: anak/parent kartu t_5988a39e + rantai kartu frontend (read-only)."""

import json
import os
import sqlite3

DB = os.environ.get("HERMES_KANBAN_DB", os.path.expanduser("~/.hermes/kanban.db"))
con = sqlite3.connect("file:" + DB + "?mode=ro", uri=True)
cur = con.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tabel = [r[0] for r in cur.fetchall()]
print("tabel:", tabel)

kartu = {}
cur.execute("SELECT id, title, assignee, status FROM tasks")
for tid, judul, penanggung, status in cur.fetchall():
    kartu[tid] = (judul, penanggung, status)

for nama in tabel:
    if nama.startswith("task_dep") or "parent" in nama or "edge" in nama or "link" in nama:
        cur.execute(f"PRAGMA table_info({nama})")
        print(f"kolom {nama}:", [r[1] for r in cur.fetchall()])


def edge_query(nama):
    cur.execute(f"SELECT name FROM sqlite_master WHERE name='{nama}'")
    if not cur.fetchone():
        return []
    cur.execute(f"SELECT * FROM {nama} WHERE parent_id='t_5988a39e' OR child_id='t_5988a39e'")
    return cur.fetchall()


for nama in tabel:
    baris = edge_query(nama)
    if baris:
        cur.execute(f"PRAGMA table_info({nama})")
        kolom = [r[1] for r in cur.fetchall()]
        print(f"\n{nama} {kolom}")
        for b in baris:
            print("   ", dict(zip(kolom, b)))

print("\n== kartu terkait rantai F1-F6 & produk ==")
for tid, (judul, penanggung, status) in sorted(kartu.items()):
    if any(k in judul.lower() for k in ("produk", "f3", "f4", "f5", "f2", "f6", "admin")):
        print(f"{tid}  {status:<10} {penanggung:<18} {judul[:78]}")

print("\n== status semua kartu ==")
from collections import Counter

print(json.dumps(Counter(v[2] for v in kartu.values()), ensure_ascii=False))
