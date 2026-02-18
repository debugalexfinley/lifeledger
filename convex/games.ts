import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { DECISION_TEMPLATES } from "./businessDecisions";
import {
  updateBusinessStageSync, runCustomerSimulationSync, applyLeversToMetricsSync,
  runCompetitorSimulationSync, calcKPIsSync, generateFinancialReport,
  runEcomEngineSync, runServiceEngineSync, determineEngine,
  applyMarketPositioningSync, wagesPremiumCandidateEffect,
} from "./businessSimulator";

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

/** Box-Muller normal distribution clamped to [min, max]. */
function normalRandom(mean: number, stddev: number, min: number, max: number): number {
  const u1 = Math.random() || 1e-10; // avoid log(0)
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.min(max, Math.max(min, mean + z * stddev));
}

/** Roll a starting skill value between 5 and 15. */
function rollSkill(): number {
  return Math.round(5 + Math.random() * 10);
}

/** Build a random dating partner object. */
function generatePartner() {
  const names = ["Alex", "Jordan", "Morgan", "Casey", "Riley", "Avery", "Quinn",
                 "Drew", "Sage", "River", "Blake", "Reese", "Taylor", "Skyler", "Jamie"];
  const traitPool = ["creative", "ambitious", "adventurous", "empathetic", "analytical",
    "spontaneous", "loyal", "independent", "optimistic", "conflict-avoidant",
    "competitive", "nurturing", "introverted", "charismatic", "frugal", "generous"];
  const careers = ["Teacher", "Nurse", "Software Engineer", "Accountant", "Designer",
    "Sales Manager", "Lawyer", "Realtor", "Chef", "Firefighter",
    "Marketing Manager", "Physical Therapist", "Graphic Designer", "Financial Analyst"];

  const t1 = traitPool[Math.floor(Math.random() * traitPool.length)];
  let t2 = traitPool[Math.floor(Math.random() * traitPool.length)];
  while (t2 === t1) t2 = traitPool[Math.floor(Math.random() * traitPool.length)];

  return {
    name: names[Math.floor(Math.random() * names.length)],
    attractiveness: Math.round(normalRandom(5, 2, 1, 10)),
    iq: Math.round(normalRandom(100, 15, 60, 140)),
    ambition: Math.round(Math.random() * 9) + 1,
    emotionalStability: Math.round(Math.random() * 9) + 1,
    financialResponsibility: Math.round(Math.random() * 9) + 1,
    compatibilityScore: Math.round(Math.random() * 100),
    traits: [t1, t2],
    career: careers[Math.floor(Math.random() * careers.length)],
    monthlyIncome: Math.round(normalRandom(4500, 2000, 1500, 15000)),
    monthsTogetherBeforeReveal: 3,
    monthsTogether: 0,
    location: "online",
    source: "online" as "online" | "organic",
    hasBeenTalkedTo: false,
  };
}

/** Calculate skill-stack multiplier (Scott Adams model). Returns { multiplier, stackName }. */
function calcSkillStack(skills: number[]): { multiplier: number; stackName: string | undefined } {
  const above60 = skills.filter(s => s >= 60).length;
  const above50 = skills.filter(s => s >= 50).length;

  let multiplier = 1.0;
  if (above60 >= 7) multiplier = 2.0;       // Polymath
  else if (above60 >= 5) multiplier = 1.70;
  else if (above60 >= 4) multiplier = 1.45;
  else if (above60 >= 3) multiplier = 1.25;
  else if (above60 >= 2) multiplier = 1.10;

  // Named stacks checked in priority order
  // Using indices: 0=comm, 1=publicSpeaking, 2=sales, 3=tech, 4=finLit,
  //                5=leadership, 6=writing, 7=negotiation, 8=networking,
  //                9=creativity, 10=emotional, 11=marketing, 12=entrepreneurship
  let stackName: string | undefined;
  if (above60 >= 7) {
    stackName = "The Polymath";
  } else if (above50 >= 5 && !stackName) {
    stackName = "Renaissance Person";
  }
  return { multiplier, stackName };
}

function calcNamedStack(
  comm: number, pubSpeak: number, sales: number, tech: number,
  lead: number, writing: number, neg: number, networking: number,
  mkt: number, ent: number, emo: number, above60: number, above50: number
): string | undefined {
  if (above60 >= 7) return "The Polymath";
  if (tech >= 70 && ent >= 70 && mkt >= 60) return "Startup Founder";
  if (lead >= 70 && comm >= 70 && networking >= 60) return "Corporate Climber";
  if (writing >= 70 && mkt >= 70 && comm >= 60) return "Media Machine";
  if (sales >= 70 && neg >= 70 && comm >= 60) return "Deal Closer";
  if (above50 >= 5) return "Renaissance Person";
  return undefined;
}

// ═══════════════════════════════════════════════════
// INIT GAME
// ═══════════════════════════════════════════════════
export const initGame = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const { startingPoint, parentalIncomeTier, cityTier, gender } = args;
    const cityMultiplier = { low: 0.8, medium: 1.0, high: 1.5 }[cityTier];

    let cash = 0, monthlyIncome = 0, monthlyExpenses = 0, studentLoanDebt = 0;
    let careerLevel = "none", educationLevel = "none", jobTitle = "", industry = "";
    let currentAge = 0, health = 85, happiness = 70, inCollegeYearsRemaining = 0;

    if (startingPoint === "high_school") {
      currentAge = 16; cash = 500; monthlyIncome = 0;
      monthlyExpenses = Math.round(200 * cityMultiplier);
      educationLevel = "none"; careerLevel = "none"; happiness = 75; health = 90;
    } else if (startingPoint === "college") {
      currentAge = 18;
      cash = { low: 2000, middle: 8000, high: 20000 }[parentalIncomeTier];
      monthlyIncome = 500;
      monthlyExpenses = Math.round(1200 * cityMultiplier);
      educationLevel = "none"; careerLevel = "intern";
      jobTitle = "Part-time Worker"; industry = "Retail";
      inCollegeYearsRemaining = 4;
      if (parentalIncomeTier === "low") studentLoanDebt = 20000;
      else if (parentalIncomeTier === "middle") studentLoanDebt = 10000;
      happiness = 72; health = 88;
    } else {
      currentAge = 22;
      cash = { low: 1000, middle: 3000, high: 5000 }[parentalIncomeTier];
      monthlyIncome = Math.round(3500 * cityMultiplier);
      monthlyExpenses = Math.round(2000 * cityMultiplier);
      educationLevel = "bachelor"; careerLevel = "junior";
      jobTitle = "Junior Associate"; industry = "Technology";
      if (parentalIncomeTier === "low") studentLoanDebt = 45000;
      else if (parentalIncomeTier === "middle") studentLoanDebt = 25000;
      else studentLoanDebt = 5000;
      happiness = 68; health = 85;
    }

    // Entrepreneurship skill
    let entrepreneurshipSkill = 10;
    if (args.personalityTrait === "risk_taker") entrepreneurshipSkill += 10;
    if (startingPoint === "post_college") entrepreneurshipSkill -= 5;

    // ── Roll biological attributes ────────────────────
    const iq = Math.round(normalRandom(100, 15, 60, 160));
    const athleticGenetics = Math.round(normalRandom(50, 15, 10, 95));
    // Height varies by gender
    const heightMean = gender === "female" ? 64 : gender === "nonbinary" ? 66.5 : 69;
    const heightStd  = gender === "female" ? 2.5 : 3;
    const heightInches = Math.round(normalRandom(heightMean, heightStd, 58, 84));

    // ── Starting skills ───────────────────────────────
    // All 5-15, except technicalSkill gets IQ bonus
    const techBase = Math.round((iq - 100) / 10); // IQ premium
    const communicationSkill    = rollSkill();
    const publicSpeaking        = rollSkill();
    const sales                 = rollSkill();
    const technicalSkill        = Math.min(100, rollSkill() + Math.max(0, techBase));
    const financialLiteracy     = rollSkill();
    const leadership            = rollSkill();
    const writing               = rollSkill();
    const negotiation           = rollSkill();
    const networking            = rollSkill();
    const creativity            = rollSkill();
    const emotionalIntelligence = rollSkill();

    const gameId = await ctx.db.insert("games", {
      displayName: args.displayName,
      startingPoint: args.startingPoint,
      parentalIncomeTier: args.parentalIncomeTier,
      personalityTrait: args.personalityTrait,
      cityTier: args.cityTier,
      gender,
      currentAge,
      currentMonth: 1,
      gameStatus: "active",
      cash,
      monthlyIncome,
      monthlyExpenses,
      netWorth: cash - studentLoanDebt,
      totalDebt: studentLoanDebt,
      studentLoanDebt,
      mortgageDebt: 0,
      creditCardDebt: 0,
      investmentPortfolio: 0,
      realEstateValue: 0,
      retirementAccount: 0,
      lifetimeIncome: 0,
      happiness,
      health,
      // Biological
      iq,
      athleticGenetics,
      heightInches,
      // Health habits
      exerciseHabit: "sedentary",
      dietHabit: "average",
      sleepHabit: "6hrs",
      stressManagement: "nothing",
      preventiveCare: true,
      exerciseStreakMonths: 0,
      poorDietNoExerciseMonths: 0,
      smokingHistory: false,
      // Life expectancy
      projectedLifeExpectancy: 78,
      isDeceased: false,
      // Social / Skills
      communicationSkill,
      fearOfRejection: 60,
      publicSpeaking,
      sales,
      technicalSkill,
      financialLiteracy,
      leadership,
      writing,
      negotiation,
      networking,
      creativity,
      emotionalIntelligence,
      skillStackMultiplier: 1.0,
      // Dating
      onlineDatingActive: false,
      // Career / Business
      careerLevel: careerLevel as any,
      educationLevel: educationLevel as any,
      relationshipStatus: "single",
      dependents: 0,
      inCollegeYearsRemaining,
      jobTitle,
      industry,
      entrepreneurshipSkill: Math.max(0, entrepreneurshipSkill),
      marketingSkill: 0,
      businessHistory: [],
      recessionActive: false,
      recessionMonthsRemaining: 0,
      eventLog: [],
      decisionsLog: [],
      happinessHistory: [{ age: currentAge, month: 1, value: happiness }],
      healthHistory: [{ age: currentAge, month: 1, value: health }],
      activeEffects: [],
      spendingMultiplier: 1.0,
      milestone30Done: false,
      milestone50Done: false,
      createdAt: Date.now(),
    });

    return gameId;
  },
});

