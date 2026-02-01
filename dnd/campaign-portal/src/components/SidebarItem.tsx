import React from 'react';
import {LucideIcon} from 'lucide-react';

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    active: boolean;
    onClick: () => void;
    color?: 'amber' | 'blue';
}

export function SidebarItem({
                                icon: Icon,
                                label,
                                active,
                                onClick,
                                color = "amber"
                            }: SidebarItemProps) {
    const activeClass = color === 'blue'
        ? 'bg-blue-900/40 text-blue-400 border-l-4 border-blue-500 shadow-lg'
        : 'bg-amber-900/40 text-amber-400 border-l-4 border-amber-500 shadow-lg';

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active ? activeClass : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
        >
            <Icon size={20}/>
            <span className="font-medium">{label}</span>
        </button>
    );
}
