import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import {
    Cpu,
    History,
    LayoutDashboard,
    Map,
    MapPin,
    Radio,
    Settings,
    Sparkles,
    Truck,
    Users,
    Wifi,
    WifiOff,
    Navigation,
} from "lucide-react";
import { useConvexAuth } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { LiveMapAdminView } from "./components/LiveMapAdminView";
import { HistoryTab } from "./components/HistoryTab";
import { SettingsAdminTab } from "./components/SettingsAdminTab";
import { UserDashboard } from "./components/UserDashboard";
import { HardwarePanel } from "./components/HardwarePanel";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { LocationProvider } from "./context/LocationContext";
import { Routes, Route, Navigate } from "react-router-dom";

type TabKey = "overview" | "map" | "history" | "hardware" | "settings";

export default function App() {
    useEffect(() => {
        const handleOAuthCallback = async () => {
            const listener = await CapacitorApp.addListener("appUrlOpen", async (event: { url: string }) => {
                if (event.url.includes("oauth-callback")) {
                    await Browser.close();
                    const url = new URL(event.url);
                    const searchParams = url.search;
                    window.location.assign(`/${searchParams}`);
                }
            });

            return () => {
                listener.remove();
            };
        };

        handleOAuthCallback();
    }, []);

    return (
        <main className="min-h-screen">
            <LocationProvider>
                <SignedOut>
                    <WelcomeScreen />
                </SignedOut>

                <SignedIn>
                    <AuthenticatedRoutes />
                </SignedIn>
            </LocationProvider>
        </main>
    );
}

function AuthenticatedRoutes() {
    const { isLoaded, user } = useUser();

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm text-slate-200 backdrop-blur-xl">
                    Loading user data...
                </div>
            </div>
        );
    }

    const role = user?.publicMetadata?.role as string | undefined;
    const isAdmin = role === "admin";

    return (
        <Routes>
            <Route path="/" element={isAdmin ? <Navigate to="/admin/overview" replace /> : <Navigate to="/overview" replace />} />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={isAdmin ? <AdminLayout /> : <Navigate to="/overview" replace />} />
            
            {/* Passenger routes */}
            <Route path="/overview" element={!isAdmin ? <UserDashboard /> : <Navigate to="/admin/overview" replace />} />
            
            {/* Fallback */}
            <Route path="*" element={isAdmin ? <Navigate to="/admin/overview" replace /> : <Navigate to="/overview" replace />} />
        </Routes>
    );
}

function AdminLayout() {
    return (
        <Routes>
            <Route path="overview" element={<Dashboard />} />
            <Route path="map" element={<Dashboard initialTab="map" />} />
            <Route path="history" element={<Dashboard initialTab="history" />} />
            <Route path="hardware" element={<Dashboard initialTab="hardware" />} />
            <Route path="settings" element={<SettingsRoute />} />
            <Route index element={<Navigate to="overview" replace />} />
        </Routes>
    );
}

function SettingsRoute() {
    const { isLoaded, user } = useUser();

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm text-slate-200 backdrop-blur-xl">
                    Loading user data...
                </div>
            </div>
        );
    }

    const role = user?.publicMetadata?.role as string | undefined;
    if (role !== "admin") {
        return <Navigate to="/overview" replace />;
    }

    return <Dashboard initialTab="settings" />;
}

