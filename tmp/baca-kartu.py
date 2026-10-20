"""Baca satu kartu kanban + komentarnya dari DB (baca saja)."""
import os
import sqlite3
import sys

task_id = sys.argv[1] if len(sys.argv) > 1 else 't_099c813c'
db = os.environ.get('HERMES_KANBAN_DB') or os.path.join(
    os.environ.get('LOCALAPPDATA', ''), 'hermes', 'kanban', 'boards', 'toko-kulot', 'kanban.db'
)

con = sqlite3.connect('file:' + db.replace('\\', '/') + '?mode=ro', uri=True)
con.row_factory = sqlite3.Row
cur = con.cursor()

cur.execute('select * from tasks where id=?', (task_id,))
row = cur.fetchone()
if not row:
    print('task tidak ditemukan:', task_id)
    raise SystemExit(1)

keys = set(row.keys())
print('TITLE:', row['title'])
for k in ('status', 'assignee', 'workspace_kind', 'workspace_path', 'branch', 'parents'):
    if k in keys:
        print(f'{k} = {row[k]}')
print('--- BODY ---')
print(row['body'])
print('--- KOMENTAR ---')
try:
    cur.execute(
        'select author, body from comments where task_id=? order by created_at', (task_id,)
    )
    for c in cur.fetchall():
        print(f"[{c['author']}] {c['body']}")
except sqlite3.OperationalError as exc:
    print('(gagal baca komentar:', exc, ')')
