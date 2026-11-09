export type TranscribedNote = {
  midi: number
  name: string
  frequency: number
  start: number
  duration: number
}

const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

const pitchFromFrame = (frame: Float32Array, sampleRate: number) => {
  let energy = 0
  for (const sample of frame) energy += sample * sample
  if (Math.sqrt(energy / frame.length) < 0.015) return null

  let bestLag = 0
  let bestCorrelation = 0
  const minLag = Math.floor(sampleRate / 1000)
  const maxLag = Math.min(Math.floor(sampleRate / 65), frame.length / 2)
  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0
    for (let i = 0; i < frame.length - lag; i += 2) correlation += frame[i] * frame[i + lag]
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation
      bestLag = lag
    }
  }
  return bestLag ? sampleRate / bestLag : null
}

export async function transcribeAudio(file: File, onProgress: (progress: number) => void) {
  const context = new AudioContext()
  try {
    const source = await context.decodeAudioData(await file.arrayBuffer())
    const targetRate = 8000
    const stride = Math.max(1, Math.floor(source.sampleRate / targetRate))
    const input = source.getChannelData(0)
    const sampleCount = Math.min(Math.floor(input.length / stride), targetRate * 90)
    const mono = new Float32Array(sampleCount)
    for (let i = 0; i < sampleCount; i++) mono[i] = input[i * stride]

    const frameSize = 1024
    const hopSize = 800
    const raw: { midi: number; frequency: number; start: number }[] = []
    const frames = Math.max(1, Math.floor((mono.length - frameSize) / hopSize))
    for (let frameIndex = 0; frameIndex < frames; frameIndex++) {
      const offset = frameIndex * hopSize
      const frequency = pitchFromFrame(mono.subarray(offset, offset + frameSize), targetRate)
      if (frequency && frequency >= 65 && frequency <= 1000) {
        const midi = Math.round(69 + 12 * Math.log2(frequency / 440))
        raw.push({ midi, frequency, start: offset / targetRate })
      }
      if (frameIndex % 20 === 0) onProgress(Math.round((frameIndex / frames) * 100))
      if (frameIndex % 100 === 0) await new Promise((resolve) => setTimeout(resolve, 0))
    }

    const notes: TranscribedNote[] = []
    for (const detected of raw) {
      const previous = notes.at(-1)
      if (previous && previous.midi === detected.midi && detected.start - (previous.start + previous.duration) < 0.16) {
        previous.duration = Math.max(0.125, detected.start - previous.start + hopSize / targetRate)
      } else {
        const octave = Math.floor(detected.midi / 12) - 1
        notes.push({ ...detected, name: `${noteNames[detected.midi % 12]}${octave}`, duration: hopSize / targetRate })
      }
    }
    onProgress(100)
    return { notes, duration: source.duration }
  } finally {
    await context.close()
  }
}

export function toMusicXml(title: string, notes: TranscribedNote[], bpm: number) {
  const divisions = 4
  const body = notes.map((note) => {
    const octave = Math.floor(note.midi / 12) - 1
    const pitchClass = note.midi % 12
    const steps = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B']
    const alters = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
    const duration = Math.max(1, Math.round(note.duration * (bpm / 60) * divisions))
    return `<note><pitch><step>${steps[pitchClass]}</step>${alters[pitchClass] ? '<alter>1</alter>' : ''}<octave>${octave}</octave></pitch><duration>${duration}</duration><type>quarter</type></note>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8"?><score-partwise version="4.0"><work><work-title>${title.replace(/[<>&]/g, '')}</work-title></work><part-list><score-part id="P1"><part-name>Transcription</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>${divisions}</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes><direction><sound tempo="${bpm}"/></direction>${body}</measure></part></score-partwise>`
}

const variableLength = (value: number) => {
  const bytes = [value & 0x7f]
  while ((value >>= 7)) bytes.unshift((value & 0x7f) | 0x80)
  return bytes
}

export function toMidi(notes: TranscribedNote[], bpm: number) {
  const ticks = 480
  const track: number[] = [0, 0xff, 0x51, 3, ...[(60000000 / bpm) >> 16 & 255, (60000000 / bpm) >> 8 & 255, (60000000 / bpm) & 255]]
  for (const note of notes) {
    track.push(0, 0x90, note.midi, 88)
    track.push(...variableLength(Math.max(1, Math.round(note.duration * bpm / 60 * ticks))), 0x80, note.midi, 0)
  }
  track.push(0, 0xff, 0x2f, 0)
  const bytes = [0x4d,0x54,0x68,0x64,0,0,0,6,0,0,0,1,ticks>>8,ticks&255,0x4d,0x54,0x72,0x6b,(track.length>>>24)&255,(track.length>>>16)&255,(track.length>>>8)&255,track.length&255,...track]
  return new Uint8Array(bytes)
}
