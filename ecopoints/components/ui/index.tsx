'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Bottom Navigation ──────────────────────────────────

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Home',    icon: '🏠' },
  { href: '/history',    label: 'History', icon: '📊' },
  { href: '/scan',       label: 'Scan',    icon: '📷' },
  { href: '/profile',    label: 'Profile', icon: '👤' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => {
        const active = pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {active && <span className="nav-dot" />}
          </Link>
        )
      })}
    </nav>
  )
}

// ── Page Header with optional back button ──────────────

interface BackHeaderProps {
  title: string
  backHref?: string
  right?: React.ReactNode
}

export function BackHeader({ title, backHref, right }: BackHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px 14px' }}>
      {backHref && (
        <Link href={backHref} style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: 'var(--text-primary)',
          textDecoration: 'none', flexShrink: 0,
        }}>←</Link>
      )}
      <h1 className="display" style={{ fontSize: 20, flex: 1 }}>{title}</h1>
      {right}
    </div>
  )
}

// ── Points Balance Card ────────────────────────────────

interface PointsCardProps {
  points: number
  cashback: number
  onRedeem?: () => void
}

export function PointsCard({ points, cashback, onRedeem }: PointsCardProps) {
  return (
    <div style={{
      margin: '0 16px 16px',
      background: 'linear-gradient(135deg, #1A7A4A 0%, #0F5C35 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{ position:'absolute', right:-20, top:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
      <div style={{ position:'absolute', right:20, bottom:-40, width:90, height:90, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>Total Points</p>
      <p className="display" style={{ fontSize: 40, color: '#fff', lineHeight: 1, marginBottom: 4 }}>
        {points.toLocaleString()}
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>
        ≈ ₹{cashback.toLocaleString()} cashback available
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 14px',
      }}>
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Redeemable now</p>
          <p className="display" style={{ fontSize: 16, color: '#5EE89A' }}>₹{cashback.toFixed(2)}</p>
        </div>
        {onRedeem && (
          <button onClick={onRedeem} style={{
            background: '#5EE89A', color: '#063320',
            border: 'none', borderRadius: 8,
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
            padding: '8px 14px', cursor: 'pointer',
          }}>Redeem →</button>
        )}
      </div>
    </div>
  )
}

// ── OTP Input Box Row ──────────────────────────────────

interface OtpInputProps {
  value: string
  onChange: (val: string) => void
  length?: number
}

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const digits = value.split('')

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    if (e.key === 'Backspace' && input.value === '') {
      const prev = input.previousElementSibling as HTMLInputElement
      prev?.focus()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    const arr = [...digits]
    arr[idx] = v
    onChange(arr.join(''))
    if (v) {
      const next = e.target.nextElementSibling as HTMLInputElement
      next?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '24px 20px 8px' }}>
      {Array.from({ length }).map((_, i) => {
        const filled = i < value.length
        const active = i === value.length
        return (
          <input
            key={i}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] || ''}
            onChange={e => handleChange(e, i)}
            onKeyDown={handleKey}
            autoFocus={i === 0}
            style={{
              width: 42, height: 50,
              borderRadius: 10, border: `${active ? '1.5px solid #5EE89A' : filled ? '1px solid rgba(94,232,154,0.4)' : '0.5px solid var(--border-subtle)'}`,
              background: filled ? 'rgba(94,232,154,0.08)' : 'var(--bg-surface)',
              textAlign: 'center',
              fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)',
              color: '#5EE89A',
              outline: 'none',
            }}
          />
        )
      })}
    </div>
  )
}

// ── Activity Row ───────────────────────────────────────

interface ActivityRowProps {
  type: 'crush' | 'redeem'
  title: string
  subtitle: string
  points: number
}

export function ActivityRow({ type, title, subtitle, points }: ActivityRowProps) {
  return (
    <div className="activity-row">
      <div className="activity-icon">{type === 'crush' ? '♻️' : '🏪'}</div>
      <div className="activity-info">
        <p className="activity-title">{title}</p>
        <p className="activity-sub">{subtitle}</p>
      </div>
      <span className={`activity-pts ${points < 0 ? 'negative' : ''}`}>
        {points > 0 ? '+' : ''}{points}
      </span>
    </div>
  )
}

// ── Section Header ─────────────────────────────────────

export function SectionHeader({ label }: { label: string }) {
  return (
    <p className="label-caps" style={{ padding: '4px 20px 8px' }}>{label}</p>
  )
}
