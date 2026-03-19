'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_USER, POINTS_TO_INR } from '@/lib/data'
import { BottomNav, BackHeader } from '@/components/ui'

export default function ScanPage() {
  const router = useRouter()
  const [shopCode, setShopCode] = useState('')
  const [redeemed, setRedeemed] = useState(false)
  const cashback = POINTS_TO_INR(MOCK_USER.totalPoints)

  if (redeemed) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', textAlign: 'center' }}>
        <div className="anim-pop" style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h1 className="display anim-fade-up" style={{ fontSize: 24, marginBottom: 8 }}>Cashback Applied!</h1>
        <p className="anim-fade-up" style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, animationDelay: '0.15s' }}>
          ₹{cashback.toFixed(2)} deducted from your bill
        </p>
        <div className="card-green anim-fade-up" style={{ width: '100%', marginBottom: 24, animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Points used</span>
            <span className="display" style={{ color: '#FF7A7A' }}>−{MOCK_USER.totalPoints}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Cash saved</span>
            <span className="display" style={{ color: '#5EE89A' }}>₹{cashback.toFixed(2)}</span>
          </div>
          <div style={{ height: '0.5px', background: 'var(--border-green)', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Remaining balance</span>
            <span className="display" style={{ color: 'var(--text-secondary)' }}>0 pts</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => router.push('/dashboard')}>Back to Home</button>
        <button className="btn-ghost" style={{ marginTop: 6 }} onClick={() => router.push('/session')}>Crush more bottles</button>
      </div>
    )
  }

  return (
    <>
      <div className="page-content no-scrollbar">
        <div className="status-bar"><span>9:41</span><span>●●●</span></div>
        <BackHeader title="Scan & Redeem" backHref="/dashboard" />

        {/* QR viewfinder */}
        <div style={{ margin: '0 16px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-green)' }}>
          {/* Corner markers */}
          {[
            { top: 14, left: 14, borderTop: '3px solid #5EE89A', borderLeft: '3px solid #5EE89A', borderRadius: '4px 0 0 0' },
            { top: 14, right: 14, borderTop: '3px solid #5EE89A', borderRight: '3px solid #5EE89A', borderRadius: '0 4px 0 0' },
            { bottom: 14, left: 14, borderBottom: '3px solid #5EE89A', borderLeft: '3px solid #5EE89A', borderRadius: '0 0 0 4px' },
            { bottom: 14, right: 14, borderBottom: '3px solid #5EE89A', borderRight: '3px solid #5EE89A', borderRadius: '0 0 4px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: 28, height: 28, ...s as React.CSSProperties }} />
          ))}
          {/* Scan line */}
          <div style={{ position: 'absolute', left: 14, right: 14, height: 2, background: 'linear-gradient(90deg, transparent, #5EE89A, transparent)', animation: 'scanLine 2s ease-in-out infinite' }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', zIndex: 1 }}>Camera viewfinder</p>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '0 20px 16px' }}>
          Point at the shop's QR code to redeem your cashback
        </p>

        {/* Balance preview */}
        <div style={{ margin: '0 16px 14px', background: 'var(--green-bg)', border: '0.5px solid var(--border-green)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(94,232,154,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💳</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Available Balance</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{MOCK_USER.totalPoints.toLocaleString()} pts · never expires</p>
            </div>
          </div>
          <p className="display" style={{ fontSize: 22, color: '#5EE89A' }}>₹{cashback.toFixed(0)}</p>
        </div>

        <div style={{ padding: '0 16px 14px' }}>
          <button className="btn-primary" onClick={() => setRedeemed(true)}>Redeem at this Shop</button>
        </div>

        <div style={{ padding: '0 16px' }}>
          <p className="label-caps" style={{ padding: '0 0 8px' }}>Or enter shop code manually</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input-field" placeholder="e.g. DMART-1042"
              value={shopCode} onChange={e => setShopCode(e.target.value.toUpperCase())}
              style={{ flex: 1 }} />
            <button disabled={!shopCode} onClick={() => setRedeemed(true)} style={{
              background: shopCode ? '#5EE89A' : 'var(--bg-surface)',
              border: `0.5px solid ${shopCode ? 'transparent' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              color: shopCode ? '#063320' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 14, padding: '0 16px', cursor: shopCode ? 'pointer' : 'not-allowed',
            }}>Go</button>
          </div>
        </div>
      </div>
      <BottomNav />
      <style>{`@keyframes scanLine { 0%,100%{top:15%;opacity:.8} 50%{top:75%;opacity:1} }`}</style>
    </>
  )
}
