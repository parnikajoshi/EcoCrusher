'use client'

import { useState } from 'react'
import { MOCK_ACTIVITY, MOCK_USER } from '@/lib/data'
import { BottomNav, ActivityRow, SectionHeader } from '@/components/ui'

type Period = '7D' | '30D' | '3M' | 'All'

const CHART_DATA: Record<Period, { label: string; value: number }[]> = {
  '7D':  [{ label: 'M', value: 20 },{ label: 'T', value: 0 },{ label: 'W', value: 50 },{ label: 'T', value: 10 },{ label: 'F', value: 70 },{ label: 'S', value: 30 },{ label: 'S', value: 50 }],
  '30D': [{ label: 'W1', value: 30 },{ label: 'W2', value: 48 },{ label: 'W3', value: 80 },{ label: 'W4', value: 44 }],
  '3M':  [{ label: 'Jan', value: 60 },{ label: 'Feb', value: 85 },{ label: 'Mar', value: 72 }],
  'All': [{ label: 'Q1', value: 55 },{ label: 'Q2', value: 70 },{ label: 'Q3', value: 40 },{ label: 'Q4', value: 90 }],
}

const STATS: Record<Period, { bottles: number; points: number; plastic: string }> = {
  '7D':  { bottles: 12, points: 130, plastic: '0.6kg' },
  '30D': { bottles: 47, points: 470, plastic: '2.3kg' },
  '3M':  { bottles: 121, points: 1210, plastic: '6.1kg' },
  'All': { bottles: 284, points: 2840, plastic: '14.2kg' },
}

export default function HistoryPage() {
  const [period, setPeriod] = useState<Period>('30D')
  const bars = CHART_DATA[period]
  const maxVal = Math.max(...bars.map(b => b.value))
  const stats = STATS[period]

  return (
    <>
      <div className="page-content no-scrollbar">
        <div className="status-bar"><span>9:41</span><span>●●●</span></div>
        <div style={{ padding: '6px 20px 14px' }}>
          <h1 className="display" style={{ fontSize: 24 }}>My Impact</h1>
        </div>

        {/* Period tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 14px' }}>
          {(['7D','30D','3M','All'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              flex: 1, padding: '7px 4px', borderRadius: 8,
              background: p === period ? 'rgba(94,232,154,0.12)' : 'var(--bg-surface)',
              border: `0.5px solid ${p === period ? 'var(--border-green)' : 'var(--border-subtle)'}`,
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)',
              color: p === period ? '#5EE89A' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{p}</button>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ margin: '0 16px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '14px', display: 'flex', alignItems: 'flex-end', gap: bars.length > 4 ? 5 : 10, height: 110 }}>
          {bars.map((b, i) => {
            const pct = maxVal > 0 ? (b.value / maxVal) * 68 : 4
            const isMax = b.value === maxVal
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: Math.max(pct, 4), background: isMax ? '#5EE89A' : 'rgba(94,232,154,0.2)', transition: 'height 0.4s ease' }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{b.label}</span>
              </div>
            )
          })}
        </div>

        {/* Impact stats */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          {[
            { num: stats.bottles, label: 'Bottles' },
            { num: stats.points,  label: 'Points earned' },
            { num: stats.plastic, label: 'Plastic saved' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: 1 }}>
              <p className="stat-num">{s.num}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Cashback summary */}
        <div style={{ margin: '0 16px 16px', background: 'var(--green-bg)', border: '0.5px solid var(--border-green)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total cashback earned (all time)</p>
            <p className="display" style={{ fontSize: 22, color: '#5EE89A', marginTop: 2 }}>₹{MOCK_USER.totalCashback}</p>
          </div>
          <span style={{ fontSize: 32 }}>💸</span>
        </div>

        {/* Activity list */}
        <SectionHeader label="Recent Transactions" />
        {MOCK_ACTIVITY.map(item => (
          <ActivityRow key={item.id} {...item} />
        ))}
      </div>
      <BottomNav />
    </>
  )
}
