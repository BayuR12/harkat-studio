import base64
import ctypes
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from scipy.io.wavfile import write as write_wav

# Resolve base root dynamically
_candidate_roots = [
    Path(__file__).resolve().parent.parent.parent,
    Path(r"D:\Project\Harkat Studio"),
    Path(r"D:\Harkat Studio"),
]
BASE_ROOT = next(
    (p for p in _candidate_roots if (p / "runtime" / "Python311Portable").exists()),
    Path(r"D:\Project\Harkat Studio")
)

os.environ.setdefault("HF_HOME", str(BASE_ROOT / "models" / "huggingface"))
os.environ.setdefault("TORCH_HOME", str(BASE_ROOT / "models" / "torch"))
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

DATA_ROOT = Path(os.getenv("HARKAT_DATA_ROOT", str(BASE_ROOT / "data")))
DATA_ROOT.mkdir(parents=True, exist_ok=True)
MUSICGEN_MIN_AVAILABLE_MB = int(os.getenv("MUSICGEN_MIN_AVAILABLE_MB", "1000"))

# Locate MuseScore binary
MUSESCORE_BIN = os.getenv("MUSESCORE_BIN")
if not MUSESCORE_BIN or not Path(MUSESCORE_BIN).exists():
    for candidate in [
        BASE_ROOT / "runtime" / "MuseScore4" / "bin" / "MuseScore4.exe",
        Path(r"D:\Project\Harkat Studio\runtime\MuseScore4\bin\MuseScore4.exe"),
        Path(r"D:\Harkat Studio\runtime\MuseScore4\bin\MuseScore4.exe"),
    ]:
        if candidate.exists():
            MUSESCORE_BIN = str(candidate)
            break

app = FastAPI(title="Harkat Local AI", version="1.1.0")
_music_model = None
_music_processor = None


class MemoryStatus(ctypes.Structure):
    _fields_ = [
        ("length", ctypes.c_ulong), ("memory_load", ctypes.c_ulong),
        ("total_physical", ctypes.c_ulonglong), ("available_physical", ctypes.c_ulonglong),
        ("total_page_file", ctypes.c_ulonglong), ("available_page_file", ctypes.c_ulonglong),
        ("total_virtual", ctypes.c_ulonglong), ("available_virtual", ctypes.c_ulonglong),
        ("available_extended_virtual", ctypes.c_ulonglong),
    ]


def available_memory_mb():
    status = MemoryStatus()
    status.length = ctypes.sizeof(MemoryStatus)
    ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status))
    return round(status.available_physical / 1024 / 1024)


class MusicRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)
    duration_seconds: int = Field(default=5, ge=2, le=30)
    model: str = "facebook/musicgen-small"


class EngraveRequest(BaseModel):
    musicxml: str | None = None
    midi_base64: str | None = None
    format: str = Field(default="pdf")  # pdf, png, svg, mid
    title: str | None = "score"


@app.get("/health")
def health():
    musescore_available = bool(MUSESCORE_BIN and Path(MUSESCORE_BIN).exists())
    return {
        "status": "ready",
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "music_model_loaded": _music_model is not None,
        "available_memory_mb": available_memory_mb(),
        "musicgen_min_available_mb": MUSICGEN_MIN_AVAILABLE_MB,
        "engines": {
            "musicgen": True,
            "basic_pitch": True,
            "demucs": True,
            "musescore": musescore_available,
        },
        "musescore": {
            "available": musescore_available,
            "bin": MUSESCORE_BIN,
        },
        "model_root": os.environ["HF_HOME"],
    }


