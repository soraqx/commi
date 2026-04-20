import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MapPin, Users, ArrowDownCircle, ArrowUpCircle, Satellite, Clock } from "lucide-react";

function timeAgo(isoString: string): string {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

export function HardwarePanel() {
    const latestGPS = useQuery(api.hardware.getLatestReading, {});
    const currentCount = useQuery(api.people.getCurrentCount);
    const recentEvents = useQuery(api.people.getRecentEvents);
    const recentReadings = useQuery(api.hardware.getRecentReadings);

    const hasGPS = latestGPS?.latitude != null && latestGPS?.longitude != null;

    return (
        <div className="space-y-6">

            {/* ── Summary cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                {/* People count */}
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-cyan-400">
                                People Inside
                            </p>
                            <p className="mt-3 text-4xl font-bold text-white">
                                {currentCount ?? "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">Live YOLO count</p>
                        </div>
                        <div className="rounded-xl bg-cyan-500/20 p-3">
                            <Users className="h-5 w-5 text-cyan-300" />
                        </div>
                    </div>
                </div>

                {/* GPS coordinates */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-emerald-400">
                                GPS Location
                            </p>
                            {hasGPS ? (
                                <>
                                    <p className="mt-3 text-sm font-semibold text-white">
                                        {latestGPS!.latitude!.toFixed(6)}
                                    </p>
                                    <p className="text-sm font-semibold text-white">
                                        {latestGPS!.longitude!.toFixed(6)}
                                    </p>
                                </>
                            ) : (
                                <p className="mt-3 text-sm text-slate-400">Waiting for fix…</p>
                            )}
                            <p className="mt-1 text-xs text-slate-400">
                                {latestGPS ? `Updated ${timeAgo(latestGPS.timestamp)}` : "No data yet"}
                            </p>
                        </div>
                        <div className="rounded-xl bg-emerald-500/20 p-3">
                            <MapPin className="h-5 w-5 text-emerald-300" />
                        </div>
                    </div>
                </div>

                {/* Satellites */}
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-violet-400">
                                Satellites
                            </p>
                            <p className="mt-3 text-4xl font-bold text-white">
                                {latestGPS?.satellites ?? "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Device: {latestGPS?.deviceId ?? "—"}
                            </p>
                        </div>
                        <div className="rounded-xl bg-violet-500/20 p-3">
                            <Satellite className="h-5 w-5 text-violet-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Recent people events ───────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-300">
                    Entry / Exit Log
                </h3>

                {!recentEvents || recentEvents.length === 0 ? (
                    <p className="text-sm text-slate-500">No events recorded yet.</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {recentEvents.map((event) => (
                            <div
                                key={event._id}
                                className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 px-4 py-2.5"
                            >
                                <div className="flex items-center gap-3">
                                    {event.eventType === "entry" ? (
                                        <ArrowDownCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                                    ) : (
                                        <ArrowUpCircle className="h-4 w-4 text-rose-400 shrink-0" />
                                    )}
                                    <span
                                        className={`text-sm font-medium capitalize ${
                                            event.eventType === "entry"
                                                ? "text-emerald-300"
                                                : "text-rose-300"
                                        }`}
                                    >
                                        {event.eventType}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        cam: {event.cameraId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span>total: <strong className="text-white">{event.totalPeople}</strong></span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {timeAgo(event.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Recent GPS readings ────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-300">
                    GPS Reading Log
                </h3>

                {!recentReadings || recentReadings.length === 0 ? (
                    <p className="text-sm text-slate-500">No GPS readings yet.</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {recentReadings.map((reading) => (
                            <div
                                key={reading._id}
                                className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 px-4 py-2.5 text-xs"
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                    <span className="text-slate-300 font-mono">
                                        {reading.latitude != null
                                            ? `${reading.latitude.toFixed(6)}, ${reading.longitude?.toFixed(6)}`
                                            : "No fix"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400">
                                    <span>{reading.satellites ?? 0} sats</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {timeAgo(reading.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