// ═══════════════════════════════════════════════════
// GET GAME
// ═══════════════════════════════════════════════════
export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

// ═══════════════════════════════════════════════════
// END MONTH — Main simulation tick
// ═══════════════════════════════════════════════════
export const endMonth = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.gameStatus !== "active") return { status: "error" };

    let {
      cash, monthlyIncome, monthlyExpenses, studentLoanDebt, creditCardDebt,
      mortgageDebt, investmentPortfolio, realEstateValue, retirementAccount,
      lifetimeIncome, happiness, health, currentAge, currentMonth, activeEffects,
      spendingMultiplier, happinessHistory, healthHistory,
    } = game;

    // 0. Apply active effects
    const remainingEffects: typeof activeEffects = [];
    for (const effect of activeEffects) {
      if (effect.type === "income_boost")   monthlyIncome   += effect.value;
      if (effect.type === "expense_boost")  monthlyExpenses += effect.value;
      if (effect.type === "happiness_drain") happiness      += effect.value;
      if (effect.type === "health_drain")   health          += effect.value;
      const newMonths = effect.monthsRemaining - 1;
      if (newMonths > 0) remainingEffects.push({ ...effect, monthsRemaining: newMonths });
    }

    // 1. Health habits — soft monthly costs + health/happiness deltas
    let habitHealthDelta  = 0;
    let habitHappinessDelta = 0;
    let habitMonthlyCost  = 0;

    switch (game.exerciseHabit) {
      case "gym":      habitHealthDelta += 0.3; habitMonthlyCost += 80;  break;
      case "3x_week": habitHealthDelta += 0.1;                           break;
      case "sedentary": habitHealthDelta -= 0.2;                           break;
    }
    switch (game.dietHabit) {
      case "healthy":  habitHealthDelta += 0.2; habitMonthlyCost += 80;  break;
      case "fast_food":     habitHealthDelta -= 0.3;                           break;
    }
    switch (game.sleepHabit) {
      case "8hrs": habitHealthDelta += 0.1; habitHappinessDelta += 0.5;  break;
      case "grind_5hrs": habitHealthDelta -= 0.3; habitHappinessDelta -= 1.0;  break;
    }
    switch (game.stressManagement) {
      case "therapy":    habitHappinessDelta += 2; habitMonthlyCost += 200; break;
      case "meditation": habitHappinessDelta += 1;                           break;
    }

    health    = Math.min(100, Math.max(0, health + habitHealthDelta));
    happiness = Math.min(100, Math.max(0, happiness + habitHappinessDelta));

    // 2. Skill-stack multiplier — recalculate every month
    const skillArr = [
      game.communicationSkill ?? 10, game.publicSpeaking ?? 10,
      game.sales ?? 10,              game.technicalSkill ?? 10,
      game.financialLiteracy ?? 10,  game.leadership ?? 10,
      game.writing ?? 10,            game.negotiation ?? 10,
      game.networking ?? 10,         game.creativity ?? 10,
      game.emotionalIntelligence ?? 10,
      game.marketingSkill,
    ];
    const above60 = skillArr.filter(s => s >= 60).length;
    const above50 = skillArr.filter(s => s >= 50).length;

    let stackMultiplier = 1.0;
    if (above60 >= 7)      stackMultiplier = 2.0;
    else if (above60 >= 5) stackMultiplier = 1.70;
    else if (above60 >= 4) stackMultiplier = 1.45;
    else if (above60 >= 3) stackMultiplier = 1.25;
    else if (above60 >= 2) stackMultiplier = 1.10;

    // Determine named stack
    const newActiveStack = calcNamedStack(
      game.communicationSkill ?? 10, game.publicSpeaking ?? 10,
      game.sales ?? 10, game.technicalSkill ?? 10, game.leadership ?? 10,
      game.writing ?? 10, game.negotiation ?? 10, game.networking ?? 10,
      game.marketingSkill, game.entrepreneurshipSkill,
      game.emotionalIntelligence ?? 10, above60, above50
    );

    // Detect newly unlocked stack for achievement notification
    const newlyUnlockedStack = newActiveStack && newActiveStack !== game.activeSkillStack
      ? newActiveStack : undefined;

    // 3. Calculate effective income (with stack) + business revenue
    let effectiveIncome = Math.round(monthlyIncome * stackMultiplier);

    // Add business revenue to effective income
    if (game.activeBusiness && game.activeBusiness.monthlyRevenue > 0) {
      let bizNet = game.activeBusiness.monthlyRevenue - game.activeBusiness.monthlyExpenses;
      // Named stack bonuses for business
      if (newActiveStack === "Startup Founder") bizNet = Math.round(bizNet * 1.25);
      if (newActiveStack === "Media Machine") {
        const contentBiz = ["Newsletter", "YouTube Channel", "Online Course"];
        if (contentBiz.some(n => game.activeBusiness!.businessTypeName.includes(n))) {
          bizNet = Math.round(bizNet * 1.30);
        }
      }
      if (bizNet > 0) effectiveIncome += bizNet;
    }

    // "Deal Closer" stack gives +15% all income
    if (newActiveStack === "Deal Closer") effectiveIncome = Math.round(effectiveIncome * 1.15);
    // "Corporate Climber" stack gives +20% career income
    if (newActiveStack === "Corporate Climber") effectiveIncome = Math.round(effectiveIncome * 1.20);

    // 4. Apply income - expenses - habit costs
    const effectiveExpenses = Math.round(monthlyExpenses * spendingMultiplier);
    cash += effectiveIncome - effectiveExpenses - habitMonthlyCost;

    // 5. Investment returns
    if (investmentPortfolio > 0) {
      const variance = (Math.random() * 6 - 3) / 100;
      investmentPortfolio = Math.round(investmentPortfolio * (1 + 0.008 + variance));
    }
    if (realEstateValue  > 0) realEstateValue  = Math.round(realEstateValue  * 1.003);
    if (retirementAccount > 0) retirementAccount = Math.round(retirementAccount * 1.007);

    // 6. Lifetime income
    lifetimeIncome += monthlyIncome;

    // 7. Debt interest
    if (studentLoanDebt > 0) studentLoanDebt  = Math.round(studentLoanDebt  * 1.005);
    if (creditCardDebt  > 0) creditCardDebt   = Math.round(creditCardDebt   * 1.018);
    if (mortgageDebt    > 0) mortgageDebt     = Math.round(mortgageDebt     * 1.004);

    // 8. Age-based health decay
    if (currentAge > 40) health = Math.max(0, health - 0.05);

    // 9. Financial-stress happiness
    if (monthlyIncome > 0 && cash < 2 * effectiveExpenses) {
      happiness = Math.max(0, happiness - 2);
    }
    const totalDebt = studentLoanDebt + creditCardDebt + mortgageDebt;
    if (monthlyIncome > 0 && totalDebt > 5 * monthlyIncome * 12) {
      happiness = Math.max(0, happiness - 3);
    }

    // 10. Advance relationship
    let updatedPartner = game.currentPartner;
    if (updatedPartner) {
      updatedPartner = { ...updatedPartner, monthsTogether: updatedPartner.monthsTogether + 1 };
      // Long-term relationship happiness bonus
      if (updatedPartner.monthsTogether % 12 === 0) {
        happiness = Math.min(100, happiness + 2);
      }
    }

    // 11. Recalculate projected life expectancy
    let lifeExpectancy = 78;
    lifeExpectancy += (health - 75) * 0.1;
    if (game.exerciseHabit === "gym") lifeExpectancy += 3;
    else if (game.exerciseHabit === "3x_week") lifeExpectancy += 1;
    else lifeExpectancy -= 1;
    if (game.dietHabit === "healthy") lifeExpectancy += 2;
    else if (game.dietHabit === "fast_food") lifeExpectancy -= 3;
    if (game.sleepHabit === "8hrs") lifeExpectancy += 1;
    else if (game.sleepHabit === "grind_5hrs") lifeExpectancy -= 2;
    if (game.stressManagement === "therapy") lifeExpectancy += 1;
    if (game.athleticGenetics > 70) lifeExpectancy += 2;
    lifeExpectancy = Math.round(lifeExpectancy);

    // 12. Advance age / month
    let newMonth = currentMonth + 1;
    let newAge   = currentAge;
    if (newMonth > 12) { newMonth = 1; newAge = currentAge + 1; }

    // 13. Mortality check (post-55)
    let gameStatus: "active" | "complete" = game.gameStatus;
    let isDeceased = game.isDeceased;
    let ageAtDeath = game.ageAtDeath;

    if (newAge > 55) {
      const ageOver55 = newAge - 55;
      const baseMortality = 0.001;                        // 0.1%/month base
      const ageScale      = Math.pow(1.05, ageOver55);   // +5% per year over 55
      const lowHealthPenalty = health < 40 ? (40 - health) * 0.003 : 0;
      const deathChance   = baseMortality * ageScale + lowHealthPenalty;

      if (Math.random() < deathChance) {
        gameStatus = "complete";
        isDeceased = true;
        ageAtDeath = newAge;
      }
    }

    // 14. Normal game-over at 75
    if (newAge >= 75 && !isDeceased) gameStatus = "complete";

    // 15. Organic dating meeting (15% chance, player must be single)
    let pendingMatches = game.pendingMatches;
    if (!game.currentPartner && game.relationshipStatus === "single" && Math.random() < 0.15) {
      pendingMatches = [generatePartner()];
    } else if (game.pendingMatches && game.pendingMatches.length > 0) {
      // Clear stale pending matches after one month
      pendingMatches = undefined;
    }

    // 16. History snapshots
    const newHappinessHistory = [
      ...happinessHistory,
      { age: newAge, month: newMonth, value: Math.round(happiness) },
    ];
    const newHealthHistory = [
      ...healthHistory,
      { age: newAge, month: newMonth, value: Math.round(health) },
    ];

    // 17. Net worth
    const netWorth = cash + investmentPortfolio + realEstateValue + retirementAccount - totalDebt;

    // 18. Roll random event (20% base)
    let pendingEventData = undefined;
    if (Math.random() < 0.2) {
      const templates = await ctx.db.query("eventTemplates").collect();
      const eligible  = templates.filter(t => {
        if (t.minAge !== undefined && newAge < t.minAge) return false;
        if (t.maxAge !== undefined && newAge > t.maxAge) return false;
        return true;
      });
      if (eligible.length > 0) {
        const totalWeight = eligible.reduce((s, t) => s + t.weight, 0);
        let rand = Math.random() * totalWeight;
        let sel  = eligible[0];
        for (const t of eligible) { rand -= t.weight; if (rand <= 0) { sel = t; break; } }
        pendingEventData = {
          templateId: sel._id.toString(),
          title: sel.titleTemplate,
          body: sel.bodyTemplate
            .replace("{displayName}", game.displayName)
            .replace("{age}", newAge.toString())
            .replace("{jobTitle}", game.jobTitle || "your job"),
          impactType: sel.impactType,
          hasChoice: sel.hasChoice,
          choiceAcceptOutcome: sel.choiceAcceptOutcome,
          choiceDeclineOutcome: sel.choiceDeclineOutcome,
        };
      }
    }

    // 19. Milestone check
    let checkMilestone = null;
    if (newAge >= 30 && !game.milestone30Done) checkMilestone = 30;
    else if (newAge >= 50 && !game.milestone50Done) checkMilestone = 50;

    // ── 20. Business mini-game: resolve ripples ───────────────
    const bizPatch: Record<string, any> = {};

    const dueRipples = (game.pendingBusinessRipples ?? []).filter(
      r => r.resolvesAtAge < newAge || (r.resolvesAtAge === newAge && r.resolvesAtMonth <= newMonth)
    );
    for (const ripple of dueRipples) {
      switch (ripple.effectType) {
        case 'revenue_boost':       cash += ripple.value;                              break;
        case 'monthly_revenue_add': monthlyIncome += ripple.value;                     break;
        case 'expense_reduction':   monthlyExpenses = Math.max(0, monthlyExpenses - ripple.value); break;
        case 'price_increase':      monthlyIncome = Math.round(monthlyIncome * (1 + ripple.value / 100)); break;
        // churn_reduction, time_saved, conversion_boost, lead_gen, insight_unlock,
        // risk_reduction, revenue_multiplier, credit_unlock — narrative-only, no direct stat change
        default: break;
      }
    }
    const remainingRipples = (game.pendingBusinessRipples ?? []).filter(r => !dueRipples.includes(r));
    bizPatch.pendingBusinessRipples = remainingRipples;

    // ── 20b. Business stage label update ─────────────────────
    if (game.activeBusiness && game.activeBusiness.stage !== "failed") {
      const stagePatch = updateBusinessStageSync({ ...game, ...bizPatch });
      Object.assign(bizPatch, stagePatch);
    }

    const simStage = (bizPatch.businessStageLabel ?? game.businessStageLabel) as string | undefined;
    const isGrowthOrScale = simStage === "growth" || simStage === "scale";

    // ── 20c. Engine-specific revenue simulation ───────────────
    if (game.activeBusiness && game.activeBusiness.stage !== "failed" && isGrowthOrScale) {
      const engine = game.activeBusiness.businessEngine ?? "service";
      const merged = { ...game, ...bizPatch };

      if (engine === "ecom") {
        const ecomResult = runEcomEngineSync(merged) as any;
        if (ecomResult.revenueDelta) {
          // Update the activeBusiness revenue with ecom calculation
          const existingBiz = bizPatch.activeBusiness ?? game.activeBusiness;
          bizPatch.activeBusiness = { ...existingBiz, monthlyRevenue: ecomResult.revenueDelta };
          monthlyExpenses = Math.max(0, monthlyExpenses + (ecomResult.expenseDelta ?? 0));
        }
      } else {
        // SaaS or service: customer funnel simulation
        const simResult = runCustomerSimulationSync(merged) as any;
        if (simResult.businessMetrics) {
          bizPatch.businessMetrics = simResult.businessMetrics;
          if (simResult._mrrDelta) monthlyIncome = Math.max(0, monthlyIncome + simResult._mrrDelta);
        }
        if (engine === "service") {
          const svcResult = runServiceEngineSync(merged) as any;
          if (svcResult.revenueDelta) {
            const existingBiz = bizPatch.activeBusiness ?? game.activeBusiness;
            bizPatch.activeBusiness = { ...existingBiz, monthlyRevenue: svcResult.revenueDelta };
            if (svcResult.expenseDelta) monthlyExpenses = Math.max(0, monthlyExpenses + svcResult.expenseDelta);
          }
        }
      }
    }

    // ── 20d. Apply business levers + market positioning (full mode only) ────
    const bizMode = game.businessMode ?? "simplified";
    if (game.activeBusiness && bizMode === "full") {
      // Levers
      if (game.businessLevers) {
        const leverMerge = { ...game, businessMetrics: bizPatch.businessMetrics ?? game.businessMetrics };
        const leverResult = applyLeversToMetricsSync(leverMerge) as any;
        if (leverResult.businessMetrics) bizPatch.businessMetrics = leverResult.businessMetrics;
        if (leverResult.expenseDelta)    monthlyExpenses = Math.max(0, monthlyExpenses + leverResult.expenseDelta);
      }

      // Market positioning — premium pricing, quality multiplier, wages
      if (game.marketPositioning) {
        const mpMerge = {
          ...game,
          activeBusiness: bizPatch.activeBusiness ?? game.activeBusiness,
          businessMetrics: bizPatch.businessMetrics ?? game.businessMetrics,
        };
        const mpResult = applyMarketPositioningSync(mpMerge);
        if (mpResult.revenueDelta !== 0) {
          // Apply revenue delta to the activeBusiness revenue AND to income
          const currentBiz = bizPatch.activeBusiness ?? game.activeBusiness;
          bizPatch.activeBusiness = {
            ...currentBiz,
            monthlyRevenue: Math.max(0, currentBiz.monthlyRevenue + mpResult.revenueDelta),
          };
          // Revenue delta also flows into effective income
          effectiveIncome = Math.max(0, effectiveIncome + mpResult.revenueDelta);
        }
        if (mpResult.expenseDelta !== 0) {
          monthlyExpenses = Math.max(0, monthlyExpenses + mpResult.expenseDelta);
        }
        if (mpResult.metricsPatch) {
          bizPatch.businessMetrics = mpResult.metricsPatch;
        }
      }
    }

    // ── 20e. AI competitor simulation ────────────────────────
    if (game.activeBusiness && isGrowthOrScale) {
      const compMerge = { ...game, businessMetrics: bizPatch.businessMetrics ?? game.businessMetrics, businessStageLabel: simStage };
      const compResult = runCompetitorSimulationSync(compMerge);
      if (compResult.competitors)       bizPatch.competitors       = compResult.competitors;
      if (compResult.competitorIntelLog) bizPatch.competitorIntelLog = compResult.competitorIntelLog;
    }

    // ── 20f. KPI scorecard + credit rating ───────────────────
    if (game.activeBusiness && isGrowthOrScale) {
      const kpiMerge = { ...game, businessMetrics: bizPatch.businessMetrics ?? game.businessMetrics, competitors: bizPatch.competitors ?? game.competitors };
      const kpiResult = calcKPIsSync(kpiMerge, bizPatch);
      bizPatch.boardConfidence = kpiResult.boardConfidence;
      bizPatch.creditRating    = kpiResult.creditRating as any;
    }

    // ── 20g. Financial report snapshot (full mode only) ───────
    if (game.activeBusiness && isGrowthOrScale && bizMode === "full") {
      const reportMerge = { ...game, ...bizPatch };
      const report = generateFinancialReport(reportMerge, bizPatch);
      if (report) {
        bizPatch.financialHistory = [...(game.financialHistory ?? []), report].slice(-24); // keep 24 months
      }
    }

    // ── 20h. Store prevMonthMRR for next month growth calc ────
    const finalMetrics = bizPatch.businessMetrics ?? game.businessMetrics;
    if (finalMetrics) bizPatch.prevMonthMRR = finalMetrics.mrr;

    // ── 21. Generate fresh business decisions for next month ──
    if (game.activeBusiness && game.activeBusiness.stage !== 'failed') {
      const shuffled = [...DECISION_TEMPLATES].sort(() => Math.random() - 0.5);
      const newDecisions = shuffled.slice(0, 4).map(t => ({
        id: t.id, category: t.category, title: t.title, description: t.description,
        timeCostDIY:   t.timeDIY,   moneyCostDIY:  t.moneyDIY,
        timeCostHire:  t.timeHire,  moneyCostHire: t.moneyHire,
        rippleMonths: t.rippleMonths, rippleEffectType: t.rippleType,
        rippleValueMin: t.min,       rippleValueMax: t.max,
      }));
      const roles = ['VA', 'Marketer', 'Developer', 'Sales Rep', 'Operations'];
      const names = ['Alex', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Sam', 'Drew', 'Quinn'];
      const salaryMap: Record<string, number> = { VA: 800, Marketer: 3500, Developer: 6000, 'Sales Rep': 2500, Operations: 3000 };

      // Wages premium affects candidate pool quality and count
      const wagesFx  = wagesPremiumCandidateEffect(game.marketPositioning?.wagesPremium ?? 0);
      const poolSize = Math.max(1, Math.round(3 * wagesFx.poolMultiplier));
      const candidates = Array.from({ length: poolSize }, () => {
        const role  = roles[Math.floor(Math.random() * roles.length)];
        const skill = Math.round(Math.random() * 6) + 3;
        const rawReliability = Math.round(Math.random() * 6) + 3;
        // Clamp wages-adjusted reliability to 1–9
        const reliability = Math.max(1, Math.min(9, rawReliability + Math.round(wagesFx.reliabilityBonus / 3)));
        const salaryBase = (salaryMap[role] ?? 2000);
        const wageAdj    = game.marketPositioning ? Math.round(salaryBase * (game.marketPositioning.wagesPremium / 100)) : 0;
        return {
          name:          names[Math.floor(Math.random() * names.length)],
          role,
          skillLevel:    skill,
          reliability,
          monthlySalary: salaryBase + (skill - 5) * 300 + wageAdj,
        };
      });
      bizPatch.pendingBusinessDecisions = newDecisions;
      bizPatch.pendingHireCandidates    = candidates;
    }

    // ── 22. Time budget overflow penalty ─────────────────────
    const timeUsed = game.monthlyTimeUsed ?? 0;
    if (timeUsed > 160) {
      const overflow = timeUsed - 160;
      const penalty  = Math.floor(overflow / 20);
      happiness = Math.max(0, happiness - penalty * 5);
      health    = Math.max(0, health    - penalty * 2);
    }
    // Reset monthly time counter
    bizPatch.monthlyTimeUsed = 0;

    await ctx.db.patch(args.gameId, {
      cash: Math.round(cash),
      monthlyIncome,
      monthlyExpenses,
      investmentPortfolio,
      realEstateValue,
      retirementAccount,
      lifetimeIncome,
      happiness: Math.min(100, Math.max(0, Math.round(happiness))),
      health:    Math.min(100, Math.max(0, Math.round(health))),
      currentAge: newAge,
      currentMonth: newMonth,
      totalDebt,
      studentLoanDebt,
      creditCardDebt,
      mortgageDebt,
      netWorth: Math.round(netWorth),
      happinessHistory: newHappinessHistory.slice(-300),
      healthHistory:    newHealthHistory.slice(-300),
      activeEffects: remainingEffects,
      pendingEventData: pendingEventData || undefined,
      gameStatus,
      skillStackMultiplier: stackMultiplier,
      activeSkillStack: newActiveStack,
      projectedLifeExpectancy: lifeExpectancy,
      isDeceased,
      ageAtDeath,
      currentPartner: updatedPartner,
      pendingMatches,
      ...bizPatch,
    });

    return {
      status: "ok",
      newAge,
      newMonth,
      hasEvent: !!pendingEventData,
      checkMilestone,
      isGameOver: gameStatus === "complete",
      newlyUnlockedStack,
      organicMeeting: pendingMatches && pendingMatches.length > 0,
      stageJustUnlocked: bizPatch.businessStageLabel && bizPatch.businessStageLabel !== game.businessStageLabel
        ? bizPatch.businessStageLabel as string : undefined,
      boardReportReady: !!(bizPatch.boardConfidence !== undefined),
    };
  },
});

