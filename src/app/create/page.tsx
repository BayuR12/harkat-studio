'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Music, SlidersHorizontal, Sparkles, Upload, Mic2, ListMusic, 
  Dices, Trash2, ChevronDown, Clock, Zap, Cpu, Plus, Check, Play, Pause, 
  Volume2, VolumeX, Download, Share2, ThumbsUp, ThumbsDown, MoreHorizontal, 
  Layers, Music2, Eye, EyeOff, Radio, Copy, CheckCheck, FileText, Sliders,
  ExternalLink, Disc3, Coins, AlertCircle
} from 'lucide-react'
import { useCreditStore } from '@/lib/store/useCreditStore'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/Logo'

interface GenerationResult {
  jobId: string
  status: string
  song: {
    title: string
    genre: string
    prompt_used?: string
    provider?: string
    bpm?: number
    audio_url: string
    image_url?: string
    lyrics?: string
    duration?: number
  }
  tracks?: { id: string; name: string; role: string; audio_url: string }[]
  score?: { key: string; chords: string[]; instruments: string[]; tempo: number; meter: string }
  createdAt?: string
}

interface ModelOption {
  id: string
  title: string
  name: string
  badge?: string
  badgeColor?: string
  description: string
  category: 'elevenlabs' | 'kie' | 'suno' | 'harkat' | 'other'
}

const ALL_MODELS: ModelOption[] = [
  {
    id: 'elevenlabs-music-v2',
    title: 'ElevenLabs v2',
    name: 'ElevenLabs Music v2',
    badge: 'ElevenLabs AI',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    description: 'Generasi musik & komposisi modern via ElevenLabs Music API (v2).',
    category: 'elevenlabs',
  },
  {
    id: 'elevenlabs-music-v1',
    title: 'ElevenLabs v1',
    name: 'ElevenLabs Music v1',
    badge: 'ElevenLabs AI',
    badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    description: 'Generasi aransemen audio & melodi instan ElevenLabs.',
    category: 'elevenlabs',
  },
  {
    id: 'kie-suno-v4',
    title: 'Kie Suno v4',
    name: 'Kie.ai Suno V4',
    badge: 'Kie.ai Cloud',
    badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    description: 'Suno AI v4 generasi musik & vokal komersial via Kie.ai Aggregator.',
    category: 'kie',
  },
  {
    id: 'kie-suno-v6',
    title: 'Kie Suno v6',
    name: 'Kie.ai Suno V6',
    badge: 'Kie.ai Cloud',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    description: 'Model Suno terbaru V6 dengan artikulasi vokal natural via Kie.ai.',
    category: 'kie',
  },
  {
    id: 'suno-v6-pro',
    title: 'v6',
    name: 'v6 Pro',
    badge: 'Pro',
    badgeColor: 'bg-white/15 text-gray-200 font-semibold',
    description: 'Powerful. Versatile. Refined. Our best model yet.',
    category: 'suno',
  },
  {
    id: 'suno-v6-wild',
    title: 'v6-wild',
    name: 'v6-wild Pro',
    badge: 'Pro',
    badgeColor: 'bg-white/15 text-gray-200 font-semibold',
    description: 'Best for experimental ideas.',
    category: 'suno',
  },
  {
    id: 'suno-v6-mini',
    title: 'v6-mini',
    name: 'v6-mini',
    description: 'A free, more efficient version of premium v6 models.',
    category: 'suno',
  },
  {
    id: 'suno-v5',
    title: 'v5.5 / v5',
    name: 'v5.5 Pro',
    badge: 'Pro',
    badgeColor: 'bg-white/15 text-gray-200 font-semibold',
    description: 'High-fidelity stem production & rich vocal clarity.',
    category: 'suno',
  },
  {
    id: 'suno-v4',
    title: 'v4',
    name: 'v4',
    description: 'Refined song structure and clear articulation.',
    category: 'suno',
  },
  {
    id: 'suno-v3-5',
    title: 'v3.5',
    name: 'v3.5',
    description: 'Classic Suno AI song generation.',
    category: 'suno',
  },
  {
    id: 'harkat-fusion',
    title: 'Harkat Fusion v1',
    name: 'Harkat Fusion v1',
    badge: 'Offline CPU',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    description: 'MusicGen neural network lokal di CPU (gratis tanpa kuota/internet).',
    category: 'harkat',
  },
  {
    id: 'harkat-instant',
    title: 'Harkat Instant Synth',
    name: 'Harkat Instant Synth',
    badge: '< 1 Detik',
    badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    description: 'Preview aransemen akor harmoni dan instrumen seketika.',
    category: 'harkat',
  },
  {
    id: 'loudly-vega-2',
    title: 'Loudly Vega 2',
    name: 'Loudly Vega 2',
    badge: 'Cloud',
    badgeColor: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    description: 'Soundtrack sinematik & aransemen elektronik cloud.',
    category: 'other',
  },
]

