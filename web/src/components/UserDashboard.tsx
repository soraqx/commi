import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Map, Bell, User } from "lucide-react";
import { LiveMapUserView } from "./LiveMapUserView";
import { UserProfileView } from "./UserProfileView";
import { triggerHaptic, setHapticEnabled } from "../utils/haptics";

type UserTabKey = "map" | "alerts" | "profile";

export function UserDashboard() {
    const [activeTab, setActiveTab] = useState<UserTabKey>("map");
    const fleetData = useQuery(api.fleet.getFleetStatus);

    const tabs = [
        { id: "map" as const, label: "Live Map", icon: Map },
        { id: "alerts" as const, label: "Alerts", icon: Bell },
        { id: "profile" as const, label: "Profile", icon: User },
    ];

    const handleTabChange = (tabId: UserTabKey) => {
        triggerHaptic();
        setActiveTab(tabId);
    };

    if (fleetData === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm text-gray-600 shadow-lg">
                    Loading Chatcommiot Data...
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-gray-100 pt-[env(safe-area-inset-top)]">
            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden">
                {activeTab === "map" && <LiveMapUserView fleetData={fleetData} />}
                {activeTab === "alerts" && (
                    <div className="h-full w-full overflow-y-auto overscroll-none px-6 py-8">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Bell className="mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="text-xl font-semibold text-gray-800">
                                Alerts
                            </h3>
                            <p className="mt-2 max-w-md text-sm text-gray-500">
                                Notifications and alerts will appear here.
                            </p>
                        </div>
                    </div>
                )}
                {activeTab === "profile" && <UserProfileView onHapticSettingChange={setHapticEnabled} />}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-gray-50 px-2 py-2 md:hidden pb-[env(safe-area-inset-bottom)]">
                <div className="grid grid-cols-3 gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-all ${isActive
                                    ? "bg-brand-blue-500 text-white"
                                    : "text-gray-500 hover:bg-brand-blue-100 hover:text-gray-700"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Desktop Side Navigation */}
            <nav className="fixed left-0 top-0 z-30 hidden h-full w-20 border-r border-gray-200 bg-white md:flex md:flex-col md:items-center md:gap-4 md:py-8">
                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-500">
                    <span className="text-lg font-bold text-white">C</span>
                </div>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-3 text-xs font-medium transition-all ${isActive
                                ? "bg-brand-blue-500 text-white"
                                : "text-gray-500 hover:bg-brand-blue-100 hover:text-gray-700"
                                }`}
                            title={tab.label}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Desktop Main Content Offset */}
            <div className="md:ml-20">
                {/* Content is already rendered above */}
            </div>
        </div>
    );
}