@app.post("/generate")
def generate_music(request: MusicRequest):
    global _music_model, _music_processor
    if _music_model is None and not torch.cuda.is_available() and available_memory_mb() < 600:
        raise HTTPException(
            status_code=503,
            detail=f"RAM kosong terlalu sedikit ({available_memory_mb()} MB). Butuh minimal 600 MB.",
        )
    try:
        from transformers import AutoProcessor, MusicgenForConditionalGeneration
        torch.set_num_threads(min(8, os.cpu_count() or 4))

        if _music_model is None:
            try:
                _music_processor = AutoProcessor.from_pretrained(request.model, local_files_only=True)
            except Exception:
                _music_processor = AutoProcessor.from_pretrained(request.model)

            try:
                _music_model = MusicgenForConditionalGeneration.from_pretrained(
                    request.model,
                    low_cpu_mem_usage=True,
                    local_files_only=True,
                )
            except Exception:
                _music_model = MusicgenForConditionalGeneration.from_pretrained(
                    request.model,
                    low_cpu_mem_usage=True,
                )
            _music_model.eval()
            _music_model.to("cuda" if torch.cuda.is_available() else "cpu")

        inputs = _music_processor(text=[request.prompt], padding=True, return_tensors="pt")
        inputs = {key: value.to(_music_model.device) for key, value in inputs.items()}
        sample_rate = int(_music_model.config.audio_encoder.sampling_rate)
        tokens = min(1503, int(request.duration_seconds * 50))
        # Pada CPU, hindari guidance_scale > 1.0 karena CFG menggandakan ukuran batch/iterasi komputasi
        guidance = 1.0 if not torch.cuda.is_available() else 3.0
        with torch.inference_mode():
            audio = _music_model.generate(**inputs, do_sample=True, guidance_scale=guidance, max_new_tokens=tokens)
        samples = audio[0, 0].detach().cpu().float().numpy()
        samples = np.clip(samples, -1, 1)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False, dir=DATA_ROOT) as stream:
            output = Path(stream.name)
        write_wav(output, sample_rate, (samples * 32767).astype(np.int16))
        encoded = base64.b64encode(output.read_bytes()).decode("ascii")
        output.unlink(missing_ok=True)
        return {"audio_url": f"data:audio/wav;base64,{encoded}", "provider": "Local MusicGen", "device": str(_music_model.device)}
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"MusicGen failed: {error}") from error


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    suffix = Path(file.filename or "audio.wav").suffix or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False, dir=DATA_ROOT) as stream:
        source = Path(stream.name)
        stream.write(await file.read())
    try:
        from basic_pitch.inference import predict

        _, midi_data, events = predict(str(source))
        midi_path = source.with_suffix(".mid")
        midi_data.write(str(midi_path))
        midi_base64 = base64.b64encode(midi_path.read_bytes()).decode("ascii")
        notes = [
            {"start": float(event[0]), "end": float(event[1]), "midi": int(event[2]), "amplitude": float(event[3])}
            for event in events
        ]
        return {"notes": notes, "midi_base64": midi_base64, "engine": "Spotify Basic Pitch"}
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Basic Pitch failed: {error}") from error
    finally:
        source.unlink(missing_ok=True)
        source.with_suffix(".mid").unlink(missing_ok=True)


@app.post("/engrave")
def engrave_score(req: EngraveRequest):
    """
    Mengonversi notasi MusicXML atau MIDI ke PDF, PNG, atau SVG melalui MuseScore 4 CLI.
    """
    if not MUSESCORE_BIN or not Path(MUSESCORE_BIN).exists():
        raise HTTPException(
            status_code=503,
            detail="MuseScore 4 binary tidak ditemukan di runtime. Pastikan MuseScore4 terpasang di runtime/MuseScore4/bin.",
        )

    target_format = req.format.lower().strip()
    if target_format not in {"pdf", "png", "svg", "mid", "musicxml"}:
        raise HTTPException(status_code=400, detail=f"Format '{target_format}' tidak didukung. Gunakan pdf, png, svg, atau mid.")

    mime_map = {
        "pdf": "application/pdf",
        "png": "image/png",
        "svg": "image/svg+xml",
        "mid": "audio/midi",
        "musicxml": "application/vnd.recordare.musicxml+xml",
    }

    with tempfile.TemporaryDirectory(dir=DATA_ROOT) as temp_dir:
        dir_path = Path(temp_dir)
        source_name = f"{req.title or 'score'}"

        if req.musicxml:
            source_file = dir_path / f"{source_name}.musicxml"
            source_file.write_text(req.musicxml, encoding="utf-8")
        elif req.midi_base64:
            source_file = dir_path / f"{source_name}.mid"
            source_file.write_bytes(base64.b64decode(req.midi_base64))
        else:
            raise HTTPException(status_code=400, detail="Data 'musicxml' atau 'midi_base64' wajib disertakan.")

        dest_file = dir_path / f"{source_name}.{target_format}"

        cmd = [MUSESCORE_BIN, "-f", "-o", str(dest_file), str(source_file)]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            if res.returncode != 0 and not dest_file.exists():
                raise RuntimeError(f"MuseScore CLI keluar dengan kode {res.returncode}: {res.stderr}")
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"MuseScore engraving gagal: {exc}") from exc

        # Periksa file hasil, termasuk format multi-halaman (-1.png, -1.svg)
        result_file = None
        if dest_file.exists():
            result_file = dest_file
        else:
            page_one = dir_path / f"{source_name}-1.{target_format}"
            if page_one.exists():
                result_file = page_one

        if not result_file or not result_file.exists():
            raise HTTPException(status_code=500, detail="File partitur tidak berhasil dibuat oleh MuseScore.")

        file_bytes = result_file.read_bytes()
        encoded = base64.b64encode(file_bytes).decode("ascii")
        mime = mime_map.get(target_format, "application/octet-stream")

        return {
            "status": "success",
            "format": target_format,
            "filename": f"{source_name}.{target_format}",
            "mime_type": mime,
            "data_url": f"data:{mime};base64,{encoded}",
            "base64": encoded,
            "engine": "MuseScore 4 Studio CLI",
        }


@app.exception_handler(Exception)
async def unhandled_error(_, error: Exception):
    return JSONResponse(status_code=500, content={"detail": str(error)})
