"""Simpan kartu (dan komentar bila ada) ke berkas supaya bisa dibaca bertahap."""
import os
import sqlite3

KANDIDAT = [
    os.environ.get('HERMES_KANBAN_DB'),
    os.path.join(os.environ.get('LOCALAPPDATA', ''), 'hermes', 'kanban.db'),
    os.path.join(os.environ.get('LOCALAPPDATA', ''), 'hermes', 'kanban', 'boards', 'toko-kulot', 'kanban.db'),
]

laporan = []
con = None
dbfile = None
for path in KANDIDAT:
    if not path or not os.path.exists(path):
        continue
    c = sqlite3.connect('file:' + path.replace('\\', '/') + '?mode=ro', uri=True)
    tabel = [r[0] for r in c.execute("select name from sqlite_master where type='table'")]
    laporan.append(f'DB {path}\n  tabel: {tabel}')
    if 'tasks' in tabel and con is None:
        con = c
        dbfile = path
    else:
        c.close()

if con is None:
    print('tidak ada DB dengan tabel tasks')
    raise SystemExit(1)

con.row_factory = sqlite3.Row
cur = con.cursor()
target = os.environ.get('HERMES_KANBAN_TASK', 't_321bf03c')
cur.execute('select * from tasks where id=?', (target,))
row = cur.fetchone()

keluar = list(laporan)
keluar.append('=' * 70)
keluar.append(f"{row['id']} | {row['assignee']} | {row['status']} | {row['title']}")
keluar.append('=' * 70)
keluar.append('BODY:')
keluar.append(row['body'] or '')
keluar.append('')
keluar.append('KOLOM LAIN:')
for k in row.keys():
    if k in ('body', 'title'):
        continue
    keluar.append(f'  {k} = {row[k]}')
keluar.append('=' * 70)

tabel = [r[0] for r in cur.execute("select name from sqlite_master where type='table'")]
for nama in ('comments', 'task_comments', 'events', 'task_events'):
    if nama not in tabel:
        keluar.append(f'(tabel {nama} tidak ada)')
        continue
    kolom = [r[1] for r in cur.execute('pragma table_info(%s)' % nama)]
    keluar.append(f'--- {nama} ({kolom}) ---')
    fk = [k for k in kolom if k in ('task_id', 'card_id')]
    if fk:
        for c in cur.execute('select * from %s where %s=?' % (nama, fk[0]), (target,)):
            keluar.append(str(dict(c)))
    keluar.append('')

teks = '\n'.join(keluar)
path_out = os.path.join('tmp', 'kartu-%s.txt' % target)
with open(path_out, 'w', encoding='utf-8') as fh:
    fh.write(teks)
print('ditulis', path_out, len(teks), 'karakter dari', dbfile)
