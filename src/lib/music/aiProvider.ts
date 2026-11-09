import fs from 'fs'
import path from 'path'
import { InferenceClient } from '@huggingface/inference'

const isConfigured = (token?: string) => Boolean(token && !/your_|placeholder|demo|isi_/i.test(token))

type LoudlySong = {
  music_file_path?: string
  model?: string
}

export type MusicGenerateOptions = {
  title?: string
  lyrics?: string
  instrumental?: boolean
  model?: string
  duration?: number
  sunoApiKey?: string
  sunoApiUrl?: string
  elevenLabsApiKey?: string
  kieApiKey?: string
}

/**
 * Menyimpan audio stream, buffer, data URI, atau remote URL ke direktori lokal (public/audio)
 * Mengembalikan path relatif lokal publik seperti `/audio/xxx.mp3`
 */
export async function saveAudioToLocal(
  audioSource: string | Buffer,
  prefix = 'harkat'
): Promise<string> {
  try {
    const publicAudioDir = path.join(process.cwd(), 'public', 'audio')
    if (!fs.existsSync(publicAudioDir)) {
      fs.mkdirSync(publicAudioDir, { recursive: true })
    }

    const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.mp3`
    const targetPath = path.join(publicAudioDir, filename)

    if (Buffer.isBuffer(audioSource)) {
      fs.writeFileSync(targetPath, audioSource)
      return `/audio/${filename}`
    }

    if (typeof audioSource !== 'string' || !audioSource.trim()) {
      return audioSource
    }

    const trimmed = audioSource.trim()

    // Jika sudah berupa path lokal /audio/...
    if (trimmed.startsWith('/audio/') || (trimmed.startsWith('/') && !trimmed.startsWith('//'))) {
      return trimmed
    }

    // Jika berupa data URI (base64)
    if (trimmed.startsWith('data:audio') || trimmed.startsWith('data:application/octet-stream')) {
      const parts = trimmed.split(',')
      if (parts[1]) {
        const buffer = Buffer.from(parts[1], 'base64')
        fs.writeFileSync(targetPath, buffer)
        return `/audio/${filename}`
      }
    }

    // Jika berupa Remote URL (HTTP / HTTPS)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 35_000)
      try {
        const res = await fetch(trimmed, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HarkatStudio/1.0',
          },
        })
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer()
          const buffer = Buffer.from(arrayBuf)
          if (buffer.length > 0) {
            fs.writeFileSync(targetPath, buffer)
            return `/audio/${filename}`
          }
        }
      } catch (err) {
        console.warn(`[saveAudioToLocal] Gagal mengunduh audio remote (${trimmed}):`, err instanceof Error ? err.message : err)
      } finally {
        clearTimeout(timeout)
      }
    }
  } catch (error) {
    console.warn('[saveAudioToLocal] Error saat menyimpan audio lokal:', error instanceof Error ? error.message : error)
  }

  // Fallback jika unduh gagal: kembalikan source asli
  return typeof audioSource === 'string' ? audioSource : ''
}

/**
 * Integrasi Suno AI Adapter
 * Mendukung third-party provider Suno terpopuler: MusicAPI.ai, Apiframe, dan standard Suno REST wrappers
 */
async function tryMusicApi(apiKey: string, prompt: string, genre: string, options?: MusicGenerateOptions) {
  const cleanKey = apiKey.trim().replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim()
  const isCustom = Boolean(options?.lyrics?.trim())
  const requestedModel = (options?.model || '').toLowerCase()
  let mv = 'sonic-v6-mini'
  if (requestedModel.includes('wild')) {
    mv = 'sonic-v6-wild'
  } else if (requestedModel.includes('pro') || requestedModel === 'suno-v6' || requestedModel === 'v6') {
    mv = 'sonic-v6'
  } else if (requestedModel.includes('mini') || requestedModel.includes('v6-mini')) {
    mv = 'sonic-v6-mini'
  } else if (requestedModel.includes('v5-5') || requestedModel.includes('v5.5')) {
    mv = 'sonic-v5-5'
  } else if (requestedModel.includes('v5')) {
    mv = 'sonic-v5'
  } else if (requestedModel.includes('v4')) {
    mv = 'sonic-v4'
  } else if (requestedModel.includes('v3')) {
    mv = 'sonic-v3-5'
  }

  const body = {
    task_type: 'create_music',
    custom_mode: isCustom,
    prompt: isCustom ? options?.lyrics?.trim() : `${genre}, ${prompt}`.slice(0, 500),
    tags: genre.slice(0, 200),
    title: options?.title || 'Karya Harkat Studio',
    mv,
    make_instrumental: Boolean(options?.instrumental),
  }

  const res = await fetch('https://api.musicapi.ai/api/v1/sonic/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await res.json().catch(() => ({})) as Record<string, any>
  if (!res.ok) {
    const errorDetail = json.error || json.message || json.detail || `MusicAPI HTTP ${res.status}`
    throw new Error(errorDetail)
  }

  const taskId = json.task_id || json.data?.task_id || (Array.isArray(json.data) && json.data[0]?.task_id)
  if (!taskId) {
    if (json.audio_url) return { audioUrl: json.audio_url as string, provider: 'Suno AI (MusicAPI)' }
    throw new Error(json.error || 'MusicAPI tidak mengembalikan task_id')
  }

  // Poll status setiap 6 detik hingga selesai (maks 6 menit untuk antrean Suno Cloud)
  const startTime = Date.now()
  console.log(`[MusicAPI] Task ${taskId} created successfully. Starting polling...`)
  while (Date.now() - startTime < 360_000) {
    await new Promise(r => setTimeout(r, 6000))
    try {
      const pollRes = await fetch(`https://api.musicapi.ai/api/v1/sonic/task/${taskId}`, {
        headers: { 'Authorization': `Bearer ${cleanKey}` },
      })
      if (!pollRes.ok) {
        console.warn(`[MusicAPI] Poll HTTP ${pollRes.status} for task ${taskId}`)
        continue
      }
      const pollData = await pollRes.json().catch(() => ({})) as Record<string, any>
      const items = Array.isArray(pollData.data) ? pollData.data : (pollData.data ? [pollData.data] : [])
      const firstItem = items[0] || {}
      const state = String(firstItem.state || firstItem.status || pollData.state || pollData.status || '').toLowerCase()
      const audioUrl = firstItem.audio_url || items[1]?.audio_url || pollData.audio_url || pollData.response?.audio_url

      console.log(`[MusicAPI] Task ${taskId} state: "${state}", hasAudio: ${Boolean(audioUrl)} (${Math.round((Date.now() - startTime) / 1000)}s)`)

      if (state === 'succeeded' || state === 'completed' || (audioUrl && state !== 'failed')) {
        if (audioUrl) {
          console.log(`[MusicAPI] Task ${taskId} SUCCEEDED! Audio URL: ${audioUrl}`)
          return { audioUrl, provider: 'Suno AI (MusicAPI.ai)' }
        }
      } else if (state === 'failed') {
        throw new Error(firstItem.error || pollData.error || pollData.message || 'Generasi Suno AI gagal pada server MusicAPI')
      }
    } catch (pollErr: any) {
      if (pollErr?.message && pollErr.message.includes('Generasi Suno AI gagal')) {
        throw pollErr
      }
    }
  }

  throw new Error('Generasi Suno AI memerlukan waktu lebih lama karena antrean cloud. Silakan coba klik Create kembali.')
}

