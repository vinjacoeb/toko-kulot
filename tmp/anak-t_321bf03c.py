import os
import sqlite3

TARGET = 't_321bf03c'
db = os.environ.get('HERMES_KANBAN_DB') or os.path.expanduser('~/.hermes/kanban.db')
kon = sqlite3.connect(db)
kon.row_factory = sqlite3.Row

tabel = [r[0] for r in kon.execute("select name from sqlite_master where type='table'")]
print('TABEL:', ', '.join(tabel))

for nama in tabel:
    kol = [r[1] for r in kon.execute(f'pragma table_info("{nama}")')]
    if 'status' in kol and 'title' in kol:
        print(f'\n== {nama}: kartu yang menyebut stok / berjalan ==')
        q = (
            'select id, status, assignee, workspace_kind, substr(title, 1, 70) as judul '
            f'from "{nama}" where status != \'done\' or lower(title) like \'%stok%\' '
            'or lower(title) like \'%admin%\' order by status, id'
        )
        for r in kon.execute(q):
            print(dict(r))

for nama in tabel:
    kol = [r[1] for r in kon.execute(f'pragma table_info("{nama}")')]
    if any('parent' in k for k in kol) and any('child' in k or 'task' in k for k in kol):
        print(f'\n== {nama} ==')
        for r in kon.execute(f'select * from "{nama}"'):
            print(dict(r))

kon.close()
