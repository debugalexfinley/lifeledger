/**
 * Market Rates — baseline values for all business types.
 * Players never set absolute prices. They set premiums relative to these rates.
 * Adjust these constants to tune game balance without touching player logic.
 *
 * pricingPremium = 0%  → player charges exactly baseRevenuePerCustomer
 * pricingPremium = +30% → player charges 1.3x baseRevenuePerCustomer
 * qualityMultiplier = 1.5x → COGS = baseCOGS × 1.5, unlocks up to +50% premium ceiling
 */

export type MarketRate = {
  baseMonthlyRevenue: number;   // Monthly revenue at 0% premium, market-stage business
  baseCOGS: number;             // Monthly COGS at 1.0x quality multiplier
  baseWagePerEmployee: number;  // Monthly wage per employee at 0% wage premium
  revenuePerCustomer: number;   // Per-customer/client revenue at market rate
  avgCustomerCount: number;     // Typical customer count at market stage
};

export const MARKET_RATES: Record<string, MarketRate> = {
  // ── SAAS / SOFTWARE ──────────────────────────────────────────────────────
  "SaaS Product":             { baseMonthlyRevenue: 8000,  baseCOGS: 800,   baseWagePerEmployee: 6500,  revenuePerCustomer: 80,   avgCustomerCount: 100 },
  "Online Course":            { baseMonthlyRevenue: 4000,  baseCOGS: 300,   baseWagePerEmployee: 4000,  revenuePerCustomer: 200,  avgCustomerCount: 20  },
  "Newsletter / Substack":    { baseMonthlyRevenue: 3000,  baseCOGS: 200,   baseWagePerEmployee: 4000,  revenuePerCustomer: 12,   avgCustomerCount: 250 },
  "Digital Products":         { baseMonthlyRevenue: 2500,  baseCOGS: 100,   baseWagePerEmployee: 3500,  revenuePerCustomer: 50,   avgCustomerCount: 50  },

  // ── ECOMMERCE ─────────────────────────────────────────────────────────────
  "E-commerce (Dropshipping)":{ baseMonthlyRevenue: 5000,  baseCOGS: 2500,  baseWagePerEmployee: 2500,  revenuePerCustomer: 45,   avgCustomerCount: 110 },
  "E-commerce (Amazon FBA)":  { baseMonthlyRevenue: 8000,  baseCOGS: 4000,  baseWagePerEmployee: 2800,  revenuePerCustomer: 38,   avgCustomerCount: 210 },

  // ── AGENCIES & PROFESSIONAL SERVICES ─────────────────────────────────────
  "Marketing Agency":         { baseMonthlyRevenue: 12000, baseCOGS: 5000,  baseWagePerEmployee: 5000,  revenuePerCustomer: 2500, avgCustomerCount: 5   },
  "Design Agency":            { baseMonthlyRevenue: 8000,  baseCOGS: 2500,  baseWagePerEmployee: 4500,  revenuePerCustomer: 2000, avgCustomerCount: 4   },
  "Dev / Tech Consulting":    { baseMonthlyRevenue: 15000, baseCOGS: 4000,  baseWagePerEmployee: 8000,  revenuePerCustomer: 5000, avgCustomerCount: 3   },
  "Bookkeeping Service":      { baseMonthlyRevenue: 6000,  baseCOGS: 1500,  baseWagePerEmployee: 4000,  revenuePerCustomer: 400,  avgCustomerCount: 15  },
  "Financial Planning":       { baseMonthlyRevenue: 9000,  baseCOGS: 1500,  baseWagePerEmployee: 6000,  revenuePerCustomer: 750,  avgCustomerCount: 12  },
  "Legal Consulting":         { baseMonthlyRevenue: 18000, baseCOGS: 3000,  baseWagePerEmployee: 9000,  revenuePerCustomer: 3000, avgCustomerCount: 6   },
  "Coaching":                 { baseMonthlyRevenue: 5000,  baseCOGS: 500,   baseWagePerEmployee: 3500,  revenuePerCustomer: 500,  avgCustomerCount: 10  },

  // ── FREELANCE / SOLO ──────────────────────────────────────────────────────
  "Freelance Writing":        { baseMonthlyRevenue: 4000,  baseCOGS: 200,   baseWagePerEmployee: 0,     revenuePerCustomer: 800,  avgCustomerCount: 5   },
  "Social Media Management":  { baseMonthlyRevenue: 5000,  baseCOGS: 300,   baseWagePerEmployee: 3000,  revenuePerCustomer: 1000, avgCustomerCount: 5   },

  // ── LOCAL & PHYSICAL SERVICES ─────────────────────────────────────────────
  "Restaurant":               { baseMonthlyRevenue: 35000, baseCOGS: 13000, baseWagePerEmployee: 3200,  revenuePerCustomer: 42,   avgCustomerCount: 833 },
  "Cleaning Service":         { baseMonthlyRevenue: 8000,  baseCOGS: 2000,  baseWagePerEmployee: 2800,  revenuePerCustomer: 180,  avgCustomerCount: 44  },
  "Landscaping":              { baseMonthlyRevenue: 10000, baseCOGS: 3500,  baseWagePerEmployee: 3000,  revenuePerCustomer: 200,  avgCustomerCount: 50  },
  "Event Planning":           { baseMonthlyRevenue: 8000,  baseCOGS: 3000,  baseWagePerEmployee: 4000,  revenuePerCustomer: 2500, avgCustomerCount: 3   },
  "Photography":              { baseMonthlyRevenue: 6000,  baseCOGS: 800,   baseWagePerEmployee: 3500,  revenuePerCustomer: 1200, avgCustomerCount: 5   },
  "Personal Training":        { baseMonthlyRevenue: 5000,  baseCOGS: 500,   baseWagePerEmployee: 0,     revenuePerCustomer: 250,  avgCustomerCount: 20  },

  // ── TRADES ───────────────────────────────────────────────────────────────
  "Electrician Business":     { baseMonthlyRevenue: 18000, baseCOGS: 6000,  baseWagePerEmployee: 4500,  revenuePerCustomer: 650,  avgCustomerCount: 28  },
  "Plumbing Business":        { baseMonthlyRevenue: 16000, baseCOGS: 5500,  baseWagePerEmployee: 4200,  revenuePerCustomer: 500,  avgCustomerCount: 32  },
  "HVAC":                     { baseMonthlyRevenue: 20000, baseCOGS: 8000,  baseWagePerEmployee: 4800,  revenuePerCustomer: 400,  avgCustomerCount: 50  },
  "Auto Mechanic":            { baseMonthlyRevenue: 14000, baseCOGS: 5000,  baseWagePerEmployee: 4000,  revenuePerCustomer: 280,  avgCustomerCount: 50  },

  // ── REAL ESTATE & INVESTING ───────────────────────────────────────────────
  "Real Estate Investing":    { baseMonthlyRevenue: 4000,  baseCOGS: 1500,  baseWagePerEmployee: 3500,  revenuePerCustomer: 1200, avgCustomerCount: 3   },
  "Property Management":      { baseMonthlyRevenue: 6000,  baseCOGS: 1000,  baseWagePerEmployee: 3200,  revenuePerCustomer: 200,  avgCustomerCount: 30  },

  // ── CONTENT & CREATOR ─────────────────────────────────────────────────────
  "YouTube / Content Creator":{ baseMonthlyRevenue: 2000,  baseCOGS: 300,   baseWagePerEmployee: 3000,  revenuePerCustomer: 2,    avgCustomerCount: 1000},
  "Franchise":                { baseMonthlyRevenue: 40000, baseCOGS: 20000, baseWagePerEmployee: 3000,  revenuePerCustomer: 25,   avgCustomerCount: 1600},
};

