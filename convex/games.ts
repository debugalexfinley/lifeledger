import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
  },
  handler: async (ctx, args) => {
    const { startingPoint, parentalIncomeTier, cityTier } = args;

    // City cost multipliers
    const cityMultiplier = { low: 0.8, medium: 1.0, high: 1.5 }[cityTier];

    let cash = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let studentLoanDebt = 0;
    let careerLevel: string = "none";
    let educationLevel: string = "none";
    let jobTitle = "";
    let industry = "";
    let currentAge = 0;
    let health = 85;
    let happiness = 70;
    let inCollegeYearsRemaining = 0;

    if (startingPoint === "high_school") {
      currentAge = 16;
      cash = 500;
      monthlyIncome = 0;
      monthlyExpenses = Math.round(200 * cityMultiplier);
      educationLevel = "none";
      careerLevel = "none";
      happiness = 75;
      health = 90;
    } else if (startingPoint === "college") {
      currentAge = 18;
      const cashByTier = { low: 2000, middle: 8000, high: 20000 };
      cash = cashByTier[parentalIncomeTier];
      monthlyIncome = 500; // part-time job
      monthlyExpenses = Math.round(1200 * cityMultiplier);
      educationLevel = "none";
      careerLevel = "intern";
      jobTitle = "Part-time Worker";
      industry = "Retail";
      inCollegeYearsRemaining = 4;
      if (parentalIncomeTier === "low") {
        studentLoanDebt = 20000;
      } else if (parentalIncomeTier === "middle") {
        studentLoanDebt = 10000;
      }
      happiness = 72;
      health = 88;
    } else {
      // post_college
      currentAge = 22;
      const cashByTier = { low: 1000, middle: 3000, high: 5000 };
      cash = cashByTier[parentalIncomeTier];
      monthlyIncome = Math.round(3500 * cityMultiplier);
      monthlyExpenses = Math.round(2000 * cityMultiplier);
      educationLevel = "bachelor";
      careerLevel = "junior";
      jobTitle = "Junior Associate";
      industry = "Technology";
      if (parentalIncomeTier === "low") {
        studentLoanDebt = 45000;
      } else if (parentalIncomeTier === "middle") {
        studentLoanDebt = 25000;
      } else {
        studentLoanDebt = 5000;
      }
      happiness = 68;
      health = 85;
    }

    // Entrepreneurship skill based on personality
    let entrepreneurshipSkill = 10;
    if (args.personalityTrait === "risk_taker") entrepreneurshipSkill += 10;
    if (startingPoint === "post_college") entrepreneurshipSkill -= 5; // degree penalty

    const gameId = await ctx.db.insert("games", {
      displayName: args.displayName,
      startingPoint: args.startingPoint,
      parentalIncomeTier: args.parentalIncomeTier,
      personalityTrait: args.personalityTrait,
      cityTier: args.cityTier,
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
// END MONTH — The main simulation tick
// ═══════════════════════════════════════════════════
export const endMonth = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.gameStatus !== "active") return { status: "error" };

    let {
      cash,
      monthlyIncome,
      monthlyExpenses,
      studentLoanDebt,
      creditCardDebt,
      mortgageDebt,
      investmentPortfolio,
      realEstateValue,
      retirementAccount,
      lifetimeIncome,
      happiness,
      health,
      currentAge,
      currentMonth,
      activeEffects,
      spendingMultiplier,
      happinessHistory,
      healthHistory,
    } = game;

    // Apply active effects first
    const remainingEffects: typeof activeEffects = [];
    for (const effect of activeEffects) {
      if (effect.type === "income_boost") monthlyIncome += effect.value;
      if (effect.type === "expense_boost") monthlyExpenses += effect.value;
      if (effect.type === "happiness_drain") happiness += effect.value;
      if (effect.type === "health_drain") health += effect.value;
      const newMonths = effect.monthsRemaining - 1;
      if (newMonths > 0) {
        remainingEffects.push({ ...effect, monthsRemaining: newMonths });
      }
    }

    // Apply spending multiplier to expenses
    const effectiveExpenses = Math.round(monthlyExpenses * spendingMultiplier);

    // 1. Apply income - expenses
    cash += monthlyIncome - effectiveExpenses;

    // 2. Apply investment returns
    // Stocks: 0.8%/mo with ±3% random variance
    if (investmentPortfolio > 0) {
      const variance = (Math.random() * 6 - 3) / 100;
      const stockReturn = 0.008 + variance;
      investmentPortfolio = Math.round(investmentPortfolio * (1 + stockReturn));
    }

    // Real estate: +0.3%/mo
    if (realEstateValue > 0) {
      realEstateValue = Math.round(realEstateValue * 1.003);
    }

    // Retirement: +0.7%/mo
    if (retirementAccount > 0) {
      retirementAccount = Math.round(retirementAccount * 1.007);
    }

    // 3. Add to lifetime income
    lifetimeIncome += monthlyIncome;

    // 4. Apply debt interest
    if (studentLoanDebt > 0) {
      studentLoanDebt = Math.round(studentLoanDebt * 1.005);
    }
    if (creditCardDebt > 0) {
      creditCardDebt = Math.round(creditCardDebt * 1.018);
    }
    if (mortgageDebt > 0) {
      mortgageDebt = Math.round(mortgageDebt * 1.004);
    }

    // 5. Update health
    if (currentAge > 40) {
      health = Math.max(0, health - 0.05);
    }
    // Lifestyle modifier
    if (spendingMultiplier <= 0.85) {
      health = Math.min(100, health + 0.1);
    } else if (spendingMultiplier >= 1.25) {
      health = Math.max(0, health - 0.1);
    }

    // 6. Update happiness (financial stress)
    if (monthlyIncome > 0 && cash < 2 * effectiveExpenses) {
      happiness = Math.max(0, happiness - 2);
    }
    const totalDebt = studentLoanDebt + creditCardDebt + mortgageDebt;
    if (monthlyIncome > 0 && totalDebt > 5 * monthlyIncome * 12) {
      happiness = Math.max(0, happiness - 3);
    }

    // 7. Advance age/month
    let newMonth = currentMonth + 1;
    let newAge = currentAge;
    if (newMonth > 12) {
      newMonth = 1;
      newAge = currentAge + 1;
    }

    // 8. Record history snapshots
    const newHappinessHistory = [
      ...happinessHistory,
      { age: newAge, month: newMonth, value: Math.round(happiness) },
    ];
    const newHealthHistory = [
      ...healthHistory,
      { age: newAge, month: newMonth, value: Math.round(health) },
    ];

    // 9. Calculate net worth
    const netWorth =
      cash +
      investmentPortfolio +
      realEstateValue +
      retirementAccount -
      totalDebt;

    // 10. Roll for random event (20% base chance)
    let pendingEventData = undefined;
    const eventRoll = Math.random();
    if (eventRoll < 0.2) {
      // Fetch eligible event templates
      const templates = await ctx.db.query("eventTemplates").collect();
      const eligible = templates.filter((t) => {
        if (t.minAge !== undefined && newAge < t.minAge) return false;
        if (t.maxAge !== undefined && newAge > t.maxAge) return false;
        return true;
      });

      if (eligible.length > 0) {
        // Weighted random selection
        const totalWeight = eligible.reduce((sum, t) => sum + t.weight, 0);
        let rand = Math.random() * totalWeight;
        let selectedTemplate = eligible[0];
        for (const template of eligible) {
          rand -= template.weight;
          if (rand <= 0) {
            selectedTemplate = template;
            break;
          }
        }

        pendingEventData = {
          templateId: selectedTemplate._id.toString(),
          title: selectedTemplate.titleTemplate,
          body: selectedTemplate.bodyTemplate
            .replace("{displayName}", game.displayName)
            .replace("{age}", newAge.toString())
            .replace("{jobTitle}", game.jobTitle || "your job"),
          impactType: selectedTemplate.impactType,
          hasChoice: selectedTemplate.hasChoice,
          choiceAcceptOutcome: selectedTemplate.choiceAcceptOutcome,
          choiceDeclineOutcome: selectedTemplate.choiceDeclineOutcome,
        };
      }
    }

    // 11. Check milestones
    let checkMilestone = null;
    if (newAge >= 30 && !game.milestone30Done) {
      checkMilestone = 30;
    } else if (newAge >= 50 && !game.milestone50Done) {
      checkMilestone = 50;
    }

    // 12. Check end game
    let gameStatus: "active" | "complete" = game.gameStatus;
    if (newAge >= 75) {
      gameStatus = "complete";
    }

    await ctx.db.patch(args.gameId, {
      cash: Math.round(cash),
      monthlyIncome,
      monthlyExpenses,
      investmentPortfolio,
      realEstateValue,
      retirementAccount,
      lifetimeIncome,
      happiness: Math.min(100, Math.max(0, happiness)),
      health: Math.min(100, Math.max(0, health)),
      currentAge: newAge,
      currentMonth: newMonth,
      totalDebt: totalDebt,
      studentLoanDebt,
      creditCardDebt,
      mortgageDebt,
      netWorth,
      happinessHistory: newHappinessHistory.slice(-300), // keep last 300
      healthHistory: newHealthHistory.slice(-300),
      activeEffects: remainingEffects,
      pendingEventData: pendingEventData || undefined,
      gameStatus,
    });

    return {
      status: "ok",
      newAge,
      newMonth,
      hasEvent: !!pendingEventData,
      checkMilestone,
      isGameOver: gameStatus === "complete",
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
        const salaryMap = {
          intern: 1800,
          junior: 3500,
          mid: 5500,
          senior: 8000,
          manager: 10000,
          director: 15000,
          executive: 25000,
        };
        const targetLevel = decisionData.targetLevel as keyof typeof salaryMap;
        const newSalary = salaryMap[targetLevel] || 3500;
        // Career level progression check
        const careerOrder = [
          "none",
          "intern",
          "junior",
          "mid",
          "senior",
          "manager",
          "director",
          "executive",
          "business_owner",
        ];
        const currentIdx = careerOrder.indexOf(game.careerLevel);
        const targetIdx = careerOrder.indexOf(targetLevel);
        if (targetIdx > currentIdx + 2) {
          outcomeText = "Application rejected — need more experience!";
        } else {
          updates.monthlyIncome = newSalary;
          updates.careerLevel = targetLevel;
          updates.jobTitle = decisionData.jobTitle || "Professional";
          updates.industry = decisionData.industry || game.industry;
          outcomeText = `Got the job! New salary: $${newSalary.toLocaleString()}/mo`;
        }
        break;
      }

      case "request_raise": {
        const raiseChance = game.careerLevel === "none" ? 0 : 0.6;
        if (Math.random() < raiseChance) {
          const raiseAmount = Math.round(game.monthlyIncome * 0.1);
          updates.monthlyIncome = game.monthlyIncome + raiseAmount;
          outcomeText = `Raise approved! +$${raiseAmount.toLocaleString()}/mo`;
        } else {
          updates.happiness = Math.max(0, game.happiness - 5);
          outcomeText = "Raise denied. Maybe next time.";
        }
        break;
      }

      case "start_side_hustle": {
        updates.monthlyIncome = game.monthlyIncome + 500;
        updates.happiness = Math.max(0, game.happiness - 5);
        updates.activeEffects = [
          ...game.activeEffects,
          { type: "income_boost", value: 500, monthsRemaining: 12 },
        ];
        outcomeText = "Side hustle started! +$500/mo for 12 months";
        break;
      }

      case "enroll_education": {
        const educationCosts: Record<string, { monthly: number; years: number; resultLevel: string }> = {
          trade: { monthly: 500, years: 2, resultLevel: "trade" },
          associate: { monthly: 800, years: 2, resultLevel: "associate" },
          bachelor: { monthly: 1500, years: 4, resultLevel: "bachelor" },
          master: { monthly: 2000, years: 2, resultLevel: "master" },
          phd: { monthly: 1000, years: 5, resultLevel: "phd" },
          md: { monthly: 3000, years: 4, resultLevel: "md" },
          jd: { monthly: 2500, years: 3, resultLevel: "jd" },
        };
        const eduLevel = decisionData.level as string;
        const eduInfo = educationCosts[eduLevel];
        if (eduInfo) {
          updates.monthlyExpenses = game.monthlyExpenses + eduInfo.monthly;
          updates.inCollegeYearsRemaining = eduInfo.years;
          updates.studentLoanDebt =
            game.studentLoanDebt + eduInfo.monthly * 12 * eduInfo.years;
          updates.totalDebt = game.totalDebt + eduInfo.monthly * 12 * eduInfo.years;
          outcomeText = `Enrolled in ${eduLevel} program! +$${eduInfo.monthly}/mo expenses for ${eduInfo.years} years`;
        }
        break;
      }

      case "buy_house": {
        const homePrice = decisionData.price as number;
        const downPayment = Math.round(homePrice * 0.2);
        if (game.cash >= downPayment) {
          updates.cash = game.cash - downPayment;
          updates.mortgageDebt = homePrice - downPayment;
          updates.totalDebt = game.totalDebt + (homePrice - downPayment);
          updates.realEstateValue = homePrice;
          updates.monthlyExpenses = game.monthlyExpenses + Math.round((homePrice * 0.004));
          updates.happiness = Math.min(100, game.happiness + 10);
          outcomeText = `House purchased for $${homePrice.toLocaleString()}! Monthly mortgage: $${Math.round(homePrice * 0.004).toLocaleString()}/mo`;
        } else {
          outcomeText = `Not enough cash for $${downPayment.toLocaleString()} down payment!`;
        }
        break;
      }

      case "invest_stocks": {
        const amount = decisionData.amount as number;
        if (game.cash >= amount) {
          updates.cash = game.cash - amount;
          updates.investmentPortfolio = game.investmentPortfolio + amount;
          outcomeText = `Invested $${amount.toLocaleString()} in stocks!`;
        } else {
          outcomeText = "Insufficient funds to invest!";
        }
        break;
      }

      case "invest_retirement": {
        const amount = decisionData.amount as number;
        if (game.cash >= amount) {
          updates.cash = game.cash - amount;
          updates.retirementAccount = game.retirementAccount + amount;
          outcomeText = `Contributed $${amount.toLocaleString()} to retirement account!`;
        } else {
          outcomeText = "Insufficient funds!";
        }
        break;
      }

      case "pay_debt": {
        const amount = decisionData.amount as number;
        const debtType = decisionData.debtType as string;
        if (game.cash >= amount) {
          updates.cash = game.cash - amount;
          if (debtType === "student") {
            updates.studentLoanDebt = Math.max(0, game.studentLoanDebt - amount);
          } else if (debtType === "credit_card") {
            updates.creditCardDebt = Math.max(0, game.creditCardDebt - amount);
          } else if (debtType === "mortgage") {
            updates.mortgageDebt = Math.max(0, game.mortgageDebt - amount);
          }
          updates.totalDebt = Math.max(
            0,
            (updates.studentLoanDebt ?? game.studentLoanDebt) +
              (updates.creditCardDebt ?? game.creditCardDebt) +
              (updates.mortgageDebt ?? game.mortgageDebt)
          );
          updates.happiness = Math.min(100, game.happiness + 3);
          outcomeText = `Paid down $${amount.toLocaleString()} of ${debtType} debt!`;
        } else {
          outcomeText = "Not enough cash to pay debt!";
        }
        break;
      }

      case "set_lifestyle": {
        const multiplier = decisionData.multiplier as number;
        updates.spendingMultiplier = multiplier;
        const lifestyleLabels: Record<number, string> = {
          0.7: "Extreme Frugal",
          0.85: "Frugal",
          1.0: "Normal",
          1.15: "Comfortable",
          1.3: "Lavish",
        };
        outcomeText = `Lifestyle set to: ${lifestyleLabels[multiplier] || "Normal"}`;
        break;
      }

      case "get_credit_card": {
        const limit = 5000;
        updates.creditCardDebt = game.creditCardDebt + (decisionData.amount || 0);
        updates.cash = game.cash + (decisionData.amount || 0);
        updates.totalDebt = game.totalDebt + (decisionData.amount || 0);
        outcomeText = `Credit card debt increased. Be careful with interest!`;
        break;
      }
    }

    // Log decision
    const decisionsLog = [
      ...game.decisionsLog,
      {
        month: game.currentMonth,
        age: game.currentAge,
        decision: decisionType,
        outcome: outcomeText,
      },
    ];
    updates.decisionsLog = decisionsLog.slice(-100); // keep last 100

    // Recalculate net worth
    const newCash = updates.cash !== undefined ? updates.cash : game.cash;
    const newPortfolio =
      updates.investmentPortfolio !== undefined
        ? updates.investmentPortfolio
        : game.investmentPortfolio;
    const newRealEstate =
      updates.realEstateValue !== undefined
        ? updates.realEstateValue
        : game.realEstateValue;
    const newRetirement =
      updates.retirementAccount !== undefined
        ? updates.retirementAccount
        : game.retirementAccount;
    const newTotalDebt =
      updates.totalDebt !== undefined ? updates.totalDebt : game.totalDebt;
    updates.netWorth =
      newCash + newPortfolio + newRealEstate + newRetirement - newTotalDebt;

    await ctx.db.patch(args.gameId, updates);

    return { status: "ok", outcome: outcomeText };
  },
});

