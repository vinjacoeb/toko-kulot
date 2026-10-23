import os
import sqlite3

db = os.environ.get('HERMES_KANBAN_DB') or os.path.expanduser('~/.hermes/kanban.db')
kon = sqlite3.connect(db)
for (nama,) in kon.execute("select name from sqlite_master where type='table'"):
    kol = [r[1] for r in kon.execute(f'pragma table_info("{nama}")')]
    if 'task_id' in kol and 'body' in kol:
        print('TABEL:', nama)
        for baris in kon.execute(
            f'select id, created_at, author, substr(replace(body, char(10), " "), 1, 110) '
            f'from "{nama}" where task_id = ? order by id',
            ('t_321bf03c',),
        ):
            print(baris)
kon.close()
