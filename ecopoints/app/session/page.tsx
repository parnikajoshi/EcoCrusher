'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BOTTLE_CONFIG, type BottleType } from '@/lib/data'
import { BackHeader } from '@/components/ui'

type SessionState = 'active' | 'success'

export default function SessionPage() {
  const router = useRouter()
  const [state, setState] = useState<SessionState>('active')
  const [bottles, setBottles] = useState<Record<BottleType, number>>({ PET: 0, Glass: 0, Aluminium: 0 })
  const [displayPts, setDisplayPts] = useState(0)
  const confettiRef = useRef<HTMLCanvasElement>(null)

  const totalBottles = Object.values(bottles).reduce((a, b) => a + b, 0)
  const totalPoints  = BOTTLE_CONFIG.reduce((acc, b) => acc + bottles[b.type] * b.pointsEach, 0)
  const plasticGrams = bottles.PET * 50 + bottles.Glass * 300 + bottles.Aluminium * 15

  const add = (type: BottleType) => setBottles(prev => ({ ...prev, [type]: prev[type] + 1 }))
  const remove = (type: BottleType) => setBottles(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }))

  // Animate point counter on success
  useEffect(() => {
    if (state !== 'success') return
    let n = 0
    const iv = setInterval(() => {
      n += Math.ceil(totalPoints / 25)
      if (n >= totalPoints) { setDisplayPts(totalPoints); clearInterval(iv) }
      else setDisplayPts(n)
    }, 30)

    // Confetti
    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const colors = ['#5EE89A','#FAC775','#85B7EB','#F09595','#97C459']
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width, y: -10 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 2.5, vy: 2 + Math.random() * 2,
      r: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      spin: Math.random() * 360, sv: (Math.random() - 0.5) * 7,
      rect: Math.random() > 0.5,
    }))
    let frame = 0
    const draw = () => {
      if (frame > 220) { ctx.clearRect(0, 0, canvas.width, canvas.height); return }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.spin += p.sv
        if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.spin * Math.PI / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - frame / 200)
        if (p.rect) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
        else { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill() }
        ctx.restore()
      })
      frame++
      requestAnimationFrame(draw)
    }
    setTimeout(draw, 400)
    return () => clearInterval(iv)
  }, [state, totalPoints])

  // ── SUCCESS SCREEN ──
  if (state === 'success') {
    return (
      <div style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', overflow: 'hidden' }}>
        <canvas ref={confettiRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'relative', zIndex: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div className="anim-pop" style={{ width: 80, height: 80, borderRadius: 28, background: 'var(--green-bg)', border: '2px solid var(--border-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M8 18l7 7 13-14" stroke="#5EE89A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawCheck .6s .3s ease forwards' }} />
            </svg>
          </div>

          <h1 className="display anim-fade-up" style={{ fontSize: 26, marginBottom: 6, animationDelay: '0.4s' }}>Session Complete!</h1>
          <p className="anim-fade-up" style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, animationDelay: '0.55s' }}>
            You crushed {totalBottles} bottle{totalBottles !== 1 ? 's' : ''}
          </p>

          <div className="card-green anim-fade-up" style={{ width: '100%', textAlign: 'center', marginBottom: 14, animationDelay: '0.7s' }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Points earned</p>
            <p className="display" style={{ fontSize: 52, color: '#5EE89A', lineHeight: 1 }}>+{displayPts}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Total balance: {2840 + totalPoints} pts</p>
          </div>

          <div className="anim-fade-up" style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 16, animationDelay: '0.85s' }}>
            {[
              { icon: '♻️', value: totalBottles, label: 'Bottles' },
              { icon: '🌱', value: `${plasticGrams}g`, label: 'Plastic saved' },
              { icon: '🏆', value: `#${47 + totalBottles}`, label: 'Rank' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ flex: 1 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <p className="display" style={{ fontSize: 16 }}>{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="anim-fade-up" style={{ display: 'flex', gap: 8, width: '100%', animationDelay: '1s' }}>
            <button className="btn-secondary" style={{ flex: 1 }}>Share 📤</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={() => router.push('/scan')}>
              Redeem Cashback →
            </button>
          </div>
          <button className="btn-ghost" style={{ marginTop: 6 }} onClick={() => router.push('/dashboard')}>
            Back to Home
          </button>
        </div>
        <style>{`@keyframes drawCheck { to { stroke-dashoffset: 0; } }`}</style>
      </div>
    )
  }

  // ── ACTIVE SESSION SCREEN ──
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div className="status-bar"><span>9:41</span><span>●●●</span></div>
      <BackHeader title="Crushing Session" backHref="/dashboard" />

      {/* Machine info */}
      <div style={{ margin: '0 16px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏧</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600 }}>EcoCrusher #042</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Aundh Mall, Pune · 0.2 km</p>
        </div>
        <div style={{ background: 'rgba(94,232,154,0.12)', border: '0.5px solid var(--border-green)', borderRadius: 20, padding: '4px 10px', fontSize: 10, fontWeight: 600, color: '#5EE89A' }}>● LIVE</div>
      </div>

      {/* Live counter */}
      <div style={{ margin: '0 16px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '20px 16px', textAlign: 'center' }}>
        <p className="display" style={{ fontSize: 52, lineHeight: 1 }}>{totalBottles}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 16px' }}>bottles crushed so far</p>
        <div style={{ background: 'var(--green-bg)', borderRadius: 10, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Points earned</span>
          <span className="display" style={{ fontSize: 22, color: '#5EE89A' }}>+{totalPoints}</span>
        </div>
      </div>

      {/* Bottle type counters */}
      <p className="label-caps" style={{ padding: '0 20px 10px' }}>Bottle types</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px', flex: 1 }}>
        {BOTTLE_CONFIG.map(b => (
          <div key={b.type} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{b.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{b.type} Bottle</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{b.pointsEach} pts each</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => remove(b.type)} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-surface-hover)', border: '0.5px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
              <span className="display" style={{ fontSize: 18, minWidth: 28, textAlign: 'center' }}>{bottles[b.type]}</span>
              <button onClick={() => add(b.type)} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--green-bg)', border: '0.5px solid var(--border-green)', color: '#5EE89A', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 16px 24px' }}>
        <button className="btn-primary" disabled={totalBottles === 0} onClick={() => setState('success')}>
          Finish Session · Earn {totalPoints} pts
        </button>
      </div>
    </div>
  )
}
