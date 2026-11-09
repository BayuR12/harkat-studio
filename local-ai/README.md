# Harkat Local AI

Runtime lokal berada di drive D dan tidak disimpan dalam Git:

- Python: `D:\Harkat Studio\runtime\Python311Portable`
- Model: `D:\Harkat Studio\models`
- Data sementara/hasil worker: `D:\Harkat Studio\data`
- FFmpeg: `D:\Harkat Studio\runtime\FFmpeg`
- MuseScore Studio: runtime dipindahkan ke `D:\Harkat Studio\runtime\MuseScore4` dan ditambahkan ke PATH worker untuk ekspor engraving melalui CLI.

Jalankan worker:

```powershell
npm run ai:local
```

Model MusicGen diunduh saat generasi pertama. Pada CPU proses ini dapat membutuhkan waktu beberapa menit. Endpoint:

- `GET http://127.0.0.1:8010/health`
- `POST http://127.0.0.1:8010/generate`
- `POST http://127.0.0.1:8010/transcribe`

Jangan commit API key. Simpan provider komersial hanya dalam `.env.local`.
