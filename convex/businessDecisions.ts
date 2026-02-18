import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════
// DECISION TEMPLATES (25 cards across 5 categories)
// ═══════════════════════════════════════════════════
export const DECISION_TEMPLATES = [
  // MARKETING (8 cards)
  { id:'mkt_01', category:'MARKETING', title:'Run Paid Ads Test', description:'Test a small paid campaign across social media.',
    timeDIY:8, moneyDIY:300, timeHire:2, moneyHire:600, rippleMonths:1, rippleType:'revenue_boost', min:100, max:800 },
  { id:'mkt_02', category:'MARKETING', title:'Long-Form SEO Content', description:'Write deep content to rank in search over time.',
    timeDIY:20, moneyDIY:0, timeHire:5, moneyHire:500, rippleMonths:5, rippleType:'monthly_revenue_add', min:50, max:400 },
  { id:'mkt_03', category:'MARKETING', title:'Email Campaign', description:'Send a value-packed email to your list.',
    timeDIY:10, moneyDIY:50, timeHire:3, moneyHire:300, rippleMonths:1, rippleType:'revenue_boost', min:200, max:900 },
  { id:'mkt_04', category:'MARKETING', title:'Build a Partnership', description:'Reach out to a complementary business for a collab.',
    timeDIY:15, moneyDIY:0, timeHire:0, moneyHire:0, rippleMonths:3, rippleType:'monthly_revenue_add', min:100, max:600 },
  { id:'mkt_05', category:'MARKETING', title:'Launch on New Platform', description:'Expand to a new social or marketplace channel.',
    timeDIY:25, moneyDIY:100, timeHire:8, moneyHire:600, rippleMonths:2, rippleType:'monthly_revenue_add', min:50, max:500 },
  { id:'mkt_06', category:'MARKETING', title:'Referral Program', description:'Create an incentive for customers to refer others.',
    timeDIY:12, moneyDIY:200, timeHire:4, moneyHire:500, rippleMonths:2, rippleType:'monthly_revenue_add', min:100, max:700 },
  { id:'mkt_07', category:'MARKETING', title:'Case Study / Testimonial', description:'Document a customer success story to build trust.',
    timeDIY:8, moneyDIY:0, timeHire:3, moneyHire:400, rippleMonths:2, rippleType:'conversion_boost', min:5, max:20 },
  { id:'mkt_08', category:'MARKETING', title:'Influencer Outreach', description:'Partner with a micro-influencer in your niche.',
    timeDIY:10, moneyDIY:500, timeHire:3, moneyHire:800, rippleMonths:1, rippleType:'revenue_boost', min:0, max:2000 },

  // PRODUCT (5 cards)
  { id:'prod_01', category:'PRODUCT', title:'Improve Core Offering', description:'Polish and improve the main product or service.',
    timeDIY:30, moneyDIY:0, timeHire:10, moneyHire:800, rippleMonths:2, rippleType:'churn_reduction', min:5, max:15 },
  { id:'prod_02', category:'PRODUCT', title:'Add a New Feature', description:'Ship something new customers have been asking for.',
    timeDIY:40, moneyDIY:0, timeHire:10, moneyHire:2500, rippleMonths:3, rippleType:'monthly_revenue_add', min:100, max:800 },
  { id:'prod_03', category:'PRODUCT', title:'Fix Top Complaint', description:'Address the #1 thing customers complain about.',
    timeDIY:15, moneyDIY:0, timeHire:4, moneyHire:600, rippleMonths:1, rippleType:'churn_reduction', min:10, max:25 },
  { id:'prod_04', category:'PRODUCT', title:'Customer Interviews', description:'Talk to 5 customers to find product gaps.',
    timeDIY:10, moneyDIY:50, timeHire:0, moneyHire:0, rippleMonths:1, rippleType:'insight_unlock', min:0, max:0 },
  { id:'prod_05', category:'PRODUCT', title:'Launch Premium Tier', description:'Create a higher-priced version with more value.',
    timeDIY:20, moneyDIY:0, timeHire:6, moneyHire:1500, rippleMonths:2, rippleType:'monthly_revenue_add', min:200, max:1200 },

  // OPERATIONS (4 cards)
  { id:'ops_01', category:'OPERATIONS', title:'Systemize a Process', description:'Document and automate a core repeating workflow.',
    timeDIY:25, moneyDIY:50, timeHire:5, moneyHire:800, rippleMonths:1, rippleType:'time_saved', min:10, max:20 },
  { id:'ops_02', category:'OPERATIONS', title:'Switch to Better Tools', description:'Upgrade to more efficient software/services.',
    timeDIY:10, moneyDIY:150, timeHire:2, moneyHire:300, rippleMonths:1, rippleType:'time_saved', min:5, max:15 },
  { id:'ops_03', category:'OPERATIONS', title:'Set Up Automations', description:'Automate emails, invoicing, or fulfillment.',
    timeDIY:20, moneyDIY:100, timeHire:4, moneyHire:1500, rippleMonths:2, rippleType:'time_saved', min:15, max:25 },
  { id:'ops_04', category:'OPERATIONS', title:'Legal & Compliance Check', description:'Review contracts, LLC, and tax setup.',
    timeDIY:8, moneyDIY:500, timeHire:2, moneyHire:1500, rippleMonths:1, rippleType:'risk_reduction', min:0, max:0 },

  // SALES (4 cards)
  { id:'sales_01', category:'SALES', title:'Cold Outreach Campaign', description:'Contact 50 potential customers directly.',
    timeDIY:20, moneyDIY:0, timeHire:5, moneyHire:500, rippleMonths:1, rippleType:'lead_gen', min:1, max:6 },
  { id:'sales_02', category:'SALES', title:'Build a Sales Funnel', description:'Create an automated path from lead to customer.',
    timeDIY:30, moneyDIY:200, timeHire:8, moneyHire:2000, rippleMonths:3, rippleType:'monthly_revenue_add', min:200, max:1500 },
  { id:'sales_03', category:'SALES', title:'Follow Up with Leads', description:'Reach back out to past inquiries and warm leads.',
    timeDIY:8, moneyDIY:0, timeHire:3, moneyHire:400, rippleMonths:1, rippleType:'revenue_boost', min:100, max:1200 },
  { id:'sales_04', category:'SALES', title:'Raise Your Prices', description:'Increase pricing 15-30%. Some churn, more margin.',
    timeDIY:2, moneyDIY:0, timeHire:0, moneyHire:0, rippleMonths:1, rippleType:'price_increase', min:15, max:30 },

  // FINANCIAL (4 cards)
  { id:'fin_01', category:'FINANCIAL', title:'Reinvest Profits into Ads', description:"Double down on what's working with cash.",
    timeDIY:4, moneyDIY:0, timeHire:0, moneyHire:0, rippleMonths:2, rippleType:'revenue_multiplier', min:120, max:180 },
  { id:'fin_02', category:'FINANCIAL', title:'Apply for Business Credit', description:'Get a business credit card or line of credit.',
    timeDIY:6, moneyDIY:0, timeHire:0, moneyHire:0, rippleMonths:1, rippleType:'credit_unlock', min:5000, max:25000 },
  { id:'fin_03', category:'FINANCIAL', title:'Offer Payment Plans', description:'Allow customers to pay in installments.',
    timeDIY:5, moneyDIY:0, timeHire:0, moneyHire:0, rippleMonths:1, rippleType:'monthly_revenue_add', min:100, max:500 },
  { id:'fin_04', category:'FINANCIAL', title:'Cut Unnecessary Costs', description:"Audit expenses and cancel what isn't working.",
    timeDIY:6, moneyDIY:0, timeHire:0, moneyHire:0, rippleMonths:1, rippleType:'expense_reduction', min:100, max:800 },
];

