import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), username))
      .first();

    if (existing) throw new Error("Username already taken");

    return await ctx.db.insert("users", { username, password, highestScore: 0 });
  },
});

export const login = query({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), username))
      .filter((q) => q.eq(q.field("password"), password))
      .first();
    return user || null;
  },
});

export const updateScore = mutation({
  args: { id: v.id("users"), score: v.number() },
  handler: async (ctx, { id, score }) => {
    const user = await ctx.db.get(id);
    if (user && score > user.highestScore) {
      await ctx.db.patch(id, { highestScore: score });
    }
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .order("desc")
      .take(5);
  },
});