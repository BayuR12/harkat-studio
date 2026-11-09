import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const incoming = await request.formData()
  const file = incoming.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File audio wajib diunggah.' }, { status: 400 })
  }

  const body = new FormData()
  body.append('file', file, file.name)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10 * 60_000)
  try {
    const response = await fetch(`${process.env.LOCAL_AI_URL || 'http://127.0.0.1:8010'}/transcribe`, {
      method: 'POST',
      body,
      signal: controller.signal,
    })
    const result = await response.json()
    if (!response.ok) return NextResponse.json({ error: result.detail || 'Transkripsi lokal gagal.' }, { status: response.status })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Worker Basic Pitch tidak tersedia.' }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}