// ═══════════════════════════════════════════════════
// MAKE DECISION
// ═══════════════════════════════════════════════════
export const makeDecision = mutation({
  args: {
    gameId: v.id("games"),
    decisionType: v.string(),
    decisionData: v.any(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error" };

    const { decisionType, decisionData } = args;
    const updates: Record<string, any> = {};
    let outcomeText = "";

    switch (decisionType) {
      case "apply_job": {
        const salaryMap: Record<string, number> = {
          intern: 1800, junior: 3500, mid: 5500, senior: 8000,
          manager: 10000, director: 15000, executive: 25000,
        };
        const targetLevel = decisionData.targetLevel as string;
        const newSalary   = salaryMap[targetLevel] || 3500;
        const careerOrder = ["none","intern","junior","mid","senior","manager","director","executive","business_owner"];
        const currentIdx  = careerOrder.indexOf(game.careerLevel);
        const targetIdx   = careerOrder.indexOf(targetLevel);
        if (targetIdx > currentIdx + 2) {
          outcomeText = "Application rejected — need more experience!";
        } else {
          updates.monthlyIncome = newSalary;
          updates.careerLevel   = targetLevel;
          updates.jobTitle      = decisionData.jobTitle  || "Professional";
          updates.industry      = decisionData.industry  || game.industry;
          outcomeText = `Got the job! New salary: $${newSalary.toLocaleString()}/mo`;
        }
        break;
      }
      case "request_raise": {
        const raiseChance = game.careerLevel === "none" ? 0 : 0.6;
        if (Math.random() < raiseChance) {
          const raise = Math.round(game.monthlyIncome * 0.1);
          updates.monthlyIncome = game.monthlyIncome + raise;
          outcomeText = `Raise approved! +$${raise.toLocaleString()}/mo`;
        } else {
          updates.happiness = Math.max(0, game.happiness - 5);
          outcomeText = "Raise denied. Maybe next time.";
        }
        break;
      }
      case "start_side_hustle": {
        updates.monthlyIncome = game.monthlyIncome + 500;
        updates.happiness     = Math.max(0, game.happiness - 5);
        updates.activeEffects = [...game.activeEffects, { type: "income_boost", value: 500, monthsRemaining: 12 }];
        outcomeText = "Side hustle started! +$500/mo for 12 months";
        break;
      }
      case "enroll_education": {
        const eduCosts: Record<string, { monthly: number; years: number; resultLevel: string }> = {
          trade:    { monthly: 500,  years: 2, resultLevel: "trade"    },
          associate:{ monthly: 800,  years: 2, resultLevel: "associate"},
          bachelor: { monthly: 1500, years: 4, resultLevel: "bachelor" },
          master:   { monthly: 2000, years: 2, resultLevel: "master"   },
          phd:      { monthly: 1000, years: 5, resultLevel: "phd"      },
          md:       { monthly: 3000, years: 4, resultLevel: "md"       },
          jd:       { monthly: 2500, years: 3, resultLevel: "jd"       },
        };
        const info = eduCosts[decisionData.level as string];
        if (info) {
          updates.monthlyExpenses        = game.monthlyExpenses + info.monthly;
          updates.inCollegeYearsRemaining = info.years;
          updates.studentLoanDebt        = game.studentLoanDebt + info.monthly * 12 * info.years;
          updates.totalDebt              = game.totalDebt       + info.monthly * 12 * info.years;
          outcomeText = `Enrolled in ${decisionData.level} program!`;
        }
        break;
      }
      case "buy_house": {
        const price       = decisionData.price as number;
        const downPayment = Math.round(price * 0.2);
        if (game.cash >= downPayment) {
          updates.cash         = game.cash - downPayment;
          updates.mortgageDebt = price - downPayment;
          updates.totalDebt    = game.totalDebt + (price - downPayment);
          updates.realEstateValue  = price;
          updates.monthlyExpenses  = game.monthlyExpenses + Math.round(price * 0.004);
          updates.happiness        = Math.min(100, game.happiness + 10);
          outcomeText = `House purchased! Monthly mortgage ~$${Math.round(price * 0.004).toLocaleString()}/mo`;
        } else {
          outcomeText = `Need $${downPayment.toLocaleString()} down — not enough cash!`;
        }
        break;
      }
      case "invest_stocks": {
        const amount = decisionData.amount as number;
        if (game.cash >= amount) {
          updates.cash = game.cash - amount;
          updates.investmentPortfolio = game.investmentPortfolio + amount;
          outcomeText = `Invested $${amount.toLocaleString()} in stocks!`;
        } else { outcomeText = "Insufficient funds!"; }
        break;
      }
      case "invest_retirement": {
        const amount = decisionData.amount as number;
        if (game.cash >= amount) {
          updates.cash = game.cash - amount;
          updates.retirementAccount = game.retirementAccount + amount;
          outcomeText = `+$${amount.toLocaleString()} to retirement!`;
        } else { outcomeText = "Insufficient funds!"; }
        break;
      }
      case "pay_debt": {
        const amount = decisionData.amount as number;
        const type   = decisionData.debtType as string;
        if (game.cash >= amount) {
          updates.cash = game.cash - amount;
          if (type === "student")     updates.studentLoanDebt = Math.max(0, game.studentLoanDebt - amount);
          else if (type === "credit_card") updates.creditCardDebt = Math.max(0, game.creditCardDebt - amount);
          else if (type === "mortgage")    updates.mortgageDebt   = Math.max(0, game.mortgageDebt   - amount);
          updates.totalDebt = Math.max(0,
            (updates.studentLoanDebt ?? game.studentLoanDebt) +
            (updates.creditCardDebt  ?? game.creditCardDebt)  +
            (updates.mortgageDebt    ?? game.mortgageDebt));
          updates.happiness = Math.min(100, game.happiness + 3);
          outcomeText = `Paid $${amount.toLocaleString()} off ${type} debt!`;
        } else { outcomeText = "Not enough cash!"; }
        break;
      }
      case "set_lifestyle": {
        updates.spendingMultiplier = decisionData.multiplier as number;
        const labels: Record<number, string> = { 0.7:"Extreme Frugal", 0.85:"Frugal", 1.0:"Normal", 1.15:"Comfortable", 1.3:"Lavish" };
        outcomeText = `Lifestyle: ${labels[decisionData.multiplier] || "Normal"}`;
        break;
      }
      case "get_credit_card": {
        updates.creditCardDebt = game.creditCardDebt + (decisionData.amount || 0);
        updates.cash           = game.cash           + (decisionData.amount || 0);
        updates.totalDebt      = game.totalDebt      + (decisionData.amount || 0);
        outcomeText = "Credit card used. Watch that interest!";
        break;
      }
    }

    const decisionsLog = [
      ...game.decisionsLog,
      { month: game.currentMonth, age: game.currentAge, decision: decisionType, outcome: outcomeText },
    ];
    updates.decisionsLog = decisionsLog.slice(-100);

    // Recalculate net worth
    const newCash      = updates.cash      ?? game.cash;
    const newPortfolio = updates.investmentPortfolio ?? game.investmentPortfolio;
    const newRE        = updates.realEstateValue     ?? game.realEstateValue;
    const newRetire    = updates.retirementAccount   ?? game.retirementAccount;
    const newDebt      = updates.totalDebt           ?? game.totalDebt;
    updates.netWorth   = newCash + newPortfolio + newRE + newRetire - newDebt;

    await ctx.db.patch(args.gameId, updates);
    return { status: "ok", outcome: outcomeText };
  },
});

// ═══════════════════════════════════════════════════
// RESOLVE EVENT
// ═══════════════════════════════════════════════════
export const resolveEvent = mutation({
  args: {
    gameId: v.id("games"),
    choice: v.union(v.literal("accept"), v.literal("decline"), v.literal("none")),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.pendingEventData) return { status: "error" };

    const event   = game.pendingEventData;
    const updates: Record<string, any> = {};
    const parts   = event.impactType.split(",");

    for (const part of parts) {
      const [key, val] = part.trim().split(":");
      const numVal     = parseFloat(val || "0");
      if (key === "cash")         updates.cash = (game.cash + numVal);
      if (key === "cash_pct")     updates.cash = Math.round(game.cash * (1 + numVal / 100));
      if (key === "income_pct")   updates.monthlyIncome = game.monthlyIncome + Math.round(game.monthlyIncome * numVal / 100);
      if (key === "income_zero")  {
        updates.monthlyIncome = 0; updates.careerLevel = "none"; updates.jobTitle = "Unemployed";
        updates.activeEffects = [...game.activeEffects, { type: "income_boost", value: game.monthlyIncome, monthsRemaining: 3 }];
      }
      if (key === "happiness")    updates.happiness = Math.min(100, Math.max(0, game.happiness + numVal));
      if (key === "health")       updates.health    = Math.min(100, Math.max(0, game.health    + numVal));
      if (key === "expense")      updates.monthlyExpenses = game.monthlyExpenses + numVal;
      if (key === "investment_pct") {
        updates.investmentPortfolio = Math.round(game.investmentPortfolio * (1 + numVal / 100));
        updates.retirementAccount   = Math.round(game.retirementAccount   * (1 + numVal / 100));
      }
      if (key === "realestate_pct") updates.realEstateValue = Math.round(game.realEstateValue * (1 + numVal / 100));
      if (key === "debt") { updates.creditCardDebt = game.creditCardDebt + numVal; updates.totalDebt = game.totalDebt + numVal; }
      if (key === "married")  { updates.relationshipStatus = "married";  updates.monthlyExpenses = game.monthlyExpenses + 300; updates.happiness = Math.min(100, game.happiness + 15); }
      if (key === "baby")     { updates.dependents = game.dependents + 1; updates.monthlyExpenses = game.monthlyExpenses + 1200; updates.happiness = Math.min(100, game.happiness + 15); }
      if (key === "divorced") { updates.relationshipStatus = "divorced"; updates.happiness = Math.max(0, game.happiness - 20); updates.cash = Math.round(game.cash * 0.6); }
      if (key === "income_pct_temp") {
        updates.activeEffects = [...(updates.activeEffects || game.activeEffects),
          { type: "income_boost", value: Math.round(game.monthlyIncome * numVal / 100), monthsRemaining: 12 }];
      }
    }

    const eventLog = [...game.eventLog, {
      month: game.currentMonth, age: game.currentAge, title: event.title,
      body: args.choice === "accept" ? event.choiceAcceptOutcome
           : args.choice === "decline" ? event.choiceDeclineOutcome : event.body,
      impact: event.impactType,
    }];
    updates.eventLog        = eventLog.slice(-50);
    updates.pendingEventData = undefined;

    const newCash   = updates.cash ?? game.cash;
    const newPort   = updates.investmentPortfolio ?? game.investmentPortfolio;
    const newRE     = updates.realEstateValue     ?? game.realEstateValue;
    const newRetire = updates.retirementAccount   ?? game.retirementAccount;
    const totalDebt = (updates.studentLoanDebt ?? game.studentLoanDebt) +
                      (updates.creditCardDebt  ?? game.creditCardDebt)  +
                      (updates.mortgageDebt    ?? game.mortgageDebt);
    updates.totalDebt = totalDebt;
    updates.netWorth  = newCash + newPort + newRE + newRetire - totalDebt;

    await ctx.db.patch(args.gameId, updates);
    return { status: "ok" };
  },
});

