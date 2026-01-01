import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
}) => {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={`
        bg-white rounded-xl border border-slate-200/60
        shadow-sm hover:shadow-md transition-shadow duration-200
        ${paddings[padding]} ${className}
      `}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    subtitle,
    action,
    className = '',
}) => {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            <div>
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                {subtitle && (
                    <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'teal' | 'orange' | 'red' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    color = 'blue',
}) => {
    const colors = {
        blue: 'from-sky-500 to-blue-600',
        green: 'from-emerald-500 to-green-600',
        teal: 'from-teal-500 to-cyan-600',
        orange: 'from-orange-500 to-amber-600',
        red: 'from-red-500 to-rose-600',
        purple: 'from-violet-500 to-purple-600',
    };

    const bgColors = {
        blue: 'bg-sky-50',
        green: 'bg-emerald-50',
        teal: 'bg-teal-50',
        orange: 'bg-orange-50',
        red: 'bg-red-50',
        purple: 'bg-violet-50',
    };

    const iconColors = {
        blue: 'text-sky-600',
        green: 'text-emerald-600',
        teal: 'text-teal-600',
        orange: 'text-orange-600',
        red: 'text-red-600',
        purple: 'text-violet-600',
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
                    {trend && (
                        <p
                            className={`text-xs mt-2 font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                                }`}
                        >
                            {trend.isPositive ? '↑' : '↓'} {trend.value}
                        </p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 rounded-xl ${bgColors[color]} flex items-center justify-center ${iconColors[color]}`}
                >
                    {icon}
                </div>
            </div>
            <div className={`h-1 w-full bg-gradient-to-r ${colors[color]} rounded-full mt-4 opacity-80`} />
        </div>
    );
};