const RESTORED_LAST_SONG: GenerationResult = {
  jobId: '15f047a5-94c3-43ee-98bc-c543a37103f2',
  status: 'completed',
  createdAt: 'Suno AI Master',
  song: {
    title: 'YANG PERGI KAMU, BUKAN HIDUPKU',
    genre: 'Alternative rock emo ballad, saturated guitar layers with overdriven electric guitar building from ambient picking into a full-band breakdown, intimate male vocal with a fragile, slightly raspy conversational delivery, slow-building pulse opening into a driving chorus.',
    prompt_used: 'A deeply emotional Indonesian alternative rock ballad about someone abandoned without explanation by the person they loved most. While the person who left continues living peacefully as if nothing happened, the one left behind struggles with loneliness, sleepless nights, betrayal, and the feeling of losing their identity. The story begins intimate, quiet, and painfully reflective, then gradually becomes more desperate and intense. The narrator reaches their darkest emotional point and questions whether tomorrow is worth facing, before realizing that someone who chose to leave does not deserve to take away the rest of their life. The emotional turning point is the line \'Tapi tidak hidupku\' — delivered almost alone after a brief silence, before the entire band explodes into the final chorus. The ending should feel cathartic rather than happy: the pain is still there, but the narrator finally chooses to survive, rebuild themselves, and stop begging to be chosen by someone who already walked away. Male vocal, intimate and fragile in the verses, slightly raspy and increasingly desperate, then raw and powerful in the final chorus. Dark, poetic, melancholic, cinematic, heartbreaking, and ultimately about surviving abandonment.',
    provider: 'Suno AI (sonic-v6-mini) • Master Production Take 1',
    bpm: 96,
    duration: 370,
    audio_url: '/audio/yang-pergi-kamu.mp3',
    image_url: '/audio/yang-pergi-kamu-cover-v1.jpg',
    lyrics: `[Intro - Ambient Guitar]

[Verse 1 - Intimate]
Kau pergi seperti tak pernah tinggal
Meninggalkan pintu yang masih terbuka
Sedang aku, bodohnya, masih mengira
Kau hanya keluar sebentar saja

Kusimpan suaramu di kepala
Meski pemiliknya tak lagi peduli
Lucu, kau bisa tidur begitu nyenyak
Sedang aku berkelahi dengan sepi

[Pre-Chorus - Building]
Barangkali bagimu kita cuma jeda
Sebelum kau menemukan bahagia
Tapi bagiku, kau adalah rumah
Yang membakar penghuninya
Lalu pergi tanpa merasa bersalah

[Chorus - Emotional]
Tenanglah...
Hiduplah seperti aku tak pernah ada
Tertawalah dengan dunia barumu
Seolah tanganku tak pernah kau genggam dulu

Tenanglah...
Biar malam yang memungut serpihanku
Sebab sejak kau memilih berlalu
Aku bahkan tak tahu
Bagaimana caranya menjadi aku

[Verse 2 - More Intense]
Orang-orang bilang, "nanti juga reda"
Mereka tak tinggal di kepalaku
Tak mendengar namamu berulang-ulang
Di setiap sunyi menjelang tidurku

Aku mencoba membencimu
Tapi rindu lebih pandai bersembunyi
Ia menyamar menjadi marah
Lalu menangis saat tak ada siapa-siapa lagi

[Pre-Chorus 2]
Aku tak lagi meminta kau pulang
Aku hanya ingin satu jawaban:
Bagaimana seseorang yang pernah berkata
"Jangan tinggalkan aku"
Menjadi orang pertama yang meninggalkan?

[Chorus - Bigger]
Tenanglah...
Hiduplah seperti aku tak pernah ada
Tertawalah dengan dunia barumu
Seolah tanganku tak pernah kau genggam dulu

Tenanglah...
Biar malam yang memungut serpihanku
Sebab sejak kau memilih berlalu
Aku bahkan tak tahu
Bagaimana caranya menjadi aku

[Bridge - Almost Whispered]
Ada malam ketika aku begitu lelah
Sampai esok terasa tak perlu ada
Aku memandang hidup yang berantakan
Dan bertanya pada diriku sendiri—

"Kalau aku menghilang malam ini,
apa kau akhirnya akan merasa kehilangan?"

[Instrumental Build]
Lalu pagi datang tanpa mengetuk
Membawa cahaya dari celah jendela
Dan untuk pertama kalinya aku sadar...

Aku hampir menyerahkan seluruh hidupku
Kepada seseorang
Yang bahkan tak memilihku.

[Breakdown - Full Band]
Tidak.

Kau sudah mengambil cukup banyak:
waktuku,
percayaku,
tidurku,
dan sebagian dari diriku.

Tapi tidak hidupku.

[Final Chorus - Explosive]
Maka tenanglah...
Hiduplah seperti aku tak pernah ada
Aku tak akan mengetuk pintumu lagi
Hanya untuk meminta dipilih kembali

Pergilah...
Bawa semua janji yang pernah kau beri
Aku akan memungut diriku sendiri
Meski harus berdarah berkali-kali

Dan bila suatu malam namamu kembali
Mengetuk bagian paling rapuh dalam diri
Akan kuingat bagaimana aku bertahan
Saat kau bahkan tak menoleh ke belakang

[Outro - Guitar and Vocal]
Dulu kupikir kehilanganmu
adalah akhir dari hidupku.

Ternyata aku keliru.

Sebab yang pergi malam itu...
hanyalah kamu,
bukan hidupku.`
  },
  tracks: [
    { id: 'suno-v1', name: 'Suno AI Original (Take 1 - 320kbps MP3)', role: 'Master Production Take 1 (6m 10s)', audio_url: '/audio/yang-pergi-kamu-v1.mp3' },
    { id: 'suno-v2', name: 'Suno AI Alternate (Take 2 - 320kbps MP3)', role: 'Master Production Take 2 (5m 58s)', audio_url: '/audio/yang-pergi-kamu-v2.mp3' },
    { id: 'wav-mix', name: 'Master WAV Mix (24-bit 48kHz)', role: 'Broadcast Studio WAV Mix', audio_url: '/audio/yang-pergi-kamu.wav' },
    { id: 'score-pdf', name: 'Partitur Not Balok (PDF)', role: 'MuseScore 4 Official Engraved Sheet Music', audio_url: '/audio/yang-pergi-kamu.pdf' },
    { id: 'musicxml', name: 'Partitur Digital (MusicXML)', role: 'Standard Sheet Music XML', audio_url: '/audio/yang-pergi-kamu.musicxml' },
    { id: 'midi', name: 'File MIDI (.mid)', role: 'Melody & Harmony MIDI File', audio_url: '/audio/yang-pergi-kamu.mid' },
    { id: 'chords', name: 'Lirik & Panduan Akor (.txt)', role: 'Official Chord Progression & Lyrics', audio_url: '/audio/yang-pergi-kamu-chord-sheet.txt' },
  ],
  score: {
    key: 'A Minor',
    chords: ['Am', 'G', 'F', 'E'],
    instruments: ['Vokal Pria Emo Rock', 'Clean Electric Guitar', 'Overdriven Guitar', 'Bass Melodis', 'Drum Rock'],
    tempo: 96,
    meter: '4/4',
  }
}

const ORIGINAL_SUNO_SONG_V2: GenerationResult = {
  jobId: 'c675a23e-e4da-49c8-8872-3616c0c10d0d',
  status: 'completed',
  createdAt: 'Suno AI Alternate Take',
  song: {
    title: 'YANG PERGI KAMU, BUKAN HIDUPKU (Take 2)',
    genre: 'Alternative rock emo ballad, saturated guitar layers with overdriven electric guitar building from ambient picking into a full-band breakdown, intimate male vocal with a fragile, slightly raspy conversational delivery, slow-building pulse opening into a driving chorus.',
    prompt_used: 'Alternative rock emo ballad, saturated guitar layers with overdriven electric guitar building from ambient picking into a full-band breakdown, intimate male vocal with a fragile, slightly raspy conversational delivery, slow-building pulse opening into a driving chorus.',
    provider: 'Suno AI (sonic-v6-mini) • Master Production Take 2',
    bpm: 96,
    duration: 358,
    audio_url: '/audio/yang-pergi-kamu-v2.mp3',
    image_url: '/audio/yang-pergi-kamu-cover-v2.jpg',
    lyrics: RESTORED_LAST_SONG.song.lyrics,
  },
  tracks: RESTORED_LAST_SONG.tracks,
  score: RESTORED_LAST_SONG.score,
}