// ═══════════════════════════════════════════════════
// END GAME
// ═══════════════════════════════════════════════════
export const endGame = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;

    let netWorthScore = 0;
    if (game.netWorth > 0) {
      if      (game.netWorth >= 5_000_000) netWorthScore = 150;
      else if (game.netWorth >= 1_000_000) netWorthScore = 100 + (game.netWorth - 1_000_000) / 4_000_000 * 50;
      else netWorthScore = Math.min(100, Math.log10(game.netWorth + 1) / Math.log10(1_000_000) * 100);
    }
    let incomeScore = 0;
    if      (game.lifetimeIncome >= 8_000_000) incomeScore = 150;
    else if (game.lifetimeIncome >= 3_000_000) incomeScore = 100 + (game.lifetimeIncome - 3_000_000) / 5_000_000 * 50;
    else incomeScore = Math.min(100, game.lifetimeIncome / 3_000_000 * 100);

    const avgHappiness = game.happinessHistory.length > 0
      ? game.happinessHistory.reduce((s, h) => s + h.value, 0) / game.happinessHistory.length : 50;

    // Renaissance Person happiness bonus
    const renaissanceBonus = game.activeSkillStack === "Renaissance Person" ? avgHappiness * 0.10 : 0;

    const healthScore  = game.health;
    const finalScore   = netWorthScore * 0.4 + incomeScore * 0.2 + (avgHappiness + renaissanceBonus) * 0.3 + healthScore * 0.1;

    let finalGrade = "F";
    if      (finalScore >= 95) finalGrade = "A+";
    else if (finalScore >= 90) finalGrade = "A";
    else if (finalScore >= 85) finalGrade = "A-";
    else if (finalScore >= 80) finalGrade = "B+";
    else if (finalScore >= 75) finalGrade = "B";
    else if (finalScore >= 70) finalGrade = "B-";
    else if (finalScore >= 65) finalGrade = "C+";
    else if (finalScore >= 60) finalGrade = "C";
    else if (finalScore >= 55) finalGrade = "C-";
    else if (finalScore >= 50) finalGrade = "D+";
    else if (finalScore >= 45) finalGrade = "D";
    else if (finalScore >= 40) finalGrade = "D-";

    await ctx.db.patch(args.gameId, {
      gameStatus: "complete", finalScore: Math.round(finalScore),
      finalGrade, completedAt: Date.now(),
    });

    await ctx.db.insert("leaderboard", {
      gameId: args.gameId, displayName: game.displayName,
      startingPoint: game.startingPoint, parentalIncomeTier: game.parentalIncomeTier,
      finalScore: Math.round(finalScore), netWorth: game.netWorth,
      lifetimeIncome: game.lifetimeIncome, happinessQuotient: Math.round(avgHappiness),
      healthAtEnd: Math.round(game.health), grade: finalGrade, completedAt: Date.now(),
    });

    return { finalScore: Math.round(finalScore), finalGrade,
      netWorthScore: Math.round(netWorthScore), incomeScore: Math.round(incomeScore),
      happinessQuotient: Math.round(avgHappiness), healthScore: Math.round(healthScore) };
  },
});

