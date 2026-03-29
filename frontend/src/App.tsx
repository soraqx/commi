/**
 * App.tsx
 * 
 * Main application component with route-based navigation for the public map
 * interface and the admin portal.
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LocationPermission from './components/LocationPermission';
import MapDisplay from './components/MapDisplay';
import JeepDetailsSheet from './components/JeepDetailsSheet';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import AdminDashboard from './pages/AdminDashboard';

type TabType = 'map' | 'alerts' | 'admin' | 'profile';

type MobileTabType = 'map' | 'alerts' | 'profile';

function MainApp() {
    const [showMap, setShowMap] = useState(false);
    const [showJeepDetails, setShowJeepDetails] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('map');

    const handleAllowLocation = () => {
        setShowMap(true);
    };

    const handleJeepClick = () => {
        setShowJeepDetails(true);
    };

    const handleCloseJeepDetails = () => {
        setShowJeepDetails(false);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    return (
        <div className="h-screen bg-gray-100">
            {!showMap ? (
                <LocationPermission onAllowLocation={handleAllowLocation} />
            ) : (
                <div className="flex flex-col md:flex-row h-full">
                    <SideNav activeTab={activeTab} onTabChange={handleTabChange} />

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 relative">
                            <MapDisplay onJeepClick={handleJeepClick} />

                            {showJeepDetails && (
                                <div className="hidden md:block fixed right-0 top-0 h-full w-80 bg-white shadow-xl p-6 z-[1500] overflow-y-auto">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">E-Jeep Details</h2>
                                        <button
                                            onClick={handleCloseJeepDetails}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            <svg
                                                className="w-5 h-5 text-gray-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-[#0db4ff] rounded-xl flex items-center justify-center">
                                            <span className="text-2xl">🚌</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">E-JEEP #12</h3>
                                            <p className="text-gray-500">Currently en route</p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#0db4ff] rounded-full flex items-center justify-center">
                                                <svg
                                                    className="w-5 h-5 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Estimated Arrival</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    Arriving in ~4 mins. (1.2km)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">Capacity Status:</span>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                Not Full
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Route</span>
                                            <span className="font-medium text-gray-900">Bocaue Loop</span>
                                        </div>
                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Next Stop</span>
                                            <span className="font-medium text-gray-900">Dr. Yanga's Colleges</span>
                                        </div>
                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Passengers</span>
                                            <span className="font-medium text-gray-900">12 / 20</span>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-2xl p-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                                <svg
                                                    className="w-5 h-5 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">AI Passenger Count</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    12 passengers detected
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full bg-[#0db4ff] hover:bg-[#0ca3e6] text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-colors duration-200">
                                        Track This Jeep
                                    </button>
                                </div>
                            )}
                        </div>

                        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
                    </div>

                    <JeepDetailsSheet
                        isOpen={showJeepDetails}
                        onClose={handleCloseJeepDetails}
                    />
                </div>
            )}
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainApp />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
