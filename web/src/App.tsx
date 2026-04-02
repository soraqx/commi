import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import {
    Activity,
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
} from "lucide-react";
import { useConvexAuth } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import MapDisplay from "./components/MapDisplay";
import { SettingsPanel } from "./components/SettingsPanel";
import { UserDashboard } from "./components/UserDashboard";
type TabKey = "overview" | "map" | "history" | "settings";

export default function App() {
    return (
        <main className="min-h-screen">
            <SignedOut>
                <WelcomeScreen />
            </SignedOut>

            <SignedIn>
                <RoleBasedRouter />
            </SignedIn>
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
                    title: "System Settings",
                    subtitle:
                        "Configure NEO-6M hardware interfaces and AI model integration parameters.",
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
                    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                                    Engineering Operations
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-white">
                                    {pageMeta.title}
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">{pageMeta.subtitle}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 sm:flex sm:items-center sm:gap-2">
                                    <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                                    AI + GPS Connected
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/5 p-1">
                                    <UserButton />
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
                        {activeTab === "overview" && <OverviewCards fleetData={fleetData} />}

                        {activeTab === "map" && (
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
                                <div className="h-[420px] overflow-hidden rounded-2xl border border-blue-400/20">
                                    <MapDisplay fleetData={fleetData} />
                                </div>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
                                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 text-center">
                                    <History className="mb-4 h-12 w-12 text-violet-300" />
                                    <h3 className="text-xl font-semibold text-white">
                                        Module Loading...
                                    </h3>
                                    <p className="mt-2 max-w-md text-sm text-slate-400">
                                        Preparing historical route logs, incident reports, and fleet
                                        performance timelines.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
                                <SettingsPanel />
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
            accent:
                "from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-400/20",
            helper: "Registered active monitoring endpoints",
        },
        {
            title: "Passengers Tracked",
            value: totalPassengers,
            icon: Users,
            accent:
                "from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-400/20",
            helper: "Current occupancy across connected units",
        },
        {
            title: "Online Systems",
            value: onlineVehicles,
            icon: Wifi,
            accent:
                "from-emerald-500/20 to-lime-500/10 text-emerald-300 border-emerald-400/20",
            helper: `${offlineVehicles} unit${offlineVehicles === 1 ? "" : "s"} offline`,
        },
    ];

    return (
        <div className="space-y-6">
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className={`rounded-3xl border bg-gradient-to-br p-5 shadow-2xl shadow-black/10 backdrop-blur-xl ${card.accent}`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-300">{card.title}</p>
                                    <h3 className="mt-3 text-3xl font-semibold text-white">
                                        {card.value}
                                    </h3>
                                    <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
                                </div>
                                <div className="rounded-2xl bg-white/10 p-3">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Fleet Telemetry Nodes
                            </h3>
                            <p className="text-sm text-slate-400">
                                Real-time device connectivity and passenger sensor summary.
                            </p>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            Live Feed
                        </div>
                    </div>

                    <div className="space-y-4">
                        {fleetData.map((vehicle) => {
                            const isOnline = vehicle.status === "Online";

                            return (
                                <div
                                    key={vehicle._id}
                                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition-all hover:border-white/20 hover:bg-slate-900/80"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                    <Truck className="h-5 w-5 text-slate-200" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white">
                                                        {vehicle.deviceId}
                                                    </h4>
                                                    <p className="text-sm text-slate-400">
                                                        Vehicle telemetry endpoint
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {vehicle.passengerCount ?? 0} passengers
                                                </span>

                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${isOnline
                                                        ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                                        : "border border-rose-400/20 bg-rose-500/10 text-rose-300"
                                                        }`}
                                                >
                                                    {isOnline ? (
                                                        <Wifi className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <WifiOff className="h-3.5 w-3.5" />
                                                    )}
                                                    {vehicle.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    GPS
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-blue-300">
                                                    NEO-6M
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    AI State
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-violet-300">
                                                    Ready
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    Location
                                                </p>
                                                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-200">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                    Active
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {fleetData.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center">
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
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                        <h3 className="text-lg font-semibold text-white">System Health</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Backend connectivity and operational readiness snapshot.
                        </p>

                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <div>
                                    <p className="text-sm text-slate-300">Convex Backend</p>
                                    <p className="text-xs text-slate-500">Realtime query channel</p>
                                </div>
                                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                                    Healthy
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <div>
                                    <p className="text-sm text-slate-300">GPS Ingestion</p>
                                    <p className="text-xs text-slate-500">NEO-6M serial pipeline</p>
                                </div>
                                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                                    Standby
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <div>
                                    <p className="text-sm text-slate-300">AI Runtime</p>
                                    <p className="text-xs text-slate-500">Inference integration layer</p>
                                </div>
                                <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                                    Ready
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                        <h3 className="text-lg font-semibold text-white">Operator Notes</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Interface tuned for fleet engineering and AI operations teams.
                        </p>

                        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4">
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                                    Emerald and rose accents indicate online/offline state.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                                    Blue highlights hardware and GPS-related modules.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-violet-400" />
                                    Purple highlights AI configuration and runtime readiness.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
