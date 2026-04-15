import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("telemetry_logs")
            .order("desc")
            .take(100);
    },
});

export const insertLog = mutation({
    args: {
        vehicleId: v.string(),
        eventType: v.union(v.literal("ping"), v.literal("warning"), v.literal("geofence"), v.literal("offline")),
        lat: v.number(),
        lng: v.number(),
        passengerCount: v.number(),
        speed: v.number(),
        details: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("telemetry_logs", {
            vehicleId: args.vehicleId,
            eventType: args.eventType,
            lat: args.lat,
            lng: args.lng,
            passengerCount: args.passengerCount,
            speed: args.speed,
            details: args.details,
        });
    },
});