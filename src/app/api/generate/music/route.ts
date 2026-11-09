import { NextResponse } from 'next/server'
import { generatePromptAudio } from '@/lib/music/proceduralGenerator'
import { generateAiMusic } from '@/lib/music/aiProvider'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    const styles = typeof body?.styles === 'string' && body.styles.trim()
      ? body.styles.trim().slice(0, 300)
      : typeof body?.genre === 'string' && body.genre.trim()
        ? body.genre.trim()
        : 'Pop Indonesia'
    const requestedTitle = typeof body?.title === 'string' ? body.title.trim() : ''
    const requestedModel = typeof body?.model === 'string' ? body.model.trim() : 'Harkat Fusion v1'
    const requestedDuration = typeof body?.duration === 'number' ? body.duration : undefined
    const requestedElevenLabsApiKey = typeof body?.elevenLabsApiKey === 'string'
      ? body.elevenLabsApiKey.trim()
      : typeof body?.apiKey === 'string' && body.apiKey.trim().startsWith('sk_') && !body?.model?.includes('kie')
        ? body.apiKey.trim()
        : undefined
    const requestedKieApiKey = typeof body?.kieApiKey === 'string'
      ? body.kieApiKey.trim()
      : typeof body?.apiKey === 'string' && body?.model?.includes('kie')
        ? body.apiKey.trim()
        : undefined
    const requestedSunoApiKey = typeof body?.sunoApiKey === 'string'
      ? body.sunoApiKey.trim()
      : typeof body?.apiKey === 'string'
        ? body.apiKey.trim()
        : undefined
    const requestedSunoApiUrl = typeof body?.sunoApiUrl === 'string' ? body.sunoApiUrl.trim() : undefined
    const instrumental = body?.instrumental === true
    const lyrics = typeof body?.lyrics === 'string' ? body.lyrics.trim() : ''

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt wajib diisi' },
        { status: 400 }
      )
    }

    const productionPrompt = `${prompt}, styles: ${styles}${instrumental ? ', instrumental tanpa vokal' : ''}${lyrics ? `, lirik dan struktur: ${lyrics}` : ''}`
    const generated = generatePromptAudio(productionPrompt, styles)
    const aiResult = await generateAiMusic(productionPrompt, styles, {
      title: requestedTitle,
      lyrics,
      instrumental,
      model: requestedModel,
      duration: requestedDuration,
      elevenLabsApiKey: requestedElevenLabsApiKey,
      kieApiKey: requestedKieApiKey,
      sunoApiKey: requestedSunoApiKey,
      sunoApiUrl: requestedSunoApiUrl,
    })
    const jobId = 'harkat-job-' + Math.random().toString(36).substring(2, 10)
    const scorePresets: Record<string, { key: string; chords: string[]; instruments: string[] }> = {
      Dangdut: { key: 'A Minor', chords: ['Am', 'G', 'F', 'E'], instruments: ['Vokal', 'Gendang', 'Suling', 'Bass', 'Keyboard'] },
      'Dangdut Koplo': { key: 'A Minor', chords: ['Am', 'F', 'G', 'E'], instruments: ['Vokal', 'Kendang Koplo', 'Ketipung', 'Bass', 'Keyboard'] },
      Tarling: { key: 'C Mayor', chords: ['C', 'F', 'G', 'C'], instruments: ['Vokal', 'Gitar Tarling', 'Suling', 'Bass', 'Perkusi'] },
      'Pop Indonesia': { key: 'C Mayor', chords: ['C', 'G', 'Am', 'F'], instruments: ['Vokal', 'Piano', 'Gitar', 'Bass', 'Drum'] },
      'Rock Indonesia': { key: 'E Minor', chords: ['Em', 'C', 'G', 'D'], instruments: ['Vokal', 'Gitar 1', 'Gitar 2', 'Bass', 'Drum'] },
      Keroncong: { key: 'C Mayor', chords: ['C', 'F', 'G7', 'C'], instruments: ['Vokal', 'Cak', 'Cuk', 'Cello', 'Bass', 'Biola', 'Flute'] },
    }
    const normalizedStyles = styles.toLocaleLowerCase('id-ID')
    const presetName = Object.keys(scorePresets).find(name => normalizedStyles.includes(name.toLocaleLowerCase('id-ID'))) || 'Pop Indonesia'
    const score = scorePresets[presetName]
    const mockResult = {
      jobId,
      status: 'completed',
      song: {
        title: requestedTitle || 'Karya Harkat',
        genre: styles,
        prompt_used: prompt,
        provider: aiResult ? `${requestedModel} • ${aiResult.provider} + Harkat Local Composer` : 'Harkat Local Composer (provider AI tidak tersedia)',
        bpm: generated.bpm,
        audio_url: aiResult?.audioUrl || generated.audioUrl,
      },
      tracks: [
        ...(aiResult ? [{ id: 'ai', name: 'AI MusicGen', role: 'AI master', audio_url: aiResult.audioUrl }] : []),
        { id: 'local', name: 'Harkat Local Layer', role: 'Rhythm & melody accompaniment', audio_url: generated.audioUrl },
      ],
      score: { ...score, tempo: generated.bpm, meter: '4/4' },
    }

    return NextResponse.json(mockResult)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Format JSON tidak valid' }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : 'Gagal memproses prompt lagu'
    console.error('Generate music API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