// ═══════════════════════════════════════════════════
// MAKE BUSINESS DECISION
// ═══════════════════════════════════════════════════
export const makeBusinessDecision = mutation({
  args: {
    gameId: v.id("games"),
    decisionId: v.string(),
    usedHire: v.boolean(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error", message: "Game not found" };

    const pending = game.pendingBusinessDecisions ?? [];
    const decision = pending.find(d => d.id === args.decisionId);
    if (!decision) return { status: "error", message: "Decision not found" };

    // Determine costs
    const timeCost  = args.usedHire ? decision.timeCostHire  : decision.timeCostDIY;
    const moneyCost = args.usedHire ? decision.moneyCostHire : decision.moneyCostDIY;

    // Check time budget (160 hrs/month)
    const currentTimeUsed = game.monthlyTimeUsed ?? 0;
    if (currentTimeUsed + timeCost > 160) {
      return { status: "error", message: "Not enough time this month" };
    }

    // Check cash
    if (game.cash < moneyCost) {
      return { status: "error", message: "Insufficient funds" };
    }

    // Calculate ripple resolve date
    const { resolvesAtAge, resolvesAtMonth } = calcRippleDate(
      game.currentAge, game.currentMonth, decision.rippleMonths
    );

    // Roll ripple value
    const rippleValue = Math.round(
      Math.random() * (decision.rippleValueMax - decision.rippleValueMin) + decision.rippleValueMin
    );

    // Build ripple description
    const rippleDesc = buildRippleDescription(decision.rippleEffectType, rippleValue, decision.title);

    // New ripple entry
    const newRipple = {
      resolvesAtAge,
      resolvesAtMonth,
      effectType: decision.rippleEffectType,
      value: rippleValue,
      description: rippleDesc,
    };

    // Decision log entry
    const logEntry = {
      age: game.currentAge,
      month: game.currentMonth,
      title: decision.title,
      category: decision.category,
      timeCost,
      moneyCost,
      usedHire: args.usedHire,
    };

    // Remove this decision from pending
    const updatedPending = pending.filter(d => d.id !== args.decisionId);

    await ctx.db.patch(args.gameId, {
      cash: game.cash - moneyCost,
      monthlyTimeUsed: currentTimeUsed + timeCost,
      pendingBusinessRipples: [...(game.pendingBusinessRipples ?? []), newRipple],
      businessDecisionLog: [...(game.businessDecisionLog ?? []), logEntry].slice(-50),
      pendingBusinessDecisions: updatedPending,
    });

    return { status: "ok", rippleDescription: rippleDesc };
  },
});

// ═══════════════════════════════════════════════════
// HIRE EMPLOYEE
// ═══════════════════════════════════════════════════
export const hireEmployee = mutation({
  args: {
    gameId: v.id("games"),
    candidateIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error", message: "Game not found" };

    const candidates = game.pendingHireCandidates ?? [];
    const candidate  = candidates[args.candidateIndex];
    if (!candidate) return { status: "error", message: "Invalid candidate" };

    // Check cash for first month's salary
    if (game.cash < candidate.monthlySalary) {
      return { status: "error", message: "Not enough cash for first month's salary" };
    }

    const newEmployee = {
      name:          candidate.name,
      role:          candidate.role,
      skillLevel:    candidate.skillLevel,
      reliability:   candidate.reliability,
      monthlySalary: candidate.monthlySalary,
      hiredAtAge:    game.currentAge,
    };

    // Remove candidate from list
    const updatedCandidates = candidates.filter((_, i) => i !== args.candidateIndex);

    await ctx.db.patch(args.gameId, {
      businessEmployees:    [...(game.businessEmployees ?? []), newEmployee],
      monthlyExpenses:      game.monthlyExpenses + candidate.monthlySalary,
      pendingHireCandidates: updatedCandidates,
    });

    return { status: "ok", message: `${candidate.name} hired as ${candidate.role}! +$${candidate.monthlySalary}/mo expense.` };
  },
});

// ═══════════════════════════════════════════════════
// FIRE EMPLOYEE
// ═══════════════════════════════════════════════════
export const fireEmployee = mutation({
  args: {
    gameId: v.id("games"),
    employeeIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error", message: "Game not found" };

    const employees = game.businessEmployees ?? [];
    const employee  = employees[args.employeeIndex];
    if (!employee) return { status: "error", message: "Employee not found" };

    // One month severance
    const severance = employee.monthlySalary;
    const updatedEmployees = employees.filter((_, i) => i !== args.employeeIndex);

    await ctx.db.patch(args.gameId, {
      businessEmployees: updatedEmployees,
      monthlyExpenses:   Math.max(0, game.monthlyExpenses - employee.monthlySalary),
      cash:              Math.max(0, game.cash - severance),
      happiness:         Math.max(0, (game.happiness ?? 50) - 5),
    });

    return { status: "ok", message: `${employee.name} let go. Severance: $${severance.toLocaleString()}` };
  },
});

// ═══════════════════════════════════════════════════
// GET BUSINESS DECISIONS (query)
// ═══════════════════════════════════════════════════
export const getBusinessDecisions = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;
    return {
      pendingBusinessDecisions: game.pendingBusinessDecisions ?? [],
      pendingHireCandidates:    game.pendingHireCandidates   ?? [],
      businessEmployees:        game.businessEmployees        ?? [],
      pendingBusinessRipples:   game.pendingBusinessRipples   ?? [],
      businessDecisionLog:      game.businessDecisionLog      ?? [],
      monthlyTimeUsed:          game.monthlyTimeUsed          ?? 0,
    };
  },
});

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

