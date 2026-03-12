import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return await Promise.all(users.map(async (user) => {
      if (user.doctor_id) {
        const doctor = await ctx.db.get(user.doctor_id);
        return { ...user, doctor_name: doctor?.name };
      }
      return user;
    }));
  },
});

export const create = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    role: v.string(),
    doctor_id: v.optional(v.id("doctors")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    if (existing) throw new Error("Username already exists");
    
    return await ctx.db.insert("users", {
      ...args,
      created_at: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
