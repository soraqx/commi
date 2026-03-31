/**
 * MapDisplay.tsx
 * 
 * Full-screen React Leaflet map component with custom markers
 * and floating UI elements for live tracking status.
 * Fills remaining space in flex container.
 */

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Type assertions for react-leaflet v5 compatibility
const MapContainerAny = MapContainer as any;
const TileLayerAny = TileLayer as any;
const MarkerAny = Marker as any;

// Fix for default marker icon
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icon for colleges
const createCollegeIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">🎓</span>
      </div>
    `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });
};

// E-Jeep marker icon
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

interface MapDisplayProps {
    fleetData?: any[];
    onJeepClick?: () => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ fleetData, onJeepClick }) => {
    // Default center: Bocaue / Dr. Yanga's Colleges, Inc. area
    const defaultCenter: [number, number] = [14.7937, 120.9234];
    const defaultZoom = 15;

    // College locations
    const colleges = [
        {
            name: "Dr. Yanga's Colleges, Inc.",
            position: [14.7937, 120.9234] as [number, number],
            color: '#0db4ff',
        },
        {
            name: 'Jesus Is Lord Colleges Foundation, Inc.',
            position: [14.7950, 120.9250] as [number, number],
            color: '#10b981',
        },
    ];

    // Use fleetData if available, otherwise fall back to mock data
    const vehicles = fleetData && fleetData.length > 0
        ? fleetData.map(vehicle => ({
            id: vehicle.deviceId || vehicle._id,
            position: [
                vehicle.latitude ?? vehicle.lat ?? defaultCenter[0],
                vehicle.longitude ?? vehicle.lng ?? defaultCenter[1]
            ] as [number, number],
            status: vehicle.status,
            passengerCount: vehicle.passengerCount ?? 0,
        }))
        : [{
            id: 'E-JEEP #12',
            position: [14.7920, 120.9220] as [number, number],
            status: 'Online',
            passengerCount: 0,
        }];

    return (
        <div className="relative flex-1 w-full h-full">
            {/* Floating UI at top center */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                {/* Placeholder logo */}
                <div className="w-8 h-8 bg-[#0db4ff] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">EJ</span>
                </div>

                {/* Live Tracking pill */}
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live Tracking Active
                </div>
            </div>

            {/* Map */}
            <MapContainerAny
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayerAny
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* College markers */}
                {colleges.map((college, index) => (
                    <MarkerAny
                        key={index}
                        position={college.position}
                        icon={createCollegeIcon(college.color)}
                    >
                        <Popup>
                            <div className="text-center p-2">
                                <strong className="text-gray-900">{college.name}</strong>
                            </div>
                        </Popup>
                    </MarkerAny>
                ))}

                {/* Vehicle markers from fleetData */}
                {vehicles.map((vehicle) => (
                    <MarkerAny
                        key={vehicle.id}
                        position={vehicle.position}
                        icon={createJeepIcon()}
                        eventHandlers={{
                            click: () => {
                                if (onJeepClick) {
                                    onJeepClick();
                                }
                            },
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
        </div>
    );
};

export default MapDisplay;
