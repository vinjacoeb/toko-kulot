import sqlite3, os, sys, textwrap

db = os.environ.get('HERMES_KANBAN_DB') or os.path.join(os.path.expanduser('~'), '.hermes', 'kanban.db')
con = sqlite3.connect(db)
con.row_factory = sqlite3.Row
cur = con.cursor()
tid = sys.argv[1]
row = cur.execute('select * from tasks where id=?', (tid,)).fetchone()
if row is None:
    print('tidak ada kartu', tid)
    raise SystemExit(1)

print('ID   :', row['id'])
print('JUDUL:', row['title'])
print('STATUS:', row['status'], '| assignee:', row['assignee'], '| ws:', row['workspace_kind'], row['workspace_path'])
print('BODY :')
print(textwrap.indent(row['body'] or '', '    '))
print('--- komentar ---')
try:
    for c in cur.execute('select author, body, created_at from comments where task_id=? order by created_at', (tid,)).fetchall():
        print(f"[{c['author']}] {c['body']}")
except Exception as e:
    print('(komentar tidak terbaca:', e, ')')
print('--- anak ---')
for r in cur.execute('select id,title,status,assignee from tasks where id in (select child_id from task_deps where parent_id=?)', (tid,)).fetchall():
    print(' ', r['id'], r['status'], r['assignee'], r['title'][:70])
con.close()
