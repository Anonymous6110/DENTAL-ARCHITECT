import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
  },
});

export const createDoctorUser = mutation({
  args: {
    username: v.string(),
    password: v.string(), // hashed on client or server? Usually server but Convex is serverless.
    doctor_id: v.id("doctors"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    if (existing) throw new Error("Username already exists");
    
    return await ctx.db.insert("users", {
      ...args,
      role: "Doctor",
      created_at: Date.now(),
    });
  },
});

export const getDoctorUser = query({
  args: { doctor_id: v.id("doctors") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("doctor_id"), args.doctor_id))
      .first();
  },
});

export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // Check if any users exist, if not create default admin
    const anyUser = await ctx.db.query("users").first();
    if (!anyUser) {
      await ctx.db.insert("users", {
        username: "admin",
        password: "admin123", // In a real app, this should be hashed
        role: "Admin",
        created_at: Date.now(),
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (user && user.password === args.password) {
      return user;
    }
    return null;
  },
});
