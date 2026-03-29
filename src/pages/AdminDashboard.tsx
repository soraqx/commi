/**
 * AdminDashboard.tsx
 * 
 * Admin dashboard page displaying fleet status with summary cards and data table.
 * Fetches real-time data from the backend API.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

type FleetDevice = {
    device_id: string;
    latitude: number;
    longitude: number;
    last_updated: string;
    status: string;
    passenger_count: number;
};

type FleetStatusResponse = {
    success: boolean;
    data: FleetDevice[];
    total_devices: number;
    online_devices: number;
    total_passengers: number;
};

function AdminDashboard() {
    const [devices, setDevices] = useState<FleetDevice[]>([]);
    const [totalPassengers, setTotalPassengers] = useState(0);
    const [activeJeeps, setActiveJeeps] = useState(0);
    const [systemAlerts, setSystemAlerts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFleetStatus = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get token from localStorage
                const token = localStorage.getItem('adminToken');

                if (!token) {
                    throw new Error('No authentication token found. Please login again.');
                }

                const response = await fetch("http://localhost:8000/api/admin/fleet-status", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Authentication failed. Please login again.');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: FleetStatusResponse = await response.json();

                setDevices(data.data || []);
                setTotalPassengers(data.total_passengers || 0);
                setActiveJeeps(data.online_devices || 0);
                setSystemAlerts(0); // Backend doesn't return system_alerts, default to 0
            } catch (err) {
                console.error("Error fetching fleet status:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch fleet data");
            } finally {
                setLoading(false);
            }
        };

        fetchFleetStatus();

        // Refresh data every 30 seconds
        const intervalId = setInterval(fetchFleetStatus, 30000);

        return () => clearInterval(intervalId);
    }, []);

    const getStatusBadge = (status: string) => {
        const isOnline = status.toLowerCase() === "online";
        return (
            <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isOnline
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                    }`}
            >
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0db4ff] rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">EJ</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-xs text-gray-500">E-Jeep Fleet Management</p>
                            </div>
                        </div>
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Back to Live Map
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Active E-Jeeps Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Active E-Jeeps
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {loading ? "..." : activeJeeps}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Currently online
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Passengers Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Total Passengers
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {loading ? "..." : totalPassengers}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Across all vehicles
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* System Alerts Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    System Alerts
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {loading ? "..." : systemAlerts}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Active notifications
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Fleet Status</h2>
                        <p className="text-sm text-gray-500">Real-time vehicle tracking and status</p>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="px-6 py-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                                <svg
                                    className="w-6 h-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                            <p className="text-sm text-gray-500 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-[#0db4ff] text-white text-sm font-medium rounded-lg hover:bg-[#0ca3e6] transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !error && (
                        <div className="px-6 py-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                                <svg
                                    className="w-6 h-6 text-blue-600 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Fleet Data</h3>
                            <p className="text-sm text-gray-500">Please wait while we fetch the latest information...</p>
                        </div>
                    )}

                    {/* Data Table */}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Device ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Location (Lat / Lon)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Passenger Count
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Last Updated
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {devices.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No fleet devices found
                                            </td>
                                        </tr>
                                    ) : (
                                        devices.map((device) => (
                                            <tr key={device.device_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-[#0db4ff] rounded-lg flex items-center justify-center mr-3">
                                                            <span className="text-white text-xs font-bold">🚌</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {device.device_id}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600">
                                                        {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {device.passenger_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(device.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(device.last_updated).toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Data refreshes automatically every 30 seconds</p>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
