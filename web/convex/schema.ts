// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // This replaces your Python FleetDevice model and MOCK_FLEET_DATA
    vehicles: defineTable({
        deviceId: v.string(),            // e.g., "JEEP-001"
        latitude: v.number(),
        longitude: v.number(),
        passengerCount: v.number(),
        status: v.union(v.literal("Online"), v.literal("Offline")),
        lastUpdated: v.string(),         // Store as ISO string

        // RBAC Addition: This links a specific vehicle to a Clerk user ID
        assignedDriverId: v.optional(v.string()),
    }).index("by_deviceId", ["deviceId"]),

    // This stores the Clerk user roles so Convex can read them lightning-fast
    users: defineTable({
        clerkId: v.string(),
        role: v.union(v.literal("admin"), v.literal("user")),
        email: v.string(),
    }).index("by_clerkId", ["clerkId"]),
    
    // Landmarks table for persistent geofence locations
    landmarks: defineTable({
        name: v.string(),
        lat: v.number(),
        lng: v.number(),
        radius: v.number(),
    }).index("by_name", ["name"]),
});