async function tryApiframe(apiKey: string, prompt: string, genre: string, options?: MusicGenerateOptions) {
  const isCustom = Boolean(options?.lyrics?.trim())
  const body = {
    model: 'suno',
    sunoParams: {
      custom_mode: isCustom,
      prompt: isCustom ? options?.lyrics?.trim() : `${genre}, ${prompt}`.slice(0, 500),
      tags: genre.slice(0, 200),
      title: options?.title || 'Karya Harkat Studio',
      make_instrumental: Boolean(options?.instrumental),
    }
  }

  const res = await fetch('https://api.apiframe.ai/v2/music/generate', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await res.json().catch(() => ({})) as Record<string, any>
  if (!res.ok) {
    throw new Error(json.message || json.error || `Apiframe (${res.status}): API Key tidak valid`)
  }

  const jobId = json.jobId || json.id || json.data?.id
  if (!jobId) {
    if (json.audio_url) return { audioUrl: json.audio_url as string, provider: 'Suno AI (Apiframe)' }
    throw new Error('Apiframe tidak mengembalikan jobId')
  }

  const startTime = Date.now()
  while (Date.now() - startTime < 180_000) {
    await new Promise(r => setTimeout(r, 5000))
    const pollRes = await fetch(`https://api.apiframe.ai/v2/jobs/${jobId}`, {
      headers: { 'X-API-Key': apiKey, 'Authorization': `Bearer ${apiKey}` },
    })
    if (!pollRes.ok) continue
    const pollData = await pollRes.json().catch(() => ({})) as Record<string, any>
    const status = String(pollData.status || pollData.data?.status || '').toLowerCase()
    if (status === 'completed' || status === 'succeeded') {
      const audioUrl = pollData.response?.audio_url || pollData.audio_url || pollData.data?.audio_url
      if (audioUrl) {
        return { audioUrl, provider: 'Suno AI (Apiframe)' }
      }
    } else if (status === 'failed') {
      throw new Error(pollData.error || 'Generasi Suno AI gagal pada server Apiframe')
    }
  }

  throw new Error('Generasi Suno AI sedang diproses di cloud.')
}

async function tryGenericSuno(apiKey: string, prompt: string, genre: string, options?: MusicGenerateOptions) {
  const apiUrl = (options?.sunoApiUrl?.trim() || process.env.SUNO_API_URL || 'https://api.sunoaiapi.com').replace(/\/$/, '')
  const isCustom = Boolean(options?.lyrics?.trim())
  let endpoint = isCustom ? `${apiUrl}/api/custom_generate` : `${apiUrl}/api/generate`
  if (apiUrl.endsWith('/submit') || apiUrl.endsWith('/generate') || apiUrl.endsWith('/music') || apiUrl.endsWith('/create')) {
    endpoint = apiUrl
  }

  const payload = isCustom
    ? {
        prompt: options?.lyrics?.trim(),
        tags: genre.slice(0, 200),
        title: options?.title || 'Karya Harkat Studio',
        make_instrumental: Boolean(options?.instrumental),
        wait_audio: true,
      }
    : {
        prompt: `${genre}, ${prompt}`.slice(0, 500),
        make_instrumental: Boolean(options?.instrumental),
        wait_audio: true,
      }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3 * 60_000)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'api-key': apiKey,
      'X-API-Key': apiKey,
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`Suno API (${response.status}): ${errText.slice(0, 150)}`)
    }

    const raw = await response.json()
    let audioUrl: string | undefined
    if (Array.isArray(raw) && raw[0]?.audio_url) {
      audioUrl = raw[0].audio_url
    } else if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, any>
      if (typeof obj.audio_url === 'string') audioUrl = obj.audio_url
      else if (Array.isArray(obj.data) && obj.data[0]?.audio_url) audioUrl = obj.data[0].audio_url
      else if (obj.data && typeof obj.data.audio_url === 'string') audioUrl = obj.data.audio_url
      else if (obj.response && typeof obj.response.audio_url === 'string') audioUrl = obj.response.audio_url
      else if (Array.isArray(obj.response) && obj.response[0]?.audio_url) audioUrl = obj.response[0].audio_url
    }

    if (!audioUrl) {
      throw new Error('Suno API merespons tetapi belum mengembalikan URL audio')
    }

    return {
      audioUrl,
      provider: 'Suno AI (Cloud)',
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function generateWithSuno(prompt: string, genre: string, options?: MusicGenerateOptions) {
  const apiKey = options?.sunoApiKey?.trim() || process.env.SUNO_API_KEY
  if (!isConfigured(apiKey)) {
    throw new Error('Suno AI memerlukan API Key untuk menghasilkan vokal menyanyi asli. Masukkan API Key Suno Anda pada formulir.')
  }

  // 1. Coba MusicAPI.ai terlebih dahulu (provider paling umum untuk Suno)
  let musicApiError: string | null = null
  try {
    const musicApiResult = await tryMusicApi(apiKey!, prompt, genre, options)
    if (musicApiResult) return musicApiResult
  } catch (err: any) {
    musicApiError = err?.message || 'MusicAPI error'
    console.warn('MusicAPI attempt failed:', musicApiError)
  }

  // 2. Coba Apiframe
  let apiframeError: string | null = null
  try {
    const apiframeResult = await tryApiframe(apiKey!, prompt, genre, options)
    if (apiframeResult) return apiframeResult
  } catch (err: any) {
    apiframeError = err?.message || null
  }

  // 3. Coba Kie.ai (AI Music API Suno Aggregator)
  let kieError: string | null = null
  try {
    const kieApiKey = options?.kieApiKey || apiKey
    const kieResult = await tryKieAi(kieApiKey!, prompt, genre, options)
    if (kieResult) return kieResult
  } catch (err: any) {
    kieError = err?.message || null
  }

  // 4. Coba generic/custom Suno API wrapper jika ada URL custom
  try {
    return await tryGenericSuno(apiKey!, prompt, genre, options)
  } catch (err: any) {
    throw new Error(kieError || musicApiError || apiframeError || err?.message || 'Gagal menghubungkan API Key ke server Suno/Kie.ai')
  }
}

/**
 * Integrasi Kie.ai (Suno Music API Aggregator)
 * Endpoint: POST https://api.kie.ai/api/v1/jobs/createTask
 * Query: GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...
 */
async function tryKieAi(apiKey: string, prompt: string, genre: string, options?: MusicGenerateOptions) {
  const cleanKey = apiKey.trim().replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim()
  const isCustom = Boolean(options?.lyrics?.trim())
  const requestedModel = (options?.model || '').toLowerCase()
  let kieModel = 'V4'
  if (requestedModel.includes('v6') || requestedModel.includes('sonic-v6')) {
    kieModel = 'V6'
  } else if (requestedModel.includes('v3') || requestedModel.includes('3.5')) {
    kieModel = 'V3.5'
  } else if (requestedModel.includes('v5')) {
    kieModel = 'V5'
  }

  const baseUrl = (process.env.KIE_API_URL || 'https://api.kie.ai').replace(/\/$/, '')
  const title = options?.title || 'Karya Harkat Studio'
  const style = genre.slice(0, 500)
  const lyrics = isCustom ? options?.lyrics?.trim() : undefined

  const payload = {
    model: 'ai-music-api/generate',
    input: {
      prompt: isCustom ? (lyrics || prompt).slice(0, 3000) : `${genre}, ${prompt}`.slice(0, 3000),
      custom_mode: isCustom,
      instrumental: Boolean(options?.instrumental),
      style,
      title,
      lyrics,
      model: kieModel,
    }
  }

  const createRes = await fetch(`${baseUrl}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const createJson = await createRes.json().catch(() => ({})) as Record<string, any>
  if (!createRes.ok) {
    const errorMsg = createJson.msg || createJson.message || createJson.error || `Kie.ai HTTP ${createRes.status}`
    throw new Error(`Kie.ai API gagal: ${errorMsg}`)
  }

  const taskId = createJson.data?.taskId || createJson.data?.id || createJson.taskId || createJson.id
  if (!taskId) {
    if (createJson.data?.audio_url || createJson.audio_url) {
      return {
        audioUrl: (createJson.data?.audio_url || createJson.audio_url) as string,
        provider: `Kie.ai Suno (${kieModel})`,
      }
    }
    throw new Error(createJson.msg || 'Kie.ai tidak mengembalikan taskId')
  }

  console.log(`[Kie.ai] Task created: ${taskId}. Memulai polling status...`)

  // Polling status setiap 5 detik hingga 6 menit
  const startTime = Date.now()
  while (Date.now() - startTime < 360_000) {
    await new Promise(r => setTimeout(r, 5000))
    try {
      const pollRes = await fetch(`${baseUrl}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
        headers: {
          'Authorization': `Bearer ${cleanKey}`,
        },
      })

      if (!pollRes.ok) {
        console.warn(`[Kie.ai] Poll HTTP ${pollRes.status} for task ${taskId}`)
        continue
      }

      const pollJson = await pollRes.json().catch(() => ({})) as Record<string, any>
      const data = pollJson.data || pollJson
      const status = String(data.status || data.state || '').toLowerCase()

      console.log(`[Kie.ai] Task ${taskId} status: "${status}" (${Math.round((Date.now() - startTime) / 1000)}s)`)

      if (status === 'success' || status === 'completed') {
        const responseData = data.response || data.data || data
        let audioUrl: string | undefined
        if (responseData?.audio_url) {
          audioUrl = responseData.audio_url
        } else if (Array.isArray(responseData)) {
          audioUrl = responseData[0]?.audio_url || responseData[1]?.audio_url
        } else if (Array.isArray(responseData?.data)) {
          audioUrl = responseData.data[0]?.audio_url || responseData.data[1]?.audio_url
        } else if (data.audio_url) {
          audioUrl = data.audio_url
        }

        if (audioUrl) {
          return {
            audioUrl,
            provider: `Kie.ai Suno (${kieModel})`,
          }
        }
      } else if (status === 'fail' || status === 'failed' || status === 'error') {
        const failReason = data.fail_reason || data.error || data.message || pollJson.msg || 'Generasi musik gagal di server Kie.ai'
        throw new Error(failReason)
      }
    } catch (pollErr: any) {
      if (pollErr?.message && (pollErr.message.includes('gagal') || pollErr.message.includes('fail'))) {
        throw pollErr
      }
    }
  }

  throw new Error('Generasi musik Kie.ai membutuhkan waktu lebih lama di cloud.')
}