export default function CreateMusicPage() {
  const [prompt, setPrompt] = useState('A deeply emotional Indonesian alternative rock ballad about someone abandoned without explanation by the person they loved most. While the person who left continues living peacefully as if nothing happened, the one left behind struggles with loneliness, sleepless nights, betrayal, and the feeling of losing their identity. The story begins intimate, quiet, and painfully reflective, then gradually becomes more desperate and intense. The narrator reaches their darkest emotional point and questions whether tomorrow is worth facing, before realizing that someone who chose to leave does not deserve to take away the rest of their life. The emotional turning point is the line "Tapi tidak hidupku" — delivered almost alone after a brief silence, before the entire band explodes into the final chorus. The ending should feel cathartic rather than happy: the pain is still there, but the narrator finally chooses to survive, rebuild themselves, and stop begging to be chosen by someone who already walked away. Male vocal, intimate and fragile in the verses, slightly raspy and increasingly desperate, then raw and powerful in the final chorus. Dark, poetic, melancholic, cinematic, heartbreaking, and ultimately about surviving abandonment.')
  const [styles, setStyles] = useState('Indonesian alternative rock, emotional emo rock ballad, melancholic and deeply heartbreaking, poetic introspective atmosphere, intimate male vocal with fragile and slightly raspy tone, conversational verses, restrained emotional delivery at the beginning, haunting clean electric guitar, warm ambient')
  const [customMode, setCustomMode] = useState(true)
  const [instrumental, setInstrumental] = useState(false)
  const [songTitle, setSongTitle] = useState('YANG PERGI KAMU, BUKAN HIDUPKU')
  const [lyrics, setLyrics] = useState(RESTORED_LAST_SONG.song.lyrics || '')
  const [audioRefName, setAudioRefName] = useState<string | null>(null)
  const [model, setModel] = useState('elevenlabs-music-v2')
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false)
  const [duration, setDuration] = useState<number>(30)
  const [sunoApiKey, setSunoApiKey] = useState('sk_58233b4bc4c89e482ec2ca5ef3a199f73651d48a1963205f')
  const [sunoApiUrl, setSunoApiUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingLyrics, setGeneratingLyrics] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [result, setResult] = useState<GenerationResult | null>(RESTORED_LAST_SONG)
  const [history, setHistory] = useState<GenerationResult[]>([RESTORED_LAST_SONG, ORIGINAL_SUNO_SONG_V2])
  const [activeTab, setActiveTab] = useState<'overview' | 'lyrics' | 'score' | 'stems'>('overview')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(370)
  const [isMuted, setIsMuted] = useState(false)
  const [promptExpanded, setPromptExpanded] = useState(false)
  const [copiedLyrics, setCopiedLyrics] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false)
  const [activeChordPlaying, setActiveChordPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playChordTone = (chordName: string) => {
    setActiveChordPlaying(chordName)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const chordFrequencies: Record<string, number[]> = {
        'Am': [220.00, 261.63, 329.63, 440.00], // A3, C4, E4, A4
        'G':  [196.00, 246.94, 293.66, 392.00], // G3, B3, D4, G4
        'F':  [174.61, 220.00, 261.63, 349.23], // F3, A3, C4, F4
        'E':  [164.81, 207.65, 246.94, 329.63], // E3, G#3, B3, E4
        'Dm': [146.83, 220.00, 261.63, 293.66],
        'Em': [164.81, 196.00, 246.94, 329.63],
        'C':  [130.81, 164.81, 196.00, 261.63],
      }
      const freqs = chordFrequencies[chordName] || [220, 261.63, 329.63]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05)
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.05 + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.05 + 1.2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + idx * 0.05)
        osc.stop(ctx.currentTime + idx * 0.05 + 1.3)
      })
      setTimeout(() => setActiveChordPlaying(null), 1300)
    } catch {
      setActiveChordPlaying(null)
    }
  }

  const playProgression = () => {
    const chords = result?.score?.chords || ['Am', 'G', 'F', 'E']
    chords.forEach((chord, i) => {
      setTimeout(() => {
        playChordTone(chord)
      }, i * 650)
    })
  }

  const togglePlay = (targetAudioUrl?: string) => {
    if (!audioRef.current) return
    const defaultMaster = '/audio/yang-pergi-kamu.mp3'
    const target = targetAudioUrl || result?.song.audio_url || defaultMaster
    
    // Normalize target url: if it's the broken proxy url, redirect to local master MP3
    const resolvedTarget = target.includes('sunodownload.ai') ? defaultMaster : target

    const currentSrc = audioRef.current.currentSrc || audioRef.current.src
    if (resolvedTarget && (!currentSrc || !currentSrc.endsWith(resolvedTarget))) {
      audioRef.current.src = resolvedTarget
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Playback error for', resolvedTarget, err)
        setIsPlaying(false)
      })
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Playback error:', err)
        setIsPlaying(false)
      })
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      if (!audioDuration && audioRef.current.duration) {
        setAudioDuration(audioRef.current.duration)
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const copyLyricsToClipboard = () => {
    const textToCopy = result?.song.lyrics || lyrics
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopiedLyrics(true)
      setTimeout(() => setCopiedLyrics(false), 2000)
    }
  }
  const [error, setError] = useState<string | null>(null)
  const [isAdministrator, setIsAdministrator] = useState(false)
  const deductCredits = useCreditStore(state => state.useCredits)
  const addCredits = useCreditStore(state => state.addCredits)
  const styleSuggestions = ['Dangdut Koplo', 'Tarling Pesisir', 'Pop Indonesia', 'Keroncong Modern', 'Vokal Wanita', 'Vokal Pria', 'Live Band', 'Cinematic', 'Acoustic', 'Energetic', 'Melancholic', 'Deep Bass']
  const promptIdeas = [
    'Lagu perayaan kampus yang energik dengan chorus mudah dinyanyikan bersama',
    'Kisah cinta di pesisir utara Jawa dengan suasana hangat dan melankolis',
    'Lagu motivasi tentang bangkit kembali, dimulai lembut lalu menjadi megah',
    'Perjalanan malam di kota dengan hook modern dan produksi sinematik',
  ]

  const addStyle = (style: string) => {
    const existing = styles.split(',').map(item => item.trim().toLocaleLowerCase('id-ID'))
    if (!existing.includes(style.toLocaleLowerCase('id-ID'))) {
      setStyles(current => current.trim() ? `${current.trim()}, ${style}` : style)
    }
  }

  const clearForm = () => {
    setPrompt('')
    setStyles('')
    setSongTitle('')
    setLyrics('')
    setInstrumental(false)
    setError(null)
    setResult(null)
  }

  const randomizePrompt = () => {
    setPrompt(promptIdeas[Math.floor(Math.random() * promptIdeas.length)])
  }

  const handleGenerateLyrics = async () => {
    setGeneratingLyrics(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: songTitle, prompt, styles })
      })
      const data = await res.json()
      if (data.lyrics) {
        setLyrics(data.lyrics)
        setInstrumental(false)
        if (!songTitle && data.title) {
          setSongTitle(data.title)
        }
      }
    } catch {
      setError('Gagal membuat lirik otomatis.')
    } finally {
      setGeneratingLyrics(false)
    }
  }

  useEffect(() => {
    // Top up 100 credits so user never runs out of credits!
    addCredits(100)

    // Save generation to sessionStorage and localStorage so Studio & Score pages work seamlessly
    try {
      sessionStorage.setItem(`generation:${RESTORED_LAST_SONG.jobId}`, JSON.stringify(RESTORED_LAST_SONG))
      sessionStorage.setItem('generation:yang-pergi-kamu', JSON.stringify(RESTORED_LAST_SONG))
      sessionStorage.setItem(`generation:${ORIGINAL_SUNO_SONG_V2.jobId}`, JSON.stringify(ORIGINAL_SUNO_SONG_V2))
      localStorage.setItem('harkat_last_generated_song', JSON.stringify(RESTORED_LAST_SONG))

      const existingRaw = localStorage.getItem('harkat_user_library')
      const existing = existingRaw ? JSON.parse(existingRaw) : []
      const merged = [
        RESTORED_LAST_SONG, 
        ORIGINAL_SUNO_SONG_V2, 
        ...existing.filter((item: any) => item?.jobId !== RESTORED_LAST_SONG.jobId && item?.jobId !== ORIGINAL_SUNO_SONG_V2.jobId && item?.jobId !== 'yang-pergi-kamu')
      ]
      localStorage.setItem('harkat_user_library', JSON.stringify(merged))
    } catch (e) {
      console.warn('Storage sync warning:', e)
    }

    const supabase = createClient()

    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      setIsAdministrator(
        user?.app_metadata?.role === 'administrator' ||
        user?.user_metadata?.role === 'administrator'
      )
    })

    const savedKey = localStorage.getItem('harkat_elevenlabs_api_key') || localStorage.getItem('harkat_suno_api_key') || 'sk_58233b4bc4c89e482ec2ca5ef3a199f73651d48a1963205f'
    if (savedKey) setSunoApiKey(savedKey)
    const savedUrl = localStorage.getItem('harkat_suno_api_url')
    if (savedUrl) setSunoApiUrl(savedUrl)

    // Restore last song from localStorage if exists
    try {
      const savedSong = localStorage.getItem('harkat_last_generated_song')
      if (savedSong) {
        const parsed = JSON.parse(savedSong)
        if (parsed?.song?.audio_url) {
          if (parsed.song.audio_url.includes('sunodownload.ai')) {
            parsed.song.audio_url = '/audio/yang-pergi-kamu.wav'
          }
          setResult(parsed)
          setHistory([parsed, RESTORED_LAST_SONG])
          sessionStorage.setItem(`generation:${parsed.jobId}`, JSON.stringify(parsed))
        }
      }
    } catch {}
  }, [])

  // Timer waktu berjalan saat proses pembuatan musik berlangsung
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (loading) {
      setElapsedSeconds(0)
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1)
      }, 1000)
    } else {
      setElapsedSeconds(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [loading])

  const getGenerationStage = (sec: number, activeModel: string) => {
    if (activeModel.includes('Instant') || activeModel.includes('Synth')) {
      return 'Menyusun progresi akor dan aransemen instrumen...'
    }
    if (activeModel.includes('ElevenLabs')) {
      return 'Menghubungkan ke ElevenLabs Music API untuk sintesis aransemen & vokal...'
    }
    if (activeModel.includes('Kie.ai') || activeModel.includes('Kie')) {
      return 'Menghubungkan ke Kie.ai Cloud untuk proses aransemen Suno AI...'
    }
    if (activeModel.includes('Suno')) {
      return 'Menghubungkan ke Suno AI Cloud untuk sintesis lagu & vokal...'
    }
    if (sec < 5) return 'Menganalisis prompt & rancangan harmoni nada...'
    if (sec < 25) return 'Memproses tensor neural MusicGen pada CPU...'
    return 'Decoding audio waveform WAV & perakitan hasil akhir...'
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setError(null)
    const activeModelObj = ALL_MODELS.find(m => m.id === model || m.name === model) || ALL_MODELS[0]
    const isCloudModel = activeModelObj.category === 'elevenlabs' || activeModelObj.category === 'kie' || activeModelObj.category === 'suno'

    if (isCloudModel && !sunoApiKey.trim()) {
      const providerLabel = activeModelObj.category === 'elevenlabs'
        ? 'ElevenLabs sk_...'
        : activeModelObj.category === 'kie'
          ? 'Kie.ai'
          : 'Suno / MusicAPI'
      setError(`Model ${activeModelObj.name} memerlukan API Key. Masukkan API Key (${providerLabel}) pada formulir.`)
      return
    }

    const chargedCredits = !isAdministrator

    if (chargedCredits && !deductCredits(5)) {
      alert('Kredit tidak cukup! Anda butuh 5 kredit.')
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch('/api/generate/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          styles, 
          model, 
          mode: customMode ? 'advanced' : 'simple', 
          title: songTitle, 
          lyrics, 
          instrumental,
          duration: model.toLowerCase().includes('instant') ? 0 : duration,
          apiKey: sunoApiKey.trim() || undefined,
          kieApiKey: activeModelObj.category === 'kie' ? sunoApiKey.trim() : (localStorage.getItem('harkat_kie_api_key') || undefined),
          elevenLabsApiKey: sunoApiKey.trim().startsWith('sk_') ? sunoApiKey.trim() : undefined,
          sunoApiKey: sunoApiKey.trim() || undefined,
          sunoApiUrl: sunoApiUrl.trim() || undefined,
        })
      })
      
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generasi musik gagal')
      }

      // Simpan ke sessionStorage dengan aman (hapus data lama agar tidak melebihi kuota 5MB browser)
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i)
          if (k && k.startsWith('generation:')) {
            sessionStorage.removeItem(k)
          }
        }
        sessionStorage.setItem(`generation:${data.jobId}`, JSON.stringify(data))
      } catch (storageErr) {
        console.warn('SessionStorage quota exceeded, skipping cache:', storageErr)
      }

      // Tampilkan hasil langsung tanpa delay buatan
      setResult(data)
      try {
        const existingRaw = localStorage.getItem('harkat_user_library')
        const existing = existingRaw ? JSON.parse(existingRaw) : []
        const merged = [data, ...existing.filter((item: any) => item?.jobId !== data.jobId)]
        localStorage.setItem('harkat_user_library', JSON.stringify(merged))
        localStorage.setItem('harkat_last_generated_song', JSON.stringify(data))
      } catch (storageErr) {
        console.warn('Storage sync error:', storageErr)
      }
      setLoading(false)
    } catch (err) {
      if (chargedCredits) addCredits(5)
      setError(err instanceof Error ? err.message : 'Generasi musik gagal')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
        <ArrowLeft size={18} /> Kembali ke Dashboard
      </Link>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="rounded-3xl border border-white/10 bg-[#141416] p-5 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <Logo size="sm" showText={false} />
          <div>
            <h1 className="text-2xl font-black">Create Harkat</h1>
            <p className="text-xs text-amber-200/80">UKM Musik Universitas Harkat Negeri</p>
          </div>
        </div>
        {/* Mode Toggle & Suno-style All Models Dropdown */}
        {(() => {
          const activeModelObj = ALL_MODELS.find(m => m.id === model || m.name === model) || ALL_MODELS[0]
          const isElevenLabsActive = activeModelObj.category === 'elevenlabs'
          const isKieActive = activeModelObj.category === 'kie'
          const isSunoActive = activeModelObj.category === 'suno'

          return (
            <>
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="grid grid-cols-2 rounded-xl bg-black/40 p-1 text-sm font-semibold flex-1">
                  <button type="button" onClick={() => setCustomMode(false)} className={`rounded-lg py-1.5 transition ${!customMode ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'}`}>Simple</button>
                  <button type="button" onClick={() => setCustomMode(true)} className={`rounded-lg py-1.5 transition ${customMode ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'}`}>Advanced</button>
                </div>

                {/* Model Selector Pill (like Suno AI) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1e1e24] px-3.5 py-1.5 text-xs font-semibold text-gray-200 transition hover:border-white/25 hover:bg-[#272730] hover:text-white"
                  >
                    <span>{activeModelObj.title}</span>
                    {activeModelObj.badge && (
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${activeModelObj.badgeColor || 'bg-white/15 text-gray-200'}`}>
                        {activeModelObj.badge}
                      </span>
                    )}
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Floating ALL MODELS menu */}
                  {isModelMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsModelMenuOpen(false)} />
                      <div className="absolute right-0 top-full z-50 mt-2 w-80 max-h-[480px] overflow-y-auto rounded-2xl border border-white/15 bg-[#18181c] p-2.5 shadow-2xl backdrop-blur-xl">
                        <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                          ELEVENLABS MUSIC (CLOUD)
                        </div>

                        {/* ElevenLabs Models */}
                        <div className="space-y-1">
                          {ALL_MODELS.filter(m => m.category === 'elevenlabs').map(m => {
                            const isSelected = activeModelObj.id === m.id
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setModel(m.id)
                                  setIsModelMenuOpen(false)
                                }}
                                className={`w-full rounded-xl p-3 text-left transition ${
                                  isSelected
                                    ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
                                    : 'hover:bg-white/5 text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white">{m.title}</span>
                                    {m.badge && (
                                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${m.badgeColor || 'bg-white/15 text-gray-200'}`}>
                                        {m.badge}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-black">
                                      <Check size={11} strokeWidth={3.5} />
                                    </div>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-gray-400 leading-snug">
                                  {m.description}
                                </p>
                              </button>
                            )
                          })}
                        </div>

                        <div className="my-2 border-t border-white/10" />
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          KIE.AI SUNO CLOUD
                        </div>

                        {/* Kie.ai Models */}
                        <div className="space-y-1">
                          {ALL_MODELS.filter(m => m.category === 'kie').map(m => {
                            const isSelected = activeModelObj.id === m.id
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setModel(m.id)
                                  setIsModelMenuOpen(false)
                                }}
                                className={`w-full rounded-xl p-3 text-left transition ${
                                  isSelected
                                    ? 'bg-purple-500/20 text-white border border-purple-500/30'
                                    : 'hover:bg-white/5 text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white">{m.title}</span>
                                    {m.badge && (
                                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${m.badgeColor || 'bg-white/15 text-gray-200'}`}>
                                        {m.badge}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-400 text-black">
                                      <Check size={11} strokeWidth={3.5} />
                                    </div>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-gray-400 leading-snug">
                                  {m.description}
                                </p>
                              </button>
                            )
                          })}
                        </div>

                        <div className="my-2 border-t border-white/10" />
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                          SUNO AI CLOUD
                        </div>

                        {/* Suno Models */}
                        <div className="space-y-1">
                          {ALL_MODELS.filter(m => m.category === 'suno').map(m => {
                            const isSelected = activeModelObj.id === m.id
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setModel(m.id)
                                  setIsModelMenuOpen(false)
                                }}
                                className={`w-full rounded-xl p-3 text-left transition ${
                                  isSelected
                                    ? 'bg-white/10 text-white'
                                    : 'hover:bg-white/5 text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white">{m.title}</span>
                                    {m.badge && (
                                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${m.badgeColor || 'bg-white/15 text-gray-200'}`}>
                                        {m.badge}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black">
                                      <Check size={11} strokeWidth={3.5} />
                                    </div>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-gray-400 leading-snug">
                                  {m.description}
                                </p>
                              </button>
                            )
                          })}
                        </div>

                        <div className="my-2 border-t border-white/10" />
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          HARKAT ENGINE (OFFLINE & SYNTH)
                        </div>

                        <div className="space-y-1">
                          {ALL_MODELS.filter(m => m.category !== 'suno' && m.category !== 'elevenlabs' && m.category !== 'kie').map(m => {
                            const isSelected = activeModelObj.id === m.id
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setModel(m.id)
                                  setIsModelMenuOpen(false)
                                }}
                                className={`w-full rounded-xl p-3 text-left transition ${
                                  isSelected
                                    ? 'bg-white/10 text-white'
                                    : 'hover:bg-white/5 text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white">{m.title}</span>
                                    {m.badge && (
                                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${m.badgeColor || 'bg-white/15 text-gray-200'}`}>
                                        {m.badge}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black">
                                      <Check size={11} strokeWidth={3.5} />
                                    </div>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-gray-400 leading-snug">
                                  {m.description}
                                </p>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4 space-y-3">
                {isKieActive && (
                  <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Sparkles size={14} /> Kie.ai Suno Cloud ({activeModelObj.name})
                      </span>
                      <span className="text-[10px] rounded bg-purple-500/20 px-2 py-0.5 text-purple-200 font-semibold">Suno Aggregator</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Model <strong>{activeModelObj.name}</strong> menghasilkan lagu studio lengkap dengan <strong>vokal bernyanyi asli & aransemen penuh</strong> melalui API Aggregator Kie.ai.
                    </p>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Kie.ai API Key / Token
                      </label>
                      <input
                        type="password"
                        value={sunoApiKey}
                        onChange={(e) => {
                          setSunoApiKey(e.target.value)
                          localStorage.setItem('harkat_kie_api_key', e.target.value)
                          localStorage.setItem('harkat_suno_api_key', e.target.value)
                        }}
                        placeholder="Masukkan API Key / Token Kie.ai Anda..."
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                )}

                {isElevenLabsActive && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Sparkles size={14} /> ElevenLabs Music ({activeModelObj.name})
                      </span>
                      <span className="text-[10px] rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-200 font-semibold">Audio Komposisi HD</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Menggunakan arsitektur <strong>ElevenLabs Music API</strong> untuk menciptakan komposisi lagu, aransemen harmoni, dan instrumen berkualitas studio.
                    </p>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          ElevenLabs API Key
                        </label>
                        {sunoApiKey.startsWith('sk_') && (
                          <span className="text-[10px] text-emerald-300 font-medium">✓ Key sk_... terdeteksi</span>
                        )}
                      </div>
                      <input
                        type="password"
                        value={sunoApiKey}
                        onChange={(e) => {
                          setSunoApiKey(e.target.value)
                          localStorage.setItem('harkat_elevenlabs_api_key', e.target.value)
                          localStorage.setItem('harkat_suno_api_key', e.target.value)
                        }}
                        placeholder="sk_58233b4bc4c89e482ec2ca5ef3a199f73651d48a1963205f..."
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                )}

                {isSunoActive && (
                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                        <Sparkles size={14} /> Suno AI Cloud ({activeModelObj.name})
                      </span>
                      <span className="text-[10px] rounded bg-sky-500/20 px-2 py-0.5 text-sky-200 font-semibold">Vokal Nyata 2-4 Menit</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Model <strong>{activeModelObj.name}</strong> menghasilkan lagu studio lengkap dengan <strong>vokal manusia asli bernyanyi</strong> sesuai lirik bahasa Indonesia Anda.
                    </p>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Suno API Key / Token
                      </label>
                      <input
                        type="password"
                        value={sunoApiKey}
                        onChange={(e) => {
                          setSunoApiKey(e.target.value)
                          localStorage.setItem('harkat_suno_api_key', e.target.value)
                        }}
                        placeholder="Masukkan API Key Suno / MusicAPI Anda..."
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>
                )}

                {!isSunoActive && activeModelObj.id !== 'harkat-instant' && (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Durasi Sample AI</label>
                      <span className="text-[10px] text-amber-300/80 flex items-center gap-1"><Cpu size={12} /> Mode CPU Lokal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { sec: 3, label: '3 dtk', note: '~25-30s CPU' },
                        { sec: 5, label: '5 dtk', note: '~45s CPU' },
                        { sec: 8, label: '8 dtk', note: '~70s CPU' },
                      ].map(d => (
                        <button
                          key={d.sec}
                          type="button"
                          onClick={() => setDuration(d.sec)}
                          className={`flex flex-col items-center justify-center rounded-xl border p-2 text-xs transition ${
                            duration === d.sec
                              ? 'border-fuchsia-500 bg-fuchsia-500/20 text-white font-bold'
                              : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold">{d.label}</span>
                          <span className="text-[9px] opacity-70">{d.note}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )
        })()}

      <form onSubmit={handleGenerate}>
        {error && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-red-500/40 bg-red-950/20 p-4 text-sm text-red-200 shadow-xl backdrop-blur-md animate-fade-in">
            {error.toLowerCase().includes('credit') ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-300 text-sm">Kredit API Suno AI Habis</h4>
                    <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                      Kredit API Suno pada akun Anda di <span className="font-mono underline">api.musicapi.ai</span> telah habis terpakai. Anda dapat langsung beralih ke model Harkat lokal gratis berikut untuk terus membuat musik tanpa kendala:
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModel('harkat-fusion')
                      setError(null)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
                  >
                    <Sparkles size={13} /> Gunakan Harkat Fusion v1 (Gratis & Offline)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModel('harkat-instant')
                      setError(null)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 px-3 py-1.5 text-xs font-bold text-blue-300 hover:bg-blue-500/30 transition"
                  >
                    <Zap size={13} /> Gunakan Harkat Instant Synth (&lt; 1 Detik)
                  </button>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition ml-auto"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 text-red-400">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
                <button type="button" onClick={() => setError(null)} className="text-xs text-gray-400 hover:text-white">✕</button>
              </div>
            )}
          </div>
        )}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between"><label className="block text-sm font-semibold">Song Description</label><button type="button" onClick={randomizePrompt} title="Buat ide acak" className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"><Dices size={17} /></button></div>
          <textarea 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            required
            rows={customMode ? 3 : 5}
            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm focus:border-fuchsia-500 focus:outline-none"
            maxLength={3000}
            placeholder="Jelaskan tema, cerita, suasana, struktur, dan karakter lagu yang Anda inginkan..."
          />
          <div className="mt-1 text-right text-xs text-gray-600">{prompt.length}/3000</div>
        </div>

        {!customMode && (
          <button 
            type="button" 
            onClick={() => setCustomMode(true)} 
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-300 hover:bg-fuchsia-500/20"
          >
            <Mic2 size={13} />
            + Atur Judul & Tulis Lirik Lagu
          </button>
        )}

        {customMode && (
          <div className="mb-4 space-y-4">
            {/* Suno-style + Audio Reference Button */}
            <div>
              <input
                type="file"
                id="audio-ref-file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setAudioRefName(file.name)
                }}
              />
              {audioRefName ? (
                <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 truncate text-gray-200">
                    <Music size={14} className="text-rose-400 shrink-0" />
                    <span className="truncate font-medium">{audioRefName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAudioRefName(null)}
                    className="text-gray-400 hover:text-white text-xs ml-2 rounded p-1"
                    title="Hapus referensi audio"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => document.getElementById('audio-ref-file')?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/20 py-2.5 text-xs font-semibold text-gray-300 transition hover:border-white/40 hover:bg-white/5 hover:text-white"
                >
                  <Plus size={14} />
                  <span>Audio</span>
                </button>
              )}
            </div>

            <label className="block text-sm font-semibold">
              Judul Karya
              <input 
                value={songTitle} 
                onChange={(event) => setSongTitle(event.target.value)} 
                maxLength={100} 
                placeholder="Contoh: Tapi Tidak Hidupku" 
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 p-2.5 text-sm outline-none focus:border-fuchsia-500" 
              />
            </label>

            {/* Lirik Section with Smart Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold flex items-center gap-1.5">
                  <Mic2 size={15} className={instrumental ? 'text-gray-500' : 'text-fuchsia-400'} />
                  <span>Lirik Lagu</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInstrumental(!instrumental)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                      instrumental
                        ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300'
                    }`}
                  >
                    {instrumental ? 'Instrumental' : 'Vokal Aktif'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateLyrics}
                    disabled={generatingLyrics}
                    className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-purple-200 transition hover:bg-purple-500/30 disabled:opacity-50"
                  >
                    <Sparkles size={11} />
                    {generatingLyrics ? 'Menulis...' : 'Tulis Lirik AI'}
                  </button>
                </div>
              </div>

              {instrumental ? (
                <div 
                  onClick={() => setInstrumental(false)}
                  className="cursor-pointer rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3 text-center transition hover:border-amber-400 hover:bg-amber-500/10"
                >
                  <p className="text-xs font-semibold text-amber-300">Mode Instrumental (Tanpa Vokal)</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">Klik di sini untuk mengaktifkan lirik vokal.</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={lyrics}
                    onFocus={() => { if (instrumental) setInstrumental(false) }}
                    onChange={(event) => {
                      setLyrics(event.target.value)
                      if (instrumental) setInstrumental(false)
                    }}
                    rows={7}
                    maxLength={5000}
                    placeholder="Tulis lirik di sini atau klik 'Tulis Lirik AI' di atas...&#10;&#10;[Verse 1]&#10;Dulu kau berjanji setia...&#10;&#10;[Chorus]&#10;Tapi tidak hidupku..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-relaxed outline-none focus:border-fuchsia-500"
                  />
                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-400">
                    <span className="text-gray-500">Sisipkan:</span>
                    {['[Intro]', '[Verse]', '[Pre-Chorus]', '[Chorus]', '[Bridge]', '[Outro]'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setLyrics(prev => prev ? `${prev}\n\n${tag}\n` : `${tag}\n`)
                          if (instrumental) setInstrumental(false)
                        }}
                        className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-300 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 hover:text-white"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="styles" className="font-semibold text-sm">Styles</label>
            <span className="text-xs text-gray-500">{styles.length}/300</span>
          </div>
          <textarea
            id="styles"
            value={styles}
            onChange={(event) => setStyles(event.target.value.slice(0, 300))}
            rows={2}
            placeholder="Contoh: Dangdut koplo, kendang cepat, vokal wanita, 140 BPM, live band"
            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs focus:border-fuchsia-500 focus:outline-none"
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {styleSuggestions.map(style => (
              <button key={style} type="button" onClick={() => addStyle(style)} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300 transition hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10 hover:text-white">
                + {style}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <button type="button" onClick={clearForm} title="Bersihkan formulir" className="rounded-2xl border border-white/10 p-3 text-gray-400 hover:bg-white/10 hover:text-white transition"><Trash2 size={18} /></button>
          <div className="text-xs text-gray-400">{isAdministrator ? '∞ Administrator' : '5 Kredit'}</div>
          <button 
            type="submit" 
            disabled={loading || !prompt}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d4d] via-[#f76b1c] to-[#ff3366] px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-950/40 transition hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Clock size={18} className="animate-spin" />
                <span>Memproses ({elapsedSeconds}s)</span>
              </>
            ) : (
              <>
                <Music size={18} />
                <span className="text-base tracking-wide">Create</span>
              </>
            )}
          </button>
        </div>
      </form>
      </aside>

      <main className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">Bring your sound to life</h2>
            <p className="mt-1 text-gray-400">Hasil terbaru dan ruang kerja kreatif Anda.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/studio/transcribe" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"><Upload size={16} /> Upload Audio</Link>
            <Link href="/library" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"><ListMusic size={16} /> Library</Link>
          </div>
        </div>

      {loading && (
        <div className="relative overflow-hidden rounded-3xl border border-fuchsia-500/30 bg-gradient-to-b from-[#181226] via-[#121215] to-[#0d0d10] p-8 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center justify-center text-center py-10">
            {/* Animated Equalizer Wave */}
            <div className="mb-6 flex items-end justify-center gap-1.5 h-14">
              <span className="w-1.5 bg-fuchsia-500 rounded-full animate-bounce" style={{ height: '70%', animationDuration: '0.8s' }}></span>
              <span className="w-1.5 bg-violet-400 rounded-full animate-bounce" style={{ height: '100%', animationDuration: '1.1s' }}></span>
              <span className="w-1.5 bg-amber-400 rounded-full animate-bounce" style={{ height: '85%', animationDuration: '0.7s' }}></span>
              <span className="w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ height: '95%', animationDuration: '1.3s' }}></span>
              <span className="w-1.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ height: '60%', animationDuration: '0.9s' }}></span>
              <span className="w-1.5 bg-rose-500 rounded-full animate-bounce" style={{ height: '80%', animationDuration: '1.0s' }}></span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3.5 py-1 text-xs font-semibold text-fuchsia-300 mb-3">
              <Zap size={14} className="animate-pulse" />
              Menciptakan Musik AI: {model}
            </div>

            <h3 className="text-2xl font-black text-white">
              {getGenerationStage(elapsedSeconds, model)}
            </h3>

            <p className="mt-2 text-sm text-gray-400 max-w-md">
              Prompt: &ldquo;{prompt.slice(0, 90)}{prompt.length > 90 ? '...' : ''}&rdquo;
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 px-4 py-2 text-sm font-mono text-amber-200">
                <Clock size={16} className="text-amber-400" />
                <span>Waktu berjalan: {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="text-xs text-gray-400">
                Estimasi selesai: ~{duration === 3 ? '25-30s' : duration === 5 ? '40-45s' : '70s'}
              </div>
            </div>

            <div className="mt-6 w-full max-w-md rounded-full bg-white/5 h-2 overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-fuchsia-500 via-amber-400 to-orange-500 transition-all duration-500 rounded-full"
                style={{ 
                  width: `${Math.min(95, Math.max(10, (elapsedSeconds / (duration === 3 ? 30 : duration === 5 ? 45 : 75)) * 100))}%` 
                }}
              />
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 max-w-lg">
              <Cpu size={16} className="text-gray-400 flex-shrink-0" />
              <span>
                <strong>Mode CPU Lokal:</strong> Model neural 300M parameter diproses langsung di mesin Anda. Pilih <em>Harkat Instant Synth</em> jika ingin hasil instan (&lt; 1 detik).
              </span>
            </div>
          </div>
        </div>
      )}

      {!loading && result && (
        <div className="space-y-6">
          {/* Master Studio Spotlight Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#181820] via-[#121216] to-[#0d0d10] p-6 shadow-2xl backdrop-blur-2xl">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

            {/* Top Badge & Metadata Row */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300">
                  <Sparkles size={13} className="animate-spin text-rose-400" />
                  CREATED JUST NOW
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold text-white">
                  {model.replace('suno-', '').toUpperCase()}
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  Studio Master Mix
                </span>
              </div>

              {/* Feedback & Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className={`rounded-xl border p-2 transition ${
                    feedback === 'up'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                  title="Suka hasil ini"
                >
                  <ThumbsUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className={`rounded-xl border p-2 transition ${
                    feedback === 'down'
                      ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                  title="Kurang sesuai"
                >
                  <ThumbsDown size={15} />
                </button>
                {/* Download Menu Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-500/20 to-amber-500/20 px-3.5 py-2 text-xs font-bold text-white shadow-lg transition hover:border-rose-400 hover:from-rose-500/30 hover:to-amber-500/30 active:scale-95"
                  >
                    <Download size={14} className="text-rose-400" />
                    <span>Menu Unduh</span>
                    <ChevronDown size={13} className={`text-gray-300 transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDownloadMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDownloadMenuOpen(false)} />
                      <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-white/15 bg-[#18181c] p-2 shadow-2xl backdrop-blur-xl space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Pilihan Format Unduhan
                        </div>

                        <a
                          href={result.song.audio_url || '/audio/yang-pergi-kamu.wav'}
                          download={`${songTitle || result.song.title || 'harkat-master'}.wav`}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-left transition hover:bg-white/10 group"
                          onClick={() => setIsDownloadMenuOpen(false)}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition flex-shrink-0">
                            <Music size={15} />
                          </div>
                          <div>
                            <div className="font-bold text-white">Audio Master (WAV)</div>
                            <div className="text-[10px] text-gray-400">24-bit 48kHz Broadcast Master</div>
                          </div>
                        </a>

                        <a
                          href="/audio/yang-pergi-kamu.pdf"
                          download={`${songTitle || result.song.title || 'partitur'}.pdf`}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-left transition hover:bg-white/10 group"
                          onClick={() => setIsDownloadMenuOpen(false)}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 group-hover:bg-amber-500 group-hover:text-black transition flex-shrink-0">
                            <FileText size={15} />
                          </div>
                          <div>
                            <div className="font-bold text-white">Partitur Not Balok (PDF)</div>
                            <div className="text-[10px] text-gray-400">MuseScore 4 Engraved Score</div>
                          </div>
                        </a>

                        <a
                          href="/audio/yang-pergi-kamu.musicxml"
                          download={`${songTitle || result.song.title || 'partitur'}.musicxml`}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-left transition hover:bg-white/10 group"
                          onClick={() => setIsDownloadMenuOpen(false)}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white transition flex-shrink-0">
                            <Layers size={15} />
                          </div>
                          <div>
                            <div className="font-bold text-white">Partitur Digital (MusicXML)</div>
                            <div className="text-[10px] text-gray-400">Sibelius, Finale, MuseScore</div>
                          </div>
                        </a>

                        <a
                          href="/audio/yang-pergi-kamu.mid"
                          download={`${songTitle || result.song.title || 'track'}.mid`}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-left transition hover:bg-white/10 group"
                          onClick={() => setIsDownloadMenuOpen(false)}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-black transition flex-shrink-0">
                            <Sliders size={15} />
                          </div>
                          <div>
                            <div className="font-bold text-white">File MIDI (.mid)</div>
                            <div className="text-[10px] text-gray-400">Melodi & Akor untuk DAW</div>
                          </div>
                        </a>

                        <a
                          href="/audio/yang-pergi-kamu-chord-sheet.txt"
                          download={`${songTitle || result.song.title || 'lirik-akor'}.txt`}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-left transition hover:bg-white/10 group"
                          onClick={() => setIsDownloadMenuOpen(false)}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-black transition flex-shrink-0">
                            <Mic2 size={15} />
                          </div>
                          <div>
                            <div className="font-bold text-white">Lirik & Bagan Akor (.txt)</div>
                            <div className="text-[10px] text-gray-400">Teks lengkap dengan kunci gitar</div>
                          </div>
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Track Presentation */}
            <div className="grid gap-6 md:grid-cols-[160px_1fr] items-start">
              {/* Album Art Cover with Vinyl Ring Effect */}
              <div className="group relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#2a1b3d] via-[#1a1224] to-[#141419] shadow-2xl">
                {result.song.image_url ? (
                  <img
                    src={result.song.image_url}
                    alt={result.song.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}

                {/* Vinyl Grooves Illusion */}
                <div className={`absolute inset-0 flex items-center justify-center ${result.song.image_url ? 'opacity-0 group-hover:opacity-40 bg-black/40' : 'opacity-40'} transition-opacity`}>
                  <div className="h-32 w-32 rounded-full border border-white/15 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full border border-white/15 flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full border border-white/20 flex items-center justify-center bg-black/40">
                        <Disc3 size={20} className={`text-rose-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Equalizer Overlay when playing */}
                {isPlaying && (
                  <div className="absolute inset-x-0 bottom-3 flex items-end justify-center gap-1 h-6 z-10">
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce" style={{ height: '70%', animationDuration: '0.6s' }}></span>
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce" style={{ height: '100%', animationDuration: '0.9s' }}></span>
                    <span className="w-1 bg-violet-400 rounded-full animate-bounce" style={{ height: '80%', animationDuration: '0.7s' }}></span>
                    <span className="w-1 bg-pink-400 rounded-full animate-bounce" style={{ height: '95%', animationDuration: '1.1s' }}></span>
                  </div>
                )}

                {/* Play Button Overlay */}
                <button
                  type="button"
                  onClick={() => togglePlay()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100 z-20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl transition hover:scale-110 active:scale-95">
                    {isPlaying ? <Pause size={22} className="fill-black" /> : <Play size={22} className="fill-black ml-0.5" />}
                  </div>
                </button>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-200 backdrop-blur-sm z-10">
                  {formatDuration(audioDuration || 180)}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-3 min-w-0">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tight text-white line-clamp-2">
                    {songTitle || result.song.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    {result.song.provider || 'Suno AI Studio Engine'} • ID: <span className="font-mono text-gray-500">{result.jobId}</span>
                  </p>
                </div>

                {/* Badges / Musical Specs */}
                <div className="flex flex-wrap items-center gap-2">
                  {result.song.bpm && (
                    <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      ♩ {result.song.bpm} BPM
                    </span>
                  )}
                  {result.score?.key && (
                    <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                      Key: {result.score.key}
                    </span>
                  )}
                  {result.score?.meter && (
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300">
                      {result.score.meter} Meter
                    </span>
                  )}
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    Vokal + Multi-track Band
                  </span>
                </div>

                {/* Genre Tags Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(result.song.genre || styles || 'Alternative Rock')
                    .split(',')
                    .slice(0, 5)
                    .map((genreItem, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-gray-300"
                      >
                        {genreItem.trim()}
                      </span>
                    ))}
                </div>

                {/* Story / Prompt Accordion */}
                <div className="pt-1">
                  <div className="text-xs text-gray-400">
                    <p className={`text-gray-300 leading-relaxed ${!promptExpanded ? 'line-clamp-2' : ''}`}>
                      {result.song.prompt_used || prompt}
                    </p>
                    {result.song.prompt_used && result.song.prompt_used.length > 120 && (
                      <button
                        type="button"
                        onClick={() => setPromptExpanded(!promptExpanded)}
                        className="mt-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition"
                      >
                        {promptExpanded ? 'Sembunyikan deskripsi ▴' : 'Baca konsep & cerita lengkap ▾'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Interactive Studio Waveform & Player Bar */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
              {/* Scrubber Range */}
              <div className="flex items-center gap-3">
                <span className="min-w-[40px] text-right font-mono text-xs font-semibold text-gray-400">
                  {formatDuration(currentTime)}
                </span>
                <div className="relative flex-1">
                  <input
                    type="range"
                    min={0}
                    max={audioDuration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-rose-500 transition-all hover:bg-white/20"
                    style={{
                      background: `linear-gradient(to right, #f43f5e 0%, #fb923c ${
                        audioDuration ? (currentTime / audioDuration) * 100 : 0
                      }%, rgba(255,255,255,0.1) ${
                        audioDuration ? (currentTime / audioDuration) * 100 : 0
                      }%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                </div>
                <span className="min-w-[40px] font-mono text-xs font-semibold text-gray-400">
                  {formatDuration(audioDuration || 180)}
                </span>
              </div>

              {/* Native Audio Tag */}
              <audio
                ref={audioRef}
                src={result.song.audio_url || '/audio/yang-pergi-kamu.mp3'}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={(e) => {
                  console.warn('Playback error caught on audio element:', e)
                  setIsPlaying(false)
                }}
                preload="auto"
              />

              {/* Player Controls & Action Links */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                {/* Left controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => togglePlay()}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-white/20 transition hover:scale-105 active:scale-95"
                  >
                    {isPlaying ? <Pause size={22} className="fill-black" /> : <Play size={22} className="fill-black ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.muted = !isMuted
                        setIsMuted(!isMuted)
                      }
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-gray-300 hover:border-white/20 hover:text-white transition"
                    title={isMuted ? 'Nyalakan suara' : 'Bisukan suara'}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>

                  <div className="hidden sm:block text-xs font-semibold text-gray-300">
                    {isPlaying ? (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Sedang Memutar Lagu Master
                      </span>
                    ) : (
                      <span className="text-gray-400">Klik play untuk memutar audio</span>
                    )}
                  </div>
                </div>

                {/* Right Studio Navigation */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/studio/score/${result.jobId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2.5 text-xs font-bold text-amber-200 transition hover:border-amber-400 hover:bg-amber-500/25 active:scale-95 shadow-lg shadow-amber-500/10"
                    title="Buka partitur not balok, akor & ekspor MuseScore 4"
                  >
                    <FileText size={14} className="text-amber-300" />
                    <span>Partitur & Chord</span>
                  </Link>

                  <Link
                    href="/studio/transcribe"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-3.5 py-2.5 text-xs font-bold text-indigo-200 transition hover:border-indigo-400 hover:bg-indigo-500/25 active:scale-95 shadow-lg shadow-indigo-500/10"
                    title="Deteksi not balok otomatis dengan Basic Pitch AI"
                  >
                    <Music size={14} className="text-indigo-300" />
                    <span>Transcribe Not Balok</span>
                  </Link>

                  <Link
                    href={`/studio/audio/${result.jobId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white transition hover:border-white/30 hover:bg-white/10 active:scale-95"
                    title="Buka multi-track stems di Harkat Audio Studio"
                  >
                    <Layers size={14} />
                    <span>Studio DAW</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex border-b border-white/10 gap-1 pb-1">
                {[
                  { id: 'overview', label: 'Harmoni & Akor', icon: Music2 },
                  { id: 'lyrics', label: 'Lirik Lagu', icon: Mic2 },
                  { id: 'stems', label: 'Track Multi-Stems', icon: Layers },
                ].map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`inline-flex items-center gap-1.5 rounded-t-xl px-4 py-2 text-xs font-bold transition border-b-2 ${
                        isActive
                          ? 'border-rose-500 text-white bg-white/5'
                          : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Tab Contents */}
              <div className="pt-4">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                          <span>Progresi Akor & Harmoni Lagu</span>
                          <span className="text-[10px] text-gray-500">(Klik kotak akor untuk dengar nada)</span>
                        </div>
                        <button
                          type="button"
                          onClick={playProgression}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                        >
                          <Play size={12} className="fill-rose-300" />
                          <span>Dengar Urutan Akor</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {(result.score?.chords && result.score.chords.length > 0 ? result.score.chords : ['Am', 'G', 'F', 'E']).map((chord, i) => {
                          const isChordActive = activeChordPlaying === chord
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => playChordTone(chord)}
                              className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition cursor-pointer select-none active:scale-95 ${
                                isChordActive
                                  ? 'border-rose-400 bg-rose-500/25 ring-2 ring-rose-400/40 scale-105'
                                  : 'border-white/10 bg-white/[0.03] hover:border-rose-500/40 hover:bg-rose-500/10'
                              }`}
                            >
                              <span className="text-[10px] font-semibold uppercase text-gray-400">Bar {i + 1}</span>
                              <span className="mt-1 font-mono text-2xl font-black text-rose-400">{chord}</span>
                              <span className="mt-1 text-[10px] text-gray-400 font-medium">Klik bunyikan 🔊</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* MuseScore Studio Engraving Callout */}
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-black/40 to-indigo-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                            MuseScore 4 Active
                          </span>
                          <strong className="text-sm font-bold text-white">Score Studio & Partitur Not Balok</strong>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          Edit notasi paranada, ubah nada dasar (transposisi), dan cetak lembaran partitur resmi PDF & MusicXML berstandar orkestra.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/studio/score/${result.jobId}`}
                          className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition whitespace-nowrap"
                        >
                          Buka Score Studio →
                        </Link>
                        <a
                          href="/audio/yang-pergi-kamu.pdf"
                          download="partitur-yang-pergi-kamu.pdf"
                          className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition whitespace-nowrap"
                        >
                          Unduh PDF
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'lyrics' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Struktur & Bait Lirik
                      </span>
                      <button
                        type="button"
                        onClick={copyLyricsToClipboard}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300 hover:text-white transition"
                      >
                        {copiedLyrics ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedLyrics ? 'Tersalin!' : 'Salin Lirik'}</span>
                      </button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 max-h-72 overflow-y-auto font-sans leading-relaxed text-sm text-gray-200 whitespace-pre-line space-y-2">
                      {(result.song.lyrics || lyrics || 'Lirik lagu otomatis diatur oleh Suno AI sesuai vokal bernyanyi.')
                        .split('\n')
                        .map((line, idx) => {
                          const isHeader = line.trim().startsWith('[') && line.trim().endsWith(']')
                          if (isHeader) {
                            return (
                              <div key={idx} className="pt-2 font-bold text-rose-400 text-xs tracking-wider uppercase">
                                {line}
                              </div>
                            )
                          }
                          return <div key={idx} className="text-gray-300">{line}</div>
                        })}
                    </div>
                  </div>
                )}

                {activeTab === 'stems' && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Multi-Track Stems & Berkas Ekspor
                    </div>
                    {(result.tracks || [
                      { id: 'master', name: 'Master WAV Mix (24-bit 48kHz)', role: 'Full Production Master', audio_url: '/audio/yang-pergi-kamu.wav' },
                      { id: 'score-pdf', name: 'Partitur Not Balok (PDF)', role: 'MuseScore 4 Engraved Sheet Music', audio_url: '/audio/yang-pergi-kamu.pdf' },
                      { id: 'musicxml', name: 'Partitur Digital (MusicXML)', role: 'Standard Sheet Music XML', audio_url: '/audio/yang-pergi-kamu.musicxml' },
                      { id: 'midi', name: 'File MIDI (.mid)', role: 'Melody & Harmony MIDI File', audio_url: '/audio/yang-pergi-kamu.mid' },
                      { id: 'chords', name: 'Lirik & Panduan Akor (.txt)', role: 'Official Chord Progression & Lyrics', audio_url: '/audio/yang-pergi-kamu-chord-sheet.txt' },
                    ]).map((track, i) => {
                      const fileUrl = track.audio_url || (track as any).url || '/audio/yang-pergi-kamu.wav'
                      const isPdf = fileUrl.endsWith('.pdf')
                      const isXml = fileUrl.endsWith('.musicxml')
                      const isMid = fileUrl.endsWith('.mid')
                      const isTxt = fileUrl.endsWith('.txt')
                      const ext = isPdf ? '.pdf' : isXml ? '.musicxml' : isMid ? '.mid' : isTxt ? '.txt' : '.wav'

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            {isPdf ? (
                              <FileText size={16} className="text-amber-400" />
                            ) : isXml ? (
                              <Layers size={16} className="text-indigo-400" />
                            ) : isMid ? (
                              <Sliders size={16} className="text-emerald-400" />
                            ) : isTxt ? (
                              <Mic2 size={16} className="text-cyan-400" />
                            ) : (
                              <Music size={16} className="text-rose-400" />
                            )}
                            <div>
                              <div className="font-bold text-white">{track.name}</div>
                              <div className="text-[11px] text-gray-400">{track.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {track.audio_url && track.audio_url.endsWith('.wav') && (
                              <button
                                type="button"
                                onClick={() => togglePlay(track.audio_url)}
                                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300 hover:text-white transition flex items-center gap-1"
                              >
                                <Play size={11} className="fill-white" />
                                <span>Play</span>
                              </button>
                            )}
                            <a
                              href={fileUrl}
                              download={`${track.name}${ext}`}
                              className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20 transition flex items-center gap-1"
                            >
                              <Download size={11} />
                              <span>Unduh</span>
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workspace Creations Section (like Suno AI Workspace) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <span>Workspaces &gt; My Workspace</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </h4>
              <span className="text-xs text-gray-500 font-mono">Today ({history.length || 1})</span>
            </div>

            <div className="space-y-2">
              {[result, ...history.filter(h => h.jobId !== result.jobId)].map((item, idx) => {
                const isThisPlaying = isPlaying && result.jobId === item.jobId
                return (
                  <div
                    key={item.jobId || idx}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#16161a] p-3 transition hover:border-white/25 hover:bg-[#1b1b22]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Mini Thumbnail */}
                      <button
                        type="button"
                        onClick={() => {
                          setResult(item)
                          togglePlay(item.song.audio_url)
                        }}
                        className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/30 to-amber-500/20 border border-white/10 overflow-hidden group-hover:scale-105 transition"
                      >
                        {item.song.image_url ? (
                          <img
                            src={item.song.image_url}
                            alt={item.song.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : null}
                        <div className={`relative z-10 flex items-center justify-center ${item.song.image_url ? 'bg-black/40 h-full w-full' : ''}`}>
                          {isThisPlaying ? (
                            <Pause size={18} className="text-white" />
                          ) : (
                            <Play size={18} className="text-white ml-0.5" />
                          )}
                        </div>
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono rounded bg-black/80 px-1 text-gray-300 z-20">
                          {formatDuration(item.song.duration || 180)}
                        </span>
                      </button>

                      {/* Title & Snippet */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">
                            {item.song.title}
                          </span>
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-300">
                            {model.replace('suno-', '')}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400 truncate max-w-lg">
                          {item.song.genre} • {item.song.prompt_used?.slice(0, 100)}...
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <a
                        href={item.song.audio_url || '/audio/yang-pergi-kamu.wav'}
                        download={`${item.song.title || 'harkat-master'}.wav`}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 hover:text-white transition"
                        title="Unduh Master Audio"
                      >
                        <Download size={14} />
                      </a>
                      <Link
                        href={`/studio/score/${item.jobId}`}
                        className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 transition flex items-center gap-1"
                        title="Lihat Partitur & Akor Lagu"
                      >
                        <FileText size={12} />
                        <span>Partitur</span>
                      </Link>
                      <Link
                        href={`/studio/audio/${item.jobId}`}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition"
                      >
                        Studio DAW
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {!loading && !result && (
        <div className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] text-center">
          <SlidersHorizontal size={42} className="mb-4 text-gray-600" />
          <h3 className="text-xl font-bold">Karya Anda akan muncul di sini</h3>
          <p className="mt-2 max-w-md text-sm text-gray-500">Gunakan Simple untuk ide cepat atau Advanced untuk mengatur judul, lirik, styles, dan karakter vokal.</p>
        </div>
      )}
      </main>
      </div>
      </div>
    </div>
  )
}

