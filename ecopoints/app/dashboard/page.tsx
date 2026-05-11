'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MOCK_USER, MOCK_ACTIVITY, POINTS_TO_INR } from '@/lib/data'
import { BottomNav, PointsCard, ActivityRow, SectionHeader } from '@/components/ui'
import { getEsp32Ip, checkEsp32Connection } from '@/lib/esp32'

const QUICK_ACTIONS = [
  { icon: '♻️', label: 'Crush Bottles', href: '/session',  bg: 'rgba(94,232,154,0.12)' },
  { icon: '🔍', label: 'Find Machines', href: '/nearby',   bg: 'rgba(255,200,100,0.10)' },
  { icon: '🏪', label: 'Partner Shops', href: '/nearby',   bg: 'rgba(100,160,255,0.10)' },
]

export default function DashboardPage() {
  const user     = MOCK_USER
  const cashback = POINTS_TO_INR(user.totalPoints)

  const [esp32Online, setEsp32Online] = useState<boolean | null>(null)
  const [esp32Ip, setEsp32Ip]         = useState('')

  useEffect(() => {
    const ip = getEsp32Ip()
    setEsp32Ip(ip)
    if (!ip) { setEsp32Online(false); return }

    checkEsp32Connection(ip).then(setEsp32Online)
  }, [])

  return (
    <>
      <div className="page-content no-scrollbar">
        <div className="status-bar"><span>9:41</span><span>●●●</span></div>

        {/* Greeting + ESP32 badge */}
        <div style={{ padding: '6px 20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Good morning,</p>
            <h1 className="display" style={{ fontSize: 24 }}>{user.name}</h1>
          </div>

          {/* Machine connection pill */}
          <Link href="/session" style={{ textDecoration: 'none', marginTop: 4 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-surface)',
              border: `0.5px solid ${esp32Online ? 'var(--border-green)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-full)',
              padding: '5px 10px',
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: esp32Online === null ? '#FAC775' : esp32Online ? '#5EE89A' : 'rgba(255,255,255,0.2)',
                boxShadow: esp32Online ? '0 0 6px #5EE89A' : 'none',
              }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: esp32Online ? '#5EE89A' : 'var(--text-muted)' }}>
                {esp32Online === null ? 'Checking…' : esp32Online ? 'Machine Live' : esp32Ip ? 'Machine Offline' : 'No Machine'}
              </span>
            </div>
          </Link>
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