/** Calculate the age + month when a ripple resolves. */
function calcRippleDate(currentAge: number, currentMonth: number, rippleMonths: number) {
  let resolvesAtMonth = currentMonth + rippleMonths;
  let resolvesAtAge   = currentAge;
  while (resolvesAtMonth > 12) {
    resolvesAtMonth -= 12;
    resolvesAtAge   += 1;
  }
  return { resolvesAtAge, resolvesAtMonth };
}

/** Human-readable description for a ripple. */
function buildRippleDescription(effectType: string, value: number, decisionTitle: string): string {
  switch (effectType) {
    case 'revenue_boost':        return `${decisionTitle} → one-time +$${value.toLocaleString()} cash`;
    case 'monthly_revenue_add':  return `${decisionTitle} → +$${value.toLocaleString()}/mo revenue`;
    case 'expense_reduction':    return `${decisionTitle} → -$${value.toLocaleString()}/mo expenses`;
    case 'price_increase':       return `${decisionTitle} → +${value}% monthly income`;
    case 'churn_reduction':      return `${decisionTitle} → reduced churn (revenue stabilized)`;
    case 'time_saved':           return `${decisionTitle} → ${value}hrs/mo time saved`;
    case 'conversion_boost':     return `${decisionTitle} → +${value}% conversion rate`;
    case 'lead_gen':             return `${decisionTitle} → ${value} new leads generated`;
    case 'insight_unlock':       return `${decisionTitle} → strategic insight gained`;
    case 'risk_reduction':       return `${decisionTitle} → legal risk reduced`;
    case 'revenue_multiplier':   return `${decisionTitle} → ${value}% revenue multiplier applied`;
    case 'credit_unlock':        return `${decisionTitle} → $${value.toLocaleString()} credit line unlocked`;
    default:                     return `${decisionTitle} → effect resolved`;
  }
}
