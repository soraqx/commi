import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Internal mutation called by the HTTP action ──────────────────────────────
export const insertReading = internalMutation({
    args: {
        deviceId: v.string(),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        satellites: v.optional(v.number()),
        timestamp: v.string(),
        source: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("hardwareReadings", args);

        // Keep the vehicles table in sync so the live map updates
        if (args.latitude != null && args.longitude != null) {
            const vehicle = await ctx.db
                .query("vehicles")
                .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
                .first();

            if (vehicle) {
                await ctx.db.patch(vehicle._id, {
                    latitude: args.latitude!,
                    longitude: args.longitude!,
                    lastUpdated: args.timestamp,
                    status: "Online",
                });
            }
        }
    },
});

// ─── Public queries used by the React dashboard ───────────────────────────────

// Latest GPS reading for a given device
export const getLatestReading = query({
    args: { deviceId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const queryBuilder = ctx.db.query("hardwareReadings").order("desc");
        if (args.deviceId) {
            return await queryBuilder
                .filter((q) => q.eq(q.field("deviceId"), args.deviceId))
                .first();
        }
        return await queryBuilder.first();
    },
});

// Last 50 hardware readings for the activity log
export const getRecentReadings = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("hardwareReadings")
            .order("desc")
            .take(50);
    },
});
