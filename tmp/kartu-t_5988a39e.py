"""Cetak isi kartu kanban t_5988a39e (read-only) + daftar kartu frontend terkait."""

import os
import sqlite3

DB = os.environ.get("HERMES_KANBAN_DB", os.path.expanduser("~/.hermes/kanban.db"))
con = sqlite3.connect("file:" + DB + "?mode=ro", uri=True)
cur = con.cursor()
cur.execute("PRAGMA table_info(tasks)")
kolom = [r[1] for r in cur.fetchall()]
print("kolom:", kolom)

cur.execute("SELECT * FROM tasks WHERE id = ?", ("t_5988a39e",))
row = cur.fetchone()
if row is None:
    print("kartu tidak ditemukan")
else:
    for nama, nilai in zip(kolom, row):
        teks = "" if nilai is None else str(nilai)
        print(f"\n### {nama} ###\n{teks}")