// ═══════════════════════════════════════════════════
// RESOLVE EVENT — when player responds to an event
// ═══════════════════════════════════════════════════
export const resolveEvent = mutation({
  args: {
    gameId: v.id("games"),
    choice: v.union(v.literal("accept"), v.literal("decline"), v.literal("none")),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.pendingEventData) return { status: "error" };

    const event = game.pendingEventData;
    const updates: Record<string, any> = {};

    // Parse impact type and apply effects
    const impact = event.impactType;
    const parts = impact.split(",");

    for (const part of parts) {
      const [key, val] = part.trim().split(":");
      const numVal = parseFloat(val || "0");

      if (key === "cash") updates.cash = (game.cash + numVal);
      if (key === "cash_pct") updates.cash = Math.round(game.cash * (1 + numVal / 100));
      if (key === "income_pct") {
        const delta = Math.round(game.monthlyIncome * (numVal / 100));
        updates.monthlyIncome = game.monthlyIncome + delta;
      }
      if (key === "income_zero") {
        updates.monthlyIncome = 0;
        updates.careerLevel = "none";
        updates.jobTitle = "Unemployed";
        // Will recover in activeEffects
        updates.activeEffects = [
          ...game.activeEffects,
          { type: "income_boost", value: game.monthlyIncome, monthsRemaining: 3 },
        ];
      }
      if (key === "happiness") updates.happiness = Math.min(100, Math.max(0, game.happiness + numVal));
      if (key === "health") updates.health = Math.min(100, Math.max(0, game.health + numVal));
      if (key === "expense") updates.monthlyExpenses = game.monthlyExpenses + numVal;
      if (key === "investment_pct") {
        updates.investmentPortfolio = Math.round(game.investmentPortfolio * (1 + numVal / 100));
        updates.retirementAccount = Math.round(game.retirementAccount * (1 + numVal / 100));
      }
      if (key === "realestate_pct") {
        updates.realEstateValue = Math.round(game.realEstateValue * (1 + numVal / 100));
      }
      if (key === "debt") {
        updates.creditCardDebt = game.creditCardDebt + numVal;
        updates.totalDebt = game.totalDebt + numVal;
      }
      if (key === "married") {
        updates.relationshipStatus = "married";
        updates.monthlyExpenses = game.monthlyExpenses + 300;
        updates.happiness = Math.min(100, game.happiness + 15);
      }
      if (key === "baby") {
        updates.dependents = game.dependents + 1;
        updates.monthlyExpenses = game.monthlyExpenses + 1200;
        updates.happiness = Math.min(100, game.happiness + 15);
      }
      if (key === "divorced") {
        updates.relationshipStatus = "divorced";
        updates.happiness = Math.max(0, game.happiness - 20);
        updates.cash = Math.round((game.cash) * 0.6); // split assets
      }
      if (key === "income_pct_temp") {
        updates.activeEffects = [
          ...(updates.activeEffects || game.activeEffects),
          { type: "income_boost", value: Math.round(game.monthlyIncome * numVal / 100), monthsRemaining: 12 },
        ];
      }
    }

    // Add to event log
    const eventLog = [
      ...game.eventLog,
      {
        month: game.currentMonth,
        age: game.currentAge,
        title: event.title,
        body: args.choice === "accept" ? event.choiceAcceptOutcome : args.choice === "decline" ? event.choiceDeclineOutcome : event.body,
        impact: impact,
      },
    ];
    updates.eventLog = eventLog.slice(-50);
    updates.pendingEventData = undefined;

    // Recalculate net worth
    const newCash = updates.cash !== undefined ? updates.cash : game.cash;
    const newPortfolio = updates.investmentPortfolio !== undefined ? updates.investmentPortfolio : game.investmentPortfolio;
    const newRealEstate = updates.realEstateValue !== undefined ? updates.realEstateValue : game.realEstateValue;
    const newRetirement = updates.retirementAccount !== undefined ? updates.retirementAccount : game.retirementAccount;
    const totalDebt = (updates.studentLoanDebt ?? game.studentLoanDebt) +
      (updates.creditCardDebt ?? game.creditCardDebt) +
      (updates.mortgageDebt ?? game.mortgageDebt);
    updates.totalDebt = totalDebt;
    updates.netWorth = newCash + newPortfolio + newRealEstate + newRetirement - totalDebt;

    await ctx.db.patch(args.gameId, updates);
    return { status: "ok" };
  },
});

