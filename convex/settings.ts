import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").collect();
    const result: Record<string, string> = {};
    settings.forEach((s) => {
      result[s.key] = s.value || "";
    });
    return result;
  },
});

export const update = mutation({
  args: { settings: v.any() },
  handler: async (ctx, args) => {
    for (const [key, value] of Object.entries(args.settings)) {
      const existing = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { value: String(value), updated_at: Date.now() });
      } else {
        await ctx.db.insert("settings", {
          key,
          value: String(value),
          updated_at: Date.now(),
        });
      }
    }
  },
});
