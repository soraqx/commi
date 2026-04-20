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

    // Telemetry logs for historical data and audits
    telemetry_logs: defineTable({
        vehicleId: v.string(),
        eventType: v.union(v.literal("ping"), v.literal("warning"), v.literal("geofence"), v.literal("offline")),
        lat: v.number(),
        lng: v.number(),
        passengerCount: v.number(),
        speed: v.number(),
        details: v.optional(v.string()),
    }).index("by_vehicleId", ["vehicleId"]),

    // Global system configuration for OTA edge nodes
    system_configs: defineTable({
        yoloThreshold: v.number(),
        saveInferenceImages: v.boolean(),
    }),

    // Raw GPS + hardware readings from Arduino UNO R4 WiFi via Python serial reader
    hardwareReadings: defineTable({
        deviceId: v.string(),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        satellites: v.optional(v.number()),
        timestamp: v.string(),
        source: v.string(),              // "hardware"
    }).index("by_deviceId", ["deviceId"]),

    // Entry/exit events from YOLO people counter
    peopleEvents: defineTable({
        cameraId: v.string(),
        eventType: v.union(v.literal("entry"), v.literal("exit")),
        count: v.number(),
        totalPeople: v.number(),
        timestamp: v.string(),
        source: v.string(),              // "people_counter"
    }).index("by_cameraId", ["cameraId"]),
});