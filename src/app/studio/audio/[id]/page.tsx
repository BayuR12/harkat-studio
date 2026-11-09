'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { useParams } from 'next/navigation'
import { Play, Square, FastForward, Rewind, Scissors, Copy, SplitSquareVertical, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

const subscribeToSessionStorage = () => () => {}

export default function AudioStudioPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const params = useParams<{ id: string }>()
  const savedGeneration = useSyncExternalStore(
    subscribeToSessionStorage,
    () => sessionStorage.getItem(`generation:${params.id}`),
    () => null
  )
  const generation = useMemo<{
    song: { title: string; prompt_used?: string; audio_url: string; provider?: string; bpm?: number }
    tracks?: { id: string; name: string; role: string; audio_url: string }[]
  } | null>(() => {
    if (!savedGeneration) return null
    try {
      return JSON.parse(savedGeneration)
    } catch {
      return null
    }
  }, [savedGeneration])

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Studio Header */}
      <header className="h-16 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">← Keluar</Link>
          <div>
            <h1 className="text-xl font-bold">{generation?.song.title || 'Proyek Audio'}</h1>
            {generation?.song.prompt_used && <p className="max-w-xl truncate text-xs text-gray-400">{generation.song.prompt_used}</p>}
          </div>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">120 BPM • 4/4</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-[#333] hover:bg-[#444] px-4 py-1.5 rounded text-sm transition">Ekspor</button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded text-sm font-medium transition">Simpan</button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-12 bg-[#222] border-b border-[#333] flex items-center px-4 gap-2">
        <div className="flex items-center gap-1 bg-[#111] p-1 rounded">
          <button className="p-2 hover:bg-[#333] rounded"><Rewind size={16} /></button>
          <button 
            className="p-2 hover:bg-[#333] rounded text-primary" 
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Square size={16} /> : <Play size={16} fill="currentColor" />}
          </button>
          <button className="p-2 hover:bg-[#333] rounded"><FastForward size={16} /></button>
        </div>
        
        <div className="h-6 w-px bg-[#444] mx-2"></div>
        
        <button className="p-2 hover:bg-[#333] rounded text-gray-400" title="Split"><SplitSquareVertical size={16} /></button>
        <button className="p-2 hover:bg-[#333] rounded text-gray-400" title="Trim"><Scissors size={16} /></button>
        <button className="p-2 hover:bg-[#333] rounded text-gray-400" title="Copy"><Copy size={16} /></button>
        
        <div className="h-6 w-px bg-[#444] mx-2"></div>
        <span className="text-sm font-mono text-secondary">00:00:00.000</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Track Headers */}
        <div className="w-64 bg-[#1a1a1a] border-r border-[#333] overflow-y-auto">
          {[1, 2, 3].map((track) => (
            <div key={track} className="h-32 border-b border-[#333] p-4 flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">Audio Track {track}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-6 h-6 bg-[#333] rounded flex items-center justify-center text-xs text-yellow-500 font-bold">S</button>
                  <button className="w-6 h-6 bg-[#333] rounded flex items-center justify-center text-xs text-red-500 font-bold">M</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-gray-500" />
                <input type="range" className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          ))}
          <button className="w-full p-4 text-left text-sm text-gray-400 hover:text-white hover:bg-[#222] transition">
            + Tambah Track
          </button>
        </div>

        {/* Timeline & Arranger */}
        <div className="flex-1 bg-[#111] overflow-auto relative">
          {generation ? (
            <div className="relative z-20 m-4 space-y-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><p className="text-sm font-medium text-primary">Hasil generasi siap diedit</p><p className="text-xs text-gray-400">{generation.song.provider}{generation.song.bpm ? ` • ${generation.song.bpm} BPM` : ''}</p></div>
                <Link href={`/studio/score/${params.id}`} className="rounded bg-accent/20 px-3 py-2 text-sm text-accent hover:bg-accent/30">Lihat Partitur & Chord</Link>
              </div>
              {(generation.tracks?.length ? generation.tracks : [{ id: 'master', name: 'Master Audio', role: 'Master', audio_url: generation.song.audio_url }]).map((track) => (
                <div key={track.id} className="rounded border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold">{track.name}</span><span className="text-xs text-gray-400">{track.role}</span></div>
                  <audio controls src={track.audio_url} className="w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative z-20 m-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              Data hasil generasi tidak ditemukan di sesi ini. Buat lagu baru lalu pilih “Buka di Studio”.
            </div>
          )}
          {/* Grid lines (mock) */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMTAwJSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iMTAwJSIgZmlsbD0ibm9uZSIvPjxwb2x5Z29uIHBvaW50cz0iNDAsMCA0MCwxMDAlIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] pointer-events-none"></div>
          
          {/* Tracks timeline container */}
          <div className="relative">
            {/* Track 1 Region */}
            <div className="absolute top-4 left-10 w-64 h-24 bg-primary/40 border border-primary/60 rounded-md p-2">
              <div className="w-full h-full opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/41/Waveform.svg')] bg-cover bg-no-repeat bg-center"></div>
              <span className="absolute top-1 left-2 text-xs text-white">Vocal.wav</span>
            </div>
            
            {/* Track 2 Region */}
            <div className="absolute top-[144px] left-32 w-96 h-24 bg-secondary/40 border border-secondary/60 rounded-md p-2">
              <div className="w-full h-full opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/4/41/Waveform.svg')] bg-cover bg-no-repeat bg-center"></div>
              <span className="absolute top-1 left-2 text-xs text-white">Drum_Loop.wav</span>
            </div>
          </div>
          
          {/* Playhead */}
          <div className="absolute top-0 bottom-0 left-32 w-px bg-red-500 z-10">
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500 absolute -top-0 -left-[5.5px]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
