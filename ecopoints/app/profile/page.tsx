'use client'

import { MOCK_USER } from '@/lib/data'
import { BottomNav } from '@/components/ui'
import Link from 'next/link'

const MENU = [
  { icon: '🏷️', label: 'My Coupons & Offers',  href: '#', bg: 'rgba(94,232,154,0.1)' },
  { icon: '📍', label: 'Nearby Machines',       href: '/nearby', bg: 'rgba(100,160,255,0.1)' },
  { icon: '🔔', label: 'Notifications',          href: '#', bg: 'rgba(255,200,80,0.1)' },
  { icon: '⚙️', label: 'Settings & Account',    href: '#', bg: 'rgba(255,120,120,0.1)' },
  { icon: '🤝', label: 'Refer a Friend',         href: '#', bg: 'rgba(210,150,255,0.1)' },
]

export default function ProfilePage() {
  const user = MOCK_USER
  const initials = user.name.split(' ').map(n => n[0]).join('')
  const progressPct = Math.round((user.totalPoints / user.nextTierPoints) * 100)

  return (
    <>
      <div className="page-content no-scrollbar">
        <div className="status-bar"><span>9:41</span><span>●●●</span></div>

        {/* Avatar + info */}
        <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', border: '2px solid #5EE89A', background: '#1A4A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: '#5EE89A', marginBottom: 10 }}>
            {initials}
          </div>
          <h1 className="display" style={{ fontSize: 20, marginBottom: 2 }}>{user.name}</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{user.email}</p>
          <div className="tier-badge">{user.tierEmoji} {user.tier.toUpperCase()}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          {[
            { num: user.totalBottles.toLocaleString(), label: 'Bottles Crushed' },
            { num: user.totalPoints.toLocaleString(),  label: 'Total Points' },
            { num: `₹${user.totalCashback}`,           label: 'Cashback Earned' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: 1 }}>
              <p className="stat-num">{s.num}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tier progress */}
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Progress to next tier</p>
            <p style={{ fontSize: 12, color: '#5EE89A', fontWeight: 500 }}>{user.totalPoints.toLocaleString()} / {user.nextTierPoints.toLocaleString()}</p>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
            {(user.nextTierPoints - user.totalPoints).toLocaleString()} pts more to reach 🔥 Green Champion
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'var(--border-subtle)', margin: '0 16px 8px' }} />

        {/* Menu */}
        {MENU.map(item => (
          <Link key={item.label} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 20px', textDecoration: 'none',
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
            <span style={{ flex: 1, fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>›</span>
          </Link>
        ))}

        <div style={{ height: '0.5px', background: 'var(--border-subtle)', margin: '8px 16px 16px' }} />
        <button style={{ display: 'block', width: 'calc(100% - 32px)', margin: '0 16px', background: 'transparent', border: '0.5px solid rgba(255,120,120,0.2)', borderRadius: 'var(--radius-md)', padding: 12, fontSize: 13, fontWeight: 500, color: '#FF7A7A', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
      <BottomNav />
    </>
  )
}
