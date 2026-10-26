"""Cek anak kartu t_099c813c + cari kartu lain bertema 'error'/ChartCard (baca saja)."""

import json
import os
import sqlite3

DB = os.environ.get('HERMES_KANBAN_DB') or os.path.join(
    os.environ.get('LOCALAPPDATA', ''), 'hermes', 'kanban', 'boards', 'toko-kulot', 'kanban.db'
)
con = sqlite3.connect('file:' + DB.replace('\\', '/') + '?mode=ro', uri=True)
con.row_factory = sqlite3.Row
cur = con.cursor()
cur.execute('pragma table_info(tasks)')
cols = [r[1] for r in cur.fetchall()]
print('kolom:', cols)

cur.execute("select name from sqlite_master where type='table' order by name")
tables = [r[0] for r in cur.fetchall()]
print('tabel:', tables)

me = 't_6c310317'
cur.execute('select id, title, assignee, status from tasks')
rows = cur.fetchall()

print('--- tabel dependensi (cari turunan t_099c813c) ---')
for t in tables:
    if t == 'tasks':
        continue
    try:
        cur.execute(f'select * from "{t}" limit 1')
        sample = cur.fetchone()
        if sample is None:
            continue
        fields = set(sample.keys())
        if {'parent_id', 'child_id'} <= fields:
            cur.execute('select * from "%s" where parent_id=?' % t, (me,))
            kids = [dict(r) for r in cur.fetchall()]
            print(t, '-> anak:', kids)
    except sqlite3.OperationalError as exc:
        print('(lewati', t, exc, ')')

print('--- kartu menyebut error/ChartCard/dashboard ---')
for r in rows:
    blob = f"{r['title']}"
    if any(k in blob.lower() for k in ('error', 'chartercard', 'charter', 'dashboard', 'empty')):
        print(r['id'], '|', r['status'], '|', r['assignee'], '|', blob[:110])

print('--- status semua kartu ---')
from collections import Counter

print(json.dumps(Counter(r['status'] for r in rows), indent=0))
