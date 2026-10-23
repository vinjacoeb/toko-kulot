import os
import sqlite3

db = os.environ.get('HERMES_KANBAN_DB') or os.path.expanduser('~/.hermes/kanban.db')
kon = sqlite3.connect(db)
kol = [r[1] for r in kon.execute('pragma table_info(tasks)')]
print('KOLOM:', ', '.join(kol))
pilih = [k for k in ('id', 'workspace_kind', 'workspace_path', 'branch_name', 'priority', 'project') if k in kol]
q = 'select ' + ', '.join(pilih) + " from tasks where id in ('t_321bf03c','t_3a240a11')"
for r in kon.execute(q):
    print(r)
kon.close()
