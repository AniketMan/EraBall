import { NextResponse } from 'next/server'

const R2_URL = 'https://pub-c85456ef7b454894a21cc859fee77b58.r2.dev/players_with_stats.json'

export async function GET() {
  const res = await fetch(R2_URL, { next: { revalidate: 86400 } })
  if (!res.ok) return new NextResponse('Failed to fetch players', { status: 502 })
  const data = await res.json()
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' }
  })
}
