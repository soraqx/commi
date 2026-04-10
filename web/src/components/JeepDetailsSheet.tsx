/**
 * JeepDetailsSheet.tsx
 * 
 * Bottom sheet component that slides up over the map
 * when an E-Jeep is clicked, showing details and ETA.
 */

import React from 'react';

interface JeepDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const JeepDetailsSheet: React.FC<JeepDetailsSheetProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-2000 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Bottom sheet */}
            <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-slide-up">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
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

                {/* Content */}
                <div className="px-6 pb-8">
                    {/* Jeep ID */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-[#0db4ff] rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🚌</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">E-JEEP #12</h2>
                            <p className="text-gray-500">Currently en route</p>
                        </div>
                    </div>

                    {/* ETA Section */}
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

                    {/* Status badge */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Capacity Status:</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Not Full
                            </span>
                        </div>
                    </div>

                    {/* Additional info */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">Route</span>
                            <span className="font-medium text-gray-900">Bocaue Loop</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">Next Stop</span>
                            <span className="font-medium text-gray-900">Dr. Yanga's Colleges</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600">Passengers</span>
                            <span className="font-medium text-gray-900">12 / 20</span>
                        </div>
                    </div>

                    {/* Action button */}
                    <button className="w-full mt-6 bg-[#0db4ff] hover:bg-[#0ca3e6] text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-colors duration-200">
                        Track This Jeep
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JeepDetailsSheet;
