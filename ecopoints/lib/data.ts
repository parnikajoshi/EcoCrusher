// ── Types ──────────────────────────────────────────────

export type BottleType = 'PET' | 'Glass' | 'Aluminium'

export interface BottlePoints {
  type: BottleType
  pointsEach: number
  emoji: string
}

export interface ActivityItem {
  id: string
  type: 'crush' | 'redeem'
  title: string
  subtitle: string
  points: number // positive = earned, negative = spent
  date: string
}

export interface UserProfile {
  id: string
  name: string
  phone: string
  email?: string
  totalPoints: number
  totalBottles: number
  totalCashback: number   // in INR
  tier: 'Eco Starter' | 'Eco Warrior' | 'Green Champion' | 'Planet Hero'
  tierEmoji: string
  nextTierPoints: number
}

export interface Machine {
  id: string
  name: string
  location: string
  distance: string
  lat: number
  lng: number
  isOnline: boolean
}

export interface Shop {
  id: string
  name: string
  location: string
  distance: string
  lat: number
  lng: number
}

export interface CrushSession {
  machineId: string
  machineName: string
  machineLocation: string
  bottles: Record<BottleType, number>
  totalPoints: number
  plasticSavedGrams: number
  startedAt: Date
}

// ── Constants ──────────────────────────────────────────

export const BOTTLE_CONFIG: BottlePoints[] = [
  { type: 'PET',       pointsEach: 10, emoji: '🍶' },
  { type: 'Glass',     pointsEach: 10, emoji: '🫙' },
  { type: 'Aluminium', pointsEach: 15, emoji: '🥫' },
]

// 100 points = ₹5 cashback
export const POINTS_TO_INR = (pts: number) => (pts / 100) * 5

// ── Mock Data ──────────────────────────────────────────

export const MOCK_USER: UserProfile = {
  id: 'user_001',
  name: 'Rahul Sharma',
  phone: '+91 98765 43210',
  email: 'rahul.s@gmail.com',
  totalPoints: 2840,
  totalBottles: 284,
  totalCashback: 580,
  tier: 'Eco Warrior',
  tierEmoji: '🌿',
  nextTierPoints: 5000,
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', type: 'crush',  title: '5 PET Bottles crushed',  subtitle: 'Today, 10:22 AM · Aundh Mall',     points: 50  },
  { id: '2', type: 'redeem', title: 'Cashback redeemed',       subtitle: 'Yesterday · D-Mart Baner',         points: -200 },
  { id: '3', type: 'crush',  title: '12 Glass Bottles',        subtitle: 'Mon, Mar 16 · Wakad Station',      points: 120 },
  { id: '4', type: 'crush',  title: '8 Aluminium Cans',        subtitle: 'Sat, Mar 14 · Phoenix Mall',       points: 120 },
  { id: '5', type: 'redeem', title: 'Cashback redeemed',       subtitle: 'Fri, Mar 13 · BigBazaar Baner',   points: -150 },
  { id: '6', type: 'crush',  title: '6 PET Bottles crushed',  subtitle: 'Thu, Mar 12 · Aundh Mall',         points: 60  },
]

export const MOCK_MACHINES: Machine[] = [
  { id: 'm1', name: 'EcoCrusher #042', location: 'Aundh Mall, Pune',    distance: '0.2 km', lat: 18.561, lng: 73.808, isOnline: true  },
  { id: 'm2', name: 'EcoCrusher #018', location: 'Wakad Station, Pune', distance: '1.1 km', lat: 18.598, lng: 73.762, isOnline: true  },
  { id: 'm3', name: 'EcoCrusher #031', location: 'Baner Road, Pune',    distance: '1.8 km', lat: 18.559, lng: 73.789, isOnline: false },
]

export const MOCK_SHOPS: Shop[] = [
  { id: 's1', name: 'D-Mart Baner',       location: 'Baner, Pune',       distance: '0.6 km', lat: 18.560, lng: 73.791 },
  { id: 's2', name: 'BigBazaar Aundh',    location: 'Aundh, Pune',       distance: '0.9 km', lat: 18.562, lng: 73.810 },
  { id: 's3', name: 'Reliance Fresh',     location: 'Wakad, Pune',       distance: '1.3 km', lat: 18.600, lng: 73.763 },
  { id: 's4', name: 'More Supermarket',   location: 'Baner Road, Pune',  distance: '1.7 km', lat: 18.557, lng: 73.787 },
]