// ═══════════════════════════════════════════════════
// SET MILESTONE NARRATIVE
// ═══════════════════════════════════════════════════
export const setMilestoneNarrative = mutation({
  args: { gameId: v.id("games"), age: v.number(), narrative: v.string() },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {};
    if      (args.age === 30) { updates.milestone30Done = true; updates.milestoneNarrative30 = args.narrative; }
    else if (args.age === 50) { updates.milestone50Done = true; updates.milestoneNarrative50 = args.narrative; }
    else if (args.age === 75) { updates.milestoneNarrative75 = args.narrative; }
    await ctx.db.patch(args.gameId, updates);
  },
});

// ═══════════════════════════════════════════════════
// BUSINESS SYSTEM
// ═══════════════════════════════════════════════════
export const startBusiness = mutation({
  args: {
    gameId: v.id("games"),
    businessTypeId: v.string(),
    businessTypeName: v.string(),
    initialInvestment: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game)              return { status: "error", message: "Game not found" };
    if (game.activeBusiness) return { status: "error", message: "Already have active business" };
    if (game.cash < args.initialInvestment) return { status: "error", message: "Insufficient funds" };

    let bonusSkill = 0;
    const biz = args.businessTypeName.toLowerCase();
    if (game.educationLevel === "bachelor" && (biz.includes("saas") || biz.includes("dev"))) bonusSkill += 20;
    if ((game.educationLevel === "bachelor" || game.educationLevel === "master") && biz.includes("bookkeep")) bonusSkill += 15;
    if (game.educationLevel === "bachelor" && biz.includes("marketing")) bonusSkill += 10;
    if (game.educationLevel === "trade")   bonusSkill += 25;
    if (game.educationLevel === "master")  bonusSkill -= 5;

    await ctx.db.patch(args.gameId, {
      cash: game.cash - args.initialInvestment,
      entrepreneurshipSkill: Math.min(100, game.entrepreneurshipSkill + 3 + bonusSkill),
      activeBusiness: {
        businessTypeId:   args.businessTypeId,
        businessTypeName: args.businessTypeName,
        stage:            "small_test",
        monthsActive:     0,
        monthlyRevenue:   0,
        monthlyExpenses:  Math.round(args.initialInvestment * 0.3),
        totalInvested:    args.initialInvestment,
        marketingActionsThisMonth: 0,
        businessEngine:   determineEngine(args.businessTypeName),
      },
    });
    return { status: "ok", message: `${args.businessTypeName} launched! Ent. skill +${3 + bonusSkill}` };
  },
});

