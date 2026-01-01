import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
}) => {
    const variants = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-sky-100 text-sky-700',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
    };

    return (
        <span
            className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]} ${sizes[size]}
      `}
        >
            {children}
        </span>
    );
};

// Status badge with dot indicator
interface StatusBadgeProps {
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'lunas' | 'processed' | 'delivered' | 'aman' | 'menipis' | 'habis';
    label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
    const statusConfig: Record<string, { color: string; dotColor: string; text: string }> = {
        pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500', text: 'Pending' },
        confirmed: { color: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-sky-500', text: 'Terkonfirmasi' },
        completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500', text: 'Selesai' },
        cancelled: { color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500', text: 'Dibatalkan' },
        lunas: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500', text: 'Lunas' },
        processed: { color: 'bg-sky-50 text-sky-700 border-sky-200', dotColor: 'bg-sky-500', text: 'Diproses' },
        delivered: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500', text: 'Diserahkan' },
        aman: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500', text: 'Aman' },
        menipis: { color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500', text: 'Menipis' },
        habis: { color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500', text: 'Habis' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
        rounded-full border ${config.color}
      `}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
            {label || config.text}
        </span>
    );
};
