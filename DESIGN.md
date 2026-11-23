# Rizka Adsens: Design Direction

## Design Read

Reading this as: login admin untuk console iklan kecil, untuk pemilik situs, dengan bahasa visual studio krem hangat, dial **ENERGY 2 / RHYTHM 2 / MOTION 2**.

Halaman ini adalah ambang masuk, bukan workspace. Satu fokus: formulir login. Panel studio memberi konteks merek, lalu menyingkir.

## Identitas

Studio iklan yang tenang dan tertata. Bukan dashboard gelap, bukan gradien ungu-biru, bukan kartu kaca. Suasana seperti meja kerja studio pada sore hari: krem, hijau pinus, sage, dan satu aksen coral.

## Palet

| Token | Nilai | Fungsi | Alasan |
|---|---|---|---|
| Pine | `#1E352C` | Panel studio, tombol utama | Hijau dalam yang hangat, bukan hitam generik; memberi latar untuk maskot dan kartu 3D |
| Cream | `#F6F0E4` | Latar halaman | Kertas hangat, mengurangi kesan dingin dashboard admin |
| Warm white | `#FFFDF8` | Kartu login | Permukaan terang yang terpisah dari krem tanpa perlu kaca |
| Sage | `#5E7A62` / `#4F6B54` | Ikon, garis, elemen ilustrasi | Warna sekunder yang berasal dari dedaunan studio, bukan aksen default |
| Coral | `#D9674F` / `#A8452F` | Aksen, fokus, sorotan | Satu aksen hangat di titik penting; versi gelap dipakai untuk teks agar lolos kontras |
| Ink | `#1F2A24` | Teks utama | Kontras tinggi di atas krem dan warm white |
| Muted | `#5C665F` | Teks sekunder | Masih lolos AA di atas warm white |
| Border | `#8C8475` | Batas input dan checkbox | 3.64:1 di atas warm white, memenuhi batas non-teks 3:1 |

Tidak ada gradien ungu-biru, tidak ada glow, tidak ada glassmorphism, tidak ada emoji dekoratif.

## Tipografi

- **Instrument Serif** untuk headline dan tagline. Alasan: serif editorial memberi kesan studio dan tenang, dan pasangan italic-nya membawa kelembutan tanpa jatuh ke gaya "AI startup".
- **Plus Jakarta Sans** untuk UI. Alasan: sans yang dirancang di Indonesia, bersih, ramah, dan mudah dibaca pada ukuran kecil.

Tidak ada heading monospace, tidak ada label uppercase dengan letter-spacing ekstrem.

## Motif

1. **Spotlight coral** di sudut kiri bawah. Lingkaran datar, bukan glow. Berfungsi sebagai panggung maskot dan metafora "sorotan" iklan.
2. **Kartu iklan 3D** dengan chart dan ikon banner. Mengangkat data iklan sebagai objek fisik, bukan dekorasi abstrak.
3. **Maskot chibi** membawa megafon dan kartu chart. Hubungan langsung dengan produk: iklan, suara, dan performa.
4. **Tile "R"** sebagai monogram yang sudah ada, dipertahankan tetapi dirapikan menjadi tile krem, bukan lingkaran yang terbaca seperti simbol merek dagang.

## Tema

Tema terang tetap. Alasan: halaman login adalah ambang merek dengan satu sumber cahaya (studio sore). Toggle tema akan memecah komposisi dua warna dan menambah kontrol yang tidak membantu tugas 20 detik ini. Dashboard dan safelink memakai palet dan tema yang sama agar perpindahan dari login terasa seperti satu tempat, bukan tiga produk berbeda.

## Layar Dashboard (Generator Shortlink)

Pekerjaan layar: membuat shortlink untuk tautan apa pun dan merawat daftar link yang sudah ada. Satu keputusan utama: link mana yang perlu disalin, diedit, atau dinonaktifkan.

Dial: **ENERGY 3 / RHYTHM 3 / MOTION 2**. Dua panel bersebelahan di desktop (form pembuat dan daftar link), bertumpuk di ponsel dengan form lebih dulu. Tidak ada sidebar scaffold, baris kartu statistik, chart, atau activity feed. Hitungan unduhan dan tanggal dibuat berasal dari database, bukan angka contoh.

Daftar link disusun seperti ledger: judul, status, shortlink, URL asli, lalu aksi. Baris tidak dibungkus kartu terpisah agar satu daftar terbaca sebagai satu benda. Warna status selalu disertai teks "Aktif" atau "Nonaktif", tidak hanya warna.

## Safelink Vrizlink

Dial: **ENERGY 2 / RHYTHM 2 / MOTION 2**. Halaman publik `/kode` adalah halaman tugas, bukan landing page. Urutan bacaan: nama tautan, satu kalimat penjelasan, lalu kartu alur dua tahap. Setelah hitungan pertama, dua kanal YouTube dibuka; tombol Get Link terkunci sampai keduanya dibuka. Setelah itu tautan disiapkan selama 6 detik, lalu dialog petunjuk menjelaskan halaman sponsor di tab baru dan cara kembali. Countdown memakai angka serif besar dan bilah coral; tombol muncul setelah hitungan selesai. Tidak ada loop dekoratif, tidak ada badge "AI", tidak ada figur atau testimoni.

Bayangan hanya dipakai untuk panel dan dialog yang memang berdiri di atas kertas, bukan pada setiap baris atau tombol. Iklan diberi label "Iklan", diletakkan di alur normal, dan tidak pernah menutupi tombol. Ukuran yang tidak muat di layar disembunyikan; ukuran yang tampil memesan ruangnya agar halaman tidak meloncat. Halaman memakai `noindex` karena setiap kode adalah tautan pribadi.

## Gerak

MOTION 2: entrance satu kali untuk kartu dan maskot, lalu hover dan focus states. Tidak ada loop tanpa henti, tidak ada pulse, tidak ada parallax. `prefers-reduced-motion: reduce` mematikan animasi.

## Ikon

Ikon dibuat sendiri, bukan Lucide atau library default: wajah pengguna, gembok, mata, centang, dan peringatan. Goresan tebal dan ujung membulat, relevan dengan field yang diwakilinya. Ikon dekoratif di scene memakai objek yang berhubungan dengan iklan (megafon, chart, banner, tanaman studio).

## Batasan Konten

- Tidak ada statistik, testimoni, atau logo klien palsu.
- Tidak ada tautan mati. "Lupa password?" menjadi instruksi statis, bukan tautan.
- "Sesi normal 2 jam" dan "Ingat saya 7 hari" sesuai perilaku server.
- Tidak ada nomor atau metrik yang dibuat-buat di kartu ilustrasi; kartu hanya bentuk dekoratif.
- Dashboard hanya menampilkan link, unduhan, dan tanggal yang benar-benar tersimpan di database.
- Safelink hanya menampilkan judul tautan yang di-input pemilik link dan status tautan yang sebenarnya.