export const doMarketingAction = mutation({
  args: { gameId: v.id("games"), actionType: v.string(), cost: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.activeBusiness) return { status: "error", message: "No active business" };
    if (game.cash < args.cost)         return { status: "error", message: "Insufficient funds" };

    const skillGain       = Math.floor(Math.random() * 4) + 2;
    const newMarketingSkill = Math.min(100, game.marketingSkill + skillGain);
    const successChance   = (game.marketingSkill + skillGain) / 200;
    let revenueBoost = 0;
    if (Math.random() < successChance) {
      revenueBoost = Math.round(game.activeBusiness.monthlyRevenue * 0.15 + 100);
    }

    await ctx.db.patch(args.gameId, {
      cash: game.cash - args.cost,
      marketingSkill: newMarketingSkill,
      activeBusiness: {
        ...game.activeBusiness,
        monthlyRevenue: game.activeBusiness.monthlyRevenue + revenueBoost,
        marketingActionsThisMonth: game.activeBusiness.marketingActionsThisMonth + 1,
      },
    });

    return {
      status: "ok",
      message: revenueBoost > 0
        ? `Marketing hit! Revenue +$${revenueBoost}/mo. Mkt skill +${skillGain}`
        : `No immediate result, but Mkt skill +${skillGain}. Keep pushing!`,
      skillGain, revenueBoost,
    };
  },
});

