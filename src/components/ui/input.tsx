import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, icon, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wide">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                            {icon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full bg-slate-50 border-none rounded-xl py-3.5 pr-4 text-sm font-medium text-slate-800',
                            'placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none',
                            icon ? 'pl-12' : 'pl-4',
                            className
                        )}
                        {...props}
                    />
                </div>
            </div>
        );
    }
);

Input.displayName = 'Input';
