'use client'

import Link from 'next/link'
import { MOCK_USER, MOCK_ACTIVITY, POINTS_TO_INR } from '@/lib/data'
import { BottomNav, PointsCard, ActivityRow, SectionHeader } from '@/components/ui'

const QUICK_ACTIONS = [
  { icon: '♻️', label: 'Crush Bottles', href: '/session',  bg: 'rgba(94,232,154,0.12)' },
  { icon: '🔍', label: 'Find Machines', href: '/nearby',   bg: 'rgba(255,200,100,0.10)' },
  { icon: '🏪', label: 'Partner Shops', href: '/nearby',   bg: 'rgba(100,160,255,0.10)' },
]

export default function DashboardPage() {
  const user = MOCK_USER
  const cashback = POINTS_TO_INR(user.totalPoints)

  return (
    <>
      <div className="page-content no-scrollbar">
        <div className="status-bar"><span>9:41</span><span>●●●</span></div>

        {/* Greeting */}
        <div style={{ padding: '6px 20px 16px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Good morning,</p>
          <h1 className="display" style={{ fontSize: 24 }}>{user.name}</h1>
        </div>

        {/* Points card */}
        <PointsCard
          points={user.totalPoints}
          cashback={parseFloat(cashback.toFixed(2))}
          onRedeem={() => {}}
        />

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 20px' }}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.label} href={a.href} style={{
              flex: 1, background: 'var(--bg-surface)',
              border: '0.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              textDecoration: 'none',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{a.icon}</div>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center' }}>{a.label}</span>
            </Link>
          ))}
        </div>

        {/* Eco impact strip */}
        <div style={{ margin: '0 16px 20px', background: 'rgba(94,232,154,0.06)', border: '0.5px solid var(--border-green)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🌍</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.totalBottles} bottles kept out of landfill</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>≈ {(user.totalBottles * 0.05).toFixed(1)} kg plastic recycled</p>
          </div>
        </div>

        {/* Recent activity */}
        <SectionHeader label="Recent Activity" />
        {MOCK_ACTIVITY.slice(0, 4).map(item => (
          <ActivityRow key={item.id} {...item} />
        ))}
        <div style={{ padding: '8px 20px 0' }}>
          <Link href="/history" style={{ fontSize: 13, color: '#5EE89A', fontWeight: 600, textDecoration: 'none' }}>
            View full history →
          </Link>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
