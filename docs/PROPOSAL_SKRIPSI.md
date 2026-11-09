# PROPOSAL TUGAS AKHIR / SKRIPSI TERAPAN (D4)

### Judul Skripsi:
**Penerapan Platform Kreatif 'Harkat Studio' Berbasis Web Audio dan Kecerdasan Artifisial sebagai Teknologi Tepat Guna untuk Produksi Musik UKM Universitas Harkat Negeri**

---

# BAB I
# PENDAHULUAN

## 1.1 Latar Belakang Masalah
Kreativitas di bidang seni musik dan produksi audio merupakan salah satu pilar penting dalam pembentukan karakter, identitas budaya, serta media penyampaian informasi di lingkungan perguruan tinggi. Unit Kegiatan Mahasiswa (UKM) Musik di Universitas Harkat Negeri berfungsi sebagai wadah utama mahasiswa dalam mengeksplorasi bakat musikal, memproduksi lagu resmi institusi, mengaransemen musik pengiring acara protokoler kampus, hingga memproduksi konten audio-visual untuk kompetisi mahasiswa nasional.

Namun dalam praktiknya, proses produksi musik di lingkungan UKM menghadapi kesenjangan teknis dan fasilitas yang signifikan. Pertama, terdapat kesenjangan literasi notasi balok dan teori musik formal di kalangan anggota (*musical literacy barrier*). Sebagian besar musisi mahasiswa memiliki keahlian bermain instrumen secara otodidak (*playing by ear*), namun mengalami kesulitan teknis saat harus mendokumentasikan komposisi lagu mereka ke dalam bentuk partitur standar (*sheet music/score*). Kebutuhan akan partitur tertulis ini sangat vital untuk aransemen ansambel, orkestrasi paduan suara kampus, maupun pencatatan hak cipta karya intelektual UKM. Proses transkripsi audio menjadi notasi balok secara manual membutuhkan keahlian musikal tingkat lanjut dan waktu berhari-hari.

Kedua, ketergantungan pada perangkat lunak *Digital Audio Workstation* (DAW) komersial berlisensi mahal (seperti Ableton Live, FL Studio, Logic Pro, atau Sibelius) menciptakan hambatan finansial (*economic barrier*). Selain biaya lisensi yang tidak terjangkau bagi kas organisasi kemahasiswaan, perangkat lunak tersebut menuntut komputer berspesifikasi perangkat keras tinggi (*high-end workstation*). Hal ini mengakibatkan proses produksi audio terpusat hanya pada segelintir anggota yang memiliki perangkat memadai, sementara anggota lain terhambat untuk berkolaborasi dan berkarya.

Ketiga, tingginya ritme kebutuhan musik tematis untuk kegiatan kampus (seperti jingle fakultas, lagu mars, ilustrasi audio video profil, dan musik latar pementasan teater kampus) sering kali dihadapkan pada tenggat waktu (*deadline*) yang sangat sempit. Ketiadaan media bantu komposisi cerdas membuat proses pencarian ide aransemen, struktur melodi, dan draf lirik berlangsung lambat dan berulang.

Keempat, belum adanya wadah digital terpusat (*centralized creative repository*) untuk memamerkan karya, berbagi modul pembelajaran instrumen (gitar, bass, drum), dan mengelola hak cipta karya anggota UKM. Banyak rekaman lagu hasil produksi mahasiswa yang tercecer di penyimpanan pribadi, hilang saat regenerasi kepengurusan organisasi, dan tidak termanfaatkan sebagai materi edukasi (*knowledge transfer*) bagi anggota baru.

Guna menjawab problematika tersebut, diperlukan intervensi rekayasa perangkat lunak berparadigma **Teknologi Tepat Guna (TTG)**. Konsep TTG menuntut solusi yang mudah diakses tanpa perangkat berspesifikasi ekstrem, menggunakan teknologi terbuka (*open-source*), berbiaya kepemilikan rendah (*low Total Cost of Ownership*), serta dirancang langsung untuk memecahkan friksi mitra secara spesifik.

Berdasarkan pertimbangan tersebut, dikembangkan platform terpadu bernama **"Harkat Studio"**. Platform ini mengintegrasikan:
1. **Web Audio Studio:** *Digital Audio Workstation* (DAW) multitrack berbasis peramban web (*browser-based*) yang ringan dan dapat diakses dari komputer standar tanpa instalasi *software* berat.
2. **Audio-to-Score Transcription (AudioScore Studio):** Mesin transkripsi otomatis berbasis kecerdasan artifisial (*Basic Pitch* dan *MuseScore 4*) yang mampu mengonversi rekaman audio instrumen langsung menjadi notasi balok (*MusicXML / Sheet Music*).
3. **AI Music & Lyrics Composer:** Asisten komposisi cerdas (*Harkat Local Composer*, *MusicGen*, dan *Language Models*) untuk membantu musisi merancang draf melodi, lirik, dan aransemen latar musik secara cepat.
4. **Interactive Instrument & Education Hub:** Editor tablatur/notasi untuk instrumen gitar, bass, dan drum yang terintegrasi dengan modul kursus internal (*courses*) dan katalog perpustakaan karya (*library*).

Penerapan *Harkat Studio* diharapkan dapat mendemokratisasi proses produksi musik di Universitas Harkat Negeri, memangkas waktu transkripsi dan aransemen karya, serta mengarsipkan aset intelektual UKM secara berkesinambungan.

---