async function generateWithKieAi(prompt: string, genre: string, options?: MusicGenerateOptions) {
  const apiKey = (
    options?.kieApiKey ||
    options?.sunoApiKey ||
    process.env.KIE_API_KEY ||
    process.env.MUSIC_AI_API_KEY
  )?.trim()

  if (!isConfigured(apiKey)) {
    throw new Error('Kie.ai memerlukan API Key. Masukkan API Key Kie.ai Anda pada formulir.')
  }

  return await tryKieAi(apiKey!, prompt, genre, options)
}

async function generateWithLoudly(prompt: string) {
  const apiKey = process.env.LOUDLY_API_KEY || process.env.MUSIC_AI_API_KEY
  if (process.env.MUSIC_AI_PROVIDER !== 'loudly' || !isConfigured(apiKey)) return null

  const form = new FormData()
  form.set('prompt', prompt.slice(0, 3000))
  form.set('duration', String(Math.min(420, Math.max(30, Number(process.env.LOUDLY_DURATION || 180)))))
  form.set('model', process.env.LOUDLY_MODEL || 'VEGA_2')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5 * 60_000)
  try {
    const response = await fetch(`${process.env.LOUDLY_API_URL || 'https://soundtracks.loudly.com'}/api/ai/prompt/songs`, {
      method: 'POST',
      headers: { 'API-KEY': apiKey! },
      body: form,
      signal: controller.signal,
    })
    const payload = await response.json().catch(() => null) as LoudlySong | { detail?: string; message?: string; error?: string; error_description?: string } | null
    if (!response.ok) {
      const detail = payload && ('error_description' in payload ? payload.error_description : 'error' in payload ? payload.error : 'detail' in payload ? payload.detail : 'message' in payload ? payload.message : undefined)
      throw new Error(detail || `Loudly API gagal (${response.status})`)
    }
    if (!payload || !('music_file_path' in payload) || !payload.music_file_path) {
      throw new Error('Loudly tidak mengembalikan URL audio')
    }
    return { audioUrl: payload.music_file_path, provider: `Loudly ${payload.model || process.env.LOUDLY_MODEL || 'VEGA_2'}` }
  } finally {
    clearTimeout(timeout)
  }
}

