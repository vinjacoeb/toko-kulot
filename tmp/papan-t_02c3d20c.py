"""Cuplik papan (baca-saja) untuk mencatat apakah ada kartu frontend lain sedang berjalan
saat `npm run build` dijalankan. Hanya SELECT; tidak menulis ke kanban.db."""
import datetime
import os
import sqlite3

DB = os.environ.get("HERMES_KANBAN_DB") or os.path.join(
    os.path.expanduser("~"), "AppData", "Local", "hermes", "kanban", "boards", "toko-kulot", "kanban.db"
)
print("db:", DB)
con = sqlite3.connect("file:%s?mode=ro" % DB.replace("\\", "/"), uri=True)
cur = con.cursor()
tabel = [r[0] for r in cur.execute("select name from sqlite_master where type='table' order by name")]
print("tabel:", tabel)
kartu = next((t for t in tabel if t.lower() in ("task", "tasks", "kanban_tasks", "cards")), None)
print("waktu:", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
if kartu:
    kolom = [r[1] for r in cur.execute("pragma table_info(%s)" % kartu)]
    print("kolom:", kolom)
    tempat = "assignee" if "assignee" in kolom else None
    cur.execute(
        "select id, %s, status, title from %s where status in ('running','ready','todo','review') "
        "order by status, %s" % (tempat, kartu, tempat)
    )
    for tid, assignee, status, title in cur.fetchall():
        print("%-8s | %-18s | %s | %s" % (status, assignee, tid, title[:64]))
con.close()

