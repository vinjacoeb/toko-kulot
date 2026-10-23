# Tambah bagian F8 ke docs/catatan-frontend.md dan satu butir ke docs/asumsi.md.
# Idempoten: tidak menulis ulang bila bagian sudah ada. Mempertahankan CRLF berkas tujuan.
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CATATAN = ROOT / "docs" / "catatan-frontend.md"
ASUMSI = ROOT / "docs" / "asumsi.md"

CATATAN_TEKS = """## F8 — tombol "Sinkronkan status pembayaran" di kartu "Bukti pembayaran" `/admin/pesanan/{order}` (kartu t_8e89556f, 22 Okt 2026)

Validasi tiga arah (sebelum menulis kode):
- **PRD + brief vs desain**: D13 (`docs/design.md:872`, §11.3) + §5.12 memberi tombol sekunder "Sinkronkan status pembayaran" + notice hasil di kartu "Bukti pembayaran"; U6-1 (`docs/catatan-uiux.md:30`) menetapkan satu sumber hasil dan tombol **tidak** `disabled` hanya karena sudah lunas; `docs/brief-frontend.md` item F8 menunjuk kontrak §12.24. Tidak ada fitur tunda yang ikut dikerjakan (tanpa riwayat sinkron, tanpa polling, tanpa aksi massal).
- **Desain vs kontrak**: §12.24 (`docs/kontrak-props.md:1412-1443`) = `PATCH /admin/pesanan/{order}/sinkron-pembayaran` (`admin.orders.sinkron-pembayaran`), **tanpa body**, kembali ke halaman asal dengan `flash.success` / `flash.error`; §12.17 memuat `pesanan.id` dan `pesanan.payment` (`null` = belum ada tagihan). Rute + `syncPayment` sudah ada di backend B3 (`t_c374a29b`).
- **Kelayakan teknis**: resolver halaman `resources/js/Pages`; `AdminLayout` **tidak** punya Toast global — Toast dirakit di halaman (`Show.jsx:254-263`); §4.1 `Button` sudah mengurus state `loading` (label "Memproses…", `disabled`, `aria-busy`); §4.23 `InlineNotice` menerima `tone` + `children` dan memakai `role="alert"` untuk error; `@inertiajs/react` menyediakan `useForm` + `onSuccess(page)` dengan `flash` di `page.props`.

Rencana (berkas + komponen + state):
- Baru: `resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx` — `useForm`, satu aksi, state `hasil`.
- Ubah: `Show.jsx` — impor partial, state `flashSinkron`, render kondisional di kartu "Bukti pembayaran".
- Dipakai ulang: `Button` (§4.1 varian `secondary`), `InlineNotice` (§4.23), pola partial yang sudah ada (`BuktiPembayaran`, `InfoResi`, `UbahStatusModal`), `KartuBagian`.
- State UI: idle / memproses (label "Memproses…" + `disabled` + lebar dikunci) / hasil `success` / hasil `error` / **tidak dirender** saat `payment` null.

Implementasi:
- `SyncPaymentButton.jsx` (82 baris): `form.patch(`/admin/pesanan/${encodeURIComponent(id)}/sinkron-pembayaran`, { preserveScroll: true, preserveState: true, onSuccess })`; `onSuccess` membaca `page.props.flash.success` lalu `.error` dan menampilkan **satu** `InlineNotice`; pasangan `success|error` dilaporkan ke halaman lewat `onHasilSinkron`. Saat `form.processing` klik diabaikan (pencegahan kirim ganda), `Button` memberi `loading` + `disabled` + `aria-busy`, kelas `min-w-[16rem]` menjaga lebar. Tanpa id pesanan partial mengembalikan `null` (tidak menembak URL tanpa id).
- `Show.jsx`: tombol dirender **hanya** bila `data.payment !== null && !== undefined` di dalam kartu "Bukti pembayaran" (`div.flex.flex-col.gap-4` berisi `BuktiPembayaran` + partial). `flashSinkron` + `pasanganFlash` (`${success}|${error}`) menekan Toast halaman hanya untuk flash yang baru saja dilaporkan partial — flash aksi lain tetap menjadi Toast.
- Tidak ada komponen, token, warna, atau rute baru; tidak ada `route()`/Ziggy, `localStorage`, atau `dangerouslySetInnerHTML`.

Verifikasi (dijalankan 22 Okt 2026; keluaran mentah di `docs/bukti-frontend-t_8e89556f.txt`):
- Harness interaksi `tmp/uji-aksi-sinkron-t_8e89556f.mjs` lewat `bash tmp/jalankan-uji-t_8e89556f.sh` → **14/14 OK, exit 0**; diulang setelah semua pemulihan → **14/14 OK**. Cakupan: A1 label beku + varian + lebar, A2 URL §12.24 tanpa body + `preserveScroll`/`preserveState`, A3 label "Memproses…" + `disabled` + `aria-busy`, A4 klik ganda tidak menembak dua kali, A5/A6 notice `error`/`success` dengan pesan server apa adanya, A7 notice lama hilang sebelum jawaban baru, A8 tanpa id tidak merender, A9 higiene teks, B1 tombol di kartu yang benar dengan `pesanan.id`, B2 `payment` null → tidak dirender, B3 flash aksi lain tetap jadi Toast, B4 flash aksi sinkron di-suppress, B5 integrasi Show → klik → URL kontrak → pesan server tampil.
- Kontrol negatif (sabotase sementara lalu dipulihkan): label dirusak → **12/14** (A1, B5 gagal); URL dirusak → **12/14** (A2, B5 gagal); logika suppress dirusak → **13/14** (B4 gagal). `md5` setelah pulih identik: `SyncPaymentButton.jsx 7a0367438c19e80d7ac25fd2443bbcb5`, `Show.jsx 9662113234a8786727e2937da1a4df95`.
- Regresi kartu F5 (`tmp/uji-ssr-pesanan-t_018b2723.mjs`) → **26 uji, 0 gagal**: modal ubah status + bukti pembayaran tidak berubah.
- `npm run build` → **exit 0** ("✓ built in 13.93s"); CSS hasil build memuat `.min-w-\\[16rem\\]{min-width:16rem}`, chunk `SyncPaymentButton-*.js` memuat label beku + `sinkron-pembayaran`.
- Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (96 berkas) → hanya temuan lama `app.jsx: App` (false positive parameter `setup`); `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (71 chunk) → hanya temuan lama `DropzoneGalery-*.js -> FREE: P`.

Catatan / known issue:
- **Belum diuji, butuh browser**: tata letak 360/768/1024/1280 px, fokus keyboard & urutan tab, zoom 200%, dan klik nyata ke server (flash Midtrans). Instruksi aman untuk pemilik ada di bagian akhir `docs/bukti-frontend-t_8e89556f.txt`.
- Suppress Toast memakai pembanding pasangan teks flash yang disimpan di state halaman. Bila aksi lain kelak mengirim flash dengan teks **persis sama** setelah aksi sinkron di halaman yang sama (tanpa pindah halaman), Toast-nya ikut tertekan; notice di kartu tetap benar. Dampak sempit karena `preserveState` hanya bertahan selama halaman detail pesanan yang sama terbuka.
- Lebar `min-w-[16rem]` adalah pilihan nilai untuk "lebar dikunci" D13 (desain tidak menyebut angka) — dicatat di `docs/asumsi.md` butir 21.
- **Tidak ada commit (R8)** — sama seperti kartu lain di lane ini; `Show.jsx` dan `partials/` memang belum dilacak git sejak kartu F5.
"""

