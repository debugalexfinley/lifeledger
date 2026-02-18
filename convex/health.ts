import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────────────────────
// SET HEALTH HABIT — update one persistent setting
// ─────────────────────────────────────────────────────────────────────────────
export const setHealthHabit = mutation({
  args: {
    gameId: v.id("games"),
    habitType: v.union(
      v.literal("exercise"),
      v.literal("diet"),
      v.literal("sleep"),
      v.literal("stressManagement"),
      v.literal("preventiveCare")
    ),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error" };

    const patch: Record<string, unknown> = {};
    switch (args.habitType) {
      case "exercise":
        patch.exerciseHabit = args.value;
        break;
      case "diet":
        patch.dietHabit = args.value;
        break;
      case "sleep":
        patch.sleepHabit = args.value;
        break;
      case "stressManagement":
        patch.stressManagement = args.value;
        break;
      case "preventiveCare":
        patch.preventiveCare = args.value === "true";
        break;
    }

    await ctx.db.patch(args.gameId, patch as any);
    return { status: "ok" };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE ONLINE DATING
// ─────────────────────────────────────────────────────────────────────────────
export const toggleOnlineDating = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return { status: "error" };
    const newState = !(game.onlineDatingActive ?? false);
    await ctx.db.patch(args.gameId, { onlineDatingActive: newState });
    return { status: "ok", active: newState };
  },
});
