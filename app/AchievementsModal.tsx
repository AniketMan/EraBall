'use client'

import React, { useState, useEffect } from 'react'
import { getAllAchievements, clearAchievements, type Achievement, type AchievementRarity } from '../lib/achievements'

const G = {
  gold: '#C9A84C', grey: '#888888', greyDark: '#333333',
  surface: '#111111', border: '#252525', white: '#FFFFFF', black: '#000000',
  purple: '#9b6dff', green: '#4caf78', red: '#CC4444',
}
const BEBAS = '"Bebas Neue", Impact, sans-serif'
const INTER = 'Inter, system-ui, sans-serif'

const RARITY_COLOR: Record<AchievementRarity, string> = {
  common:    '#aaaaaa',
  rare:      '#5b8fd4',
  epic:      '#9b6dff',
  legendary: '#C9A84C',
}

const RARITY_LABEL: Record<AchievementRarity, string> = {
  common:    'COMMON',
  rare:      'RARE',
  epic:      'EPIC',
  legendary: 'LEGENDARY',
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const [hovered, setHovered] = useState(false)
  const color = RARITY_COLOR[achievement.rarity]
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: unlocked ? G.surface : '#0a0a0a',
        border: `1px solid ${unlocked ? (hovered ? color : '#2a2a2a') : G.border}`,
        padding: '14px 16px',
        opacity: unlocked ? 1 : 0.45,
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
        transform: unlocked && hovered ? 'scale(1.02)' : 'none',
        boxShadow: unlocked && hovered ? `0 4px 16px ${color}22` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 16, color: unlocked ? G.white : G.grey, letterSpacing: '0.08em', lineHeight: 1.1 }}>
          {unlocked ? achievement.title : '???'}
        </div>
        <div style={{ fontFamily: INTER, fontSize: 8, fontWeight: 700, color, letterSpacing: '0.12em', flexShrink: 0, marginTop: 2 }}>
          {RARITY_LABEL[achievement.rarity]}
        </div>
      </div>
      <div style={{ fontFamily: INTER, fontSize: 11, color: unlocked ? G.grey : '#444', lineHeight: 1.5 }}>
        {unlocked ? achievement.description : achievement.rarity === 'legendary' ? 'Keep playing to unlock.' : achievement.description}
      </div>
      {unlocked && (
        <div style={{ position: 'absolute', top: 8, right: 10, width: 6, height: 6, borderRadius: '50%', background: color, opacity: 0.7 }} />
      )}
    </div>
  )
}

export default function AchievementsModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<{ achievement: Achievement; unlocked: boolean }[]>([])
  const [confirming, setConfirming] = useState(false)

  useEffect(() => { setItems(getAllAchievements()) }, [])

  const unlockedCount = items.filter(i => i.unlocked).length

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: G.black, border: `1px solid ${G.border}`, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', fontFamily: INTER }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: BEBAS, fontSize: 28, color: G.gold, letterSpacing: '0.2em' }}>Achievements</div>
            <div style={{ fontSize: 11, color: G.grey, marginTop: 2 }}>{unlockedCount} / {items.length} unlocked</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: G.grey, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: G.border }}>
          <div style={{ height: '100%', background: G.gold, width: `${items.length > 0 ? (unlockedCount / items.length) * 100 : 0}%`, transition: 'width 0.4s ease' }} />
        </div>

        {/* Grid */}
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {[...items].sort((a, b) => {
            const RARITY_RANK: Record<AchievementRarity, number> = { legendary: 0, epic: 1, rare: 2, common: 3 }
            const rarityDiff = RARITY_RANK[a.achievement.rarity] - RARITY_RANK[b.achievement.rarity]
            if (rarityDiff !== 0) return rarityDiff
            return Number(b.unlocked) - Number(a.unlocked)
          }).map(({ achievement, unlocked }) => (
            <AchievementCard key={achievement.id} achievement={achievement} unlocked={unlocked} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px 20px', borderTop: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, color: G.greyDark }}>Stored locally. Does not carry over to other devices.</div>
          {confirming ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: G.grey }}>Reset all achievements?</span>
              <button onClick={() => { clearAchievements(); setItems(getAllAchievements()); setConfirming(false) }}
                style={{ padding: '4px 12px', background: '#CC333322', color: '#CC3333', border: '1px solid #CC3333', cursor: 'pointer', fontSize: 11 }}>
                Confirm
              </button>
              <button onClick={() => setConfirming(false)}
                style={{ padding: '4px 12px', background: 'none', color: G.grey, border: `1px solid ${G.border}`, cursor: 'pointer', fontSize: 11 }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)}
              style={{ padding: '4px 12px', background: 'none', color: G.greyDark, border: `1px solid ${G.greyDark}`, cursor: 'pointer', fontSize: 11, letterSpacing: '0.06em' }}>
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
