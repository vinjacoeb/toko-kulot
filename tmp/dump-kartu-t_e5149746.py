"""Dump kartu t_e5149746 dari kanban DB lokal (baca saja, tanpa tulis)."""
import glob
import os
import sqlite3
import sys

paths = []
env = os.environ.get("HERMES_KANBAN_DB")
if env:
    paths.append(env)
paths.append(os.path.join(os.path.expanduser("~"), ".hermes", "kanban.db"))
paths.extend(glob.glob(os.path.join(os.path.expanduser("~"), ".hermes", "kanban*.db")))

seen = set()
for path in paths:
    if path in seen or not os.path.exists(path):
        continue
    seen.add(path)
    print("=== DB:", path)
    try:
        con = sqlite3.connect("file:%s?mode=ro" % path.replace("\\", "/"), uri=True)
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        tables = [r[0] for r in cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
        print("tables:", tables)
        for table in tables:
            cols = [r[1] for r in cur.execute("PRAGMA table_info(%s)" % table)]
            print("  -", table, cols)
        if "tasks" in tables:
            cols = [r[1] for r in cur.execute("PRAGMA table_info(tasks)")]
            for row in cur.execute("SELECT * FROM tasks WHERE id LIKE 't_e5149746%'"):
                print("\n--- TASK ROW ---")
                for col in cols:
                    val = row[col] if col in row.keys() else None
                    print("%s: %s" % (col, val))
        for table in ("task_comments", "comments", "task_events", "events"):
            if table not in tables:
                continue
            cols = [r[1] for r in cur.execute("PRAGMA table_info(%s)" % table)]
            idcol = "task_id" if "task_id" in cols else ("card_id" if "card_id" in cols else None)
            if not idcol:
                continue
            try:
                rows = list(cur.execute(
                    "SELECT * FROM %s WHERE %s LIKE 't_e5149746%%'" % (table, idcol)))
            except sqlite3.Error as exc:
                print("skip", table, exc)
                continue
            print("\n--- %s rows: %d ---" % (table, len(rows)))
            for row in rows:
                print("---")
                for col in cols:
                    print("%s: %s" % (col, row[col]))
        con.close()
    except Exception as exc:  # noqa: BLE001
        print("ERROR", path, exc)

sys.stdout.flush()
