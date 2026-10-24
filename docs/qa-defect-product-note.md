# Bug Report: Missing setting keys in SettingSeeder

## ID: BUG-001/002
## Severity: Medium
## Priority: P2
## Komponen: Backend (Seeder)

## Deskripsi
Key `product_care_note` dan `product_shipping_note` digunakan di `resources/js/Pages/Public/Products/Show.jsx` namun tidak didefinisikan di `database/seeders/SettingSeeder.php`. Hal ini menyebabkan pengaturan tersebut tidak muncul di panel admin dan tidak memiliki nilai default yang benar.

## Environment
- Aplikasi: Toko Kulot
- File: `resources/js/Pages/Public/Products/Show.jsx`
- File: `database/seeders/SettingSeeder.php`

## Langkah Reproduksi
1. Periksa `resources/js/Pages/Public/Products/Show.jsx`.
2. Periksa `database/seeders/SettingSeeder.php`.
3. Verifikasi bahwa `product_care_note` dan `product_shipping_note` tidak ada dalam array `$settings`.

## Hasil Aktual
Key hilang dari seeder.

## Hasil yang Diharapkan
Key ditambahkan ke seeder dengan nilai default yang sesuai.
