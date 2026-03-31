// convex/users.ts
import { mutation } from "./_generated/server";

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
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
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