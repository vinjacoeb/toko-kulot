# Pertanyaan pemilik — v1.4

Jawaban tidak memblokir pekerjaan; semua kartu memakai rekomendasi di bawah sampai pemilik
menjawab. Sumber: kartu `t_b6a1ee89`.

| # | Pertanyaan | Rekomendasi | Dampak bila tidak dijawab |
|---|---|---|---|
| P1 | Setelah ubah status manual dihapus, pesanan `dibayar` yang paketnya retur/gagal tidak bisa dibatalkan admin dari UI. Setuju? | Terima sesuai instruksi; penyelesaian retur di luar aplikasi. Bila nanti perlu, buat kartu "batalkan karena retur" terpisah | Status pesanan retur tetap `dikirim`/`selesai`; admin hanya bisa memberi catatan |
| P2 | F11 butuh bukti nyata: kode order uji, isi log `Biteship tarif dipakai`, dan payload `order.price` | Setelah rilis + migrate, buat 1 pesanan uji dan kirim tiga hal itu | F11 tetap "belum dicek, butuh key/saldo Biteship"; perbaikan berat/asalan tetap dirilis |
| P3 | Jalankan `php artisan migrate` untuk kolom `orders.shipping_events` | Jalankan sebelum webhook dipakai, lalu kirim `php artisan migrate:status`; pastikan `2026_10_24_000005` **dan** `2026_10_26_000006` `Ran` (`docs/catatan-backend.md:1973` menyebut `000005` masih Pending, QA hanya `000006`) | Bukan sekadar timeline kosong: setiap webhook yang cocok menulis `orders.shipping_events` (`BiteshipWebhookService.php:122-129`) → SQLSTATE 42S22 → **500**, status pesanan tidak maju dan `shipping_*` tidak tersimpan; Biteship mengulang event yang sama |
| P4 | `BITESHIP_WEBHOOK_TOKEN` sudah diisi; mohon pastikan URL webhook di dashboard Biteship masih mengarah ke aplikasi dan token sama | Cek dashboard Biteship; kirim ulang satu event uji | Status tidak maju otomatis; bukan bug kode |
| P5 | Batas 50 event pengiriman per pesanan cukup? | Ya (paket normal < 15 event) | Event terlama dibuang, tidak ada data lain yang hilang |
| P6 | Node `Selesai` hanya aktif bila Biteship mengirim `delivered`; pesanan lama tanpa event tetap tanpa node Selesai | Terima; data lama tidak diisi ulang | Timeline pesanan lama tidak berubah |

Catatan: techlead tidak membaca `.env`; status token di atas berasal dari pernyataan pemilik di
kartu, bukan hasil pemeriksaan.
