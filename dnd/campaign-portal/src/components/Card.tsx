import React, {ReactNode} from 'react';
import {LucideIcon} from 'lucide-react';

interface CardProps {
    title: string,
    children: ReactNode,
    icon?: LucideIcon,
    className?: string,
    theme?: 'amber' | 'blue',
    actions?: ReactNode,
    onClick?: () => void
}

export function Card({
                         title,
                         children,
                         icon: Icon,
                         className = "",
                         theme = "amber",
                         actions,
                         onClick
                     }: CardProps) {
    return (
        <div
            className={`bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm shadow-xl ${className}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center space-x-2 ${theme === 'blue' ? 'text-blue-500' : 'text-amber-500'}`}>
                    {Icon && <Icon size={18}/>}
                    <h3 className="font-serif text-xl font-bold tracking-wide">{title}</h3>
                </div>
                {actions && <div className="flex space-x-2">{actions}</div>}
            </div>
            {children}
        </div>
    );
}
