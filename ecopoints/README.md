# EcoPoints 🌿

> Crush bottles → Earn points → Redeem cashback at partner shops

A mobile-first PWA built with **Next.js 15 (App Router)** + **TypeScript**.

---

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000 on mobile or with DevTools device mode
```

---

## Project Structure

```
ecopoints/
├── app/
│   ├── layout.tsx          # Root layout, PWA meta, font imports
│   ├── page.tsx            # Redirects → /onboarding
│   ├── onboarding/         # 4-step signup: welcome → register → OTP → permissions
│   ├── dashboard/          # Home: points card, quick actions, activity feed
│   ├── session/            # Live bottle crush session + success/confetti screen
│   ├── scan/               # QR scanner + manual code redemption
│   ├── history/            # Analytics chart + full activity log
│   └── profile/            # User stats, tier progress, settings menu
├── components/
│   └── ui/index.tsx        # Shared: BottomNav, BackHeader, PointsCard,
│                           #         OtpInput, ActivityRow, SectionHeader
├── lib/
│   └── data.ts             # Types, constants (BOTTLE_CONFIG, POINTS_TO_INR),
│                           #         mock data (MOCK_USER, MOCK_ACTIVITY, etc.)
├── styles/
│   └── globals.css         # Full design token system (CSS variables)
└── public/
    └── manifest.json       # PWA manifest
```

---

## Design Tokens (globals.css)

| Variable | Value | Usage |
|---|---|---|
| `--bg-app` | `#0C1A12` | App background |
| `--bg-card` | `#142B1D` | Card surfaces |
| `--green` | `#5EE89A` | Primary accent |
| `--green-dark` | `#063320` | Text on green buttons |
| `--font-display` | Space Grotesk 700 | Numbers, headings |
| `--font-sans` | Plus Jakarta Sans | Body text |

---

## Points System

| Bottle Type | Points Each |
|---|---|
| PET Bottle | 10 pts |
| Glass Bottle | 10 pts |
| Aluminium Can | 15 pts |

**Redemption rate:** 100 pts = ₹5 cashback

```ts
// lib/data.ts
export const POINTS_TO_INR = (pts: number) => (pts / 100) * 5
```

---

## Screens

| Route | Screen | Notes |
|---|---|---|
| `/onboarding` | 4-step signup | OTP verification, permissions |
| `/dashboard` | Home | Points card, activity feed |
| `/session` | Crush session | Live counter + success animation |
| `/scan` | Redeem QR | Camera viewfinder + manual code |
| `/history` | Analytics | Bar chart, impact stats |
| `/profile` | User profile | Tier progress, settings |
| `/nearby` | Map (TODO) | Machines + partner shops |

---

## Next Steps (Backend Integration)

### Authentication
- Replace mock OTP with Firebase Auth (phone sign-in) or Supabase Auth
- Store JWT in httpOnly cookie

### Database (Supabase / Firebase)
```sql
-- Core tables
users         (id, name, phone, email, total_points, tier, created_at)
sessions      (id, user_id, machine_id, bottles_json, points_earned, created_at)
redemptions   (id, user_id, shop_id, points_used, inr_value, created_at)
machines      (id, name, location, lat, lng, is_online)
shops         (id, name, location, lat, lng, qr_code)
```

### Machine Integration
- Each EcoCrusher machine posts to `POST /api/sessions` with bottle counts
- User's phone is scanned/entered at machine to link session

### QR Code Redemption
- Shops have static QR codes encoding their `shop_id`
- On scan: `POST /api/redeem` with `{ userId, shopId, points }`

### Map (Nearby screen)
- Use `react-map-gl` + Mapbox or Google Maps JS API
- Fetch machines + shops from `/api/nearby?lat=X&lng=Y&radius=5km`

---

## Deployment

```bash
# Vercel (recommended — zero config)
npx vercel

# Or build static PWA
npm run build
npm run start
```

Add to home screen on iOS: Safari → Share → "Add to Home Screen"
Add to home screen on Android: Chrome menu → "Install App"
