import fs from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'

const MIME_MAP: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.mid': 'audio/midi',
  '.midi': 'audio/midi',
  '.pdf': 'application/pdf',
  '.musicxml': 'application/vnd.recordare.musicxml+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params

  const cleanFilename = path.basename(filename)
  if (!cleanFilename || cleanFilename.includes('..') || cleanFilename !== filename) {
    return new NextResponse('Invalid filename', { status: 400 })
  }

  const audioDir = path.join(process.cwd(), 'public', 'audio')
  const filePath = path.join(audioDir, cleanFilename)

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 })
  }

  const stat = fs.statSync(filePath)
  if (!stat.isFile()) {
    return new NextResponse('Not a file', { status: 404 })
  }

  const ext = path.extname(cleanFilename).toLowerCase()
  const contentType = MIME_MAP[ext] || 'application/octet-stream'
  const fileSize = stat.size

  const range = request.headers.get('range')

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

    if (isNaN(start) || start >= fileSize || (parts[1] && end < start)) {
      return new NextResponse('Requested range not satisfiable', {
        status: 416,
        headers: {
          'Content-Range': `bytes */${fileSize}`,
        },
      })
    }

    const chunkSize = end - start + 1
    const fileStream = fs.createReadStream(filePath, { start, end })
    const webStream = Readable.toWeb(fileStream) as ReadableStream

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  const fileStream = fs.createReadStream(filePath)
  const webStream = Readable.toWeb(fileStream) as ReadableStream

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(fileSize),
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params
  const cleanFilename = path.basename(filename)
  if (!cleanFilename || cleanFilename.includes('..') || cleanFilename !== filename) {
    return new NextResponse(null, { status: 400 })
  }

  const audioDir = path.join(process.cwd(), 'public', 'audio')
  const filePath = path.join(audioDir, cleanFilename)

  if (!fs.existsSync(filePath)) {
    return new NextResponse(null, { status: 404 })
  }

  const stat = fs.statSync(filePath)
  const ext = path.extname(cleanFilename).toLowerCase()
  const contentType = MIME_MAP[ext] || 'application/octet-stream'

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(stat.size),
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
