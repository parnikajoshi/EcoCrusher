'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OtpInput } from '@/components/ui'

type Step = 'welcome' | 'register' | 'otp' | 'permissions'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [timerActive, setTimerActive] = useState(false)

  const startTimer = () => {
    setResendTimer(30)
    setTimerActive(true)
    const iv = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(iv); setTimerActive(false); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const goToOtp = () => {
    setStep('otp')
    startTimer()
  }

  const steps: Step[] = ['welcome', 'register', 'otp', 'permissions']
  const stepIdx = steps.indexOf(step)

  return (
    <div className="page-content" style={{ padding: '0 0 24px' }}>
      {/* Status bar */}
      <div className="status-bar"><span>9:41</span><span>●●●</span></div>

      {/* Progress dots */}
      {step !== 'welcome' && (
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', padding: '8px 0 14px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              height: 4, borderRadius: 2,
              width: i <= stepIdx ? 32 : 20,
              background: i <= stepIdx ? '#5EE89A' : 'rgba(255,255,255,0.1)',
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
          <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => setStep('register')}>
            Get Started →
          </button>
        </div>
      )}

      {/* ── REGISTER ── */}
      {step === 'register' && (
        <div className="anim-fade-up" style={{ padding: '12px 0 0' }}>
          <div style={{ padding: '0 20px 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'var(--green-bg)', border: '1px solid var(--border-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 16,
            }}>👤</div>
            <h1 className="display" style={{ fontSize: 24, marginBottom: 6 }}>Create your profile</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Your points and cashback will be linked to this account.
            </p>
          </div>

          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p className="label-caps" style={{ padding: '0 0 6px' }}>Full name</p>
              <input className="input-field" placeholder="e.g. Rahul Sharma"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <p className="label-caps" style={{ padding: '0 0 6px' }}>Mobile number</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  width: 52, background: 'var(--bg-surface)',
                  border: '0.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0,
                }}>+91</div>
                <input className="input-field" placeholder="98765 43210" type="tel" inputMode="numeric"
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
              </div>
            </div>
            <div>
              <p className="label-caps" style={{ padding: '0 0 6px' }}>Email <span style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></p>
              <input className="input-field" placeholder="you@email.com" type="email"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingTop: 4 }}>
              <button onClick={() => setAgreed(!agreed)} style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                border: `1px solid ${agreed ? '#5EE89A' : 'rgba(255,255,255,0.2)'}`,
                background: agreed ? 'rgba(94,232,154,0.15)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#5EE89A', cursor: 'pointer',
              }}>{agreed ? '✓' : ''}</button>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                I agree to the <span style={{ color: '#5EE89A' }}>Terms of Service</span> and <span style={{ color: '#5EE89A' }}>Privacy Policy</span>
              </p>
            </div>

            <button className="btn-primary" style={{ marginTop: 8 }}
              disabled={!name || phone.length < 10 || !agreed}
              onClick={goToOtp}>
              Send OTP →
            </button>
            <button className="btn-ghost" onClick={() => router.push('/dashboard')}>
              Already have an account? Sign in
            </button>
          </div>
        </div>
      )}

      {/* ── OTP ── */}
      {step === 'otp' && (
        <div className="anim-fade-up" style={{ padding: '12px 0 0', textAlign: 'center' }}>
          <div style={{ padding: '0 24px 8px' }}>
            <div style={{
              width: 68, height: 68, borderRadius: 22,
              background: 'var(--green-bg)', border: '1px solid var(--border-green)',
              margin: '0 auto 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>💬</div>
            <h1 className="display" style={{ fontSize: 22, marginBottom: 8 }}>Verify your number</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We sent a 6-digit code to<br />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>+91 {phone}</span>
            </p>
          </div>

          <OtpInput value={otp} onChange={setOtp} length={6} />

          <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 20px 0' }}>
            Didn't receive it?{' '}
            {timerActive
              ? <span style={{ color: 'var(--text-secondary)' }}>Resend in {resendTimer}s</span>
              : <span style={{ color: '#5EE89A', fontWeight: 600, cursor: 'pointer' }} onClick={() => startTimer()}>Resend code</span>
            }
          </p>

          <div style={{ margin: '16px 16px 0', background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>📲</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Auto-read SMS</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Code fills automatically when received</p>
            </div>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: 'rgba(94,232,154,0.2)', border: '0.5px solid var(--border-green)', position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: 8, background: '#5EE89A', position: 'absolute', right: 2, top: 2 }} />
            </div>
          </div>

          <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn-primary"
              disabled={otp.length < 6}
              onClick={() => setStep('permissions')}>
              Verify & Continue
            </button>
            <button className="btn-ghost" onClick={() => setStep('register')}>
              Wrong number? Go back
            </button>
          </div>
        </div>
      )}

      {/* ── PERMISSIONS ── */}
      {step === 'permissions' && (
        <div className="anim-fade-up" style={{ padding: '32px 24px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h1 className="display" style={{ fontSize: 24, marginBottom: 8 }}>You're all set, {name.split(' ')[0]}!</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
            Allow a couple of permissions to get the best experience.
          </p>
          {[
            { icon: '📍', title: 'Location', desc: 'Find nearby machines and shops', required: true },
            { icon: '📷', title: 'Camera',   desc: 'Scan QR codes to redeem cashback', required: true },
            { icon: '🔔', title: 'Notifications', desc: 'Get alerts for bonus points events', required: false },
          ].map(p => (
            <div key={p.title} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 10, textAlign: 'left' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{p.title} {!p.required && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>· optional</span>}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{p.desc}</p>
              </div>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: 'rgba(94,232,154,0.2)', border: '0.5px solid var(--border-green)', position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: '#5EE89A', position: 'absolute', right: 2, top: 2 }} />
              </div>
            </div>
          ))}
          <button className="btn-primary" style={{ marginTop: 16 }}
            onClick={() => router.push('/dashboard')}>
            Start Earning Points 🌿
          </button>
        </div>
      )}
    </div>
  )
}
