"""Daftar kartu papan toko-kulot (baca saja) + komentar kartu tertentu."""
import os
import sqlite3
import sys

db = os.environ.get('HERMES_KANBAN_DB') or os.path.join(
    os.environ.get('LOCALAPPDATA', ''), 'hermes', 'kanban', 'boards', 'toko-kulot', 'kanban.db'
)

con = sqlite3.connect('file:' + db.replace('\\', '/') + '?mode=ro', uri=True)
con.row_factory = sqlite3.Row
cur = con.cursor()

if len(sys.argv) > 1 and sys.argv[1] != 'list':
    for task_id in sys.argv[1:]:
        cur.execute('select * from tasks where id=?', (task_id,))
        row = cur.fetchone()
        if not row:
            print('tidak ada:', task_id)
            continue
        print('=' * 70)
        print(row['id'], '|', row['assignee'], '|', row['status'], '|', row['title'])
        print(row['body'])
        cur.execute('select author, body from comments where task_id=? order by created_at', (task_id,))
        for c in cur.fetchall():
            print(f"  [{c['author']}] {c['body']}")
else:
    cur.execute('select id, assignee, status, title from tasks order by created_at')
    for r in cur.fetchall():
        print(f"{r['id']} | {r['assignee']:<18} | {r['status']:<9} | {r['title'][:80]}")
