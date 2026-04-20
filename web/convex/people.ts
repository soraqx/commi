import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Internal mutation called by the HTTP action ──────────────────────────────
export const insertEvent = internalMutation({
    args: {
        cameraId: v.string(),
        eventType: v.union(v.literal("entry"), v.literal("exit")),
        count: v.number(),
        totalPeople: v.number(),
        timestamp: v.string(),
        source: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("peopleEvents", args);

        // Mirror passenger count onto the linked vehicle (cameraId === deviceId)
        const vehicle = await ctx.db
            .query("vehicles")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.cameraId))
            .first();

        if (vehicle) {
            await ctx.db.patch(vehicle._id, {
                passengerCount: args.totalPeople,
                lastUpdated: args.timestamp,
            });
        }
    },
});

// ─── Public queries used by the React dashboard ───────────────────────────────

// Most recent people event (shows current total count)
export const getLatestEvent = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("peopleEvents")
            .order("desc")
            .first();
    },
});

// Last 50 entry/exit events for the activity log
export const getRecentEvents = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("peopleEvents")
            .order("desc")
            .take(50);
    },
});

// Current total people count derived from the latest event per camera
export const getCurrentCount = query({
    args: {},
    handler: async (ctx) => {
        const latest = await ctx.db
            .query("peopleEvents")
            .order("desc")
            .first();
        return latest?.totalPeople ?? 0;
    },
});
