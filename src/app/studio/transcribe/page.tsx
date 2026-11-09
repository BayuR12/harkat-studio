'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Download, FileAudio, FileText, Gauge, Loader2, Menu, Minus, Music2, Pause, Play, Plus, Printer, Redo2, Save, Settings2, SlidersHorizontal, Undo2, Upload, Volume2 } from 'lucide-react'
import { toMidi, toMusicXml, transcribeAudio, type TranscribedNote } from '@/lib/music/transcription'
import { Logo } from '@/components/shared/Logo'

const downloadFile = (name: string, data: BlobPart, type: string) => {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function TranscribePage() {
  const [fileName, setFileName] = useState('')
  const [notes, setNotes] = useState<TranscribedNote[]>([])
  const [progress, setProgress] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [engraving, setEngraving] = useState(false)
  const [error, setError] = useState('')
  const [bpm, setBpm] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [metronome, setMetronome] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [selectedSymbol, setSelectedSymbol] = useState('Quarter note')
  const [rightPanel, setRightPanel] = useState<'properties' | 'mixer'>('properties')

  const handleMuseScoreExport = async (format: 'pdf' | 'png') => {
    if (!notes.length) return
    setEngraving(true)
    setError('')
    try {
      const xml = toMusicXml(fileName || 'score', notes, bpm)
      const res = await fetch('/api/engrave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ musicxml: xml, format, title: fileName || 'score' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ekspor MuseScore gagal')

      const byteCharacters = atob(data.base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      downloadFile(data.filename, byteArray, data.mime_type)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ekspor partitur dengan MuseScore gagal')
    } finally {
      setEngraving(false)
    }
  }

  const processFile = async (file: File) => {
    setFileName(file.name.replace(/\.[^.]+$/, ''))
    setError('')
    setNotes([])
    setProgress(0)
    setProcessing(true)
    try {
      setProgress(15)
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/transcribe/audio', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('local worker unavailable')
      const local = await response.json() as { notes: { start: number; end: number; midi: number }[] }
      const result = {
        notes: local.notes.map((note) => ({
          midi: note.midi,
          name: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][note.midi % 12] + (Math.floor(note.midi / 12) - 1),
          frequency: 440 * 2 ** ((note.midi - 69) / 12),
          start: note.start,
          duration: note.end - note.start,
        })),
      }
      setProgress(100)
      setNotes(result.notes)
      if (!result.notes.length) setError('Nada tidak terdeteksi. Gunakan rekaman monofonik yang bersih dan minim noise.')
    } catch {
      try {
        const result = await transcribeAudio(file, setProgress)
        setNotes(result.notes)
        setError(result.notes.length ? 'Basic Pitch lokal tidak tersedia; hasil dibuat dengan engine browser Harkat.' : 'Format audio tidak dapat dibaca atau nada tidak terdeteksi.')
      } catch {
        setError('Format audio tidak dapat dibaca oleh engine lokal maupun browser.')
      }
    } finally {
      setProcessing(false)
    }
  }

  const importMusicXml = async (file: File) => {
    setError('')
    try {
      const document = new DOMParser().parseFromString(await file.text(), 'application/xml')
      if (document.querySelector('parsererror')) throw new Error('invalid XML')
      const imported = Array.from(document.querySelectorAll('note')).flatMap((element, index) => {
        const step = element.querySelector('pitch > step')?.textContent
        const octave = Number(element.querySelector('pitch > octave')?.textContent)
        if (!step || !Number.isFinite(octave)) return []
        const alter = Number(element.querySelector('pitch > alter')?.textContent || 0)
        const pitchClasses: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
        const midi = (octave + 1) * 12 + pitchClasses[step] + alter
        const duration = Math.max(0.125, Number(element.querySelector('duration')?.textContent || 4) / 4 * 60 / bpm)
        return [{ midi, name: `${step}${alter ? '♯' : ''}${octave}`, frequency: 440 * 2 ** ((midi - 69) / 12), start: index * duration, duration }]
      })
      if (!imported.length) throw new Error('no notes')
      setFileName(file.name.replace(/\.[^.]+$/, ''))
      setNotes(imported)
      setProgress(100)
    } catch {
      setError('MusicXML tidak valid atau tidak berisi not bernada yang dapat dibaca.')
    }
  }

  return (
    <div className="min-h-screen bg-[#24262b] text-white">
      <div className="border-b border-black/40 bg-[#303238] px-3 py-2">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <Link href="/library" className="mr-3 inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-white/10"><ArrowLeft size={17} /> Library</Link>
          {['File', 'Edit', 'View', 'Add', 'Format', 'Tools', 'Help'].map((menu) => <button key={menu} className="rounded px-3 py-1 hover:bg-white/10">{menu}</button>)}
          <div className="ml-auto flex items-center gap-2">
            <Logo size="xs" showText={false} />
            <span className="text-xs text-gray-300 font-medium">UKM Musik Harkat • AudioScore</span>
          </div>
        </div>
      </div>
      <div className="sticky top-0 z-30 border-b border-black/50 bg-[#3a3c42] px-3 py-2 shadow-lg">
        <div className="flex flex-wrap items-center gap-1">
          <label className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-white/10"><Upload size={18} /><span className="hidden sm:inline">Open</span><input type="file" accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.flac" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void processFile(file) }} /></label>
          <button disabled={!notes.length} onClick={() => notes.length && downloadFile(`${fileName || 'score'}.musicxml`, toMusicXml(fileName || 'score', notes, bpm), 'application/vnd.recordare.musicxml+xml')} className="rounded p-2 hover:bg-white/10 disabled:opacity-30" title="Save MusicXML"><Save size={18} /></button><button disabled className="rounded p-2 opacity-30" title="Undo tersedia setelah penyuntingan not"><Undo2 size={18} /></button><button disabled className="rounded p-2 opacity-30" title="Redo tersedia setelah penyuntingan not"><Redo2 size={18} /></button>
          <span className="mx-2 h-7 w-px bg-white/15" />
          <button onClick={() => setPlaying(!playing)} className="rounded-full bg-white p-2 text-gray-900">{playing ? <Pause size={18} /> : <Play size={18} />}</button>
          <button onClick={() => setMetronome(!metronome)} className={`rounded px-3 py-2 text-sm ${metronome ? 'bg-blue-500' : 'hover:bg-white/10'}`}><Gauge size={17} /></button>
          <label className="ml-1 flex items-center gap-2 rounded bg-black/20 px-2 py-1 text-xs">BPM<input type="number" min="40" max="240" value={bpm} onChange={(event) => setBpm(Number(event.target.value))} className="w-14 bg-transparent text-center font-bold outline-none" /></label>
          <span className="mx-2 h-7 w-px bg-white/15" />
          {['𝅝', '𝅗𝅥', '♩', '♪', '♯', '♭', '♮', '𝄽'].map((symbol) => <button key={symbol} onClick={() => setSelectedSymbol(symbol)} className={`min-w-9 rounded px-2 py-1 text-xl ${selectedSymbol === symbol ? 'bg-blue-500' : 'hover:bg-white/10'}`}>{symbol}</button>)}
          <div className="ml-auto flex items-center gap-1"><button onClick={() => setZoom((value) => Math.max(50, value - 10))} className="rounded p-2 hover:bg-white/10"><Minus size={16} /></button><span className="w-12 text-center text-xs">{zoom}%</span><button onClick={() => setZoom((value) => Math.min(200, value + 10))} className="rounded p-2 hover:bg-white/10"><Plus size={16} /></button></div>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-98px)] lg:grid-cols-[230px_1fr_260px]">
      <aside className="border-r border-black/50 bg-[#303238] p-3">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">Palettes</h2><Menu size={16} /></div>
        {['Clefs', 'Key Signatures', 'Time Signatures', 'Tempo', 'Dynamics', 'Articulations', 'Ornaments', 'Lines', 'Text', 'Guitar'].map((name, index) => <button key={name} className="mb-1 flex w-full items-center justify-between rounded bg-black/15 px-3 py-2 text-left text-sm hover:bg-white/10"><span>{name}</span><ChevronDown size={14} className={index > 2 ? '-rotate-90' : ''} /></button>)}
        <div className="mt-4 grid grid-cols-4 gap-2 rounded bg-black/20 p-3 text-center text-xl"><span>𝄞</span><span>𝄢</span><span>♯</span><span>♭</span><span>𝆏</span><span>𝆑</span><span>𝄐</span><span>𝄾</span></div>
      </aside>

      <main className="min-w-0 overflow-auto p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold"><Music2 className="text-blue-400" /> AudioScore Studio</h1>
            <p className="mt-1 text-sm text-gray-400">Transkripsi, edit, playback, dan ekspor notasi.</p>
          </div>
          {notes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                disabled={engraving}
                onClick={() => void handleMuseScoreExport('pdf')}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
                title="Ekspor partitur resmi menggunakan mesin engraving MuseScore 4"
              >
                {engraving ? <Loader2 size={17} className="animate-spin" /> : <FileText size={17} />}
                MuseScore 4 PDF
              </button>
              <button onClick={() => downloadFile(`${fileName}.musicxml`, toMusicXml(fileName, notes, bpm), 'application/vnd.recordare.musicxml+xml')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold"><Download size={17} /> MusicXML</button>
              <button onClick={() => downloadFile(`${fileName}.mid`, toMidi(notes, bpm), 'audio/midi')} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold"><Download size={17} /> MIDI</button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"><Printer size={17} /> PDF Cepat</button>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <span className="text-sm text-gray-300">Sudah memiliki score dari MuseScore?</span>
          <label className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
            Buka MusicXML
            <input type="file" accept=".musicxml,.xml,application/vnd.recordare.musicxml+xml,application/xml,text/xml" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importMusicXml(file) }} />
          </label>
          <span className="text-xs text-gray-500">Impor: .musicxml/.xml • Ekspor: .musicxml/.mid/PDF</span>
        </div>

        <section className="mb-5 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="grid gap-5 md:grid-cols-[1fr_180px]">
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center transition hover:bg-primary/10">
              <Upload className="mb-3 text-primary" size={32} />
              <span className="font-semibold">Upload audio untuk ditranskripsi</span>
              <span className="mt-1 text-sm text-gray-400">WAV, MP3, M4A, AAC, OGG atau FLAC • maksimal 90 detik dianalisis</span>
              <input type="file" accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.flac" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void processFile(file) }} />
            </label>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm"><span className="mb-2 block font-semibold">Input aktif</span><div className="text-blue-300">{selectedSymbol}</div><span className="mt-3 block text-xs leading-5 text-gray-400">Pilih simbol pada toolbar lalu klik area score untuk penyuntingan berikutnya.</span></div>
          </div>
          {processing && <div className="mt-5"><div className="mb-2 flex justify-between text-sm"><span>Menganalisis pitch…</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded bg-white/10"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div></div>}
          {error && <p className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">{error}</p>}
        </section>

        <section className="min-h-[640px] origin-top overflow-x-auto bg-white p-6 text-gray-900 shadow-2xl transition-transform sm:p-10" style={{ width: `${zoom}%`, maxWidth: 'none' }}>
          <div className="mb-8 text-center font-serif"><h2 className="text-3xl font-bold">{fileName || 'Partitur Baru'}</h2><p className="mt-1 text-gray-500">Transkripsi otomatis • {bpm} BPM • 4/4</p></div>
          {!notes.length && !processing ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center text-gray-400"><FileAudio size={52} className="mb-4" /><p>Notasi hasil transkripsi akan tampil di sini.</p></div>
          ) : (
            <div className="grid grid-cols-4 gap-x-0 gap-y-14">
              {notes.slice(0, 64).map((note, index) => (
                <div key={`${note.start}-${index}`} className="relative h-20 border-y border-gray-300 px-2 pt-1 text-center">
                  <span className="text-xs font-semibold text-violet-600">{note.name}</span>
                  <span className="absolute inset-x-0 top-7 text-3xl font-serif">{note.duration > 0.7 ? '♩' : '♪'}</span>
                  <span className="absolute bottom-1 right-1 text-[10px] text-gray-400">{note.start.toFixed(1)}s</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-gray-500">Mesin ini cocok untuk vokal atau satu instrumen melodis. Campuran band, chord polifonik, vibrato kuat, dan rekaman bising tetap membutuhkan koreksi manual di MuseScore.</p>
      </div>
      </main>

      <aside className="border-l border-black/50 bg-[#303238] p-3">
        <div className="mb-4 grid grid-cols-2 rounded bg-black/30 p-1 text-xs"><button onClick={() => setRightPanel('properties')} className={`rounded py-2 ${rightPanel === 'properties' ? 'bg-blue-500' : ''}`}><Settings2 size={14} className="mr-1 inline" /> Properties</button><button onClick={() => setRightPanel('mixer')} className={`rounded py-2 ${rightPanel === 'mixer' ? 'bg-blue-500' : ''}`}><SlidersHorizontal size={14} className="mr-1 inline" /> Mixer</button></div>
        {rightPanel === 'properties' ? <div className="space-y-3 text-sm"><h3 className="font-bold">Score</h3><label className="block text-xs text-gray-400">Title<input value={fileName} onChange={(event) => setFileName(event.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/20 p-2 text-white" /></label><div className="grid grid-cols-2 gap-2"><label className="text-xs text-gray-400">Tempo<input value={bpm} onChange={(event) => setBpm(Number(event.target.value))} type="number" className="mt-1 w-full rounded bg-black/20 p-2 text-white" /></label><label className="text-xs text-gray-400">Meter<select className="mt-1 w-full rounded bg-black/20 p-2 text-white"><option>4/4</option><option>3/4</option><option>6/8</option></select></label></div><div className="rounded bg-black/20 p-3 text-xs text-gray-400">Selected: {selectedSymbol}<br />Notes detected: {notes.length}<br />Zoom: {zoom}%</div></div> : <div className="space-y-4"><h3 className="font-bold">Mixer</h3>{['Master', 'Piano', 'Audio reference'].map((track) => <div key={track} className="rounded bg-black/20 p-3"><div className="mb-2 flex items-center justify-between text-sm"><span>{track}</span><Volume2 size={15} /></div><input type="range" className="w-full accent-blue-500" /></div>)}</div>}
      </aside>
      </div>
    </div>
  )
}
