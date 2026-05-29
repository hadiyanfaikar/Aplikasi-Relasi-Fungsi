# Aplikasi Relasi dan Fungsi

Aplikasi web sederhana untuk membantu menganalisis topik Relasi dan Fungsi pada Matematika Diskret. Aplikasi ini dibuat menggunakan HTML, CSS, dan JavaScript murni.

## Fitur

- Input himpunan A sebagai domain.
- Input himpunan B sebagai kodomain.
- Input relasi R dalam bentuk pasangan berurutan.
- Analisis validitas relasi.
- Analisis apakah relasi merupakan fungsi.
- Tombol contoh untuk mengisi data otomatis.
- Tombol reset untuk menghapus semua input.
- Visualisasi mapping dari A ke B menggunakan panah.
- Tampilan sederhana, rapi, dan responsive.

## Struktur File

```text
Aplikasi Relasi Fungsi/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Cara Menjalankan

1. Buka folder proyek.
2. Buka file `index.html` menggunakan browser.
3. Masukkan himpunan A, himpunan B, dan relasi R.
4. Klik tombol `Analisis` untuk melihat hasil.

## Contoh Input

Himpunan A:

```text
1, 2, 3
```

Himpunan B:

```text
a, b, c
```

Relasi R:

```text
(1,a), (2,b), (3,c)
```

## Aturan Analisis

Relasi valid jika setiap pasangan berurutan `(x,y)` memenuhi:

- `x` adalah elemen dari himpunan A.
- `y` adalah elemen dari himpunan B.

Relasi disebut fungsi jika:

- Setiap elemen A memiliki tepat satu pasangan di B.
- Tidak ada elemen A yang tidak memiliki pasangan.
- Tidak ada elemen A yang memiliki lebih dari satu pasangan.

## Contoh Hasil

Untuk input:

```text
A = {1, 2, 3}
B = {a, b, c}
R = {(1,a), (2,b), (3,c)}
```

Hasilnya:

```text
Relasi valid dan merupakan fungsi.
```

Alasannya, setiap elemen pada himpunan A memiliki tepat satu pasangan pada himpunan B.

## Teknologi

- HTML
- CSS
- JavaScript

## Pembuat

Dibuat sebagai aplikasi pembelajaran Matematika Diskret dengan topik Relasi dan Fungsi.
