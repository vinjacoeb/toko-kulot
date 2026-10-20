import sqlite3, os

c = sqlite3.connect(os.environ['HERMES_KANBAN_DB'])
c.row_factory = sqlite3.Row
tables = [r[0] for r in c.execute("select name from sqlite_master where type='table'")]
print('tabel:', tables)
for t in tables:
    if 'edge' in t or 'dep' in t or 'link' in t:
        print('--', t, [d[1] for d in c.execute(f'pragma table_info({t})')])
        for r in c.execute(f"select * from {t} where parent_id='t_8bca0661' or child_id='t_8bca0661'"):
            print('   ', dict(r))
print('-- kartu terbaru --')
for r in c.execute('select id,status,assignee,title from tasks order by created_at desc limit 14'):
    print(r['id'], r['status'], r['assignee'], (r['title'] or '')[:64])
print('-- komentar kartu ini (kalau ada tabelnya) --')
for t in tables:
    if 'comment' in t:
        for r in c.execute(f"select * from {t} where task_id='t_8bca0661'"):
            print('   ', dict(r))
c.close()
