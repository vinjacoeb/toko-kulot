"""Tambahkan bagian F5b (kartu t_d1028202) ke ujung docs/catatan-frontend.md.

Aman untuk berkas bersama: berkas hanya ditambahkan (append), gaya akhir baris
(CRLF/LF) mengikuti isi berkas yang ada, dan tidak ada baris lama yang diubah.
Jalankan: python tmp/append-f5b-t_d1028202.py
"""
import os

akar = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dok = os.path.join(akar, "docs", "catatan-frontend.md")
bagian = os.path.join(akar, "tmp", "bagian-f5b-catatan.md")

with open(dok, "rb") as fh:
    sebelum = fh.read()

ekor = sebelum[-400:]
crlf = ekor.count(b"\r\n") >= (ekor.count(b"\n") / 2)
print("CRLF:", crlf, "| byte sebelum:", len(sebelum), "| baris sebelum:", sebelum.count(b"\n"))

with open(bagian, encoding="utf-8") as fh:
    isi = fh.read().replace("\r\n", "\n").rstrip("\n") + "\n"

tambahan = ("\n\n" + isi).replace("\n", "\r\n" if crlf else "\n").encode("utf-8")

with open(dok, "ab") as fh:
    fh.write(tambahan)

with open(dok, "rb") as fh:
    sesudah = fh.read()

ekor_baru = sesudah[-400:]
print("CRLF akhir:", ekor_baru.count(b"\r\n") >= (ekor_baru.count(b"\n") / 2),
      "| byte sesudah:", len(sesudah), "| baris sesudah:", sesudah.count(b"\n"))
baris = sesudah.decode("utf-8").replace("\r\n", "\n").split("\n")
print("heading baru:", [b for b in baris if b.startswith("## F5b")])
print("baris terakhir:", baris[-2] if baris[-1] == "" else baris[-1])
