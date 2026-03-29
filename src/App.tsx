import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
    return (
        <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
            {/* 1. What users see when NOT logged in */}
            <SignedOut>
                <div style={{ textAlign: "center", marginTop: "20vh" }}>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Welcome to AI-JEEP</h1>
                    <p style={{ color: "#666", marginBottom: "2rem" }}>Please sign in to view the transport fleet dashboard.</p>
                    <SignInButton mode="modal">
                        <button style={btnStyle}>Sign In to Dashboard</button>
                    </SignInButton>
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

    // Show a loading state while Convex connects
    if (fleetData === undefined) {
        return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading fleet data...</p>;
    }

    return (
        <div>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eaeaea", paddingBottom: "1rem" }}>
                <h1>AI-JEEP Fleet Operations</h1>
                <UserButton />
            </header>

            {/* If the database is empty, show the button to inject your mock data */}
            {fleetData.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: "4rem", padding: "2rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h2>No Data Found</h2>
                    <p style={{ marginBottom: "1rem" }}>Your database is currently empty.</p>
                    <button onClick={() => seedData()} style={btnStyle}>
                        Seed Initial Mock Data
                    </button>
                </div>
            ) : (
                // Display the actual fleet data in a grid
                <div style={{ display: "grid", gap: "1.5rem", marginTop: "2rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                    {fleetData.map((vehicle) => (
                        <div key={vehicle._id} style={{ border: "1px solid #eaeaea", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h3 style={{ margin: 0 }}>{vehicle.deviceId}</h3>
                                <span style={{
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "99px",
                                    fontSize: "0.875rem",
                                    backgroundColor: vehicle.status === "Online" ? "#dcfce7" : "#fee2e2",
                                    color: vehicle.status === "Online" ? "#166534" : "#991b1b"
                                }}>
                                    {vehicle.status}
                                </span>
                            </div>
                            <p style={{ margin: "0.5rem 0" }}><strong>Passengers:</strong> {vehicle.passengerCount}</p>
                            <p style={{ margin: "0.5rem 0" }}><strong>Coordinates:</strong> {vehicle.latitude}, {vehicle.longitude}</p>
                            <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "1rem", marginBottom: 0 }}>
                                Updated: {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// A simple inline style object for the buttons
const btnStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
};