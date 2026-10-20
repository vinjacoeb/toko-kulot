"""Lihat skema DB kanban (baca saja)."""
import os
import sqlite3

for path in (
    os.path.expanduser('~/.hermes/kanban.db'),
    os.path.expanduser('~/.hermes/kanban/kanban.db'),
):
    if not os.path.exists(path):
        print('tidak ada:', path)
        continue
    con = sqlite3.connect(f'file:{path}?mode=ro', uri=True)
    cur = con.cursor()
    cur.execute("select name from sqlite_master where type='table' order by name")
    names = [r[0] for r in cur.fetchall()]
    print('DB:', path)
    print('tabel:', names)
    for t in names:
        cur.execute(f'select count(*) from "{t}"')
        print(f'  {t}: {cur.fetchone()[0]} baris')
    con.close()
