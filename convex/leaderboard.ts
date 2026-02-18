import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLeaderboard = query({
  args: {
    startingPoint: v.optional(v.string()),
    parentalIncomeTier: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let entries = await ctx.db.query("leaderboard").collect();

    if (args.startingPoint && args.startingPoint !== "all") {
      entries = entries.filter((e) => e.startingPoint === args.startingPoint);
    }
    if (args.parentalIncomeTier && args.parentalIncomeTier !== "all") {
      entries = entries.filter(
        (e) => e.parentalIncomeTier === args.parentalIncomeTier
      );
    }

    // Sort by finalScore descending
    entries.sort((a, b) => b.finalScore - a.finalScore);

    // Return top N
    return entries.slice(0, args.limit || 100);
  },
});