export const DEFAULT_MARKET_RATE: MarketRate = {
  baseMonthlyRevenue: 6000,
  baseCOGS: 2000,
  baseWagePerEmployee: 3500,
  revenuePerCustomer: 500,
  avgCustomerCount: 12,
};

export function getMarketRate(businessTypeName: string): MarketRate {
  return MARKET_RATES[businessTypeName] ?? DEFAULT_MARKET_RATE;
}

// ─── CHANNEL ALIGNMENT ───────────────────────────────────────────────────────
// Each ad channel performs best within a pricing premium range.
// Mismatch between player's premium and channel sweet spot reduces conversion efficiency.

export const CHANNEL_SWEET_SPOTS: Record<string, { min: number; max: number; label: string }> = {
  amazoom_ads:     { min: -20, max: 10,  label: "Budget to Market" },
  toktok_ads:      { min: -20, max: 20,  label: "Budget to Slight Premium" },
  facespace_ads:   { min: -10, max: 30,  label: "Value to Premium" },
  instapic_ads:    { min: 0,   max: 50,  label: "Market to Luxury" },
  gooble_search:   { min: -10, max: 40,  label: "Broad Range" },
  viewtube_ads:    { min: 0,   max: 50,  label: "Market to Premium" },
  email_marketing: { min: 0,   max: 60,  label: "Market to Luxury" },
  prolink_ads:     { min: 20,  max: 100, label: "Premium to Luxury Only" },
  influencer:      { min: 10,  max: 80,  label: "Premium-Leaning" },
  seo_organic:     { min: -5,  max: 50,  label: "Broad Range" },
  affiliate:       { min: 0,   max: 40,  label: "Market to Premium" },
};

/**
 * Returns 0.2-1.0 based on how well the player's pricing premium
 * matches the channel's sweet spot. Perfect fit = 1.0, far outside = 0.2.
 */
export function channelEfficiencyMultiplier(channelId: string, pricingPremium: number): number {
  const spot = CHANNEL_SWEET_SPOTS[channelId];
  if (!spot) return 1.0;
  if (pricingPremium >= spot.min && pricingPremium <= spot.max) return 1.0;
  const distance = Math.min(
    Math.abs(pricingPremium - spot.min),
    Math.abs(pricingPremium - spot.max)
  );
  return Math.max(0.2, 1 - distance * 0.02);
}

/**
 * Maximum sustainable pricing premium given a quality multiplier.
 * Charging above ceiling = brand erosion + churn spike.
 */
export function qualityPricingCeiling(qualityMultiplier: number): number {
  // 1.0x quality → 0% ceiling (market rate only)
  // 1.5x quality → 25% ceiling
  // 2.0x quality → 50% ceiling
  // 3.0x quality → 100% ceiling
  return Math.round((qualityMultiplier - 1) * 50);
}
