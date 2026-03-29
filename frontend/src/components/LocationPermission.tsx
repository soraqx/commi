/**
 * LocationPermission.tsx
 * 
 * Full-screen onboarding component for requesting location permissions.
 * Features decorative circles, tracking icon, and a prominent CTA button.
 */

import React from 'react';

interface LocationPermissionProps {
    onAllowLocation: () => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({ onAllowLocation }) => {
    return (
        <div className="relative min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center px-6">
            {/* Decorative circles */}
            <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-300/50 rounded-full" />
            <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-300/50 rounded-full" />

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                {/* Tracking icon */}
                <div className="mb-8">
                    <svg
                        className="w-24 h-24 text-[#0db4ff]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Enable Location Services
                </h1>

                {/* Subtitle */}
                <p className="text-gray-600 mb-8 text-lg">
                    Allow location access to track E-Jeeps in real-time and get accurate arrival estimates.
                </p>

                {/* Info box */}
                <div className="w-full bg-gray-50 rounded-2xl p-5 mb-10 border border-gray-100">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-[#0db4ff]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">Live Tracking</h3>
                            <p className="text-sm text-gray-500">See E-Jeeps moving on the map in real-time</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-[#0db4ff]"
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
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">Accurate ETAs</h3>
                            <p className="text-sm text-gray-500">Get precise arrival time estimates</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <div className="relative z-10 w-full max-w-sm mt-auto pb-8">
                <button
                    onClick={onAllowLocation}
                    className="w-full bg-[#0db4ff] hover:bg-[#0ca3e6] text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-colors duration-200 shadow-lg shadow-blue-200"
                >
                    Allow Location Access
                </button>
            </div>
        </div>
    );
};

export default LocationPermission;
