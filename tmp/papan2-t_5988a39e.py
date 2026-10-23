"""Anak & parent kartu t_5988a39e + rantai kartu frontend/produk (read-only)."""

import os
import sqlite3
from collections import Counter

DB = os.environ.get("HERMES_KANBAN_DB", os.path.expanduser("~/.hermes/kanban.db"))
con = sqlite3.connect("file:" + DB + "?mode=ro", uri=True)
cur = con.cursor()

cur.execute("SELECT id, title, assignee, status FROM tasks")
kartu = {tid: (judul, penanggung, status) for tid, judul, penanggung, status in cur.fetchall()}

print("== task_links menyentuh t_5988a39e ==")
cur.execute("SELECT parent_id, child_id FROM task_links WHERE parent_id='t_5988a39e' OR child_id='t_5988a39e'")
for parent, child in cur.fetchall():
    print(f"  parent={parent} child={child}")
    for tid in (parent, child):
        info = kartu.get(tid)
        if info:
            print(f"     {tid}: [{info[2]}] {info[0][:70]} ({info[1]})")

print("\n== kartu berkaitan produk/admin ==")
for tid, (judul, penanggung, status) in sorted(kartu.items()):
    if any(k in judul.lower() for k in ("produk", "admin", "f3", "f4", "f5", "f2", "f6")):
        print(f"{tid}  {status:<10} {penanggung:<18} {judul[:80]}")

print("\n== jumlah per status ==")
print(dict(Counter(v[2] for v in kartu.values())))