export const advanceBusinessMonth = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.activeBusiness) return;

    const biz         = game.activeBusiness;
    const monthsActive = biz.monthsActive + 1;
    let stage         = biz.stage;
    let monthlyRevenue = biz.monthlyRevenue;
    let monthlyExpenses = biz.monthlyExpenses;
    let outcome       = "continue";
    let failureReason = "";

    const successProb = (game.entrepreneurshipSkill * 0.4 + game.marketingSkill * 0.6) / 100;

    if (stage === "small_test") {
      const growthBase = (game.marketingSkill / 100) * 500;
      monthlyRevenue   = Math.round(biz.monthlyRevenue + growthBase * (0.5 + Math.random()));
      if (monthsActive >= 3) {
        if (Math.random() < 0.7 - successProb * 0.3) { stage = "failed"; outcome = "failed"; failureReason = "No product-market fit found."; }
        else stage = "growing";
      }
    } else if (stage === "growing") {
      const growthRate = 0.05 + (game.marketingSkill / 100) * 0.15;
      monthlyRevenue   = Math.round(biz.monthlyRevenue * (1 + growthRate));
      monthlyExpenses  = Math.round(biz.monthlyExpenses * 1.05);
      if (monthsActive >= 24) stage = "established";
      if (Math.random() < 0.03 * (1 - successProb * 0.5)) { stage = "failed"; outcome = "failed"; failureReason = "Growth stalled."; }
    } else if (stage === "established") {
      const growthRate = 0.02 + (game.marketingSkill / 100) * 0.05;
      monthlyRevenue   = Math.round(biz.monthlyRevenue * (1 + growthRate));
      if (Math.random() < successProb * 0.05) { stage = "success_breakout"; monthlyRevenue = Math.round(monthlyRevenue * 3); outcome = "breakout"; }
      if (Math.random() < 0.015 * (1 - successProb * 0.5) && stage !== "success_breakout") { stage = "failed"; outcome = "failed"; failureReason = "Lost key clients."; }
    } else if (stage === "success_breakout") {
      monthlyRevenue = Math.round(biz.monthlyRevenue * 1.15);
    }

    if (outcome === "failed") {
      const skillGain = Math.floor(Math.random() * 6) + 3;
      await ctx.db.patch(args.gameId, {
        activeBusiness: undefined,
        businessHistory: [...game.businessHistory, {
          businessTypeName: biz.businessTypeName, stage: biz.stage,
          monthsActive, peakRevenue: biz.monthlyRevenue, outcome: failureReason,
        }],
        entrepreneurshipSkill: Math.min(100, game.entrepreneurshipSkill + skillGain),
      });
      return { status: "failed", failureReason, skillGain };
    }

    await ctx.db.patch(args.gameId, {
      activeBusiness: { ...biz, stage, monthsActive, monthlyRevenue, monthlyExpenses, marketingActionsThisMonth: 0 },
      entrepreneurshipSkill: Math.max(0, game.entrepreneurshipSkill),
    });
    return { status: outcome, monthlyRevenue, stage };
  },
});

export const closeBusiness = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.activeBusiness) return;
    await ctx.db.patch(args.gameId, {
      activeBusiness: undefined,
      businessHistory: [...game.businessHistory, {
        businessTypeName: game.activeBusiness.businessTypeName,
        stage: game.activeBusiness.stage,
        monthsActive: game.activeBusiness.monthsActive,
        peakRevenue:  game.activeBusiness.monthlyRevenue,
        outcome: "Voluntarily closed",
      }],
      entrepreneurshipSkill: Math.min(100, game.entrepreneurshipSkill + 3),
    });
  },
});

// ═══════════════════════════════════════════════════
// HEALTH HABITS
// ═══════════════════════════════════════════════════
export const setHealthHabit = mutation({
  args: {
    gameId: v.id("games"),
    habitType: v.union(
      v.literal("exerciseHabit"),
      v.literal("dietHabit"),
      v.literal("sleepHabit"),
      v.literal("stressManagement")
    ),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error" };
    await ctx.db.patch(args.gameId, { [args.habitType]: args.value as any });
    return { status: "ok" };
  },
});

