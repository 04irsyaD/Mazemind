**MazeMind**

Game 3D Top-Down dengan AI Antagonis

*Dokumen Konteks untuk Penilaian AI --- \#JuaraVibeCoding*

|                     |                                                                   |
|---------------------|-------------------------------------------------------------------|
| **Nama App**        | MazeMind                                                          |
| **Kategori Event**  | Game --- The Fun-Maker                                            |
| **Event**           | \#JuaraVibeCoding (Google AI Studio + Cloud Run)                  |
| **Stack Utama**     | Blender (GLTF) + Three.js + Python Flask + Gemini API + Cloud Run |
| **Target Pengguna** | Semua kalangan, casual gamer, anak muda Indonesia                 |
| **Platform**        | Web browser (mobile & desktop)                                    |
| **Bahasa**          | Bahasa Indonesia + antarmuka visual                               |
| **Status**          | Konsep --- siap untuk mulai dibangun                              |

**1. Deskripsi Ide**

MazeMind adalah game web 3D top-down di mana pemain menggerakkan karakter melewati labirin untuk mencapai titik tujuan. Yang membuat game ini unik: ada AI antagonis (villain) yang berperan aktif sebagai penghalang --- AI menaruh jebakan dan rintangan secara strategis di jalur yang kemungkinan besar dilalui pemain.

Seluruh asset 3D (karakter, map, objek jebakan) dibuat menggunakan Blender dan di-export ke format GLTF/GLB agar bisa dirender langsung di browser menggunakan Three.js. Gemini API berperan sebagai otak si villain --- dipanggil sekali di awal setiap level untuk menentukan posisi jebakan, sehingga penggunaan token sangat hemat dan efisien.

**2. Masalah yang Diselesaikan**

**2.1 Konteks Masalah**

Game browser saat ini hampir semuanya menggunakan konten statis --- jalur musuh, posisi jebakan, dan pola serangan sudah di-hardcode sebelumnya. Ini membuat game cepat bosan karena pemain bisa hafal polanya.

Di sisi lain, AI dalam game modern (seperti di konsol atau PC) sangat canggih tapi membutuhkan resource besar dan tidak bisa diakses langsung di browser tanpa install apapun.

**2.2 Pain Point Spesifik**

- Game browser tidak ada tantangan AI yang adaptif dan unpredictable

- Tidak ada game 3D browser berbahasa Indonesia yang menggunakan Gemini sebagai villain

- Gamer casual Indonesia tidak punya akses ke game AI yang bisa dimainkan langsung tanpa install

**2.3 Dampak**

MazeMind menghadirkan pengalaman bermain yang tidak bisa diprediksi --- setiap sesi berbeda karena AI villain selalu menaruh jebakan di lokasi yang berbeda. Ini menciptakan replay value yang tinggi dengan biaya teknis yang rendah.

**3. Cara Kerja (User Journey)**

1.  Pemain membuka URL MazeMind di browser (tidak perlu install apapun)

2.  Muncul tampilan 3D top-down: karakter pemain, map labirin, dan titik tujuan

3.  Di balik layar: Gemini API dipanggil sekali --- menerima layout map dan menentukan koordinat jebakan

4.  Jebakan muncul di posisi strategis yang dipilih AI villain --- pemain tidak tahu di mana

5.  Pemain bergerak menggunakan keyboard/tombol layar untuk navigasi labirin

6.  Jika pemain terkena jebakan: karakter mati, muncul dialog AI villain yang lucu/provokatif

7.  Pemain bisa retry --- Gemini dipanggil lagi dengan posisi jebakan yang berbeda

8.  Jika berhasil: animasi menang, AI villain bereaksi dramatis kalah

**4. Peran Gemini API (Hemat Token)**

**4.1 Kapan Gemini Dipanggil**

Gemini HANYA dipanggil sekali per level --- bukan real-time. Ini adalah keputusan desain utama untuk menghemat token sekaligus tetap memberikan pengalaman AI yang bermakna.

**4.2 Input ke Gemini**

- Layout grid map dalam format JSON (koordinat mana yang jalan, mana yang tembok)

- Posisi awal pemain dan posisi tujuan

- Level kesulitan saat ini (mudah/sedang/sulit)

- Jumlah jebakan yang diizinkan untuk level ini

**4.3 Output dari Gemini**

- Array koordinat JSON: posisi \[x, y\] di mana jebakan harus diletakkan

- Satu kalimat dialog AI villain yang provokatif (opsional, untuk ditampilkan saat pemain mati)

**4.4 Contoh Request/Response**

Request ke Gemini (estimasi \~150 token):

*\"Kamu adalah villain dalam game labirin. Berikut layout map 10x10 dalam JSON. Pemain mulai di \[1,1\] dan tujuan di \[9,9\]. Pilih 5 koordinat terbaik untuk menaruh jebakan agar pemain sulit mencapai tujuan. Jawab dalam JSON saja.\"*

Response dari Gemini (estimasi \~80 token):