// ═══════════════════════════════════════════════════
// END GAME — Calculate final score
// ═══════════════════════════════════════════════════
export const endGame = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;

    // Net worth score (40%): logarithmic scale
    let netWorthScore = 0;
    if (game.netWorth > 0) {
      if (game.netWorth >= 5_000_000) {
        netWorthScore = 150;
      } else if (game.netWorth >= 1_000_000) {
        netWorthScore = 100 + (game.netWorth - 1_000_000) / (4_000_000) * 50;
      } else {
        netWorthScore = Math.min(100, Math.log10(game.netWorth + 1) / Math.log10(1_000_000) * 100);
      }
    }

    // Lifetime income score (20%)
    let incomeScore = 0;
    if (game.lifetimeIncome >= 8_000_000) {
      incomeScore = 150;
    } else if (game.lifetimeIncome >= 3_000_000) {
      incomeScore = 100 + (game.lifetimeIncome - 3_000_000) / (5_000_000) * 50;
    } else {
      incomeScore = Math.min(100, game.lifetimeIncome / 3_000_000 * 100);
    }

    // Happiness quotient (30%): average of history
    const avgHappiness =
      game.happinessHistory.length > 0
        ? game.happinessHistory.reduce((s, h) => s + h.value, 0) / game.happinessHistory.length
        : 50;

    // Health at end (10%)
    const healthScore = game.health;

    // Composite score (weighted)
    const finalScore =
      netWorthScore * 0.4 +
      incomeScore * 0.2 +
      avgHappiness * 0.3 +
      healthScore * 0.1;

    // Grade
    let finalGrade = "F";
    if (finalScore >= 95) finalGrade = "A+";
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
      gameStatus: "complete",
      finalScore: Math.round(finalScore),
      finalGrade,
      completedAt: Date.now(),
    });

    // Upsert to leaderboard
    await ctx.db.insert("leaderboard", {
      gameId: args.gameId,
      displayName: game.displayName,
      startingPoint: game.startingPoint,
      parentalIncomeTier: game.parentalIncomeTier,
      finalScore: Math.round(finalScore),
      netWorth: game.netWorth,
      lifetimeIncome: game.lifetimeIncome,
      happinessQuotient: Math.round(avgHappiness),
      healthAtEnd: Math.round(game.health),
      grade: finalGrade,
      completedAt: Date.now(),
    });

    return {
      finalScore: Math.round(finalScore),
      finalGrade,
      netWorthScore: Math.round(netWorthScore),
      incomeScore: Math.round(incomeScore),
      happinessQuotient: Math.round(avgHappiness),
      healthScore: Math.round(healthScore),
    };
  },
});

