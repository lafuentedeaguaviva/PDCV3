import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary text-white shadow-soft hover:bg-primary-600 hover:shadow-medium hover:scale-[1.02]',
            secondary: 'bg-slate-100 text-secondary hover:bg-slate-200',
            outline: 'border border-border text-secondary hover:border-primary hover:text-primary hover:bg-primary/5',
            ghost: 'text-secondary hover:text-primary hover:bg-primary/5',
            danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
        };

        const sizes = {
            sm: 'py-1.5 px-3 text-xs',
            md: 'py-2.5 px-4 text-sm',
            lg: 'py-3.5 px-6 text-base',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
                    'active:scale-[0.98]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'gap-2',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                {children}
            </button>
        );
    }
);


Button.displayName = 'Button';
