import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    // ── Identity ─────────────────────────────────────────
    displayName: v.string(),
    startingPoint: v.union(
      v.literal("high_school"),
      v.literal("college"),
      v.literal("post_college")
    ),
    parentalIncomeTier: v.union(
      v.literal("low"),
      v.literal("middle"),
      v.literal("high")
    ),
    personalityTrait: v.union(
      v.literal("risk_taker"),
      v.literal("balanced"),
      v.literal("conservative")
    ),
    cityTier: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("nonbinary")),

    // ── Progress ──────────────────────────────────────────
    currentAge: v.number(),
    currentMonth: v.number(),
    gameStatus: v.union(v.literal("active"), v.literal("complete")),

    // ── Finances ──────────────────────────────────────────
    cash: v.number(),
    monthlyIncome: v.number(),
    monthlyExpenses: v.number(),
    netWorth: v.number(),
    totalDebt: v.number(),
    studentLoanDebt: v.number(),
    mortgageDebt: v.number(),
    creditCardDebt: v.number(),
    investmentPortfolio: v.number(),
    realEstateValue: v.number(),
    retirementAccount: v.number(),
    lifetimeIncome: v.number(),

    // ── Character ─────────────────────────────────────────
    happiness: v.number(),
    health: v.number(),
    careerLevel: v.union(
      v.literal("none"),
      v.literal("intern"),
      v.literal("junior"),
      v.literal("mid"),
      v.literal("senior"),
      v.literal("manager"),
      v.literal("director"),
      v.literal("executive"),
      v.literal("business_owner")
    ),
    educationLevel: v.union(
      v.literal("none"),
      v.literal("hs_diploma"),
      v.literal("trade"),
      v.literal("associate"),
      v.literal("bachelor"),
      v.literal("master"),
      v.literal("phd"),
      v.literal("md"),
      v.literal("jd")
    ),
    relationshipStatus: v.union(
      v.literal("single"),
      v.literal("dating"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("widowed")
    ),
    dependents: v.number(),
    inCollegeYearsRemaining: v.number(),
    jobTitle: v.string(),
    industry: v.string(),

    // ── Biological attributes (rolled at game start) ──────
    iq: v.number(),               // 60–160, mean 100 stddev 15
    athleticGenetics: v.number(), // 10–95, mean 50 stddev 15
    heightInches: v.number(),     // 58–80, player-overridable

    // ── Health habits (persistent monthly settings) ───────
    exerciseHabit: v.union(
      v.literal("sedentary"),
      v.literal("3x_week"),
      v.literal("gym")
    ),
    dietHabit: v.union(
      v.literal("healthy"),
      v.literal("average"),
      v.literal("fast_food")
    ),
    sleepHabit: v.union(
      v.literal("8hrs"),
      v.literal("6hrs"),
      v.literal("grind_5hrs")
    ),
    stressManagement: v.union(
      v.literal("therapy"),
      v.literal("meditation"),
      v.literal("nothing")
    ),
    preventiveCare: v.boolean(),

    // ── Life expectancy & mortality ───────────────────────
    projectedLifeExpectancy: v.number(),
    isDeceased: v.boolean(),
    ageAtDeath: v.optional(v.number()),
    exerciseStreakMonths: v.number(),
    poorDietNoExerciseMonths: v.number(),
    smokingHistory: v.boolean(),

    // ── Social skills ─────────────────────────────────────
    communicationSkill: v.number(),  // 0–100, starts 20
    fearOfRejection: v.number(),     // 0–100, starts 60 (high = scared)

    // ── Skill stack ───────────────────────────────────────
    publicSpeaking: v.number(),
    sales: v.number(),
    technicalSkill: v.number(),
    financialLiteracy: v.number(),
    leadership: v.number(),
    writing: v.number(),
    negotiation: v.number(),
    networking: v.number(),
    creativity: v.number(),
    emotionalIntelligence: v.number(),
    activeSkillStack: v.optional(v.string()),
    skillStackMultiplier: v.number(),

    // ── Business mini-game ────────────────────────────────
    monthlyTimeUsed: v.optional(v.number()),
    pendingBusinessDecisions: v.optional(v.array(v.object({
      id: v.string(),
      category: v.string(),
      title: v.string(),
      description: v.string(),
      timeCostDIY: v.number(),
      moneyCostDIY: v.number(),
      timeCostHire: v.number(),
      moneyCostHire: v.number(),
      rippleMonths: v.number(),
      rippleEffectType: v.string(),
      rippleValueMin: v.number(),
      rippleValueMax: v.number(),
    }))),
    pendingBusinessRipples: v.optional(v.array(v.object({
      resolvesAtAge: v.number(),
      resolvesAtMonth: v.number(),
      effectType: v.string(),
      value: v.number(),
      description: v.string(),
    }))),
    businessDecisionLog: v.optional(v.array(v.object({
      age: v.number(),
      month: v.number(),
      title: v.string(),
      category: v.string(),
      timeCost: v.number(),
      moneyCost: v.number(),
      usedHire: v.boolean(),
    }))),
    businessEmployees: v.optional(v.array(v.object({
      name: v.string(),
      role: v.string(),
      skillLevel: v.number(),
      reliability: v.number(),
      monthlySalary: v.number(),
      hiredAtAge: v.number(),
    }))),
    pendingHireCandidates: v.optional(v.array(v.object({
      name: v.string(),
      role: v.string(),
      skillLevel: v.number(),
      reliability: v.number(),
      monthlySalary: v.number(),
    }))),

    // ── Business system ───────────────────────────────────
    entrepreneurshipSkill: v.number(),
    marketingSkill: v.number(),
    activeBusiness: v.optional(v.object({
      businessTypeId: v.string(),
      businessTypeName: v.string(),
      stage: v.union(
        v.literal("idea"),
        v.literal("small_test"),
        v.literal("growing"),
        v.literal("established"),
        v.literal("success_breakout"),
        v.literal("failed")
      ),
      monthsActive: v.number(),
      monthlyRevenue: v.number(),
      monthlyExpenses: v.number(),
      totalInvested: v.number(),
      marketingActionsThisMonth: v.number(),
      businessEngine: v.optional(v.union(
        v.literal("ecom"),
        v.literal("service"),
        v.literal("saas")
      )),
    })),
    businessHistory: v.array(v.object({
      businessTypeName: v.string(),
      stage: v.string(),
      monthsActive: v.number(),
      peakRevenue: v.number(),
      outcome: v.string(),
    })),

    // ── Business simulator expansion ─────────────────────
    businessStageLabel: v.optional(v.union(
      v.literal("startup"),
      v.literal("growth"),
      v.literal("scale")
    )),
    businessMetrics: v.optional(v.object({
      mrr: v.number(),
      customerCount: v.number(),
      churnRate: v.number(),
      cac: v.number(),
      ltv: v.number(),
      grossMarginPct: v.number(),
      brandReputation: v.number(),
      leadsPerMonth: v.number(),
      conversionRate: v.number(),
    })),
    productRoadmap: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      category: v.union(v.literal("feature"), v.literal("product"), v.literal("improvement")),
      timeInvestmentRequired: v.number(),
      moneyInvestmentRequired: v.number(),
      timeInvested: v.number(),
      moneyInvested: v.number(),
      progressPct: v.number(),
      expectedImpact: v.string(),
      rippleEffect: v.string(),
      rippleValue: v.number(),
      completedAt: v.optional(v.number()),
    }))),
    activeCompetitorEvent: v.optional(v.object({
      type: v.string(),
      description: v.string(),
      monthsRemaining: v.number(),
      responseOptions: v.array(v.object({
        id: v.string(),
        label: v.string(),
        timeCost: v.number(),
        moneyCost: v.number(),
        outcome: v.string(),
      })),
      responded: v.boolean(),
    })),
    departments: v.optional(v.array(v.object({
      name: v.string(),
      budget: v.number(),
      headCount: v.number(),
      efficiency: v.number(),
    }))),
    investorStage: v.optional(v.union(
      v.literal("none"),
      v.literal("angel_outreach"),
      v.literal("angel_funded"),
      v.literal("seed_outreach"),
      v.literal("seed_funded"),
      v.literal("series_a"),
      v.literal("ipo_prep"),
      v.literal("public")
    )),
    totalFundingRaised: v.optional(v.number()),
    equityGiven: v.optional(v.number()),

    // ── BSG-style levers + channel mix ───────────────────
    salesChannelMix: v.optional(v.object({
      direct: v.number(),
      wholesale: v.number(),
      marketplace: v.number(),
    })),
    businessLevers: v.optional(v.object({
      priceIndexPct: v.number(),        // -30 to +50 vs market rate
      qualityBudgetLevel: v.string(),   // "low"|"medium"|"high"|"premium"
      adSpendMonthly: v.number(),
      productVariety: v.number(),       // 1–5 SKUs / lines
      rdInvestment: v.number(),
    })),

    // ── KPI scorecard + credit ─────────────────────────
    boardConfidence: v.optional(v.number()),
    creditRating: v.optional(v.union(
      v.literal("AAA"), v.literal("AA"), v.literal("A"),
      v.literal("B"),   v.literal("C"),  v.literal("D")
    )),
    prevMonthMRR: v.optional(v.number()),

    // ── AI competitors ─────────────────────────────────
    competitors: v.optional(v.array(v.object({
      name: v.string(),
      strategy: v.string(),
      priceIndex: v.number(),
      qualityLevel: v.number(),
      adSpend: v.number(),
      brandReputation: v.number(),
      marketShare: v.number(),
      monthlyRevenue: v.number(),
      trend: v.string(),              // "up"|"down"|"flat"
    }))),
    competitorIntelLog: v.optional(v.array(v.string())),

    // ── Business mode + full-mode extensions ─────────────
    businessMode: v.optional(v.union(v.literal("simplified"), v.literal("full"))),

    financialHistory: v.optional(v.array(v.object({
      age: v.number(),
      month: v.number(),
      revenue: v.number(),
      revenueByChannel: v.object({ direct: v.number(), wholesale: v.number(), marketplace: v.number() }),
      cogs: v.number(),
      grossProfit: v.number(),
      grossMarginPct: v.number(),
      opExMarketing: v.number(),
      opExPayroll: v.number(),
      opExTools: v.number(),
      netProfit: v.number(),
      netMarginPct: v.number(),
      burnRate: v.number(),
      revenuePerEmployee: v.number(),
      marketingROI: v.number(),
      ltvCacRatio: v.number(),
    }))),

    adChannelAllocations: v.optional(v.array(v.object({
      channelId: v.string(),
      monthlyBudget: v.number(),
    }))),

    // ── Ecom product config ───────────────────────────────
    ecomConfig: v.optional(v.object({
      niche: v.string(),
      products: v.array(v.object({
        id: v.string(),
        name: v.string(),
        listPrice: v.number(),
        unitCost: v.number(),
        channelMix: v.object({
          amazoom: v.number(),
          shopeasy: v.number(),
          other: v.number(),
        }),
      })),
    })),

    // ── Service business config ───────────────────────────
    serviceConfig: v.optional(v.object({
      selectedSubServices: v.array(v.string()),
      clientCount: v.number(),
      avgBillableRate: v.number(),
      utilizationRate: v.number(),
    })),

    // ── Market positioning (premium/wages/quality) ────────
    marketPositioning: v.optional(v.object({
      pricingPremium:   v.number(),    // -20 to +100 (% above/below market rate)
      wagesPremium:     v.number(),    // -20 to +50
      qualityMultiplier: v.number(),   // 0.5 to 3.0 × COGS
      targetSegment:    v.union(
        v.literal("budget"), v.literal("value"), v.literal("market"),
        v.literal("premium"), v.literal("luxury")
      ),
    })),

    // ── Strategy positioning ──────────────────────────────
    strategyPositioning: v.optional(v.object({
      pricePosition:   v.union(v.literal("premium"), v.literal("parity"), v.literal("value")),
      targetMarket:    v.union(v.literal("mass"),    v.literal("niche")),
      qualityPosition: v.union(v.literal("budget"),  v.literal("standard"), v.literal("premium"), v.literal("luxury")),
      growthPriority:  v.union(v.literal("acquire"), v.literal("retain")),
    })),

    // ── Dating / relationship system ──────────────────────
    onlineDatingActive: v.boolean(),
    currentPartner: v.optional(v.object({
      name: v.string(),
      traits: v.array(v.string()),
      career: v.string(),
      monthlyIncome: v.number(),
      attractiveness: v.number(),
      iq: v.number(),
      ambition: v.number(),
      emotionalStability: v.number(),
      financialResponsibility: v.number(),
      compatibilityScore: v.number(),
      monthsTogether: v.number(),
      compatibilityRevealed: v.boolean(),
      status: v.union(v.literal("dating"), v.literal("married")),
    })),
    pendingDateOffer: v.optional(v.object({
      name: v.string(),
      traits: v.array(v.string()),
      career: v.string(),
      monthlyIncome: v.number(),
      attractiveness: v.number(),
      iq: v.number(),
      ambition: v.number(),
      emotionalStability: v.number(),
      financialResponsibility: v.number(),
      compatibilityScore: v.number(),
      location: v.string(),
      source: v.union(v.literal("organic"), v.literal("online")),
      hasBeenTalkedTo: v.boolean(),
    })),
    pendingMatches: v.optional(v.array(v.object({
      name: v.string(),
      traits: v.array(v.string()),
      career: v.string(),
      monthlyIncome: v.number(),
      attractiveness: v.number(),
      iq: v.number(),
      ambition: v.number(),
      emotionalStability: v.number(),
      financialResponsibility: v.number(),
      compatibilityScore: v.number(),
      location: v.string(),
      source: v.union(v.literal("organic"), v.literal("online")),
      hasBeenTalkedTo: v.boolean(),
    }))),
    datingHistory: v.optional(v.array(v.object({
      name: v.string(),
      monthsTogether: v.number(),
      outcome: v.string(),
    }))),

    // ── Recession state ───────────────────────────────────
    recessionActive: v.boolean(),
    recessionMonthsRemaining: v.number(),

    // ── Logs ──────────────────────────────────────────────
    eventLog: v.array(v.object({
      month: v.number(),
      age: v.number(),
      title: v.string(),
      body: v.string(),
      impact: v.string(),
    })),
    decisionsLog: v.array(v.object({
      month: v.number(),
      age: v.number(),
      decision: v.string(),
      outcome: v.string(),
    })),
    happinessHistory: v.array(v.object({
      age: v.number(),
      month: v.number(),
      value: v.number(),
    })),
    healthHistory: v.array(v.object({
      age: v.number(),
      month: v.number(),
      value: v.number(),
    })),

    // ── Active effects ────────────────────────────────────
    activeEffects: v.array(v.object({
      type: v.string(),
      value: v.number(),
      monthsRemaining: v.number(),
    })),

    // ── Spending modifier ─────────────────────────────────
    spendingMultiplier: v.number(),

    // ── Pending event ─────────────────────────────────────
    pendingEventId: v.optional(v.string()),
    pendingEventData: v.optional(v.object({
      templateId: v.string(),
      title: v.string(),
      body: v.string(),
      impactType: v.string(),
      hasChoice: v.boolean(),
      choiceAcceptOutcome: v.string(),
      choiceDeclineOutcome: v.string(),
    })),

    // ── Milestone flags ───────────────────────────────────
    milestone30Done: v.boolean(),
    milestone50Done: v.boolean(),
    milestoneNarrative30: v.optional(v.string()),
    milestoneNarrative50: v.optional(v.string()),
    milestoneNarrative75: v.optional(v.string()),

    // ── End game ──────────────────────────────────────────
    finalScore: v.optional(v.number()),
    finalGrade: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }),

  leaderboard: defineTable({
    gameId: v.string(),
    displayName: v.string(),
    startingPoint: v.string(),
    parentalIncomeTier: v.string(),
    finalScore: v.number(),
    netWorth: v.number(),
    lifetimeIncome: v.number(),
    happinessQuotient: v.number(),
    healthAtEnd: v.number(),
    grade: v.string(),
    completedAt: v.number(),
  }),

  eventTemplates: defineTable({
    category: v.union(
      v.literal("career"),
      v.literal("health"),
      v.literal("market"),
      v.literal("family"),
      v.literal("wildcard"),
      v.literal("opportunity")
    ),
    weight: v.number(),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    titleTemplate: v.string(),
    bodyTemplate: v.string(),
    impactType: v.string(),
    hasChoice: v.boolean(),
    choiceAcceptOutcome: v.string(),
    choiceDeclineOutcome: v.string(),
    cashDelta: v.optional(v.number()),
    cashDeltaMin: v.optional(v.number()),
    cashDeltaMax: v.optional(v.number()),
    incomeDelta: v.optional(v.number()),
    expenseDelta: v.optional(v.number()),
    happinessDelta: v.optional(v.number()),
    healthDelta: v.optional(v.number()),
    debtDelta: v.optional(v.number()),
    investmentMultiplier: v.optional(v.number()),
  }),

  businessTypes: defineTable({
    name: v.string(),
    category: v.string(),
    scaleRating: v.number(),
    overhead: v.string(),
    marketingDependency: v.number(),
    startupCostMin: v.number(),
    startupCostMax: v.number(),
    description: v.string(),
    degreeBonuses: v.any(),
  }),

  careers: defineTable({
    title: v.string(),
    requiredDegree: v.string(),
    startingSalary: v.number(),
    median10yrSalary: v.number(),
    top10pctSalary: v.number(),
    progressionPath: v.array(v.string()),
    jobSecurityRating: v.number(),
    industry: v.string(),
  }),

  colleges: defineTable({
    name: v.string(),
    state: v.string(),
    type: v.string(),
    avgAnnualCost: v.number(),
    acceptanceRate: v.number(),
  }),
});
