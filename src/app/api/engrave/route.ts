import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { musicxml, midi_base64, format = 'pdf', title = 'score' } = body || {}

    if (!musicxml && !midi_base64) {
      return NextResponse.json(
        { error: 'Data musicxml atau midi_base64 wajib disertakan untuk engraving MuseScore.' },
        { status: 400 }
      )
    }

    const workerUrl = process.env.LOCAL_AI_URL || 'http://127.0.0.1:8010'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60_000)

    try {
      const response = await fetch(`${workerUrl}/engrave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ musicxml, midi_base64, format, title }),
        signal: controller.signal,
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        return NextResponse.json(
          { error: data?.detail || 'Gagal merender partitur dengan MuseScore CLI.' },
          { status: response.status }
        )
      }

      return NextResponse.json(data)
    } catch {
      return NextResponse.json(
        {
          error:
            'Worker MuseScore lokal belum aktif. Jalankan "npm run ai:local" di terminal untuk mengaktifkan rendering MuseScore 4.',
        },
        { status: 503 }
      )
    } finally {
      clearTimeout(timeout)
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Permintaan tidak valid' },
      { status: 400 }
    )
  }
}
