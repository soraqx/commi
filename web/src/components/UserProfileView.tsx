import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Edit, ChevronRight, LogOut } from "lucide-react";
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
        <div className="h-full w-full overflow-y-auto overscroll-none bg-gray-100 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-2xl pb-20">
                {/* Header */}
                <h1 className="mb-6 text-2xl font-bold text-gray-900">
                    PROFILE & SETTINGS
                </h1>

                {/* User Card */}
                <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            {user?.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt={user.fullName || "User"}
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue-500">
                                    <span className="text-2xl font-bold text-white">
                                        {user?.firstName?.charAt(0) || "U"}
                                    </span>
                                </div>
                            )}
                            <button className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 shadow-md transition-all hover:bg-gray-200">
                                <Edit className="h-3 w-3 text-gray-600" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {user?.fullName || "User"}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {user?.primaryEmailAddress?.emailAddress || "No email"}
                            </p>
                        </div>

                        {/* Edit Button */}
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200">
                            <Edit className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Privacy Toggles */}
                <div className="mb-6 rounded-2xl bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <span className="text-lg">📍</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">
                                    Location Services
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Allow location tracking
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={locationEnabled}
                                onChange={(e) => handleToggleLocation(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300" />
                        </label>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                <span className="text-lg">📳</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">
                                    Vibration Alerts
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Haptic feedback on notifications
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={vibrateEnabled}
                                onChange={(e) => handleToggleVibrate(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300" />
                        </label>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <span className="text-lg">🔒</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Data Privacy</h3>
                                <p className="text-sm text-gray-500">
                                    Manage your data settings
                                </p>
                            </div>
                        </div>
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200">
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Sign Out Button */}
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
