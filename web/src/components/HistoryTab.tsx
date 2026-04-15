import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Search, Calendar, Download, MapPin, Users, Gauge, AlertTriangle, WifiOff } from 'lucide-react';

type EventType = 'ping' | 'geofence' | 'warning' | 'offline';

const eventTypeStyles: Record<EventType, string> = {
    ping: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    geofence: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    offline: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const eventTypeLabels: Record<EventType, string> = {
    ping: 'Normal Ping',
    geofence: 'Geofence Entry',
    warning: 'Overload Warning',
    offline: 'Offline Alert',
};

interface LogEntry {
    _id: string;
    _creationTime: number;
    vehicleId: string;
    eventType: EventType;
    lat: number;
    lng: number;
    passengerCount: number;
    speed: number;
    details?: string;
}

export function HistoryTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Events');

    const logs = useQuery(api.history.list) as LogEntry[] | null | undefined;

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredLogs = (logs || []).filter((log: LogEntry) => {
        const matchesSearch = log.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Events' ||
            (statusFilter === 'Warnings' && log.eventType === 'warning') ||
            (statusFilter === 'Offline Alerts' && log.eventType === 'offline') ||
            (statusFilter === 'Geofence Events' && log.eventType === 'geofence') ||
            (statusFilter === 'Normal Pings' && log.eventType === 'ping');
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="h-full overflow-y-auto overscroll-none pb-[calc(env(safe-area-inset-bottom)+2rem)] p-4 lg:p-6">


            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 md:items-center">
                <div className="flex-1 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by Vehicle ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm w-full md:w-auto">
                    <Calendar className="h-4 w-4" />
                    <span>Last 7 Days</span>
                </button>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full md:w-auto"
                >
                    <option value="All Events">All Events</option>
                    <option value="Normal Pings">Normal Pings</option>
                    <option value="Geofence Events">Geofence Events</option>
                    <option value="Warnings">Warnings</option>
                    <option value="Offline Alerts">Offline Alerts</option>
                </select>

                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors text-sm w-full md:w-auto md:ml-auto">
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block w-full overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                <table className="w-full">
                    <thead className="bg-slate-800/80 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Node ID</th>
                            <th className="px-6 py-4">Event Type</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Metrics</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredLogs.map((log: LogEntry) => (
                            <tr
                                key={log._id}
                                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm text-slate-300">
                                    {formatTimestamp(log._creationTime)}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-white">
                                    {log.vehicleId}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${eventTypeStyles[log.eventType as EventType]}`}>
                                        {log.eventType === 'warning' && <AlertTriangle className="h-3 w-3" />}
                                        {log.eventType === 'offline' && <WifiOff className="h-3 w-3" />}
                                        {log.eventType === 'geofence' && <MapPin className="h-3 w-3" />}
                                        {eventTypeLabels[log.eventType as EventType]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    <div>{log.details || 'Unknown Location'}</div>
                                    <div className="text-xs text-slate-500 font-mono">
                                        {log.lat.toFixed(4)}, {log.lng.toFixed(4)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-sm text-slate-300">
                                            <Users className="h-3.5 w-3.5 text-slate-500" />
                                            {log.passengerCount}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-sm text-slate-300">
                                            <Gauge className="h-3.5 w-3.5 text-slate-500" />
                                            {log.speed} km/h
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredLogs.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-slate-400">No logs found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="flex flex-col gap-3 md:hidden">
                {filteredLogs.map((log: LogEntry) => (
                    <div key={log._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-white">{log.vehicleId}</span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${eventTypeStyles[log.eventType as EventType]}`}>
                                {log.eventType === 'warning' && <AlertTriangle className="h-3 w-3" />}
                                {log.eventType === 'offline' && <WifiOff className="h-3 w-3" />}
                                {log.eventType === 'geofence' && <MapPin className="h-3 w-3" />}
                                {eventTypeLabels[log.eventType as EventType]}
                            </span>
                        </div>
                        <div className="text-xs text-slate-400">
                            {formatTimestamp(log._creationTime)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-1 pt-3 border-t border-slate-800/50">
                            <span className="text-sm text-slate-300">Pax: {log.passengerCount}</span>
                            <span className="text-sm text-slate-300">Speed: {log.speed} km/h</span>
                            {log.details && (
                                <span className="col-span-2 text-xs text-slate-500 italic">{log.details}</span>
                            )}
                        </div>
                    </div>
                ))}
                {filteredLogs.length === 0 && (
                    <div className="p-6 text-center">
                        <p className="text-slate-400">No logs found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}