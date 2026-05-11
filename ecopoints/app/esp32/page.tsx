'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { BackHeader } from '@/components/ui'
import { getEsp32Ip, setEsp32Ip, type Esp32Status } from '@/lib/esp32'

type ConnState = 'idle' | 'checking' | 'connected' | 'error'

interface LogEntry {
  time: string
  type: 'success' | 'error' | 'info'
  message: string
}

export default function Esp32DiagnosticsPage() {
  const [ipInput,    setIpInput]    = useState('')
  const [connState,  setConnState]  = useState<ConnState>('idle')
  const [liveData,   setLiveData]   = useState<Esp32Status | null>(null)
  const [rawJson,    setRawJson]    = useState('')
  const [log,        setLog]        = useState<LogEntry[]>([])
  const [polling,    setPolling]    = useState(false)
  const [latency,    setLatency]    = useState<number | null>(null)
  const [errorMsg,   setErrorMsg]   = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = getEsp32Ip()
    if (saved) setIpInput(saved)
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false })
    setLog(prev => [...prev.slice(-49), { time, type, message }])
  }, [])

  // Single ping
  const ping = useCallback(async (ip: string): Promise<boolean> => {
    const t0 = performance.now()
    try {
      const res = await fetch(`http://${ip}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(4000),
      })
      const ms = Math.round(performance.now() - t0)
      setLatency(ms)

      if (!res.ok) {
        addLog('error', `HTTP ${res.status} — ${res.statusText} (${ms}ms)`)
        return false
      }

      const text = await res.text()
      setRawJson(text)
      const data = JSON.parse(text) as Esp32Status
      setLiveData(data)
      addLog('success', `OK ${ms}ms · count=${data.count} bin1=${data.bin1Full ? 'FULL' : 'OK'} bin2=${data.bin2Full ? 'FULL' : 'OK'} servo=${data.servoAngle}°`)
      return true
    } catch (e: unknown) {
      const ms = Math.round(performance.now() - t0)
      setLatency(null)
      const msg = e instanceof Error ? e.message : String(e)
      addLog('error', `${msg} (${ms}ms)`)
      return false
    }
  }, [addLog])

  const handleConnect = async () => {
    if (!ipInput.trim()) return
    const ip = ipInput.trim()
    setEsp32Ip(ip)
    setConnState('checking')
    setErrorMsg('')
    addLog('info', `Connecting to http://${ip}/status …`)

    const ok = await ping(ip)
    if (ok) {
      setConnState('connected')
      addLog('info', 'Connection established ✓')
    } else {
      setConnState('error')
      setErrorMsg('Could not reach ESP32. Check IP and WiFi.')
      addLog('error', 'Connection failed ✗')
    }
  }

  const startPolling = () => {
    if (polling) {
      // Stop
      if (pollRef.current) clearInterval(pollRef.current)
      setPolling(false)
      addLog('info', 'Live polling stopped')
    } else {
      // Start
      const ip = ipInput.trim()
      addLog('info', 'Live polling started (every 2s)')
      setPolling(true)
      pollRef.current = setInterval(() => ping(ip), 2000)
    }
  }

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const sendReset = async () => {
    const ip = ipInput.trim()
    addLog('info', `POST http://${ip}/reset`)
    try {
      const res = await fetch(`http://${ip}/reset`, {
        method: 'POST', signal: AbortSignal.timeout(3000)
      })
      const data = await res.json()
      addLog('success', `Reset OK · ${JSON.stringify(data)}`)
      if (liveData) setLiveData({ ...liveData, count: 0 })
    } catch (e: unknown) {
      addLog('error', `Reset failed: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const sendPower = async () => {
    const ip = ipInput.trim()
    addLog('info', `POST http://${ip}/power`)
    try {
      const res = await fetch(`http://${ip}/power`, {
        method: 'POST', signal: AbortSignal.timeout(3000)
      })
      const data = await res.json() as { systemOn: boolean }
      addLog('success', `Power toggled → systemOn=${data.systemOn}`)
      if (liveData) setLiveData({ ...liveData, systemOn: data.systemOn })
    } catch (e: unknown) {
      addLog('error', `Power toggle failed: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const connColor = {
    idle:      'rgba(255,255,255,0.15)',
    checking:  '#FAC775',
    connected: '#5EE89A',
    error:     '#FF7A7A',
  }[connState]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div className="status-bar"><span>9:41</span><span>●●●</span></div>
      <BackHeader title="ESP32 Diagnostics" backHref="/profile" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── IP + connect ── */}
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
          <p className="label-caps" style={{ marginBottom: 8 }}>ESP32 IP Address</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="input-field"
              type="text"
              placeholder="192.168.x.x"
              value={ipInput}
              onChange={e => { setIpInput(e.target.value); setConnState('idle') }}
              style={{ flex: 1, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', fontSize: 15 }}
            />
            <button
              onClick={handleConnect}
              disabled={connState === 'checking'}
              style={{
                background: 'var(--green)', color: 'var(--green-dark)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 13, padding: '0 16px', cursor: 'pointer',
                opacity: connState === 'checking' ? 0.5 : 1,
              }}
            >
              {connState === 'checking' ? '…' : 'Ping'}
            </button>
          </div>

          {/* Status row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 9, height: 9, borderRadius: '50%',
              background: connColor,
              boxShadow: connState === 'connected' ? `0 0 8px ${connColor}` : connState === 'checking' ? `0 0 8px ${connColor}` : 'none',
              animation: connState === 'checking' ? 'diag-pulse 0.8s infinite' : 'none',
            }} />
            <span style={{ fontSize: 12, color: connState === 'idle' ? 'var(--text-muted)' : connColor, fontWeight: 600 }}>
              {connState === 'idle'      ? 'Not tested'
                : connState === 'checking' ? 'Pinging…'
                : connState === 'connected' ? `Connected ${latency != null ? `· ${latency}ms` : ''}`
                : errorMsg}
            </span>
            {latency != null && connState === 'connected' && (
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
                {latency < 50 ? '⚡ Excellent' : latency < 150 ? '✅ Good' : '⚠️ Slow'}
              </span>
            )}
          </div>
        </div>

        {/* ── Live sensor cards (show when we have data) ── */}
        {liveData && (
          <div>
            <p className="label-caps" style={{ marginBottom: 8 }}>Live Sensor Data</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'IR Count',    value: liveData.count,                                     unit: 'bottles', color: '#5EE89A', icon: '♻️' },
                { label: 'Servo Angle', value: `${liveData.servoAngle}°`,                          unit: 'degrees', color: '#D4A0FF', icon: '🔄' },
                { label: 'Plastic Bin', value: liveData.bin1Full ? 'FULL ⚠️' : 'OK', unit: liveData.dist1 < 0 ? 'No echo' : `${liveData.dist1} cm`, color: liveData.bin1Full ? '#FF7A7A' : '#FAC775', icon: '🗑️' },
                { label: 'Metal Bin', value: liveData.bin2Full ? 'FULL ⚠️' : 'OK', unit: liveData.dist2 < 0 ? 'No echo' : `${liveData.dist2} cm`, color: liveData.bin2Full ? '#FF7A7A' : '#85B7EB', icon: '🗑️' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <p className="display" style={{ fontSize: 20, color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1, fontStyle: 'italic' }}>{s.unit}</p>
                </div>
              ))}
            </div>

            {/* System ON/OFF indicator */}
            <div style={{ marginTop: 8, background: 'var(--bg-surface)', border: `0.5px solid ${liveData.systemOn ? 'var(--border-green)' : 'var(--border-subtle)'}`, borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: liveData.systemOn ? '#5EE89A' : '#FF7A7A', boxShadow: liveData.systemOn ? '0 0 6px #5EE89A' : 'none' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: liveData.systemOn ? '#5EE89A' : '#FF7A7A' }}>
                  System is {liveData.systemOn ? 'ON — counting enabled' : 'OFF — touch sensor to activate'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Raw JSON ── */}
        {rawJson && (
          <div>
            <p className="label-caps" style={{ marginBottom: 6 }}>Raw Response — /status</p>
            <div style={{
              background: '#0a150f', border: '0.5px solid var(--border-green)',
              borderRadius: 'var(--radius-md)', padding: '12px 14px',
              fontFamily: 'monospace', fontSize: 12, color: '#5EE89A',
              wordBreak: 'break-all', lineHeight: 1.7,
            }}>
              {JSON.stringify(JSON.parse(rawJson), null, 2)}
            </div>
          </div>
        )}

        {/* ── Control buttons ── */}
        <div>
          <p className="label-caps" style={{ marginBottom: 8 }}>Controls</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={startPolling}
              disabled={connState !== 'connected' && !polling}
              style={{
                flex: 1, minWidth: 120,
                background: polling ? 'rgba(255,100,100,0.15)' : 'rgba(94,232,154,0.12)',
                border: polling ? '1px solid rgba(255,100,100,0.3)' : '1px solid var(--border-green)',
                borderRadius: 'var(--radius-md)', padding: '11px 0',
                fontSize: 12, fontWeight: 700, color: polling ? '#FF7A7A' : '#5EE89A',
                cursor: 'pointer',
              }}
            >
              {polling ? '⏹ Stop Polling' : '▶ Start Live Poll (2s)'}
            </button>
            <button
              onClick={() => ping(ipInput.trim())}
              disabled={!ipInput || connState === 'checking'}
              style={{
                flex: 1, minWidth: 100,
                background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '11px 0',
                fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              🔄 Refresh Once
            </button>
            <button
              onClick={sendReset}
              disabled={connState !== 'connected' && liveData === null}
              style={{
                flex: 1, minWidth: 100,
                background: 'rgba(250,199,117,0.1)', border: '1px solid rgba(250,199,117,0.3)',
                borderRadius: 'var(--radius-md)', padding: '11px 0',
                fontSize: 12, fontWeight: 700, color: '#FAC775', cursor: 'pointer',
              }}
            >
              ↺ Reset Count
            </button>
            <button
              onClick={sendPower}
              disabled={connState !== 'connected' && liveData === null}
              style={{
                flex: 1, minWidth: 100,
                background: 'rgba(132,183,235,0.1)', border: '1px solid rgba(132,183,235,0.3)',
                borderRadius: 'var(--radius-md)', padding: '11px 0',
                fontSize: 12, fontWeight: 700, color: '#85B7EB', cursor: 'pointer',
              }}
            >
              ⏻ Toggle Power
            </button>
          </div>
        </div>

        {/* ── Connection log ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <p className="label-caps">Connection Log</p>
            <button onClick={() => setLog([])} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
          </div>
          <div style={{
            background: '#070f0a', border: '0.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: '10px 12px',
            maxHeight: 220, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11,
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            {log.length === 0 && (
              <span style={{ color: 'var(--text-muted)' }}>No entries yet. Enter IP and press Ping.</span>
            )}
            {log.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{entry.time}</span>
                <span style={{ color: entry.type === 'success' ? '#5EE89A' : entry.type === 'error' ? '#FF7A7A' : '#FAC775' }}>
                  {entry.type === 'success' ? '✓' : entry.type === 'error' ? '✗' : '·'}
                </span>
                <span style={{ color: entry.type === 'success' ? '#a8f5cb' : entry.type === 'error' ? '#ffaaaa' : 'rgba(255,255,255,0.6)' }}>
                  {entry.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* ── Instructions ── */}
        <div style={{ background: 'rgba(94,232,154,0.05)', border: '0.5px solid var(--border-green)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#5EE89A', marginBottom: 6 }}>📋 How to find your ESP32 IP</p>
          <ol style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              'Flash the .ino file via Arduino IDE',
              'Open Serial Monitor (115200 baud)',
              'Look for: "IP Address: 192.168.x.x"',
              'Type that IP above and press Ping',
              'Both devices must be on "Borse New" WiFi',
            ].map((step, i) => (
              <li key={i} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{step}</li>
            ))}
          </ol>
        </div>

      </div>

      <style>{`
        @keyframes diag-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
