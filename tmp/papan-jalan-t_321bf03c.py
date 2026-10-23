"""Cek kartu kanban yang masih berjalan (hindari npm run build paralel dengan kartu frontend lain)."""

import os
import sqlite3

db = os.environ.get('HERMES_KANBAN_DB') or os.path.expanduser('~/.hermes/kanban.db')
conn = sqlite3.connect(db)

tables = [r[0] for r in conn.execute("select name from sqlite_master where type='table'")]
print('TABEL:', tables)

for nama in tables:
    if 'task' in nama or 'card' in nama:
        kolom = [r[1] for r in conn.execute(f'pragma table_info({nama})')]
        print(nama, '->', kolom)

for row in conn.execute(
    "select id, assignee, status, title from tasks where status in ('running','ready','review') "
    "order by status, assignee"
):
    print(' | '.join(str(x) for x in row))
