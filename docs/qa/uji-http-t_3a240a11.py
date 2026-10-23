"""Bukti HTTP QA kartu t_3a240a11 (baca-saja, tanpa login, tanpa menulis data).

Memeriksa:
  * halaman publik dapat dijangkau (status HTTP) dan props Inertia benar-benar dikirim
    server (atribut `data-page`), termasuk `cart.count` (sumber badge, temuan F-1);
  * rute admin & halaman bayar tidak dapat diakses tanpa autentikasi.

Tidak ada POST/PUT/PATCH/DELETE, tidak ada kredensial, tidak ada data pemilik yang diubah.
Jalankan: python docs/qa/uji-http-t_3a240a11.py http://127.0.0.1:8000
"""

import html
import json
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"

HALAMAN = ["/", "/produk", "/kontak-kami", "/keranjang"]
TERLINDUNG = ["/admin", "/admin/produk", "/admin/stok", "/admin/pesanan", "/admin/login"]


class TanpaRedirect(urllib.request.HTTPRedirectHandler):
    """Jangan ikuti redirect: status/lokasi harus terlihat sebagai bukti."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: D102
        return None


def ambil(path, ikuti=True):
    opener = urllib.request.build_opener() if ikuti else urllib.request.build_opener(TanpaRedirect)
    req = urllib.request.Request(
        BASE + path,
        headers={"User-Agent": "QA-toko-kulot/1.0 (baca-saja)", "Accept": "text/html"},
    )

    try:
        with opener.open(req, timeout=15) as resp:
            return resp.status, resp.headers.get("Location"), resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as galat:
        return galat.code, galat.headers.get("Location"), galat.read().decode("utf-8", "replace")


def props_data_page(isi):
    """Ambil JSON `data-page` dari HTML: cocokkan tanda kurung, bukan kutip pertama.

    Sebagian build menulis atribut dengan kutip mentah dan sebagian dengan `&quot;`,
    jadi HTML di-unescape dulu lalu JSON dipotong dengan pencocokan `{}` yang sadar string.
    """
    teks = html.unescape(isi)
    posisi = teks.find("data-page=")
    if posisi < 0:
        return None

    mulai = teks.find("{", posisi)
    if mulai < 0:
        return None

    kedalaman = 0
    dalam_teks = False
    lolos = False

    for i in range(mulai, len(teks)):
        karakter = teks[i]

        if dalam_teks:
            if lolos:
                lolos = False
            elif karakter == "\\":
                lolos = True
            elif karakter == '"':
                dalam_teks = False
            continue

        if karakter == '"':
            dalam_teks = True
        elif karakter == "{":
            kedalaman += 1
        elif karakter == "}":
            kedalaman -= 1
            if kedalaman == 0:
                return json.loads(teks[mulai : i + 1])

    return None


print(f"Basis URL: {BASE}")
print("")
print("== 1. Halaman publik (GET, baca-saja) ==")

for path in HALAMAN:
    status, _, isi = ambil(path)
    halaman = props_data_page(isi)
    props = (halaman or {}).get("props", {})
    cart = props.get("cart", {})
    komponen = (halaman or {}).get("component")

    print(
        f"{path:<14} status={status} komponen={komponen} "
        f"cart.count={cart.get('count')!r} jumlah_prop={len(props)} "
        f"settings={'ada' if 'settings' in props else 'tidak ada'}"
    )

print("")
print("== 2. Rute terlindungi tanpa autentikasi (GET, redirect tidak diikuti) ==")

for path in TERLINDUNG:
    status, lokasi, _ = ambil(path, ikuti=False)
    print(f"{path:<18} status={status} location={lokasi}")

print("")
print("== 3. Halaman bayar order tanpa autentikasi ==")
for path in ["/checkout/99999/bayar", "/checkout/99999/selesai"]:
    status, lokasi, _ = ambil(path, ikuti=False)
    print(f"{path:<28} status={status} location={lokasi}")
