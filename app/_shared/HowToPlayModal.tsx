'use client'
// app/_shared/HowToPlayModal.tsx
// Shared modal: the "How to Play" overlay (steps + player-tier legend). Pure presentational;
// closes via the onClose callback. The step copy lives alongside the modal as static data.

import React from 'react'
import { G, BEBAS } from '../../src/components/tokens'

const HOW_TO_PLAY_STEPS = [
  {
    title: 'Pick Your Simulation Era',
    body: 'Choose a decade: 50s through the 2020s. This is the era of basketball your season will be simulated in. Following the Era rules and trends.',
  },
  {
    title: 'Spin to Draft',
    body: 'Each spin lands on a franchise and an ERA of that franchise. Choose one player from all the players who played for that team during that era to fill an open slot. You get only ONE respin for the entire draft.',
  },
  {
    title: 'Fill 9 Spots',
    body: '5 starters (PG - SG - SF - PF - C) and 4 bench players. Starters play 35 minutes per game, and carry more weight in the simulation. Bench players contribute at a reduced rate.',
  },
  {
    title: 'Positional Fit',
    body: 'Playing a player at their natural position = no penalty. One position off = −10% rating. Way out of position = −25%. FLEX players like LeBron, Jokić, and Giannis can fill multiple slots with no penalty.',
  },
  {
    title: 'Era Modifier',
    body: 'Every player performs best in their home decade. Each era away is a larger era penalty Pre-3PT players (50s–70s) face an extra penalty in modern eras. Players selected within their ers have no penalty.',
  },
  {
    title: 'Special Players - IMPORTANT',
    body: 'Special contributors carry special tags. Defensive Anchors (Draymond, Tony Allen, Aaron Gordon, Kawhi, etc.) get a boost to their impact, beyond their stats. Offensive Anchors (LeBron, Jokić, Luka, Embiid, etc.) give an offensive boost to the team. Championship players perform better in the playoffs. The more championships they have, the better performances they will have when the lights are the brightest. Other tags are present such as TIMELESS, Dynamic Duos, Shooting Stars and more! Check them out!',
  },
  {
    title: 'Draft a Coach',
    body: 'Your coach has separate Offense and Defense grades (A–F). Offensive coaches boost scoring, defensive coaches limit opponents. Guru tags (OFF GURU / DEF GURU) excel at that side of the ball. Championship-winning coaches carry an extra bonus. The more Championships, the higher bonus.',
  },
  {
    title: 'Simulate the Season',
    body: 'Your team plays a regular season (72 games in the 50s/60s, 82 otherwise). Win 50%+ to make the playoffs. Navigate an era-accurate bracket to win the championship. Player performance will vary each run based on team spacing, coaching, playmaking, defense and role fit. The same stars won\'t always get the same result.',
  },
  {
    title: 'Awards & Stats',
    body: 'MVP, All-NBA, All-Star, Defensive POY, and 6th Man are awarded based on simulated stats.',
  },
  {
    title: 'Salary Cap Draft Mode',
    body: 'An alternate draft mode with tier-based roster limits. You must build a team within the following tiers: 2 S-tier, 2 A-tier, 2 B-tier, 2 C-tier, and 1 D-tier player. Every spin guarantees at least one player from a tier you still need, but you can always pick anyone from the roster. Build around your strengths. The Salary Cap mode has its own leaderboard.',
  },
]

export function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        className="roster-scroll"
        style={{ background: G.surface, border: `1px solid ${G.border}`, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ ...BEBAS, fontSize: 28, color: G.gold, letterSpacing: '0.2em' }}>HOW TO PLAY</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: G.grey, fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
        {/* Steps */}
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {HOW_TO_PLAY_STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 16 }}>
              <div style={{ ...BEBAS, fontSize: 22, color: G.gold, letterSpacing: '0.1em', width: 24, flexShrink: 0, paddingTop: 1 }}>{i + 1}</div>
              <div>
                <div style={{ ...BEBAS, fontSize: 16, color: G.white, letterSpacing: '0.15em', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: G.grey, lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}

          {/* Tier legend */}
          <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 20 }}>
            <div style={{ ...BEBAS, fontSize: 16, color: G.white, letterSpacing: '0.15em', marginBottom: 12 }}>PLAYER TIERS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'S', color: '#9b6dff', bg: 'linear-gradient(90deg, #1e0c3d, #0a0415)', desc: 'All-time legends.' },
                { label: 'A', color: '#C9A84C', bg: 'linear-gradient(90deg, #6b4800, #1c1200)', desc: 'Star players.' },
                { label: 'B', color: '#4caf78', bg: 'linear-gradient(90deg, #002d12, #000e05)', desc: 'Solid starters.' },
                { label: 'C', color: '#5b8fd4', bg: 'linear-gradient(90deg, #0a1e3a, #020810)', desc: 'Quality rotation players.' },
                { label: 'D', color: '#c47a35', bg: 'linear-gradient(90deg, #2e1200, #100600)', desc: 'Role players and specialists.' },
                { label: 'E', color: '#666',    bg: 'linear-gradient(90deg, #181818, #0e0e0e)', desc: 'Bench depth.' },
                { label: 'F', color: '#444',    bg: '#0a0a0a',                                   desc: 'Deep bench / minimal impact.' },
              ].map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.bg, border: `1px solid ${G.border}`, padding: '6px 10px' }}>
                  <div style={{ ...BEBAS, fontSize: 18, color: t.color, width: 18, flexShrink: 0, textAlign: 'center' }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: G.grey, lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
