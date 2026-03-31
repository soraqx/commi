import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Users, MapPin, Activity, Truck, Wifi, WifiOff } from "lucide-react";


export default function App() {
    return (
        <main className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
            {/* 1. What users see when NOT logged in */}
            <SignedOut>
                <div className="flex flex-col items-center justify-center min-h-screen px-4">
                    <div className="text-center max-w-md">
                        <div className="mb-6">
                            <Activity className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--color-accent-primary)" }} />
                            <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                                Welcome to AI-JEEP
                            </h1>
                            <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
                                AIoT Transport Safety System
                            </p>
                        </div>
                        <p className="mb-8" style={{ color: "var(--color-text-muted)" }}>
                            Please sign in to view the real-time fleet monitoring dashboard.
                        </p>
                        <SignInButton mode="modal">
                            <button
                                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    backgroundColor: "var(--color-accent-primary)"
                                }}
                            >
                                Sign In to Dashboard
                            </button>
                        </SignInButton>
                    </div>
                </div>
            </SignedOut>

            {/* 2. What users see WHEN logged in */}
            <SignedIn>
                <Dashboard />
            </SignedIn>
        </main>
    );
}

// Separate component to keep the file clean
function Dashboard() {
    // Fetch the data and the mutation function from your Convex backend
    const fleetData = useQuery(api.fleet.getFleetStatus);
    const seedData = useMutation(api.fleet.seedMockData);

    // Calculate stats from fleetData
    const totalFleet = fleetData?.length ?? 0;
    const activeUnits = fleetData?.filter((v: any) => v.status === "Online").length ?? 0;
    const totalPassengers = fleetData?.reduce((sum: number, v: any) => sum + v.passengerCount, 0) ?? 0;

    // Show a loading state while Convex connects
    if (fleetData === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div
                        className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                        style={{ borderColor: "var(--color-accent-primary)", borderTopColor: "transparent" }}
                    />
                    <p style={{ color: "var(--color-text-secondary)" }}>Loading fleet data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Top Navigation Bar */}
            <header
                className="sticky top-0 z-50 border-b"
                style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    borderColor: "var(--color-border)"
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <Activity className="w-8 h-8" style={{ color: "var(--color-accent-primary)" }} />
                            <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                                AI-JEEP
                            </h1>
                            <span
                                className="hidden sm:inline-block text-sm px-2 py-1 rounded"
                                style={{
                                    backgroundColor: "var(--color-bg-tertiary)",
                                    color: "var(--color-text-muted)"
                                }}
                            >
                                Fleet Operations
                            </span>
                        </div>
                        <UserButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Fleet Card */}
                    <div
                        className="rounded-xl p-6 border"
                        style={{
                            backgroundColor: "var(--color-bg-card)",
                            borderColor: "var(--color-border)",
                            boxShadow: "var(--shadow-card)"
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                                    Total Fleet
                                </p>
                                <p className="text-3xl font-bold mt-1" style={{ color: "var(--color-text-primary)" }}>
                                    {totalFleet}
                                </p>
                            </div>
                            <div
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
                            >
                                <Truck className="w-6 h-6" style={{ color: "var(--color-accent-primary)" }} />
                            </div>
                        </div>
                    </div>

                    {/* Active Units Card */}
                    <div
                        className="rounded-xl p-6 border"
                        style={{
                            backgroundColor: "var(--color-bg-card)",
                            borderColor: "var(--color-border)",
                            boxShadow: "var(--shadow-card)"
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                                    Active Units
                                </p>
                                <p className="text-3xl font-bold mt-1" style={{ color: "var(--color-status-online)" }}>
                                    {activeUnits}
                                </p>
                            </div>
                            <div
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: "var(--color-status-online-bg)" }}
                            >
                                <Wifi className="w-6 h-6" style={{ color: "var(--color-status-online)" }} />
                            </div>
                        </div>
                    </div>

                    {/* Total Passengers Card */}
                    <div
                        className="rounded-xl p-6 border"
                        style={{
                            backgroundColor: "var(--color-bg-card)",
                            borderColor: "var(--color-border)",
                            boxShadow: "var(--shadow-card)"
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                                    Total Passengers
                                </p>
                                <p className="text-3xl font-bold mt-1" style={{ color: "var(--color-text-primary)" }}>
                                    {totalPassengers}
                                </p>
                            </div>
                            <div
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
                            >
                                <Users className="w-6 h-6" style={{ color: "var(--color-accent-secondary)" }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fleet Cards Section */}
                {fleetData.length === 0 ? (
                    /* Empty State */
                    <div
                        className="rounded-xl border p-12 text-center"
                        style={{
                            backgroundColor: "var(--color-bg-card)",
                            borderColor: "var(--color-border)",
                            boxShadow: "var(--shadow-card)"
                        }}
                    >
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
                        >
                            <Truck className="w-10 h-10" style={{ color: "var(--color-text-muted)" }} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                            No Fleet Data Found
                        </h2>
                        <p className="mb-8 max-w-md mx-auto" style={{ color: "var(--color-text-muted)" }}>
                            Your database is currently empty. Seed initial mock data to start monitoring your fleet in real-time.
                        </p>
                        <button
                            onClick={() => seedData()}
                            className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center space-x-2"
                            style={{
                                backgroundColor: "var(--color-accent-primary)"
                            }}
                        >
                            <Activity className="w-5 h-5" />
                            <span>Seed Mock Data</span>
                        </button>
                    </div>
                ) : (
                    /* Fleet Cards Grid */
                    <div>
                        <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
                            Fleet Status
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {fleetData.map((vehicle: any) => (
                                <div
                                    key={vehicle._id}
                                    className="rounded-xl border p-6 transition-all duration-200 hover:scale-[1.02]"
                                    style={{
                                        backgroundColor: "var(--color-bg-card)",
                                        borderColor: "var(--color-border)",
                                        boxShadow: "var(--shadow-card)"
                                    }}
                                >
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                            {vehicle.deviceId}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-sm font-medium ${vehicle.status === "Online" ? "animate-pulse-online" : ""
                                                }`}
                                            style={{
                                                backgroundColor: vehicle.status === "Online"
                                                    ? "var(--color-status-online-bg)"
                                                    : "var(--color-status-offline-bg)",
                                                color: vehicle.status === "Online"
                                                    ? "var(--color-status-online)"
                                                    : "var(--color-status-offline)"
                                            }}
                                        >
                                            {vehicle.status === "Online" ? (
                                                <Wifi className="w-4 h-4" />
                                            ) : (
                                                <WifiOff className="w-4 h-4" />
                                            )}
                                            <span>{vehicle.status}</span>
                                        </span>
                                    </div>

                                    {/* Passenger Count */}
                                    <div
                                        className="flex items-center space-x-3 p-3 rounded-lg mb-3"
                                        style={{ backgroundColor: "var(--color-bg-tertiary)" }}
                                    >
                                        <Users className="w-5 h-5" style={{ color: "var(--color-accent-secondary)" }} />
                                        <div>
                                            <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                                                Passengers
                                            </p>
                                            <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                                {vehicle.passengerCount}
                                            </p>
                                        </div>
                                    </div>

                                    {/* GPS Coordinates */}
                                    <div
                                        className="flex items-center space-x-3 p-3 rounded-lg mb-4"
                                        style={{ backgroundColor: "var(--color-bg-tertiary)" }}
                                    >
                                        <MapPin className="w-5 h-5" style={{ color: "var(--color-status-offline)" }} />
                                        <div>
                                            <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                                                GPS Coordinates
                                            </p>
                                            <p className="text-sm font-mono" style={{ color: "var(--color-text-secondary)" }}>
                                                {vehicle.latitude.toFixed(6)}, {vehicle.longitude.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Last Sync */}
                                    <div className="pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                            Last Sync: {new Date(vehicle.lastUpdated).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
