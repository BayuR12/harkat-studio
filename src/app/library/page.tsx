'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, Play, Pause, Heart, Download, ExternalLink, 
  FileText, Music, Search, Filter, Sparkles, Disc, Check, 
  Share2, ChevronDown, Radio, Mic2, Trash2, AlertTriangle, X
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

export type Song = {
  id: string
  title: string
  creator: string
  genre: string
  mood: string
  duration: string
  audio_url?: string
  image_url?: string
  source_url?: string
  source?: string
  youtube_url?: string
  musescore_url?: string
  pdf_url?: string
  musicxml_url?: string
  midi_url?: string
  chord_url?: string
  isDemo?: boolean
  isAiGenerated?: boolean
  take?: string
  bpm?: number
  lyrics?: string
  scoreData?: {
    key?: string
    tempo?: number
    meter?: string
    chords?: string[]
    instruments?: string[]
  }
}

// Built-in authentic Suno AI creations and curated reference catalog
const INITIAL_LIBRARY_SONGS: Song[] = [
  {
    id: 'yang-pergi-kamu',
    title: 'YANG PERGI KAMU, BUKAN HIDUPKU',
    creator: 'Suno AI (sonic-v6-mini) • Harkat AI Studio',
    genre: 'Alternative Rock',
    mood: 'Melancholic / Cathartic',
    duration: '6:10',
    audio_url: '/audio/yang-pergi-kamu.mp3',
    image_url: '/audio/yang-pergi-kamu-cover-v1.jpg',
    pdf_url: '/audio/yang-pergi-kamu.pdf',
    musicxml_url: '/audio/yang-pergi-kamu.musicxml',
    midi_url: '/audio/yang-pergi-kamu.mid',
    chord_url: '/audio/yang-pergi-kamu-chord-sheet.txt',
    isAiGenerated: true,
    take: 'Take 1 (Master)',
    source: 'Suno AI Master Production',
    bpm: 96,
    scoreData: {
      key: 'A Minor',
      tempo: 96,
      meter: '4/4',
      chords: ['Am', 'G', 'F', 'E'],
      instruments: ['Vokal Pria Emo Rock', 'Clean Electric Guitar', 'Overdriven Guitar', 'Bass Melodis', 'Drum Rock']
    }
  },
  {
    id: 'c675a23e-e4da-49c8-8872-3616c0c10d0d',
    title: 'YANG PERGI KAMU, BUKAN HIDUPKU (Take 2)',
    creator: 'Suno AI (sonic-v6-mini) • Harkat AI Studio',
    genre: 'Alternative Rock',
    mood: 'Emotional / Emo Ballad',
    duration: '5:58',
    audio_url: '/audio/yang-pergi-kamu-v2.mp3',
    image_url: '/audio/yang-pergi-kamu-cover-v2.jpg',
    pdf_url: '/audio/yang-pergi-kamu.pdf',
    musicxml_url: '/audio/yang-pergi-kamu.musicxml',
    midi_url: '/audio/yang-pergi-kamu.mid',
    chord_url: '/audio/yang-pergi-kamu-chord-sheet.txt',
    isAiGenerated: true,
    take: 'Take 2 (Alternate)',
    source: 'Suno AI Alternate Master',
    bpm: 96,
    scoreData: {
      key: 'A Minor',
      tempo: 96,
      meter: '4/4',
      chords: ['Am', 'G', 'F', 'E'],
      instruments: ['Vokal Pria Emo Rock', 'Clean Electric Guitar', 'Overdriven Guitar', 'Bass Melodis', 'Drum Rock']
    }
  },
  { 
    id: '1', 
    title: 'Senja di Kampus', 
    creator: 'Mahasiswa Berkelana', 
    genre: 'Pop', 
    mood: 'Optimis', 
    duration: '3:45', 
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
    isDemo: true 
  },
  { 
    id: '2', 
    title: 'Langkah Awal', 
    creator: 'Harkat Demo', 
    genre: 'Acoustic', 
    mood: 'Tenang', 
    duration: '2:30', 
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 
    isDemo: true 
  },
  { 
    id: '3', 
    title: 'Cyberpunk City', 
    creator: 'AI Master', 
    genre: 'Electronic', 
    mood: 'Energik', 
    duration: '4:15', 
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 
    isDemo: true 
  },
  { 
    id: 'bengawan-solo', 
    title: 'Bengawan Solo', 
    creator: 'Gesang Martohartono', 
    genre: 'Keroncong', 
    mood: 'Nostalgia', 
    duration: '4:39', 
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/b1/5f/be/b15fbe0a-2c4c-a38c-e670-9b8729550d59/mzaf_13056788282501145633.plus.aac.p.m4a', 
    source_url: 'https://music.apple.com/id/album/bengawan-solo/1296940948?i=1296941510&uo=4', 
    youtube_url: 'https://www.youtube.com/watch?v=-J4yNa2w_I0' 
  },
  { 
    id: 'laskar-pelangi', 
    title: 'Laskar Pelangi', 
    creator: 'Nidji', 
    genre: 'Pop Rock', 
    mood: 'Inspiratif', 
    duration: '3:53', 
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/7b/e0/54/7be0545f-6987-0436-fd2b-af7a0463dd9e/mzaf_8216737427834059470.plus.aac.p.m4a', 
    source_url: 'https://music.apple.com/id/album/laskar-pelangi/766160296?i=766160395&uo=4', 
    musescore_url: 'https://musescore.com/user/94895524/scores/24270976' 
  },
  { 
    id: 'sempurna', 
    title: 'Sempurna', 
    creator: 'Andra And The Backbone', 
    genre: 'Acoustic Pop', 
    mood: 'Romantis', 
    duration: '4:28', 
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/63/ef/0c/63ef0c27-1d16-717a-b8c7-cd0522fe8b8f/mzaf_2266158215694571598.plus.aac.p.m4a', 
    source_url: 'https://music.apple.com/id/album/sempurna/1566337626?i=1566337654&uo=4', 
    youtube_url: 'https://www.youtube.com/watch?v=jStNaVCW838' 
  },
  { 
    id: 'teh-hijau', 
    title: 'Teh Hijau', 
    creator: 'Tulus', 
    genre: 'Pop Indonesia', 
    mood: 'Hangat', 
    duration: '3:31', 
    musescore_url: 'https://musescore.com/user/90375058/scores/36423839', 
    source: 'MuseScore Official' 
  },
]

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>(INITIAL_LIBRARY_SONGS)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'catalog' | 'favorites'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre')
  const [favorites, setFavorites] = useState<string[]>(['yang-pergi-kamu'])
  const [downloadMenuId, setDownloadMenuId] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [songToDelete, setSongToDelete] = useState<Song | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load user generated songs, favorites, and deleted IDs from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('harkat_favorites')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }

      const deletedList: string[] = JSON.parse(localStorage.getItem('harkat_deleted_songs') || '[]')
      const userLibRaw = localStorage.getItem('harkat_user_library')
      const lastSongRaw = localStorage.getItem('harkat_last_generated_song')

      const extraSongs: Song[] = []

      const processGeneration = (gen: any) => {
        if (!gen || !gen.song) return
        const songId = gen.jobId || 'yang-pergi-kamu'
        if (deletedList.includes(songId)) return

        const existingIdx = INITIAL_LIBRARY_SONGS.findIndex(s => s.id === songId)
        
        let audioUrl = gen.song.audio_url || '/audio/yang-pergi-kamu.mp3'
        if (audioUrl.includes('sunodownload.ai')) {
          audioUrl = '/audio/yang-pergi-kamu.mp3'
        }

        const formattedSong: Song = {
          id: songId,
          title: gen.song.title || 'Lagu Tanpa Judul',
          creator: gen.song.provider || 'Harkat AI Studio',
          genre: gen.song.genre ? gen.song.genre.split(',')[0].slice(0, 30) : 'Alternative Rock',
          mood: 'AI Masterwork',
          duration: gen.song.duration ? `${Math.floor(gen.song.duration / 60)}:${(gen.song.duration % 60).toString().padStart(2, '0')}` : '6:10',
          audio_url: audioUrl,
          image_url: gen.song.image_url || '/audio/yang-pergi-kamu-cover-v1.jpg',
          pdf_url: '/audio/yang-pergi-kamu.pdf',
          musicxml_url: '/audio/yang-pergi-kamu.musicxml',
          midi_url: '/audio/yang-pergi-kamu.mid',
          chord_url: '/audio/yang-pergi-kamu-chord-sheet.txt',
          isAiGenerated: true,
          take: 'User AI Generation',
          source: 'Harkat Studio Engine',
          bpm: gen.song.bpm || 96,
          lyrics: gen.song.lyrics,
          scoreData: gen.score
        }

        if (existingIdx === -1 && !extraSongs.some(s => s.id === songId)) {
          extraSongs.push(formattedSong)
        }
      }

      if (userLibRaw) {
        const parsedLib = JSON.parse(userLibRaw)
        if (Array.isArray(parsedLib)) {
          parsedLib.forEach(processGeneration)
        }
      }

      if (lastSongRaw) {
        const parsedLast = JSON.parse(lastSongRaw)
        processGeneration(parsedLast)
      }

      const activeBase = INITIAL_LIBRARY_SONGS.filter(s => !deletedList.includes(s.id))
      setSongs([...extraSongs, ...activeBase])
    } catch (e) {
      console.warn('Error reading library storage:', e)
    }
  }, [])

  // Close download menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.download-dropdown-container')) {
        setDownloadMenuId(null)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextFavorites = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id]
    setFavorites(nextFavorites)
    try {
      localStorage.setItem('harkat_favorites', JSON.stringify(nextFavorites))
    } catch {}
  }

  const togglePlay = (song: Song) => {
    if (!song.audio_url) return
    if (playingId === song.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = song.audio_url
        audioRef.current.currentTime = 0
        setCurrentTime(0)
        void audioRef.current.play().catch(() => {
          if (audioRef.current && song.audio_url !== '/audio/yang-pergi-kamu.mp3') {
            audioRef.current.src = '/audio/yang-pergi-kamu.mp3'
            void audioRef.current.play().catch(console.error)
          }
        })
        setPlayingId(song.id)
      }
    }
  }

  const handleScoreNavigate = (song: Song) => {
    try {
      const genPayload = {
        jobId: song.id,
        status: 'completed',
        song: {
          title: song.title,
          genre: song.genre,
          bpm: song.bpm || 96,
          audio_url: song.audio_url || '/audio/yang-pergi-kamu.mp3',
          image_url: song.image_url || '/audio/yang-pergi-kamu-cover-v1.jpg',
          lyrics: song.lyrics || '',
        },
        score: song.scoreData || {
          key: 'A Minor',
          tempo: song.bpm || 96,
          meter: '4/4',
          chords: ['Am', 'G', 'F', 'E'],
          instruments: ['Vokal Pria Emo Rock', 'Clean Electric Guitar', 'Overdriven Guitar', 'Bass Melodis', 'Drum Rock']
        }
      }
      sessionStorage.setItem(`generation:${song.id}`, JSON.stringify(genPayload))
      sessionStorage.setItem('generation:yang-pergi-kamu', JSON.stringify(genPayload))
    } catch {}
  }

  const shareSong = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation()
    const shareText = `Dengarkan "${song.title}" di Harkat Studio: ${window.location.origin}/library`
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(shareText)
      setCopyFeedback(song.id)
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }

  // Delete song function
  const handleDeleteSong = (song: Song) => {
    if (playingId === song.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    }

    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem('harkat_deleted_songs') || '[]')
      if (!deletedList.includes(song.id)) {
        deletedList.push(song.id)
        localStorage.setItem('harkat_deleted_songs', JSON.stringify(deletedList))
      }

      // Remove from harkat_user_library
      const userLibRaw = localStorage.getItem('harkat_user_library')
      if (userLibRaw) {
        const parsed = JSON.parse(userLibRaw)
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((item: any) => item?.jobId !== song.id && item?.id !== song.id)
          localStorage.setItem('harkat_user_library', JSON.stringify(filtered))
        }
      }

      // Remove from favorites
      const nextFavs = favorites.filter(id => id !== song.id)
      setFavorites(nextFavs)
      localStorage.setItem('harkat_favorites', JSON.stringify(nextFavs))
    } catch (e) {
      console.warn('Error saving deleted songs:', e)
    }

    setSongs(prev => prev.filter(s => s.id !== song.id))
    setSongToDelete(null)
    setToastMessage(`Lagu "${song.title}" berhasil dihapus dari Library.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Extract unique genres for filter dropdown
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>()
    songs.forEach(song => {
      const g = song.genre.split(',')[0].trim()
      if (g) genres.add(g)
    })
    return Array.from(genres)
  }, [songs])

  // Filter songs based on tab, search query, and genre
  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      if (activeTab === 'ai' && !song.isAiGenerated) return false
      if (activeTab === 'catalog' && song.isAiGenerated) return false
      if (activeTab === 'favorites' && !favorites.includes(song.id)) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = song.title.toLowerCase().includes(query)
        const matchCreator = song.creator.toLowerCase().includes(query)
        const matchGenre = song.genre.toLowerCase().includes(query)
        const matchMood = song.mood.toLowerCase().includes(query)
        if (!matchTitle && !matchCreator && !matchGenre && !matchMood) return false
      }

      if (selectedGenre !== 'Semua Genre') {
        if (!song.genre.toLowerCase().includes(selectedGenre.toLowerCase())) return false
      }

      return true
    })
  }, [songs, activeTab, searchQuery, selectedGenre, favorites])

  const aiSongsCount = songs.filter(s => s.isAiGenerated).length
  const catalogCount = songs.filter(s => !s.isAiGenerated).length
  const featuredSong = songs.find(s => s.id === 'yang-pergi-kamu') || songs[0]

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-8">
      {/* Hidden Global Audio Player */}
      <audio
        ref={audioRef}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration)}
        onEnded={() => {
          setPlayingId(null)
          setCurrentTime(0)
        }}
        className="hidden"
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-[#161b17] px-4 py-3 text-sm text-emerald-300 shadow-2xl backdrop-blur-xl animate-fade-in-up">
          <Check size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {songToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#141416] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Hapus dari Library?</h3>
                <p className="text-xs text-gray-400">Lagu ini akan dihapus dari daftar koleksi Music Library Anda.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 mb-5 flex items-center gap-3.5">
              {songToDelete.image_url ? (
                <Image
                  src={songToDelete.image_url}
                  alt={songToDelete.title}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-xl object-cover border border-white/10"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-gray-400">
                  <Music size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">{songToDelete.title}</div>
                <div className="text-xs text-gray-400 truncate mt-0.5">{songToDelete.creator} • {songToDelete.duration}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSongToDelete(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSong(songToDelete)}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 shadow-lg shadow-red-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Ya, Hapus Lagu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Navigation & Header */}
        <header className="mb-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} /> Kembali ke Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110"
              >
                <Sparkles size={16} /> Create Lagu Baru
              </Link>
              <Logo size="sm" asLink href="/dashboard" />
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-2">
                <Disc size={13} className="animate-spin text-amber-400" />
                Harkat Master Library
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Music & Audio Library
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-1">
                Koleksi hasil generate Suno AI, karya cipta Anda, partitur not balok, dan arsip referensi musik.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Link 
                href="/studio/transcribe" 
                className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20"
              >
                <FileText size={16} /> AudioScore Studio
              </Link>
            </div>
          </div>
        </header>

        {/* Featured Card: "YANG PERGI KAMU, BUKAN HIDUPKU" (if exists and not deleted) */}
        {featuredSong && (
          <div className="mb-8 relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1a1410] via-[#121214] to-[#0d0d10] p-6 shadow-2xl">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              {/* Cover Art Artwork */}
              <div className="relative group w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0 rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl bg-black">
                {featuredSong.image_url ? (
                  <Image 
                    src={featuredSong.image_url} 
                    alt={featuredSong.title}
                    width={176}
                    height={176}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-400">
                    <Music size={48} />
                  </div>
                )}
                <button
                  onClick={() => togglePlay(featuredSong)}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95"
                  title={playingId === featuredSong.id ? 'Pause' : 'Play'}
                >
                  {playingId === featuredSong.id ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
              </div>

              {/* Info & Badges */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300">
                    <Sparkles size={13} /> Karya AI Anda (Verified Master)
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">
                    Take 1 • Durasi {featuredSong.duration}
                  </span>
                  <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-300">
                    Alternative Rock Emo Ballad
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {featuredSong.title}
                </h2>
                <p className="text-sm text-gray-400 mt-1 max-w-2xl line-clamp-2">
                  Karya asli yang baru saja digenerate menggunakan Suno AI. Tersedia master audio 320kbps MP3, partitur not balok resmi MuseScore 4, file MIDI, dan chord sheet.
                </p>

                {/* Progress bar if playing */}
                {playingId === featuredSong.id && (
                  <div className="mt-4 max-w-md">
                    <div className="flex justify-between text-xs text-amber-400 font-mono mb-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(audioDuration || 370)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={audioDuration || 370}
                      step="0.1"
                      value={currentTime}
                      onChange={(e) => {
                        const next = Number(e.target.value)
                        if (audioRef.current) audioRef.current.currentTime = next
                        setCurrentTime(next)
                      }}
                      className="h-1.5 w-full cursor-pointer accent-amber-500"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    onClick={() => togglePlay(featuredSong)}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
                  >
                    {playingId === featuredSong.id ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
                    {playingId === featuredSong.id ? 'Jeda Lagu' : 'Putar Sekarang'}
                  </button>

                  <Link
                    href={`/studio/score/${featuredSong.id}`}
                    onClick={() => handleScoreNavigate(featuredSong)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-amber-500/40"
                  >
                    <FileText size={16} className="text-amber-400" /> Buka Partitur & Chord
                  </Link>

                  <a
                    href="/audio/yang-pergi-kamu.mp3"
                    download="yang-pergi-kamu-bukan-hidupku.mp3"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Download size={16} /> Unduh MP3 Master
                  </a>

                  <a
                    href="/audio/yang-pergi-kamu.pdf"
                    download="partitur-yang-pergi-kamu.pdf"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
                  >
                    <FileText size={16} className="text-blue-400" /> Partitur PDF
                  </a>

                  {/* Delete Button on Featured Card */}
                  <button
                    onClick={() => setSongToDelete(featuredSong)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition"
                    title="Hapus lagu ini dari Library"
                  >
                    <Trash2 size={15} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs & Search Controls */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#121214] p-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Semua Lagu ({songs.length})
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'ai'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} /> Karya AI Anda ({aiSongsCount})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Katalog & Demo ({catalogCount})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'favorites'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart size={14} className={favorites.length > 0 ? 'text-red-400' : ''} /> Favorit ({favorites.length})
            </button>
          </div>

          {/* Search & Genre Inputs */}
          <div className="flex flex-1 max-w-md items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lagu, kreator, lirik..."
                className="w-full rounded-xl border border-white/10 bg-[#121214] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                aria-label="Filter berdasarkan genre lagu"
                className="appearance-none rounded-xl border border-white/10 bg-[#121214] py-2.5 pl-9 pr-8 text-xs sm:text-sm text-gray-300 focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="Semua Genre">Semua Genre</option>
                {uniqueGenres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            </div>
          </div>
        </div>

        {/* Songs List Table */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121214] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">Karya & Kreator</th>
                  <th className="p-4 hidden md:table-cell">Genre & Mood</th>
                  <th className="p-4 text-center">Durasi</th>
                  <th className="p-4 text-right">Aksi & Studio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSongs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400">
                      <Music size={40} className="mx-auto text-gray-600 mb-3" />
                      <p className="font-semibold text-gray-300">Tidak ada lagu yang cocok dengan pencarian atau filter.</p>
                      <p className="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau ganti filter tab.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSongs.map((song, index) => {
                    const isPlaying = playingId === song.id
                    const isFav = favorites.includes(song.id)
                    const isMenuOpen = downloadMenuId === song.id

                    return (
                      <tr 
                        key={song.id} 
                        className={`group transition duration-200 hover:bg-white/[0.04] ${
                          isPlaying ? 'bg-amber-500/[0.07]' : ''
                        }`}
                      >
                        {/* Number / Play Indicator */}
                        <td className="p-4 text-center text-gray-500 font-medium text-sm">
                          {isPlaying ? (
                            <div className="w-5 h-5 mx-auto flex items-end justify-center gap-[2px]">
                              <span className="w-1 bg-amber-400 h-2 animate-[pulse_0.8s_ease-in-out_infinite]" />
                              <span className="w-1 bg-amber-400 h-4 animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" />
                              <span className="w-1 bg-amber-400 h-3 animate-[pulse_0.8s_ease-in-out_infinite_0.4s]" />
                            </div>
                          ) : (
                            <span className="group-hover:hidden">{index + 1}</span>
                          )}
                          <button
                            onClick={() => togglePlay(song)}
                            disabled={!song.audio_url}
                            className={`hidden group-hover:flex items-center justify-center w-6 h-6 mx-auto rounded-full bg-white/10 hover:bg-amber-500 hover:text-black transition ${
                              isPlaying ? '!flex bg-amber-500 text-black' : 'text-gray-300'
                            }`}
                          >
                            {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                          </button>
                        </td>

                        {/* Title, Cover, Creator */}
                        <td className="p-4">
                          <div className="flex items-center gap-3.5">
                            {/* Artwork Thumbnail */}
                            <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow">
                              {song.image_url ? (
                                <Image
                                  src={song.image_url}
                                  alt={song.title}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                  <Music size={20} />
                                </div>
                              )}
                              {isPlaying && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Radio size={16} className="text-amber-400 animate-pulse" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-bold text-sm sm:text-base truncate ${isPlaying ? 'text-amber-400' : 'text-white'}`}>
                                  {song.title}
                                </span>
                                {song.isAiGenerated && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                                    <Sparkles size={10} /> Karya AI Anda
                                  </span>
                                )}
                                {song.take && (
                                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-gray-300">
                                    {song.take}
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-gray-400 truncate mt-0.5">
                                {song.creator}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                {song.source_url ? (
                                  <a href={song.source_url} target="_blank" rel="noreferrer" className="text-amber-400/90 hover:underline">
                                    Sumber resmi • {song.source || 'Apple Music'}
                                  </a>
                                ) : song.musescore_url ? (
                                  <a href={song.musescore_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:underline">
                                    <FileText size={11} /> MuseScore Official
                                  </a>
                                ) : song.youtube_url ? (
                                  <a href={song.youtube_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-red-400 hover:underline">
                                    <ExternalLink size={11} /> YouTube Resmi
                                  </a>
                                ) : (
                                  <span className="text-emerald-400/80">Siap Diputar & Diunduh</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Genre & Mood */}
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center w-fit rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-gray-300">
                              {song.genre}
                            </span>
                            <span className="text-xs text-gray-400">{song.mood}</span>
                          </div>
                        </td>

                        {/* Duration & Scrubber */}
                        <td className="p-4 text-center font-mono text-xs text-gray-400">
                          {isPlaying ? (
                            <div className="mx-auto w-24">
                              <div className="text-amber-400 font-bold">{formatTime(currentTime)} / {song.duration}</div>
                              <input
                                type="range"
                                min="0"
                                max={audioDuration || 370}
                                step="0.1"
                                value={currentTime}
                                onChange={(e) => {
                                  const next = Number(e.target.value)
                                  if (audioRef.current) audioRef.current.currentTime = next
                                  setCurrentTime(next)
                                }}
                                className="mt-1.5 h-1 w-full cursor-pointer accent-amber-500"
                              />
                            </div>
                          ) : (
                            song.duration
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Partitur & Chord Button */}
                            <Link
                              href={`/studio/score/${song.id}`}
                              onClick={() => handleScoreNavigate(song)}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
                              title="Buka Partitur Not Balok & Akor"
                            >
                              <FileText size={15} />
                              <span className="hidden xl:inline">Partitur</span>
                            </Link>

                            {/* Transcribe Button */}
                            <Link
                              href={`/studio/transcribe?audio=${encodeURIComponent(song.audio_url || '')}&title=${encodeURIComponent(song.title)}`}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 text-xs font-semibold text-purple-400 transition hover:bg-purple-500/20"
                              title="Buka di AudioScore Transcribe Studio"
                            >
                              <Mic2 size={15} />
                              <span className="hidden 2xl:inline">Transcribe</span>
                            </Link>

                            {/* Play/Pause Button */}
                            <button
                              onClick={() => togglePlay(song)}
                              disabled={!song.audio_url}
                              className={`h-9 w-9 rounded-xl flex items-center justify-center transition shadow ${
                                isPlaying
                                  ? 'bg-amber-500 text-black shadow-amber-500/30'
                                  : song.audio_url
                                  ? 'bg-white/10 hover:bg-white/20 text-white'
                                  : 'cursor-not-allowed bg-white/5 text-gray-600'
                              }`}
                              title={isPlaying ? 'Pause' : 'Play'}
                            >
                              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                            </button>

                            {/* Favorite Button */}
                            <button
                              onClick={(e) => toggleFavorite(song.id, e)}
                              className={`h-9 w-9 rounded-xl flex items-center justify-center border transition ${
                                isFav
                                  ? 'border-red-500/40 bg-red-500/20 text-red-400'
                                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                              }`}
                              title={isFav ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                            >
                              <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                            </button>

                            {/* Download Dropdown */}
                            <div className="relative download-dropdown-container">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDownloadMenuId(isMenuOpen ? null : song.id)
                                }}
                                className={`h-9 w-9 rounded-xl flex items-center justify-center border transition ${
                                  isMenuOpen
                                    ? 'border-amber-500 bg-amber-500 text-black'
                                    : 'border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                                title="Opsi Unduh Master & Partitur"
                              >
                                <Download size={16} />
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-white/15 bg-[#18181c] p-2 shadow-2xl backdrop-blur-xl animate-fade-in-up">
                                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                                    <div className="text-xs font-bold text-white truncate">{song.title}</div>
                                    <div className="text-[10px] text-amber-400">Pilih format berkas unduhan:</div>
                                  </div>

                                  <div className="flex flex-col gap-1 text-xs">
                                    {song.audio_url && (
                                      <a
                                        href={song.audio_url}
                                        download={`${song.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mp3`}
                                        onClick={() => setDownloadMenuId(null)}
                                        className="flex items-center justify-between rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition"
                                      >
                                        <span className="flex items-center gap-2">
                                          <Music size={14} className="text-amber-400" /> Audio Master (MP3 320k)
                                        </span>
                                        <Download size={12} className="text-gray-500" />
                                      </a>
                                    )}

                                    {song.isAiGenerated && (
                                      <a
                                        href="/audio/yang-pergi-kamu.wav"
                                        download={`${song.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-master.wav`}
                                        onClick={() => setDownloadMenuId(null)}
                                        className="flex items-center justify-between rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition"
                                      >
                                        <span className="flex items-center gap-2">
                                          <Disc size={14} className="text-amber-400" /> Master WAV (24-bit)
                                        </span>
                                        <Download size={12} className="text-gray-500" />
                                      </a>
                                    )}

                                    <a
                                      href={song.pdf_url || '/audio/yang-pergi-kamu.pdf'}
                                      download={`partitur-${song.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
                                      onClick={() => setDownloadMenuId(null)}
                                      className="flex items-center justify-between rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition"
                                    >
                                      <span className="flex items-center gap-2">
                                        <FileText size={14} className="text-blue-400" /> Partitur Not Balok (PDF)
                                      </span>
                                      <Download size={12} className="text-gray-500" />
                                    </a>

                                    <a
                                      href={song.musicxml_url || '/audio/yang-pergi-kamu.musicxml'}
                                      download={`${song.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.musicxml`}
                                      onClick={() => setDownloadMenuId(null)}
                                      className="flex items-center justify-between rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition"
                                    >
                                      <span className="flex items-center gap-2">
                                        <FileText size={14} className="text-purple-400" /> Digital Sheet (MusicXML)
                                      </span>
                                      <Download size={12} className="text-gray-500" />
                                    </a>

                                    <a
                                      href={song.midi_url || '/audio/yang-pergi-kamu.mid'}
                                      download={`${song.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mid`}
                                      onClick={() => setDownloadMenuId(null)}
                                      className="flex items-center justify-between rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition"
                                    >
                                      <span className="flex items-center gap-2">
                                        <Music size={14} className="text-emerald-400" /> File MIDI (.mid)
                                      </span>
                                      <Download size={12} className="text-gray-500" />
                                    </a>

                                    <a
                                      href={song.chord_url || '/audio/yang-pergi-kamu-chord-sheet.txt'}
                                      download={`chord-${song.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`}
                                      onClick={() => setDownloadMenuId(null)}
                                      className="flex items-center justify-between rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition"
                                    >
                                      <span className="flex items-center gap-2">
                                        <FileText size={14} className="text-yellow-400" /> Lirik & Panduan Akor (.txt)
                                      </span>
                                      <Download size={12} className="text-gray-500" />
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Share Button */}
                            <button
                              onClick={(e) => shareSong(song, e)}
                              className="h-9 w-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                              title="Salin Tautan Lagu"
                            >
                              {copyFeedback === song.id ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSongToDelete(song)
                              }}
                              className="h-9 w-9 rounded-xl flex items-center justify-center border border-red-500/20 bg-red-500/5 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition shadow-sm"
                              title="Hapus lagu dari Library"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Sinkronisasi Studio Otomatis</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Setiap lagu yang digenerate di Harkat Studio otomatis tersimpan di Library ini, lengkap dengan partitur not balok dan chord.
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Generate Lagu Lainnya <ArrowLeft size={14} className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  )
}
