import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calcLeaderboardScore, type ScoreFlags } from '../../../lib/supabase'

const SUPABASE_URL = 'https://prwdkaffzphfqlhlaiab.supabase.co'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { entry, flags, roster } = body as {
      entry: Record<string, unknown>
      flags?: ScoreFlags
      roster?: { starters: { name: string; slot: string; era: string }[]; bench: { name: string; era: string }[] }
    }

    if (!entry?.era || !entry?.mode) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    const wins = Number(entry.reg_wins)
    const losses = Number(entry.reg_losses)
    const pWins = Number(entry.playoff_wins ?? 0)
    const pLosses = Number(entry.playoff_losses ?? 0)
    const ptDiff = Number(entry.avg_pt_diff ?? 0)
    const rating = Number(entry.team_rating ?? 0)

    if (wins < 0 || wins > 82 || losses < 0 || losses > 82 || wins + losses > 82) {
      return NextResponse.json({ error: 'Invalid regular season record' }, { status: 400 })
    }
    if (pWins < 0 || pWins > 16 || pLosses < 0 || pLosses > 12) {
      return NextResponse.json({ error: 'Invalid playoff record' }, { status: 400 })
    }
    if (ptDiff < -50 || ptDiff > 60) {
      return NextResponse.json({ error: 'Invalid point differential' }, { status: 400 })
    }
    if (rating < 0 || rating > 100) {
      return NextResponse.json({ error: 'Invalid team rating' }, { status: 400 })
    }

    // Block duplicate players (catches the 5x LeBron exploit)
    if (roster) {
      const names = [
        ...(roster.starters ?? []).map(s => s.name),
        ...(roster.bench ?? []).map(b => b.name),
      ]
      if (new Set(names).size < names.length) {
        return NextResponse.json({ error: 'Duplicate players detected' }, { status: 400 })
      }
    }

    // Score is always recalculated server-side — client value is ignored
    const score = calcLeaderboardScore(entry as Parameters<typeof calcLeaderboardScore>[0], flags)

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not set')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const admin = createClient(SUPABASE_URL, serviceKey)

    const { error } = await admin.from('leaderboard').insert({ ...entry, score, roster })
    if (error) {
      console.error('Leaderboard insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const { count } = await admin
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('era', entry.era)
      .eq('mode', entry.mode)
      .gt('score', score)

    return NextResponse.json({ score, rank: (count ?? 0) + 1 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