// ═══════════════════════════════════════════════════
// EXTRACURRICULAR ACTIVITIES
// ═══════════════════════════════════════════════════
export const doExtracurricular = mutation({
  args: { gameId: v.id("games"), activityId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error", message: "Game not found" };

    type Activity = {
      name: string; cost: number; recurring: boolean;
      skillGains: Partial<Record<string, number>>;
      healthDelta?: number; happinessDelta?: number; fearOfRejectionDelta?: number;
    };

    const activities: Record<string, Activity> = {
      toastmasters:       { name: "Toastmasters",               cost: 45,  recurring: true,  skillGains: { publicSpeaking: 3,   communicationSkill: 2 } },
      hypnosis:           { name: "Hypnosis Certification",     cost: 400, recurring: false, skillGains: { sales: 8,             emotionalIntelligence: 5 } },
      improv:             { name: "Improv Comedy Class",        cost: 150, recurring: true,  skillGains: { communicationSkill: 3, creativity: 2 }, fearOfRejectionDelta: -15 },
      coding_bootcamp:    { name: "Online Coding Bootcamp",     cost: 200, recurring: true,  skillGains: { technicalSkill: 5   } },
      investment_club:    { name: "Investment Club",            cost: 50,  recurring: true,  skillGains: { financialLiteracy: 3 } },
      writing_workshop:   { name: "Writing Workshop",           cost: 100, recurring: true,  skillGains: { writing: 3,           creativity: 2 } },
      sales_training:     { name: "Sales Training Intensive",  cost: 500, recurring: false, skillGains: { sales: 10,            negotiation: 3 } },
      leadership_seminar: { name: "Leadership Seminar",        cost: 600, recurring: false, skillGains: { leadership: 7,        emotionalIntelligence: 3 } },
      networking_events:  { name: "Networking Events",         cost: 75,  recurring: true,  skillGains: { networking: 3,        communicationSkill: 2 } },
      martial_arts:       { name: "Martial Arts",              cost: 120, recurring: true,  skillGains: { leadership: 2       }, healthDelta: 3, fearOfRejectionDelta: -10 },
      book_club:          { name: "Book Club",                 cost: 0,   recurring: true,  skillGains: { financialLiteracy: 2, creativity: 1 } },
      yoga:               { name: "Yoga / Meditation",         cost: 40,  recurring: true,  skillGains: { emotionalIntelligence: 2 }, happinessDelta: 3 },
      chess_club:         { name: "Chess Club",                cost: 0,   recurring: true,  skillGains: { financialLiteracy: 2 } },
      language_learning:  { name: "Language Learning",         cost: 0,   recurring: true,  skillGains: { networking: 1       } },
    };

    const act = activities[args.activityId];
    if (!act)           return { status: "error", message: "Unknown activity" };
    if (game.cash < act.cost) return { status: "error", message: "Insufficient funds" };

    const updates: Record<string, any> = { cash: game.cash - act.cost };

    // Apply skill gains (capped at 100)
    for (const [skill, gain] of Object.entries(act.skillGains)) {
      const current = (game as any)[skill] ?? 0;
      updates[skill] = Math.min(100, current + (gain ?? 0));
    }
    if (act.healthDelta)         updates.health          = Math.min(100, game.health          + act.healthDelta);
    if (act.happinessDelta)      updates.happiness        = Math.min(100, game.happiness        + act.happinessDelta);
    if (act.fearOfRejectionDelta) updates.fearOfRejection = Math.max(0,   (game.fearOfRejection ?? 60) + act.fearOfRejectionDelta);

    const decisionsLog = [...game.decisionsLog, {
      month: game.currentMonth, age: game.currentAge,
      decision: `grow:${args.activityId}`,
      outcome: `${act.name} complete! Skills improved.`,
    }];
    updates.decisionsLog = decisionsLog.slice(-100);

    await ctx.db.patch(args.gameId, updates);
    return { status: "ok", message: `${act.name} complete!`, skillGains: act.skillGains };
  },
});

// ═══════════════════════════════════════════════════
// DATING SYSTEM
// ═══════════════════════════════════════════════════
export const activateDatingApp = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error" };
    await ctx.db.patch(args.gameId, {
      onlineDatingActive: true,
      monthlyExpenses: game.monthlyExpenses + 40,
    });
    return { status: "ok", message: "Dating app active! +$40/mo expenses." };
  },
});

export const generateDatingMatches = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game)                  return { status: "error", message: "Game not found" };
    if (!game.onlineDatingActive)  return { status: "error", message: "Dating app not active" };

    // 3–5 matches
    const count   = Math.floor(Math.random() * 3) + 3;
    const matches = Array.from({ length: count }, generatePartner);

    await ctx.db.patch(args.gameId, { pendingMatches: matches });
    return { status: "ok", matches };
  },
});

export const initiateConversation = mutation({
  args: { gameId: v.id("games"), partnerIndex: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error" };

    const comm = game.communicationSkill ?? 10;
    const fear = game.fearOfRejection ?? 60;

    // Success = comm skill - fear_of_rejection penalty
    const successChance = Math.max(0.10, Math.min(0.90, (comm - fear * 0.3) / 100));
    const succeeded = Math.random() < successChance;

    // Either way, fear decreases slightly (exposure therapy)
    const newFear = Math.max(0, fear - (succeeded ? 5 : 2));

    await ctx.db.patch(args.gameId, { fearOfRejection: newFear });
    return { status: "ok", succeeded, newFear };
  },
});

export const startDating = mutation({
  args: { gameId: v.id("games"), partnerIndex: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error" };

    const matches = game.pendingMatches ?? [];
    const partner = matches[args.partnerIndex];
    if (!partner) return { status: "error", message: "Invalid partner" };

    await ctx.db.patch(args.gameId, {
      currentPartner: {
        name: partner.name,
        traits: partner.traits,
        career: partner.career,
        monthlyIncome: partner.monthlyIncome,
        attractiveness: partner.attractiveness,
        iq: partner.iq,
        ambition: partner.ambition,
        emotionalStability: partner.emotionalStability,
        financialResponsibility: partner.financialResponsibility,
        compatibilityScore: partner.compatibilityScore,
        monthsTogether: 0,
        compatibilityRevealed: false,
        status: "dating",
      },
      relationshipStatus: "dating",
      happiness: Math.min(100, game.happiness + 10),
      pendingMatches: undefined,
    });
    return { status: "ok", message: `You're now dating ${partner.name}!` };
  },
});

export const proposeMarriage = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.currentPartner) return { status: "error" };

    const partner = game.currentPartner;
    // Acceptance chance based on compatibility and months together
    const acceptChance = Math.min(0.9, partner.compatibilityScore / 100 * 0.7 + partner.monthsTogether / 24 * 0.3);
    const accepted     = Math.random() < acceptChance;

    if (accepted) {
      await ctx.db.patch(args.gameId, {
        relationshipStatus: "married",
        monthlyIncome:  game.monthlyIncome  + Math.round(partner.monthlyIncome * 0.5), // shared income
        monthlyExpenses: game.monthlyExpenses + 500, // merged household costs offset
        happiness: Math.min(100, game.happiness + 20),
      });
      return { status: "ok", accepted: true, message: `${partner.name} said YES! 🎉` };
    } else {
      await ctx.db.patch(args.gameId, {
        happiness: Math.max(0, game.happiness - 15),
        currentPartner: undefined,
        relationshipStatus: "single",
      });
      return { status: "ok", accepted: false, message: `${partner.name} said no. Ouch.` };
    }
  },
});

export const breakUp = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.currentPartner) return { status: "error" };
    const name = game.currentPartner.name;

    await ctx.db.patch(args.gameId, {
      currentPartner: undefined,
      relationshipStatus: "single",
      happiness: Math.max(0, game.happiness - 12),
    });
    return { status: "ok", message: `You and ${name} broke up.` };
  },
});

export const dismissOrganic = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, { pendingMatches: undefined });
    return { status: "ok" };
  },
});
