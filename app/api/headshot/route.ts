import { NextRequest, NextResponse } from 'next/server'

// In-memory cache — persists across requests in the same server process
const cache = new Map<string, ArrayBuffer>()

export async function GET(request: NextRequest) {
  const personId = request.nextUrl.searchParams.get('id')
  if (!personId) return new NextResponse('Missing id', { status: 400 })

  if (cache.has(personId)) {
    return new NextResponse(cache.get(personId)!, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' }
    })
  }

  const url = `https://cdn.nba.com/headshots/nba/latest/260x190/${personId}.png`
  const res = await fetch(url, {
    headers: { 'Referer': 'https://www.nba.com/' }
  })

  if (!res.ok) return new NextResponse('Not found', { status: 404 })

  const buffer = await res.arrayBuffer()
  cache.set(personId, buffer)
  return new NextResponse(buffer, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' }
  })
}
