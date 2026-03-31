import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Layers, X } from "lucide-react";
import { VehicleBottomSheet } from "./VehicleBottomSheet";

// Type assertions for react-leaflet v5 compatibility
const MapContainerAny = MapContainer as any;
const TileLayerAny = TileLayer as any;
const MarkerAny = Marker as any;

// Fix for default marker icon
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// E-Jeep marker icon
const createJeepIcon = () => {
    return L.divIcon({
        className: "custom-jeep-marker",
        html: `
      <div style="
        background-color: #0db4ff;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="font-size: 18px;">🚌</span>
      </div>
    `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
};

interface LiveMapUserViewProps {
    fleetData: any[];
}

export function LiveMapUserView({ fleetData }: LiveMapUserViewProps) {
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
    const [showBottomSheet, setShowBottomSheet] = useState(false);

    // Default center: Bocaue / Dr. Yanga's Colleges, Inc. area
    const defaultCenter: [number, number] = [14.7937, 120.9234];
    const defaultZoom = 15;

    // Process fleetData to create vehicle markers
    const vehicles =
        fleetData && fleetData.length > 0
            ? fleetData.map((vehicle) => ({
                id: vehicle.deviceId || vehicle._id,
                position: [
                    vehicle.latitude ?? vehicle.lat ?? defaultCenter[0],
                    vehicle.longitude ?? vehicle.lng ?? defaultCenter[1],
                ] as [number, number],
                status: vehicle.status,
                passengerCount: vehicle.passengerCount ?? 0,
                eta: vehicle.eta ?? "~4 mins",
                distance: vehicle.distance ?? "1.2km",
                capacity: vehicle.capacity ?? "Not Full",
            }))
            : [
                {
                    id: "E-JEEP #12",
                    position: [14.792, 120.922] as [number, number],
                    status: "Online",
                    passengerCount: 15,
                    eta: "~4 mins",
                    distance: "1.2km",
                    capacity: "Not Full",
                },
            ];

    const handleMarkerClick = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setShowBottomSheet(true);
    };

    const handleCloseBottomSheet = () => {
        setShowBottomSheet(false);
        setSelectedVehicle(null);
    };

    return (
        <div className="relative h-screen w-full">
            {/* Map Background */}
            <MapContainerAny
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                <TileLayerAny
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Vehicle markers from fleetData */}
                {vehicles.map((vehicle) => (
                    <MarkerAny
                        key={vehicle.id}
                        position={vehicle.position}
                        icon={createJeepIcon()}
                        eventHandlers={{
                            click: () => handleMarkerClick(vehicle),
                        }}
                    >
                        <Popup>
                            <div className="text-center p-2">
                                <strong className="text-gray-900">
                                    {vehicle.id}
                                </strong>
                                <br />
                                <span className="text-sm text-gray-600">
                                    {vehicle.status} • {vehicle.passengerCount}{" "}
                                    passengers
                                </span>
                            </div>
                        </Popup>
                    </MarkerAny>
                ))}
            </MapContainerAny>

            {/* Floating Logo at Top Center */}
            <div className="absolute left-1/2 top-4 z-[1000] flex -translate-x-1/2 transform items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-500">
                    <span className="text-sm font-bold text-white">C</span>
                </div>
            </div>

            {/* Layers Button at Top Right */}
            <button className="absolute right-4 top-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition-all hover:bg-white">
                <Layers className="h-5 w-5 text-gray-700" />
            </button>

            {/* Live Tracking Status Pill */}
            <div className="absolute left-1/2 top-20 z-[1000] flex -translate-x-1/2 transform items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 shadow-lg">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Live Tracking Active
            </div>

            {/* Vehicle Bottom Sheet */}
            {showBottomSheet && selectedVehicle && (
                <VehicleBottomSheet
                    vehicle={selectedVehicle}
                    onClose={handleCloseBottomSheet}
                />
            )}
        </div>
    );
}
