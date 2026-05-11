'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'welcome' | 'login'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (email === 'parnika10th@gmail.com' && password === 'parni123') {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="page-content" style={{ padding: '0 0 24px' }}>
      {/* Status bar */}
      <div className="status-bar"><span>9:41</span><span>●●●</span></div>

      {/* Progress dots */}
      {step !== 'welcome' && (
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', padding: '8px 0 14px' }}>
          {[1,2].map(i => (
            <div key={i} style={{
              height: 4, borderRadius: 2,
              width: i <= 2 ? 32 : 20,
              background: '#5EE89A',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      )}

      {/* ── WELCOME ── */}
      {step === 'welcome' && (
        <div className="anim-fade-up" style={{ padding: '40px 24px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>♻️</div>
          <h1 className="display" style={{ fontSize: 30, marginBottom: 12 }}>Turn bottles into cashback</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 48 }}>
            Crush plastic bottles at EcoCrusher machines, earn points, and redeem real cash discounts at shops near you.
          </p>
          <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
            {[
              { icon: '🏧', title: 'Find a machine', desc: 'Locate EcoCrusher kiosks nearby' },
              { icon: '♻️', title: 'Crush bottles',   desc: 'Drop bottles, earn points instantly' },
              { icon: '🏪', title: 'Redeem cashback', desc: 'Scan a QR at any partner shop' },
            ].map(item => (
              <div key={item.title} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                padding: '12px 16px', textAlign: 'left',
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => setStep('login')}>
            Get Started →
          </button>
        </div>
      )}

      {/* ── LOGIN ── */}
      {step === 'login' && (
        <div className="anim-fade-up" style={{ padding: '12px 0 0' }}>
          <div style={{ padding: '0 20px 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'var(--green-bg)', border: '1px solid var(--border-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 16,
            }}>👤</div>
            <h1 className="display" style={{ fontSize: 24, marginBottom: 6 }}>Admin Sign In</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Sign in with your default admin credentials.
            </p>
          </div>

          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p className="label-caps" style={{ padding: '0 0 6px' }}>Email</p>
              <input className="input-field" placeholder="parnika10th@gmail.com" type="email"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <p className="label-caps" style={{ padding: '0 0 6px' }}>Password</p>
              <input className="input-field" placeholder="••••••••" type="password"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {error && <p style={{ color: '#FF7A7A', fontSize: 13, textAlign: 'center', marginTop: 4 }}>{error}</p>}

            <button className="btn-primary" style={{ marginTop: 8 }}
              disabled={!email || !password}
              onClick={handleLogin}>
              Sign In →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
