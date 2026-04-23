// convex/users.ts
import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication");
        }

        // Check if the user is already in the Convex database
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user !== null) {
            return user._id; // User already exists, do nothing
        }

        // If they don't exist, insert them
        return await ctx.db.insert("users", {
            clerkId: identity.subject,
            email: identity.email!,
            role: (identity.role as "admin" | "user") || "user",
        });
    },
});

export const upsertUser = internalMutation({
  args: { clerkId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { email: args.email });
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        role: "user" as const,
      });
    }
  },
});