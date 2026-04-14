import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Geolocation } from "@capacitor/geolocation";

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    isAvailable: boolean;
}

interface LocationContextType {
    location: LocationState;
    requestLocation: () => Promise<boolean>;
    clearLocation: () => void;
}

const defaultLocation: LocationState = {
    latitude: null,
    longitude: null,
    isAvailable: false,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<LocationState>(defaultLocation);

    const requestLocation = useCallback(async (): Promise<boolean> => {
        try {
            const permissionStatus = await Geolocation.checkPermissions();

            if (permissionStatus.location === "prompt" || permissionStatus.location === "denied") {
                const requestResult = await Geolocation.requestPermissions();
                if (requestResult.location !== "granted") {
                    return false;
                }
            }

            if (permissionStatus.location === "denied") {
                return false;
            }

            const position = await Geolocation.getCurrentPosition();
            const { latitude, longitude } = position.coords;

            console.log(`User Location: ${latitude}, ${longitude}`);

            setLocation({
                latitude,
                longitude,
                isAvailable: true,
            });

            return true;
        } catch (error) {
            console.error("Failed to get location:", error);
            return false;
        }
    }, []);

    const clearLocation = useCallback(() => {
        setLocation(defaultLocation);
    }, []);

    return (
        <LocationContext.Provider value={{ location, requestLocation, clearLocation }}>
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