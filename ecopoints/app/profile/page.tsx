'use client'

import { MOCK_USER } from '@/lib/data'
import { BottomNav } from '@/components/ui'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getEsp32Ip, setEsp32Ip, checkEsp32Connection } from '@/lib/esp32'

const MENU = [
  { icon: '🏷️', label: 'My Coupons & Offers',  href: '#',      bg: 'rgba(94,232,154,0.1)' },
  { icon: '📍', label: 'Nearby Machines',       href: '/nearby', bg: 'rgba(100,160,255,0.1)' },
  { icon: '🔔', label: 'Notifications',          href: '#',      bg: 'rgba(255,200,80,0.1)' },
  { icon: '⚙️', label: 'Settings & Account',    href: '#',      bg: 'rgba(255,120,120,0.1)' },
  { icon: '🤝', label: 'Refer a Friend',         href: '#',      bg: 'rgba(210,150,255,0.1)' },
]

export default function ProfilePage() {
  const user       = MOCK_USER
  const initials   = user.name.split(' ').map(n => n[0]).join('')
  const progressPct = Math.round((user.totalPoints / user.nextTierPoints) * 100)

  // ESP32 settings state
  const [ipInput,    setIpInput]    = useState('')
  const [saved,      setSaved]      = useState(false)
  const [connState,  setConnState]  = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle')

  useEffect(() => {
    const ip = getEsp32Ip()
    setIpInput(ip)
    if (ip) testConnection(ip)
  }, [])

  const testConnection = async (ip: string) => {
    setConnState('checking')
    const ok = await checkEsp32Connection(ip)
    setConnState(ok ? 'ok' : 'fail')
  }

  const handleSave = () => {
    setEsp32Ip(ipInput)
    setSaved(true)
    testConnection(ipInput)
    setTimeout(() => setSaved(false), 2000)
  }

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

        {/* ── ESP32 Machine Settings ────────────────────── */}
        <div style={{ margin: '4px 16px 16px', background: 'var(--bg-card)', border: '0.5px solid var(--border-green)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>🏧</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>EcoCrusher Machine</p>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: connState === 'ok' ? '#5EE89A' : connState === 'checking' ? '#FAC775' : connState === 'fail' ? '#FF7A7A' : 'rgba(255,255,255,0.15)',
                boxShadow: connState === 'ok' ? '0 0 6px #5EE89A' : 'none',
              }} />
              <span style={{ fontSize: 10, color: connState === 'ok' ? '#5EE89A' : connState === 'fail' ? '#FF7A7A' : 'var(--text-muted)', fontWeight: 600 }}>
                {connState === 'ok' ? 'Connected' : connState === 'checking' ? 'Checking…' : connState === 'fail' ? 'Unreachable' : 'Not set'}
              </span>
            </div>
          </div>

          <p className="label-caps" style={{ marginBottom: 6 }}>ESP32 IP Address</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. 192.168.0.50"
              value={ipInput}
              onChange={e => setIpInput(e.target.value)}
              style={{ flex: 1, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
            />
            <button
              onClick={handleSave}
              style={{
                background: saved ? 'rgba(94,232,154,0.2)' : 'var(--green)',
                color: saved ? '#5EE89A' : 'var(--green-dark)',
                border: saved ? '1px solid var(--border-green)' : 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)',
                padding: '0 16px', cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {saved ? '✓ Saved' : 'Save'}
            </button>
          </div>

          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
            Open Arduino Serial Monitor after flashing — the IP is printed on startup.
            Both this phone and the ESP32 must be on the same WiFi network.
          </p>
          <Link href="/esp32" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, fontWeight: 700, color: '#5EE89A',
            background: 'rgba(94,232,154,0.08)', border: '0.5px solid var(--border-green)',
            borderRadius: 8, padding: '6px 12px', textDecoration: 'none',
          }}>
            🔬 Open Diagnostics →
          </Link>

          {connState === 'ok' && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(94,232,154,0.08)', border: '0.5px solid var(--border-green)', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ fontSize: 14 }}>✅</span>
              <p style={{ fontSize: 12, color: '#5EE89A' }}>Machine is reachable! You can start a crushing session.</p>
            </div>
          )}
          {connState === 'fail' && ipInput && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,100,100,0.08)', border: '0.5px solid rgba(255,100,100,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <p style={{ fontSize: 12, color: '#FF7A7A' }}>Cannot reach ESP32. Check IP and WiFi network.</p>
            </div>
          )}
        </div>

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
