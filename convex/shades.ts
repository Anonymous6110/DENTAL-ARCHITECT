import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shades").order("desc").collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shades")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("shades", {
      ...args,
      created_at: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("shades") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
