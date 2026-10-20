"""Perbaiki workspace kartu yang baru dibuat (scratch -> dir repo proyek).

Kartu t_8bca0661 dibuat tanpa parameter workspace, sehingga dispatcher akan
menyiapkannya di scratch dir; padahal kerjanya di repo toko-kulot seperti kartu
frontend lain. Skrip ini hanya mengubah dua kolom pada satu baris kartu.
"""

import os
import sqlite3

DB = os.environ['HERMES_KANBAN_DB']
REPO = r'C:\Users\LENOVO\Downloads\toko-kulot'
TASK = 't_8bca0661'

con = sqlite3.connect(DB.replace('\\', '/'), timeout=15)
con.row_factory = sqlite3.Row
cur = con.cursor()

cur.execute('select id, title, workspace_kind, workspace_path, status from tasks where id=?', (TASK,))
row = cur.fetchone()
print('sebelum:', dict(row) if row else 'tidak ditemukan')
if row is None:
    raise SystemExit(1)

cur.execute(
    "update tasks set workspace_kind='dir', workspace_path=? where id=?",
    (REPO, TASK),
)
con.commit()

cur.execute('select id, workspace_kind, workspace_path, status from tasks where id=?', (TASK,))
print('sesudah:', dict(cur.fetchone()))
con.close()
