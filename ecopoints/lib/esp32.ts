// ── ESP32 client helper ────────────────────────────────────────────────────
// Reads live sensor data from the ESP32 HTTP server running on local WiFi.
// The ESP32 serves:
//   GET  /status  →  { systemOn, count, dist1, dist2, servoAngle }
//   POST /reset   →  resets bottle count to 0
//   POST /power   →  toggles system on/off
// ──────────────────────────────────────────────────────────────────────────

const ESP32_IP_KEY = 'ecocrusher_esp32_ip'

export interface Esp32Status {
  systemOn:   boolean
  count:      number   // total bottles detected by IR sensor
  bin1Full:   boolean  // true if ultrasonic sensor 1 detects object < 15cm
  bin2Full:   boolean  // true if ultrasonic sensor 2 detects object < 15cm
  dist1:      number   // ultrasonic sensor 1 distance (cm), -1 = nothing
  dist2:      number   // ultrasonic sensor 2 distance (cm), -1 = nothing
  servoAngle: number   // current servo angle (0–90)
}

// ── IP persistence (localStorage) ─────────────────────────────────────────

export function getEsp32Ip(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(ESP32_IP_KEY) ?? ''
}

export function setEsp32Ip(ip: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ESP32_IP_KEY, ip.trim())
}

// ── Build base URL ─────────────────────────────────────────────────────────

function baseUrl(ip?: string): string {
  const host = ip ?? getEsp32Ip()
  return `http://${host}`
}

// ── Fetch live status ──────────────────────────────────────────────────────

export async function fetchEsp32Status(ip?: string): Promise<Esp32Status> {
  const res = await fetch(`${baseUrl(ip)}/status`, {
    method: 'GET',
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) throw new Error(`ESP32 status error: ${res.status}`)
  return res.json() as Promise<Esp32Status>
}

// ── Reset bottle counter on ESP32 ─────────────────────────────────────────

export async function resetEsp32(ip?: string): Promise<void> {
  const res = await fetch(`${baseUrl(ip)}/reset`, {
    method: 'POST',
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) throw new Error(`ESP32 reset error: ${res.status}`)
}

// ── Toggle power on ESP32 ─────────────────────────────────────────────────

export async function toggleEsp32Power(ip?: string): Promise<boolean> {
  const res = await fetch(`${baseUrl(ip)}/power`, {
    method: 'POST',
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) throw new Error(`ESP32 power error: ${res.status}`)
  const data = await res.json() as { systemOn: boolean }
  return data.systemOn
}

// ── Quick connectivity check ───────────────────────────────────────────────
// Returns true if ESP32 is reachable and responding

export async function checkEsp32Connection(ip?: string): Promise<boolean> {
  try {
    await fetchEsp32Status(ip)
    return true
  } catch {
    return false
  }
}