*{\"traps\": \[\[3,2\],\[5,5\],\[7,3\],\[6,8\],\[4,6\]\], \"taunt\": \"Kamu pikir bisa kabur dari sini? Hahaha!\"}*

**5. Tech Stack & Arsitektur**

|            |                               |                                                              |
|------------|-------------------------------|--------------------------------------------------------------|
| **Layer**  | **Teknologi**                 | **Fungsi**                                                   |
| 3D Asset   | Blender → GLTF/GLB            | Desain karakter, map, jebakan --- export ke format web-ready |
| Frontend   | HTML + Three.js (r128)        | Render 3D top-down, game engine, input handler, animasi      |
| Backend    | Python Flask                  | Server API, serve static files, routing request ke Gemini    |
| AI Engine  | Gemini API (Google AI Studio) | Analisis map → generate posisi jebakan sekali per level      |
| Deployment | Docker + Google Cloud Run     | Packaging dan hosting, akses via URL publik                  |
| Biaya      | Free tier semua layanan       | Gemini API free tier + Cloud Run free tier cukup untuk demo  |

**5.1 Pipeline Asset dari Blender**

9.  Buat model 3D di Blender: karakter, tile map, objek jebakan (bom, ranjau, dll)

10. Export ke format GLTF/GLB (File \> Export \> glTF 2.0)

11. Compress dengan gltf-transform untuk optimasi ukuran file

12. Letakkan file GLTF sebagai static asset di folder Flask

13. Three.js load GLTF menggunakan GLTFLoader dan render di canvas

**5.2 Arsitektur Kamera**

Kamera menggunakan OrthographicCamera dari Three.js dengan sudut pandang 45 derajat ke bawah --- menciptakan tampilan top-down 3D yang khas seperti game Zelda atau Diablo. Kamera mengikuti karakter pemain secara smooth.

**6. Keunggulan & Uniqueness**

**6.1 Mengapa Ini Unik**

- AI sebagai villain aktif --- bukan sekadar NPC pasif atau musuh yang patrol

- Asset 3D custom dari Blender --- bukan menggunakan template atau placeholder

- Hemat token by design --- Gemini dipanggil 1x per level, bukan per frame atau per gerakan

- Fully web-based --- tidak perlu install, buka browser langsung main

- Dialog villain generated AI --- tiap kematian ada respons berbeda yang lucu

**6.2 Kompetitor & Diferensiasi**

- Game browser 2D biasa: tidak ada AI generatif, jebakan statis dan bisa dihafal

- Game AI PC (seperti Left 4 Dead AI Director): terlalu berat, tidak bisa di browser

- MazeMind: satu-satunya game 3D browser Indonesia dengan Gemini sebagai villain strategis

**6.3 Wow Factor untuk Demo Video LinkedIn**

Saat demo, juri bisa langsung melihat: pemain bergerak di map 3D yang indah, kena jebakan yang tidak terduga, muncul dialog villain yang lucu dari AI --- semua dalam satu browser tab tanpa install apapun. Ini sangat mudah dikomunikasikan dalam video 2-3 menit.

**7. Rencana MVP untuk Kompetisi**

**Yang akan dibangun (prioritas)**

- 1 map labirin 3D dengan asset Blender yang sudah di-export ke GLTF

- Karakter pemain yang bisa bergerak dengan keyboard dan mobile touch

- Sistem jebakan yang posisinya ditentukan Gemini di awal level

- Dialog villain AI muncul saat pemain mati (dari Gemini output)

- 3 level dengan kesulitan berbeda (jumlah jebakan meningkat)

- Deploy di Google Cloud Run dengan URL publik

**Yang tidak termasuk MVP (nice to have)**

- Multiple map / biome yang berbeda

- Multiplayer / leaderboard

- Sistem save progress

- Sound effect dan musik latar

**8. Estimasi Waktu Build**

|                                             |                              |
|---------------------------------------------|------------------------------|
| **Export asset Blender ke GLTF**            | 30 menit (sudah punya asset) |
| **Setup Three.js + load GLTF + kamera**     | 1 hari                       |
| **Sistem gerakan karakter + collision**     | 0.5 hari                     |
| **Integrasi Gemini API (posisi jebakan)**   | 0.5 hari                     |
| **UI (menu, dialog villain, menang/kalah)** | 0.5 hari                     |
| **Setup Docker + deploy Cloud Run**         | 30 menit                     |
| **Testing + polish**                        | 0.5 hari                     |
| **Total estimasi**                          | 3-4 hari kerja santai        |

**9. Permintaan Rating dari AI Reviewer**

Dokumen ini dibuat untuk mendapatkan penilaian objektif dari AI lain berdasarkan kriteria resmi event \#JuaraVibeCoding. Mohon berikan rating 1-10 untuk setiap kriteria berikut:

|                  |           |                                                                                    |
|------------------|-----------|------------------------------------------------------------------------------------|
| **Kriteria**     | **Bobot** | **Pertanyaan untuk AI Reviewer**                                                   |
| Problem (30%)    | 30%       | Seberapa nyata dan relevan masalah yang diselesaikan? Apakah target audiens jelas? |
| Solution (40%)   | 40%       | Apakah solusinya fungsional, UX-nya menarik, dan value proposition-nya terukur?    |
| Uniqueness (30%) | 30%       | Seberapa original ide ini? Adakah kompetitor serupa? Apa wow factor-nya?           |

**9.1 Pertanyaan Spesifik untuk Reviewer**

- Apakah konsep \'AI sebagai villain yang taruh jebakan\' cukup kuat untuk kategori Game?

- Apakah penggunaan Gemini yang hanya 1x per level terasa terlalu minimal atau justru elegan?

- Apakah kombinasi Blender 3D asset + Three.js + Gemini sudah cukup impressive untuk juri?

- Adakah risiko teknis utama yang perlu diantisipasi sebelum mulai build?

- Saran konkret untuk meningkatkan skor di bagian Solution (UX/value proposition)?

- Apakah ada ide fitur sederhana yang bisa menaikkan Uniqueness tanpa menambah kompleksitas?

*MazeMind --- Game 3D Top-Down AI Antagonis \| \#JuaraVibeCoding*
