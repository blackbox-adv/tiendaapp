import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const filePath = pathSegments.join('/')

    // Security: prevent directory traversal
    if (filePath.includes('..') || filePath.includes('\0')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const fullPath = join(process.cwd(), 'public', 'uploads', filePath)

    // Check file exists
    const fileStat = await stat(fullPath).catch(() => null)
    if (!fileStat || !fileStat.isFile()) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Determine content type
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    // Read and serve the file
    const buffer = await readFile(fullPath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(buffer.length),
      },
    })
  } catch {
    return new NextResponse('Internal error', { status: 500 })
  }
}
