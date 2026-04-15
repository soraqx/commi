import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/ingest-telemetry",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    const { vehicleId, eventType, lat, lng, passengerCount, speed, details } = body;
    
    if (!vehicleId || !eventType || lat === undefined || lng === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    await ctx.db.insert("telemetry_logs", {
      vehicleId,
      eventType,
      lat,
      lng,
      passengerCount,
      speed,
      details,
    });
    
    return new Response("Log saved", { status: 200 });
  }),
});

http.route({
  path: "/get-config",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const config = await ctx.runQuery(api.config.get);
    
    const fallback = {
      yoloThreshold: 0.65,
      saveInferenceImages: false,
    };
    
    const response = config || fallback;
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;