// ═══════════════════════════════════════════════════
// SET MILESTONE NARRATIVE
// ═══════════════════════════════════════════════════
export const setMilestoneNarrative = mutation({
  args: {
    gameId: v.id("games"),
    age: v.number(),
    narrative: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;

    const updates: Record<string, any> = {};
    if (args.age === 30) {
      updates.milestone30Done = true;
      updates.milestoneNarrative30 = args.narrative;
    } else if (args.age === 50) {
      updates.milestone50Done = true;
      updates.milestoneNarrative50 = args.narrative;
    } else if (args.age === 75) {
      updates.milestoneNarrative75 = args.narrative;
    }

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
    if (!game) return { status: "error", message: "Game not found" };
    if (game.activeBusiness) return { status: "error", message: "Already have an active business" };
    if (game.cash < args.initialInvestment) return { status: "error", message: "Insufficient funds" };

    // Degree bonuses for entrepreneurship skill
    let bonusSkill = 0;
    const biz = args.businessTypeName.toLowerCase();
    if (game.educationLevel === "bachelor" && (biz.includes("saas") || biz.includes("dev"))) bonusSkill += 20;
    if ((game.educationLevel === "bachelor" || game.educationLevel === "master") && biz.includes("bookkeep")) bonusSkill += 15;
    if (game.educationLevel === "bachelor" && biz.includes("marketing")) bonusSkill += 10;
    if (game.educationLevel === "trade") bonusSkill += 25;
    if (game.educationLevel === "master") bonusSkill -= 5; // MBA penalty

    const newEntrepreneurshipSkill = Math.min(100, game.entrepreneurshipSkill + 3 + bonusSkill);

    await ctx.db.patch(args.gameId, {
      cash: game.cash - args.initialInvestment,
      entrepreneurshipSkill: newEntrepreneurshipSkill,
      activeBusiness: {
        businessTypeId: args.businessTypeId,
        businessTypeName: args.businessTypeName,
        stage: "small_test",
        monthsActive: 0,
        monthlyRevenue: 0,
        monthlyExpenses: Math.round(args.initialInvestment * 0.3),
        totalInvested: args.initialInvestment,
        marketingActionsThisMonth: 0,
      },
    });

    return { status: "ok", message: `${args.businessTypeName} launched! Entrepreneurship +${3 + bonusSkill}` };
  },
});

