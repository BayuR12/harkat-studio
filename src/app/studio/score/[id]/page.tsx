'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowDown, ArrowLeft, ArrowUp, Download, FileText, Loader2, Pause, Play, Printer, RotateCcw, Settings } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

type Score = {
  title: string
  creator: string
  key: string
  tempo: number
  meter: string
  instruments: string[]
  sections: { name: string; chords: string[] }[]
}

type SavedGeneration = {
  song?: { title?: string; prompt_used?: string }
  score?: { key: string; chords: string[]; instruments: string[]; tempo: number; meter: string }
}

const subscribeToSessionStorage = () => () => undefined

const downloadFile = (name: string, data: BlobPart, type: string) => {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function generateScoreMusicXml(score: Score, instrument: string, semitones: number, chordNameMap: Record<string, string>): string {
  const divisions = 1
  let measureIndex = 1

  const measuresXml = score.sections.flatMap(section => {
    return section.chords.map(rawChord => {
      const chord = transposeChord(chordNameMap[rawChord] || rawChord, semitones)
      const currentMeasure = measureIndex++
      return `
    <measure number="${currentMeasure}">
      ${currentMeasure === 1 ? `
      <attributes>
        <divisions>${divisions}</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <direction><direction-type><words font-weight="bold">${section.name} (${chord})</words></direction-type></direction>
      <direction><sound tempo="${score.tempo}"/></direction>
      ` : `
      <direction><direction-type><words font-weight="bold">${chord}</words></direction-type></direction>
      `}
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>whole</type>
      </note>
    </measure>`
    })
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <work><work-title>${score.title.replace(/[<>&]/g, '')}</work-title></work>
  <identification><creator type="composer">${score.creator.replace(/[<>&]/g, '')}</creator></identification>
  <part-list>
    <score-part id="P1"><part-name>${instrument.replace(/[<>&]/g, '')}</part-name></score-part>
  </part-list>
  <part id="P1">${measuresXml}
  </part>
</score-partwise>`
}

const sharedSections = {
  pop: [
    { name: 'Intro', chords: ['I', 'V', 'vi', 'IV'] },
    { name: 'Verse', chords: ['I', 'iii', 'IV', 'V'] },
    { name: 'Chorus', chords: ['IV', 'V', 'iii', 'vi'] },
    { name: 'Outro', chords: ['IV', 'V', 'I', 'I'] },
  ],
  acoustic: [
    { name: 'Intro', chords: ['I', 'V/3', 'vi', 'IV'] },
    { name: 'Verse', chords: ['I', 'V', 'vi', 'iii'] },
    { name: 'Chorus', chords: ['IV', 'I/3', 'ii', 'V'] },
    { name: 'Outro', chords: ['IV', 'V', 'I', 'I'] },
  ],
}

const scoreCatalog: Record<string, Score> = {
  '1': { title: 'Senja di Kampus', creator: 'Mahasiswa Berkelana', key: 'C Mayor', tempo: 96, meter: '4/4', instruments: ['Vokal', 'Piano', 'Gitar', 'Bass', 'Drum'], sections: sharedSections.pop },
  '2': { title: 'Langkah Awal', creator: 'Harkat Demo', key: 'G Mayor', tempo: 82, meter: '4/4', instruments: ['Vokal', 'Gitar Akustik', 'Piano', 'Bass', 'Perkusi'], sections: sharedSections.acoustic },
  '3': { title: 'Cyberpunk City', creator: 'AI Master', key: 'E Minor', tempo: 124, meter: '4/4', instruments: ['Synth Lead', 'Synth Pad', 'Bass', 'Drum', 'FX'], sections: sharedSections.pop },
  'bengawan-solo': { title: 'Bengawan Solo', creator: 'Gesang Martohartono', key: 'C Mayor', tempo: 76, meter: '4/4', instruments: ['Vokal', 'Cak', 'Cuk', 'Cello Keroncong', 'Bass', 'Biola', 'Flute'], sections: sharedSections.acoustic },
  'laskar-pelangi': { title: 'Laskar Pelangi', creator: 'Nidji', key: 'D Mayor', tempo: 120, meter: '4/4', instruments: ['Vokal', 'Gitar 1', 'Gitar 2', 'Keyboard', 'Bass', 'Drum'], sections: sharedSections.pop },
  sempurna: { title: 'Sempurna', creator: 'Andra And The Backbone', key: 'G Mayor', tempo: 72, meter: '4/4', instruments: ['Vokal', 'Gitar Akustik', 'Gitar Elektrik', 'Piano', 'Bass', 'Drum'], sections: sharedSections.acoustic },
  'teh-hijau': { title: 'Teh Hijau', creator: 'Tulus • Aransemen latihan Harkat', key: 'G Mayor', tempo: 100, meter: '4/4', instruments: ['Piano'], sections: sharedSections.pop },
  '15f047a5-94c3-43ee-98bc-c543a37103f2': {
    title: 'Yang Pergi Kamu, Bukan Hidupku',
    creator: 'Harkat AI Studio Master',
    key: 'A Minor',
    tempo: 96,
    meter: '4/4',
    instruments: ['Vokal Pria Emo Rock', 'Clean Electric Guitar', 'Distortion Guitar', 'Bass Melodis', 'Drum Rock'],
    sections: [
      { name: 'Intro', chords: ['Am', 'G', 'F', 'E'] },
      { name: 'Verse', chords: ['Am', 'G', 'F', 'E'] },
      { name: 'Chorus', chords: ['F', 'G', 'Am', 'E'] },
      { name: 'Outro', chords: ['Am', 'G', 'F', 'E'] },
    ],
  },
  'yang-pergi-kamu': {
    title: 'Yang Pergi Kamu, Bukan Hidupku',
    creator: 'Harkat AI Studio Master',
    key: 'A Minor',
    tempo: 96,
    meter: '4/4',
    instruments: ['Vokal Pria Emo Rock', 'Clean Electric Guitar', 'Distortion Guitar', 'Bass Melodis', 'Drum Rock'],
    sections: [
      { name: 'Intro', chords: ['Am', 'G', 'F', 'E'] },
      { name: 'Verse', chords: ['Am', 'G', 'F', 'E'] },
      { name: 'Chorus', chords: ['F', 'G', 'Am', 'E'] },
      { name: 'Outro', chords: ['Am', 'G', 'F', 'E'] },
    ],
  },
}

const chordsByKey: Record<string, Record<string, string>> = {
  'C Mayor': { I: 'C', 'V': 'G', vi: 'Am', IV: 'F', iii: 'Em', ii: 'Dm', 'V/3': 'G/B', 'I/3': 'C/E' },
  'D Mayor': { I: 'D', 'V': 'A', vi: 'Bm', IV: 'G', iii: 'F#m', ii: 'Em', 'V/3': 'A/C#', 'I/3': 'D/F#' },
  'G Mayor': { I: 'G', 'V': 'D', vi: 'Em', IV: 'C', iii: 'Bm', ii: 'Am', 'V/3': 'D/F#', 'I/3': 'G/B' },
  'E Minor': { I: 'Em', 'V': 'B', vi: 'C', IV: 'Am', iii: 'G', ii: 'F#dim', 'V/3': 'B/D#', 'I/3': 'Em/G' },
  'A Minor': { I: 'Am', 'V': 'E', vi: 'F', IV: 'Dm', iii: 'C', ii: 'Bdim', 'V/3': 'E/G#', 'I/3': 'Am/C' },
}

const chromaticSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const chromaticFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const pitchIndex: Record<string, number> = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 }

function transposePitch(value: string, semitones: number, preferFlats = false) {
  const match = value.match(/^([A-G](?:#|b)?)(.*)$/)
  if (!match) return value
  const index = pitchIndex[match[1]]
  if (index === undefined) return value
  const names = preferFlats || match[1].includes('b') ? chromaticFlat : chromaticSharp
  return `${names[(index + semitones + 120) % 12]}${match[2]}`
}

function transposeChord(chord: string, semitones: number, preferFlats = false) {
  return chord.split('/').map((part) => transposePitch(part, semitones, preferFlats)).join('/')
}

function ProfessionalStaff({ chords, barStart, semitones, active }: { chords: string[]; barStart: number; semitones: number; active: boolean }) {
  const noteSteps = [2, 4, 3, 6, 5, 7, 4, 2, 5, 3, 6, 4, 7, 5, 3, 2]
  return (
    <svg viewBox="0 0 920 190" className="block h-auto w-full" role="img" aria-label={`Notasi birama ${barStart} sampai ${barStart + 3}`}>
      <rect width="920" height="190" fill={active ? '#f5f3ff' : 'white'} />
      {[58, 72, 86, 100, 114].map((y) => <line key={y} x1="58" x2="900" y1={y} y2={y} stroke="#111827" strokeWidth="1.4" />)}
      {[58, 268, 478, 688, 900].map((x, index) => <line key={x} x1={x} x2={x} y1="58" y2="114" stroke="#111827" strokeWidth={index === 4 ? 2.5 : 1.2} />)}
      <text x="8" y="106" fontSize="62" fontFamily="serif">𝄞</text>
      <text x="48" y="47" fontSize="11" fill="#6b7280">{barStart}</text>
      {barStart === 1 && <><text x="70" y="82" fontSize="20" fontWeight="700">4</text><text x="70" y="108" fontSize="20" fontWeight="700">4</text></>}
      {chords.map((chord, barIndex) => {
        const barX = 58 + barIndex * 210
        return (
          <g key={`${chord}-${barIndex}`}>
            <text x={barX + 18} y="31" fontSize="19" fontWeight="700" fill="#6d28d9">{transposeChord(chord, semitones)}</text>
            {[0, 1, 2, 3].map((noteIndex) => {
              const x = barX + 38 + noteIndex * 43
              const step = noteSteps[(barIndex * 4 + noteIndex + semitones + 24) % noteSteps.length]
              const y = 121 - step * 7
              return <g key={noteIndex}><ellipse cx={x} cy={y} rx="8" ry="5.5" fill="#111827" transform={`rotate(-18 ${x} ${y})`} /><line x1={x + 7} x2={x + 7} y1={y} y2={y - 34} stroke="#111827" strokeWidth="2" />{noteIndex === 1 && <path d={`M ${x - 14} ${y + 15} Q ${x + 8} ${y + 27}, ${x + 28} ${y + 9}`} fill="none" stroke="#111827" strokeWidth="1.4" />}</g>
            })}
          </g>
        )
      })}
      <text x="64" y="145" fontFamily="serif" fontStyle="italic" fontSize="15">{barStart === 9 ? 'mf  cresc.' : 'mp  legato'}</text>
      <text x="64" y="170" fontSize="13" fill="#4b5563">la — la —  melodi  Harkat  Studio</text>
    </svg>
  )
}

export default function ScoreStudioPage() {
  const params = useParams<{ id: string }>()
  const savedGeneration = useSyncExternalStore(
    subscribeToSessionStorage,
    () => sessionStorage.getItem(`generation:${params.id}`),
    () => null,
  )
  const generation = useMemo<SavedGeneration | null>(() => {
    if (!savedGeneration) return null
    try {
      return JSON.parse(savedGeneration) as SavedGeneration
    } catch {
      return null
    }
  }, [savedGeneration])
  const generatedScore = useMemo<Score | null>(() => {
    if (!generation?.score) return null
    const progression = generation.score.chords
    const rotate = (steps: number) => progression.map((_, index) => progression[(index + steps) % progression.length])
    return {
      title: generation.song?.title || 'Karya Harkat AI',
      creator: 'Harkat Hybrid Composer',
      key: generation.score.key,
      tempo: generation.score.tempo,
      meter: generation.score.meter,
      instruments: generation.score.instruments,
      sections: [
        { name: 'Intro', chords: progression },
        { name: 'Verse', chords: rotate(1) },
        { name: 'Chorus', chords: rotate(2) },
        { name: 'Outro', chords: progression },
      ],
    }
  }, [generation])
  const score = generatedScore || scoreCatalog[params.id] || scoreCatalog['1']
  const chordName = (degree: string) => chordsByKey[score.key]?.[degree] || degree
  const [instrumentSelection, setInstrumentSelection] = useState<string | null>(null)
  const selectedInstrument = instrumentSelection && score.instruments.includes(instrumentSelection)
    ? instrumentSelection
    : score.instruments[0]
  const [isPlaying, setIsPlaying] = useState(false)
  const [semitones, setSemitones] = useState(0)
  const [engraving, setEngraving] = useState(false)
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  const handleMuseScoreEngrave = async (format: 'pdf' | 'musicxml') => {
    const xml = generateScoreMusicXml(score, selectedInstrument, semitones, chordsByKey[score.key] || {})
    if (format === 'musicxml') {
      downloadFile(`${score.title || 'partitur'}.musicxml`, xml, 'application/vnd.recordare.musicxml+xml')
      return
    }

    setEngraving(true)
    setExportNotice(null)
    try {
      const res = await fetch('/api/engrave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          musicxml: xml,
          format: 'pdf',
          title: score.title || 'partitur',
        }),
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
      setExportNotice(err instanceof Error ? err.message : 'Ekspor MuseScore gagal')
    } finally {
      setEngraving(false)
    }
  }

  const sourceKeyIndex = pitchIndex[score.key.split(' ')[0]] ?? 0
  const targetKeyIndex = (sourceKeyIndex + semitones + 120) % 12
  const preferFlats = score.key.includes('b') || [1, 3, 8, 10].includes(targetKeyIndex)
  const displayedKey = `${transposePitch(score.key.split(' ')[0], semitones, preferFlats)} ${score.key.split(' ').slice(1).join(' ')}`

  return (
    <div className="flex min-h-screen flex-col bg-[#e5e7eb] text-gray-900">
      <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:px-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <Link href="/library" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft size={18} /> Library</Link>
          <Logo size="xs" showText={false} />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold font-serif">{score.title}</h1>
            <p className="text-xs text-gray-500">{score.creator} • {displayedKey} • {score.tempo} BPM • {score.meter}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            disabled={engraving}
            onClick={() => void handleMuseScoreEngrave('pdf')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
            title="Ekspor PDF resmi menggunakan mesin engraving MuseScore 4"
          >
            {engraving ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            <span>MuseScore 4 PDF</span>
          </button>
          <button
            onClick={() => void handleMuseScoreEngrave('musicxml')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            title="Unduh partitur MusicXML untuk dibuka di MuseScore Desktop"
          >
            <Download size={14} />
            <span>MusicXML</span>
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="rounded p-2 text-gray-600 hover:bg-gray-100" title={isPlaying ? 'Jeda' : 'Mainkan'}>{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
          <button onClick={() => window.print()} className="rounded p-2 text-gray-600 hover:bg-gray-100" title="Cetak"><Printer size={20} /></button>
        </div>
      </header>
      {exportNotice && (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800 flex justify-between items-center">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="font-bold underline ml-2">Tutup</button>
        </div>
      )}

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="w-full border-b border-gray-200 bg-white p-4 md:w-64 md:border-b-0 md:border-r">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Instrumen</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-1">
            {score.instruments.map((instrument, index) => (
              <button
                key={instrument}
                onClick={() => setInstrumentSelection(instrument)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${selectedInstrument === instrument ? 'bg-violet-100 font-semibold text-violet-700' : 'hover:bg-gray-100'}`}
              >
                <span>{instrument}</span><span className="text-xs text-gray-400">{index + 1}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            {generatedScore
              ? 'Partitur awal ini disusun otomatis dari genre dan struktur hasil generasi. Setiap instrumen dapat dipilih untuk melihat part-nya.'
              : 'Aransemen referensi untuk latihan. Bukan partitur resmi penerbit atau transkripsi berlisensi.'}
          </div>
          <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-700">Transpose Nada</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setSemitones((value) => Math.max(-12, value - 1))} className="flex items-center justify-center gap-1 rounded-lg border bg-white px-2 py-2 text-xs font-semibold hover:border-violet-400" title="Turunkan satu semitone"><ArrowDown size={14} /> Turun</button>
              <button onClick={() => setSemitones(0)} className="flex items-center justify-center rounded-lg border bg-white px-2 py-2 text-xs font-semibold hover:border-violet-400" title="Kembali ke nada asli"><RotateCcw size={14} /></button>
              <button onClick={() => setSemitones((value) => Math.min(12, value + 1))} className="flex items-center justify-center gap-1 rounded-lg border bg-white px-2 py-2 text-xs font-semibold hover:border-violet-400" title="Naikkan satu semitone">Naik <ArrowUp size={14} /></button>
            </div>
            <div className="mt-2 text-center text-sm font-bold text-violet-800">{displayedKey} <span className="font-normal">({semitones > 0 ? '+' : ''}{semitones} semitone)</span></div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8">
          <div className="mx-auto min-h-[1050px] max-w-[900px] bg-white p-6 shadow-xl sm:p-10 lg:p-14">
            <div className="mb-8 text-center font-serif">
              <h2 className="text-3xl font-bold sm:text-4xl">{score.title}</h2>
              <p className="mt-2 text-gray-500">Part {selectedInstrument}</p>
              {generation?.song?.prompt_used && <p className="mx-auto mt-3 max-w-2xl text-sm font-sans text-gray-400">Prompt: “{generation.song.prompt_used}”</p>}
            </div>

            <div className="mb-7 flex items-end justify-between border-b border-gray-300 pb-3 text-sm">
              <div><span className="font-serif text-lg italic">Moderato espressivo</span><div className="mt-1 font-semibold">♩ = {score.tempo}</div></div>
              <div className="text-right"><div className="font-semibold">{displayedKey}</div><div className="text-gray-500">{score.meter} • Full Score</div></div>
            </div>

            <section className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-4 font-semibold">Chord Map</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {score.sections.map((section) => (
                  <div key={section.name} className="rounded-lg border bg-white p-3">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-600">{section.name}</div>
                    <div className="flex gap-2 font-mono font-bold">{section.chords.map((chord, index) => <span key={`${chord}-${index}`} className="flex-1 rounded bg-violet-50 px-2 py-2 text-center">{transposeChord(chordName(chord), semitones, preferFlats)}</span>)}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-16">
              {score.sections.map((section, sectionIndex) => (
                <section key={section.name}>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500"><span>{section.name} • {selectedInstrument}</span><span>Bar {sectionIndex * 4 + 1}–{sectionIndex * 4 + 4}</span></div>
                  <div className="overflow-hidden border-y border-gray-300"><ProfessionalStaff chords={section.chords.map(chordName)} barStart={sectionIndex * 4 + 1} semitones={semitones} active={isPlaying && sectionIndex === 0} /></div>
                  <p className="mt-2 text-xs text-gray-400">Dinamika: {sectionIndex === 2 ? 'mf — crescendo' : 'mp'} • Artikulasi disesuaikan untuk {selectedInstrument}</p>
                </section>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
