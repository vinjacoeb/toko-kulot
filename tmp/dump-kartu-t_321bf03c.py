"""Simpan kartu + komentar ke berkas supaya bisa dibaca bertahap (baca saja)."""
import os
import sqlite3

db = os.environ.get('HERMES_KANBAN_DB') or os.path.join(
    os.environ.get('LOCALAPPDATA', ''), 'hermes', 'kanban', 'boards', 'toko-kulot', 'kanban.db'
)

con = sqlite3.connect('file:' + db.replace('\\', '/') + '?mode=ro', uri=True)
con.row_factory = sqlite3.Row
cur = con.cursor()

target = os.environ.get('HERMES_KANBAN_TASK', 't_321bf03c')
cur.execute('select * from tasks where id=?', (target,))
row = cur.fetchone()

out = []
out.append('=' * 70)
out.append(f"{row['id']} | {row['assignee']} | {row['status']} | {row['title']}")
out.append('=' * 70)
out.append(row['body'] or '')
out.append('-' * 70)
out.append('KOMENTAR')
cur.execute('select author, body, created_at from comments where task_id=? order by created_at', (target,))
for c in cur.fetchall():
    out.append(f"[{c['created_at']}] {c['author']}:")
    out.append(c['body'] or '')
    out.append('')

path = os.path.join('tmp', f'kartu-{target}.txt')
with open(path, 'w', encoding='utf-8') as fh:
    fh.write('\n'.join(out))
print('ditulis', path, len('\n'.join(out)), 'karakter')
