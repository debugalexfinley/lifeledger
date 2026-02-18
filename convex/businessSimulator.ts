/**
 * businessSimulator.ts
 * Full BSG-style business simulation engine.
 * Three engines: ecom | saas | service
 * Uses business-type-aware profiles from businessTypeProfiles.ts
 * All platform/brand names from lib/gameUniverse.ts
 */
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getBusinessProfile, BusinessProfile } from "./businessTypeProfiles";
import { getMarketRate, channelEfficiencyMultiplier, qualityPricingCeiling, CHANNEL_SWEET_SPOTS } from "./marketRates";

export { CHANNEL_SWEET_SPOTS };

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const ECOM_TYPES   = ["Dropshipping", "E-commerce", "Amazon FBA", "E-Commerce"];
const SAAS_TYPES   = ["SaaS", "Newsletter", "Online Course", "Content Creator", "YouTube", "Digital Product", "Substack", "App"];
// everything else → service

export function determineEngine(businessTypeName: string): "ecom" | "saas" | "service" {
  const n = businessTypeName.toLowerCase();
  if (ECOM_TYPES.some(t => n.includes(t.toLowerCase())))  return "ecom";
  if (SAAS_TYPES.some(t => n.includes(t.toLowerCase()))) return "saas";
  return "service";
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPETITOR EVENT TEMPLATES (random events that require a response choice)
// ─────────────────────────────────────────────────────────────────────────────

export const COMPETITOR_EVENTS = [
  {
    type: "competitor_launch",
    description: "A well-funded competitor just launched a nearly identical product in your market.",
    duration: 3,
    responses: [
      { id: "differentiate", label: "Double down on your unique angle",   timeCost: 15, moneyCost: 500,  outcome: "brand_boost" },
      { id: "price_war",     label: "Drop your prices 20% to compete",    timeCost: 4,  moneyCost: 0,    outcome: "price_reduction" },
      { id: "ignore",        label: "Stay the course",                    timeCost: 0,  moneyCost: 0,    outcome: "churn_risk" },
    ],
  },
  {
    type: "price_war",
    description: "Your main competitor just slashed prices by 30%.",
    duration: 2,
    responses: [
      { id: "match",    label: "Match their pricing",                       timeCost: 2,  moneyCost: 0,   outcome: "margin_reduction" },
      { id: "value_up", label: "Add more value instead of cutting price",   timeCost: 20, moneyCost: 800, outcome: "ltv_boost" },
    ],
  },
  {
    type: "competitor_exit",
    description: "Your main competitor just shut down. Their customers need a new home.",
    duration: 2,
    responses: [
      { id: "capture", label: "Aggressive outreach to their customers",   timeCost: 20, moneyCost: 1000, outcome: "customer_surge" },
      { id: "organic", label: "Let them come to you organically",          timeCost: 0,  moneyCost: 0,   outcome: "small_customer_gain" },
    ],
  },
  {
    type: "copycat",
    description: "Someone copied your product almost exactly and is undercutting your price.",
    duration: 4,
    responses: [
      { id: "legal",   label: "Send a cease and desist ($2,000)",          timeCost: 5,  moneyCost: 2000, outcome: "copycat_slowed" },
      { id: "outpace", label: "Ship features faster and pull ahead",       timeCost: 30, moneyCost: 0,    outcome: "product_lead" },
    ],
  },
  {
    type: "industry_downturn",
    description: "Your industry hit a rough patch. Buyers are pulling back budgets.",
    duration: 4,
    responses: [
      { id: "pivot_down", label: "Launch a lower-priced tier",             timeCost: 15, moneyCost: 500, outcome: "volume_play" },
      { id: "enterprise", label: "Go upmarket to larger clients",          timeCost: 20, moneyCost: 0,   outcome: "enterprise_bet" },
    ],
  },
  {
    type: "viral_moment",
    description: "One of your posts went viral — 50k impressions overnight.",
    duration: 2,
    responses: [
      { id: "capitalize", label: "Double ad spend to capture the wave",   timeCost: 5,  moneyCost: 2000, outcome: "customer_surge" },
      { id: "ride",       label: "Let the organic traffic flow naturally", timeCost: 0,  moneyCost: 0,    outcome: "small_customer_gain" },
    ],
  },
  {
    type: "partnership_offer",
    description: "A larger company wants to white-label your product and resell it.",
    duration: 3,
    responses: [
      { id: "accept",  label: "Accept the white-label deal",                timeCost: 20, moneyCost: 0, outcome: "revenue_surge" },
      { id: "counter", label: "Counter with a revenue-share structure",     timeCost: 15, moneyCost: 0, outcome: "ltv_boost" },
      { id: "decline", label: "Decline to protect your brand",             timeCost: 0,  moneyCost: 0, outcome: "brand_boost" },
    ],
  },
  {
    type: "key_employee_quit",
    description: "Your best team member just resigned — poached by a larger company.",
    duration: 2,
    responses: [
      { id: "counter",  label: "Counter-offer with a 20% raise",           timeCost: 3,  moneyCost: 0, outcome: "retention_bonus" },
      { id: "backfill", label: "Start recruiting immediately",             timeCost: 15, moneyCost: 0, outcome: "backfill_hire" },
      { id: "absorb",   label: "Absorb the work across the team",          timeCost: 10, moneyCost: 0, outcome: "churn_risk" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAP TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export const ROADMAP_TEMPLATES = [
  { title: "Mobile App",            description: "Build a native iOS/Android app.",          category: "product"      as const, timeRequired: 60, moneyRequired: 5000, expectedImpact: "+25% conversion", rippleEffect: "conversion_boost",   rippleValue: 25 },
  { title: "API / Integrations",    description: "Connect to tools customers already use.",  category: "feature"      as const, timeRequired: 40, moneyRequired: 0,    expectedImpact: "-20% churn",       rippleEffect: "churn_reduction",    rippleValue: 20 },
  { title: "Premium Tier",          description: "Add a high-value enterprise plan.",        category: "product"      as const, timeRequired: 20, moneyRequired: 0,    expectedImpact: "+$3k-15k MRR",     rippleEffect: "monthly_revenue_add", rippleValue: 5000 },
  { title: "Analytics Dashboard",   description: "Deep usage insights for customers.",       category: "feature"      as const, timeRequired: 35, moneyRequired: 1000, expectedImpact: "+15% LTV",         rippleEffect: "ltv_boost",          rippleValue: 15 },
  { title: "Onboarding Overhaul",   description: "Redesign first 7-day user experience.",   category: "improvement"  as const, timeRequired: 25, moneyRequired: 500,  expectedImpact: "+30% activation",  rippleEffect: "conversion_boost",   rippleValue: 30 },
  { title: "White-label Version",   description: "Let agencies resell under their brand.",   category: "product"      as const, timeRequired: 50, moneyRequired: 2000, expectedImpact: "+$5k-20k MRR",     rippleEffect: "monthly_revenue_add", rippleValue: 8000 },
  { title: "Community Forum",       description: "Self-serve support + community hub.",      category: "improvement"  as const, timeRequired: 15, moneyRequired: 200,  expectedImpact: "-15% support load", rippleEffect: "time_saved",         rippleValue: 15 },
  { title: "AI Feature",            description: "Add AI-powered capability to product.",    category: "feature"      as const, timeRequired: 45, moneyRequired: 3000, expectedImpact: "+20% retention",   rippleEffect: "churn_reduction",    rippleValue: 20 },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Stage / Competitor Init
// ─────────────────────────────────────────────────────────────────────────────

export function initCompetitors(profile: BusinessProfile): any[] {
  const [c0, c1, c2] = profile.competitors;
  return [
    { name: c0.name, strategy: c0.strategy, priceIndex: 20, qualityLevel: 30, adSpend: 500,  brandReputation: 30, marketShare: 28, monthlyRevenue: 4200, trend: "flat" },
    { name: c1.name, strategy: c1.strategy, priceIndex: 80, qualityLevel: 85, adSpend: 1000, brandReputation: 70, marketShare: 22, monthlyRevenue: 8800, trend: "flat" },
    { name: c2.name, strategy: c2.strategy, priceIndex: 50, qualityLevel: 60, adSpend: 5000, brandReputation: 50, marketShare: 25, monthlyRevenue: 9500, trend: "up"   },
  ];
}

export function updateBusinessStageSync(game: any): Record<string, any> {
  const revenue  = game.activeBusiness?.monthlyRevenue ?? 0;
  const newStage = revenue < 2000 ? "startup" : revenue < 20000 ? "growth" : "scale";
  if (newStage === game.businessStageLabel) return {};

  const profile = getBusinessProfile(game.activeBusiness?.businessTypeName ?? "");
  const patch: Record<string, any> = { businessStageLabel: newStage };

  if (newStage === "growth" && !["growth", "scale"].includes(game.businessStageLabel ?? "")) {
    patch.businessMetrics = {
      mrr:            revenue,
      customerCount:  Math.round(revenue / 50),
      churnRate:      0.05,
      cac:            150,
      ltv:            800,
      grossMarginPct: profile.channelMargins.direct / 100,
      brandReputation: 40,
      leadsPerMonth:  20,
      conversionRate: 0.15,
    };
    patch.productRoadmap   = game.productRoadmap ?? [];
    patch.salesChannelMix  = { direct: 100, wholesale: 0, marketplace: 0 };
    patch.businessLevers   = { priceIndexPct: 0, qualityBudgetLevel: "medium", adSpendMonthly: 0, productVariety: 1, rdInvestment: 0 };
    patch.competitors      = initCompetitors(profile);
  }

  if (newStage === "scale") {
    patch.departments  = game.departments ?? [
      { name: "Product",    budget: 10000, headCount: 2, efficiency: 70 },
      { name: "Marketing",  budget: 8000,  headCount: 2, efficiency: 70 },
      { name: "Sales",      budget: 6000,  headCount: 1, efficiency: 70 },
      { name: "Operations", budget: 4000,  headCount: 1, efficiency: 70 },
    ];
    patch.investorStage = game.investorStage ?? "none";
  }

  return patch;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Customer Simulation (SaaS/Service engine)
// ─────────────────────────────────────────────────────────────────────────────

export function runCustomerSimulationSync(game: any): Record<string, any> {
  const metrics = game.businessMetrics;
  if (!metrics) return {};
  const oldMRR       = metrics.mrr;
  const newLeads     = Math.round(metrics.leadsPerMonth * (0.8 + Math.random() * 0.4));
  const newCustomers = Math.round(newLeads * metrics.conversionRate);
  const churned      = Math.round(metrics.customerCount * metrics.churnRate);
  const netCustomers = Math.max(0, metrics.customerCount + newCustomers - churned);
  const avgRev       = metrics.mrr / Math.max(1, metrics.customerCount);
  const newMRR       = Math.max(0, Math.round(netCustomers * avgRev));
  return {
    businessMetrics: { ...metrics, customerCount: netCustomers, mrr: newMRR, leadsPerMonth: newLeads },
    _mrrDelta: newMRR - oldMRR,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Business Lever Application
// ─────────────────────────────────────────────────────────────────────────────

export function applyLeversToMetricsSync(game: any): { businessMetrics?: any; expenseDelta?: number } {
  const levers  = game.businessLevers;
  const metrics = game.businessMetrics;
  if (!levers || !metrics) return {};

  const profile = getBusinessProfile(game.activeBusiness?.businessTypeName ?? "");
  const updated = { ...metrics };
  let   expenseDelta = 0;

  // Price index: each 1% above market → -0.5% conversion, +0.3% gross margin
  const priceEffect = levers.priceIndexPct / 100;
  updated.conversionRate = Math.max(0.02, metrics.conversionRate * (1 - priceEffect * 0.5));
  updated.grossMarginPct = Math.min(0.95, Math.max(0.05, metrics.grossMarginPct + priceEffect * 0.003));

  // Quality level
  const qualMap: Record<string, number[]> = {
    low:     [ 0.02, -1, -500],   // churnDelta, brandDelta, expDelta
    medium:  [ 0,     0,    0],
    high:    [-0.01,  1, 1000],
    premium: [-0.02,  2, 2000],
  };
  const [churnD, brandD, expD] = qualMap[levers.qualityBudgetLevel] ?? [0, 0, 0];
  updated.churnRate       = Math.min(0.3, Math.max(0.005, metrics.churnRate + churnD));
  updated.brandReputation = Math.min(100, Math.max(0, metrics.brandReputation + brandD));
  expenseDelta += expD;

  // Ad spend → leads (profile-aware: each $100 = 3–8 leads based on brand)
  const leadsFromAds = (levers.adSpendMonthly / 100) * (3 + (metrics.brandReputation / 100) * 5);
  updated.leadsPerMonth = Math.round(metrics.leadsPerMonth * 0.5 + leadsFromAds + 5);
  expenseDelta += levers.adSpendMonthly;

  // Product variety — wider reach, higher op cost
  if (levers.productVariety > 1) {
    updated.leadsPerMonth = Math.round(updated.leadsPerMonth * (1 + (levers.productVariety - 1) * 0.1));
    expenseDelta += (levers.productVariety - 1) * 800;
  }

  // Channel mix → recompute gross margin using profile margins
  if (game.salesChannelMix) {
    const m = profile.channelMargins;
    const mix = game.salesChannelMix;
    updated.grossMarginPct = (
      (mix.direct / 100)      * (m.direct / 100) +
      (mix.wholesale / 100)   * (m.wholesale / 100) +
      (mix.marketplace / 100) * (m.marketplace / 100)
    );
  }

  // Strategy positioning multipliers
  const pos = game.strategyPositioning;
  if (pos) {
    if (pos.pricePosition === "premium") { updated.grossMarginPct = Math.min(0.95, updated.grossMarginPct + 0.08); updated.conversionRate *= 0.85; updated.brandReputation = Math.min(100, updated.brandReputation + 1); }
    if (pos.pricePosition === "value")   { updated.grossMarginPct = Math.max(0.05, updated.grossMarginPct - 0.08); updated.conversionRate *= 1.20; }
    if (pos.targetMarket === "niche")    { updated.conversionRate = Math.min(0.5, updated.conversionRate * 1.15); updated.ltv = Math.round(updated.ltv * 1.1); }
    if (pos.qualityPosition === "premium" || pos.qualityPosition === "luxury") { updated.churnRate = Math.max(0.005, updated.churnRate - 0.01); expenseDelta += pos.qualityPosition === "luxury" ? 3000 : 1500; }
    if (pos.qualityPosition === "budget") { updated.churnRate = Math.min(0.3, updated.churnRate + 0.01); expenseDelta -= 800; }
    if (pos.growthPriority === "acquire") { updated.leadsPerMonth = Math.round(updated.leadsPerMonth * 1.2); }
    if (pos.growthPriority === "retain")  { updated.churnRate = Math.max(0.005, updated.churnRate * 0.85); }
  }

  // R&D cost
  expenseDelta += levers.rdInvestment;

  return { businessMetrics: updated, expenseDelta };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Ecom Engine
// ─────────────────────────────────────────────────────────────────────────────

export function runEcomEngineSync(game: any): { revenueDelta?: number; expenseDelta?: number; productBreakdown?: any[] } {
  const ecom    = game.ecomConfig;
  const levers  = game.businessLevers;
  if (!ecom || !ecom.products.length) return {};

  const marketingSkillBonus = 1 + ((game.marketingSkill ?? 50) - 50) / 100;
  const adSpend  = levers?.adSpendMonthly ?? 0;
  const adAllocs = game.adChannelAllocations ?? [];

  let totalRevenue = 0;
  let totalCOGS    = 0;
  const breakdown: any[] = [];

  for (const prod of ecom.products) {
    const mix      = prod.channelMix;
    const totalMix = (mix.amazoom + mix.shopeasy + mix.other) || 100;

    // Base demand: ad spend efficiency + skill
    const baseDemand = Math.max(5, (adSpend / 20) * marketingSkillBonus);

    // Price competitiveness (assume market avg price = listPrice * 1.1)
    const priceRatio      = (prod.listPrice * 1.1) / Math.max(1, prod.listPrice);
    const priceMultiplier = Math.pow(priceRatio, -1.5); // cheaper → more units

    const totalUnits = Math.round(baseDemand * priceMultiplier * (0.7 + Math.random() * 0.6));

    const unitsAmazoom  = Math.round(totalUnits * (mix.amazoom / totalMix) * 1.2); // organic boost
    const unitsShopeasy = Math.round(totalUnits * (mix.shopeasy / totalMix));
    const unitsOther    = Math.round(totalUnits * (mix.other / totalMix));

    // Revenue per channel (minus fees)
    const revAmazoom  = unitsAmazoom  * prod.listPrice * (1 - 0.15);
    const revShopeasy = unitsShopeasy * prod.listPrice * (1 - 0.029);
    const revOther    = unitsOther    * prod.listPrice * (1 - 0.05);
    const prodRevenue = Math.round(revAmazoom + revShopeasy + revOther);
    const prodCOGS    = Math.round((unitsAmazoom + unitsShopeasy + unitsOther) * prod.unitCost);

    totalRevenue += prodRevenue;
    totalCOGS    += prodCOGS;
    breakdown.push({ id: prod.id, name: prod.name, units: totalUnits, revenue: prodRevenue, cogs: prodCOGS, margin: prodRevenue > 0 ? Math.round((1 - prodCOGS / prodRevenue) * 100) : 0 });
  }

  return { revenueDelta: totalRevenue, expenseDelta: totalCOGS + adSpend, productBreakdown: breakdown };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Service Engine
// ─────────────────────────────────────────────────────────────────────────────

export function runServiceEngineSync(game: any): { revenueDelta?: number; expenseDelta?: number } {
  const svc    = game.serviceConfig;
  if (!svc) return {};

  const levers         = game.businessLevers;
  const empCount       = (game.businessEmployees ?? []).length + 1; // +1 for owner
  const subServiceBonus = Math.min(1.3, 1 + Math.min(3, svc.selectedSubServices.length) * 0.1 - Math.max(0, svc.selectedSubServices.length - 3) * 0.05);

  // Strategy multipliers
  const pos = game.strategyPositioning;
  let rateMultiplier = 1.0;
  if (pos?.pricePosition === "premium") rateMultiplier = 1.2;
  if (pos?.pricePosition === "value")   rateMultiplier = 0.85;
  if (pos?.qualityPosition === "premium" || pos?.qualityPosition === "luxury") rateMultiplier *= 1.1;

  const hoursPerEmployee = 120; // ~30hrs/week billable
  const billableHours    = Math.round(hoursPerEmployee * empCount * svc.utilizationRate * subServiceBonus);
  const revenue          = Math.round(billableHours * svc.avgBillableRate * rateMultiplier * (0.85 + Math.random() * 0.3));
  const deliveryCost     = Math.round(revenue * (1 - (levers ? (levers.qualityBudgetLevel === "premium" ? 0.55 : levers.qualityBudgetLevel === "high" ? 0.60 : levers.qualityBudgetLevel === "low" ? 0.75 : 0.65) : 0.65)));

  return { revenueDelta: revenue, expenseDelta: deliveryCost };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Financial Report Generator
// ─────────────────────────────────────────────────────────────────────────────

export function generateFinancialReport(game: any, bizPatch: Record<string, any>): any {
  const metrics   = bizPatch.businessMetrics ?? game.businessMetrics;
  const levers    = game.businessLevers;
  const biz       = game.activeBusiness;
  if (!biz || !metrics) return null;

  const revenue  = biz.monthlyRevenue;
  const mix      = game.salesChannelMix ?? { direct: 100, wholesale: 0, marketplace: 0 };
  const profile  = getBusinessProfile(biz.businessTypeName ?? "");
  const margins  = profile.channelMargins;

  const revenueByChannel = {
    direct:      Math.round(revenue * mix.direct / 100),
    wholesale:   Math.round(revenue * mix.wholesale / 100),
    marketplace: Math.round(revenue * mix.marketplace / 100),
  };

  const grossMarginPct = metrics.grossMarginPct;
  const cogs           = Math.round(revenue * (1 - grossMarginPct));
  const grossProfit    = revenue - cogs;

  const adSpend    = levers?.adSpendMonthly ?? 0;
  const rdSpend    = levers?.rdInvestment ?? 0;
  const adAllocs   = game.adChannelAllocations ?? [];
  const totalAdSpend = adAllocs.reduce((s: number, a: any) => s + a.monthlyBudget, adSpend);

  const payroll    = (game.businessEmployees ?? []).reduce((s: number, e: any) => s + e.monthlySalary, 0);
  const toolsEst   = 200 + (levers?.productVariety ?? 1) * 100;

  const opExMarketing = totalAdSpend;
  const opExPayroll   = payroll;
  const opExTools     = toolsEst;
  const totalOpEx     = opExMarketing + opExPayroll + opExTools;

  const netProfit     = grossProfit - totalOpEx;
  const netMarginPct  = revenue > 0 ? netProfit / revenue : 0;
  const burnRate      = netProfit < 0 ? Math.abs(netProfit) : 0;
  const empCount      = (game.businessEmployees ?? []).length + 1;
  const revenuePerEmp = Math.round(revenue / empCount);
  const marketingROI  = totalAdSpend > 0 ? revenue / totalAdSpend : 0;
  const ltvCacRatio   = metrics.cac > 0 ? metrics.ltv / metrics.cac : 0;

  return {
    age: game.currentAge, month: game.currentMonth,
    revenue, revenueByChannel,
    cogs, grossProfit,
    grossMarginPct: Math.round(grossMarginPct * 100),
    opExMarketing, opExPayroll, opExTools,
    netProfit, netMarginPct: Math.round(netMarginPct * 100),
    burnRate, revenuePerEmployee: revenuePerEmp,
    marketingROI: Math.round(marketingROI * 10) / 10,
    ltvCacRatio:  Math.round(ltvCacRatio * 10) / 10,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Competitor Simulation
// ─────────────────────────────────────────────────────────────────────────────

export function rollCompetitorEvent(stage: string): typeof COMPETITOR_EVENTS[0] | null {
  if (stage === "startup") return null;
  if (Math.random() > 0.12) return null;
  return COMPETITOR_EVENTS[Math.floor(Math.random() * COMPETITOR_EVENTS.length)];
}

export function runCompetitorSimulationSync(game: any): { competitors?: any[]; competitorIntelLog?: string[] } {
  const stage = game.businessStageLabel;
  if (stage !== "growth" && stage !== "scale") return {};

  const profile     = getBusinessProfile(game.activeBusiness?.businessTypeName ?? "");
  let competitors: any[] = game.competitors ?? initCompetitors(profile);
  const intelEvents: string[] = [];

  competitors = competitors.map(c => {
    const updated = { ...c };
    const strat   = c.strategy.toLowerCase();
    let action = "";

    if (strat.includes("low") || strat.includes("cheap") || strat.includes("budget") || strat.includes("undercut") || strat.includes("minimal") || strat.includes("free")) {
      if (Math.random() < 0.4) {
        const cut = Math.round(Math.random() * 5) + 1;
        updated.priceIndex = Math.max(10, c.priceIndex - cut);
        action = `${c.name} cut prices ${cut}%.`;
      } else if (Math.random() < 0.25) {
        updated.adSpend = Math.round(c.adSpend * 1.1);
        action = `${c.name} raised ad spend to $${updated.adSpend.toLocaleString()}/mo.`;
      }
    } else if (strat.includes("premium") || strat.includes("quality") || strat.includes("high") || strat.includes("full-service")) {
      if (Math.random() < 0.35) {
        updated.qualityLevel    = Math.min(100, c.qualityLevel + 2);
        updated.brandReputation = Math.min(100, c.brandReputation + 1);
        action = `${c.name} invested in quality (brand → ${updated.brandReputation}).`;
      }
    } else {
      // growth / aggressive
      if (Math.random() < 0.6) {
        updated.adSpend = Math.round(c.adSpend * (1.05 + Math.random() * 0.1));
        action = `${c.name} ramped spend to $${updated.adSpend.toLocaleString()}/mo.`;
      }
    }
    if (action) intelEvents.push(action);
    return updated;
  });

  // Market share value scores
  const levers  = game.businessLevers;
  const metrics = game.businessMetrics;
  const qMap    = { low: 30, medium: 50, high: 70, premium: 90 };
  const playerQ = levers ? ((qMap as any)[levers.qualityBudgetLevel] ?? 50) : 50;
  const playerP = 50 + (levers?.priceIndexPct ?? 0);
  const playerB = metrics?.brandReputation ?? 40;

  // Strategy adjustments to player score
  let playerBonus = 0;
  if (game.strategyPositioning?.targetMarket === "niche") playerBonus += 10;
  if (game.strategyPositioning?.qualityPosition === "premium") playerBonus += 8;
  if (game.strategyPositioning?.qualityPosition === "luxury")  playerBonus += 15;

  const playerScore = playerQ * 2 + (100 - playerP) + playerB * 0.5 + playerBonus;
  const compScores  = competitors.map(c => c.qualityLevel * 2 + (100 - c.priceIndex) + c.brandReputation * 0.5);
  const totalScore  = Math.max(1, playerScore + compScores.reduce((s, sc) => s + sc, 0));

  const prevCompTotal  = (game.competitors ?? []).reduce((s: number, c: any) => s + c.marketShare, 0);
  const prevPlayerShare = game.competitors ? 100 - prevCompTotal : 25;
  const newPlayerShare  = Math.round((playerScore / totalScore) * 100);
  const shareChange     = newPlayerShare - prevPlayerShare;
  const arrow           = shareChange > 0 ? "↑" : shareChange < 0 ? "↓" : "→";

  const compTotal    = Math.max(1, compScores.reduce((s, sc) => s + sc, 0));
  const remaining    = 100 - newPlayerShare;
  const finalComps   = competitors.map((c, i) => ({
    ...c,
    marketShare:    Math.round((compScores[i] / compTotal) * remaining),
    monthlyRevenue: Math.round((compScores[i] / compTotal) * remaining * 350),
    trend: compScores[i] > ((game.competitors?.[i]?.qualityLevel ?? c.qualityLevel) * 2) ? "up" : "flat",
  }));

  if (Math.abs(shareChange) >= 1) {
    intelEvents.push(`Your market share: ${newPlayerShare}% (${arrow}${Math.abs(shareChange)}%)`);
  }

  return {
    competitors: finalComps,
    competitorIntelLog: [...intelEvents, ...(game.competitorIntelLog ?? [])].slice(0, 8),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — KPI Scorecard + Credit Rating
// ─────────────────────────────────────────────────────────────────────────────

export function calcKPIsSync(game: any, bizPatch: Record<string, any>): { boardConfidence: number; creditRating: string } {
  const metrics = bizPatch.businessMetrics ?? game.businessMetrics;
  if (!metrics) return { boardConfidence: game.boardConfidence ?? 50, creditRating: game.creditRating ?? "B" };

  const prevMRR     = game.prevMonthMRR ?? metrics.mrr * 0.9;
  const momGrowth   = prevMRR > 0 ? ((metrics.mrr - prevMRR) / prevMRR) * 100 : 0;
  const grossMargin = metrics.grossMarginPct * 100;
  const brandScore  = metrics.brandReputation;
  const revenue     = game.activeBusiness?.monthlyRevenue ?? metrics.mrr;
  const opEx        = (game.businessEmployees ?? []).reduce((s: number, e: any) => s + e.monthlySalary, 0) + (game.businessLevers?.adSpendMonthly ?? 0);
  const netProfit   = revenue * metrics.grossMarginPct - opEx;
  const industryAvg = revenue * 0.2;
  const curRating   = bizPatch.creditRating ?? game.creditRating ?? "B";

  const kpi1 = netProfit >= industryAvg ? 2 : netProfit >= 0 ? 1 : 0;
  const kpi2 = grossMargin >= 60 ? 2 : grossMargin >= 45 ? 1 : 0;
  const kpi3 = momGrowth >= 10 ? 2 : momGrowth >= 0 ? 1 : 0;
  const kpi4 = brandScore >= 65 ? 2 : brandScore >= 40 ? 1 : 0;
  const kpi5 = ["AAA","AA","A","B"].includes(curRating) ? 2 : curRating === "C" ? 1 : 0;

  const green         = [kpi1, kpi2, kpi3, kpi4, kpi5].filter(k => k === 2).length;
  const boardConfidence = Math.round((green / 5) * 100);

  const cashRunway  = (game.monthlyExpenses ?? 1) > 0 ? (game.cash ?? 0) / (game.monthlyExpenses ?? 1) : 24;
  const debtRatio   = (game.monthlyIncome ?? 1) > 0 ? (game.totalDebt ?? 0) / ((game.monthlyIncome ?? 1) * 12) : 0;

  let creditRating = "B";
  if      (cashRunway >= 18 && debtRatio < 1 && green >= 4) creditRating = "AAA";
  else if (cashRunway >= 12 && debtRatio < 2 && green >= 3) creditRating = "AA";
  else if (cashRunway >= 6  && debtRatio < 3 && green >= 2) creditRating = "A";
  else if (cashRunway >= 3  && debtRatio < 5)               creditRating = "B";
  else if (cashRunway >= 1  && debtRatio < 8)               creditRating = "C";
  else                                                       creditRating = "D";

  return { boardConfidence, creditRating };
}

export function calcBoardRecommendation(game: any, profile: BusinessProfile): string {
  const m = game.businessMetrics;
  if (!m) return "Track your metrics to unlock strategic recommendations.";
  const gm   = m.grossMarginPct * 100;
  const prev = game.prevMonthMRR ?? m.mrr * 0.9;
  const mom  = prev > 0 ? ((m.mrr - prev) / prev) * 100 : 0;
  const cTotal  = (game.competitors ?? []).reduce((s: number, c: any) => s + c.marketShare, 0);
  const pShare  = 100 - cTotal;
  if (gm < 40)       return `${profile.kpiLabels.margin} is critically low at ${gm.toFixed(0)}%. Raise prices immediately or reduce direct costs.`;
  if (gm < 60)       return `${profile.kpiLabels.margin} is ${gm.toFixed(0)}% — below 60% target. Shift more revenue to the ${profile.channels.direct} channel.`;
  if (m.churnRate > 0.1) return `Churn is ${(m.churnRate * 100).toFixed(1)}%/mo. Invest in ${profile.levers.quality} to stop the bleeding.`;
  if (mom < 0)       return `${profile.kpiLabels.growth} is declining. Re-evaluate your ${profile.levers.adSpend} strategy.`;
  if (mom < 5)       return `Growth is sluggish at ${mom.toFixed(1)}%. Add the ${profile.channels.marketplace} channel to reach new customers.`;
  if (m.brandReputation < 40) return `${profile.kpiLabels.brand} is ${m.brandReputation}/100. Upgrade ${profile.levers.quality} to build reputation.`;
  if (pShare < 20)   return `Market share is ${pShare}%. Reconsider your ${profile.levers.price} position.`;
  return `Strong position! ${mom.toFixed(1)}% ${profile.kpiLabels.growth}. Invest in ${profile.levers.rd} to maintain your edge.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — Market Positioning (price premium, wages, quality multiplier)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Applies marketPositioning on top of the stage-driven revenue.
 * Returns patches to activeBusiness revenue, monthlyExpenses, and businessMetrics.
 * Called in endMonth after advanceBusiness (so biz.monthlyRevenue is already evolved).
 */
export function applyMarketPositioningSync(game: any): {
  revenueDelta: number;
  expenseDelta: number;
  metricsPatch: any | null;
} {
  const pos = game.marketPositioning;
  const biz = game.activeBusiness;
  if (!pos || !biz) return { revenueDelta: 0, expenseDelta: 0, metricsPatch: null };

  const rate = getMarketRate(biz.businessTypeName ?? "");

  // Revenue: evolve stage-driven revenue * pricing premium factor
  // pricingPremium=0 → no change; +30 → +30%; -20 → -20%
  const revenueAdj = Math.round(biz.monthlyRevenue * (pos.pricingPremium / 100));

  // COGS: scale proportionally to current revenue, then apply quality multiplier
  const cogsBaseRatio = rate.baseCOGS / Math.max(1, rate.baseMonthlyRevenue);
  const scaledCOGS    = Math.round(biz.monthlyRevenue * cogsBaseRatio * pos.qualityMultiplier);
  // Original estimated COGS portion of expenses (40% rough split for service/saas; ecom uses actual)
  const engine        = biz.businessEngine ?? "service";
  const cogsShare     = engine === "ecom" ? 0.55 : engine === "saas" ? 0.15 : 0.40;
  const estimatedOldCOGS = Math.round(biz.monthlyExpenses * cogsShare);
  const cogsDelta     = scaledCOGS - estimatedOldCOGS;

  const metrics = game.businessMetrics ? { ...game.businessMetrics } : null;

  if (metrics) {
    // Quality ceiling check — pricing above ceiling erodes brand + spikes churn
    const ceiling = qualityPricingCeiling(pos.qualityMultiplier);
    if (pos.pricingPremium > ceiling + 15) {
      metrics.brandReputation = Math.max(0, metrics.brandReputation - 3);
      metrics.churnRate       = Math.min(0.3, metrics.churnRate + 0.005);
    }

    // Channel efficiency applied to ad-driven leads
    const adAllocs = game.adChannelAllocations ?? [];
    if (adAllocs.length > 0) {
      let channelLeads = 0;
      for (const alloc of adAllocs) {
        if (alloc.monthlyBudget > 0) {
          const eff = channelEfficiencyMultiplier(alloc.channelId, pos.pricingPremium);
          channelLeads += (alloc.monthlyBudget / 100) * 4 * eff;
        }
      }
      // Blend: 40% existing organic + 60% channel-driven
      metrics.leadsPerMonth = Math.max(1, Math.round(metrics.leadsPerMonth * 0.4 + channelLeads));
    }

    // Wages premium → affects brand/reputation indirectly (team quality signals)
    if (pos.wagesPremium >= 30) metrics.brandReputation = Math.min(100, metrics.brandReputation + 1);
    if (pos.wagesPremium < -10) metrics.brandReputation = Math.max(0, metrics.brandReputation - 1);
  }

  return { revenueDelta: revenueAdj, expenseDelta: cogsDelta, metricsPatch: metrics };
}

/**
 * Returns wages premium multipliers for candidate generation.
 * poolMultiplier: how many candidates are available (0.7 – 1.4)
 * reliabilityBonus: added to each candidate's reliability score (-15 to +25 pts)
 */
export function wagesPremiumCandidateEffect(wagesPremium: number): { poolMultiplier: number; reliabilityBonus: number } {
  if (wagesPremium >= 30) return { poolMultiplier: 1.4, reliabilityBonus: 25 };
  if (wagesPremium >= 15) return { poolMultiplier: 1.4, reliabilityBonus: 10 };
  if (wagesPremium >= 0)  return { poolMultiplier: 1.0, reliabilityBonus: 0 };
  if (wagesPremium >= -10) return { poolMultiplier: 0.85, reliabilityBonus: -8 };
  return { poolMultiplier: 0.7, reliabilityBonus: -15 };
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS — Mode / Levers / Channels
// ─────────────────────────────────────────────────────────────────────────────

export const setBusinessMode = mutation({
  args: { gameId: v.id("games"), mode: v.union(v.literal("simplified"), v.literal("full")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, { businessMode: args.mode });
    return { status: "ok" };
  },
});

export const setSalesChannelMix = mutation({
  args: { gameId: v.id("games"), direct: v.number(), wholesale: v.number(), marketplace: v.number() },
  handler: async (ctx, args) => {
    if (Math.abs(args.direct + args.wholesale + args.marketplace - 100) > 1)
      return { status: "error", message: "Channel mix must sum to 100%" };
    await ctx.db.patch(args.gameId, { salesChannelMix: { direct: args.direct, wholesale: args.wholesale, marketplace: args.marketplace } });
    return { status: "ok" };
  },
});

export const setBusinessLevers = mutation({
  args: {
    gameId:             v.id("games"),
    priceIndexPct:      v.number(),
    qualityBudgetLevel: v.string(),
    adSpendMonthly:     v.number(),
    productVariety:     v.number(),
    rdInvestment:       v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, {
      businessLevers: {
        priceIndexPct:      Math.max(-30, Math.min(50, args.priceIndexPct)),
        qualityBudgetLevel: args.qualityBudgetLevel,
        adSpendMonthly:     Math.max(0, args.adSpendMonthly),
        productVariety:     Math.max(1, Math.min(5, args.productVariety)),
        rdInvestment:       Math.max(0, args.rdInvestment),
      },
    });
    return { status: "ok" };
  },
});

export const setAdChannelAllocations = mutation({
  args: {
    gameId:      v.id("games"),
    allocations: v.array(v.object({ channelId: v.string(), monthlyBudget: v.number() })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, { adChannelAllocations: args.allocations });
    return { status: "ok" };
  },
});

export const setStrategyPositioning = mutation({
  args: {
    gameId:          v.id("games"),
    pricePosition:   v.union(v.literal("premium"), v.literal("parity"), v.literal("value")),
    targetMarket:    v.union(v.literal("mass"), v.literal("niche")),
    qualityPosition: v.union(v.literal("budget"), v.literal("standard"), v.literal("premium"), v.literal("luxury")),
    growthPriority:  v.union(v.literal("acquire"), v.literal("retain")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, {
      strategyPositioning: {
        pricePosition:   args.pricePosition,
        targetMarket:    args.targetMarket,
        qualityPosition: args.qualityPosition,
        growthPriority:  args.growthPriority,
      },
    });
    return { status: "ok" };
  },
});

export const setMarketPositioning = mutation({
  args: {
    gameId:            v.id("games"),
    pricingPremium:    v.number(),
    wagesPremium:      v.number(),
    qualityMultiplier: v.number(),
    targetSegment:     v.union(
      v.literal("budget"), v.literal("value"), v.literal("market"),
      v.literal("premium"), v.literal("luxury")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, {
      marketPositioning: {
        pricingPremium:    Math.max(-20, Math.min(100, args.pricingPremium)),
        wagesPremium:      Math.max(-20, Math.min(50,  args.wagesPremium)),
        qualityMultiplier: Math.max(0.5,  Math.min(3.0, args.qualityMultiplier)),
        targetSegment:     args.targetSegment,
      },
    });
    return { status: "ok" };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS — Ecom + Service Config
// ─────────────────────────────────────────────────────────────────────────────

export const setEcomConfig = mutation({
  args: {
    gameId:   v.id("games"),
    niche:    v.string(),
    products: v.array(v.object({
      id:        v.string(),
      name:      v.string(),
      listPrice: v.number(),
      unitCost:  v.number(),
      channelMix: v.object({ amazoom: v.number(), shopeasy: v.number(), other: v.number() }),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, { ecomConfig: { niche: args.niche, products: args.products } });
    return { status: "ok" };
  },
});

export const setServiceConfig = mutation({
  args: {
    gameId:              v.id("games"),
    selectedSubServices: v.array(v.string()),
    clientCount:         v.number(),
    avgBillableRate:     v.number(),
    utilizationRate:     v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, {
      serviceConfig: {
        selectedSubServices: args.selectedSubServices,
        clientCount:         args.clientCount,
        avgBillableRate:     Math.max(25, args.avgBillableRate),
        utilizationRate:     Math.max(0.1, Math.min(1, args.utilizationRate)),
      },
    });
    return { status: "ok" };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS — Product Roadmap
// ─────────────────────────────────────────────────────────────────────────────

export const addRoadmapItem = mutation({
  args: {
    gameId: v.id("games"), title: v.string(), description: v.string(),
    category: v.union(v.literal("feature"), v.literal("product"), v.literal("improvement")),
    timeRequired: v.number(), moneyRequired: v.number(),
    expectedImpact: v.string(), rippleEffect: v.string(), rippleValue: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error", message: "Game not found" };
    const roadmap = game.productRoadmap ?? [];
    if (roadmap.filter(i => !i.completedAt).length >= 3) return { status: "error", message: "Roadmap full — max 3 active items" };
    await ctx.db.patch(args.gameId, {
      productRoadmap: [...roadmap, {
        id: `rdmp_${Date.now()}`, title: args.title, description: args.description,
        category: args.category, timeInvestmentRequired: args.timeRequired,
        moneyInvestmentRequired: args.moneyRequired, timeInvested: 0, moneyInvested: 0,
        progressPct: 0, expectedImpact: args.expectedImpact,
        rippleEffect: args.rippleEffect, rippleValue: args.rippleValue,
      }],
    });
    return { status: "ok", message: `"${args.title}" added to roadmap!` };
  },
});

export const investInRoadmapItem = mutation({
  args: { gameId: v.id("games"), itemId: v.string(), hoursThisMonth: v.number(), moneyThisMonth: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error", message: "Game not found" };
    const roadmap = game.productRoadmap ?? [];
    const idx = roadmap.findIndex(i => i.id === args.itemId);
    if (idx === -1) return { status: "error", message: "Item not found" };
    const item = roadmap[idx];
    if (item.completedAt) return { status: "error", message: "Already completed" };
    if (args.hoursThisMonth > 160 - (game.monthlyTimeUsed ?? 0)) return { status: "error", message: "Not enough time" };
    if (game.cash < args.moneyThisMonth) return { status: "error", message: "Insufficient funds" };

    const newTime  = item.timeInvested  + args.hoursThisMonth;
    const newMoney = item.moneyInvested + args.moneyThisMonth;
    const tProg    = item.timeInvestmentRequired  > 0 ? newTime  / item.timeInvestmentRequired  : 1;
    const mProg    = item.moneyInvestmentRequired > 0 ? newMoney / item.moneyInvestmentRequired : 1;
    const prog     = Math.min(100, ((tProg + mProg) / 2) * 100);

    const updatedItem = { ...item, timeInvested: newTime, moneyInvested: newMoney, progressPct: prog };
    const newRipples  = [...(game.pendingBusinessRipples ?? [])];
    let completionMsg = "";

    if (prog >= 100) {
      updatedItem.completedAt = Date.now();
      completionMsg = `🎉 "${item.title}" COMPLETED! ${item.expectedImpact}`;
      let resolvesAtMonth = game.currentMonth + 1;
      let resolvesAtAge   = game.currentAge;
      while (resolvesAtMonth > 12) { resolvesAtMonth -= 12; resolvesAtAge += 1; }
      newRipples.push({ resolvesAtAge, resolvesAtMonth, effectType: item.rippleEffect, value: item.rippleValue, description: `${item.title} shipped → ${item.expectedImpact}` });
    }

    await ctx.db.patch(args.gameId, {
      productRoadmap:        roadmap.map((i, ix) => ix === idx ? updatedItem : i),
      cash:                  game.cash - args.moneyThisMonth,
      monthlyTimeUsed:       (game.monthlyTimeUsed ?? 0) + args.hoursThisMonth,
      pendingBusinessRipples: newRipples,
    });
    return { status: "ok", progressPct: prog, completed: prog >= 100, message: prog >= 100 ? completionMsg : `Progress: ${Math.round(prog)}%` };
  },
});

export const removeRoadmapItem = mutation({
  args: { gameId: v.id("games"), itemId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error", message: "Game not found" };
    await ctx.db.patch(args.gameId, { productRoadmap: (game.productRoadmap ?? []).filter(i => i.id !== args.itemId) });
    return { status: "ok" };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS — Competitor Event Response
// ─────────────────────────────────────────────────────────────────────────────

export const respondToCompetitorEvent = mutation({
  args: { gameId: v.id("games"), responseId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.activeCompetitorEvent) return { status: "error", message: "No active event" };
    if (game.activeCompetitorEvent.responded) return { status: "error", message: "Already responded" };
    const event = game.activeCompetitorEvent;
    const resp  = event.responseOptions.find(r => r.id === args.responseId);
    if (!resp) return { status: "error", message: "Invalid response" };
    if (resp.timeCost > 160 - (game.monthlyTimeUsed ?? 0)) return { status: "error", message: "Not enough time" };
    if (game.cash < resp.moneyCost) return { status: "error", message: "Insufficient funds" };

    const m = game.businessMetrics ? { ...game.businessMetrics } : null;
    const patch: Record<string, any> = {
      cash: game.cash - resp.moneyCost,
      monthlyTimeUsed: (game.monthlyTimeUsed ?? 0) + resp.timeCost,
      activeCompetitorEvent: { ...event, responded: true },
    };
    if (m) {
      const outcomes: Record<string, () => void> = {
        brand_boost:         () => { m.brandReputation = Math.min(100, m.brandReputation + 10); },
        price_reduction:     () => { m.mrr = Math.round(m.mrr * 0.8); },
        churn_risk:          () => { m.churnRate = Math.min(0.3, m.churnRate + 0.05); },
        margin_reduction:    () => { m.grossMarginPct = Math.max(0.1, m.grossMarginPct - 0.1); },
        ltv_boost:           () => { m.ltv = Math.round(m.ltv * 1.2); },
        customer_surge:      () => { m.customerCount = Math.round(m.customerCount * 1.25); m.mrr = Math.round(m.mrr * 1.25); },
        small_customer_gain: () => { m.customerCount = Math.round(m.customerCount * 1.05); },
        copycat_slowed:      () => { m.churnRate = Math.max(0.01, m.churnRate - 0.03); },
        product_lead:        () => { m.brandReputation = Math.min(100, m.brandReputation + 15); m.conversionRate = Math.min(0.5, m.conversionRate + 0.03); },
        volume_play:         () => { m.customerCount = Math.round(m.customerCount * 1.15); },
        enterprise_bet:      () => { m.ltv = Math.round(m.ltv * 1.3); m.cac = Math.round(m.cac * 1.2); },
        revenue_surge:       () => { m.mrr = Math.round(m.mrr * 1.4); },
        retention_bonus:     () => { m.churnRate = Math.max(0.01, m.churnRate - 0.02); },
      };
      (outcomes[resp.outcome] ?? (() => {}))();
      patch.businessMetrics = m;
    }
    await ctx.db.patch(args.gameId, patch);
    return { status: "ok", outcome: resp.outcome };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS — Investor Track
// ─────────────────────────────────────────────────────────────────────────────

export const startInvestorOutreach = mutation({
  args: { gameId: v.id("games"), stage: v.union(v.literal("angel_outreach"), v.literal("seed_outreach")) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error", message: "Game not found" };
    if (game.businessStageLabel !== "scale") return { status: "error", message: "Must reach SCALE stage first" };
    if (args.stage === "seed_outreach" && (game.activeBusiness?.monthlyRevenue ?? 0) < 10000)
      return { status: "error", message: "Need $10k+/mo for seed round" };

    let rm = game.currentMonth + 2, ra = game.currentAge;
    while (rm > 12) { rm -= 12; ra += 1; }

    await ctx.db.patch(args.gameId, {
      investorStage: args.stage,
      pendingBusinessRipples: [...(game.pendingBusinessRipples ?? []), {
        resolvesAtAge: ra, resolvesAtMonth: rm, effectType: "investor_decision",
        value: 0, description: `${args.stage === "angel_outreach" ? "Angel" : "Seed"} round decision pending`,
      }],
      monthlyTimeUsed: (game.monthlyTimeUsed ?? 0) + 10,
    });
    return { status: "ok", message: "Outreach started — decision in ~2 months." };
  },
});

export const closeInvestmentRound = mutation({
  args: { gameId: v.id("games"), amount: v.number(), equityPct: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error", message: "Game not found" };
    const stageMap: Record<string, string> = { angel_outreach: "angel_funded", seed_outreach: "seed_funded", seed_funded: "series_a", series_a: "ipo_prep", ipo_prep: "public" };
    const nextStage = stageMap[game.investorStage ?? ""] ?? (game.investorStage ?? "none");
    const bonus     = Math.round(args.amount * 0.005);
    await ctx.db.patch(args.gameId, {
      cash: game.cash + args.amount,
      equityGiven: (game.equityGiven ?? 0) + args.equityPct,
      totalFundingRaised: (game.totalFundingRaised ?? 0) + args.amount,
      investorStage: nextStage as any,
      monthlyIncome: game.monthlyIncome + bonus,
    });
    return { status: "ok", nextStage, message: `Round closed! +$${args.amount.toLocaleString()}` };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS — Departments
// ─────────────────────────────────────────────────────────────────────────────

export const updateDepartmentBudget = mutation({
  args: { gameId: v.id("games"), deptName: v.string(), newBudget: v.number(), newHeadCount: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game?.departments) return { status: "error", message: "No departments" };
    await ctx.db.patch(args.gameId, {
      departments: game.departments.map(d => d.name !== args.deptName ? d : {
        ...d, budget: args.newBudget, headCount: args.newHeadCount ?? d.headCount,
        efficiency: Math.min(100, d.efficiency + (args.newBudget > d.budget ? 5 : -5)),
      }),
    });
    return { status: "ok" };
  },
});