async function generateWithLocalMusicGen(productionPrompt: string, durationSeconds?: number) {
  const localController = new AbortController()
  const localTimeout = setTimeout(() => localController.abort(), 10 * 60_000)
  try {
    const localResponse = await fetch(`${process.env.LOCAL_AI_URL || 'http://127.0.0.1:8010'}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: productionPrompt,
        duration_seconds: durationSeconds || Number(process.env.LOCAL_MUSIC_DURATION || 5),
        model: process.env.LOCAL_MUSIC_MODEL || 'facebook/musicgen-small',
      }),
      signal: localController.signal,
    })
    if (localResponse.ok) {
      const result = await localResponse.json() as { audio_url: string; provider?: string }
      return { audioUrl: result.audio_url, provider: result.provider || 'Local MusicGen' }
    }
  } catch (error) {
    console.info('Local MusicGen unavailable.', error instanceof Error ? error.message : error)
  } finally {
    clearTimeout(localTimeout)
  }
  return null
}

async function generateWithElevenLabs(prompt: string, genre: string, options?: MusicGenerateOptions) {
  const apiKey = (
    options?.elevenLabsApiKey || 
    (options?.sunoApiKey?.startsWith('sk_') ? options?.sunoApiKey : undefined) ||
    process.env.ELEVENLABS_API_KEY || 
    (process.env.MUSIC_AI_API_KEY?.startsWith('sk_') ? process.env.MUSIC_AI_API_KEY : undefined)
  )?.trim()

  if (!isConfigured(apiKey)) {
    throw new Error('ElevenLabs memerlukan API Key (berawalan sk_). Masukkan API Key ElevenLabs Anda pada formulir.')
  }

  const requestedModel = (options?.model || '').toLowerCase()
  const modelId = requestedModel.includes('v1') ? 'music_v1' : (process.env.ELEVENLABS_MODEL || 'music_v2')
  const durationSeconds = options?.duration || 30
  const durationMs = Math.min(600_000, Math.max(5_000, durationSeconds * 1000))

  // ElevenLabs Music API mewajibkan panjang prompt <= 4100 karakter
  let basePrompt = prompt.trim()
  if (!basePrompt.toLowerCase().includes(genre.toLowerCase())) {
    basePrompt = `${genre}, ${basePrompt}`
  }

  // Jika prompt belum menyertakan lirik, tambahkan cuplikan lirik
  if (options?.lyrics?.trim() && !basePrompt.includes('lirik') && !basePrompt.includes(options.lyrics.slice(0, 30))) {
    basePrompt = `${basePrompt}. Lirik lagu: ${options.lyrics.trim()}`
  }

  // Potong secara aman di bawah batas 4100 karakter ElevenLabs (maksimal 3900 karakter)
  const cleanPrompt = basePrompt.length > 3900 ? basePrompt.slice(0, 3900) + '...' : basePrompt

  const body: Record<string, any> = {
    prompt: cleanPrompt,
    music_length_ms: durationMs,
    model_id: modelId,
    force_instrumental: Boolean(options?.instrumental),
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5 * 60_000)

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/music/compose', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errJson = await res.json().catch(() => null)
      let message = ''
      if (Array.isArray(errJson?.detail)) {
        message = errJson.detail.map((d: any) => d.msg || d.message || JSON.stringify(d)).join('; ')
      } else {
        const detail = errJson?.detail || errJson?.message || errJson?.error
        message = typeof detail === 'object' ? (detail.message || JSON.stringify(detail)) : String(detail || `HTTP ${res.status}`)
      }

      if (message.includes('missing the permission music_generation') || errJson?.detail?.status === 'missing_permissions') {
        throw new Error(
          'API Key ElevenLabs terdeteksi valid, namun belum memiliki izin "music_generation". Buka ElevenLabs Dashboard (elevenlabs.io) > Developers > API Keys > Edit Key > aktifkan izin "music_generation" (atau buat API Key baru dengan unrestricted permissions).'
        )
      }
      throw new Error(`ElevenLabs Music API gagal (${res.status}): ${message}`)
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('audio') || contentType.includes('octet-stream')) {
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const filename = `elevenlabs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.mp3`
      const publicAudioDir = path.join(process.cwd(), 'public', 'audio')
      if (!fs.existsSync(publicAudioDir)) {
        fs.mkdirSync(publicAudioDir, { recursive: true })
      }
      fs.writeFileSync(path.join(publicAudioDir, filename), buffer)
      return {
        audioUrl: `/audio/${filename}`,
        provider: `ElevenLabs Music (${modelId})`,
      }
    } else {
      const json = await res.json().catch(() => ({})) as Record<string, any>
      const audioUrl = json.audio_url || json.url || json.data?.audio_url
      if (audioUrl) {
        return {
          audioUrl: String(audioUrl),
          provider: `ElevenLabs Music (${modelId})`,
        }
      }
      throw new Error('ElevenLabs tidak mengembalikan file audio')
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function generateAiMusic(
  prompt: string,
  genre: string,
  options?: MusicGenerateOptions
) {
  const requestedModel = (options?.model || '').toLowerCase()

  // Mode Instant Aransemen: langsung bypass AI neural untuk hasil instan (< 1 detik)
  if (requestedModel.includes('instant') || requestedModel.includes('synth') || requestedModel.includes('procedural')) {
    return null
  }

  const finalizeResult = async (res: { audioUrl: string; provider: string } | null, prefix = 'harkat') => {
    if (!res || !res.audioUrl) return res
    try {
      const localUrl = await saveAudioToLocal(res.audioUrl, prefix)
      return { ...res, audioUrl: localUrl }
    } catch {
      return res
    }
  }

  const productionPrompt = `${genre}, Indonesian music production, ${prompt}`
  const configuredProvider = (process.env.MUSIC_AI_PROVIDER || 'elevenlabs').toLowerCase()
  const targetDuration = options?.duration || Number(process.env.LOCAL_MUSIC_DURATION || 5)

  const isKie = 
    requestedModel.includes('kie') ||
    Boolean(options?.kieApiKey) ||
    configuredProvider === 'kie'

  // 1. Coba Kie.ai jika model Kie.ai diminta atau provider kie aktif
  if (isKie) {
    try {
      const kieResult = await generateWithKieAi(prompt, genre, options)
      if (kieResult) return await finalizeResult(kieResult, 'kie')
    } catch (error) {
      console.error('Kie.ai AI provider gagal:', error instanceof Error ? error.message : error)
      throw error
    }
  }

  const isElevenLabs = 
    requestedModel.includes('eleven') || 
    requestedModel.includes('music_v') ||
    options?.elevenLabsApiKey?.startsWith('sk_') ||
    (options?.sunoApiKey?.startsWith('sk_') && !isKie) ||
    configuredProvider === 'elevenlabs'

  // 2. Coba ElevenLabs jika diminta atau provider aktif
  if (isElevenLabs) {
    try {
      const elevenResult = await generateWithElevenLabs(prompt, genre, options)
      if (elevenResult) return await finalizeResult(elevenResult, 'elevenlabs')
    } catch (error) {
      console.error('ElevenLabs AI provider gagal:', error instanceof Error ? error.message : error)
      throw error
    }
  }

  const isSuno = requestedModel.includes('suno') || 
    requestedModel.startsWith('v6') || 
    requestedModel.startsWith('v5') || 
    requestedModel.startsWith('v4') || 
    requestedModel.startsWith('v3') || 
    configuredProvider === 'suno'

  // 2. Coba Suno AI jika model diminta atau env Suno aktif
  if (isSuno) {
    try {
      const sunoResult = await generateWithSuno(prompt, genre, options)
      if (sunoResult) return await finalizeResult(sunoResult, 'suno')
    } catch (error) {
      console.error('Suno AI provider gagal:', error instanceof Error ? error.message : error)
      throw error
    }
  }

  // 3. Coba Local MusicGen jika provider disetel 'local' atau model lokal dipilih
  const preferLocal = configuredProvider === 'local' || requestedModel.includes('local') || requestedModel.includes('fusion') || !requestedModel
  if (preferLocal) {
    const localResult = await generateWithLocalMusicGen(productionPrompt, targetDuration)
    if (localResult) return await finalizeResult(localResult, 'musicgen')
  }

  // 3. Coba Loudly jika dikonfigurasi
  try {
    const loudlyResult = await generateWithLoudly(productionPrompt)
    if (loudlyResult) return await finalizeResult(loudlyResult, 'loudly')
  } catch (error) {
    console.warn('Loudly generation gagal atau kehabisan kredit; mencoba local worker.', error instanceof Error ? error.message : error)
  }

  // 4. Fallback ke Local MusicGen jika belum dicoba sebelumnya
  if (!preferLocal) {
    const localResult = await generateWithLocalMusicGen(productionPrompt)
    if (localResult) return await finalizeResult(localResult, 'musicgen')
  }

  // 5. Coba Hugging Face MusicGen jika API key HF tersedia
  const token = process.env.MUSIC_AI_API_KEY
  if (isConfigured(token) && token?.startsWith('hf_')) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90_000)
    try {
      const client = new InferenceClient(token)
      const audio = await client.textToAudio({
        model: process.env.MUSIC_AI_MODEL || 'facebook/musicgen-small',
        provider: 'hf-inference',
        inputs: productionPrompt,
        parameters: { generation_parameters: { do_sample: true, temperature: 1 } },
      }, { signal: controller.signal, retry_on_error: false })
      const contentType = audio.type || 'audio/wav'
      const base64 = Buffer.from(await audio.arrayBuffer()).toString('base64')
      return await finalizeResult({ audioUrl: `data:${contentType};base64,${base64}`, provider: 'Hugging Face MusicGen' }, 'hf')
    } catch (error) {
      console.error('AI music provider failed; using local fallback.', error instanceof Error ? error.message : error)
    } finally {
      clearTimeout(timeout)
    }
  }

  return null
}