export const doMarketingAction = mutation({
  args: {
    gameId: v.id("games"),
    actionType: v.string(),
    cost: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.activeBusiness) return { status: "error", message: "No active business" };
    if (game.cash < args.cost) return { status: "error", message: "Insufficient funds" };

    // Marketing skill gains (even failed actions give skill)
    const skillGain = Math.floor(Math.random() * 4) + 2; // 2-5 points
    const newMarketingSkill = Math.min(100, game.marketingSkill + skillGain);

    // Small chance of immediate revenue boost based on marketing skill
    const successChance = (game.marketingSkill + skillGain) / 200; // 0-50% based on skill
    let revenueBoost = 0;
    if (Math.random() < successChance) {
      revenueBoost = Math.round(game.activeBusiness.monthlyRevenue * 0.15 + 100);
    }

    const updatedBusiness = {
      ...game.activeBusiness,
      monthlyRevenue: game.activeBusiness.monthlyRevenue + revenueBoost,
      marketingActionsThisMonth: game.activeBusiness.marketingActionsThisMonth + 1,
    };

    await ctx.db.patch(args.gameId, {
      cash: game.cash - args.cost,
      marketingSkill: newMarketingSkill,
      activeBusiness: updatedBusiness,
    });

    const outcome = revenueBoost > 0
      ? `Marketing worked! Revenue +$${revenueBoost}/mo. Marketing skill +${skillGain}`
      : `No immediate results, but Marketing skill +${skillGain}. Keep going!`;

    return { status: "ok", message: outcome, skillGain, revenueBoost };
  },
});