## 1.2 Identifikasi Masalah
Berdasarkan latar belakang di atas, rumusan permasalahan nyata yang dihadapi oleh UKM Musik Universitas Harkat Negeri adalah:
1. Kesulitan anggota UKM dalam mendokumentasikan ide komposisi dan rekaman audio menjadi partitur notasi balok standar karena keterbatasan kemampuan transkripsi manual.
2. Tingginya hambatan biaya lisensi dan kebutuhan spesifikasi perangkat keras komputer untuk menjalankan *software* rekaman musik (DAW) dan editor partitur komersial.
3. Lamanya waktu penggubahan aransemen musik dan lirik lagu saat menghadapi permintaan produksi konten musik kampus yang mendesak.
4. Belum adanya repositori digital terintegrasi untuk mengarsipkan karya musik, lembar partitur, dan media pembelajaran mandiri antar-generasi anggota UKM.

---

## 1.3 Batasan Masalah
Agar perancangan dan implementasi sistem tetap terarah dan realistis sesuai kompetensi Sarjana Terapan (D4) Teknik Informatika, penelitian ini dibatasi pada:
1. **Lokus Pengujian:** Unit Kegiatan Mahasiswa (UKM) Musik di lingkungan Universitas Harkat Negeri.
2. **Ruang Lingkup Fitur Sistem yang Dikembangkan:**
   * *Modul AI Music Creation (Create Harkat):* Pembuatan draf lagu, aransemen melodi latar, dan generator lirik berbasis AI (*hybrid cloud & local model*).
   * *Modul AudioScore Studio (Transkripsi Audio):* Pengolahan berkas audio rekaman menjadi notasi balok/MIDI/partitur menggunakan model *Basic Pitch* dan *MuseScore*.
   * *Modul Web Studio:* Perekaman multitrack, mixing dasar berbasis *Web Audio API*, dan visualisasi instrumen (Score, Guitar, Bass, Drum Studio).
   * *Modul Manajemen Karya & Edukasi:* Manajemen repositori karya (*Library Saya*), modul kursus musik (*Courses*), dan pembagian peran pengguna (*Role-Based Access Control* via Supabase).
3. **Arsitektur dan Tumpukan Teknologi (*Tech Stack*):**
   * *Frontend & Application Server:* Next.js (App Router, Turbopack, TypeScript) dan Tailwind CSS.
   * *Audio Processing Engine:* Web Audio API, Tone.js, dan Wavesurfer.js pada sisi peramban.
   * *Mesin AI Lokal (Backend Worker):* Python (FastAPI/Uvicorn), Librosa, PyTorch, Spotify Basic Pitch, dan MuseScore 4 binary runtime.
   * *Database & Autentikasi:* PostgreSQL / Supabase SSR.

---

## 1.4 Rumusan Masalah
Mengacu pada latar belakang dan identifikasi masalah, maka rumusan masalah penelitian ini adalah:
1. Bagaimana merancang dan membangun arsitektur platform terpadu **Harkat Studio** yang mengintegrasikan Web Audio DAW, modul transkripsi partitur otomatis, dan asisten komposisi musik berbasis kecerdasan artifisial?
2. Bagaimana mengimplementasikan mesin *worker* lokal (FastAPI, Basic Pitch, dan MuseScore) agar dapat terintegrasi secara modular dengan aplikasi web Next.js dalam memproses audio menjadi notasi partitur?
3. Bagaimana menguji kelayakan sistem dari sisi ketepatan fungsionalitas (*Black Box Testing*) dan tingkat penerimaan pengguna (*System Usability Scale*) pada UKM Musik Universitas Harkat Negeri?

---

## 1.5 Tujuan Penelitian
Tujuan yang hendak dicapai melalui penelitian ini adalah:
1. Mengembangkan platform musik terpadu berbasis web **Harkat Studio** yang memfasilitasi pembuatan lagu, pengeditan audio multitrack, dan konversi audio ke partitur balok secara mudah dan terintegrasi.
2. Mengintegrasikan teknologi pemrosesan audio digital dan AI (*Spotify Basic Pitch* dan *MuseScore Engine*) ke dalam *pipeline* web untuk menghasilkan dokumen notasi musik (*MusicXML* dan PDF partitur) secara terotomasi.
3. Menganalisis keandalan fungsionalitas sistem melalui *Black Box Testing* serta mengukur tingkat kepuasan dan kebergunaan antarmuka pengguna menggunakan metrik *System Usability Scale* (SUS) pada UKM mitra.

---

## 1.6 Manfaat Penelitian

### 1.6.1 Manfaat Akademis / Keilmuan
* Memberikan kontribusi nyata dalam bidang Rekayasa Perangkat Lunak Multimedia Terapan, khususnya mengenai integrasi antara *Web Audio API* di peramban dengan microservice *Artificial Intelligence* pemrosesan sinyal suara.
* Menjadi rujukan ilmiah penerapan paradigma Teknologi Tepat Guna (TTG) berbasis perangkat lunak untuk mendukung sektor ekonomi kreatif dan kesenian di lingkungan kampus.

### 1.6.2 Manfaat Praktis
* **Bagi Anggota dan Pengurus UKM Musik:**
  * Mempercepat proses dokumentasi lagu dari rekaman suara menjadi notasi balok formal tanpa perlu mempelajari teori transkripsi rumit.
  * Memungkinkan anggota melakukan rekaman, mixing, dan eksplorasi ide lagu langsung dari browser tanpa harus membeli lisensi software DAW mahal.
  * Mempercepat pembuatan prototipe jingle atau musik acara kampus dengan bantuan modul AI generator.
* **Bagi Universitas Harkat Negeri:**
  * Memiliki bank data aset musik, partitur lagu daerah/kampus, dan karya mahasiswa yang terarsipkan secara rapi dan profesional.
* **Bagi Peneliti (Mahasiswa D4):**
  * Mengasah kompetensi rekayasa perangkat lunak tingkat tinggi yang menggabungkan *Full-Stack Web Development*, *Digital Signal Processing* (DSP), dan penerapan model *Machine Learning* dalam satu produk utuh yang siap pakai.
