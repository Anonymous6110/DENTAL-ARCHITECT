import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const cases = await ctx.db.query("cases").order("desc").collect();
    return await Promise.all(
      cases.map(async (c) => {
        const doctor = await ctx.db.get(c.doctor_id);
        const technician = c.technician_id ? await ctx.db.get(c.technician_id) : null;
        return {
          ...c,
          doctor_name: doctor?.name || "Unknown",
          technician_name: technician?.name || "Unassigned",
        };
      })
    );
  },
});

export const get = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.id);
    if (!c) return null;
    const doctor = await ctx.db.get(c.doctor_id);
    const technician = c.technician_id ? await ctx.db.get(c.technician_id) : null;
    return {
      ...c,
      doctor_name: doctor?.name || "Unknown",
      technician_name: technician?.name || "Unassigned",
    };
  },
});

export const create = mutation({
  args: {
    doctor_id: v.id("doctors"),
    technician_id: v.optional(v.id("technicians")),
    patient_name: v.string(),
    case_type: v.string(),
    material: v.optional(v.string()),
    shade: v.optional(v.string()),
    selected_teeth: v.optional(v.string()),
    priority: v.string(),
    status: v.string(),
    receiving_date: v.string(),
    due_date: v.optional(v.string()),
    delivery_date: v.optional(v.string()),
    cost: v.number(),
    notes: v.optional(v.string()),
    image_url: v.optional(v.string()),
    preparation_type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caseId = await ctx.db.insert("cases", {
      ...args,
      created_at: Date.now(),
    });
    
    await ctx.db.insert("case_history", {
      case_id: caseId,
      status: args.status,
      comment: "Case created",
      updated_at: Date.now(),
    });
    
    return caseId;
  },
});

export const update = mutation({
  args: {
    id: v.id("cases"),
    status: v.optional(v.string()),
    technician_id: v.optional(v.id("technicians")),
    patient_name: v.optional(v.string()),
    case_type: v.optional(v.string()),
    material: v.optional(v.string()),
    shade: v.optional(v.string()),
    selected_teeth: v.optional(v.string()),
    priority: v.optional(v.string()),
    due_date: v.optional(v.string()),
    receiving_date: v.optional(v.string()),
    delivery_date: v.optional(v.string()),
    cost: v.optional(v.number()),
    notes: v.optional(v.string()),
    image_url: v.optional(v.string()),
    preparation_type: v.optional(v.string()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, comment, ...rest } = args;
    const oldCase = await ctx.db.get(id);
    if (!oldCase) throw new Error("Case not found");
    
    await ctx.db.patch(id, rest);
    
    if (args.status && args.status !== oldCase.status) {
      await ctx.db.insert("case_history", {
        case_id: id,
        status: args.status,
        comment: comment || `Status updated to ${args.status}`,
        updated_at: Date.now(),
      });
    }
  },
});

export const getHistory = query({
  args: { case_id: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("case_history")
      .withIndex("by_case", (q) => q.eq("case_id", args.case_id))
      .order("desc")
      .collect();
  },
});

export const getUninvoiced = query({
  args: { doctor_id: v.id("doctors") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", args.doctor_id))
      .filter((q) => q.eq(q.field("is_invoiced"), false))
      .collect();
  },
});
