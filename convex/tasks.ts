import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByCase = query({
  args: { case_id: v.id("cases") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("case_tasks")
      .withIndex("by_case", (q) => q.eq("case_id", args.case_id))
      .collect();
    
    return await Promise.all(
      tasks.map(async (t) => {
        const technician = await ctx.db.get(t.technician_id);
        return {
          ...t,
          technician_name: technician?.name || "Unknown",
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    case_id: v.id("cases"),
    technician_id: v.id("technicians"),
    task_name: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("case_tasks", {
      ...args,
      created_at: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("case_tasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