export const advanceBusinessMonth = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.activeBusiness) return;

    const biz = game.activeBusiness;
    const monthsActive = biz.monthsActive + 1;

    // Stage progression
    let stage = biz.stage;
    let monthlyRevenue = biz.monthlyRevenue;
    let monthlyExpenses = biz.monthlyExpenses;
    let outcome = "continue";
    let failureReason = "";

    // Success probability: based on entrepreneurship + marketing skill
    const successProb = (game.entrepreneurshipSkill * 0.4 + game.marketingSkill * 0.6) / 100;

    if (stage === "small_test") {
      // Random revenue growth based on marketing
      const growthBase = (game.marketingSkill / 100) * 500;
      monthlyRevenue = Math.round(biz.monthlyRevenue + growthBase * (0.5 + Math.random()));

      if (monthsActive >= 3) {
        // After 3 months decide: fail or grow
        const failChance = 0.7 - successProb * 0.3; // 40-70% fail in small test
        if (Math.random() < failChance) {
          stage = "failed";
          outcome = "failed";
          failureReason = "Product-market fit not found in initial test phase.";
        } else {
          stage = "growing";
        }
      }
    } else if (stage === "growing") {
      // Revenue grows 5-20% per month during growing phase
      const growthRate = 0.05 + (game.marketingSkill / 100) * 0.15;
      monthlyRevenue = Math.round(biz.monthlyRevenue * (1 + growthRate));
      monthlyExpenses = Math.round(biz.monthlyExpenses * 1.05); // costs scale too

      if (monthsActive >= 24) {
        stage = "established";
      }

      // Random failure during growth
      const failChance = 0.03 * (1 - successProb * 0.5);
      if (Math.random() < failChance) {
        stage = "failed";
        outcome = "failed";
        failureReason = "Growth stalled. Couldn't scale past early traction.";
      }
    } else if (stage === "established") {
      // Grinding phase — stable but possibility of breakout
      const growthRate = 0.02 + (game.marketingSkill / 100) * 0.05;
      monthlyRevenue = Math.round(biz.monthlyRevenue * (1 + growthRate));

      // Breakout check (increases with skill)
      const breakoutChance = successProb * 0.05; // 0-5% per month
      if (Math.random() < breakoutChance) {
        stage = "success_breakout";
        monthlyRevenue = Math.round(monthlyRevenue * 3); // 3x surge on breakout
        outcome = "breakout";
      }

      // Established businesses can still fail (5% base)
      const failChance = 0.015 * (1 - successProb * 0.5);
      if (Math.random() < failChance && stage !== "success_breakout") {
        stage = "failed";
        outcome = "failed";
        failureReason = "Lost key clients and couldn't replace the revenue.";
      }
    } else if (stage === "success_breakout") {
      // Exponential growth phase
      monthlyRevenue = Math.round(biz.monthlyRevenue * 1.15);
    }

    // Entrepreneurship skill decays slightly with years in career
    const yearBonus = Math.floor(monthsActive / 36); // every 3 years active
    const newEntrepreneurshipSkill = Math.max(0, game.entrepreneurshipSkill - (yearBonus > 0 ? 1 : 0));

    // Reset marketing actions counter
    const updatedBusiness = {
      ...biz,
      stage,
      monthsActive,
      monthlyRevenue,
      monthlyExpenses,
      marketingActionsThisMonth: 0,
    };

    if (outcome === "failed") {
      // Business failed — add to history, gain skill
      const skillGain = Math.floor(Math.random() * 6) + 3; // 3-8 points
      const businessHistory = [
        ...game.businessHistory,
        {
          businessTypeName: biz.businessTypeName,
          stage: biz.stage,
          monthsActive,
          peakRevenue: biz.monthlyRevenue,
          outcome: failureReason,
        },
      ];

      await ctx.db.patch(args.gameId, {
        activeBusiness: undefined,
        businessHistory,
        entrepreneurshipSkill: Math.min(100, game.entrepreneurshipSkill + skillGain),
      });

      return { status: "failed", failureReason, skillGain };
    }

    await ctx.db.patch(args.gameId, {
      activeBusiness: updatedBusiness,
      entrepreneurshipSkill: newEntrepreneurshipSkill,
    });

    return { status: outcome, monthlyRevenue, stage };
  },
});

export const closeBusiness = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.activeBusiness) return;

    const businessHistory = [
      ...game.businessHistory,
      {
        businessTypeName: game.activeBusiness.businessTypeName,
        stage: game.activeBusiness.stage,
        monthsActive: game.activeBusiness.monthsActive,
        peakRevenue: game.activeBusiness.monthlyRevenue,
        outcome: "Voluntarily closed",
      },
    ];

    await ctx.db.patch(args.gameId, {
      activeBusiness: undefined,
      businessHistory,
      entrepreneurshipSkill: Math.min(100, game.entrepreneurshipSkill + 3),
    });
  },
});
