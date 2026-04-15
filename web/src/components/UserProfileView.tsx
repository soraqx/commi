import { useUser, SignOutButton } from "@clerk/clerk-react";
import { MapPin, Bell, Shield, LogOut, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { triggerHaptic, setHapticEnabled as setGlobalHaptic } from "../utils/haptics";
import { useLocation } from "../context/LocationContext";

interface UserProfileViewProps {
    onHapticSettingChange?: (enabled: boolean) => void;
}

export function UserProfileView({ onHapticSettingChange }: UserProfileViewProps) {
    const { user } = useUser();
    const { location, requestLocation, clearLocation } = useLocation();
    const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(false);
    const [locationEnabled, setLocationEnabled] = useState<boolean>(false);

    useEffect(() => {
        const saved = localStorage.getItem("vibrateAlerts");
        if (saved !== null) {
            const enabled = JSON.parse(saved);
            setVibrateEnabled(enabled);
            setGlobalHaptic(enabled);
            onHapticSettingChange?.(enabled);
        }
    }, [onHapticSettingChange]);

    useEffect(() => {
        setLocationEnabled(location.isAvailable);
    }, [location.isAvailable]);

    const handleToggleVibrate = (enabled: boolean) => {
        setVibrateEnabled(enabled);
        localStorage.setItem("vibrateAlerts", JSON.stringify(enabled));
        setGlobalHaptic(enabled);
        onHapticSettingChange?.(enabled);

        if (enabled) {
            triggerHaptic();
        }
    };

    const handleToggleLocation = async (checked: boolean) => {
        triggerHaptic();

        if (checked) {
            const success = await requestLocation();
            if (!success) {
                setLocationEnabled(false);
                return;
            }
            setLocationEnabled(true);
        } else {
            clearLocation();
            setLocationEnabled(false);
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto overscroll-none bg-slate-50 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            {/* Page Title */}
            <h1 className="text-3xl font-bold px-4 pt-8 pb-4 text-gray-900">
                Settings
            </h1>

            {/* User Profile Card */}
            <div className="mx-4 mb-6 overflow-hidden rounded-2xl bg-white shadow-sm p-4 flex items-center gap-4">
                <div className="shrink-0">
                    {user?.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={user.fullName || "User"}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-500">
                            <span className="text-lg font-bold text-white">
                                {user?.firstName?.charAt(0) || "U"}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                        {user?.fullName || "User"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                        {user?.primaryEmailAddress?.emailAddress || "No email"}
                    </p>
                </div>
            </div>

            {/* Card: Preferences */}
            <div className="mx-4 mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="divide-y divide-gray-100">
                    {/* Location Toggle */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                                <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Location Services</p>
                                <p className="text-sm text-gray-500">Allow location tracking</p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={locationEnabled}
                                onChange={(e) => handleToggleLocation(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-7 w-12 rounded-full bg-gray-200 after:absolute after:left-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300" />
                        </label>
                    </div>

                    {/* Vibration Toggle */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                                <Bell className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Vibration Alerts</p>
                                <p className="text-sm text-gray-500">Haptic feedback</p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={vibrateEnabled}
                                onChange={(e) => handleToggleVibrate(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-7 w-12 rounded-full bg-gray-200 after:absolute after:left-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300" />
                        </label>
                    </div>
                </div>
            </div>

            {/* Card: Account */}
            <div className="mx-4 mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="divide-y divide-gray-100">
                    {/* Data Privacy */}
                    <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Data Privacy</p>
                                <p className="text-sm text-gray-500">Manage your data</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Sign Out Button */}
            <div className="mx-4">
                <SignOutButton>
                    <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-4 font-semibold text-white transition-all hover:bg-red-600">
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </SignOutButton>
            </div>
        </div>
    );
}
