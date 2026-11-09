# Harkat Music AI Studio

"Dari Ide Menjadi Lagu, Partitur, dan Karya Musik."

Harkat Music AI Studio adalah ekosistem musik berbasis AI komprehensif yang dirancang untuk membantu kreator membuat, mengedit, dan memublikasikan karya musik. Proyek ini mencakup AI Music Generation, Web Audio Studio, Score Studio (Partitur), dan Komunitas.

## Persyaratan Sistem

- Node.js >= 18.x
- npm >= 9.x
- Akun Supabase (untuk Database & Auth)
- Redis (untuk Job Queue lokal atau cloud)

## Panduan Instalasi

1. Clone repositori ini atau jalankan di workspace lokal.
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Salin file environment:
   ```bash
   cp .env.example .env.local
   ```
4. Sesuaikan nilai di `.env.local` dengan kredensial Supabase dan Redis Anda. Untuk mengaktifkan generator musik AI, isi `MUSIC_AI_API_KEY` dengan token Hugging Face dan opsional ubah `MUSIC_AI_MODEL` (default: `facebook/musicgen-small`). Jika token belum tersedia, aplikasi otomatis memakai Harkat Local Composer.
5. Jalankan migrasi database di Supabase SQL Editor menggunakan file yang ada di `supabase/migrations/00000000000000_init.sql`.
6. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

Aplikasi akan berjalan di `http://localhost:3000`.

## Mesin AI Lokal

Jalankan worker MusicGen, Basic Pitch, dan Demucs pada terminal terpisah:

```powershell
npm run ai:local
```

Runtime dan model disimpan di `D:\Harkat Studio\runtime` dan `D:\Harkat Studio\models`. Create Harkat mencoba MusicGen lokal, lalu provider resmi melalui `MUSIC_AI_API_KEY`, dan terakhir Harkat Local Composer. Detail tersedia di `local-ai/README.md`.

## Arsitektur & Teknologi

- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui.
- **Backend:** Next.js API Routes, Node.js (FFmpeg workers untuk audio).
- **Database:** PostgreSQL (via Supabase).
- **Music Generation:** Hugging Face MusicGen yang digabungkan dengan Harkat Local Composer sebagai layer lokal dan fallback.
- **Audio Processing:** Web Audio API, Tone.js, Wavesurfer.js.
- **Job Queue:** Redis & BullMQ.