ASUMSI_TEKS = """21. **Lebar tombol "Sinkronkan status pembayaran" dikunci `min-w-[16rem]` (256 px)** (kartu `t_8e89556f`).
    D13 (`docs/design.md:872`) mewajibkan "lebar dikunci agar layout tidak melompat" tetapi tidak menyebut
    nilainya, dan tombol ini belum punya acuan tampilan lain. Dipilih `16rem` karena label beku
    "Sinkronkan status pembayaran" (±230 px pada `text-body`) masih muat satu baris di dalam kartu
    "Bukti pembayaran" pada lebar 360 px tanpa memotong teks, dan tombol setinggi 47 px (§4.1) tetap
    proporsional. Kelas ini dihasilkan Tailwind proyek — dibuktikan `.min-w-\\[16rem\\]{min-width:16rem}`
    pada CSS hasil `npm run build` (`docs/bukti-frontend-t_8e89556f.txt` bagian I). Tanpa token atau
    komponen baru; bila UI/UX menetapkan angka lain, cukup ubah satu kelas di `SyncPaymentButton.jsx`.
"""


def tambah(path, teks, penanda):
    lama = path.read_text(encoding="utf-8", errors="replace")
    if penanda in lama:
        print(f"lewati (sudah ada): {path.name}")
        return
    isi = lama
    if not isi.endswith("\n"):
        isi += "\r\n"
    isi += "\r\n" + teks.replace("\r\n", "\n").replace("\n", "\r\n")
    path.write_bytes(isi.encode("utf-8"))
    print(f"ditambahkan: {path.name} (+{len(teks)} char)")


tambah(CATATAN, CATATAN_TEKS, "## F8 — tombol \"Sinkronkan status pembayaran\"")
tambah(ASUMSI, ASUMSI_TEKS, "21. **Lebar tombol \"Sinkronkan status pembayaran\"")
