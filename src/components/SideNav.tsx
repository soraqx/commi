/**
 * SideNav.tsx
 * 
 * Desktop side navigation component with dashboard links.
 * Only visible on md screens and larger.
 */

import React from "react";
import { NavLink } from "react-router-dom";

interface SideNavProps {
    activeTab?: 'map' | 'alerts' | 'admin' | 'profile';
    onTabChange?: (tab: 'map' | 'alerts' | 'admin' | 'profile') => void;
}

const SideNav: React.FC<SideNavProps> = ({
    activeTab = 'map',
    onTabChange
}) => {
    const navItems = [
        {
            id: 'map' as const,
            path: "/",
            label: 'Live Map',
            icon: (
                <svg
                    className="w-5 h-5"
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
                    className="w-5 h-5"
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
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
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
                    className="w-5 h-5"
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
        <nav className="hidden md:flex flex-col w-64 bg-gray-900 text-white">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0db4ff] rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">EJ</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">E-Jeep Tracker</h1>
                        <p className="text-xs text-gray-400">Real-time tracking</p>
                    </div>
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 py-6">
                <ul className="space-y-2 px-4">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            {item.path ? (
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive
                                            ? "bg-[#0db4ff] text-white"
                                            : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
                                    }
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            ) : (
                                <button
                                    onClick={() => onTabChange?.(item.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <svg
                            className="w-5 h-5 text-gray-400"
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
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white">Admin User</p>
                        <p className="text-xs text-gray-400">admin@ejeeP.com</p>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default SideNav;
