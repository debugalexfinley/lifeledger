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
    })),
    businessHistory: v.array(v.object({
      businessTypeName: v.string(),
      stage: v.string(),
      monthsActive: v.number(),
      peakRevenue: v.number(),
      outcome: v.string(),
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
