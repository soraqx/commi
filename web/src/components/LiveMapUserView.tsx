import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Layers, Navigation } from "lucide-react";
import { VehicleBottomSheet } from "./VehicleBottomSheet";
import { triggerHaptic } from "../utils/haptics";
import { useLocation } from "../context/LocationContext";

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

/**
 * Component to render user location marker and handle auto-centering
 */
function UserLocationMarker({
    userLocation,
    onMapReady,
}: {
    userLocation: [number, number] | null;
    onMapReady: () => void;
}) {
    const map = useMap();
    const hasAutocentered = useRef(false);

    useEffect(() => {
        if (userLocation && !hasAutocentered.current) {
            // Auto-center on first location fetch
            map.flyTo(userLocation, 16, { duration: 1.5 });
            hasAutocentered.current = true;
            onMapReady();
        }
    }, [userLocation, map, onMapReady]);

    if (!userLocation) {
        return null;
    }

    return (
        <CircleMarker
            center={userLocation}
            radius={8}
            fill={true}
            fillColor="#1e40af"
            fillOpacity={0.8}
            color="#ffffff"
            weight={2}
            opacity={1}
            className="user-location-marker"
        >
            <Popup>
                <div className="text-center p-2">
                    <strong className="text-gray-900">Your Location</strong>
                    <br />
                    <span className="text-xs text-gray-600">
                        {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                    </span>
                </div>
            </Popup>
        </CircleMarker>
    );
}

/**
 * Floating "Locate Me" button component
 */
function LocateMeButton({
    userLocation,
}: {
    userLocation: [number, number] | null;
}) {
    const map = useMap();
    const [isAnimating, setIsAnimating] = useState(false);

    const handleLocateMe = () => {
        if (!userLocation) {
            console.warn("User location not available yet");
            return;
        }

        setIsAnimating(true);
        map.flyTo(userLocation, 16, { duration: 1 });
        setTimeout(() => setIsAnimating(false), 1000);
    };

    return (
        <button
            onClick={handleLocateMe}
            disabled={!userLocation}
            className={`absolute bottom-24 right-4 z-[1000] flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all ${userLocation
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
                } ${isAnimating ? "animate-pulse" : ""}`}
            title="Center map on your location"
        >
            <Navigation
                className={`h-5 w-5 text-white ${isAnimating ? "animate-spin" : ""
                    }`}
            />
        </button>
    );
}

interface LiveMapUserViewProps {
    fleetData: any[];
}

export function LiveMapUserView({ fleetData }: LiveMapUserViewProps) {
    const { location } = useLocation();
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [_mapReady, setMapReady] = useState(false);

    // Use location from context if available, otherwise use default
    const userLocation: [number, number] | null = location.isAvailable && location.latitude !== null && location.longitude !== null
        ? [location.latitude, location.longitude]
        : null;

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
        triggerHaptic();
        setSelectedVehicle(vehicle);
        setShowBottomSheet(true);
    };

    const handleCloseBottomSheet = () => {
        setShowBottomSheet(false);
        setSelectedVehicle(null);
    };

    const handleMapClick = () => {
        if (showBottomSheet) {
            setShowBottomSheet(false);
            setSelectedVehicle(null);
        }
    };

    return (
        <div className="h-full w-full overflow-hidden">
            {/* Map Background */}
            <MapContainerAny
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
                eventHandlers={{
                    click: handleMapClick,
                }}
            >
                <TileLayerAny
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                <UserLocationMarker
                    userLocation={userLocation}
                    onMapReady={() => setMapReady(true)}
                />

                {/* Vehicle markers from fleetData - opens Bottom Sheet on click */}
                {vehicles.map((vehicle) => (
                    <MarkerAny
                        key={vehicle.id}
                        position={vehicle.position}
                        icon={createJeepIcon()}
                        eventHandlers={{
                            click: (e) => {
                                L.DomEvent.stopPropagation(e);
                                handleMarkerClick(vehicle);
                            },
                        }}
                    />
                ))}

                {/* Locate Me Button (inside MapContainer to access useMap) */}
                <LocateMeButton userLocation={userLocation} />
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
