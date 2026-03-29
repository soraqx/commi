import React from "react";

type FleetDevice = {
    device_id: string;
    latitude: number;
    longitude: number;
    last_updated: string;
    status: string;
    passenger_count: number;
};

const mockDevices: FleetDevice[] = [
    {
        device_id: "JEEP-001",
        latitude: 14.5995,
        longitude: 120.9842,
        last_updated: "2024-03-29T14:30:00Z",
        status: "Online",
        passenger_count: 12,
    },
    {
        device_id: "JEEP-002",
        latitude: 14.6042,
        longitude: 120.9876,
        last_updated: "2024-03-29T14:28:00Z",
        status: "Online",
        passenger_count: 18,
    },
    {
        device_id: "JEEP-003",
        latitude: 14.5958,
        longitude: 120.9819,
        last_updated: "2024-03-29T14:25:00Z",
        status: "Offline",
        passenger_count: 0,
    },
];

function AdminDashboard() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl">
                    <div className="mb-8">
                        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Admin Dashboard</p>
                        <h1 className="mt-3 text-4xl font-semibold text-white">E-Jeep Fleet Overview</h1>
                        <p className="mt-2 text-sm text-slate-400">This page is linked from /admin and shows a mock fleet table.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl bg-slate-950 p-6 text-center shadow-lg border border-white/10">
                            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Total Jeeps</p>
                            <p className="mt-4 text-3xl font-semibold text-white">{mockDevices.length}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950 p-6 text-center shadow-lg border border-white/10">
                            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Online</p>
                            <p className="mt-4 text-3xl font-semibold text-white">{mockDevices.filter((device) => device.status === "Online").length}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-950 p-6 text-center shadow-lg border border-white/10">
                            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Current Riders</p>
                            <p className="mt-4 text-3xl font-semibold text-white">{mockDevices.reduce((sum, device) => sum + device.passenger_count, 0)}</p>
                        </div>
                    </div>

                    <div className="mt-10 overflow-x-auto rounded-3xl bg-slate-950 shadow-lg border border-white/10">
                        <table className="min-w-full divide-y divide-slate-800 text-left">
                            <thead className="bg-slate-900">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Device ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Lat / Lon</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Last Updated</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">AI Count</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {mockDevices.map((device) => (
                                    <tr key={device.device_id} className="bg-slate-950">
                                        <td className="px-6 py-4 text-sm text-white">{device.device_id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{new Date(device.last_updated).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${device.status === "Online" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                                                {device.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{device.passenger_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
