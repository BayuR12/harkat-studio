$ErrorActionPreference = 'Stop'
$projectWorkspace = Resolve-Path (Join-Path $PSScriptRoot '..\..') -ErrorAction SilentlyContinue

$candidates = @(
  $projectWorkspace,
  'D:\Project\Harkat Studio',
  'D:\Harkat Studio'
)

$baseRoot = $null
foreach ($candidate in $candidates) {
  if ($candidate -and (Test-Path (Join-Path $candidate 'runtime\Python311Portable\python.exe'))) {
    $baseRoot = $candidate
    break
  }
}

if (-not $baseRoot) {
  $baseRoot = 'D:\Project\Harkat Studio'
}

$runtimeRoot = Join-Path $baseRoot 'runtime'
$python = Join-Path $runtimeRoot 'Python311Portable\python.exe'
$modelRoot = Join-Path $baseRoot 'models'
$dataRoot = Join-Path $baseRoot 'data'
$cacheRoot = Join-Path $baseRoot 'cache'

if (-not (Test-Path -LiteralPath $python)) {
  throw "Python lokal tidak ditemukan di: $python"
}

New-Item -ItemType Directory -Force -Path $modelRoot, $dataRoot, $cacheRoot | Out-Null
$env:HF_HOME = Join-Path $modelRoot 'huggingface'
$env:TORCH_HOME = Join-Path $modelRoot 'torch'
$env:PIP_CACHE_DIR = Join-Path $cacheRoot 'pip'
$env:MUSICGEN_MIN_AVAILABLE_MB = '1000'
$env:HARKAT_DATA_ROOT = $dataRoot

$mscoreBin = Join-Path $runtimeRoot 'MuseScore4\bin'
$ffmpegBin = Get-ChildItem -Path (Join-Path $runtimeRoot 'FFmpeg') -Filter 'bin' -Recurse -Directory -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
if (-not $ffmpegBin) {
  $ffmpegBin = Join-Path $runtimeRoot 'FFmpeg\ffmpeg-9.0.1-full_build\bin'
}

$env:MUSESCORE_BIN = Join-Path $mscoreBin 'MuseScore4.exe'
$env:PATH = "$mscoreBin;$ffmpegBin;$env:PATH"

Write-Host "Menjalankan Harkat Local AI worker..." -ForegroundColor Cyan
Write-Host "Runtime: $runtimeRoot" -ForegroundColor Gray
Write-Host "MuseScore: $env:MUSESCORE_BIN" -ForegroundColor Gray

& $python -m uvicorn worker:app --app-dir local-ai --host 127.0.0.1 --port 8010

