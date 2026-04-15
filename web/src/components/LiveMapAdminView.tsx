import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, MapPin, Users, Navigation, Sparkles, Plus, Target, Trash2 } from 'lucide-react';

const MapContainerAny = MapContainer as any;
const TileLayerAny = TileLayer as any;
const MarkerAny = Marker as any;
const CircleAny = Circle as any;

const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const createUserLandmarkIcon = () => {
    return L.divIcon({
        className: 'custom-user-landmark-marker',
        html: `
            <div style="
                background-color: #8b5cf6;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    });
};

const createLandmarkIcon = () => {
    return L.divIcon({
        className: 'custom-landmark-marker',
        html: `
            <div style="
                background-color: #6b7280;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    });
};

const createJeepIcon = () => {
    return L.divIcon({
        className: 'custom-jeep-marker',
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

const LANDMARKS = [
    {
        name: "Terminal - Bocaue",
        position: [14.7937, 120.9234] as [number, number],
    },
    {
        name: "Mint Road Stop",
        position: [14.7950, 120.9250] as [number, number],
    },
    {
        name: "Market Square",
        position: [14.7915, 120.9210] as [number, number],
    },
    {
        name: "Church Terminal",
        position: [14.7942, 120.9242] as [number, number],
    },
];

const PROXIMITY_RADIUS_METERS = 50;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function findNearbyLandmark(lat: number, lng: number): string | null {
    for (const landmark of LANDMARKS) {
        const distance = calculateDistance(lat, lng, landmark.position[0], landmark.position[1]);
        if (distance <= PROXIMITY_RADIUS_METERS) {
            return landmark.name;
        }
    }
    return null;
}

function useWindowSize() {
    const [size, setSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1200 });
    
    useEffect(() => {
        const handleResize = () => {
            setSize({ width: window.innerWidth });
        };
        
        window.addEventListener('resize', handleResize);
        handleResize();
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return size;
}

interface SelectedJeepney {
    id: string;
    status: string;
    passengerCount: number;
    latitude: number;
    longitude: number;
    aiStatus?: string;
}

interface LiveMapAdminViewProps {
    fleetData?: any[];
}

function MapClickHandler({ 
    isAddingMode, 
    onMapClick 
}: { 
    isAddingMode: boolean; 
    onMapClick: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click: (e) => {
            if (isAddingMode) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

export function LiveMapAdminView({ fleetData }: LiveMapAdminViewProps) {
    const { width } = useWindowSize();
    const isMobile = width < 768;
    
    const [selectedJeepney, setSelectedJeepney] = useState<SelectedJeepney | null>(null);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [pendingLandmarkLocation, setPendingLandmarkLocation] = useState<{lat: number, lng: number} | null>(null);
    
    const landmarksData = useQuery(api.landmarks.list);
    const createLandmark = useMutation(api.landmarks.create);
    const removeLandmark = useMutation(api.landmarks.remove);
    
    const defaultCenter: [number, number] = [14.7937, 120.9234];
    const defaultZoom = 15;
    
    const vehicles = fleetData && fleetData.length > 0
        ? fleetData.map(vehicle => ({
            id: vehicle.deviceId || vehicle._id,
            position: [
                vehicle.latitude ?? vehicle.lat ?? defaultCenter[0],
                vehicle.longitude ?? vehicle.lng ?? defaultCenter[1]
            ] as [number, number],
            status: vehicle.status,
            passengerCount: vehicle.passengerCount ?? 0,
            latitude: vehicle.latitude ?? vehicle.lat ?? defaultCenter[0],
            longitude: vehicle.longitude ?? vehicle.lng ?? defaultCenter[1],
        }))
        : [{
            id: 'E-JEEP #12',
            position: [14.7920, 120.9220] as [number, number],
            status: 'Online',
            passengerCount: 12,
            latitude: 14.7920,
            longitude: 120.9220,
        }];
    
    const handleJeepClick = useCallback((vehicle: typeof vehicles[0]) => {
        setSelectedJeepney({
            id: vehicle.id,
            status: vehicle.status,
            passengerCount: vehicle.passengerCount,
            latitude: vehicle.latitude,
            longitude: vehicle.longitude,
            aiStatus: 'Ready',
        });
    }, []);
    
    const handleClosePanel = useCallback(() => {
        setSelectedJeepney(null);
    }, []);
    
    const handleMapClick = useCallback(() => {
        setSelectedJeepney(null);
    }, []);
    
    const handleAddLandmarkClick = useCallback((lat: number, lng: number) => {
        setPendingLandmarkLocation({ lat, lng });
    }, []);
    
    const handleSaveLandmark = useCallback(async (name: string, radius: number) => {
        if (pendingLandmarkLocation) {
            await createLandmark({
                name,
                lat: pendingLandmarkLocation.lat,
                lng: pendingLandmarkLocation.lng,
                radius,
            });
            setPendingLandmarkLocation(null);
            setIsAddingMode(false);
        }
    }, [pendingLandmarkLocation, createLandmark]);
    
    const handleDeleteLandmark = useCallback(async (id: string) => {
        await removeLandmark({ id: id as any });
    }, [removeLandmark]);
    
    const handleCancelLandmark = useCallback(() => {
        setPendingLandmarkLocation(null);
    }, []);
    
    const toggleAddingMode = useCallback(() => {
        setIsAddingMode(prev => !prev);
        if (!isAddingMode) {
            setSelectedJeepney(null);
        }
    }, [isAddingMode]);
    
    const nearbyLandmark = selectedJeepney 
        ? findNearbyLandmark(selectedJeepney.latitude, selectedJeepney.longitude)
        : null;
    
    return (
        <div className="relative w-full h-full">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] flex items-center gap-3 bg-slate-900/90 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">EJ</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Live Tracking
                </div>
            </div>
            
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={toggleAddingMode}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isAddingMode
                            ? 'bg-red-500/20 text-red-400 border-2 border-red-500 animate-pulse'
                            : 'bg-slate-900/90 text-slate-300 border border-slate-700/50 hover:bg-slate-800'
                    }`}
                >
                    <Target className="h-4 w-4" />
                    {isAddingMode ? 'Adding...' : 'Add Landmark'}
                </button>
            </div>
            
            {pendingLandmarkLocation && (
                <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-semibold text-white mb-4">Create New Landmark</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Landmark Name
                                </label>
                                <input
                                    id="landmarkName"
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Terminal Stop"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Geofence Radius (meters)
                                </label>
                                <input
                                    id="landmarkRadius"
                                    type="number"
                                    defaultValue={50}
                                    min={10}
                                    max={500}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="text-xs text-slate-500">
                                Location: {pendingLandmarkLocation.lat.toFixed(5)}, {pendingLandmarkLocation.lng.toFixed(5)}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCancelLandmark}
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const nameInput = document.getElementById('landmarkName') as HTMLInputElement;
                                    const radiusInput = document.getElementById('landmarkRadius') as HTMLInputElement;
                                    const name = nameInput?.value?.trim() || 'Unnamed Landmark';
                                    const radius = parseInt(radiusInput?.value) || 50;
                                    handleSaveLandmark(name, radius);
                                }}
                                className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <MapContainerAny
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <MapClickHandler isAddingMode={isAddingMode} onMapClick={handleAddLandmarkClick} />
                <TileLayerAny
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {LANDMARKS.map((landmark, index) => (
                    <Fragment key={`static_${index}`}>
                        <CircleAny
                            center={landmark.position}
                            radius={PROXIMITY_RADIUS_METERS}
                            pathOptions={{
                                color: '#6b7280',
                                fillColor: '#6b7280',
                                fillOpacity: 0.1,
                                weight: 1,
                                dashArray: '5, 5',
                            }}
                        />
                        <MarkerAny
                            position={landmark.position}
                            icon={createLandmarkIcon()}
                        >
                            <Popup>
                                <div className="text-center p-1">
                                    <strong className="text-gray-900 text-sm">{landmark.name}</strong>
                                    <p className="text-xs text-gray-500 mt-1">Geofence: {PROXIMITY_RADIUS_METERS}m</p>
                                </div>
                            </Popup>
                        </MarkerAny>
                    </Fragment>
                ))}
                
                {landmarksData && landmarksData.map((landmark: any) => (
                    <Fragment key={landmark._id}>
                        <CircleAny
                            center={[landmark.lat, landmark.lng] as [number, number]}
                            radius={landmark.radius}
                            pathOptions={{
                                color: '#8b5cf6',
                                fillColor: '#8b5cf6',
                                fillOpacity: 0.15,
                                weight: 2,
                            }}
                        />
                        <MarkerAny
                            position={[landmark.lat, landmark.lng] as [number, number]}
                            icon={createUserLandmarkIcon()}
                        >
                            <Popup>
                                <div className="text-center p-2 min-w-[150px]">
                                    <strong className="text-gray-900 text-sm block">{landmark.name}</strong>
                                    <p className="text-xs text-gray-500 mt-1">Geofence: {landmark.radius}m</p>
                                    <button
                                        onClick={(e: any) => {
                                            e.originalEvent.preventDefault();
                                            handleDeleteLandmark(landmark._id);
                                        }}
                                        className="mt-2 w-full py-1 px-2 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 flex items-center justify-center gap-1"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                    </button>
                                </div>
                            </Popup>
                        </MarkerAny>
                    </Fragment>
                ))}
                
                {vehicles.map((vehicle) => (
                    <MarkerAny
                        key={vehicle.id}
                        position={vehicle.position}
                        icon={createJeepIcon()}
                        eventHandlers={{
                            click: () => handleJeepClick(vehicle),
                        }}
                    >
                        <Popup>
                            <div className="text-center p-2">
                                <strong className="text-gray-900">{vehicle.id}</strong>
                                <br />
                                <span className="text-sm text-gray-600">
                                    {vehicle.status} • {vehicle.passengerCount} passengers
                                </span>
                                <br />
                                <span className="text-sm text-gray-600">Click for details</span>
                            </div>
                        </Popup>
                    </MarkerAny>
                ))}
            </MapContainerAny>
            
            {selectedJeepney && isMobile && (
                <>
                    <div 
                        className="fixed inset-0 z-[1000] bg-black/30 md:hidden"
                        onClick={handleClosePanel}
                    />
                    <div className="fixed inset-x-0 bottom-0 z-[1001] md:hidden">
                        <div className="rounded-t-3xl bg-slate-900 border-t border-slate-700 shadow-2xl">
                            <div className="flex justify-center pt-4 pb-2">
                                <div className="h-1.5 w-12 rounded-full bg-slate-600" />
                            </div>
                            <div className="px-6 pb-6">
                                <button
                                    onClick={handleClosePanel}
                                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 transition-all hover:bg-slate-700"
                                >
                                    <X className="h-4 w-4 text-slate-300" />
                                </button>
                                
                                <h2 className="text-2xl font-bold text-white">{selectedJeepney.id}</h2>
                                
                                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-blue-500/20 p-4 border border-blue-500/30">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                                            Passengers
                                        </p>
                                        <p className="text-3xl font-bold text-white">
                                            {selectedJeepney.passengerCount}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-4 space-y-3 text-sm">
                                    <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3">
                                        <span className="text-slate-400">GPS Location</span>
                                        <span className="text-slate-200 font-mono">
                                            {selectedJeepney.latitude.toFixed(5)}, {selectedJeepney.longitude.toFixed(5)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3">
                                        <span className="text-slate-400">AI Status</span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-purple-400 border border-purple-500/30">
                                            <Sparkles className="h-3 w-3" />
                                            {selectedJeepney.aiStatus || 'Ready'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {selectedJeepney && !isMobile && (
                <div className="absolute right-0 top-0 z-[1001] w-96 h-full bg-slate-900 border-l border-slate-800 shadow-2xl overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">{selectedJeepney.id}</h2>
                            <button
                                onClick={handleClosePanel}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 transition-all hover:bg-slate-700"
                            >
                                <X className="h-4 w-4 text-slate-300" />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4 rounded-2xl bg-blue-500/20 p-5 border border-blue-500/30">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500">
                                <Users className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                                    Passenger Count
                                </p>
                                <p className="text-4xl font-bold text-white">
                                    {selectedJeepney.passengerCount}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-6 space-y-4">
                            <div className="rounded-xl bg-slate-800/50 p-4">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                    <Navigation className="h-3 w-3 inline mr-1" />
                                    GPS Location
                                </p>
                                <p className="text-sm font-mono text-slate-200">
                                    {selectedJeepney.latitude.toFixed(5)}, {selectedJeepney.longitude.toFixed(5)}
                                </p>
                            </div>
                            
                            <div className="rounded-xl bg-slate-800/50 p-4">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                    <Sparkles className="h-3 w-3 inline mr-1" />
                                    AI Status
                                </p>
                                <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-purple-400 border border-purple-500/30">
                                    <Sparkles className="h-3 w-3" />
                                    {selectedJeepney.aiStatus || 'Ready'}
                                </span>
                            </div>
                            
                            {nearbyLandmark && (
                                <div className="rounded-xl bg-emerald-500/20 p-4 border border-emerald-500/30">
                                    <p className="text-xs font-medium text-emerald-400 uppercase tracking-wide mb-1">
                                        <MapPin className="h-3 w-3 inline mr-1" />
                                        Proximity Alert
                                    </p>
                                    <p className="text-sm font-medium text-emerald-300">
                                        Currently at: {nearbyLandmark}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LiveMapAdminView;