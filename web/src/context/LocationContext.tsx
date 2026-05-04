import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { Geolocation, Position } from "@capacitor/geolocation";

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    isAvailable: boolean;
}

interface LocationContextType {
    location: LocationState;
    startTracking: () => Promise<void>;
    stopTracking: () => Promise<void>;
}

const defaultLocation: LocationState = {
    latitude: null,
    longitude: null,
    isAvailable: false,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<LocationState>(defaultLocation);
    const watchIdRef = useRef<string | null>(null);

    const startTracking = useCallback(async () => {
        try {
            // Check permissions first
            const permissionStatus = await Geolocation.checkPermissions();

            if (permissionStatus.location === "prompt" || permissionStatus.location === "denied") {
                const requestResult = await Geolocation.requestPermissions();
                if (requestResult.location !== "granted") {
                    throw new Error("Location permission not granted");
                }
            }

            if (permissionStatus.location === "denied") {
                throw new Error("Location permission denied");
            }

            // Start watching position
            const id = await Geolocation.watchPosition(
                { enableHighAccuracy: true, maximumAge: 0 },
                (position, err) => {
                    if (err) {
                        console.error("Error watching position:", err);
                        return;
                    }
                    
                    if (position) {
                        // Update local state so the map marker moves!
                        setLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            isAvailable: true,
                        });
                        // Optional: Log for debugging
                        console.log(`Location updated: ${position.coords.latitude}, ${position.coords.longitude}`);
                    }
                }
            );
            
            watchIdRef.current = id;
            console.log("Started location tracking with watchId:", id);
        } catch (error) {
            console.error("Failed to start location tracking:", error);
            throw error;
        }
    }, []);

    const stopTracking = useCallback(async () => {
        if (watchIdRef.current) {
            try {
                await Geolocation.clearWatch({ id: watchIdRef.current });
                console.log("Stopped location tracking with watchId:", watchIdRef.current);
            } catch (error) {
                console.error("Failed to clear watch:", error);
            } finally {
                watchIdRef.current = null;
                // Optionally reset location when stopping tracking
                // setLocation(defaultLocation);
            }
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTracking().catch(console.error);
        };
    }, [stopTracking]);

    return (
        <LocationContext.Provider value={{ location, startTracking, stopTracking }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
}