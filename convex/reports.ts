import { v } from "convex/values";
import { query } from "./_generated/server";

export const financialSummary = query({
  args: {},
  handler: async (ctx) => {
    const cases = await ctx.db.query("cases").collect();
    const payments = await ctx.db.query("payments").collect();
    const expenses = await ctx.db.query("expenses").collect();
    
    const revenue = cases.reduce((sum, c) => sum + (c.status !== "Returned" ? c.cost : 0), 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    return {
      total_revenue: revenue,
      total_payments: totalPayments,
      total_expenses: totalExpenses,
      net_profit: revenue - totalExpenses,
    };
  },
});

export const doctorStats = query({
  args: {},
  handler: async (ctx) => {
    const doctors = await ctx.db.query("doctors").collect();
    const cases = await ctx.db.query("cases").collect();
    
    return doctors.map(d => {
      const doctorCases = cases.filter(c => c.doctor_id === d._id);
      return {
        id: d._id,
        name: d.name,
        clinic_name: d.clinic_name,
        total_cases: doctorCases.length,
        completed_cases: doctorCases.filter(c => c.status === "Completed" || c.status === "Delivered").length,
        active_cases: doctorCases.filter(c => ["Pending", "In Progress", "Trial"].includes(c.status)).length,
      };
    }).sort((a, b) => b.total_cases - a.total_cases);
  },
});

export const dailyStats = query({
  args: {},
  handler: async (ctx) => {
    const cases = await ctx.db.query("cases").collect();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    const recentCases = cases.filter(c => c.created_at >= thirtyDaysAgo);
    const statsMap = new Map<string, number>();
    
    recentCases.forEach(c => {
      const date = new Date(c.created_at).toISOString().split("T")[0];
      statsMap.set(date, (statsMap.get(date) || 0) + 1);
    });
    
    return Array.from(statsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const typeStats = query({
  args: {},
  handler: async (ctx) => {
    const cases = await ctx.db.query("cases").collect();
    const statsMap = new Map<string, number>();
    
    cases.forEach(c => {
      statsMap.set(c.case_type, (statsMap.get(c.case_type) || 0) + 1);
    });
    
    return Array.from(statsMap.entries())
      .map(([case_type, count]) => ({ case_type, count }))
      .sort((a, b) => b.count - a.count);
  },
});

export const getLedgerStats = query({
  args: { doctor_id: v.id("doctors") },
  handler: async (ctx, args) => {
    const cases = await ctx.db
      .query("cases")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", args.doctor_id))
      .collect();

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_doctor", (q) => q.eq("doctor_id", args.doctor_id))
      .collect();

    const total_bill = cases.reduce((sum, c) => sum + (c.cost || 0), 0);
    const total_paid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending_cases = cases.filter((c) => c.status !== "Completed" && c.status !== "Delivered").length;
    const delivered_cases = cases.filter((c) => c.status === "Delivered").length;

    return {
      total_cases: cases.length,
      pending_cases,
      delivered_cases,
      total_bill,
      total_paid,
      outstanding_balance: total_bill - total_paid,
    };
  },
});
