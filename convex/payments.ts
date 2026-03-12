import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").order("desc").collect();
    return await Promise.all(
      payments.map(async (p) => {
        const doctor = await ctx.db.get(p.doctor_id);
        const invoice = p.invoice_id ? await ctx.db.get(p.invoice_id) : null;
        return {
          ...p,
          doctor_name: doctor?.name || "Unknown",
          invoice_no: invoice?.invoice_no || null,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    doctor_id: v.id("doctors"),
    invoice_id: v.optional(v.id("invoices")),
    amount: v.number(),
    payment_method: v.string(),
    reference_no: v.optional(v.string()),
    payment_date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      ...args,
      created_at: Date.now(),
    });
    
    if (args.invoice_id) {
      const invoice = await ctx.db.get(args.invoice_id);
      if (invoice) {
        // Recalculate invoice status
        const allPayments = await ctx.db
          .query("payments")
          .withIndex("by_doctor", (q) => q.eq("doctor_id", args.doctor_id))
          .collect();
          
        const invoicePayments = allPayments.filter(p => p.invoice_id === args.invoice_id);
        const totalPaid = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
        
        let newStatus = "Unpaid";
        if (totalPaid >= invoice.amount) {
          newStatus = "Paid";
        } else if (totalPaid > 0) {
          newStatus = "Partial";
        }
        
        await ctx.db.patch(args.invoice_id, { status: newStatus });
      }
    }
    
    return paymentId;
  },
});

export const getByDoctor = query({
  args: { doctor_id: v.id("doctors"), startDate: v.optional(v.string()), endDate: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let payments = await ctx.db
      .query("payments")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", args.doctor_id))
      .order("desc")
      .collect();
      
    if (args.startDate) {
      payments = payments.filter(p => p.payment_date >= args.startDate!);
    }
    if (args.endDate) {
      payments = payments.filter(p => p.payment_date <= args.endDate!);
    }
    
    return payments;
  },
});
