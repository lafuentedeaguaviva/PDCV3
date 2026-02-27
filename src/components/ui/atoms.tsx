import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
}

export function Card({ className, glass, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all',
                glass && 'glass-card',
                className
            )}
            {...props}
        />
    );
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'indigo';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: 'bg-slate-100 text-slate-600',
        outline: 'border border-slate-200 text-slate-500',
        success: 'bg-green-50 text-green-700',
        warning: 'bg-amber-50 text-amber-700',
        error: 'bg-red-50 text-red-700',
        indigo: 'bg-indigo-50 text-indigo-700',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-slate-200', className)}
            {...props}
        />
    );
}
