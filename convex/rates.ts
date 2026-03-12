import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rate_list").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    case_type: v.string(),
    material: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rate_list", {
      ...args,
      created_at: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("rate_list") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
