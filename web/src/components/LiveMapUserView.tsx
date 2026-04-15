import { useState, useEffect, useRef, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Circle } from "react-leaflet";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation } from "lucide-react";
import { VehicleBottomSheet } from "./VehicleBottomSheet";
import { triggerHaptic } from "../utils/haptics";
import { useLocation } from "../context/LocationContext";

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Type assertions for react-leaflet v5 compatibility
const MapContainerAny = MapContainer as any;
const TileLayerAny = TileLayer as any;
const MarkerAny = Marker as any;
const CircleAny = Circle as any;

const createLandmarkIcon = () => {
    return L.divIcon({
        className: "custom-landmark-marker",
        html: `
            <div style="
                background-color: #6b7280;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
};

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
            className={`absolute bottom-24 right-4 z-1000 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all ${userLocation
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
    const [arrivalNotification, setArrivalNotification] = useState<string | null>(null);
    
    const landmarksData = useQuery(api.landmarks.list);
    const occupiedLandmarks = useRef<Set<string>>(new Set());

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
                    latitude: 14.792,
                    longitude: 120.922,
                },
            ];

    useEffect(() => {
        if (!landmarksData || landmarksData.length === 0 || !selectedVehicle) return;

        const vehicleLat = selectedVehicle.latitude ?? selectedVehicle.position[0];
        const vehicleLng = selectedVehicle.longitude ?? selectedVehicle.position[1];

        landmarksData.forEach((landmark: any) => {
            const distance = getDistanceInMeters(
                vehicleLat,
                vehicleLng,
                landmark.lat,
                landmark.lng
            );
            const withinGeofence = distance <= landmark.radius;

            if (withinGeofence && !occupiedLandmarks.current.has(landmark._id)) {
                occupiedLandmarks.current.add(landmark._id);
                triggerHaptic();
                triggerHaptic();
                setArrivalNotification(`Jeepney has arrived at ${landmark.name}`);
                setTimeout(() => setArrivalNotification(null), 3000);
            } else if (!withinGeofence && occupiedLandmarks.current.has(landmark._id)) {
                occupiedLandmarks.current.delete(landmark._id);
            }
        });
    }, [selectedVehicle, landmarksData]);

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
        <div className="absolute inset-0 h-full w-full">
            {/* Arrival Notification Toast */}
            {arrivalNotification && (
                <div className="absolute top-4 left-4 right-4 z-1000 flex items-center justify-center">
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-pulse">
                        {arrivalNotification}
                    </div>
                </div>
            )}
            
            {/* Map Background - Edge to Edge */}
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

                {/* Landmarks from Convex */}
                {landmarksData && landmarksData.map((landmark: any) => (
                    <Fragment key={landmark._id}>
                        <CircleAny
                            center={[landmark.lat, landmark.lng] as [number, number]}
                            radius={landmark.radius}
                            pathOptions={{
                                color: "#6b7280",
                                fillColor: "#6b7280",
                                fillOpacity: 0.1,
                                weight: 1,
                                dashArray: "5, 5",
                            }}
                        />
                        <MarkerAny
                            position={[landmark.lat, landmark.lng] as [number, number]}
                            icon={createLandmarkIcon()}
                        >
                            <Popup>
                                <div className="text-center p-1">
                                    <strong className="text-gray-900 text-sm">{landmark.name}</strong>
                                    <p className="text-xs text-gray-500 mt-1">Geofence: {landmark.radius}m</p>
                                </div>
                            </Popup>
                        </MarkerAny>
                    </Fragment>
                ))}

                {/* Vehicle markers from fleetData - opens Bottom Sheet on click */}
                {vehicles.map((vehicle) => (
                    <MarkerAny
                        key={vehicle.id}
                        position={vehicle.position}
                        icon={createJeepIcon()}
                        eventHandlers={{
                            click: (e: any) => {
                                L.DomEvent.stopPropagation(e);
                                handleMarkerClick(vehicle);
                            },
                        }}
                    />
                ))}

                {/* Locate Me Button (inside MapContainer to access useMap) */}
                <LocateMeButton userLocation={userLocation} />
            </MapContainerAny>

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
