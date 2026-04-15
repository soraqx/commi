import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("system_configs").first();
    },
});

export const updateConfig = mutation({
    args: {
        yoloThreshold: v.number(),
        saveInferenceImages: v.boolean(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("system_configs").first();
        if (existing) {
            await ctx.db.patch(existing._id, args);
        } else {
            await ctx.db.insert("system_configs", args);
        }
    },
});
