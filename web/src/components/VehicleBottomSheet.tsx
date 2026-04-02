import { Clock, X, Check } from "lucide-react";

/** Maximum passenger capacity per vehicle */
const MAX_CAPACITY = 30;

interface VehicleBottomSheetProps {
    vehicle: {
        id: string;
        status: string;
        passengerCount: number;
        eta: string;
        distance: string;
        capacity: string;
    };
    onClose: () => void;
}

/**
 * Determines badge color and styling based on passenger count
 * @param passengerCount - Current number of passengers
 * @returns Tailwind CSS class string for badge styling
 */
function getCapacityBadgeStyle(passengerCount: number): string {
    if (passengerCount < 15) {
        return "bg-emerald-100 text-emerald-700"; // Light Green
    }
    if (passengerCount < 30) {
        return "bg-amber-100 text-amber-700"; // Yellow/Orange
    }
    return "bg-red-100 text-red-700"; // Red
}

/**
 * Determines badge text based on passenger count
 * @param passengerCount - Current number of passengers
 * @returns Badge text label
 */
function getCapacityBadgeText(passengerCount: number): string {
    if (passengerCount < 15) {
        return "Available";
    }
    if (passengerCount < 30) {
        return "Filling Up";
    }
    return "Full";
}

export function VehicleBottomSheet({ vehicle, onClose }: VehicleBottomSheetProps) {
    // Clamp passenger count to not exceed MAX_CAPACITY for display
    const displayPassengerCount = Math.min(vehicle.passengerCount, MAX_CAPACITY);
    const capacityStatus = getCapacityBadgeText(vehicle.passengerCount);

    return (
        <>
            {/* Mobile: Slide-up bottom sheet */}
            <div className="fixed inset-x-0 bottom-0 z-[1001] md:hidden">
                <div className="rounded-t-3xl bg-white shadow-2xl">
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="h-1 w-12 rounded-full bg-gray-300" />
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-8">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200"
                        >
                            <X className="h-4 w-4 text-gray-600" />
                        </button>

                        {/* Vehicle ID */}
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                            {vehicle.id}
                        </h2>

                        {/* ETA and Distance */}
                        <div className="mb-4 flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">
                                Arriving in {vehicle.eta}. ({vehicle.distance})
                            </span>
                        </div>

                        {/* Capacity Badge */}
                        <div className="mb-6">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getCapacityBadgeStyle(
                                    vehicle.passengerCount
                                )}`}
                                role="status"
                                aria-label={`Vehicle capacity: ${displayPassengerCount} of ${MAX_CAPACITY} passengers. Status: ${capacityStatus}`}
                            >
                                <Check className="h-4 w-4" />
                                {capacityStatus}
                            </span>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {vehicle.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Capacity</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {displayPassengerCount} / {MAX_CAPACITY} Passengers
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop: Floating card on left side */}
            <div className="fixed left-24 top-8 z-[1001] hidden w-80 md:block">
                <div className="rounded-2xl bg-white shadow-2xl">
                    {/* Content */}
                    <div className="p-6">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200"
                        >
                            <X className="h-4 w-4 text-gray-600" />
                        </button>

                        {/* Vehicle ID */}
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                            {vehicle.id}
                        </h2>

                        {/* ETA and Distance */}
                        <div className="mb-4 flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">
                                Arriving in {vehicle.eta}. ({vehicle.distance})
                            </span>
                        </div>

                        {/* Capacity Badge */}
                        <div className="mb-6">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getCapacityBadgeStyle(
                                    vehicle.passengerCount
                                )}`}
                                role="status"
                                aria-label={`Vehicle capacity: ${displayPassengerCount} of ${MAX_CAPACITY} passengers. Status: ${capacityStatus}`}
                            >
                                <Check className="h-4 w-4" />
                                {capacityStatus}
                            </span>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {vehicle.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Capacity</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {displayPassengerCount} / {MAX_CAPACITY} Passengers
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