function Dashboard({ initialTab }: { initialTab?: TabKey }) {
    const { isAuthenticated } = useConvexAuth();
    const storeUser = useMutation(api.users.storeUser);
    const fleetData = useQuery(api.fleet.getFleetStatus);

    const [activeTab, setActiveTab] = useState<TabKey>(initialTab || "overview");

    useEffect(() => {
        if (isAuthenticated) {
            storeUser().catch(console.error);
        }
    }, [isAuthenticated, storeUser]);

    const tabs = [
        { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
        { id: "map" as const, label: "Live Map", icon: Map },
        { id: "history" as const, label: "History", icon: History },
        { id: "hardware" as const, label: "Hardware", icon: Cpu },
        { id: "settings" as const, label: "Settings", icon: Settings },
    ];

    const pageMeta = useMemo(() => {
        switch (activeTab) {
            case "overview":
                return {
                    title: "Fleet Overview",
                    subtitle:
                        "Monitor connected vehicles, passenger activity, and system health in real time.",
                };
            case "map":
                return {
                    title: "Live Map",
                    subtitle:
                        "Track fleet location telemetry and GPS stream visualization.",
                };
            case "history":
                return {
                    title: "History",
                    subtitle:
                        "Review operational logs, route traces, and historical system events.",
                };
            case "hardware":
                return {
                    title: "Hardware & GPS",
                    subtitle:
                        "Live GPS readings from Arduino and YOLO people counter events.",
                };
            case "settings":
                return {
                    title: "System Configuration",
                    subtitle:
                        "Global hardware and AI pipeline parameters for OTA edge nodes.",
                };
            default:
                return { title: "", subtitle: "" };
        }
    }, [activeTab]);

    if (fleetData === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm text-slate-200 backdrop-blur-xl">
                    Loading Chatcommiot Data...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl md:flex md:flex-col">
                    <div className="border-b border-white/10 px-6 py-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3">
                                <Cpu className="h-6 w-6 text-blue-300" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                                    Chatcommiot
                                </p>
                                <h1 className="text-xl font-semibold text-white">
                                    Admin Dashboard
                                </h1>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                            <div className="flex items-center gap-2 text-emerald-300">
                                <Radio className="h-4 w-4" />
                                <span className="text-sm font-medium">Control Panel Online</span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-slate-300">
                                Engineering console for fleet telemetry, hardware interfaces,
                                and AI operations.
                            </p>
                        </div>
                    </div>

                    <nav className="flex flex-1 flex-col gap-2 p-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-slate-100 text-slate-900 shadow-lg shadow-black/10"
                                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex min-h-screen flex-1 flex-col">
                    <header className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-950/80 backdrop-blur-xl">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                            <div>
                                {activeTab === "overview" ? (
                                    <>
                                        <h2 className="text-3xl font-bold text-white">Fleet Overview</h2>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Real-time fleet telemetry, passenger counts, and system health monitoring.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                                            Engineering Operations
                                        </p>
                                        <h2 className="mt-1 text-2xl font-semibold text-white">
                                            {pageMeta.title}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-400">{pageMeta.subtitle}</p>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-300 sm:flex sm:items-center sm:gap-2">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    AI + GPS Connected
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/5 p-1">
                                    <UserButton />
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 flex flex-col overflow-hidden">
                        {activeTab === "overview" && <OverviewCards fleetData={fleetData} />}

                        {activeTab === "map" && (
                            <div className="flex-1 relative overflow-hidden w-full h-full min-h-[calc(100vh-120px)]">
                                <LiveMapAdminView fleetData={fleetData} />
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl overflow-hidden">
                                <HistoryTab />
                            </div>
                        )}

                        {activeTab === "hardware" && (
                            <div className="p-6">
                                <HardwarePanel />
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                                <SettingsAdminTab />
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/90 px-2 py-2 backdrop-blur-xl md:hidden">
                <div className="grid grid-cols-4 gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-all ${isActive
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

function OverviewCards({ fleetData }: { fleetData: any[] }) {
    // ── Live Convex production data ──────────────────────────────────────────
    const liveCount    = useQuery(api.people.getCurrentCount);
    const latestGPS    = useQuery(api.hardware.getLatestReading, {});
    const latestEvent  = useQuery(api.people.getLatestEvent);

    const totalVehicles   = fleetData.length;
    const onlineVehicles  = fleetData.filter(v => v.status === "Online").length;
    const offlineVehicles = totalVehicles - onlineVehicles;

    const gpsActive = latestGPS != null;
    const aiActive  = latestEvent != null;

    function timeAgo(iso: string) {
        const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
        if (diff < 60)   return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    }

    return (
        <div>
            {/* ── Stat cards ──────────────────────────────────────────────── */}
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8">
                {/* Total Fleet */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Total Fleet Units</p>
                            <h3 className="text-4xl font-semibold text-white mt-4">{totalVehicles}</h3>
                            <p className="mt-2 text-xs text-slate-500">Registered endpoints</p>
                        </div>
                        <div className="rounded-full bg-blue-500/10 p-4">
                            <Truck className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Live People Count — from YOLO people counter via Convex */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">People Inside</p>
                            <h3 className="text-4xl font-semibold text-white mt-4">
                                {liveCount ?? "—"}
                            </h3>
                            <p className="mt-2 text-xs text-slate-500">
                                {latestEvent
                                    ? `Last event ${timeAgo(latestEvent.timestamp)}`
                                    : "Waiting for YOLO data"}
                            </p>
                        </div>
                        <div className="rounded-full bg-cyan-500/10 p-4">
                            <Users className="h-6 w-6 text-cyan-400" />
                        </div>
                    </div>
                </div>

                {/* Live GPS — from Arduino via Convex */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">GPS Location</p>
                            {latestGPS?.latitude != null ? (
                                <>
                                    <p className="text-sm font-semibold text-white mt-4 font-mono">
                                        {latestGPS.latitude.toFixed(5)}
                                    </p>
                                    <p className="text-sm font-semibold text-white font-mono">
                                        {latestGPS.longitude?.toFixed(5)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {timeAgo(latestGPS.timestamp)} · {latestGPS.satellites ?? 0} sats
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-semibold text-slate-500 mt-4">No Fix</h3>
                                    <p className="mt-2 text-xs text-slate-500">Waiting for Arduino GPS</p>
                                </>
                            )}
                        </div>
                        <div className="rounded-full bg-emerald-500/10 p-4">
                            <MapPin className="h-6 w-6 text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Online Systems */}
                <div className="bg-slate-800/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Online Systems</p>
                            <h3 className="text-4xl font-semibold text-white mt-4">{onlineVehicles}</h3>
                            <p className="mt-2 text-xs text-slate-500">
                                {offlineVehicles} unit{offlineVehicles === 1 ? "" : "s"} offline
                            </p>
                        </div>
                        <div className="rounded-full bg-emerald-500/10 p-4">
                            <Wifi className="h-6 w-6 text-emerald-400" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Fleet nodes + System Health ──────────────────────────── */}
            <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.5fr_1fr]">
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Fleet Telemetry Nodes</h3>
                        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live Feed
                        </div>
                    </div>

                    <div className="space-y-4">
                        {fleetData.map((vehicle) => {
                            const isOnline = vehicle.status === "Online";
                            return (
                                <div key={vehicle._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                                            <Truck className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{vehicle.deviceId}</h4>
                                            {vehicle.latitude != null ? (
                                                <p className="text-xs text-slate-500 font-mono">
                                                    {vehicle.latitude.toFixed(5)}, {vehicle.longitude?.toFixed(5)}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-slate-500">Vehicle telemetry endpoint</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                            <Users className="h-3.5 w-3.5" />
                                            {vehicle.passengerCount ?? 0}
                                        </span>
                                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${isOnline ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                                            {vehicle.status}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border bg-purple-500/10 text-purple-400 border-purple-500/20">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            AI Ready
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {fleetData.length === 0 && (
                            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/50 px-6 py-12 text-center">
                                <Truck className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                                <h4 className="text-base font-medium text-white">No fleet devices detected</h4>
                                <p className="mt-2 text-sm text-slate-400">
                                    Once Convex receives telemetry records, vehicle cards will appear here automatically.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white">System Health</h3>
                        <p className="mt-1 text-sm text-slate-400">Live status from Convex production.</p>

                        <div className="mt-5 space-y-4">
                            {/* Convex — always connected if we're here */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                                <div>
                                    <p className="text-sm text-slate-300">Convex Backend</p>
                                    <p className="text-xs text-slate-500">expert-pony-749 · production</p>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Healthy
                                </span>
                            </div>

                            {/* GPS — live status from hardwareReadings */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                                <div>
                                    <p className="text-sm text-slate-300">GPS Ingestion</p>
                                    <p className="text-xs text-slate-500">
                                        {gpsActive ? `Last: ${timeAgo(latestGPS!.timestamp)}` : "NEO-6M serial pipeline"}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${gpsActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-blue-500/20 bg-blue-500/10 text-blue-400"}`}>
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${gpsActive ? "bg-emerald-500" : "bg-blue-500"}`}></span>
                                    {gpsActive ? "Active" : "Standby"}
                                </span>
                            </div>

                            {/* AI — live status from peopleEvents */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                                <div>
                                    <p className="text-sm text-slate-300">AI Runtime</p>
                                    <p className="text-xs text-slate-500">
                                        {aiActive ? `Last event: ${timeAgo(latestEvent!.timestamp)}` : "Inference integration layer"}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${aiActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-purple-500/20 bg-purple-500/10 text-purple-400"}`}>
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${aiActive ? "bg-emerald-500" : "bg-purple-500"}`}></span>
                                    {aiActive ? "Active" : "Ready"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5 text-blue-200/80 text-sm">
                        <h3 className="text-lg font-semibold text-white mb-2">Operator Notes</h3>
                        <p className="text-sm text-blue-200/70 mb-4">Interface tuned for fleet engineering and AI operations teams.</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                Emerald = online / active / healthy
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-400"></span>
                                Red = offline or critical alert
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                                Purple = AI ready, awaiting data
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}
