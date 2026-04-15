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
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { LocationProvider } from "./context/LocationContext";
type TabKey = "overview" | "map" | "history" | "settings";

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
                    <RoleBasedRouter />
                </SignedIn>
            </LocationProvider>
        </main>
    );
}

function RoleBasedRouter() {
    const { user } = useUser();
    const role = user?.publicMetadata?.role as string | undefined;

    if (role === "admin") {
        return <Dashboard />;
    }

    return <UserDashboard />;
}

function Dashboard() {
    const { isAuthenticated } = useConvexAuth();
    const storeUser = useMutation(api.users.storeUser);
    const fleetData = useQuery(api.fleet.getFleetStatus);

    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    useEffect(() => {
        if (isAuthenticated) {
            storeUser().catch(console.error);
        }
    }, [isAuthenticated, storeUser]);

    const tabs = [
        { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
        { id: "map" as const, label: "Live Map", icon: Map },
        { id: "history" as const, label: "History", icon: History },
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
            case "settings":
                return {
                    title: "System Configuration",
                    subtitle:
                        "Global hardware and AI pipeline parameters for OTA edge nodes.",
                };
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
    const totalVehicles = fleetData.length;
    const onlineVehicles = fleetData.filter(
        (vehicle) => vehicle.status === "Online"
    ).length;
    const offlineVehicles = totalVehicles - onlineVehicles;
    const totalPassengers = fleetData.reduce(
        (sum, vehicle) => sum + (vehicle.passengerCount ?? 0),
        0
    );

    const statCards = [
        {
            title: "Total Fleet Units",
            value: totalVehicles,
            icon: Truck,
            bgColor: "bg-blue-500/10",
            iconColor: "text-blue-400",
            borderColor: "border-blue-500/20",
            helper: "Registered active monitoring endpoints",
        },
        {
            title: "Passengers Tracked",
            value: totalPassengers,
            icon: Users,
            bgColor: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
            borderColor: "border-emerald-500/20",
            helper: "Current occupancy across connected units",
        },
        {
            title: "Online Systems",
            value: onlineVehicles,
            icon: Wifi,
            bgColor: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
            borderColor: "border-emerald-500/20",
            helper: `${offlineVehicles} unit${offlineVehicles === 1 ? "" : "s"} offline`,
        },
    ];

    return (
        <div>
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 transition-all hover:bg-slate-800"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">{card.title}</p>
                                    <h3 className="text-4xl font-semibold text-white mt-4">
                                        {card.value}
                                    </h3>
                                    <p className="mt-2 text-xs text-slate-500">{card.helper}</p>
                                </div>
                                <div className={`rounded-full ${card.bgColor} p-4`}>
                                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

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
                                <div
                                    key={vehicle._id}
                                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                                            <Truck className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">
                                                {vehicle.deviceId}
                                            </h4>
                                            <p className="text-sm text-slate-500">
                                                Vehicle telemetry endpoint
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                            <Users className="h-3.5 w-3.5" />
                                            {vehicle.passengerCount ?? 0}
                                        </span>

                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${
                                                isOnline
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                            }`}
                                        >
                                            {isOnline ? (
                                                <Wifi className="h-3.5 w-3.5" />
                                            ) : (
                                                <WifiOff className="h-3.5 w-3.5" />
                                            )}
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
                                <h4 className="text-base font-medium text-white">
                                    No fleet devices detected
                                </h4>
                                <p className="mt-2 text-sm text-slate-400">
                                    Once Convex receives telemetry records, vehicle cards will
                                    appear here automatically.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white">System Health</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Backend connectivity and operational readiness snapshot.
                        </p>

                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                                <div>
                                    <p className="text-sm text-slate-300">Convex Backend</p>
                                    <p className="text-xs text-slate-500">Realtime query channel</p>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Healthy
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                                <div>
                                    <p className="text-sm text-slate-300">GPS Ingestion</p>
                                    <p className="text-xs text-slate-500">NEO-6M serial pipeline</p>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    Standby
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                                <div>
                                    <p className="text-sm text-slate-300">AI Runtime</p>
                                    <p className="text-xs text-slate-500">Inference integration layer</p>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                    Ready
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5 text-blue-200/80 text-sm">
                        <h3 className="text-lg font-semibold text-white mb-2">Operator Notes</h3>
                        <p className="text-sm text-blue-200/70 mb-4">
                            Interface tuned for fleet engineering and AI operations teams.
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                Emerald indicates online/healthy status states.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-400"></span>
                                Red indicates offline or critical alerts.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                                Purple highlights AI configuration and readiness.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}
