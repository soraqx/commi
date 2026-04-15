import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const landmarks = await ctx.db.query("landmarks").collect();
        return landmarks;
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        lat: v.number(),
        lng: v.number(),
        radius: v.number(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("landmarks", {
            name: args.name,
            lat: args.lat,
            lng: args.lng,
            radius: args.radius,
        });
        return id;
    },
});

export const remove = mutation({
    args: {
        id: v.id("landmarks"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return true;
    },
});