"""Baca kartu t_e3c1f107 dari board (read-only) — alat verifikasi, bukan operasi board."""
import os
import sqlite3

db = os.path.expanduser('~/.hermes/kanban.db')
con = sqlite3.connect('file:' + db + '?mode=ro', uri=True)
cur = con.cursor()
tables = [r[0] for r in cur.execute("select name from sqlite_master where type='table'")]
print('tabel:', tables)
for t in ('tasks', 'cards', 'kanban_tasks'):
    if t not in tables:
        continue
    cols = [r[1] for r in cur.execute(f'pragma table_info({t})')]
    print(t, cols)
    idcol = 'id' if 'id' in cols else cols[0]
    row = cur.execute(f"select * from {t} where {idcol}='t_e3c1f107'").fetchone()
    if row:
        for col, val in zip(cols, row):
            text = str(val)
            if col in ('body', 'title', 'summary', 'result', 'reason', 'metadata'):
                print(f'--- {col} ---\n{text}')
