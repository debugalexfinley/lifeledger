import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { generatePartner, calcDivorceRisk, partnerIncomeBoost, partnerExpenseChange } from "./gameHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// TALK TO PERSON — first step of organic encounter
// Communication skill check; reduces Fear of Rejection regardless of outcome.
// ─────────────────────────────────────────────────────────────────────────────
export const talkToPerson = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.pendingDateOffer) return { status: "error" };

    const comm = game.communicationSkill ?? 20;
    const foR = game.fearOfRejection ?? 60;

    // 10-80% success range based on comm skill
    const success = Math.random() < (comm / 100) * 0.7 + 0.1;

    const updatedOffer = { ...game.pendingDateOffer, hasBeenTalkedTo: true };

    await ctx.db.patch(args.gameId, {
      pendingDateOffer: updatedOffer,
      communicationSkill: Math.min(100, comm + (success ? 3 : 2)),
      fearOfRejection: Math.max(0, foR - (success ? 3 : 2)),
    });

    return {
      status: "ok",
      success,
      message: success
        ? "Good conversation! The energy is definitely there. Ask them out?"
        : "A bit awkward, but you broke the ice. Ask them out anyway.",
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// ASK THEM OUT — requires low-ish Fear of Rejection OR prior talk
// ─────────────────────────────────────────────────────────────────────────────
export const askThemOut = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.pendingDateOffer) return { status: "error" };

    const comm = game.communicationSkill ?? 20;
    const foR = game.fearOfRejection ?? 60;
    const offer = game.pendingDateOffer;

    // FoR gate: if high fear and haven't talked, chance is halved
    const fearPenalty = foR > 65 && !offer.hasBeenTalkedTo ? 0.5 : 1.0;
    const attractPenalty = offer.attractiveness > 8 ? 0.75 : 1.0;
    const successChance =
      Math.max(0.05, (comm / 100) * 0.65 + 0.12) * fearPenalty * attractPenalty;

    const success = Math.random() < successChance;

    if (success) {
      const newPartner = {
        name: offer.name,
        traits: offer.traits,
        career: offer.career,
        monthlyIncome: offer.monthlyIncome,
        attractiveness: offer.attractiveness,
        iq: offer.iq,
        ambition: offer.ambition,
        emotionalStability: offer.emotionalStability,
        financialResponsibility: offer.financialResponsibility,
        compatibilityScore: offer.compatibilityScore,
        monthsTogether: 0,
        compatibilityRevealed: false,
        status: "dating" as const,
      };

      await ctx.db.patch(args.gameId, {
        currentPartner: newPartner,
        pendingDateOffer: undefined,
        relationshipStatus: "dating",
        communicationSkill: Math.min(100, comm + 3),
        fearOfRejection: Math.max(0, foR - 5),
        happiness: Math.min(100, (game.happiness ?? 50) + 8),
      });

      return {
        status: "ok",
        success: true,
        message: `${offer.name} said YES! 🎉 You're officially dating.`,
      };
    } else {
      const harshRejection = Math.random() < 0.3;
      await ctx.db.patch(args.gameId, {
        pendingDateOffer: undefined,
        communicationSkill: Math.min(100, comm + 2),
        fearOfRejection: Math.min(100, foR + (harshRejection ? 5 : 2)),
        happiness: Math.max(0, (game.happiness ?? 50) - (harshRejection ? 5 : 2)),
      });

      return {
        status: "ok",
        success: false,
        message: harshRejection
          ? `${offer.name} was not interested. Oof. (+5 Fear of Rejection, +2 Communication Skill)`
          : `${offer.name} passed. Not a match. (+2 FoR, +2 Comm Skill)`,
      };
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// DECLINE DATE OFFER — walk away from the encounter
// ─────────────────────────────────────────────────────────────────────────────
export const declineDateOffer = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;
    await ctx.db.patch(args.gameId, { pendingDateOffer: undefined });
    return { status: "ok" };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SELECT ONLINE MATCH — choose one from pending matches batch
// ─────────────────────────────────────────────────────────────────────────────
export const selectOnlineMatch = mutation({
  args: {
    gameId: v.id("games"),
    matchIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.pendingMatches) return { status: "error" };

    const match = game.pendingMatches[args.matchIndex];
    if (!match) return { status: "error" };

    const newPartner = {
      name: match.name,
      traits: match.traits,
      career: match.career,
      monthlyIncome: match.monthlyIncome,
      attractiveness: match.attractiveness,
      iq: match.iq,
      ambition: match.ambition,
      emotionalStability: match.emotionalStability,
      financialResponsibility: match.financialResponsibility,
      compatibilityScore: match.compatibilityScore,
      monthsTogether: 0,
      compatibilityRevealed: false,
      status: "dating" as const,
    };

    await ctx.db.patch(args.gameId, {
      currentPartner: newPartner,
      pendingMatches: undefined,
      relationshipStatus: "dating",
      communicationSkill: Math.min(100, (game.communicationSkill ?? 20) + 2),
      happiness: Math.min(100, (game.happiness ?? 50) + 6),
    });

    return {
      status: "ok",
      message: `You matched with ${match.name}! You're now dating. 💕`,
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SKIP ALL MATCHES — pass on the current batch
// ─────────────────────────────────────────────────────────────────────────────
export const skipAllMatches = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;
    await ctx.db.patch(args.gameId, { pendingMatches: undefined });
    return { status: "ok" };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// PROPOSE MARRIAGE — requires 6+ months dating
// ─────────────────────────────────────────────────────────────────────────────
export const proposeMarriage = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.currentPartner) return { status: "error" };

    const partner = game.currentPartner;
    if (partner.monthsTogether < 6) {
      return {
        status: "error",
        message: "Date for at least 6 months before proposing.",
      };
    }

    // Acceptance depends on compatibility score
    const acceptChance = (partner.compatibilityScore / 100) * 0.75 + 0.15;
    const accepted = Math.random() < acceptChance;

    if (accepted) {
      const incomeBoost = partnerIncomeBoost(partner);
      const expChange = partnerExpenseChange(partner);

      const updatedPartner = { ...partner, status: "married" as const };

      const decisionsLog = [
        ...game.decisionsLog,
        {
          month: game.currentMonth,
          age: game.currentAge,
          decision: "propose_marriage",
          outcome: `Married ${partner.name}! Income +$${incomeBoost.toLocaleString()}/mo`,
        },
      ].slice(-100);

      await ctx.db.patch(args.gameId, {
        currentPartner: updatedPartner,
        relationshipStatus: "married",
        happiness: Math.min(100, (game.happiness ?? 50) + 15),
        monthlyIncome: game.monthlyIncome + incomeBoost,
        monthlyExpenses: game.monthlyExpenses + expChange,
        decisionsLog,
      });

      const divorceRisk = calcDivorceRisk(partner);
      return {
        status: "ok",
        success: true,
        message: `${partner.name} said YES! 💍 Married!`,
        divorceRisk,
        incomeBoost,
        expChange,
      };
    } else {
      await ctx.db.patch(args.gameId, {
        happiness: Math.max(0, (game.happiness ?? 50) - 8),
        fearOfRejection: Math.min(100, (game.fearOfRejection ?? 60) + 8),
      });
      return {
        status: "ok",
        success: false,
        message: `${partner.name} isn't ready yet. Give it more time.`,
      };
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// BREAK UP / DIVORCE
// ─────────────────────────────────────────────────────────────────────────────
export const breakUp = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || !game.currentPartner) return { status: "error" };

    const partner = game.currentPartner;
    const wasMarried = partner.status === "married";

    const newHistory = [
      ...(game.datingHistory ?? []),
      {
        name: partner.name,
        monthsTogether: partner.monthsTogether,
        outcome: wasMarried ? "divorced" : "broke_up",
      },
    ];

    const updates: Record<string, any> = {
      currentPartner: undefined,
      relationshipStatus: wasMarried ? "divorced" : "single",
      happiness: Math.max(0, (game.happiness ?? 50) - (wasMarried ? 20 : 10)),
      datingHistory: newHistory,
    };

    if (wasMarried) {
      // Divorce: rough split of liquid assets; undo income boost
      updates.cash = Math.round((game.cash ?? 0) * 0.6);
      const incomeToRemove = partnerIncomeBoost(partner);
      updates.monthlyIncome = Math.max(0, game.monthlyIncome - incomeToRemove);
    }

    const decisionsLog = [
      ...game.decisionsLog,
      {
        month: game.currentMonth,
        age: game.currentAge,
        decision: wasMarried ? "divorce" : "break_up",
        outcome: wasMarried
          ? `Divorced ${partner.name}. Assets split.`
          : `Broke up with ${partner.name}.`,
      },
    ].slice(-100);
    updates.decisionsLog = decisionsLog;

    await ctx.db.patch(args.gameId, updates);

    return {
      status: "ok",
      message: wasMarried
        ? `Divorce finalized. ${partner.name} is gone. Assets split 60/40.`
        : `You and ${partner.name} broke up. Onwards.`,
    };
  },
});
