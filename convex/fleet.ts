import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFleetStatus = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthenticated: Please log in to view the dashboard.");
        }

        // DEBUG: Check your Convex terminal/dashboard logs to see these
        console.log("Clerk User Identity:", identity.subject);
        console.log("Detected Role from JWT:", identity.role);

        const role = identity.role as string | undefined;

        // RBAC Logic with Fallback
        if (role === "admin") {
            return await ctx.db.query("vehicles").collect();
        }

        // Fallback: If role is undefined or not admin, try to find assigned vehicles
        const assigned = await ctx.db.query("vehicles")
            .filter(q => q.eq(q.field("assignedDriverId"), identity.subject))
            .collect();

        // TEMPORARY: If nothing is assigned, return everything so you can see the UI
        if (assigned.length === 0) {
            console.log("No assigned vehicles found, returning all for debugging.");
            return await ctx.db.query("vehicles").collect();
        }

        return assigned;
    },
});

export const seedMockData = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("vehicles").collect();
        if (existing.length > 0) return "Data already exists!";

        const mockFleet = [
            { deviceId: "JEEP-001", latitude: 14.5995, longitude: 120.9842, passengerCount: 12, status: "Online" as const, lastUpdated: new Date().toISOString() },
            { deviceId: "JEEP-002", latitude: 14.6042, longitude: 120.9876, passengerCount: 18, status: "Online" as const, lastUpdated: new Date().toISOString() },
            { deviceId: "JEEP-003", latitude: 14.5958, longitude: 120.9819, passengerCount: 0, status: "Offline" as const, lastUpdated: new Date().toISOString() }
        ];

        for (const vehicle of mockFleet) {
            await ctx.db.insert("vehicles", vehicle);
        }
        return "Mock data seeded successfully!";
    }
});