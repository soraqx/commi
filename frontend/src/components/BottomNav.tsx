/**
 * BottomNav.tsx
 * 
 * Fixed-bottom navigation bar with three tabs:
 * Live Map, Alerts, and Profile.
 * Hidden on md screens and larger.
 */

import React from "react";
import { NavLink } from "react-router-dom";

interface BottomNavProps {
    activeTab?: 'map' | 'alerts' | 'admin' | 'profile';
    onTabChange?: (tab: 'map' | 'alerts' | 'admin' | 'profile') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({
    activeTab = 'map',
    onTabChange
}) => {
    const tabs = [
        {
            id: 'map' as const,
            path: "/",
            label: 'Live Map',
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                </svg>
            ),
        },
        {
            id: 'alerts' as const,
            label: 'Alerts',
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
            ),
        },
        {
            id: 'admin' as const,
            path: "/admin",
            label: 'Admin',
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.43 1.02c.873-.507 1.87.163 1.87 1.108 0 .716.563 1.3 1.264 1.37.936.103 1.39 1.27.69 1.885a1.724 1.724 0 00-.41 1.904c.3.921-.755 1.688-1.54 1.13a1.724 1.724 0 00-1.966-.073 1.724 1.724 0 00-1.04 1.721c.105.937-.754 1.718-1.573 1.317-.94-.44-2.02.196-2.02 1.223 0 .96-.793 1.778-1.757 1.778s-1.758-.817-1.758-1.778c0-1.027-1.081-1.662-2.02-1.223-.82.401-1.678-.38-1.573-1.317a1.724 1.724 0 00-1.04-1.721c-.785-.558-1.84-.209-1.54-1.13a1.724 1.724 0 00-.41-1.904c-.7-.615-.246-1.782.69-1.885.7-.07 1.264-.654 1.264-1.37 0-.945.997-1.615 1.87-1.108a1.724 1.724 0 002.43-1.02z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            ),
        },
        {
            id: 'profile' as const,
            label: 'Profile',
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1500] bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-around py-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <div key={tab.id} className="relative w-full">
                                {tab.path ? (
                                    <NavLink
                                        to={tab.path}
                                        className={({ isActive }) =>
                                            `flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${isActive
                                                ? "text-[#0db4ff]"
                                                : "text-gray-500 hover:text-gray-700"}`
                                        }
                                    >
                                        <div className="transition-transform duration-200">
                                            {tab.icon}
                                        </div>
                                        <span className="text-xs mt-1 font-medium">{tab.label}</span>
                                    </NavLink>
                                ) : (
                                    <button
                                        onClick={() => onTabChange?.(tab.id)}
                                        className={`flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${isActive
                                            ? 'text-[#0db4ff]'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <div className={`${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                                            {tab.icon}
                                        </div>
                                        <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#0db4ff]' : 'text-gray-500'}`}>
                                            {tab.label}
                                        </span>
                                        {isActive && (
                                            <div className="absolute bottom-0 w-12 h-1 bg-[#0db4ff] rounded-t-full" />
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default BottomNav;
