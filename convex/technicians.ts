import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("technicians").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    specialization: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("technicians", {
      ...args,
      created_at: Date.now(),
    });
  },
});
