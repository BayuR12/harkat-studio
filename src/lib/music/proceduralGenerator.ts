const SAMPLE_RATE = 22050
const DURATION_SECONDS = 16

const hashPrompt = (value: string) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const writeAscii = (view: DataView, offset: number, value: string) => {
  for (let index = 0; index < value.length; index++) view.setUint8(offset + index, value.charCodeAt(index))
}

const wavDataUrl = (samples: Float32Array) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeAscii(view, 8, 'WAVEfmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)
  for (let index = 0; index < samples.length; index++) {
    const sample = Math.max(-1, Math.min(1, samples[index]))
    view.setInt16(44 + index * 2, sample < 0 ? sample * 32768 : sample * 32767, true)
  }
  return `data:audio/wav;base64,${Buffer.from(buffer).toString('base64')}`
}

export function generatePromptAudio(prompt: string, genre: string) {
  const seed = hashPrompt(`${genre}:${prompt}`)
  const presets: Record<string, { bpm: number; root: number; scale: number[]; brightness: number; koplo: boolean }> = {
    Dangdut: { bpm: 100, root: 55, scale: [0, 2, 3, 5, 7, 8, 10], brightness: 0.35, koplo: false },
    'Dangdut Koplo': { bpm: 142, root: 57, scale: [0, 2, 3, 5, 7, 9, 10], brightness: 0.45, koplo: true },
    Tarling: { bpm: 108, root: 60, scale: [0, 2, 4, 7, 9], brightness: 0.8, koplo: false },
    'Pop Indonesia': { bpm: 96, root: 60, scale: [0, 2, 4, 5, 7, 9, 11], brightness: 0.5, koplo: false },
    'Rock Indonesia': { bpm: 128, root: 52, scale: [0, 2, 3, 5, 7, 10], brightness: 0.65, koplo: false },
    Keroncong: { bpm: 84, root: 60, scale: [0, 2, 4, 5, 7, 9, 11], brightness: 0.7, koplo: false },
  }
  const preset = presets[genre] || presets['Pop Indonesia']
  const samples = new Float32Array(SAMPLE_RATE * DURATION_SECONDS)
  const beat = 60 / preset.bpm
  const noteLength = beat / 2

  for (let index = 0; index < samples.length; index++) {
    const time = index / SAMPLE_RATE
    const step = Math.floor(time / noteLength)
    const scaleIndex = (seed + step * 5 + (seed >>> (step % 16))) % preset.scale.length
    const midi = preset.root + preset.scale[scaleIndex] + (step % 8 > 5 ? 12 : 0)
    const frequency = 440 * 2 ** ((midi - 69) / 12)
    const phase = (time % noteLength) / noteLength
    const envelope = Math.exp(-phase * (genre === 'Tarling' ? 4 : 2.2))
    const fundamental = Math.sin(2 * Math.PI * frequency * time)
    const harmonic = Math.sin(2 * Math.PI * frequency * 2 * time) * preset.brightness
    const bassFrequency = 440 * 2 ** ((preset.root - 24 - 69) / 12)
    const bass = Math.sin(2 * Math.PI * bassFrequency * time) * (0.5 + 0.5 * Math.exp(-(time % beat) * 5))

    const beatPhase = time % beat
    const kick = Math.sin(2 * Math.PI * (75 - beatPhase * 30) * time) * Math.exp(-beatPhase * 25)
    const offBeat = (time + beat / 2) % beat
    const drumNoise = (((Math.imul(index + seed, 1103515245) >>> 16) / 32768) - 1) * Math.exp(-offBeat * (preset.koplo ? 42 : 28))
    const koploRoll = preset.koplo ? Math.sin(2 * Math.PI * 180 * time) * Math.exp(-((time % (beat / 4)) * 50)) : 0

    const fade = Math.min(1, time * 2, (DURATION_SECONDS - time) * 2)
    samples[index] = (fundamental * envelope * 0.28 + harmonic * envelope * 0.18 + bass * 0.18 + kick * 0.22 + drumNoise * 0.12 + koploRoll * 0.1) * fade
  }

  return { audioUrl: wavDataUrl(samples), bpm: preset.bpm }
}
