import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Atomic Components ---

interface CardProps extends React.PropsWithChildren {
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => (
    <div
        className={cn("bg-white rounded-[32px] border border-slate-100 shadow-sm transition-all", className)}
        onClick={onClick}
    >
        {children}
    </div>
);

interface BadgeProps extends React.PropsWithChildren {
    variant?: 'default' | 'accent' | 'outline' | 'success' | 'warning' | 'error';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className
}) => {
    const variants: Record<string, string> = {
        default: 'bg-slate-100 text-slate-600',
        accent: 'bg-primary/10 text-primary',
        outline: 'border border-slate-200 text-slate-400',
        success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border border-amber-100',
        error: 'bg-rose-50 text-rose-600 border border-rose-100'
    };

    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center justify-center",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200/60", className)}
            {...props}
        />
    );
}
