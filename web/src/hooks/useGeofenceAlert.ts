import { useEffect, useRef } from 'react';
import { Haptics } from '@capacitor/haptics';

/**
 * Haversine formula: Calculate the distance between two geographic coordinates in kilometers
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

interface Location {
    lat: number;
    lng: number;
}

interface Vehicle {
    id: string;
    lat: number;
    lng: number;
    [key: string]: any; // Allow additional properties
}

interface UseGeofenceAlertOptions {
    userLocation: Location | null;
    vehicles: Vehicle[];
    radiusKm?: number;
    onVehicleEnter?: (vehicleId: string) => void;
    onVehicleExit?: (vehicleId: string) => void;
}

/**
 * Custom React hook for geofence proximity alerts
 * Triggers haptic feedback when a vehicle enters the specified radius and prevents infinite loops
 *
 * @param userLocation - User's current location {lat, lng}
 * @param vehicles - Array of vehicle objects with id, lat, lng
 * @param radiusKm - Geofence radius in kilometers (default: 1)
 * @param onVehicleEnter - Optional callback when a vehicle enters the geofence
 * @param onVehicleExit - Optional callback when a vehicle exits the geofence
 */
export function useGeofenceAlert({
    userLocation,
    vehicles,
    radiusKm = 1,
    onVehicleEnter,
    onVehicleExit,
}: UseGeofenceAlertOptions): void {
    // Registry to track which vehicles have already triggered an alert
    const notifiedVehiclesRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Skip if user location is not available
        if (!userLocation || !vehicles.length) {
            return;
        }

        vehicles.forEach((vehicle) => {
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                vehicle.lat,
                vehicle.lng
            );

            const isInGeofence = distance <= radiusKm;
            const wasNotified = notifiedVehiclesRef.current.has(vehicle.id);

            // Vehicle entering geofence: trigger haptics and register
            if (isInGeofence && !wasNotified) {
                // Trigger vibration
                Haptics.vibrate({ duration: 500 }).catch((error) => {
                    console.warn('Haptic feedback failed:', error);
                });

                // Register vehicle as notified
                notifiedVehiclesRef.current.add(vehicle.id);

                // Optional: Call callback
                onVehicleEnter?.(vehicle.id);

                // Debug logging (optional)
                console.debug(
                    `[Geofence] Vehicle ${vehicle.id} entered geofence. Distance: ${distance.toFixed(2)}km`
                );
            }

            // Vehicle exiting geofence: remove from registry
            if (!isInGeofence && wasNotified) {
                // Unregister vehicle to allow re-triggering if it comes back
                notifiedVehiclesRef.current.delete(vehicle.id);

                // Optional: Call callback
                onVehicleExit?.(vehicle.id);

                // Debug logging (optional)
                console.debug(
                    `[Geofence] Vehicle ${vehicle.id} exited geofence. Distance: ${distance.toFixed(2)}km`
                );
            }
        });
    }, [userLocation, vehicles, radiusKm, onVehicleEnter, onVehicleExit]);
}
