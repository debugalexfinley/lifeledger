# LifeLedger 🎮

> A pixel/retro turn-based financial life simulation game

Live your financial life from youth to age 75. Every month is a turn. Every decision shapes your future. Score at retirement. Compare globally.

## 🎮 Game Overview

- **Turn-based**: 1 turn = 1 month of your life
- **Starting Points**: High School (16) → Hard Mode | College (18) → Normal | Post-Grad (22) → Easy
- **Random Background**: Your parental income tier (Low/Middle/High) is randomly rolled
- **100+ Life Events**: Career, Health, Market, Family, Wildcard & Opportunity events
- **Final Score**: Based on Net Worth (40%) + Lifetime Income (20%) + Happiness (30%) + Health (10%)
- **Global Leaderboard**: Top 100 scores, filterable by starting point and background
- **AI Narratives**: Claude generates personalized story summaries at ages 30, 50, and 75

## 🛠️ Stack

- **Next.js 14** + TypeScript + Tailwind CSS
- **Convex** (real-time database, game state, leaderboard)
- **Claude API** (milestone narratives only)
- **Pixel Fonts**: Press Start 2P + VT323 (Google Fonts)
- **Deployed on Vercel**

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up Convex
npx convex dev

# Seed event templates (run once from Convex dashboard or via the game)
# Seeding happens automatically on first game load

# Start development server
npm run dev
```

## 📋 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
CONVEX_DEPLOYMENT=         # Auto-set by convex dev
NEXT_PUBLIC_CONVEX_URL=    # Auto-set by convex dev
ANTHROPIC_API_KEY=         # For Claude milestone summaries
```

## 🏗️ Project Structure

```
app/
  page.tsx          # Title screen with leaderboard preview
  setup/            # Character creation (5-step)
  game/             # Main game dashboard
  event/            # Full-screen event cards
  milestone/        # Age 30/50/75 narrative screens
  retirement/       # End game results + grade
  leaderboard/      # Top 100 global scores
  components/       # Shared UI components

convex/
  schema.ts         # Database schema (games, leaderboard, eventTemplates)
  games.ts          # Core game engine mutations
  leaderboard.ts    # Leaderboard queries
  seedEvents.ts     # 100+ event templates
  claude.ts         # Claude API integration
```

## 🎯 Game Mechanics

### Financial Simulation
- Monthly income - expenses → cash flow
- Investment returns: Stocks (0.8%/mo ± 3% variance), Real Estate (+0.3%/mo), Retirement (+0.7%/mo)
- Debt interest: Student loans (0.5%/mo), Credit cards (1.8%/mo), Mortgage (0.4%/mo)

### Life Stats
- **Happiness** (0-100): Drops with financial stress, rises with achievements
- **Health** (0-100): Age drift after 40, lifestyle modifier, random events

### Decision Types
- Career: Apply for jobs, request raises, start side hustles
- Education: Trade school, bachelor's, master's, etc.
- Housing: Buy starter/mid home with mortgage
- Investment: Stocks, retirement accounts
- Debt: Extra payments on student/credit card/mortgage debt
- Lifestyle: Frugal (×0.85) | Normal (×1.0) | Lavish (×1.3)

## 📊 Scoring

| Category | Weight | Scale |
|----------|--------|-------|
| Net Worth | 40% | $0→0pts, $1M→100pts, $5M+→150pts |
| Lifetime Income | 20% | $0→0pts, $3M→100pts, $8M+→150pts |
| Avg Happiness | 30% | 0-100 direct |
| Final Health | 10% | 0-100 direct |

Grades: A+ (95+) | A | A- | B+ | B | B- | C+ | C | C- | D+ | D | D- | F (< 40)

## 🚀 Deployment

Deploy to Vercel:

```bash
vercel
# or
npx vercel --prod
```

Set `ANTHROPIC_API_KEY` in Vercel environment variables for Claude narratives.

---

Built by Jordan-DevJunior for SnapStage Labs 🎮
