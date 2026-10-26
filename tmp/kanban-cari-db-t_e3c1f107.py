"""Cari DB kanban yang memuat t_e3c1f107 (read-only) — alat verifikasi."""
import os
import sqlite3

print('HERMES_KANBAN_DB =', os.environ.get('HERMES_KANBAN_DB'))
print('HERMES_KANBAN_TASK =', os.environ.get('HERMES_KANBAN_TASK'))
print('HERMES_KANBAN_BOARD =', os.environ.get('HERMES_KANBAN_BOARD'))

roots = [os.path.expanduser('~/.hermes'), os.path.expanduser('~/AppData/Local/hermes')]
found = []
for root in roots:
    for dirpath, dirnames, filenames in os.walk(root):
        depth = dirpath[len(root):].count(os.sep)
        if depth > 4:
            dirnames[:] = []
            continue
        for fn in filenames:
            if fn.endswith('.db') and 'kanban' in fn:
                found.append(os.path.join(dirpath, fn))
print('kandidat:', found)

for path in found:
    try:
        con = sqlite3.connect('file:' + path + '?mode=ro', uri=True)
        cur = con.cursor()
        tables = [r[0] for r in cur.execute("select name from sqlite_master where type='table'")]
        if 'tasks' not in tables:
            continue
        row = cur.execute("select title, body from tasks where id='t_e3c1f107'").fetchone()
        if row:
            print('=== DB:', path, '===')
            print('JUDUL:', row[0])
            print('BODY:')
            print(row[1] or '(kosong)')
    except Exception as exc:  # noqa: BLE001
        print('gagal', path, exc)
