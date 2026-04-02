/**
 * BottomNav.tsx
 * 
 * Fixed-bottom navigation bar with three tabs:
 * Dashboard, Map, and History.
 * Hidden on md screens and larger.
 */

import React from "react";
import { LayoutDashboard, Map, History } from "lucide-react";

interface BottomNavProps {
    activeTab?: 'dashboard' | 'map' | 'history';
    onTabChange?: (tab: 'dashboard' | 'map' | 'history') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({
    activeTab = 'dashboard',
    onTabChange
}) => {
    const tabs = [
        {
            id: 'dashboard' as const,
            label: 'Dashboard',
            icon: (
                <LayoutDashboard className="w-6 h-6" />
            ),
        },
        {
            id: 'map' as const,
            label: 'Map',
            icon: (
                <Map className="w-6 h-6" />
            ),
        },
        {
            id: 'history' as const,
            label: 'History',
            icon: (
                <History className="w-6 h-6" />
            ),
        },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1500] glass-bottom-nav">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-around py-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <div key={tab.id} className="relative w-full">
                                <button
                                    onClick={() => onTabChange?.(tab.id)}
                                    className={`flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${isActive
                                            ? 'text-[#3b82f6]'
                                            : 'text-[#94a3b8] hover:text-[#475569]'
                                        }`}
                                >
                                    <div className={`${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                                        {tab.icon}
                                    </div>
                                    <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#3b82f6]' : 'text-[#94a3b8]'}`}>
                                        {tab.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute bottom-0 w-12 h-1 bg-[#3b82f6] rounded-t-full" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default BottomNav;
