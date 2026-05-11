'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BOTTLE_CONFIG, type BottleType } from '@/lib/data'
import { BackHeader } from '@/components/ui'
import {
  getEsp32Ip,
  fetchEsp32Status,
  resetEsp32,
  toggleEsp32Power,
  checkEsp32Connection,
  type Esp32Status,
} from '@/lib/esp32'

type SessionState = 'connect' | 'active' | 'success'
type ConnState    = 'checking' | 'connected' | 'disconnected'

export default function SessionPage() {
  const router = useRouter()

  // ── Page state ──────────────────────────────────────────────────
  const [state, setState]         = useState<SessionState>('connect')
  const [connState, setConnState] = useState<ConnState>('checking')
  const [esp32Ip, setEsp32Ip]     = useState('')
  const [esp32Data, setEsp32Data] = useState<Esp32Status | null>(null)

  // Bottle counts: live from ESP32 (count = IR count) + manual overrides
  const [manualBottles, setManualBottles] = useState<Record<BottleType, number>>({
    PET: 0, Glass: 0, Aluminium: 0,
  })

  // For success animation
  const [displayPts, setDisplayPts] = useState(0)
  const confettiRef = useRef<HTMLCanvasElement>(null)
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Derived values ───────────────────────────────────────────────
  // IR count from ESP32 maps to bottles crushed (all counted as PET by default,
  // user can manually adjust types on the side)
  const esp32Count     = esp32Data?.count ?? 0
  const manualTotal    = Object.values(manualBottles).reduce((a, b) => a + b, 0)
  const totalBottles   = state === 'active' ? (connState === 'connected' ? esp32Count + manualTotal : manualTotal) : manualTotal
  const totalPoints    = state === 'active'
    ? (connState === 'connected'
        ? esp32Count * 10 + BOTTLE_CONFIG.reduce((acc, b) => acc + manualBottles[b.type] * b.pointsEach, 0)
        : BOTTLE_CONFIG.reduce((acc, b) => acc + manualBottles[b.type] * b.pointsEach, 0))
    : BOTTLE_CONFIG.reduce((acc, b) => acc + manualBottles[b.type] * b.pointsEach, 0)
  const plasticGrams   = esp32Count * 50 + manualBottles.PET * 50 + manualBottles.Glass * 300 + manualBottles.Aluminium * 15

  // ── Load IP on mount ─────────────────────────────────────────────
  useEffect(() => {
    const saved = getEsp32Ip()
    setEsp32Ip(saved)
    if (saved) checkConn(saved)
    else setConnState('disconnected')
  }, [])

  // ── Connection check ─────────────────────────────────────────────
  const checkConn = useCallback(async (ip: string) => {
    setConnState('checking')
    const ok = await checkEsp32Connection(ip)
    setConnState(ok ? 'connected' : 'disconnected')
  }, [])

  // ── Start polling when session goes active ────────────────────────
  useEffect(() => {
    if (state !== 'active' || connState !== 'connected') return

    const poll = async () => {
      try {
        const data = await fetchEsp32Status(esp32Ip)
        setEsp32Data(data)
      } catch {
        setConnState('disconnected')
      }
    }

    poll() // immediate first fetch
    pollRef.current = setInterval(poll, 2000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [state, connState, esp32Ip])

  // ── Stop polling on success ───────────────────────────────────────
  useEffect(() => {
    if (state === 'success' && pollRef.current) {
      clearInterval(pollRef.current)
    }
  }, [state])

  // ── Manual bottle helpers ─────────────────────────────────────────
  const add    = (type: BottleType) => setManualBottles(p => ({ ...p, [type]: p[type] + 1 }))
  const remove = (type: BottleType) => setManualBottles(p => ({ ...p, [type]: Math.max(0, p[type] - 1) }))

  // ── Finish session ────────────────────────────────────────────────
  const finishSession = async () => {
    if (connState === 'connected') {
      try { await resetEsp32(esp32Ip) } catch { /* ignore */ }
    }
    setState('success')
  }

  // ── Success animation ─────────────────────────────────────────────
  useEffect(() => {
    if (state !== 'success') return
    let n = 0
    const iv = setInterval(() => {
      n += Math.ceil(totalPoints / 25)
      if (n >= totalPoints) { setDisplayPts(totalPoints); clearInterval(iv) }
      else setDisplayPts(n)
    }, 30)

    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width  = canvas.offsetWidth
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

  // ════════════════════════════════════════════
  //  CONNECT SCREEN
  // ════════════════════════════════════════════
  if (state === 'connect') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <div className="status-bar"><span>9:41</span><span>●●●</span></div>
        <BackHeader title="Connect Machine" backHref="/dashboard" />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 16px', gap: 16 }}>

          {/* Machine icon */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0 4px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 22,
              background: 'var(--green-bg)', border: '1.5px solid var(--border-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, marginBottom: 10,
            }}>🏧</div>
            <p className="display" style={{ fontSize: 18 }}>EcoCrusher Machine</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Enter your ESP32's WiFi IP address</p>
          </div>

          {/* IP Input */}
          <div>
            <p className="label-caps" style={{ marginBottom: 8 }}>ESP32 IP Address</p>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. 192.168.0.50"
              value={esp32Ip}
              onChange={e => setEsp32Ip(e.target.value)}
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em', fontSize: 16 }}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Find this in your Arduino Serial Monitor after the ESP32 connects to WiFi
            </p>
          </div>

          {/* Connection status indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: '12px 14px',
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              background: connState === 'connected' ? '#5EE89A' : connState === 'checking' ? '#FAC775' : '#FF7A7A',
              boxShadow: connState === 'connected' ? '0 0 8px #5EE89A' : connState === 'checking' ? '0 0 8px #FAC775' : 'none',
              animation: connState === 'checking' ? 'pulse 1s infinite' : 'none',
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>
                {connState === 'connected'    ? 'Machine Connected'
                : connState === 'checking'   ? 'Checking connection…'
                :                              'Machine Not Found'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                {connState === 'connected'
                  ? `ESP32 is online at ${esp32Ip}`
                  : connState === 'checking'
                  ? 'Trying to reach the ESP32…'
                  : 'Make sure both devices are on the same WiFi'}
              </p>
            </div>
            {connState === 'connected' && (
              <span style={{ fontSize: 11, color: '#5EE89A', fontWeight: 600 }}>● LIVE</span>
            )}
          </div>

          {/* ESP32 sensor preview (when connected) */}
          {connState === 'connected' && esp32Data && (
            <div style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border-green)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px',
            }}>
              <p className="label-caps" style={{ marginBottom: 10 }}>Live Sensor Preview</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'IR Count',   value: esp32Data.count,           unit: 'bottles' },
                  { label: 'Sensor 1',   value: esp32Data.dist1 < 0 ? '--' : esp32Data.dist1, unit: 'cm' },
                  { label: 'Sensor 2',   value: esp32Data.dist2 < 0 ? '--' : esp32Data.dist2, unit: 'cm' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ flex: 1 }}>
                    <p className="display" style={{ fontSize: 18, color: '#5EE89A' }}>{s.value}</p>
                    <p className="stat-label">{s.label}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.unit}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  System: <span style={{ color: esp32Data.systemOn ? '#5EE89A' : '#FF7A7A', fontWeight: 600 }}>
                    {esp32Data.systemOn ? 'ON' : 'OFF'}
                  </span>
                </p>
                <button
                  onClick={() => toggleEsp32Power(esp32Ip).then(on =>
                    setEsp32Data(d => d ? { ...d, systemOn: on } : d)
                  )}
                  style={{
                    background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)',
                    borderRadius: 8, padding: '5px 12px', fontSize: 12,
                    color: 'var(--text-secondary)', cursor: 'pointer',
                  }}
                >
                  Toggle Power
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            className="btn-primary"
            disabled={connState === 'checking'}
            onClick={() => {
              if (connState === 'disconnected' && esp32Ip) {
                // Save IP and retry
                import('@/lib/esp32').then(m => m.setEsp32Ip(esp32Ip))
                checkConn(esp32Ip)
              } else if (connState === 'connected') {
                setState('active')
              }
            }}
          >
            {connState === 'checking'
              ? 'Connecting…'
              : connState === 'connected'
              ? 'Start Session →'
              : esp32Ip
              ? 'Retry Connection'
              : 'Enter IP to Connect'}
          </button>
          <button
            className="btn-ghost"
            onClick={() => setState('active')}
          >
            Continue without ESP32 (manual mode)
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    )
  }

  // ════════════════════════════════════════════
  //  SUCCESS SCREEN
  // ════════════════════════════════════════════
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
            {connState === 'connected' && <span style={{ color: '#5EE89A' }}> via EcoCrusher</span>}
          </p>

          <div className="card-green anim-fade-up" style={{ width: '100%', textAlign: 'center', marginBottom: 14, animationDelay: '0.7s' }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Points earned</p>
            <p className="display" style={{ fontSize: 52, color: '#5EE89A', lineHeight: 1 }}>+{displayPts}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Total balance: {2840 + totalPoints} pts</p>
          </div>

          <div className="anim-fade-up" style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 16, animationDelay: '0.85s' }}>
            {[
              { icon: '♻️', value: totalBottles,      label: 'Bottles' },
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
            <button className="btn-primary"  style={{ flex: 2 }} onClick={() => router.push('/scan')}>
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

  // ════════════════════════════════════════════
  //  ACTIVE SESSION SCREEN
  // ════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div className="status-bar"><span>9:41</span><span>●●●</span></div>
      <BackHeader title="Crushing Session" backHref="/dashboard" />

      {/* Machine + connection banner */}
      <div style={{ margin: '0 16px 14px', background: 'var(--bg-surface)', border: `1px solid ${connState === 'connected' ? 'var(--border-green)' : 'rgba(255,100,100,0.2)'}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏧</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600 }}>EcoCrusher #{esp32Ip || 'Manual'}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {connState === 'connected' ? `Live · ${esp32Ip}` : 'Manual mode — ESP32 not connected'}
          </p>
        </div>
        <div style={{
          background: connState === 'connected' ? 'rgba(94,232,154,0.12)' : 'rgba(255,100,100,0.1)',
          border: `0.5px solid ${connState === 'connected' ? 'var(--border-green)' : 'rgba(255,100,100,0.3)'}`,
          borderRadius: 20, padding: '4px 10px', fontSize: 10, fontWeight: 600,
          color: connState === 'connected' ? '#5EE89A' : '#FF7A7A',
        }}>
          {connState === 'connected' ? '● LIVE' : '○ OFFLINE'}
        </div>
      </div>

      {/* Live sensor strip (when connected) */}
      {connState === 'connected' && esp32Data && (
        <div style={{ margin: '0 16px 14px', display: 'flex', gap: 8 }}>
          {[
            { label: 'IR Count',   value: esp32Data.count,                                     color: '#5EE89A' },
            { label: 'Dist 1',     value: esp32Data.dist1 < 0 ? '--' : `${esp32Data.dist1}cm`, color: '#FAC775' },
            { label: 'Dist 2',     value: esp32Data.dist2 < 0 ? '--' : `${esp32Data.dist2}cm`, color: '#85B7EB' },
            { label: 'Servo',      value: `${esp32Data.servoAngle}°`,                          color: '#D4A0FF' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
              <p className="display" style={{ fontSize: 14, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Live counter */}
      <div style={{ margin: '0 16px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '20px 16px', textAlign: 'center' }}>
        <p className="display" style={{ fontSize: 52, lineHeight: 1 }}>{totalBottles}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 16px' }}>
          bottles crushed so far
          {connState === 'connected' && <span style={{ color: '#5EE89A' }}> · live</span>}
        </p>
        <div style={{ background: 'var(--green-bg)', borderRadius: 10, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Points earned</span>
          <span className="display" style={{ fontSize: 22, color: '#5EE89A' }}>+{totalPoints}</span>
        </div>
      </div>

      {/* Manual type adjustment (always available) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 8px' }}>
        <p className="label-caps">
          {connState === 'connected' ? 'Manual Adjustment' : 'Bottle types'}
        </p>
        {connState === 'connected' && (
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Add extras not counted by IR</p>
        )}
      </div>
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
              <span className="display" style={{ fontSize: 18, minWidth: 28, textAlign: 'center' }}>{manualBottles[b.type]}</span>
              <button onClick={() => add(b.type)}    style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--green-bg)', border: '0.5px solid var(--border-green)', color: '#5EE89A', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 16px 24px' }}>
        <button
          className="btn-primary"
          disabled={totalBottles === 0}
          onClick={finishSession}
        >
          Finish Session · Earn {totalPoints} pts
        </button>
      </div>
    </div>
  )
}
