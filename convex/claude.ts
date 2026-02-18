import { action } from "./_generated/server";
import { v } from "convex/values";

export const getMilestoneSummary = action({
  args: {
    gameId: v.string(),
    age: v.number(),
    displayName: v.string(),
    startingPoint: v.string(),
    parentalIncomeTier: v.string(),
    currentCash: v.number(),
    netWorth: v.number(),
    monthlyIncome: v.number(),
    lifetimeIncome: v.number(),
    happiness: v.number(),
    health: v.number(),
    careerLevel: v.string(),
    educationLevel: v.string(),
    relationshipStatus: v.string(),
    dependents: v.number(),
    jobTitle: v.string(),
    industry: v.string(),
    totalDebt: v.number(),
    studentLoanDebt: v.number(),
    mortgageDebt: v.number(),
    investmentPortfolio: v.number(),
    retirementAccount: v.number(),
    realEstateValue: v.number(),
    recentEvents: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return generateFallbackNarrative(args);
    }

    const prompt = buildMilestonePrompt(args);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 400,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        return generateFallbackNarrative(args);
      }

      const data = await response.json() as any;
      return data.content[0].text;
    } catch (e) {
      return generateFallbackNarrative(args);
    }
  },
});

function buildMilestonePrompt(args: {
  age: number;
  displayName: string;
  startingPoint: string;
  parentalIncomeTier: string;
  netWorth: number;
  monthlyIncome: number;
  lifetimeIncome: number;
  happiness: number;
  health: number;
  careerLevel: string;
  educationLevel: string;
  relationshipStatus: string;
  dependents: number;
  jobTitle: string;
  industry: string;
  totalDebt: number;
  recentEvents: string[];
}): string {
  const startLabel = {
    high_school: "high school",
    college: "college",
    post_college: "college graduate",
  }[args.startingPoint] || args.startingPoint;

  const parentLabel = {
    low: "low-income",
    middle: "middle-class",
    high: "wealthy",
  }[args.parentalIncomeTier] || args.parentalIncomeTier;

  return `You are narrating a retro video game milestone screen for a financial life simulation.

Write a SHORT (3-4 sentences, max 200 words) dramatic narrative summary of this player's life journey reaching age ${args.age}.

Player: ${args.displayName}
Background: Started from ${parentLabel} family, began game at ${startLabel}
Current status at age ${args.age}:
- Job: ${args.jobTitle} (${args.careerLevel} level, ${args.industry} industry)
- Education: ${args.educationLevel}
- Net Worth: $${args.netWorth.toLocaleString()}
- Monthly Income: $${args.monthlyIncome.toLocaleString()}
- Lifetime Earnings: $${args.lifetimeIncome.toLocaleString()}
- Happiness: ${args.happiness}/100
- Health: ${args.health}/100
- Relationship: ${args.relationshipStatus}, ${args.dependents} dependents
- Debt: $${args.totalDebt.toLocaleString()}
- Recent life events: ${args.recentEvents.slice(-3).join(", ")}

Write this as if it's an 8-bit RPG narrator summarizing a life. Be vivid, specific, slightly poetic. Acknowledge hardships and victories. Keep it under 200 words. Start with the player's name.`;
}

function generateFallbackNarrative(args: {
  age: number;
  displayName: string;
  netWorth: number;
  happiness: number;
  health: number;
  careerLevel: string;
  jobTitle: string;
  relationshipStatus: string;
}): string {
  const netWorthTier =
    args.netWorth > 1_000_000
      ? "wealthy"
      : args.netWorth > 100_000
      ? "comfortable"
      : args.netWorth > 0
      ? "modest"
      : "struggling";

  const happinessTier =
    args.happiness > 70 ? "fulfilled" : args.happiness > 40 ? "content" : "searching for more";

  const narratives = {
    30: `${args.displayName} stands at the threshold of their 30s — a decade of growth, struggle, and discovery behind them. Working as ${args.jobTitle}, they've built a ${netWorthTier} foundation. ${args.happiness > 60 ? "The choices they made resonated with who they wanted to be." : "Not every choice was easy, but each one shaped who they are."} The journey is far from over.`,
    50: `Half a century of life has carved ${args.displayName} into who they are today. Their ${netWorthTier} financial position reflects decades of decisions — some brilliant, some painful. As ${args.jobTitle}, they've ${args.happiness > 60 ? "found meaning in their work." : "kept pushing through the daily grind."} At ${args.age}, they stand ${happinessTier}, eyes forward.`,
    75: `${args.displayName} reaches the final chapter. A lifetime of work as ${args.jobTitle}, a ${netWorthTier} legacy, and a spirit that endured. ${args.health > 60 ? "Their health carried them through." : "Their body bears the marks of a life fully lived."} ${args.relationshipStatus === "married" ? "Love found them along the way." : "They walked their own path."} The ledger of life is complete.`,
  };

  return narratives[args.age as 30 | 50 | 75] || `${args.displayName} reaches age ${args.age}. The journey continues.`;
}
