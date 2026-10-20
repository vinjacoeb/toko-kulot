#!/usr/bin/env python
# Baca papan kanban (read-only) untuk memeriksa apakah sudah ada kartu yang
# menangani tombol "Tambah" mati di halaman Kategori/Akun. Tidak menulis apa pun.
import os
import sqlite3
from pathlib import Path

DB = Path(os.environ.get("HERMES_KANBAN_DB") or
          (Path(os.environ["LOCALAPPDATA"]) / "hermes" / "kanban" / "boards" / "toko-kulot" / "kanban.db"))
print("db:", DB, "| ada:", DB.exists())
conn = sqlite3.connect(f"file:{DB.as_posix()}?mode=ro", uri=True)
conn.row_factory = sqlite3.Row

tables = [r[0] for r in conn.execute("select name from sqlite_master where type='table'")]
print("tabel:", ", ".join(tables))

rows = conn.execute(
    """
    select id, status, assignee, title
    from tasks
    where title like '%ategori%' or title like '%Akun%' or title like '%placeholder%'
       or title like '%tambah%' or title like '%404%'
    order by created_at
    """
).fetchall()
print(f"\nkartu relevan: {len(rows)}")
for r in rows:
    print(f"  [{r['status']:<9}] {r['id']} {r['assignee']:<16} {r['title'][:95]}")

print("\ncarian kata kunci di judul+body:")
for kw in ("topbar", "pencarian", "kategori", "akun", "dashboard", "modal", "placeholder"):
    rows = conn.execute(
        "select id, status, assignee, title from tasks "
        "where lower(coalesce(title,'')||' '||coalesce(body,'')) like ? order by created_at",
        (f"%{kw}%",),
    ).fetchall()
    print(f"-- {kw}: {len(rows)}")
    for r in rows:
        print(f"     [{r['status']:<9}] {r['id']} {r['assignee']:<16} {r['title'][:80]}")

print("\nsemua kartu terbuka (todo/ready/running/review/blocked/triage):")
rows = conn.execute(
    """
    select id, status, assignee, title
    from tasks
    where status not in ('done','archived')
    order by status, created_at
    """
).fetchall()
for r in rows:
    print(f"  [{r['status']:<9}] {r['id']} {r['assignee']:<16} {r['title'][:95]}")
