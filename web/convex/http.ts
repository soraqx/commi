import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// ─── Telemetry log ingestion (existing) ───────────────────────────────────────
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

    await ctx.runMutation(internal.history.insertLog, {
      vehicleId,
      eventType,
      lat,
      lng,
      passengerCount,
      speed,
      details,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }),
});

// ─── System config fetch ───────────────────────────────────────────────────────
http.route({
  path: "/get-config",
  method: "GET",
  handler: httpAction(async (ctx, _request) => {
    const config = await ctx.runQuery(api.config.get);

    const response = config ?? { yoloThreshold: 0.65, saveInferenceImages: false };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// ─── Hardware / GPS reading ingestion ─────────────────────────────────────────
// Called by Python gps_reader.py after parsing serial JSON from Arduino
http.route({
  path: "/ingest-hardware",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { deviceId, latitude, longitude, satellites, timestamp, source } = body;

    if (!deviceId || !timestamp) {
      return new Response(JSON.stringify({ error: "Missing deviceId or timestamp" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await ctx.runMutation(internal.hardware.insertReading, {
      deviceId,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      satellites: satellites ?? undefined,
      timestamp,
      source: source ?? "hardware",
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }),
});

// ─── People counter event ingestion ───────────────────────────────────────────
// Called by Python people_counter.py on every entry/exit detection
http.route({
  path: "/ingest-people-event",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { cameraId, eventType, count, totalPeople, timestamp, source } = body;

    if (!cameraId || !eventType || !timestamp) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (eventType !== "entry" && eventType !== "exit") {
      return new Response(JSON.stringify({ error: "eventType must be 'entry' or 'exit'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await ctx.runMutation(internal.people.insertEvent, {
      cameraId,
      eventType,
      count: count ?? 1,
      totalPeople: totalPeople ?? 0,
      timestamp,
      source: source ?? "people_counter",
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }),
});

// ─── Clerk webhook for user sync ───────────────────────────────────────────────
http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");
    let evt;
    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as any;
    } catch (err) {
      return new Response("Verification failed", { status: 400 });
    }

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const clerkId = evt.data.id;
      const email = evt.data.email_addresses?.[0]?.email_address;
      if (email) {
        await ctx.runMutation(internal.users.upsertUser, { clerkId, email });
      }
    }

    return new Response("Success", { status: 200 });
  }),
});

export default http;

