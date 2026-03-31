import { Clock, X, Check } from "lucide-react";

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

export function VehicleBottomSheet({ vehicle, onClose }: VehicleBottomSheetProps) {
    const getCapacityColor = (capacity: string) => {
        if (capacity.toLowerCase().includes("not full")) {
            return "bg-green-100 text-green-700";
        }
        if (capacity.toLowerCase().includes("full")) {
            return "bg-red-100 text-red-700";
        }
        return "bg-gray-100 text-gray-700";
    };

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
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getCapacityColor(
                                    vehicle.capacity
                                )}`}
                            >
                                <Check className="h-3.5 w-3.5" />
                                {vehicle.capacity}
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
                                <span className="text-sm text-gray-500">Passengers</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {vehicle.passengerCount}
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
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getCapacityColor(
                                    vehicle.capacity
                                )}`}
                            >
                                <Check className="h-3.5 w-3.5" />
                                {vehicle.capacity}
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
                                <span className="text-sm text-gray-500">Passengers</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {vehicle.passengerCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
